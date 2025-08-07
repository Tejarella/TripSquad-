<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../auth/middleware.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = authenticateUser();
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || !isset($input['start_date']) || !isset($input['end_date'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

// Connect using MySQLi
$conn = mysqli_connect("localhost:3307", "root", "", "tripsquad");

if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Begin transaction
mysqli_begin_transaction($conn);

try {
    // Insert into trips
    $stmt1 = mysqli_prepare($conn, "INSERT INTO trips (name, created_by, start_date, end_date) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt1, 'siss', $input['name'], $userId, $input['start_date'], $input['end_date']);
    mysqli_stmt_execute($stmt1);

    if (mysqli_stmt_affected_rows($stmt1) <= 0) {
        throw new Exception("Failed to insert trip.");
    }

    $tripId = mysqli_insert_id($conn);

    // Insert into trip_members
    $stmt2 = mysqli_prepare($conn, "INSERT INTO trip_members (trip_id, user_id) VALUES (?, ?)");
    mysqli_stmt_bind_param($stmt2, 'ii', $tripId, $userId);
    mysqli_stmt_execute($stmt2);

    if (mysqli_stmt_affected_rows($stmt2) <= 0) {
        throw new Exception("Failed to insert trip member.");
    }

    // Commit transaction
    mysqli_commit($conn);

    echo json_encode([
        'success' => true,
        'trip_id' => $tripId,
        'message' => 'Trip created successfully'
    ]);
} catch (Exception $e) { 
    mysqli_rollback($conn);
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

mysqli_close($conn);
?>
