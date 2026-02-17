<?php
// Simple test to see what's happening
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Log any errors
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $input = file_get_contents('php://input');
    
    // Simple response
    echo json_encode(array(
        'success' => true,
        'message' => 'Thank you for your interest, one of our specialists will be in touch shortly.',
        'debug' => array(
            'input_received' => !empty($input),
            'timestamp' => date('Y-m-d H:i:s')
        )
    ));
    
} catch (Exception $e) {
    echo json_encode(array(
        'error' => $e->getMessage(),
        'success' => false
    ));
}
?>