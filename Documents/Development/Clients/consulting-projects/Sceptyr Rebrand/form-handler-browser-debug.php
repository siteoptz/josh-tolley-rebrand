<?php
// Browser-visible debug version (no file logging)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed', 'method' => $_SERVER['REQUEST_METHOD']]);
    exit();
}

$debug_info = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    'capabilities' => [
        'curl' => function_exists('curl_init') ? 'YES' : 'NO',
        'mail' => function_exists('mail') ? 'YES' : 'NO',
        'json' => function_exists('json_encode') ? 'YES' : 'NO',
        'file_put_contents' => function_exists('file_put_contents') ? 'YES' : 'NO',
        'allow_url_fopen' => ini_get('allow_url_fopen') ? 'YES' : 'NO'
    ],
    'input_received' => false,
    'data_parsed' => false,
    'monday_attempted' => false,
    'email_attempted' => false
];

try {
    // Get input
    $input = file_get_contents('php://input');
    $debug_info['input_received'] = true;
    $debug_info['input_length'] = strlen($input);
    $debug_info['input_preview'] = substr($input, 0, 100) . '...';
    
    // Parse JSON
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON error: ' . json_last_error_msg());
    }
    
    // Use EXACT working method from form-handler-discover-columns.php
    if (isset($data['firstName']) && $data['firstName'] === 'GET_COLUMN_IDS') {
        $api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';
        $board_id = '18397890327';
        
        // EXACT query from working version
        $columns_query = 'query ($boardId: ID!) {
            boards (ids: [$boardId]) {
                columns {
                    id
                    title
                    type
                }
            }
        }';
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: ' . $api_token
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        
        $columns_data = [
            'query' => $columns_query,
            'variables' => ['boardId' => $board_id]
        ];
        
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($columns_data));
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($response && $http_code === 200) {
            $result = json_decode($response, true);
            
            if (isset($result['data']['boards'][0]['columns'])) {
                $columns = $result['data']['boards'][0]['columns'];
                $column_mapping = [];
                
                foreach ($columns as $column) {
                    $column_mapping[] = [
                        'id' => $column['id'],
                        'title' => $column['title'],
                        'type' => $column['type']
                    ];
                }
                
                echo json_encode([
                    'success' => true,
                    'board_id' => $board_id,
                    'columns_found' => count($columns),
                    'columns' => $column_mapping
                ], JSON_PRETTY_PRINT);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'No columns found in response',
                    'response' => $result
                ], JSON_PRETTY_PRINT);
            }
        } else {
            echo json_encode([
                'success' => false,
                'http_code' => $http_code,
                'response' => substr($response, 0, 500)
            ], JSON_PRETTY_PRINT);
        }
        exit();
    }
    
    // Check if this is a column pattern test
    if (isset($data['firstName']) && $data['firstName'] === 'TEST_COLUMNS') {
        $api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';
        
        // Test different column patterns
        $email_tests = ['email_1', 'text_5', 'text_6', 'text_7', 'text_8', 'email', 'text3', 'text4', 'text5'];
        $results = [];
        
        foreach ($email_tests as $column_id) {
            $query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }';
            
            $column_values = [
                'text' => 'TEST',
                'phone' => '555-0000', 
                'text_mm02dymw' => '1M',
                $column_id => 'test@email.com'
            ];
            
            $payload = [
                'query' => $query,
                'variables' => [
                    'boardId' => '18397890327',
                    'itemName' => "Email Test: $column_id",
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
                    'Authorization: ' . $api_token
                ],
                CURLOPT_TIMEOUT => 5
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            $results[] = [
                'column_id' => $column_id,
                'success' => ($response && $http_code === 200)
            ];
            
            usleep(300000); // 0.3 second delay
        }
        
        echo json_encode([
            'success' => true,
            'action' => 'column_test',
            'message' => 'Created test items in Monday.com',
            'tests' => $results,
            'note' => 'Check Monday.com board for test items with email populated'
        ], JSON_PRETTY_PRINT);
        exit();
    }
    
    $debug_info['data_parsed'] = true;
    $debug_info['form_fields'] = array_keys($data);
    
    // Extract data
    $first_name = trim($data['firstName'] ?? '');
    $last_name = trim($data['lastName'] ?? '');
    
    // ALWAYS show column discovery if name contains GET_COLUMN
    if (stripos($first_name, 'GET_COLUMN') !== false) {
        $api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';
        
        $query = 'query { boards(ids: [18397890327]) { columns { id title type } } }';
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.monday.com/v2',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['query' => $query]),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: ' . $api_token
            ],
            CURLOPT_TIMEOUT => 10
        ]);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        if ($response) {
            $result = json_decode($response, true);
            echo json_encode([
                'COLUMN_DISCOVERY' => true,
                'board_response' => $result,
                'columns' => $result['data']['boards'][0]['columns'] ?? 'Not found'
            ], JSON_PRETTY_PRINT);
        } else {
            echo json_encode(['COLUMN_DISCOVERY' => true, 'error' => 'No response'], JSON_PRETTY_PRINT);
        }
        exit();
    }
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    
    $debug_info['extracted_data'] = [
        'firstName' => $first_name,
        'lastName' => $last_name,
        'email' => $email,
        'phone' => substr($phone, 0, 3) . '***' // Partial phone for security
    ];
    
    if (empty($first_name) || empty($last_name) || empty($email) || empty($phone)) {
        throw new Exception('Missing required fields');
    }
    
    // Test Monday.com if cURL available
    $monday_result = ['attempted' => false, 'success' => false, 'error' => ''];
    
    if (function_exists('curl_init')) {
        $debug_info['monday_attempted'] = true;
        $monday_result['attempted'] = true;
        
        try {
            $api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';
            
            // Full Monday.com test with all fields
            $net_worth = trim($data['netWorth'] ?? '');
            $accredited = trim($data['accredited'] ?? '');
            $interest = trim($data['interest'] ?? '');
            $message = trim($data['message'] ?? '');
            
            $query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
                create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                    id
                }
            }';
            
            // REVERT to yesterday's EXACT working configuration
            $column_values = [
                'text' => $first_name,
                'text_1' => $last_name,
                'email_mm06cmw7' => ['email' => $email, 'text' => $email],
                'phone_mm06bhs1' => ['phone' => $phone, 'countryShortName' => 'US'],
                'text_mm02dymw' => $net_worth,
                'status_1_mm06w6j3' => ['label' => $accredited ?: 'Unknown'],
                'dropdown_mm02jnrm' => ['ids' => [$interest ?: '']],
                'text17_mm02fh7q' => $message
            ];
            
            $payload = [
                'query' => $query,
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
                    'Authorization: ' . $api_token
                ],
                CURLOPT_TIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => false
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            
            if ($response === false) {
                $monday_result['error'] = 'cURL error: ' . curl_error($ch);
            } else {
                $monday_result['http_code'] = $http_code;
                $monday_result['response'] = $response;
                
                if ($http_code === 200) {
                    $result = json_decode($response, true);
                    if (isset($result['data']['create_item']['id'])) {
                        $monday_result['success'] = true;
                        $monday_result['item_id'] = $result['data']['create_item']['id'];
                    } else {
                        $monday_result['error'] = 'No item ID in response';
                    }
                } else {
                    $monday_result['error'] = "HTTP $http_code";
                }
            }
            
            curl_close($ch);
            
        } catch (Exception $e) {
            $monday_result['error'] = $e->getMessage();
        }
    } else {
        $monday_result['error'] = 'cURL not available';
    }
    
    // Test Email if mail() available
    $email_result = ['attempted' => false, 'success' => false, 'error' => ''];
    
    if (function_exists('mail')) {
        $debug_info['email_attempted'] = true;
        $email_result['attempted'] = true;
        
        try {
            $subject = 'Sceptyr Test Form - ' . date('H:i:s');
            $message = "Test from: $first_name $last_name\nEmail: $email\nPhone: $phone";
            $headers = "From: noreply@" . $_SERVER['HTTP_HOST'] . "\r\n";
            
            $email_result['success'] = mail('info@sceptyr.com', $subject, $message, $headers);
            
            if (!$email_result['success']) {
                $email_result['error'] = 'mail() returned false';
            }
            
        } catch (Exception $e) {
            $email_result['error'] = $e->getMessage();
        }
    } else {
        $email_result['error'] = 'mail() not available';
    }
    
    // Success response with all debug info
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form processed successfully',
        'debug' => $debug_info,
        'monday_com' => $monday_result,
        'email' => $email_result
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug_info
    ], JSON_PRETTY_PRINT);
}
?>