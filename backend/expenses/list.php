<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../auth/middleware.php';

header('Content-Type: application/json');

// Check method
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

// Connect to DB
$conn = mysqli_connect("localhost:3307", "root", "", "tripsquad");
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Prepare SQL
$sql = "
    SELECT e.*, u.name as paid_by_name,
           GROUP_CONCAT(CONCAT(us.name, ':', es.share) ORDER BY us.name SEPARATOR '|') as shares
    FROM expenses e
    JOIN users u ON e.paid_by = u.id
    JOIN expense_shares es ON e.id = es.expense_id
    JOIN users us ON es.user_id = us.id
    WHERE e.trip_id = ?
    GROUP BY e.id
    ORDER BY e.date DESC, e.created_at DESC
";

$stmt = mysqli_prepare($conn, $sql);
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['error' => 'Query preparation failed: ' . mysqli_error($conn)]);
    exit;
}

// Bind and execute
mysqli_stmt_bind_param($stmt, 'i', $tripId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$expenses = [];
while ($row = mysqli_fetch_assoc($result)) {
    $sharesArray = [];

    if (!empty($row['shares'])) {
        $shares = explode('|', $row['shares']);
        foreach ($shares as $share) {
            list($name, $amount) = explode(':', $share);
            $sharesArray[] = [
                'name' => $name,
                'amount' => floatval($amount)
            ];
        }
    }

    $row['shares'] = $sharesArray;
    $expenses[] = $row;
}

echo json_encode([
    'success' => true,
    'expenses' => $expenses
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
