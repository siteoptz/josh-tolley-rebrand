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

// Enhanced email with better headers for delivery
$to = 'info@sceptyr.com, antonio@siteoptz.com';
$subject = 'New Sceptyr Contact Form Submission - ' . $first_name . ' ' . $last_name;

$email_message = "NEW CONTACT FORM SUBMISSION\n";
$email_message .= str_repeat("=", 40) . "\n\n";
$email_message .= "Contact Information:\n";
$email_message .= "Name: $first_name $last_name\n";
$email_message .= "Email: $email\n";
$email_message .= "Phone: $phone\n\n";
$email_message .= "Investment Profile:\n";
$email_message .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_message .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
$email_message .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n\n";
$email_message .= "Message:\n";
$email_message .= ($message ?: 'No additional message provided') . "\n\n";
$email_message .= str_repeat("=", 40) . "\n";
$email_message .= "Submitted: " . date('Y-m-d H:i:s T') . "\n";
$email_message .= "From: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown IP') . "\n";

// Better email headers for delivery
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: Sceptyr Contact Form <noreply@f0h.ab3.myftpupload.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Return-Path: noreply@f0h.ab3.myftpupload.com\r\n";
$headers .= "X-Mailer: Sceptyr Form Handler\r\n";
$headers .= "X-Priority: 1\r\n";

$email_sent = mail($to, $subject, $email_message, $headers);

// Monday.com with cURL instead of file_get_contents
$monday_success = false;
$monday_item_id = null;
$monday_error = '';

if (function_exists('curl_init')) {
    $monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
    $board_id = '18397890327';

    // Simplified Monday.com mutation - just create item with name first
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
            'itemName' => "$first_name $last_name - $email"
        ]
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($monday_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: ' . $monday_api_token,
        'User-Agent: SceptyrForm/1.0'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $monday_response = curl_exec($ch);
    $curl_error = curl_error($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($monday_response && !$curl_error) {
        $monday_result = json_decode($monday_response, true);
        if (isset($monday_result['data']['create_item']['id'])) {
            $monday_item_id = $monday_result['data']['create_item']['id'];
            $monday_success = true;
        } elseif (isset($monday_result['errors'])) {
            $monday_error = 'API Error: ' . json_encode($monday_result['errors']);
        }
    } else {
        $monday_error = $curl_error ?: "HTTP $http_code";
    }
} else {
    $monday_error = 'cURL not available';
}

// Log successful submission to a file
$log_entry = date('Y-m-d H:i:s') . " - $first_name $last_name ($email) - Email: " . 
             ($email_sent ? 'Sent' : 'Failed') . " - Monday: " . 
             ($monday_success ? "Created ID $monday_item_id" : "Failed: $monday_error") . "\n";
file_put_contents('form_submissions.log', $log_entry, FILE_APPEND | LOCK_EX);

echo json_encode([
    'success' => true,
    'message' => 'Form submitted successfully!' . 
                 ($email_sent ? ' Email sent.' : ' Email failed.') .
                 ($monday_success ? " Monday.com item created (ID: $monday_item_id)." : ' Monday.com failed.'),
    'email_sent' => $email_sent,
    'monday_success' => $monday_success,
    'monday_item_id' => $monday_item_id,
    'monday_error' => $monday_error
]);
?>