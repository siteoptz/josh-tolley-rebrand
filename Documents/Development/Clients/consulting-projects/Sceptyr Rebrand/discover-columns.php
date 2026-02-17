<?php
// Discover Monday.com column IDs
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit();
}

$api_token = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjYxODExMjQ1OSwiYWFpIjoxMSwidWlkIjo5OTA1NDE2MiwiaWFkIjoiMjAyNi0wMi0wNlQxNzoxOToxOC44NTZaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6OTgyMzU5MCwicmduIjoidXNlMSJ9.8r21EvMe8R2_9gPw6uq9-3FmyCIj0IYGjlhRHBSLRQk';

// Query to get board columns
$query = 'query {
  boards(ids: [18397890327]) {
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
    CURLOPT_TIMEOUT => 10
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response && $http_code === 200) {
    $result = json_decode($response, true);
    echo json_encode([
        'success' => true,
        'columns' => $result['data']['boards'][0]['columns'] ?? [],
        'raw_response' => $result
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode([
        'success' => false,
        'error' => "HTTP $http_code",
        'response' => $response
    ], JSON_PRETTY_PRINT);
}
?>