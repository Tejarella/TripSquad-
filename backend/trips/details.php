<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../auth/middleware.php';

header('Content-Type: application/json');

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$userId = authenticateUser();
$tripId = $_GET['trip_id'] ?? null;

if (!$tripId) {
    http_response_code(400);
    echo json_encode(['error' => 'Trip ID required']);
    exit;
}

// Connect using MySQLi (procedural)
$conn = mysqli_connect("localhost:3307", "root", "", "tripsquad");

if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Check if user is a member of this trip
$checkQuery = "SELECT COUNT(*) as count FROM trip_members WHERE trip_id = ? AND user_id = ?";
$checkStmt = mysqli_prepare($conn, $checkQuery);
mysqli_stmt_bind_param($checkStmt, 'ii', $tripId, $userId);
mysqli_stmt_execute($checkStmt);
mysqli_stmt_bind_result($checkStmt, $count);
mysqli_stmt_fetch($checkStmt);
mysqli_stmt_close($checkStmt);

if ($count == 0) {
    http_response_code(403);
    echo json_encode(['error' => 'Access denied']);
    mysqli_close($conn);
    exit;
}

// Get trip details
$tripQuery = "
    SELECT t.*, u.name as creator_name 
    FROM trips t 
    JOIN users u ON t.created_by = u.id 
    WHERE t.id = ?
";
$tripStmt = mysqli_prepare($conn, $tripQuery);
mysqli_stmt_bind_param($tripStmt, 'i', $tripId);
mysqli_stmt_execute($tripStmt);
$result = mysqli_stmt_get_result($tripStmt);
$trip = mysqli_fetch_assoc($result);
mysqli_stmt_close($tripStmt);

// Get trip members
$membersQuery = "
    SELECT u.id, u.name, u.email 
    FROM users u 
    JOIN trip_members tm ON u.id = tm.user_id 
    WHERE tm.trip_id = ?
";
$membersStmt = mysqli_prepare($conn, $membersQuery);
mysqli_stmt_bind_param($membersStmt, 'i', $tripId);
mysqli_stmt_execute($membersStmt);
$membersResult = mysqli_stmt_get_result($membersStmt);

$members = [];
while ($row = mysqli_fetch_assoc($membersResult)) {
    $members[] = $row;
}
mysqli_stmt_close($membersStmt);

// Send response
echo json_encode([
    'success' => true,
    'trip' => $trip,
    'members' => $members
]);

mysqli_close($conn);
?>
