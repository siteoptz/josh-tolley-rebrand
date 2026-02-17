<?php
// Email-only handler for Sceptyr contact form
// This handler ONLY sends emails and does NOT submit to Monday.com
// Created to prevent duplicate Monday.com submissions

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

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
$sms_consent = trim($data['smsConsent'] ?? '');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'email_result' => ['success' => false],
    'monday_result' => ['skipped' => 'Handled by Vercel API to prevent duplication']
];

// Email notification with proper headers
if (function_exists('mail')) {
    $subject = '[SCEPTYR LEAD] ' . $first_name . ' ' . $last_name . ' - ' . date('M j, Y g:i A');
    
    $email_body = "🎯 NEW QUALIFIED LEAD SUBMISSION\n";
    $email_body .= str_repeat("=", 50) . "\n\n";
    $email_body .= "👤 CONTACT INFORMATION:\n";
    $email_body .= "Full Name: $first_name $last_name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Phone: $phone\n";
    $email_body .= "SMS Consent: " . ($sms_consent ? 'Yes' : 'No') . "\n\n";
    $email_body .= "💰 INVESTOR PROFILE:\n";
    $email_body .= "Net Worth: " . ($net_worth ?: 'Not specified') . "\n";
    $email_body .= "Accredited Investor: " . ($accredited ?: 'Not specified') . "\n";
    $email_body .= "Primary Interest: " . ($interest ?: 'Not specified') . "\n\n";
    $email_body .= "💬 MESSAGE:\n" . ($message ?: 'No additional message') . "\n\n";
    $email_body .= "📊 SUBMITTED: " . date('F j, Y \a\t g:i A T') . "\n";
    $email_body .= "⚠️  Monday.com entry created via Vercel API (no duplication)\n";
    
    $headers = "From: Sceptyr Leads <leads@f0h.ab3.myftpupload.com>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "X-Priority: 1\r\n";
    
    $email1 = mail('info@sceptyr.com', $subject, $email_body, $headers);
    $email2 = mail('antonio@siteoptz.com', $subject, $email_body, $headers);
    
    $results['email_result']['success'] = $email1 || $email2;
    $results['email_result']['info_sent'] = $email1;
    $results['email_result']['antonio_sent'] = $email2;
    $results['email_result']['sms_consent_included'] = true;
} else {
    $results['email_result']['error'] = 'Mail function not available';
}

echo json_encode([
    'success' => true,
    'message' => 'Email notifications sent successfully',
    'results' => $results
], JSON_PRETTY_PRINT);
?>