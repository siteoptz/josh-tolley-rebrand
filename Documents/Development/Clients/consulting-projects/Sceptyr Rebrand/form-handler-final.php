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

// Enhanced email with better deliverability
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
$email_body .= "IP Address: " . ($_SERVER['REMOTE_ADDR'] ?? 'Unknown') . "\n";
$email_body .= "User Agent: " . substr($_SERVER['HTTP_USER_AGENT'] ?? 'Unknown', 0, 100) . "\n\n";

$email_body .= "⚡ NEXT STEPS:\n";
$email_body .= "1. Review prospect profile above\n";
$email_body .= "2. Respond within 24 hours for best conversion\n";
$email_body .= "3. Schedule initial consultation call\n\n";

$email_body .= str_repeat("=", 50) . "\n";
$email_body .= "Sceptyr Lead Management System";

// Send to primary email
$headers1 = "From: Sceptyr Lead System <leads@f0h.ab3.myftpupload.com>\r\n";
$headers1 .= "Reply-To: $email\r\n";
$headers1 .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers1 .= "X-Priority: 1\r\n";
$headers1 .= "Importance: High\r\n";

$email1 = mail('info@sceptyr.com', $subject, $email_body, $headers1);

// Send to secondary email  
$email2 = mail('antonio@siteoptz.com', $subject, $email_body, $headers1);

// Alternative notification email (simpler format for better delivery)
$simple_subject = "New Lead: $first_name $last_name";
$simple_body = "Name: $first_name $last_name\nEmail: $email\nPhone: $phone\nNet Worth: $net_worth\nAccredited: $accredited\nInterest: $interest\n\nMessage: $message";
$simple_headers = "From: leads@f0h.ab3.myftpupload.com";

// Backup emails with simpler format
mail('info@sceptyr.com', $simple_subject, $simple_body, $simple_headers);
mail('antonio@siteoptz.com', $simple_subject, $simple_body, $simple_headers);

// Store in local database as backup (since Monday.com is having auth issues)
$submission_data = array(
    'timestamp' => date('Y-m-d H:i:s'),
    'name' => "$first_name $last_name",
    'email' => $email,
    'phone' => $phone,
    'net_worth' => $net_worth,
    'accredited' => $accredited,
    'interest' => $interest,
    'message' => $message,
    'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
);

// CSV format for easy import
$csv_line = '"' . implode('","', array_values($submission_data)) . '"' . "\n";
file_put_contents('leads_backup.csv', $csv_line, FILE_APPEND | LOCK_EX);

// JSON format for detailed records
file_put_contents('leads_detailed.json', json_encode($submission_data) . "\n", FILE_APPEND | LOCK_EX);

// Simple log
$log = date('Y-m-d H:i:s') . " | SUCCESS | $first_name $last_name | $email | $phone\n";
file_put_contents('submissions.log', $log, FILE_APPEND);

echo json_encode(array(
    'success' => true,
    'message' => 'Thank you! Your submission has been received. Our team will contact you within 24 hours.',
    'lead_id' => 'SCEPTYR-' . date('Ymd-His'),
    'emails_sent' => array(
        'primary' => $email1 ? 'sent' : 'failed',
        'secondary' => $email2 ? 'sent' : 'failed'
    ),
    'note' => 'Monday.com integration temporarily disabled due to authentication issues - all data saved locally'
));
?>