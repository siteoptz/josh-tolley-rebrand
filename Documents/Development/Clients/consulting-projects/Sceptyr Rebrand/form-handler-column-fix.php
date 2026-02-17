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

// Email notifications (same as before)
$subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name . ' - ' . date('M j, Y g:i A');

$email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n";
$email_body .= str_repeat("=", 50) . "\n\n";
$email_body .= "👤 CONTACT INFORMATION:\n";
$email_body .= "Full Name: $first_name $last_name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n\n";
$email_body .= "💰 INVESTOR PROFILE:\n";
$email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_body .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
$email_body .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n\n";
$email_body .= "💬 MESSAGE:\n" . ($message ?: 'No additional message') . "\n\n";
$email_body .= "📊 SUBMITTED: " . date('F j, Y \a\t g:i A T') . "\n";

$headers = "From: Sceptyr Leads <leads@f0h.ab3.myftpupload.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Priority: 1\r\n";

$email1 = mail('info@sceptyr.com', $subject, $email_body, $headers);
$email2 = mail('antonio@siteoptz.com', $subject, $email_body, $headers);

// Monday.com with step-by-step approach
$monday_success = false;
$monday_item_id = null;
$monday_debug = array();

$monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxNDIxMjY4NiwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMS0yOVQyMzozMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.dR9oYnIiSOWSP3KYJejOoz5rEcI1c0lwAWTLba0cY88';
$board_id = '18397890327';

$ch = curl_init();
if ($ch) {
    // Step 1: Create basic item first (we know this works)
    $create_query = 'mutation ($boardId: ID!, $itemName: String!) {
        create_item (board_id: $boardId, item_name: $itemName) {
            id
            name
        }
    }';
    
    $create_data = array(
        'query' => $create_query,
        'variables' => array(
            'boardId' => $board_id,
            'itemName' => "$first_name $last_name"
        )
    );
    
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($create_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: ' . $monday_token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $create_response = curl_exec($ch);
    $monday_debug['step1_create'] = $create_response ? 'success' : 'failed';
    
    if ($create_response) {
        $create_result = json_decode($create_response, true);
        if (isset($create_result['data']['create_item']['id'])) {
            $monday_item_id = $create_result['data']['create_item']['id'];
            $monday_debug['item_id'] = $monday_item_id;
            
            // Step 2: Update the item with column values
            $update_query = 'mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
                change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
                    id
                    name
                }
            }';
            
            // Use the exact column IDs from today's API response
            $column_values = array();
            
            // Email field - new ID: text_mm04w6jq
            if ($email) {
                $column_values['text_mm04w6jq'] = $email;
            }
            
            // Phone field - confirmed ID: phone_mm06bhs1  
            if ($phone) {
                $column_values['phone_mm06bhs1'] = array(
                    'phone' => $phone,
                    'countryShortName' => 'US'
                );
            }
            
            // Net Worth - confirmed working ID: text_mm02dymw
            if ($net_worth) {
                $column_values['text_mm02dymw'] = $net_worth;
            }
            
            // Accredited - new ID: text_mm04fbs8
            if ($accredited) {
                $column_values['text_mm04fbs8'] = $accredited;
            }
            
            // Interest - new ID: text_mm044z4k
            if ($interest) {
                $column_values['text_mm044z4k'] = $interest;
            }
            
            // Message - new ID: text_mm026pc4
            if ($message) {
                $column_values['text_mm026pc4'] = $message;
            }
            
            $update_data = array(
                'query' => $update_query,
                'variables' => array(
                    'boardId' => $board_id,
                    'itemId' => $monday_item_id,
                    'columnValues' => json_encode($column_values)
                )
            );
            
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($update_data));
            $update_response = curl_exec($ch);
            $monday_debug['step2_update'] = $update_response ? 'attempted' : 'failed';
            
            if ($update_response) {
                $update_result = json_decode($update_response, true);
                if (isset($update_result['data']['change_multiple_column_values'])) {
                    $monday_success = true;
                    $monday_debug['update_result'] = 'success';
                } else {
                    $monday_debug['update_errors'] = isset($update_result['errors']) ? $update_result['errors'] : 'unknown';
                }
            }
        } else {
            $monday_debug['create_errors'] = isset($create_result['errors']) ? $create_result['errors'] : 'no_id';
        }
    }
    
    curl_close($ch);
} else {
    $monday_debug['curl'] = 'unavailable';
}

// Backup storage
$submission_data = array(
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => "$first_name $last_name",
    'email' => $email,
    'phone' => $phone,
    'net_worth' => $net_worth,
    'accredited' => $accredited,
    'interest' => $interest,
    'message' => $message,
    'monday_item_id' => $monday_item_id
);

$csv_line = '"' . implode('","', array_values($submission_data)) . '"' . "\n";
file_put_contents('leads_backup.csv', $csv_line, FILE_APPEND | LOCK_EX);

echo json_encode(array(
    'success' => true,
    'message' => 'Submitted successfully! Item created in Monday.com' . ($monday_success ? ' with details updated.' : ' (basic info only).'),
    'monday' => array(
        'item_id' => $monday_item_id,
        'details_updated' => $monday_success,
        'debug' => $monday_debug
    )
));
?>