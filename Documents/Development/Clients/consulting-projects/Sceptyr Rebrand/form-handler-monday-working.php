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
$net_worth = isset($data['netWorth']) ? $data['netWorth'] : 'Not specified';
$accredited = isset($data['accredited']) ? $data['accredited'] : 'Not specified';
$interest = isset($data['interest']) ? $data['interest'] : 'Not specified';
$message = isset($data['message']) ? $data['message'] : 'No additional message';

// Enhanced email notifications
$subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name . ' - ' . date('M j, Y g:i A');

$email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n";
$email_body .= str_repeat("=", 50) . "\n\n";

$email_body .= "👤 CONTACT INFORMATION:\n";
$email_body .= "Full Name: $first_name $last_name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n\n";

$email_body .= "💰 INVESTOR PROFILE:\n";
$email_body .= "Net Worth: $net_worth\n";
$email_body .= "Accredited Investor: $accredited\n";
$email_body .= "Primary Interest: $interest\n\n";

$email_body .= "💬 MESSAGE FROM PROSPECT:\n";
$email_body .= "$message\n\n";

$email_body .= "📊 LEAD DETAILS:\n";
$email_body .= "Source: Sceptyr Contact Form\n";
$email_body .= "Submission Time: " . date('F j, Y \a\t g:i A T') . "\n";
$email_body .= "IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n\n";

$email_body .= "⚡ NEXT STEPS:\n";
$email_body .= "1. Review prospect profile above\n";
$email_body .= "2. Respond within 24 hours for best conversion\n";
$email_body .= "3. Schedule initial consultation call\n\n";

$email_body .= str_repeat("=", 50) . "\n";
$email_body .= "Sceptyr Lead Management System";

$headers = "From: Sceptyr Lead System <leads@f0h.ab3.myftpupload.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Priority: 1\r\n";
$headers .= "Importance: High\r\n";

// Send emails
$email1 = mail('info@sceptyr.com', $subject, $email_body, $headers);
$email2 = mail('antonio@siteoptz.com', $subject, $email_body, $headers);

// Monday.com integration with new token
$monday_success = false;
$monday_item_id = null;
$monday_error = '';

$monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxNDIxMjY4NiwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMS0yOVQyMzozMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.dR9oYnIiSOWSP3KYJejOoz5rEcI1c0lwAWTLba0cY88';
$board_id = '18397890327';

$ch = curl_init();
if ($ch) {
    // Test authentication first
    $auth_query = 'query { me { name } }';
    $auth_data = array('query' => $auth_query);
    
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($auth_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: ' . $monday_token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $auth_response = curl_exec($ch);
    
    if ($auth_response && !curl_error($ch)) {
        $auth_result = json_decode($auth_response, true);
        
        if (isset($auth_result['data']['me'])) {
            // Authentication successful, create the item
            $create_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                    name
                }
            }';
            
            // Map to Monday.com columns
            $column_values = array(
                'text' => $first_name,
                'text_1' => $last_name,
                'email' => array(
                    'email' => $email,
                    'text' => $email
                ),
                'phone' => array(
                    'phone' => $phone,
                    'countryShortName' => 'US'
                )
            );
            
            // Add optional fields if they have values
            if ($net_worth && $net_worth != 'Not specified') {
                $column_values['text99'] = $net_worth;
            }
            if ($accredited && $accredited != 'Not specified') {
                $column_values['status_1'] = array('label' => $accredited);
            }
            if ($interest && $interest != 'Not specified') {
                $column_values['dropdown'] = array('ids' => array($interest));
            }
            if ($message && $message != 'No additional message') {
                $column_values['text17'] = $message;
            }
            
            $create_data = array(
                'query' => $create_query,
                'variables' => array(
                    'boardId' => $board_id,
                    'itemName' => "$first_name $last_name",
                    'columnValues' => json_encode($column_values)
                )
            );
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($create_data));
            $create_response = curl_exec($ch);
            
            if ($create_response) {
                $create_result = json_decode($create_response, true);
                if (isset($create_result['data']['create_item']['id'])) {
                    $monday_item_id = $create_result['data']['create_item']['id'];
                    $monday_success = true;
                } elseif (isset($create_result['errors'])) {
                    $monday_error = 'Create error: ' . json_encode($create_result['errors']);
                } else {
                    $monday_error = 'Unknown create error';
                }
            } else {
                $monday_error = 'No create response';
            }
        } else {
            $monday_error = 'Authentication failed with new token';
            if (isset($auth_result['errors'])) {
                $monday_error .= ': ' . json_encode($auth_result['errors']);
            }
        }
    } else {
        $monday_error = 'No auth response or curl error: ' . curl_error($ch);
    }
    
    curl_close($ch);
} else {
    $monday_error = 'cURL not available';
}

// Store backup data
$submission_data = array(
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => "$first_name $last_name",
    'email' => $email,
    'phone' => $phone,
    'net_worth' => $net_worth,
    'accredited' => $accredited,
    'interest' => $interest,
    'message' => $message,
    'monday_item_id' => $monday_item_id,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? ''
);

$csv_line = '"' . implode('","', array_values($submission_data)) . '"' . "\n";
file_put_contents('leads_backup.csv', $csv_line, FILE_APPEND | LOCK_EX);

$log = date('Y-m-d H:i:s') . " | $first_name $last_name | $email | Email1: " . ($email1 ? 'OK' : 'FAIL') . " | Email2: " . ($email2 ? 'OK' : 'FAIL') . " | Monday: " . ($monday_success ? 'OK-' . $monday_item_id : 'FAIL-' . $monday_error) . "\n";
file_put_contents('submissions.log', $log, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Thank you! Your submission has been received successfully.' . 
                 ($monday_success ? ' Added to our CRM system.' : ' Our team will follow up within 24 hours.'),
    'lead_id' => 'SCEPTYR-' . date('Ymd-His'),
    'emails_sent' => array(
        'primary' => $email1 ? 'sent' : 'failed',
        'secondary' => $email2 ? 'sent' : 'failed'
    ),
    'monday' => array(
        'success' => $monday_success,
        'item_id' => $monday_item_id,
        'error' => $monday_error
    )
));
?>