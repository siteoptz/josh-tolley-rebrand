<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['firstName'])) {
    echo json_encode(['error' => 'Invalid data']);
    exit;
}

$first_name = $data['firstName'];
$last_name = $data['lastName'];
$email = $data['email'];
$phone = $data['phone'];
$net_worth = isset($data['netWorth']) ? $data['netWorth'] : '';
$accredited = isset($data['accredited']) ? $data['accredited'] : '';
$interest = isset($data['interest']) ? $data['interest'] : '';
$message = isset($data['message']) ? $data['message'] : '';

$debug_info = [];

// Send email notification with CC
$to = 'info@sceptyr.com';
$cc = 'antonio@siteoptz.com';
$subject = 'New Contact Form Submission - ' . $first_name . ' ' . $last_name;
$email_message = "New contact form submission:\n\n";
$email_message .= "Name: $first_name $last_name\n";
$email_message .= "Email: $email\n";
$email_message .= "Phone: $phone\n";
$email_message .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_message .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
$email_message .= "Interest: " . ($interest ?: 'Not specified') . "\n";
$email_message .= "Message: " . ($message ?: 'None') . "\n";
$email_message .= "\nSubmitted at: " . date('Y-m-d H:i:s T') . "\n";

$headers = "From: no-reply@sceptyr.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Cc: $cc\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$email_sent = mail($to, $subject, $email_message, $headers);
$debug_info['email_attempted'] = true;
$debug_info['email_sent'] = $email_sent;
$debug_info['mail_function_exists'] = function_exists('mail');

// Monday.com integration with better error handling
$monday_success = false;
$monday_item_id = null;
$monday_error = null;

$monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
$board_id = '18397890327';

try {
    $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
        }
    }';

    // Simplified column mapping - just basic fields first
    $column_values = json_encode([
        'text' => $first_name,
        'text_1' => $last_name,
        'email' => ['email' => $email, 'text' => $email],
        'phone' => ['phone' => $phone, 'countryShortName' => 'US']
    ]);

    $monday_data = [
        'query' => $monday_query,
        'variables' => [
            'boardId' => $board_id,
            'itemName' => "$first_name $last_name",
            'columnValues' => $column_values
        ]
    ];

    $debug_info['monday_payload'] = $monday_data;

    $monday_context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: ' . $monday_api_token,
                'User-Agent: SceptyrForm/1.0'
            ],
            'content' => json_encode($monday_data),
            'timeout' => 30
        ]
    ]);

    $monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
    $debug_info['monday_response_raw'] = $monday_response;
    
    if ($monday_response !== false) {
        $monday_result = json_decode($monday_response, true);
        $debug_info['monday_response_parsed'] = $monday_result;
        
        if (isset($monday_result['data']['create_item']['id'])) {
            $monday_item_id = $monday_result['data']['create_item']['id'];
            $monday_success = true;
        } elseif (isset($monday_result['errors'])) {
            $monday_error = $monday_result['errors'];
        }
    } else {
        $monday_error = 'Failed to get response from Monday.com API';
    }

} catch (Exception $e) {
    $monday_error = $e->getMessage();
}

$debug_info['monday_success'] = $monday_success;
$debug_info['monday_error'] = $monday_error;
$debug_info['monday_item_id'] = $monday_item_id;

echo json_encode([
    'success' => true,
    'message' => 'Form submitted successfully',
    'email_sent' => $email_sent,
    'monday_success' => $monday_success,
    'monday_item_id' => $monday_item_id,
    'debug' => $debug_info
]);
?>