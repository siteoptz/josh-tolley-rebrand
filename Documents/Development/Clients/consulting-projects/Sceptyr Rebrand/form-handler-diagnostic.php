<?php
// Comprehensive diagnostic and working form handler
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Logging function
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message\n";
    file_put_contents('form_debug.log', $logEntry, FILE_APPEND | LOCK_EX);
    error_log($message);
}

logMessage("Form handler started - PHP Version: " . phpversion());

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    logMessage("OPTIONS request received");
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logMessage("Non-POST request: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    logMessage("Processing POST request");
    
    // Get and log input
    $input = file_get_contents('php://input');
    logMessage("Raw input received: " . substr($input, 0, 200) . "...");
    
    $data = json_decode($input, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON: ' . json_last_error_msg());
    }
    
    logMessage("JSON decoded successfully");
    
    // Extract and validate data
    $first_name = isset($data['firstName']) ? trim($data['firstName']) : '';
    $last_name = isset($data['lastName']) ? trim($data['lastName']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $net_worth = isset($data['netWorth']) ? trim($data['netWorth']) : '';
    $accredited = isset($data['accredited']) ? trim($data['accredited']) : '';
    $interest = isset($data['interest']) ? trim($data['interest']) : '';
    $message = isset($data['message']) ? trim($data['message']) : '';

    logMessage("Form data extracted - Name: $first_name $last_name, Email: $email");

    if (empty($first_name) || empty($last_name) || empty($email) || empty($phone)) {
        throw new Exception('Missing required fields');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email address');
    }

    logMessage("Validation passed");

    // Monday.com integration
    $monday_success = false;
    $monday_item_id = null;
    $monday_error = '';

    try {
        logMessage("Starting Monday.com integration");
        
        $monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
        $board_id = '18397890327';

        $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
            create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                id
                name
            }
        }';

        // Updated column values with correct IDs
        $column_values = [
            'text' => $first_name,
            'text_1' => $last_name,
            'email_mm06cmw7' => [
                'email' => $email,
                'text' => $email
            ],
            'phone_mm06bhs1' => [
                'phone' => $phone,
                'countryShortName' => 'US'
            ]
        ];
        
        // Add optional fields if they exist
        if (!empty($net_worth)) {
            $column_values['text_mm02dymw'] = $net_worth;
        }
        
        if (!empty($accredited)) {
            $column_values['status_1_mm06w6j3'] = ['label' => $accredited];
        }
        
        if (!empty($interest)) {
            $column_values['dropdown_mm02jnrm'] = ['ids' => [$interest]];
        }
        
        if (!empty($message)) {
            $column_values['text17_mm02fh7q'] = $message;
        }

        $monday_variables = [
            'boardId' => $board_id,
            'itemName' => "$first_name $last_name",
            'columnValues' => json_encode($column_values)
        ];

        $monday_payload = [
            'query' => $monday_query,
            'variables' => $monday_variables
        ];

        logMessage("Monday.com payload prepared");

        // Use cURL for better error handling
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.monday.com/v2');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($monday_payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: ' . $monday_api_token
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

        $monday_response = curl_exec($ch);
        $curl_error = curl_error($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($curl_error) {
            throw new Exception("cURL error: $curl_error");
        }

        if ($http_code !== 200) {
            throw new Exception("HTTP error: $http_code");
        }

        logMessage("Monday.com response received: HTTP $http_code");
        logMessage("Monday.com response: " . substr($monday_response, 0, 500));

        $monday_result = json_decode($monday_response, true);
        
        if (isset($monday_result['errors'])) {
            throw new Exception("Monday.com API errors: " . json_encode($monday_result['errors']));
        }

        if (isset($monday_result['data']['create_item']['id'])) {
            $monday_item_id = $monday_result['data']['create_item']['id'];
            $monday_success = true;
            logMessage("Monday.com item created successfully: ID $monday_item_id");
        } else {
            throw new Exception("No item ID returned from Monday.com");
        }

    } catch (Exception $e) {
        $monday_error = $e->getMessage();
        logMessage("Monday.com error: " . $monday_error);
    }

    // Email notification
    $email_success = false;
    $email_error = '';

    try {
        logMessage("Sending email notification");
        
        $to = 'info@sceptyr.com';
        $subject = 'New Contact Form Submission - ' . $first_name . ' ' . $last_name;
        
        $email_message = "New contact form submission:\n\n";
        $email_message .= "Name: $first_name $last_name\n";
        $email_message .= "Email: $email\n";
        $email_message .= "Phone: $phone\n";
        $email_message .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
        $email_message .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
        $email_message .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n";
        $email_message .= "Message: " . ($message ?: 'None') . "\n";
        $email_message .= "\nMonday.com Status: " . ($monday_success ? "Success (ID: $monday_item_id)" : "Failed ($monday_error)") . "\n";
        $email_message .= "Submitted at: " . date('Y-m-d H:i:s') . "\n";
        
        $headers = "From: no-reply@sceptyr.com\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
        
        $email_success = mail($to, $subject, $email_message, $headers);
        
        if ($email_success) {
            logMessage("Email sent successfully to $to");
        } else {
            logMessage("Email failed to send to $to");
        }

    } catch (Exception $e) {
        $email_error = $e->getMessage();
        logMessage("Email error: " . $email_error);
    }

    // Return comprehensive response
    $response = [
        'success' => true,
        'message' => 'Form processed',
        'monday_com' => [
            'success' => $monday_success,
            'item_id' => $monday_item_id,
            'error' => $monday_error
        ],
        'email' => [
            'success' => $email_success,
            'error' => $email_error
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];

    logMessage("Response prepared: " . json_encode($response));

    http_response_code(200);
    echo json_encode($response);

} catch (Exception $e) {
    logMessage("Fatal error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

logMessage("Form handler completed");
?>