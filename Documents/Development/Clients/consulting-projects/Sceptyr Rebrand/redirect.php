<?php
// Simple redirect to www version
$target = 'https://www.sceptyr.com' . $_SERVER['REQUEST_URI'];
header("Location: $target", true, 301);
exit();
?>