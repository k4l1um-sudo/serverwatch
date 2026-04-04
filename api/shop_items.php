<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$catalogFile = __DIR__ . '/../data/shop_items.json';

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

function sanitizeTitle($value) {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > 120) {
        return null;
    }
    return $value;
}

function sanitizeDescription($value) {
    $value = trim((string)$value);
    if (mb_strlen($value) > 500) {
        return null;
    }
    return $value;
}

function sanitizeCoins($value) {
    $coins = (int)$value;
    if ($coins < 0 || $coins > 100000) {
        return null;
    }
    return $coins;
}

function sanitizeItemType($value) {
    $allowed = ['profile_image', 'xp_boost_perk', 'reallife_item'];
    $value = trim((string)$value);
    if (in_array($value, $allowed, true)) {
        return $value;
    }
    return 'reallife_item';
}

function sanitizeImagePath($value) {
    $value = trim((string)$value);
    if (mb_strlen($value) > 300) {
        return null;
    }
    return $value;
}

function sanitizeItemId($value) {
    $value = trim((string)$value);
    if ($value === '' || !preg_match('/^[a-zA-Z0-9_-]{2,120}$/', $value)) {
        return null;
    }
    return $value;
}

function slugifyTitle($title) {
    $slug = mb_strtolower(trim((string)$title));
    $slug = preg_replace('/[^a-z0-9]+/u', '_', $slug);
    $slug = trim((string)$slug, '_');
    if ($slug === '') {
        $slug = 'item';
    }
    return $slug;
}

function nextItemId($items, $title) {
    $base = 'item_' . slugifyTitle($title);
    $candidate = $base;
    $counter = 2;

    $used = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }
        $used[(string)($item['id'] ?? '')] = true;
    }

    while (isset($used[$candidate])) {
        $candidate = $base . '_' . $counter;
        $counter++;
    }

    return $candidate;
}

function findItemIndexById($items, $itemId) {
    foreach ($items as $index => $item) {
        if (!is_array($item)) {
            continue;
        }
        if ((string)($item['id'] ?? '') === (string)$itemId) {
            return $index;
        }
    }
    return -1;
}

if (!file_exists($catalogFile)) {
    respond([
        'ok' => false,
        'error' => 'Shop-Katalog nicht gefunden.',
        'path' => 'data/shop_items.json'
    ], 404);
}

$raw = file_get_contents($catalogFile);
$db = json_decode($raw, true);

if (!is_array($db) || !isset($db['items']) || !is_array($db['items'])) {
    respond([
        'ok' => false,
        'error' => 'Shop-Katalog ist ungueltig formatiert.',
        'path' => 'data/shop_items.json'
    ], 500);
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'list');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create_item') {
    $title = sanitizeTitle($body['title'] ?? '');
    $description = sanitizeDescription($body['description'] ?? '');
    $costCoins = sanitizeCoins($body['costCoins'] ?? 0);
    $type = sanitizeItemType($body['type'] ?? 'reallife_item');
    $image = sanitizeImagePath($body['image'] ?? '');
    $boostPercent = max(1, min(200, (int)($body['boostPercent'] ?? 5)));
    $boostQuests  = max(1, min(100, (int)($body['boostQuests'] ?? 5)));

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($costCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coinwert (0 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }

    $newItem = [
        'id'          => nextItemId($db['items'], $title),
        'title'       => $title,
        'description' => $description,
        'type'        => $type,
        'costCoins'   => $costCoins,
        'image'       => ($type === 'profile_image') ? (string)$image : '',
        'boostPercent' => ($type === 'xp_boost_perk') ? $boostPercent : null,
        'boostQuests'  => ($type === 'xp_boost_perk') ? $boostQuests  : null,
        'active'      => true
    ];

    $db['items'][] = $newItem;
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'item' => $newItem, 'updatedAt' => $db['updatedAt']]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_item') {
    $itemId = sanitizeItemId($body['itemId'] ?? '');
    $title = sanitizeTitle($body['title'] ?? '');
    $description = sanitizeDescription($body['description'] ?? '');
    $costCoins = sanitizeCoins($body['costCoins'] ?? 0);
    $type = sanitizeItemType($body['type'] ?? 'reallife_item');
    $image = sanitizeImagePath($body['image'] ?? '');
    $boostPercent = max(1, min(200, (int)($body['boostPercent'] ?? 5)));
    $boostQuests  = max(1, min(100, (int)($body['boostQuests'] ?? 5)));

    if ($itemId === null) {
        respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
    }
    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($costCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coinwert (0 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }

    $idx = findItemIndexById($db['items'], $itemId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Item nicht gefunden.'], 404);
    }

    $existing = is_array($db['items'][$idx]) ? $db['items'][$idx] : [];
    $db['items'][$idx] = array_merge($existing, [
        'id'          => $existing['id'] ?? $itemId,
        'title'       => $title,
        'description' => $description,
        'type'        => $type,
        'costCoins'   => $costCoins,
        'image'       => ($type === 'profile_image') ? (string)$image : '',
        'boostPercent' => ($type === 'xp_boost_perk') ? $boostPercent : null,
        'boostQuests'  => ($type === 'xp_boost_perk') ? $boostQuests  : null,
        'active'      => true
    ]);

    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'item' => $db['items'][$idx], 'updatedAt' => $db['updatedAt']]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete_item') {
    $itemId = sanitizeItemId($body['itemId'] ?? '');
    if ($itemId === null) {
        respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
    }

    $idx = findItemIndexById($db['items'], $itemId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Item nicht gefunden.'], 404);
    }

    array_splice($db['items'], $idx, 1);
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'updatedAt' => $db['updatedAt']]);
}

$items = array_values(array_filter($db['items'], function ($item) {
    return is_array($item) && (!isset($item['active']) || $item['active'] === true);
}));

respond([
    'ok' => true,
    'version' => $db['version'] ?? 1,
    'updatedAt' => $db['updatedAt'] ?? null,
    'items' => $items
]);
