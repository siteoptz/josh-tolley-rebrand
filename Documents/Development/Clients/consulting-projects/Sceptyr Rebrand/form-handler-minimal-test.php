<?php
// Minimal test version - no database, just Monday.com
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$first_name = trim($data['firstName'] ?? '');
$last_name = trim($data['lastName'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$net_worth = trim($data['netWorth'] ?? '');
$accredited = trim($data['accredited'] ?? '');
$interest = trim($data['interest'] ?? '');
$message = trim($data['message'] ?? '');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'monday_result' => ['success' => false],
    'email_result' => ['success' => false]
];

// Monday.com integration with correct column IDs
try {
    $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
            name
        }
    }';
    
    $column_values = [
        'text' => $first_name,                   // Name (working)
        'text_mm04w6jq' => $email,               // Email  
        'text_mm04fbs8' => $accredited ?: '',    // Accredited
        'phone_mm06bhs1' => $phone,              // Phone (working)
        'text_mm02dymw' => $net_worth ?: '',     // Net Worth (working)
        'text_mm044z4k' => $interest ?: '',      // Interest
        'text_mm026pc4' => $message ?: ''        // Message
    ];
    
    $payload = [
        'query' => $monday_query,
        'variables' => [
            'boardId' => '18397890327',
            'itemName' => "$first_name $last_name",
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
            'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk'
        ],
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($response && $http_code === 200) {
        $result = json_decode($response, true);
        if (isset($result['data']['create_item']['id'])) {
            $results['monday_result']['success'] = true;
            $results['monday_result']['item_id'] = $result['data']['create_item']['id'];
        } else {
            $results['monday_result']['error'] = $response;
        }
    } else {
        $results['monday_result']['error'] = "HTTP $http_code: $response";
    }
    
} catch (Exception $e) {
    $results['monday_result']['error'] = $e->getMessage();
}

// Simple email notification
if (function_exists('mail')) {
    $subject = 'Sceptyr Contact Form - ' . $first_name . ' ' . $last_name;
    $email_body = "Name: $first_name $last_name\nEmail: $email\nPhone: $phone\nNet Worth: $net_worth\nAccredited: $accredited\nInterest: $interest\nMessage: $message\n";
    $headers = "From: noreply@sceptyr.com\r\nReply-To: $email\r\n";
    
    $results['email_result']['success'] = mail('info@sceptyr.com', $subject, $email_body, $headers);
}

echo json_encode([
    'success' => true,
    'message' => 'Form submitted successfully',
    'results' => $results
], JSON_PRETTY_PRINT);
?>