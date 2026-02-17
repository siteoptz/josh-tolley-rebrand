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

// Send email notification
$to = 'info@sceptyr.com';
$subject = 'New Contact Form Submission - ' . $first_name . ' ' . $last_name;
$email_message = "New contact form submission:\n\n";
$email_message .= "Name: $first_name $last_name\n";
$email_message .= "Email: $email\n";
$email_message .= "Phone: $phone\n";
$email_message .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_message .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
$email_message .= "Interest: " . ($interest ?: 'Not specified') . "\n";
$email_message .= "Message: " . ($message ?: 'None') . "\n";

$headers = "From: no-reply@sceptyr.com\r\n";
$headers .= "Reply-To: $email\r\n";

$email_sent = mail($to, $subject, $email_message, $headers);

// Monday.com integration
$monday_success = false;
$monday_item_id = null;

$monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
$board_id = '18397890327';

$monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
    create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
        id
    }
}';

$column_values = array(
    'text' => $first_name,
    'text_1' => $last_name,
    'email' => array('email' => $email, 'text' => $email),
    'phone' => array('phone' => $phone, 'countryShortName' => 'US')
);

if ($net_worth) $column_values['text99'] = $net_worth;
if ($accredited) $column_values['status_1'] = array('label' => $accredited);
if ($interest) $column_values['dropdown'] = array('ids' => array($interest));
if ($message) $column_values['text17'] = $message;

$monday_data = array(
    'query' => $monday_query,
    'variables' => array(
        'boardId' => $board_id,
        'itemName' => "$first_name $last_name",
        'columnValues' => json_encode($column_values)
    )
);

$monday_context = stream_context_create(array(
    'http' => array(
        'method' => 'POST',
        'header' => array(
            'Content-Type: application/json',
            'Authorization: ' . $monday_api_token
        ),
        'content' => json_encode($monday_data)
    )
));

$monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
if ($monday_response) {
    $monday_result = json_decode($monday_response, true);
    if (isset($monday_result['data']['create_item']['id'])) {
        $monday_item_id = $monday_result['data']['create_item']['id'];
        $monday_success = true;
    }
}

echo json_encode(array(
    'success' => true,
    'message' => 'Form submitted successfully',
    'email_sent' => $email_sent,
    'monday_success' => $monday_success,
    'monday_item_id' => $monday_item_id
));
?>