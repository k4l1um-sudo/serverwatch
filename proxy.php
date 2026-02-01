<?php
// Simple, whitelist-based proxy for fetching JSON status endpoints to avoid CORS issues.
// Deploy this via FTP to the same webroot as the static site.

// Allowed hostnames (only these endpoints will be proxied)
$allowed_hosts = [
    'status.epicgames.com',
    'netflix.statuspage.io',
    'status.netflix.com',
    'statuspage.io',
    'statuspage' // fallback token (not used directly)
];

header('Access-Control-Allow-Origin: *');
header('Vary: Origin');

if(!isset($_GET['url'])){
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error'=>'missing url parameter']);
    exit;
}

$url = $_GET['url'];

// basic validation: must be absolute https URL
$parts = parse_url($url);
if(!$parts || !isset($parts['scheme']) || strtolower($parts['scheme']) !== 'https' || !isset($parts['host'])){
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error'=>'invalid url']);
    exit;
}

$host = strtolower($parts['host']);
$ok = false;
foreach($allowed_hosts as $h){
    if(strpos($host, $h) !== false){ $ok = true; break; }
}
if(!$ok){
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error'=>'host not allowed']);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
curl_setopt($ch, CURLOPT_USERAGENT, 'serverwatch-proxy/1.0');

$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$ctype = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$err = curl_error($ch);
curl_close($ch);

if($resp === false || $code >= 400){
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error'=>'upstream_error','message'=>$err,'http_code'=>$code]);
    exit;
}

// Return upstream response as-is, but ensure JSON content type when possible.
if($ctype && stripos($ctype, 'application/json') !== false){
    header('Content-Type: application/json; charset=utf-8');
} else {
    header('Content-Type: application/json; charset=utf-8');
}

echo $resp;
exit;
