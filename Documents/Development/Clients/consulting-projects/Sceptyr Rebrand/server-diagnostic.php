<?php
// Server diagnostic to identify what changed overnight
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

function testFunction($function_name) {
    return [
        'available' => function_exists($function_name),
        'enabled' => function_exists($function_name) ? 'YES' : 'NO'
    ];
}

function testIniSetting($setting) {
    $value = ini_get($setting);
    return [
        'value' => $value,
        'enabled' => $value ? 'YES' : 'NO'
    ];
}

$diagnostic = [
    'timestamp' => date('Y-m-d H:i:s T'),
    'server_info' => [
        'php_version' => phpversion(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
        'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
        'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown'
    ],
    'php_functions' => [
        'curl_init' => testFunction('curl_init'),
        'mail' => testFunction('mail'),
        'file_get_contents' => testFunction('file_get_contents'),
        'json_decode' => testFunction('json_decode'),
        'json_encode' => testFunction('json_encode'),
        'stream_context_create' => testFunction('stream_context_create'),
        'filter_var' => testFunction('filter_var')
    ],
    'php_settings' => [
        'allow_url_fopen' => testIniSetting('allow_url_fopen'),
        'allow_url_include' => testIniSetting('allow_url_include'),
        'max_execution_time' => testIniSetting('max_execution_time'),
        'memory_limit' => testIniSetting('memory_limit'),
        'post_max_size' => testIniSetting('post_max_size'),
        'upload_max_filesize' => testIniSetting('upload_max_filesize'),
        'default_socket_timeout' => testIniSetting('default_socket_timeout')
    ],
    'curl_info' => [],
    'connectivity_tests' => []
];

// Detailed cURL information
if (function_exists('curl_init')) {
    $curl_version = curl_version();
    $diagnostic['curl_info'] = [
        'version' => $curl_version['version'] ?? 'unknown',
        'ssl_version' => $curl_version['ssl_version'] ?? 'unknown',
        'protocols' => $curl_version['protocols'] ?? []
    ];
} else {
    $diagnostic['curl_info']['error'] = 'cURL not available';
}

// Test basic connectivity
if (function_exists('file_get_contents') && ini_get('allow_url_fopen')) {
    try {
        $context = stream_context_create([
            'http' => [
                'timeout' => 10,
                'method' => 'GET'
            ]
        ]);
        
        $test_response = @file_get_contents('https://httpbin.org/get', false, $context);
        $diagnostic['connectivity_tests']['file_get_contents'] = [
            'success' => $test_response !== false,
            'response_length' => $test_response ? strlen($test_response) : 0
        ];
    } catch (Exception $e) {
        $diagnostic['connectivity_tests']['file_get_contents'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
} else {
    $diagnostic['connectivity_tests']['file_get_contents'] = [
        'success' => false,
        'error' => 'file_get_contents or allow_url_fopen disabled'
    ];
}

// Test cURL connectivity
if (function_exists('curl_init')) {
    try {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://httpbin.org/get',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_FOLLOWLOCATION => true
        ]);
        
        $curl_response = curl_exec($ch);
        $curl_info = curl_getinfo($ch);
        $curl_error = curl_error($ch);
        curl_close($ch);
        
        $diagnostic['connectivity_tests']['curl'] = [
            'success' => $curl_response !== false,
            'http_code' => $curl_info['http_code'] ?? 0,
            'error' => $curl_error ?: null,
            'response_length' => $curl_response ? strlen($curl_response) : 0
        ];
    } catch (Exception $e) {
        $diagnostic['connectivity_tests']['curl'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
} else {
    $diagnostic['connectivity_tests']['curl'] = [
        'success' => false,
        'error' => 'cURL not available'
    ];
}

// Test Monday.com API connectivity specifically
if (function_exists('curl_init')) {
    try {
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => 'https://api.monday.com/v2',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['query' => 'query { me { id } }']),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQ3NDc3MDEwOCwiYWFpIjoxMSwidWlkIjo3MDE1MjAwNSwiaWFkIjoiMjAyNS0wMS0yM1QxNzo1NzowNC4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6Mjg0OTM4MDIsInJnbiI6InVzZTEifQ.hv33Cme8xNI14Jyb1aVhHRnhLdMDY0_-HrWxn8Yp7lE'
            ],
            CURLOPT_TIMEOUT => 10,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        
        $monday_response = curl_exec($ch);
        $monday_info = curl_getinfo($ch);
        $monday_error = curl_error($ch);
        curl_close($ch);
        
        $diagnostic['connectivity_tests']['monday_api'] = [
            'success' => $monday_response !== false && $monday_info['http_code'] === 200,
            'http_code' => $monday_info['http_code'] ?? 0,
            'error' => $monday_error ?: null,
            'response_preview' => $monday_response ? substr($monday_response, 0, 200) : null
        ];
    } catch (Exception $e) {
        $diagnostic['connectivity_tests']['monday_api'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Test mail function
if (function_exists('mail')) {
    $diagnostic['mail_test'] = [
        'function_available' => true,
        'test_attempted' => false
    ];
    
    // Only test mail if this is a POST request to avoid spam
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $test_result = @mail(
                'test@example.com', 
                'Server Diagnostic Test', 
                'This is a test email from server diagnostic', 
                'From: noreply@' . ($_SERVER['HTTP_HOST'] ?? 'localhost')
            );
            
            $diagnostic['mail_test']['test_attempted'] = true;
            $diagnostic['mail_test']['success'] = $test_result;
        } catch (Exception $e) {
            $diagnostic['mail_test']['test_attempted'] = true;
            $diagnostic['mail_test']['success'] = false;
            $diagnostic['mail_test']['error'] = $e->getMessage();
        }
    }
} else {
    $diagnostic['mail_test'] = [
        'function_available' => false,
        'error' => 'mail() function not available'
    ];
}

// Check for any PHP errors
$last_error = error_get_last();
if ($last_error) {
    $diagnostic['last_php_error'] = $last_error;
}

echo json_encode($diagnostic, JSON_PRETTY_PRINT);
?>