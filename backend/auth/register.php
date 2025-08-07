<?php
require_once '../config/cors.php';
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

$db = new Database();
$conn = $db->connect();

// Check if user exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $input['email']);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    http_response_code(409);
    echo json_encode(['success' => false, 'error' => 'User already exists']);
    exit;
}
$stmt->close();

// Hash password
$hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

// Insert new user
$stmt = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $input['name'], $input['email'], $hashedPassword);

if ($stmt->execute()) {
    $userId = $stmt->insert_id;
    echo json_encode([
        'success' => true,
        'message' => 'User registered successfully',
        'user_id' => $userId
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Registration failed: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>
