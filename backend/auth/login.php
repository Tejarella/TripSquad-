<?php
require_once '../config/cors.php';
require_once '../config/database.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Initialize connection using your class
$database = new Database();
$conn = $database->connect(); // ✅ Don't forget this line

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email or password']);
    exit;
}

$stmt = mysqli_prepare($conn, "SELECT id, name, email, password FROM users WHERE email = ?");
mysqli_stmt_bind_param($stmt, "s", $input['email']);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email']);
    exit;
}

if (!password_verify($input['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid password']);
    exit;
}

// Dummy token
$token = base64_encode("user-{$user['id']}-" . time());

echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email']
    ]
]);

mysqli_stmt_close($stmt);
mysqli_close($conn);
?>
