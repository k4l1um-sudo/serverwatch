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
    $allowed = ['coins_purchase', 'quests_completed', 'level_up', 'reach_level', 'quest_ids', 'reward_ids'];
    $value = trim((string)$value);
    if (in_array($value, $allowed, true)) {
        return $value;
    }
    return 'coins_purchase';
}

function sanitizeRewardUnlockConditionQuestIds($value) {
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

function sanitizeRewardUnlockConditionRewardIds($value) {
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
        if (!preg_match('/^[a-zA-Z0-9_-]{2,120}$/', $id)) {
            return null;
        }
        $ids[$id] = true;
    }

    return array_values(array_keys($ids));
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

function sanitizeClaimRewardXp($value) {
    if ($value === null || $value === '') {
        return 0;
    }
    $xp = (int)$value;
    if ($xp < 0 || $xp > 1000000) {
        return null;
    }
    return $xp;
}

function sanitizeClaimRewardTitle($value) {
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

function migrateLegacyRewardItems(&$db) {
    if (!is_array($db) || !isset($db['items']) || !is_array($db['items'])) {
        return ['migrated' => 0, 'items' => []];
    }

    $migratedCount = 0;
    $migratedItems = [];

    foreach ($db['items'] as &$item) {
        if (!is_array($item)) {
            continue;
        }

        $type = (string)($item['type'] ?? '');
        $conditionType = sanitizeRewardUnlockConditionType($item['unlockConditionType'] ?? 'coins_purchase');

        if ($type !== 'reward_item' || $conditionType !== 'coins_purchase') {
            continue;
        }

        $startLevel = max(1, (int)($item['unlockStartLevel'] ?? 1));
        $existingValue = (int)($item['unlockConditionValue'] ?? 0);
        $legacyCost = max(0, (int)($item['costCoins'] ?? 0));

        // Legacy Coins-Belohnungen werden auf absolute Level-Ziele umgestellt.
        $derivedFromCost = max(2, (int)ceil($legacyCost / 200));
        $targetLevel = max($startLevel + 1, $existingValue, $derivedFromCost);

        $item['unlockConditionType'] = 'reach_level';
        $item['unlockConditionValue'] = $targetLevel;
        $item['unlockConditionQuestIds'] = [];
        $item['unlockConditionRewardIds'] = [];
        $item['costCoins'] = 0;

        $migratedCount++;
        $migratedItems[] = [
            'id' => (string)($item['id'] ?? ''),
            'title' => (string)($item['title'] ?? ''),
            'newConditionType' => 'reach_level',
            'newConditionValue' => $targetLevel
        ];
    }
    unset($item);

    return ['migrated' => $migratedCount, 'items' => $migratedItems];
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
    $unlockConditionQuestIds = sanitizeRewardUnlockConditionQuestIds($body['unlockConditionQuestIds'] ?? []);
    $unlockConditionRewardIds = sanitizeRewardUnlockConditionRewardIds($body['unlockConditionRewardIds'] ?? []);
    $unlockStartCompletedQuests = sanitizeNonNegativeInt($body['unlockStartCompletedQuests'] ?? 0);
    $unlockStartLevel = sanitizeLevelInt($body['unlockStartLevel'] ?? 1);
    $claimRewardXp = sanitizeClaimRewardXp($body['claimRewardXp'] ?? 0);
    $claimRewardCoins = sanitizeCoins($body['claimRewardCoins'] ?? 0);
    $claimRewardTitle = sanitizeClaimRewardTitle($body['claimRewardTitle'] ?? '');

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($costCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coinwert (0 bis 100000).'], 400);
    }
    if ($image === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Bildpfad.'], 400);
    }
    if ($unlockConditionQuestIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Quest-Liste fuer Belohnungs-Bedingung.'], 400);
    }
    if ($unlockConditionRewardIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Belohnungs-Liste fuer Belohnungs-Bedingung.'], 400);
    }
    if ($claimRewardXp === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger EP-Preis beim Einloesen (0 bis 1000000).'], 400);
    }
    if ($claimRewardCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coin-Preis beim Einloesen (0 bis 100000).'], 400);
    }
    if ($claimRewardTitle === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Spielertitel beim Einloesen.'], 400);
    }
    if ($type === 'reward_item' && $unlockConditionType !== 'coins_purchase' && $unlockConditionValue === null) {
        if ($unlockConditionType !== 'quest_ids' && $unlockConditionType !== 'reward_ids') {
            respond(['ok' => false, 'error' => 'Bitte einen gueltigen Wert fuer die Belohnungs-Bedingung eingeben.'], 400);
        }
    }
    if ($type === 'reward_item' && $unlockConditionType === 'quest_ids' && count($unlockConditionQuestIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Quest-Bedingung angeben.'], 400);
    }
    if ($type === 'reward_item' && $unlockConditionType === 'reward_ids' && count($unlockConditionRewardIds) === 0) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Belohnungs-Bedingung angeben.'], 400);
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
        'unlockConditionQuestIds' => ($type === 'reward_item' && $unlockConditionType === 'quest_ids') ? $unlockConditionQuestIds : [],
        'unlockConditionRewardIds' => ($type === 'reward_item' && $unlockConditionType === 'reward_ids') ? $unlockConditionRewardIds : [],
        'unlockStartCompletedQuests' => ($type === 'reward_item') ? $unlockStartCompletedQuests : 0,
        'unlockStartLevel' => ($type === 'reward_item') ? $unlockStartLevel : 1,
        'claimRewardXp' => ($type === 'reward_item') ? $claimRewardXp : 0,
        'claimRewardCoins' => ($type === 'reward_item') ? $claimRewardCoins : 0,
        'claimRewardTitle' => ($type === 'reward_item') ? $claimRewardTitle : '',
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
                    } elseif ($unlockConditionType === 'quest_ids') {
                        $conditionLabel = 'Bedingung: ' . count($unlockConditionQuestIds) . ' bestimmte Quest(s) erledigen.';
                    } elseif ($unlockConditionType === 'reward_ids') {
                        $conditionLabel = 'Bedingung: ' . count($unlockConditionRewardIds) . ' bestimmte Belohnung(en) besitzen.';
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
    $unlockConditionQuestIds = sanitizeRewardUnlockConditionQuestIds($body['unlockConditionQuestIds'] ?? []);
    $unlockConditionRewardIds = sanitizeRewardUnlockConditionRewardIds($body['unlockConditionRewardIds'] ?? []);
    $unlockStartCompletedQuests = sanitizeNonNegativeInt($body['unlockStartCompletedQuests'] ?? null);
    $unlockStartLevel = sanitizeLevelInt($body['unlockStartLevel'] ?? null);
    $claimRewardXp = sanitizeClaimRewardXp($body['claimRewardXp'] ?? null);
    $claimRewardCoins = sanitizeCoins($body['claimRewardCoins'] ?? null);
    $claimRewardTitle = sanitizeClaimRewardTitle($body['claimRewardTitle'] ?? null);

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
    if ($unlockConditionQuestIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Quest-Liste fuer Belohnungs-Bedingung.'], 400);
    }
    if ($unlockConditionRewardIds === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Belohnungs-Liste fuer Belohnungs-Bedingung.'], 400);
    }
    if ($claimRewardXp === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger EP-Preis beim Einloesen (0 bis 1000000).'], 400);
    }
    if ($claimRewardCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Coin-Preis beim Einloesen (0 bis 100000).'], 400);
    }
    if ($claimRewardTitle === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Spielertitel beim Einloesen.'], 400);
    }

    $idx = findItemIndexById($db['items'], $itemId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Item nicht gefunden.'], 404);
    }

    $existing = is_array($db['items'][$idx]) ? $db['items'][$idx] : [];

    $finalUnlockType = $unlockConditionType;
    $finalUnlockValue = $unlockConditionValue;
    $finalUnlockQuestIds = sanitizeRewardUnlockConditionQuestIds($existing['unlockConditionQuestIds'] ?? []);
    $finalUnlockRewardIds = sanitizeRewardUnlockConditionRewardIds($existing['unlockConditionRewardIds'] ?? []);

    if ($type === 'reward_item' && !array_key_exists('unlockConditionType', $body)) {
        $finalUnlockType = sanitizeRewardUnlockConditionType($existing['unlockConditionType'] ?? 'coins_purchase');
    }
    if ($type === 'reward_item' && !array_key_exists('unlockConditionValue', $body)) {
        $finalUnlockValue = sanitizeRewardUnlockConditionValue($existing['unlockConditionValue'] ?? null);
    }
    if ($type === 'reward_item' && array_key_exists('unlockConditionQuestIds', $body)) {
        $finalUnlockQuestIds = $unlockConditionQuestIds;
    }
    if ($type === 'reward_item' && array_key_exists('unlockConditionRewardIds', $body)) {
        $finalUnlockRewardIds = $unlockConditionRewardIds;
    }

    $finalUnlockStartCompletedQuests = sanitizeNonNegativeInt($existing['unlockStartCompletedQuests'] ?? 0);
    $finalUnlockStartLevel = sanitizeLevelInt($existing['unlockStartLevel'] ?? 1);

    if ($type === 'reward_item' && array_key_exists('unlockStartCompletedQuests', $body)) {
        $finalUnlockStartCompletedQuests = $unlockStartCompletedQuests;
    }
    if ($type === 'reward_item' && array_key_exists('unlockStartLevel', $body)) {
        $finalUnlockStartLevel = $unlockStartLevel;
    }

    $finalClaimRewardXp = sanitizeClaimRewardXp($existing['claimRewardXp'] ?? 0);
    $finalClaimRewardCoins = sanitizeCoins($existing['claimRewardCoins'] ?? 0);
    $finalClaimRewardTitle = sanitizeClaimRewardTitle($existing['claimRewardTitle'] ?? '');
    if ($finalClaimRewardXp === null) {
        $finalClaimRewardXp = 0;
    }
    if ($finalClaimRewardCoins === null) {
        $finalClaimRewardCoins = 0;
    }
    if ($finalClaimRewardTitle === null) {
        $finalClaimRewardTitle = '';
    }
    if ($type === 'reward_item' && array_key_exists('claimRewardXp', $body)) {
        $finalClaimRewardXp = $claimRewardXp;
    }
    if ($type === 'reward_item' && array_key_exists('claimRewardCoins', $body)) {
        $finalClaimRewardCoins = $claimRewardCoins;
    }
    if ($type === 'reward_item' && array_key_exists('claimRewardTitle', $body)) {
        $finalClaimRewardTitle = $claimRewardTitle;
    }

    if ($type === 'reward_item' && $finalUnlockType !== 'coins_purchase' && $finalUnlockValue === null) {
        if ($finalUnlockType !== 'quest_ids' && $finalUnlockType !== 'reward_ids') {
            respond(['ok' => false, 'error' => 'Bitte einen gueltigen Wert fuer die Belohnungs-Bedingung eingeben.'], 400);
        }
    }
    if ($type === 'reward_item' && $finalUnlockType === 'quest_ids' && (!is_array($finalUnlockQuestIds) || count($finalUnlockQuestIds) === 0)) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Quest-Bedingung angeben.'], 400);
    }
    if ($type === 'reward_item' && $finalUnlockType === 'reward_ids' && (!is_array($finalUnlockRewardIds) || count($finalUnlockRewardIds) === 0)) {
        respond(['ok' => false, 'error' => 'Bitte mindestens eine Belohnungs-Bedingung angeben.'], 400);
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
        'unlockConditionQuestIds' => ($type === 'reward_item' && $finalUnlockType === 'quest_ids') ? $finalUnlockQuestIds : [],
        'unlockConditionRewardIds' => ($type === 'reward_item' && $finalUnlockType === 'reward_ids') ? $finalUnlockRewardIds : [],
        'unlockStartCompletedQuests' => ($type === 'reward_item') ? $finalUnlockStartCompletedQuests : 0,
        'unlockStartLevel' => ($type === 'reward_item') ? $finalUnlockStartLevel : 1,
        'claimRewardXp' => ($type === 'reward_item') ? $finalClaimRewardXp : 0,
        'claimRewardCoins' => ($type === 'reward_item') ? $finalClaimRewardCoins : 0,
        'claimRewardTitle' => ($type === 'reward_item') ? $finalClaimRewardTitle : '',
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

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'migrate_legacy_rewards') {
    $result = migrateLegacyRewardItems($db);

    if ((int)($result['migrated'] ?? 0) > 0) {
        $db['updatedAt'] = gmdate('c');
        file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    respond([
        'ok' => true,
        'migrated' => (int)($result['migrated'] ?? 0),
        'items' => array_values((array)($result['items'] ?? [])),
        'updatedAt' => $db['updatedAt'] ?? null
    ]);
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
