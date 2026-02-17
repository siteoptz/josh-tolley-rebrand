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
$debug_info['php_version'] = phpversion();
$debug_info['mail_function'] = function_exists('mail') ? 'exists' : 'missing';

// Test email sending
$to = 'info@sceptyr.com';
$cc = 'antonio@siteoptz.com';
$subject = 'Test Form Submission - ' . $first_name . ' ' . $last_name;
$email_message = "Test submission from form:\n\n";
$email_message .= "Name: $first_name $last_name\n";
$email_message .= "Email: $email\n";
$email_message .= "Phone: $phone\n";
$email_message .= "Time: " . date('Y-m-d H:i:s T') . "\n";

$headers = "From: no-reply@sceptyr.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Cc: $cc\r\n";

$email_result = mail($to, $subject, $email_message, $headers);
$debug_info['email_result'] = $email_result ? 'success' : 'failed';
$debug_info['email_to'] = $to;
$debug_info['email_cc'] = $cc;

// Test Monday.com API
$monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
$board_id = '18397890327';

$monday_query = 'mutation ($boardId: ID!, $itemName: String!) {
    create_item (board_id: $boardId, item_name: $itemName) {
        id
        name
    }
}';

$monday_data = [
    'query' => $monday_query,
    'variables' => [
        'boardId' => $board_id,
        'itemName' => "Test: $first_name $last_name"
    ]
];

$debug_info['monday_token_length'] = strlen($monday_api_token);
$debug_info['monday_board_id'] = $board_id;

$monday_context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Authorization: ' . $monday_api_token
        ],
        'content' => json_encode($monday_data),
        'timeout' => 10
    ]
]);

$monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
$debug_info['monday_response_length'] = $monday_response ? strlen($monday_response) : 0;

if ($monday_response) {
    $monday_result = json_decode($monday_response, true);
    if (isset($monday_result['data']['create_item']['id'])) {
        $debug_info['monday_result'] = 'success - ID: ' . $monday_result['data']['create_item']['id'];
    } elseif (isset($monday_result['errors'])) {
        $debug_info['monday_result'] = 'error - ' . json_encode($monday_result['errors']);
    } else {
        $debug_info['monday_result'] = 'unknown response - ' . substr($monday_response, 0, 200);
    }
} else {
    $debug_info['monday_result'] = 'no response from API';
}

echo json_encode([
    'success' => true,
    'message' => 'DEBUG INFO: ' . json_encode($debug_info),
    'debug' => $debug_info
]);
?>