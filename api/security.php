<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

const DEFAULT_CHILD_PASSWORD = 'DortMund1.0';
const DEFAULT_PARENT_PIN = '24112013';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$settingsPath = __DIR__ . '/../data/security_settings.json';
$settingsDir = dirname($settingsPath);
if (!is_dir($settingsDir)) {
    mkdir($settingsDir, 0775, true);
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

function loadSettings($path) {
    if (!file_exists($path)) {
        return [
            'childPassword' => DEFAULT_CHILD_PASSWORD,
            'parentPin' => DEFAULT_PARENT_PIN
        ];
    }

    $raw = file_get_contents($path);
    $db = json_decode($raw, true);
    if (!is_array($db)) {
        return [
            'childPassword' => DEFAULT_CHILD_PASSWORD,
            'parentPin' => DEFAULT_PARENT_PIN
        ];
    }

    $childPassword = isset($db['childPassword']) ? (string)$db['childPassword'] : DEFAULT_CHILD_PASSWORD;
    $parentPin = isset($db['parentPin']) ? (string)$db['parentPin'] : DEFAULT_PARENT_PIN;
    if ($childPassword === '') {
        $childPassword = DEFAULT_CHILD_PASSWORD;
    }
    if ($parentPin === '') {
        $parentPin = DEFAULT_PARENT_PIN;
    }

    return [
        'childPassword' => $childPassword,
        'parentPin' => $parentPin
    ];
}

function writeSettings($path, $settings) {
    file_put_contents($path, json_encode($settings, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

function sanitizePassword($value) {
    $value = trim((string)$value);
    if ($value === '' || strlen($value) < 4 || strlen($value) > 64) {
        return null;
    }
    return $value;
}

function sanitizePin($value) {
    $value = trim((string)$value);
    if (!preg_match('/^[0-9]{4,10}$/', $value)) {
        return null;
    }
    return $value;
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'verify_access');
$settings = loadSettings($settingsPath);

if ($action === 'verify_access') {
    $area = (string)($body['area'] ?? '');
    $secret = (string)($body['secret'] ?? '');

    if ($area === 'child') {
        respond(['ok' => true, 'allowed' => hash_equals((string)$settings['childPassword'], $secret)]);
    }

    if ($area === 'parent') {
        respond(['ok' => true, 'allowed' => hash_equals((string)$settings['parentPin'], $secret)]);
    }

    respond(['ok' => false, 'error' => 'Ungueltiger Bereich.'], 400);
}

if ($action === 'update_passwords') {
    $currentParentPin = (string)($body['currentParentPin'] ?? '');
    if (!hash_equals((string)$settings['parentPin'], $currentParentPin)) {
        respond(['ok' => false, 'error' => 'Aktueller Eltern-PIN ist falsch.'], 403);
    }

    $newChildPassword = sanitizePassword($body['newChildPassword'] ?? '');
    $newParentPin = sanitizePin($body['newParentPin'] ?? '');

    if ($newChildPassword === null) {
        respond(['ok' => false, 'error' => 'Kind-Passwort muss 4 bis 64 Zeichen lang sein.'], 400);
    }
    if ($newParentPin === null) {
        respond(['ok' => false, 'error' => 'Eltern-PIN muss 4 bis 10 Ziffern enthalten.'], 400);
    }

    $settings = [
        'childPassword' => $newChildPassword,
        'parentPin' => $newParentPin,
        'updatedAt' => gmdate('c')
    ];
    writeSettings($settingsPath, $settings);

    respond(['ok' => true]);
}

if ($action === 'update_child_password') {
    $currentParentPin = (string)($body['currentParentPin'] ?? '');
    if (!hash_equals((string)$settings['parentPin'], $currentParentPin)) {
        respond(['ok' => false, 'error' => 'Aktueller Eltern-PIN ist falsch.'], 403);
    }

    $newChildPassword = sanitizePassword($body['newChildPassword'] ?? '');
    if ($newChildPassword === null) {
        respond(['ok' => false, 'error' => 'Kinderpasswort muss 4 bis 64 Zeichen lang sein.'], 400);
    }

    $settings['childPassword'] = $newChildPassword;
    $settings['updatedAt'] = gmdate('c');
    writeSettings($settingsPath, $settings);

    respond(['ok' => true]);
}

if ($action === 'update_parent_pin') {
    $currentParentPin = (string)($body['currentParentPin'] ?? '');
    if (!hash_equals((string)$settings['parentPin'], $currentParentPin)) {
        respond(['ok' => false, 'error' => 'Aktueller Eltern-PIN ist falsch.'], 403);
    }

    $newParentPin = sanitizePin($body['newParentPin'] ?? '');
    if ($newParentPin === null) {
        respond(['ok' => false, 'error' => 'Eltern-PIN muss 4 bis 10 Ziffern enthalten.'], 400);
    }

    $settings['parentPin'] = $newParentPin;
    $settings['updatedAt'] = gmdate('c');
    writeSettings($settingsPath, $settings);

    respond(['ok' => true]);
}

if ($action === 'get_settings_info') {
    respond([
        'ok' => true,
        'hasCustomSettings' => file_exists($settingsPath),
        'updatedAt' => $settings['updatedAt'] ?? null
    ]);
}

respond(['ok' => false, 'error' => 'Ungueltige Aktion.'], 400);
