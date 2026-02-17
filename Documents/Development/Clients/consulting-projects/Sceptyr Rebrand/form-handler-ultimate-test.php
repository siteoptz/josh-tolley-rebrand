<?php
// Ultimate test version to identify ALL issues
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Multiple logging methods
function multiLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    
    // Try multiple logging methods
    @file_put_contents('sceptyr_debug.log', $logMessage, FILE_APPEND);
    @file_put_contents('debug.txt', $logMessage, FILE_APPEND);
    @error_log($logMessage);
}

// Server capability check
function checkServerCapabilities() {
    $capabilities = [
        'PHP Version' => phpversion(),
        'cURL Available' => function_exists('curl_init') ? 'YES' : 'NO',
        'mail() Available' => function_exists('mail') ? 'YES' : 'NO',
        'file_put_contents Available' => function_exists('file_put_contents') ? 'YES' : 'NO',
        'JSON Available' => function_exists('json_encode') ? 'YES' : 'NO',
        'allow_url_fopen' => ini_get('allow_url_fopen') ? 'YES' : 'NO',
        'Max Execution Time' => ini_get('max_execution_time'),
        'Memory Limit' => ini_get('memory_limit')
    ];
    return $capabilities;
}

multiLog("=== FORM HANDLER STARTED ===");

$capabilities = checkServerCapabilities();
foreach ($capabilities as $key => $value) {
    multiLog("$key: $value");
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    multiLog("OPTIONS request received");
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    multiLog("Non-POST request: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    multiLog("Processing POST request");
    
    $input = file_get_contents('php://input');
    multiLog("Input length: " . strlen($input));
    multiLog("First 100 chars: " . substr($input, 0, 100));
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON decode error: ' . json_last_error_msg());
    }
    
    multiLog("JSON decoded successfully");
    multiLog("Data keys: " . implode(', ', array_keys($data)));
    
    $first_name = trim($data['firstName'] ?? '');
    $last_name = trim($data['lastName'] ?? '');
    $email = trim($data['email'] ?? '');
    $phone = trim($data['phone'] ?? '');
    $net_worth = trim($data['netWorth'] ?? '');
    $accredited = trim($data['accredited'] ?? '');
    $interest = trim($data['interest'] ?? '');
    $message = trim($data['message'] ?? '');

    multiLog("Extracted data: $first_name $last_name, $email, $phone");

    if (empty($first_name) || empty($last_name) || empty($email) || empty($phone)) {
        throw new Exception('Missing required fields');
    }

    // Test 1: Simple email test
    multiLog("=== TESTING EMAIL ===");
    $email_result = false;
    $email_error = '';
    
    if (function_exists('mail')) {
        multiLog("mail() function is available");
        
        $test_subject = "Sceptyr Form Test - " . date('Y-m-d H:i:s');
        $test_message = "Test submission from $first_name $last_name ($email)\n";
        $test_message .= "Phone: $phone\n";
        $test_message .= "Net Worth: $net_worth\n";
        $test_message .= "Accredited: $accredited\n";
        $test_message .= "Interest: $interest\n";
        $test_message .= "Message: $message\n";
        
        $test_headers = "From: noreply@" . $_SERVER['HTTP_HOST'] . "\r\n";
        $test_headers .= "Reply-To: $email\r\n";
        
        multiLog("Attempting to send email to info@sceptyr.com");
        $email_result = @mail('info@sceptyr.com', $test_subject, $test_message, $test_headers);
        
        if ($email_result) {
            multiLog("Email sent successfully");
        } else {
            $email_error = error_get_last();
            multiLog("Email failed. Error: " . print_r($email_error, true));
        }
    } else {
        multiLog("mail() function is NOT available");
        $email_error = "mail() function disabled";
    }

    // Test 2: Monday.com API test
    multiLog("=== TESTING MONDAY.COM API ===");
    $monday_result = false;
    $monday_error = '';
    $monday_item_id = null;
    
    if (function_exists('curl_init')) {
        multiLog("cURL is available");
        
        $api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
        $board_id = '18397890327';
        
        // Simple query first
        $query = 'mutation { create_item (board_id: "' . $board_id . '", item_name: "' . $first_name . ' ' . $last_name . '") { id } }';
        
        $payload = [
            'query' => $query
        ];
        
        multiLog("Payload: " . json_encode($payload));
        
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
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        multiLog("Making cURL request to Monday.com");
        $response = curl_exec($ch);
        
        if ($response === false) {
            $monday_error = curl_error($ch);
            multiLog("cURL error: " . $monday_error);
        } else {
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            multiLog("HTTP response code: " . $http_code);
            multiLog("Response: " . $response);
            
            if ($http_code === 200) {
                $result = json_decode($response, true);
                if (isset($result['data']['create_item']['id'])) {
                    $monday_item_id = $result['data']['create_item']['id'];
                    $monday_result = true;
                    multiLog("Monday.com item created: " . $monday_item_id);
                } else {
                    $monday_error = "No item ID in response: " . $response;
                    multiLog($monday_error);
                }
            } else {
                $monday_error = "HTTP error $http_code: $response";
                multiLog($monday_error);
            }
        }
        
        curl_close($ch);
        
    } else {
        multiLog("cURL is NOT available");
        $monday_error = "cURL not available";
    }

    // Return comprehensive results
    $response = [
        'success' => true,
        'message' => 'Test completed',
        'server_info' => $capabilities,
        'email_test' => [
            'success' => $email_result,
            'error' => $email_error
        ],
        'monday_test' => [
            'success' => $monday_result,
            'item_id' => $monday_item_id,
            'error' => $monday_error
        ],
        'form_data' => [
            'firstName' => $first_name,
            'lastName' => $last_name,
            'email' => $email,
            'phone' => $phone
        ]
    ];

    multiLog("Final response: " . json_encode($response, JSON_PRETTY_PRINT));
    multiLog("=== TEST COMPLETED ===");

    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT);

} catch (Exception $e) {
    $error_response = [
        'success' => false,
        'error' => $e->getMessage(),
        'server_info' => checkServerCapabilities()
    ];
    
    multiLog("FATAL ERROR: " . $e->getMessage());
    multiLog("Error response: " . json_encode($error_response));
    
    http_response_code(500);
    echo json_encode($error_response);
}
?>