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
$email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n\n";
$email_body .= "Name: $first_name $last_name\n";
$email_body .= "Email: $email\n";
$email_body .= "Phone: $phone\n";
$email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
$email_body .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
$email_body .= "Interest: " . ($interest ?: 'Not specified') . "\n";
$email_body .= "Message: " . ($message ?: 'No message') . "\n";
$email_body .= "Time: " . date('F j, Y g:i A T') . "\n";

$headers = "From: Sceptyr Leads <leads@f0h.ab3.myftpupload.com>\r\nReply-To: $email\r\n";
mail('info@sceptyr.com', $subject, $email_body, $headers);
mail('antonio@siteoptz.com', $subject, $email_body, $headers);

// Monday.com - First discover the board structure
$monday_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxNDIxMjY4NiwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMS0yOVQyMzozMDowOC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.dR9oYnIiSOWSP3KYJejOoz5rEcI1c0lwAWTLba0cY88';
$board_id = '18397890327';

$monday_debug = array();
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
    
    // Step 1: Get board columns to understand the structure
    $columns_query = 'query ($boardId: ID!) {
        boards (ids: [$boardId]) {
            columns {
                id
                title
                type
            }
        }
    }';
    
    $columns_data = array(
        'query' => $columns_query,
        'variables' => array('boardId' => $board_id)
    );
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($columns_data));
    $columns_response = curl_exec($ch);
    
    if ($columns_response) {
        $columns_result = json_decode($columns_response, true);
        if (isset($columns_result['data']['boards'][0]['columns'])) {
            $columns = $columns_result['data']['boards'][0]['columns'];
            $monday_debug['columns_found'] = count($columns);
            $monday_debug['columns'] = array();
            
            foreach ($columns as $column) {
                $monday_debug['columns'][] = $column['id'] . ' (' . $column['title'] . ' - ' . $column['type'] . ')';
            }
        }
    }
    
    // Step 2: Create item with name only (we know this works)
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
            $monday_debug['item_created'] = 'yes';
            
            // Step 3: Try to add a simple text value to a text column
            // We'll use the first text column we find
            if (isset($columns_result['data']['boards'][0]['columns'])) {
                $text_column = null;
                $email_column = null;
                $phone_column = null;
                
                foreach ($columns_result['data']['boards'][0]['columns'] as $column) {
                    if ($column['type'] === 'text' && !$text_column) {
                        $text_column = $column['id'];
                    }
                    if ($column['type'] === 'email' && !$email_column) {
                        $email_column = $column['id'];
                    }
                    if ($column['type'] === 'phone' && !$phone_column) {
                        $phone_column = $column['id'];
                    }
                }
                
                // Try to update with simple values
                $column_values = array();
                if ($email_column) {
                    $column_values[$email_column] = array('email' => $email, 'text' => $email);
                }
                if ($phone_column) {
                    $column_values[$phone_column] = array('phone' => $phone, 'countryShortName' => 'US');
                }
                if ($text_column) {
                    $column_values[$text_column] = "Net Worth: $net_worth | Accredited: $accredited | Interest: $interest";
                }
                
                if (!empty($column_values)) {
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
                    $monday_debug['update_attempted'] = 'yes';
                    $monday_debug['column_values_sent'] = $column_values;
                    
                    if ($update_response) {
                        $update_result = json_decode($update_response, true);
                        if (isset($update_result['data']['change_multiple_column_values'])) {
                            $monday_debug['update_result'] = 'success';
                        } else {
                            $monday_debug['update_errors'] = isset($update_result['errors']) ? $update_result['errors'] : 'unknown';
                        }
                    } else {
                        $monday_debug['update_response'] = 'none';
                    }
                }
            }
        }
    }
    
    curl_close($ch);
}

// Backup
$csv_line = '"' . date('Y-m-d H:i:s') . '","' . $first_name . ' ' . $last_name . '","' . $email . '","' . $phone . '","' . $net_worth . '","' . $accredited . '","' . $interest . '","' . $message . '","' . $monday_item_id . '"' . "\n";
file_put_contents('leads_backup.csv', $csv_line, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Submitted! Item created in Monday.com. Debug info: ' . json_encode($monday_debug),
    'monday_debug' => $monday_debug,
    'monday_item_id' => $monday_item_id
));
?>