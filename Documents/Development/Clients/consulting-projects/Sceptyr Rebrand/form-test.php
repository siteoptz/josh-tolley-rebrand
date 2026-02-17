<?php
// Simple test form handler
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request for debugging
error_log("Form submission received: " . file_get_contents('php://input'));

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Simple validation
if (empty($data['firstName']) || empty($data['lastName']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Just send email for now
$to = 'info@sceptyr.com';
$subject = 'Test Form Submission - ' . $data['firstName'] . ' ' . $data['lastName'];
$message = "Test submission received:\n\nName: " . $data['firstName'] . " " . $data['lastName'] . "\nEmail: " . $data['email'];
$headers = "From: no-reply@sceptyr.com";

$email_sent = mail($to, $subject, $message, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Form submitted successfully',
    'email_sent' => $email_sent,
    'debug' => $data
]);
?>