<?php
require_once '../config/database.php';
require_once '../auth/middleware.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $userId = authenticateUser();
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication failed: ' . $e->getMessage()]);
    exit;
}

// Connect to database (assuming database.php provides $conn or a function)
$conn = mysqli_connect("localhost:3307", "root", "", "tripsquad"); // Replace with config
if (!$conn) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . mysqli_connect_error()]);
    exit;
}

// Prepare query
$query = "
    SELECT t.*, u.name as creator_name, 
           COUNT(tm.user_id) as member_count,
           COALESCE(SUM(e.amount), 0) as total_expenses
    FROM trips t
    JOIN users u ON t.created_by = u.id
    JOIN trip_members tm ON t.id = tm.trip_id
    LEFT JOIN expenses e ON t.id = e.trip_id
    WHERE tm.user_id = ?
    GROUP BY t.id
    ORDER BY t.created_at DESC
";

$stmt = mysqli_prepare($conn, $query);
mysqli_stmt_bind_param($stmt, 'i', $userId);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

$trips = [];
while ($row = mysqli_fetch_assoc($result)) {
    $trips[] = $row;
}

echo json_encode([
    'success' => true,
    'trips' => $trips
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>