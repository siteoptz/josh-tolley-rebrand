<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Test database connection with different possible configurations
$test_configs = [
    [
        'host' => 'localhost',
        'name' => 'dom1042827',
        'user' => 'dom1042827',
        'pass' => 'Kk!83929'
    ],
    [
        'host' => '127.0.0.1',
        'name' => 'dom1042827',
        'user' => 'dom1042827',
        'pass' => 'Kk!83929'
    ]
];

foreach ($test_configs as $i => $config) {
    try {
        $pdo = new PDO(
            "mysql:host={$config['host']};dbname={$config['name']};charset=utf8mb4",
            $config['user'],
            $config['pass'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        
        // Test if table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'sceptyr_form_submissions'");
        $table_exists = $stmt->rowCount() > 0;
        
        echo json_encode([
            'config' => $i + 1,
            'status' => 'success',
            'host' => $config['host'],
            'database' => $config['name'],
            'table_exists' => $table_exists
        ]);
        exit();
        
    } catch (PDOException $e) {
        // Try next config
        continue;
    }
}

// If we get here, all configs failed
echo json_encode([
    'status' => 'all_failed',
    'message' => 'Could not connect with any configuration'
]);
?>