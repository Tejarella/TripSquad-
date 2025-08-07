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

if (!isset($input['trip_id']) || !isset($input['description']) || 
    !isset($input['amount']) || !isset($input['date']) || !isset($input['shared_by'])) {
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

mysqli_begin_transaction($conn);

try {
    // Insert into expenses
    $stmt = mysqli_prepare($conn, "INSERT INTO expenses (trip_id, paid_by, description, amount, date) VALUES (?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, 'iisis', 
        $input['trip_id'], 
        $userId, 
        $input['description'], 
        $input['amount'], 
        $input['date']
    );
    mysqli_stmt_execute($stmt);

    if (mysqli_stmt_affected_rows($stmt) <= 0) {
        throw new Exception("Failed to insert expense.");
    }

    $expenseId = mysqli_insert_id($conn);
    mysqli_stmt_close($stmt);

    // Calculate share
    $shareAmount = $input['amount'] / count($input['shared_by']);

    // Insert into expense_shares
    $stmt2 = mysqli_prepare($conn, "INSERT INTO expense_shares (expense_id, user_id, share) VALUES (?, ?, ?)");
    foreach ($input['shared_by'] as $memberId) {
        mysqli_stmt_bind_param($stmt2, 'iid', $expenseId, $memberId, $shareAmount);
        mysqli_stmt_execute($stmt2);

        if (mysqli_stmt_affected_rows($stmt2) <= 0) {
            throw new Exception("Failed to insert share for user $memberId.");
        }
    }
    mysqli_stmt_close($stmt2);

    mysqli_commit($conn);

    echo json_encode([
        'success' => true,
        'expense_id' => $expenseId,
        'message' => 'Expense added successfully'
    ]);

} catch (Exception $e) {
    mysqli_rollback($conn);
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

mysqli_close($conn);
?>
