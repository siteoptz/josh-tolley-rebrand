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

// Email (same as before)
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
$email2 = mail('antonio@siteoptz.com', $subject, $body, $headers);

// Monday.com with detailed debugging
$monday_success = false;
$monday_debug = array();
$monday_item_id = null;

$monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';

$ch = curl_init();
if ($ch) {
    $monday_debug['curl_available'] = true;
    
    // Test authentication first
    $auth_query = 'query { me { name } }';
    $auth_payload = json_encode(array('query' => $auth_query));
    
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $auth_payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: ' . $monday_token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $auth_response = curl_exec($ch);
    $monday_debug['auth_response'] = $auth_response ? substr($auth_response, 0, 200) : 'no_response';
    $monday_debug['curl_error'] = curl_error($ch);
    $monday_debug['http_code'] = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($auth_response && !curl_error($ch)) {
        $auth_result = json_decode($auth_response, true);
        $monday_debug['auth_parsed'] = isset($auth_result['data']['me']) ? 'authenticated' : 'auth_failed';
        
        if (isset($auth_result['data']['me'])) {
            // Authentication worked, now try to create item
            $create_query = 'mutation { create_item (board_id: "18397890327", item_name: "' . addslashes($first_name . ' ' . $last_name) . '") { id name } }';
            $create_payload = json_encode(array('query' => $create_query));
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, $create_payload);
            $create_response = curl_exec($ch);
            $monday_debug['create_response'] = $create_response ? substr($create_response, 0, 200) : 'no_response';
            
            if ($create_response) {
                $create_result = json_decode($create_response, true);
                if (isset($create_result['data']['create_item']['id'])) {
                    $monday_item_id = $create_result['data']['create_item']['id'];
                    $monday_success = true;
                    $monday_debug['result'] = 'success';
                } else {
                    $monday_debug['result'] = 'create_failed';
                    $monday_debug['create_errors'] = isset($create_result['errors']) ? $create_result['errors'] : 'unknown_error';
                }
            }
        } else {
            $monday_debug['auth_errors'] = isset($auth_result['errors']) ? $auth_result['errors'] : 'auth_unknown_error';
        }
    }
    
    curl_close($ch);
} else {
    $monday_debug['curl_available'] = false;
}

// Enhanced logging
$log = date('Y-m-d H:i:s') . " | $first_name $last_name | $email | Email1: " . ($email1 ? 'OK' : 'FAIL') . " | Email2: " . ($email2 ? 'OK' : 'FAIL') . " | Monday: " . ($monday_success ? 'OK-' . $monday_item_id : 'FAIL') . " | Debug: " . json_encode($monday_debug) . "\n";
file_put_contents('submissions.log', $log, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Emails sent! Monday debug: ' . json_encode($monday_debug),
    'monday_debug' => $monday_debug,
    'monday_item_id' => $monday_item_id
));
?>