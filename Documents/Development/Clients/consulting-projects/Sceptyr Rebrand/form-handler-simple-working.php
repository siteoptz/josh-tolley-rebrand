<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

header('Content-Type: application/json');

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['firstName'])) {
    echo json_encode(array('error' => 'Invalid data'));
    exit();
}

$first_name = $data['firstName'];
$last_name = $data['lastName'];
$email = $data['email'];
$phone = $data['phone'];
$net_worth = isset($data['netWorth']) ? $data['netWorth'] : '';
$accredited = isset($data['accredited']) ? $data['accredited'] : '';
$interest = isset($data['interest']) ? $data['interest'] : '';
$message = isset($data['message']) ? $data['message'] : '';

// Simple email
$to = 'info@sceptyr.com';
$subject = 'URGENT: New Sceptyr Lead - ' . $first_name . ' ' . $last_name;
$body = "NEW LEAD ALERT!\n\n";
$body .= "Name: $first_name $last_name\n";
$body .= "Email: $email\n"; 
$body .= "Phone: $phone\n";
$body .= "Net Worth: $net_worth\n";
$body .= "Accredited: $accredited\n";
$body .= "Interest: $interest\n";
$body .= "Message: $message\n";
$body .= "Time: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: noreply@f0h.ab3.myftpupload.com";
$email1 = mail($to, $subject, $body, $headers);

// Send to second email
$email2 = mail('antonio@siteoptz.com', $subject, $body, $headers);

// Basic Monday.com attempt
$monday_success = false;
$ch = curl_init();
if ($ch) {
    $monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
    
    $query = 'mutation { create_item (board_id: "18397890327", item_name: "' . $first_name . ' ' . $last_name . '") { id } }';
    $payload = json_encode(array('query' => $query));
    
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: ' . $monday_token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    if ($response) {
        $result = json_decode($response, true);
        if (isset($result['data']['create_item']['id'])) {
            $monday_success = true;
        }
    }
    curl_close($ch);
}

// Log the submission
$log = date('Y-m-d H:i:s') . " | $first_name $last_name | $email | Email1: " . ($email1 ? 'OK' : 'FAIL') . " | Email2: " . ($email2 ? 'OK' : 'FAIL') . " | Monday: " . ($monday_success ? 'OK' : 'FAIL') . "\n";
file_put_contents('submissions.log', $log, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Submitted! Email1: ' . ($email1 ? 'Sent' : 'Failed') . ', Email2: ' . ($email2 ? 'Sent' : 'Failed') . ', Monday: ' . ($monday_success ? 'Created' : 'Failed')
));
?>