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

// Try multiple email methods
$email_attempts = [];

// Method 1: Standard mail() with better configuration
ini_set('sendmail_from', 'noreply@f0h.ab3.myftpupload.com');
$to_addresses = 'info@sceptyr.com,antonio@siteoptz.com';
$subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name;

$email_body = "🎯 NEW LEAD SUBMISSION\n\n";
$email_body .= "👤 CONTACT DETAILS:\n";
$email_body .= "Name: $first_name $last_name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n\n";
$email_body .= "💰 PROFILE:\n";
$email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_body .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
$email_body .= "Interest: " . ($interest ?: 'Not specified') . "\n\n";
$email_body .= "💬 MESSAGE:\n" . ($message ?: 'No message') . "\n\n";
$email_body .= "⏰ Submitted: " . date('F j, Y g:i A T') . "\n";
$email_body .= "🌐 IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";

$headers1 = "From: Sceptyr Leads <noreply@f0h.ab3.myftpupload.com>\r\n";
$headers1 .= "Reply-To: $email\r\n";
$headers1 .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers1 .= "X-Priority: 1 (Highest)\r\n";
$headers1 .= "X-MSMail-Priority: High\r\n";

$method1 = mail($to_addresses, $subject, $email_body, $headers1);
$email_attempts['method1_standard'] = $method1 ? 'success' : 'failed';

// Method 2: Individual emails (sometimes works better)
$method2a = mail('info@sceptyr.com', $subject, $email_body, $headers1);
$method2b = mail('antonio@siteoptz.com', $subject, $email_body, $headers1);
$email_attempts['method2_individual'] = ($method2a && $method2b) ? 'both_success' : 'partial_or_failed';

// Method 3: WordPress wp_mail if available
$method3 = false;
if (function_exists('wp_mail')) {
    $method3 = wp_mail(
        ['info@sceptyr.com', 'antonio@siteoptz.com'],
        $subject,
        $email_body,
        ['Reply-To: ' . $email]
    );
    $email_attempts['method3_wordpress'] = $method3 ? 'success' : 'failed';
}

// Monday.com with better error handling and authentication check
$monday_success = false;
$monday_item_id = null;
$monday_debug = [];

$monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
$board_id = '18397890327';

// First, test authentication with a simple query
$test_query = 'query { me { name } }';
$test_data = ['query' => $test_query];

if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($test_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: ' . $monday_api_token
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'SceptyrForm/1.0');

    $test_response = curl_exec($ch);
    $monday_debug['auth_test'] = $test_response ? 'got_response' : 'no_response';
    $monday_debug['curl_error'] = curl_error($ch);
    
    if ($test_response) {
        $test_result = json_decode($test_response, true);
        $monday_debug['auth_result'] = isset($test_result['data']['me']) ? 'authenticated' : 'auth_failed';
        
        if (isset($test_result['data']['me'])) {
            // Authentication successful, now create the item
            $create_query = 'mutation ($boardId: ID!, $itemName: String!) {
                create_item (board_id: $boardId, item_name: $itemName) {
                    id
                    name
                }
            }';
            
            $create_data = [
                'query' => $create_query,
                'variables' => [
                    'boardId' => $board_id,
                    'itemName' => "$first_name $last_name | $email | $phone"
                ]
            ];
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($create_data));
            $create_response = curl_exec($ch);
            
            if ($create_response) {
                $create_result = json_decode($create_response, true);
                if (isset($create_result['data']['create_item']['id'])) {
                    $monday_item_id = $create_result['data']['create_item']['id'];
                    $monday_success = true;
                    $monday_debug['create_result'] = 'success';
                } else {
                    $monday_debug['create_result'] = 'failed';
                    $monday_debug['create_errors'] = $create_result['errors'] ?? 'unknown_error';
                }
            }
        }
    }
    
    curl_close($ch);
} else {
    $monday_debug['curl_available'] = false;
}

// Create comprehensive log entry
$log_data = [
    'timestamp' => date('Y-m-d H:i:s T'),
    'name' => "$first_name $last_name",
    'email' => $email,
    'phone' => $phone,
    'email_attempts' => $email_attempts,
    'monday_success' => $monday_success,
    'monday_item_id' => $monday_item_id,
    'monday_debug' => $monday_debug
];

file_put_contents('detailed_submissions.log', json_encode($log_data) . "\n", FILE_APPEND | LOCK_EX);

// Determine overall success
$email_success = $method1 || $method2a || $method2b || $method3;

echo json_encode([
    'success' => true,
    'message' => 'Form processed! Email attempts: ' . json_encode($email_attempts) . 
                 ($monday_success ? " | Monday.com: Created item $monday_item_id" : " | Monday.com: Failed"),
    'email_attempts' => $email_attempts,
    'monday_success' => $monday_success,
    'monday_debug' => $monday_debug,
    'monday_item_id' => $monday_item_id
]);
?>