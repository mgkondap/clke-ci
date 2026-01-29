<?php
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get JSON data from request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit;
}

// Save to releases.json
$filename = 'releases.json';
$result = file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save data']);
    exit;
}

// Set proper permissions
chmod($filename, 0644);

echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
?>
