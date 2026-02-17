<?php
// Simple test version of form handler
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

try {
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
    $net_worth = isset($data['netWorth']) ? trim($data['netWorth']) : null;
    $accredited = isset($data['accredited']) ? trim($data['accredited']) : null;
    $interest = isset($data['interest']) ? trim($data['interest']) : null;
    $message = isset($data['message']) ? trim($data['message']) : null;

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email address']);
        exit();
    }

    // Monday.com integration with correct column IDs
    $monday_api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE';
    $board_id = '18397890327';
    $monday_item_id = null;

    try {
        // Create Monday.com item
        $monday_query = 'mutation ($boardId: ID!, $itemName: String!, $columnValues: JSON!) {
            create_item (board_id: $boardId, item_name: $itemName, column_values: $columnValues) {
                id
            }
        }';

        // Use the correct column IDs
        $column_values = [
            'text' => $first_name,
            'text_1' => $last_name,
            'email_mm06cmw7' => ['email' => $email, 'text' => $email],
            'phone_mm06bhs1' => ['phone' => $phone, 'countryShortName' => 'US'],
            'text_mm02dymw' => $net_worth ?: '',
            'status_1_mm06w6j3' => ['label' => $accredited ?: 'Unknown'],
            'dropdown_mm02jnrm' => ['ids' => [$interest ?: '']],
            'text17_mm02fh7q' => $message ?: ''
        ];

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
                    'Authorization: ' . $monday_api_token
                ],
                'content' => json_encode($monday_data)
            ]
        ]);

        $monday_response = file_get_contents('https://api.monday.com/v2', false, $monday_context);
        $monday_result = json_decode($monday_response, true);

        if (isset($monday_result['data']['create_item']['id'])) {
            $monday_item_id = $monday_result['data']['create_item']['id'];
        }

    } catch (Exception $e) {
        error_log("Monday.com API error: " . $e->getMessage());
        // Continue even if Monday.com fails
    }

    // Send email notification (simple version without database)
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
    $email_message .= "\nMonday.com Item ID: " . ($monday_item_id ?: 'Failed to create') . "\n";
    
    $headers = "From: no-reply@sceptyr.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    mail($to, $subject, $email_message, $headers);

    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Form submitted successfully',
        'monday_item_id' => $monday_item_id
    ]);

} catch (Exception $e) {
    error_log("Form handler error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error: ' . $e->getMessage()]);
}
?>