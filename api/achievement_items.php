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

function sanitizeConditionType($value) {
    $allowed = ['quest_ids', 'reach_level', 'reward_ids'];
    $value = trim((string)$value);
    if (in_array($value, $allowed, true)) {
        return $value;
    }
    return 'quest_ids';
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

function sanitizeIdArray($value) {
    if ($value === null || $value === '') {
        return [];
    }

    if (!is_array($value)) {
        return null;
    }

    $ids = [];
    foreach ($value as $entry) {
        $id = trim((string)$entry);
        if ($id === '') {
            continue;
        }
        if (!preg_match('/^[a-zA-Z0-9_-]{1,120}$/', $id)) {
            return null;
        }
        $ids[$id] = true;
    }

    return array_values(array_keys($ids));
}

function sanitizeImage($value) {
    $value = trim((string)$value);
    if (mb_strlen($value) > 300) {
        return null;
    }
    return $value;
}

function sanitizeRewardTitle($value) {
    $value = trim((string)$value);
    if ($value === '') {
        return '';
    }
    if (mb_strlen($value) > 40) {
        return null;
    }
    if (!preg_match('/^[\p{L}0-9 _\-]+$/u', $value)) {
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

function isSystemAchievementItem($item) {
    if (!is_array($item)) {
        return false;
    }

    if (array_key_exists('systemManaged', $item)) {
        return $item['systemManaged'] === true;
    }

    return isset($item['target']) && !isset($item['unlockConditionType']);
}

function normalizeAchievementItem($item) {
    if (!is_array($item)) {
        return null;
    }

    $systemManaged = isSystemAchievementItem($item);
    $normalized = [
        'id' => (string)($item['id'] ?? ''),
        'title' => (string)($item['title'] ?? ''),
        'image' => (string)($item['image'] ?? ''),
        'active' => !isset($item['active']) || $item['active'] === true,
        'systemManaged' => $systemManaged
    ];

    if ($systemManaged) {
        $normalized['target'] = (int)($item['target'] ?? 0);
        return $normalized;
    }

    $normalized['unlockConditionType'] = sanitizeConditionType($item['unlockConditionType'] ?? 'quest_ids');
    $normalized['unlockConditionValue'] = sanitizeTarget($item['unlockConditionValue'] ?? null);
    $normalized['unlockConditionQuestIds'] = sanitizeIdArray($item['unlockConditionQuestIds'] ?? []);
    $normalized['unlockConditionRewardIds'] = sanitizeIdArray($item['unlockConditionRewardIds'] ?? []);
    $normalized['titleReward'] = sanitizeRewardTitle($item['titleReward'] ?? '') ?? '';
    return $normalized;
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

function nextItemId($items, $title, $suffix = 'custom') {
    $base = 'ach_' . slugifyTitle($title) . '_' . $suffix;
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
        $normalized = normalizeAchievementItem($item);
        if (!is_array($normalized) || !$normalized['systemManaged']) {
            continue;
        }

        $itemId = (string)($normalized['id'] ?? '');
        if ($ignoreItemId !== null && $itemId === (string)$ignoreItemId) {
            continue;
        }

        if ((int)($normalized['target'] ?? 0) === (int)$target) {
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
    $image = sanitizeImage($body['image'] ?? '');
    $conditionType = sanitizeConditionType($body['unlockConditionType'] ?? 'quest_ids');
    $conditionValue = sanitizeTarget($body['unlockConditionValue'] ?? null);
    $conditionQuestIds = sanitizeIdArray($body['unlockConditionQuestIds'] ?? []);
    $conditionRewardIds = sanitizeIdArray($body['unlockConditionRewardIds'] ?? []);
    $titleReward = sanitizeRewardTitle($body['titleReward'] ?? '');

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if ($titleReward === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel fuer die Belohnung.'], 400);
    }
    if ($conditionQuestIds === null || $conditionRewardIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Voraussetzungen.'], 400);
    }
    if ($conditionType === 'reach_level' && $conditionValue === null) {
        respond(['ok' => false, 'error' => 'Bitte ein gueltiges Level-Ziel eingeben.'], 400);
    }
    if ($conditionType === 'quest_ids' && count($conditionQuestIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Quest als Voraussetzung angeben.'], 400);
    }
    if ($conditionType === 'reward_ids' && count($conditionRewardIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Belohnung als Voraussetzung angeben.'], 400);
    }

    $newItem = [
        'id' => nextItemId($db['items'], $title, 'custom'),
        'title' => $title,
        'image' => $image,
        'systemManaged' => false,
        'unlockConditionType' => $conditionType,
        'unlockConditionValue' => $conditionType === 'reach_level' ? $conditionValue : null,
        'unlockConditionQuestIds' => $conditionType === 'quest_ids' ? $conditionQuestIds : [],
        'unlockConditionRewardIds' => $conditionType === 'reward_ids' ? $conditionRewardIds : [],
        'titleReward' => $titleReward,
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
    $image = sanitizeImage($body['image'] ?? '');
    $conditionType = sanitizeConditionType($body['unlockConditionType'] ?? 'quest_ids');
    $conditionValue = sanitizeTarget($body['unlockConditionValue'] ?? null);
    $conditionQuestIds = sanitizeIdArray($body['unlockConditionQuestIds'] ?? []);
    $conditionRewardIds = sanitizeIdArray($body['unlockConditionRewardIds'] ?? []);
    $titleReward = sanitizeRewardTitle($body['titleReward'] ?? '');

    if ($itemId === null) {
        respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
    }
    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if ($titleReward === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel fuer die Belohnung.'], 400);
    }
    if ($conditionQuestIds === null || $conditionRewardIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Voraussetzungen.'], 400);
    }
    if ($conditionType === 'reach_level' && $conditionValue === null) {
        respond(['ok' => false, 'error' => 'Bitte ein gueltiges Level-Ziel eingeben.'], 400);
    }
    if ($conditionType === 'quest_ids' && count($conditionQuestIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Quest als Voraussetzung angeben.'], 400);
    }
    if ($conditionType === 'reward_ids' && count($conditionRewardIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Belohnung als Voraussetzung angeben.'], 400);
    }

    $idx = findItemIndexById($db['items'], $itemId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Achievement nicht gefunden.'], 404);
    }

    $existing = is_array($db['items'][$idx]) ? $db['items'][$idx] : [];
    if (isSystemAchievementItem($existing)) {
        respond(['ok' => false, 'error' => 'System-Achievements koennen nicht bearbeitet werden.'], 409);
    }

    $db['items'][$idx] = array_merge($existing, [
        'id' => $existing['id'] ?? $itemId,
        'title' => $title,
        'image' => $image,
        'systemManaged' => false,
        'unlockConditionType' => $conditionType,
        'unlockConditionValue' => $conditionType === 'reach_level' ? $conditionValue : null,
        'unlockConditionQuestIds' => $conditionType === 'quest_ids' ? $conditionQuestIds : [],
        'unlockConditionRewardIds' => $conditionType === 'reward_ids' ? $conditionRewardIds : [],
        'titleReward' => $titleReward,
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

    if (isSystemAchievementItem($db['items'][$idx])) {
        respond(['ok' => false, 'error' => 'System-Achievements koennen nicht geloescht werden.'], 409);
    }

    array_splice($db['items'], $idx, 1);
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond(['ok' => true, 'updatedAt' => $db['updatedAt']]);
}


$items = array_values(array_filter(array_map('normalizeAchievementItem', $db['items']), function ($item) {
    return is_array($item) && (!isset($item['active']) || $item['active'] === true);
}));

usort($items, function ($a, $b) {
    $aSystem = !empty($a['systemManaged']) ? 1 : 0;
    $bSystem = !empty($b['systemManaged']) ? 1 : 0;
    if ($aSystem !== $bSystem) {
        return $bSystem <=> $aSystem;
    }
    $aTarget = (int)($a['target'] ?? 0);
    $bTarget = (int)($b['target'] ?? 0);
    if ($aSystem === 1 && $aTarget !== $bTarget) {
        return $aTarget <=> $bTarget;
    }
    return strcmp((string)($a['title'] ?? ''), (string)($b['title'] ?? ''));
});

$systemItems = array_values(array_filter($items, function ($item) {
    return !empty($item['systemManaged']);
}));

$customItems = array_values(array_filter($items, function ($item) {
    return empty($item['systemManaged']);
}));

respond([
    'ok' => true,
    'version' => $db['version'] ?? 1,
    'updatedAt' => $db['updatedAt'] ?? null,
    'items' => $items,
    'systemItems' => $systemItems,
    'customItems' => $customItems
]);
