<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['firstName'])) {
    echo json_encode(['error' => 'Invalid data']);
    exit();
}

// Send simple email
$to = 'info@sceptyr.com';
$subject = 'Contact Form - ' . $data['firstName'] . ' ' . $data['lastName'];
$message = "Name: " . $data['firstName'] . " " . $data['lastName'] . "\n";
$message .= "Email: " . $data['email'] . "\n";
$message .= "Phone: " . $data['phone'] . "\n";
if (!empty($data['message'])) {
    $message .= "Message: " . $data['message'] . "\n";
}

mail($to, $subject, $message, "From: no-reply@sceptyr.com");

echo json_encode(['success' => true]);
?>