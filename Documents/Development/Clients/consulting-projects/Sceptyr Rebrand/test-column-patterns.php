<?php
// Test column ID patterns by creating test items
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';

// Test different column ID patterns for email
$email_tests = [
    'email_1',
    'text_5', 
    'text_6',
    'text_7',
    'text_8',
    'text_9',
    'email',
    'text3',
    'text4',
    'text5',
    'column_email',
    'email_column',
    'text_email'
];

$results = [];

foreach ($email_tests as $column_id) {
    $query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
        }
    }';
    
    $column_values = [
        'text' => 'TEST',                          // Working
        'phone' => '555-0000',                     // Working
        'text_mm02dymw' => '1M',                   // Working
        $column_id => 'test@email.com'             // Test this column
    ];
    
    $payload = [
        'query' => $query,
        'variables' => [
            'boardId' => '18397890327',
            'itemName' => "Email Test: $column_id",
            'columnValues' => json_encode($column_values)
        ]
    ];
    
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://api.monday.com/v2',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: ' . $api_token
        ],
        CURLOPT_TIMEOUT => 5
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $results[] = [
        'column_id' => $column_id,
        'http_code' => $http_code,
        'success' => ($response && $http_code === 200),
        'response' => $response ? substr($response, 0, 200) : 'No response'
    ];
    
    // Small delay between requests
    usleep(500000); // 0.5 seconds
}

echo json_encode([
    'success' => true,
    'message' => 'Tested email column patterns',
    'tests' => $results,
    'note' => 'Check Monday.com board to see which test items have email populated'
], JSON_PRETTY_PRINT);
?>