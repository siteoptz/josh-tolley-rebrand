<?php
// Enable CORS for cross-origin requests from Vercel
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Validate required fields
$required_fields = ['firstName', 'lastName', 'email', 'phone'];
foreach ($required_fields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Sanitize and prepare data
$first_name = trim($data['firstName']);
$last_name = trim($data['lastName']);
$email = filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL);
$phone = trim($data['phone']);
$net_worth = isset($data['netWorth']) ? trim($data['netWorth']) : '';
$accredited = isset($data['accredited']) ? trim($data['accredited']) : '';
$interest = isset($data['interest']) ? trim($data['interest']) : '';
$message = isset($data['message']) ? trim($data['message']) : '';
$ip_address = $_SERVER['REMOTE_ADDR'] ?? '';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit();
}

// Monday.com integration
$monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
$board_id = '18397890327';
$monday_item_id = null;
$monday_success = false;

try {
    // Create Monday.com item
    $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
        create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
            id
        }
    }';

    // Map form fields to Monday.com columns
    $column_values = [
        'text' => $first_name,
        'text_1' => $last_name,
        'email' => ['email' => $email, 'text' => $email],
        'phone' => ['phone' => $phone, 'countryShortName' => 'US']
    ];

    // Add optional fields if they exist
    if ($net_worth) {
        $column_values['text99'] = $net_worth;
    }
    if ($accredited) {
        $column_values['status_1'] = ['label' => $accredited];
    }
    if ($interest) {
        $column_values['dropdown'] = ['ids' => [$interest]];
    }
    if ($message) {
        $column_values['text17'] = $message;
    }

    $monday_variables = [
        'boardId' => $board_id,
        'itemName' => "$first_name $last_name",
        'columnValues' => json_encode($column_values)
    ];

    $monday_data = [
        'query' => $monday_query,
        'variables' => $monday_variables
    ];

    $monday_context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Authorization: ' . $monday_api_token,
                'User-Agent: SceptyrForm/1.0'
            ],
            'content' => json_encode($monday_data),
            'timeout' => 30
        ]
    ]);

    $monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
    
    if ($monday_response !== false) {
        $monday_result = json_decode($monday_response, true);
        if (isset($monday_result['data']['create_item']['id'])) {
            $monday_item_id = $monday_result['data']['create_item']['id'];
            $monday_success = true;
        }
    }

} catch (Exception $e) {
    error_log("Monday.com API error: " . $e->getMessage());
}

// Send email notification
$email_sent = false;
try {
    $to = 'info@sceptyr.com';
    $subject = 'New Contact Form Submission - ' . $first_name . ' ' . $last_name;
    
    $email_message = "New contact form submission received:\n\n";
    $email_message .= "Name: $first_name $last_name\n";
    $email_message .= "Email: $email\n";
    $email_message .= "Phone: $phone\n";
    $email_message .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
    $email_message .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
    $email_message .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n";
    $email_message .= "Message: " . ($message ?: 'None provided') . "\n\n";
    $email_message .= "Technical Details:\n";
    $email_message .= "IP Address: $ip_address\n";
    $email_message .= "User Agent: $user_agent\n";
    $email_message .= "Monday.com Item ID: " . ($monday_item_id ?: 'Failed to create') . "\n";
    $email_message .= "Submission Time: " . date('Y-m-d H:i:s T') . "\n";
    
    $headers = "From: no-reply@sceptyr.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    $email_sent = mail($to, $subject, $email_message, $headers);

} catch (Exception $e) {
    error_log("Email error: " . $e->getMessage());
}

// Return success response if at least one method worked
if ($monday_success || $email_sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'monday_item_id' => $monday_item_id,
        'monday_success' => $monday_success,
        'email_sent' => $email_sent
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to process submission',
        'monday_success' => $monday_success,
        'email_sent' => $email_sent
    ]);
}
?>