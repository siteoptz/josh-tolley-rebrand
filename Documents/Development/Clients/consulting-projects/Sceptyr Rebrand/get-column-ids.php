<?php
// Get Monday.com column IDs
header('Content-Type: application/json');

$api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';

// Query to get all boards accessible to this token
$query = 'query { 
  me { 
    account { 
      id
      name
    }
  }
  boards { 
    id 
    name 
    columns { 
      id 
      title 
      type 
    } 
  } 
}';

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
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($response && $http_code === 200) {
    $result = json_decode($response, true);
    
    echo json_encode([
        'success' => true,
        'account' => $result['data']['me']['account'] ?? null,
        'boards' => $result['data']['boards'] ?? [],
        'board_count' => count($result['data']['boards'] ?? []),
        'target_board' => '18397890327'
    ], JSON_PRETTY_PRINT);
    
} else {
    echo json_encode([
        'success' => false,
        'http_code' => $http_code,
        'error' => $error,
        'response' => $response
    ], JSON_PRETTY_PRINT);
}
?>