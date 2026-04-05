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
const DEFAULT_SHOP_IMAGE_PATH = 'assets/deinbild.png';

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
    $allowed = ['profile_image', 'xp_boost_perk', 'reallife_item', 'reward_item'];
    $value = trim((string)$value);
    if (in_array($value, $allowed, true)) {
        return $value;
    }
    return 'profile_image';
}

function sanitizeRewardUnlockConditionType($value) {
    $allowed = ['coins_purchase', 'quests_completed', 'level_up', 'reach_level'];
    $value = trim((string)$value);
    if (in_array($value, $allowed, true)) {
        return $value;
    }
    return 'coins_purchase';
}

function sanitizeRewardUnlockConditionValue($value) {
    if ($value === null || $value === '') {
        return null;
    }

    $num = (int)$value;
    if ($num < 1 || $num > 100000) {
        return null;
    }

    return $num;
}

function sanitizeNonNegativeInt($value) {
    if ($value === null || $value === '') {
        return null;
    }
    $num = (int)$value;
    if ($num < 0 || $num > 1000000) {
        return null;
    }
    return $num;
}

function sanitizeLevelInt($value) {
    if ($value === null || $value === '') {
        return null;
    }
    $num = (int)$value;
    if ($num < 1 || $num > 1000000) {
        return null;
    }
    return $num;
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

function nextItemId($items, $title, $type = 'profile_image') {
    $prefix = ($type === 'reward_item') ? 'belohnung_' : 'item_';
    $base = $prefix . slugifyTitle($title);
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
    $type = sanitizeItemType($body['type'] ?? 'profile_image');
    $image = sanitizeImagePath($body['image'] ?? '');
    $boostPercent = max(1, min(200, (int)($body['boostPercent'] ?? 5)));
    $boostQuests  = max(1, min(100, (int)($body['boostQuests'] ?? 5)));
    $unlockConditionType = sanitizeRewardUnlockConditionType($body['unlockConditionType'] ?? 'coins_purchase');
    $unlockConditionValue = sanitizeRewardUnlockConditionValue($body['unlockConditionValue'] ?? null);
    $unlockStartCompletedQuests = sanitizeNonNegativeInt($body['unlockStartCompletedQuests'] ?? 0);
    $unlockStartLevel = sanitizeLevelInt($body['unlockStartLevel'] ?? 1);

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($costCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coinwert (0 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if ($type === 'reward_item' && $unlockConditionType !== 'coins_purchase' && $unlockConditionValue === null) {
        respond(['ok' => false, 'error' => 'Bitte einen gueltigen Wert fuer die Belohnungs-Bedingung eingeben.'], 400);
    }
    if ($type === 'reward_item' && $unlockStartCompletedQuests === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Startwert fuer erledigte Quests.'], 400);
    }
    if ($type === 'reward_item' && $unlockStartLevel === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Startwert fuer Level.'], 400);
    }

    $finalCostCoins = ($type === 'reward_item' && $unlockConditionType !== 'coins_purchase') ? 0 : $costCoins;
    $finalImage = ($type === 'xp_boost_perk') ? '' : (string)($image !== '' ? $image : DEFAULT_SHOP_IMAGE_PATH);

    $newItem = [
        'id'          => nextItemId($db['items'], $title, $type),
        'title'       => $title,
        'description' => $description,
        'type'        => $type,
        'costCoins'   => $finalCostCoins,
        'image'       => $finalImage,
        'boostPercent' => ($type === 'xp_boost_perk') ? $boostPercent : null,
        'boostQuests'  => ($type === 'xp_boost_perk') ? $boostQuests  : null,
        'unlockConditionType' => ($type === 'reward_item') ? $unlockConditionType : 'coins_purchase',
        'unlockConditionValue' => ($type === 'reward_item' && $unlockConditionType !== 'coins_purchase') ? $unlockConditionValue : null,
        'unlockStartCompletedQuests' => ($type === 'reward_item') ? $unlockStartCompletedQuests : 0,
        'unlockStartLevel' => ($type === 'reward_item') ? $unlockStartLevel : 1,
        'active'      => true
    ];

    $db['items'][] = $newItem;
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    // System message for all players when a new reward item is created
    if ($type === 'reward_item') {
        $questDbFile = __DIR__ . '/../data/quest_db.json';
        if (file_exists($questDbFile)) {
            $qfp = fopen($questDbFile, 'c+');
            if ($qfp !== false && flock($qfp, LOCK_EX)) {
                $qraw = stream_get_contents($qfp);
                $qdb = json_decode($qraw ?: '{"players":{}}', true);
                if (is_array($qdb) && isset($qdb['players']) && is_array($qdb['players'])) {
                    if ($unlockConditionType === 'quests_completed') {
                        $conditionLabel = 'Bedingung: ' . (int)$unlockConditionValue . ' abgeschlossene Quests.';
                    } elseif ($unlockConditionType === 'level_up') {
                        $conditionLabel = 'Bedingung: ' . (int)$unlockConditionValue . ' Levelaufstiege.';
                    } elseif ($unlockConditionType === 'reach_level') {
                        $conditionLabel = 'Bedingung: Level ' . (int)$unlockConditionValue . ' erreichen.';
                    } else {
                        $conditionLabel = 'Kosten: ' . (int)$finalCostCoins . ' Coins.';
                    }
                    $msgText = 'Neue Belohnung verfuegbar: "' . $title . '". ' . $conditionLabel;
                    foreach ($qdb['players'] as $pid => &$qplayer) {
                        if (!is_array($qplayer)) {
                            continue;
                        }
                        if (!isset($qplayer['systemMessages']) || !is_array($qplayer['systemMessages'])) {
                            $qplayer['systemMessages'] = [];
                        }
                        $qplayer['systemMessages'][] = ['text' => $msgText, 'timestamp' => gmdate('c')];
                        if (count($qplayer['systemMessages']) > 5) {
                            $qplayer['systemMessages'] = array_values(array_slice($qplayer['systemMessages'], -5));
                        }
                    }
                    unset($qplayer);
                    ftruncate($qfp, 0);
                    rewind($qfp);
                    fwrite($qfp, json_encode($qdb, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
                }
                flock($qfp, LOCK_UN);
                fclose($qfp);
            }
        }
    }

    respond(['ok' => true, 'item' => $newItem, 'updatedAt' => $db['updatedAt']]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_item') {
    $itemId = sanitizeItemId($body['itemId'] ?? '');
    $title = sanitizeTitle($body['title'] ?? '');
    $description = sanitizeDescription($body['description'] ?? '');
    $costCoins = sanitizeCoins($body['costCoins'] ?? 0);
    $type = sanitizeItemType($body['type'] ?? 'profile_image');
    $image = sanitizeImagePath($body['image'] ?? '');
    $boostPercent = max(1, min(200, (int)($body['boostPercent'] ?? 5)));
    $boostQuests  = max(1, min(100, (int)($body['boostQuests'] ?? 5)));
    $unlockConditionType = sanitizeRewardUnlockConditionType($body['unlockConditionType'] ?? 'coins_purchase');
    $unlockConditionValue = sanitizeRewardUnlockConditionValue($body['unlockConditionValue'] ?? null);
    $unlockStartCompletedQuests = sanitizeNonNegativeInt($body['unlockStartCompletedQuests'] ?? null);
    $unlockStartLevel = sanitizeLevelInt($body['unlockStartLevel'] ?? null);

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

    $finalUnlockType = $unlockConditionType;
    $finalUnlockValue = $unlockConditionValue;

    if ($type === 'reward_item' && !array_key_exists('unlockConditionType', $body)) {
        $finalUnlockType = sanitizeRewardUnlockConditionType($existing['unlockConditionType'] ?? 'coins_purchase');
    }
    if ($type === 'reward_item' && !array_key_exists('unlockConditionValue', $body)) {
        $finalUnlockValue = sanitizeRewardUnlockConditionValue($existing['unlockConditionValue'] ?? null);
    }

    $finalUnlockStartCompletedQuests = sanitizeNonNegativeInt($existing['unlockStartCompletedQuests'] ?? 0);
    $finalUnlockStartLevel = sanitizeLevelInt($existing['unlockStartLevel'] ?? 1);

    if ($type === 'reward_item' && array_key_exists('unlockStartCompletedQuests', $body)) {
        $finalUnlockStartCompletedQuests = $unlockStartCompletedQuests;
    }
    if ($type === 'reward_item' && array_key_exists('unlockStartLevel', $body)) {
        $finalUnlockStartLevel = $unlockStartLevel;
    }

    if ($type === 'reward_item' && $finalUnlockType !== 'coins_purchase' && $finalUnlockValue === null) {
        respond(['ok' => false, 'error' => 'Bitte einen gueltigen Wert fuer die Belohnungs-Bedingung eingeben.'], 400);
    }
    if ($type === 'reward_item' && $finalUnlockStartCompletedQuests === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Startwert fuer erledigte Quests.'], 400);
    }
    if ($type === 'reward_item' && $finalUnlockStartLevel === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Startwert fuer Level.'], 400);
    }

    $finalCostCoins = ($type === 'reward_item' && $finalUnlockType !== 'coins_purchase') ? 0 : $costCoins;
    $finalImage = ($type === 'xp_boost_perk') ? '' : (string)($image !== '' ? $image : DEFAULT_SHOP_IMAGE_PATH);

    $db['items'][$idx] = array_merge($existing, [
        'id'          => $existing['id'] ?? $itemId,
        'title'       => $title,
        'description' => $description,
        'type'        => $type,
        'costCoins'   => $finalCostCoins,
        'image'       => $finalImage,
        'boostPercent' => ($type === 'xp_boost_perk') ? $boostPercent : null,
        'boostQuests'  => ($type === 'xp_boost_perk') ? $boostQuests  : null,
        'unlockConditionType' => ($type === 'reward_item') ? $finalUnlockType : 'coins_purchase',
        'unlockConditionValue' => ($type === 'reward_item' && $finalUnlockType !== 'coins_purchase') ? $finalUnlockValue : null,
        'unlockStartCompletedQuests' => ($type === 'reward_item') ? $finalUnlockStartCompletedQuests : 0,
        'unlockStartLevel' => ($type === 'reward_item') ? $finalUnlockStartLevel : 1,
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
