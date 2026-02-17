<?php
// Updated version 2026-02-12 00:21 - Fixed Monday.com integration
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
$sms_consent = trim($data['smsConsent'] ?? '');
$email_only = $data['emailOnly'] ?? false;  // Flag to skip Monday.com submission

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'monday_result' => $email_only ? ['skipped' => 'Email-only mode to prevent duplication'] : ['success' => false],
    'email_result' => ['success' => false]
];

// Monday.com integration with correct column IDs (skip if emailOnly flag is set)
if (!$email_only) {
try {
    $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
            name
        }
    }';
    
    $column_values = [
        'text_mm02dymw' => "$net_worth | Email: $email | Phone: $phone | Accredited: $accredited | Interest: $interest",
        'text_mm026pc4' => $message ?: ''
    ];
    
    $payload = [
        'query' => $monday_query,
        'variables' => [
            'boardId' => '18397890327',
            'itemName' => "$first_name $last_name",
            'columnValues' => json_encode($column_values, JSON_FORCE_OBJECT)
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
            'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.W-ZOg1y2xo5m7Fe7QsAJftmKb9d0Sw9CYXvGI3N1b-o'
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
} // End emailOnly check

// Email notification with proper headers
if (function_exists('mail')) {
    $subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name . ' - ' . date('M j, Y g:i A');
    
    $email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n";
    $email_body .= str_repeat("=", 50) . "\n\n";
    $email_body .= "👤 CONTACT INFORMATION:\n";
    $email_body .= "Full Name: $first_name $last_name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Phone: $phone\n";
    $email_body .= "SMS Consent: " . ($sms_consent ? 'Yes' : 'No') . "\n\n";
    $email_body .= "💰 INVESTOR PROFILE:\n";
    $email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
    $email_body .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
    $email_body .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n\n";
    $email_body .= "💬 MESSAGE:\n" . ($message ?: 'No additional message') . "\n\n";
    $email_body .= "📊 SUBMITTED: " . date('F j, Y \a\t g:i A T') . "\n";
    if ($email_only) {
        $email_body .= "⚠️  Monday.com entry created via Vercel API (no duplication)\n";
    }
    
    $headers = "From: Sceptyr Leads <leads@f0h.ab3.myftpupload.com>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Priority: 1\r\n";
    
    $email1 = mail('info@sceptyr.com', $subject, $email_body, $headers);
    $email2 = mail('antonio@siteoptz.com', $subject, $email_body, $headers);
    
    $results['email_result']['success'] = $email1 || $email2;
    $results['email_result']['info_sent'] = $email1;
    $results['email_result']['antonio_sent'] = $email2;
}

echo json_encode([
    'success' => true,
    'message' => 'Thank you for your interest, one of our specialists will contact you shortly.',
    'results' => $results
], JSON_PRETTY_PRINT);
?>