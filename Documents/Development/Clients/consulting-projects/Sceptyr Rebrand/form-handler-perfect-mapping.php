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

// Email notifications
$subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name . ' - ' . date('M j, Y g:i A');
$email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n\n";
$email_body .= "👤 CONTACT:\n";
$email_body .= "Name: $first_name $last_name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n\n";
$email_body .= "💰 PROFILE:\n";
$email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_body .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
$email_body .= "Interest: " . ($interest ?: 'Not specified') . "\n\n";
$email_body .= "💬 MESSAGE:\n" . ($message ?: 'No message') . "\n\n";
$email_body .= "⏰ SUBMITTED: " . date('F j, Y g:i A T') . "\n";

$headers = "From: Sceptyr Leads <leads@f0h.ab3.myftpupload.com>\r\nReply-To: $email\r\n";
mail('info@sceptyr.com', $subject, $email_body, $headers);
mail('antonio@siteoptz.com', $subject, $email_body, $headers);

// Monday.com with perfect column mapping
$monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxNDIxMjY4NiwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMS0yOVQyMzozMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.dR9oYnIiSOWSP3KYJejOoz5rEcI1c0lwAWTLba0cY88';
$board_id = '18397890327';

$monday_success = false;
$monday_item_id = null;

$ch = curl_init();
if ($ch) {
    curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: ' . $monday_token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    // Step 1: Create item
    $create_query = 'mutation ($boardId: ID!, $itemName: String!) {
        create_item (board_id: $boardId, item_name: $itemName) {
            id
        }
    }';
    
    $create_data = array(
        'query' => $create_query,
        'variables' => array(
            'boardId' => $board_id,
            'itemName' => "$first_name $last_name"
        )
    );
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($create_data));
    $create_response = curl_exec($ch);
    
    if ($create_response) {
        $create_result = json_decode($create_response, true);
        if (isset($create_result['data']['create_item']['id'])) {
            $monday_item_id = $create_result['data']['create_item']['id'];
            
            // Step 2: Update with all fields using exact column IDs from debug
            $column_values = array();
            
            // Email field (email_mm06cmw7 - Email 1)
            if ($email) {
                $column_values['email_mm06cmw7'] = array(
                    'email' => $email,
                    'text' => $email
                );
            }
            
            // Phone field (phone_mm06bhs1 - Phone 1)  
            if ($phone) {
                $column_values['phone_mm06bhs1'] = array(
                    'phone' => $phone,
                    'countryShortName' => 'US'
                );
            }
            
            // Net Worth (text_mm02dymw - Net Worth)
            if ($net_worth) {
                $column_values['text_mm02dymw'] = $net_worth;
            }
            
            // Accredited (text_mm04fbs8 - Accredited)
            if ($accredited) {
                $column_values['text_mm04fbs8'] = $accredited;
            }
            
            // Interest (text_mm044z4k - Interest)
            if ($interest) {
                $column_values['text_mm044z4k'] = $interest;
            }
            
            // Message (text_mm026pc4 - Message)
            if ($message) {
                $column_values['text_mm026pc4'] = $message;
            }
            
            // Lead Summary (text_mm06hgnn - Lead Summary Note)
            $lead_summary = "Lead from Sceptyr contact form - " . date('M j, Y g:i A');
            $column_values['text_mm06hgnn'] = $lead_summary;
            
            // Date field (date4 - Date) - set to today
            $column_values['date4'] = array('date' => date('Y-m-d'));
            
            $update_query = 'mutation ($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
                change_multiple_column_values (board_id: $boardId, item_id: $itemId, column_values: $columnValues) {
                    id
                }
            }';
            
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
            
            if ($update_response) {
                $update_result = json_decode($update_response, true);
                if (isset($update_result['data']['change_multiple_column_values'])) {
                    $monday_success = true;
                }
            }
        }
    }
    
    curl_close($ch);
}

// Backup storage
$csv_line = '"' . implode('","', array(
    date('Y-m-d H:i:s'),
    "$first_name $last_name",
    $email,
    $phone,
    $net_worth,
    $accredited,
    $interest,
    $message,
    $monday_item_id
)) . '"' . "\n";
file_put_contents('leads_backup.csv', $csv_line, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Thank you for your interest, one of our specialists will be in touch shortly.',
    'monday_item_id' => $monday_item_id,
    'all_fields_mapped' => $monday_success
));
?>