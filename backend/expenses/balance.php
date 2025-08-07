<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../auth/middleware.php';

header('Content-Type: application/json');

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

// Get trip members
$membersQuery = "
    SELECT u.id, u.name 
    FROM users u 
    JOIN trip_members tm ON u.id = tm.user_id 
    WHERE tm.trip_id = ?
";
$membersStmt = mysqli_prepare($conn, $membersQuery);
mysqli_stmt_bind_param($membersStmt, 'i', $tripId);
mysqli_stmt_execute($membersStmt);
$membersResult = mysqli_stmt_get_result($membersStmt);

$balances = [];
while ($row = mysqli_fetch_assoc($membersResult)) {
    $balances[$row['id']] = [
        'name' => $row['name'],
        'paid' => 0,
        'owes' => 0,
        'balance' => 0
    ];
}
mysqli_stmt_close($membersStmt);

// Total paid by each member
$paidQuery = "
    SELECT paid_by, SUM(amount) as total_paid
    FROM expenses 
    WHERE trip_id = ?
    GROUP BY paid_by
";
$paidStmt = mysqli_prepare($conn, $paidQuery);
mysqli_stmt_bind_param($paidStmt, 'i', $tripId);
mysqli_stmt_execute($paidStmt);
$paidResult = mysqli_stmt_get_result($paidStmt);

while ($row = mysqli_fetch_assoc($paidResult)) {
    if (isset($balances[$row['paid_by']])) {
        $balances[$row['paid_by']]['paid'] = floatval($row['total_paid']);
    }
}
mysqli_stmt_close($paidStmt);

// Total owed by each member
$owedQuery = "
    SELECT es.user_id, SUM(es.share) as total_owed
    FROM expense_shares es
    JOIN expenses e ON es.expense_id = e.id
    WHERE e.trip_id = ?
    GROUP BY es.user_id
";
$owedStmt = mysqli_prepare($conn, $owedQuery);
mysqli_stmt_bind_param($owedStmt, 'i', $tripId);
mysqli_stmt_execute($owedStmt);
$owedResult = mysqli_stmt_get_result($owedStmt);

while ($row = mysqli_fetch_assoc($owedResult)) {
    if (isset($balances[$row['user_id']])) {
        $balances[$row['user_id']]['owes'] = floatval($row['total_owed']);
    }
}
mysqli_stmt_close($owedStmt);

// Final balance calculation
foreach ($balances as $uid => &$b) {
    $b['balance'] = $b['paid'] - $b['owes'];
}

echo json_encode([
    'success' => true,
    'balances' => array_values($balances)
]);

mysqli_close($conn);
?>
