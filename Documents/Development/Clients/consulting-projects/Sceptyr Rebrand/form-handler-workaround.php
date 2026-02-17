<?php
// Workaround version - tries multiple approaches
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

// Get form data
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$first_name = trim($data['firstName'] ?? '');
$last_name = trim($data['lastName'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$net_worth = trim($data['netWorth'] ?? '');
$accredited = trim($data['accredited'] ?? '');
$interest = trim($data['interest'] ?? '');
$message = trim($data['message'] ?? '');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'form_received' => true,
    'monday_result' => ['attempted' => false, 'success' => false],
    'email_result' => ['attempted' => false, 'success' => false],
    'debug' => []
];

// Try Monday.com with different approaches
if (!empty($first_name) && !empty($last_name)) {
    
    // Method 1: cURL (if available)
    if (function_exists('curl_init')) {
        $results['debug'][] = 'Trying cURL method';
        $results['monday_result']['attempted'] = true;
        
        try {
            $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }';
            
            // Use the correct column IDs that were working yesterday
            $column_values = [
                'text' => $first_name,
                'text_1' => $last_name,
                'email_mm06cmw7' => ['email' => $email, 'text' => $email],
                'phone_mm06bhs1' => ['phone' => $phone, 'countryShortName' => 'US'],
                'text_mm02dymw' => $net_worth,
                'status_1_mm06w6j3' => ['label' => $accredited ?: 'Unknown'],
                'dropdown_mm02jnrm' => ['ids' => [$interest]],
                'text17_mm02fh7q' => $message
            ];
            
            $payload = [
                'query' => $monday_query,
                'variables' => [
                    'boardId' => '18397890327',
                    'itemName' => "$first_name $last_name",
                    'columnValues' => json_encode($column_values)
                ]
            ];
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => 'https://api.monday.com/v2',
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($payload),
                CURLOPT_HTTPHEADER => [
                    'Content-Type: application/json',
                    'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE'
                ],
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; SceptyrForm/1.0)'
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($response && $http_code === 200) {
                $result = json_decode($response, true);
                if (isset($result['data']['create_item']['id'])) {
                    $results['monday_result']['success'] = true;
                    $results['monday_result']['item_id'] = $result['data']['create_item']['id'];
                    $results['debug'][] = 'Monday.com success via cURL';
                } else {
                    $results['monday_result']['error'] = 'No item ID in response: ' . $response;
                    $results['debug'][] = 'Monday.com response invalid';
                }
            } else {
                $results['monday_result']['error'] = "HTTP $http_code: $error";
                $results['debug'][] = "Monday.com failed: HTTP $http_code, Error: $error";
            }
            
        } catch (Exception $e) {
            $results['monday_result']['error'] = $e->getMessage();
            $results['debug'][] = 'Monday.com exception: ' . $e->getMessage();
        }
    }
    
    // Method 2: file_get_contents (fallback)
    if (!$results['monday_result']['success'] && ini_get('allow_url_fopen')) {
        $results['debug'][] = 'Trying file_get_contents method';
        
        try {
            $simple_query = 'mutation { create_item (board_id: "18397890327", item_name: "' . addslashes($first_name . ' ' . $last_name) . '") { id } }';
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => [
                        'Content-Type: application/json',
                        'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE'
                    ],
                    'content' => json_encode(['query' => $simple_query]),
                    'timeout' => 30
                ]
            ]);
            
            $response = file_get_contents('https://api.monday.com/v2', false, $context);
            if ($response) {
                $result = json_decode($response, true);
                if (isset($result['data']['create_item']['id'])) {
                    $results['monday_result']['success'] = true;
                    $results['monday_result']['item_id'] = $result['data']['create_item']['id'];
                    $results['debug'][] = 'Monday.com success via file_get_contents';
                }
            }
            
        } catch (Exception $e) {
            $results['debug'][] = 'file_get_contents failed: ' . $e->getMessage();
        }
    }
}

// Try email with multiple approaches
if (!empty($email)) {
    $results['email_result']['attempted'] = true;
    
    if (function_exists('mail')) {
        try {
            $subject = 'Sceptyr Contact Form - ' . $first_name . ' ' . $last_name;
            $email_body = "New contact form submission:\n\n";
            $email_body .= "Name: $first_name $last_name\n";
            $email_body .= "Email: $email\n";
            $email_body .= "Phone: $phone\n";
            $email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
            $email_body .= "Accredited: " . ($accredited ?: 'Not specified') . "\n";
            $email_body .= "Interest: " . ($interest ?: 'Not specified') . "\n";
            $email_body .= "Message: " . ($message ?: 'None') . "\n";
            $email_body .= "\nSubmitted: " . date('Y-m-d H:i:s') . "\n";
            
            // Try different FROM addresses
            $from_addresses = [
                'noreply@' . $_SERVER['HTTP_HOST'],
                'forms@sceptyr.com',
                'no-reply@sceptyr.com'
            ];
            
            foreach ($from_addresses as $from_addr) {
                $headers = "From: $from_addr\r\n";
                $headers .= "Reply-To: $email\r\n";
                $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
                
                $mail_result = @mail('info@sceptyr.com', $subject, $email_body, $headers);
                
                if ($mail_result) {
                    $results['email_result']['success'] = true;
                    $results['email_result']['from_address'] = $from_addr;
                    $results['debug'][] = "Email sent successfully from: $from_addr";
                    break;
                }
            }
            
            if (!$results['email_result']['success']) {
                $results['email_result']['error'] = 'mail() returned false for all FROM addresses';
                $results['debug'][] = 'All email attempts failed';
            }
            
        } catch (Exception $e) {
            $results['email_result']['error'] = $e->getMessage();
            $results['debug'][] = 'Email exception: ' . $e->getMessage();
        }
    } else {
        $results['email_result']['error'] = 'mail() function not available';
        $results['debug'][] = 'mail() function disabled';
    }
}

echo json_encode($results, JSON_PRETTY_PRINT);
?>