<?php
require_once '../config/database.php';

function authenticateUser() {
    $headers = array_change_key_case(getallheaders(), CASE_LOWER);

    if (!isset($headers['authorization'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No authorization header']);
        exit;
    }

    $token = str_replace('Bearer ', '', $headers['authorization']);

    $parts = explode('.', $token);

    if (count($parts) === 3) {
        // JWT handling
        list($headerEncoded, $payloadEncoded, $signatureProvided) = $parts;

        $secret = 'your-secret-key'; // Replace with your actual secret key
        $signature = hash_hmac('sha256', "$headerEncoded.$payloadEncoded", $secret, true);
        $signatureEncoded = base64url_encode($signature);

        if (!hash_equals($signatureEncoded, $signatureProvided)) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token signature']);
            exit;
        }

        $payload = json_decode(base64_decode(strtr($payloadEncoded, '-_', '+/')), true);

        if (!isset($payload['user_id']) || $payload['exp'] < time()) {
            http_response_code(401);
            echo json_encode(['error' => 'Token expired or malformed']);
            exit;
        }

        return $payload['user_id'];
    }

    // 🧪 Fallback: Handle simple base64-encoded user tokens like "user-4-<timestamp>"
    $decoded = base64_decode($token);
    if (strpos($decoded, 'user-') === 0) {
        $parts = explode('-', $decoded);
        $userId = $parts[1] ?? null;

        if ($userId) {
            return $userId;
        }
    }

    // If nothing worked
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token format']);
    exit;
}


function generateJWT($user_id) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'user_id' => $user_id,
        'exp' => time() + (24 * 60 * 60) // 24 hours
    ]);
    
    $headerEncoded = base64url_encode($header);
    $payloadEncoded = base64url_encode($payload);
    
    $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, 'your-secret-key', true);
    $signatureEncoded = base64url_encode($signature);
    
    return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
?>