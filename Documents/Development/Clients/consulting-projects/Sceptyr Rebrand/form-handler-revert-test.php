<?php
// Revert to what was working yesterday - minimal Monday.com test
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$first_name = $data['firstName'];
$last_name = $data['lastName'];
$email = $data['email'];
$phone = $data['phone'];

// Test with the EXACT same approach that was working yesterday
$monday_query = 'mutation ($boardId: ID!, $itemName: String!) {
    create_item (board_id: $boardId, item_name: $itemName) {
        id
    }
}';

$monday_data = [
    'query' => $monday_query,
    'variables' => [
        'boardId' => '18397890327',
        'itemName' => "$first_name $last_name"
    ]
];

$monday_context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE'
        ],
        'content' => json_encode($monday_data)
    ]
]);

$monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
$monday_result = json_decode($monday_response, true);

// Simple email test
mail('info@sceptyr.com', 'Test Form', "Name: $first_name $last_name\nEmail: $email\nPhone: $phone", 'From: noreply@sceptyr.com');

echo json_encode([
    'success' => true,
    'message' => 'Basic test completed',
    'monday_response' => $monday_result,
    'api_token_preview' => 'eyJhbGci...' . substr($monday_data['variables']['itemName'], -10)
]);
?>