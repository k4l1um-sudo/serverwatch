<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$catalogFile = __DIR__ . '/../data/achievement_items.json';

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

function sanitizeTarget($value) {
    if ($value === null || $value === '') {
        return null;
    }

    $target = (int)$value;
    if ($target < 1 || $target > 100000) {
        return null;
    }

    return $target;
}

function sanitizeImage($value) {
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
        $slug = 'achievement';
    }
    return $slug;
}

function nextItemId($items, $title, $target) {
    $base = 'ach_' . slugifyTitle($title) . '_' . (int)$target;
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

function hasTargetConflict($items, $target, $ignoreItemId = null) {
    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $itemId = (string)($item['id'] ?? '');
        if ($ignoreItemId !== null && $itemId === (string)$ignoreItemId) {
            continue;
        }

        if ((int)($item['target'] ?? 0) === (int)$target) {
            return true;
        }
    }
    return false;
}

if (!file_exists($catalogFile)) {
    respond([
        'ok' => false,
        'error' => 'Achievement-Katalog nicht gefunden.',
        'path' => 'data/achievement_items.json'
    ], 404);
}

$raw = file_get_contents($catalogFile);
$db = json_decode($raw, true);

if (!is_array($db) || !isset($db['items']) || !is_array($db['items'])) {
    respond([
        'ok' => false,
        'error' => 'Achievement-Katalog ist ungueltig formatiert.',
        'path' => 'data/achievement_items.json'
    ], 500);
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'list');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create_item') {
    $title = sanitizeTitle($body['title'] ?? '');
    $target = sanitizeTarget($body['target'] ?? null);
    $image = sanitizeImage($body['image'] ?? '');

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($target === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Meilenstein (1 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if (hasTargetConflict($db['items'], $target)) {
        respond(['ok' => false, 'error' => 'Fuer diesen Meilenstein existiert bereits ein Achievement.'], 409);
    }

    $newItem = [
        'id' => nextItemId($db['items'], $title, $target),
        'title' => $title,
        'target' => $target,
        'image' => $image,
        'active' => true
    ];

    $db['items'][] = $newItem;
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'item' => $newItem, 'updatedAt' => $db['updatedAt']]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_item') {
    $itemId = sanitizeItemId($body['itemId'] ?? '');
    $title = sanitizeTitle($body['title'] ?? '');
    $target = sanitizeTarget($body['target'] ?? null);
    $image = sanitizeImage($body['image'] ?? '');

    if ($itemId === null) {
        respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
    }
    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($target === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Meilenstein (1 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if (hasTargetConflict($db['items'], $target, $itemId)) {
        respond(['ok' => false, 'error' => 'Fuer diesen Meilenstein existiert bereits ein Achievement.'], 409);
    }

    $idx = findItemIndexById($db['items'], $itemId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Achievement nicht gefunden.'], 404);
    }

    $existing = is_array($db['items'][$idx]) ? $db['items'][$idx] : [];
    $db['items'][$idx] = array_merge($existing, [
        'id' => $existing['id'] ?? $itemId,
        'title' => $title,
        'target' => $target,
        'image' => $image,
        'active' => true
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
        respond(['ok' => false, 'error' => 'Achievement nicht gefunden.'], 404);
    }

    array_splice($db['items'], $idx, 1);
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'updatedAt' => $db['updatedAt']]);
}

$items = array_values(array_filter($db['items'], function ($item) {
    return is_array($item) && (!isset($item['active']) || $item['active'] === true);
}));

usort($items, function ($a, $b) {
    $aTarget = (int)($a['target'] ?? 0);
    $bTarget = (int)($b['target'] ?? 0);
    if ($aTarget !== $bTarget) {
        return $aTarget <=> $bTarget;
    }
    return strcmp((string)($a['title'] ?? ''), (string)($b['title'] ?? ''));
});

respond([
    'ok' => true,
    'version' => $db['version'] ?? 1,
    'updatedAt' => $db['updatedAt'] ?? null,
    'items' => $items
]);
