<?php
// Updated form handler with new Monday.com token
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

// Monday.com integration with NEW TOKEN (replace YOUR_NEW_TOKEN_HERE)
if (!empty($first_name) && !empty($last_name)) {
    try {
        $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
            create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                id
                name
            }
        }';
        
        $column_values = [
            'text' => $first_name,
            'text_1' => $last_name,
            'email_mm06cmw7' => ['email' => $email, 'text' => $email],
            'phone_mm06bhs1' => ['phone' => $phone, 'countryShortName' => 'US'],
            'text_mm02dymw' => $net_worth,
            'status_1_mm06w6j3' => ['label' => $accredited ?: 'Unknown'],
            'dropdown_mm02jnrm' => ['ids' => [$interest ?: '']],
            'text17_mm02fh7q' => $message
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
            $results['monday_result']['error'] = "HTTP $http_code";
        }
        
    } catch (Exception $e) {
        $results['monday_result']['error'] = $e->getMessage();
    }
}

// Email notification
if (function_exists('mail')) {
    try {
        $subject = 'Sceptyr Contact Form - ' . $first_name . ' ' . $last_name;
        $email_body = "New contact form submission:\n\n";
        $email_body .= "Name: $first_name $last_name\n";
        $email_body .= "Email: $email\n";
        $email_body .= "Phone: $phone\n";
        $email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
        $email_body .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
        $email_body .= "Interest: " . ($interest ?: 'Not specified') . "\n";
        $email_body .= "Message: " . ($message ?: 'None') . "\n";
        
        $headers = "From: noreply@sceptyr.com\r\n";
        $headers .= "Reply-To: $email\r\n";
        
        $results['email_result']['success'] = mail('info@sceptyr.com', $subject, $email_body, $headers);
        
    } catch (Exception $e) {
        $results['email_result']['error'] = $e->getMessage();
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>