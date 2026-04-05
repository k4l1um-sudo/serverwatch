<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/../data';
$storageFile = $storageDir . '/maintenance.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

if (!file_exists($storageFile)) {
    file_put_contents($storageFile, json_encode(['enabled' => false], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function respond($payload, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function readBody() {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $json = json_decode($raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($json)) {
        return $json;
    }

    return [];
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'get');

$fp = fopen($storageFile, 'c+');
if (!$fp) {
    respond(['ok' => false, 'error' => 'Wartungsstatus konnte nicht geoeffnet werden.'], 500);
}

if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    respond(['ok' => false, 'error' => 'Wartungsstatus ist gesperrt.'], 500);
}

rewind($fp);
$raw = stream_get_contents($fp);
$db = json_decode($raw ?: '', true);
if (!is_array($db)) {
    $db = ['enabled' => false];
}

$enabled = !empty($db['enabled']);

if ($action === 'set') {
    $newEnabled = filter_var($body['enabled'] ?? null, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($newEnabled === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Ungueltiger enabled-Wert.'], 400);
    }

    $db['enabled'] = (bool)$newEnabled;
    $enabled = (bool)$db['enabled'];

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
}

flock($fp, LOCK_UN);
fclose($fp);

respond(['ok' => true, 'enabled' => $enabled]);
