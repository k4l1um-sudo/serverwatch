<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

const MAX_LEVEL = 1000;
const DEFAULT_CHILD_PASSWORD = 'DortMund1.0';
const DEFAULT_PARENT_PIN = '6407';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$storageDir = __DIR__ . '/../data';
$storageFile = $storageDir . '/quest_db.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

if (!file_exists($storageFile)) {
    file_put_contents($storageFile, json_encode(['players' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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

function respond($payload, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function xpRequiredForLevel($level) {
    $lvl = max(1, (int)$level);

    // Smooth early game, steeper mid game, crunchy endgame.
    if ($lvl <= 8) {
        return 90 + (($lvl - 1) * 22);
    }

    if ($lvl <= 20) {
        $d = $lvl - 8;
        return 244 + ($d * 45) + ($d * $d * 3);
    }

    $e = $lvl - 20;
    // Calibrated long-tail curve so progression stays playable up to level 1000.
    return 1216 + ($e * 18) + (int)floor(($e * $e) / 180);
}

function calculateLevel($xpTotal) {
    $xpTotal = max(0, (int)$xpTotal);

    $level = 1;
    $remaining = $xpTotal;

    while ($level < MAX_LEVEL) {
        $needed = xpRequiredForLevel($level);
        if ($remaining < $needed) {
            break;
        }
        $remaining -= $needed;
        $level++;
    }

    $xpForNextLevel = xpRequiredForLevel($level);
    $isMaxLevel = ($level >= MAX_LEVEL);
    if ($isMaxLevel) {
        $xpForNextLevel = max(1, $xpForNextLevel);
        $remaining = $xpForNextLevel;
    }

    return [
        'level' => $level,
        'xpInLevel' => $remaining,
        'xpForNextLevel' => $xpForNextLevel,
        'maxLevel' => MAX_LEVEL,
        'isMaxLevel' => $isMaxLevel
    ];
}

function sanitizePlayerId($value) {
    $value = (string)$value;
    if (!preg_match('/^[a-zA-Z0-9_-]{4,40}$/', $value)) {
        return null;
    }
    return $value;
}

function sanitizeQuestTitle($value) {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > 120) {
        return null;
    }
    return $value;
}

function sanitizeQuestDescription($value) {
    $value = trim((string)$value);
    if (mb_strlen($value) > 500) {
        return null;
    }
    return $value;
}

function sanitizeCatalogId($value) {
    if ($value === null || $value === '') {
        return null;
    }
    if (is_int($value) || is_float($value) || ctype_digit((string)$value)) {
        return (string)((int)$value);
    }
    if (preg_match('/^[a-zA-Z0-9_-]{1,64}$/', (string)$value)) {
        return (string)$value;
    }
    return null;
}

function sanitizeRewardCoins($value) {
    if ($value === null || $value === '') {
        return 0;
    }

    $coins = (int)$value;
    if ($coins < 0 || $coins > 100000) {
        return null;
    }

    return $coins;
}

function sanitizeShopItemId($value) {
    $value = trim((string)$value);
    if ($value === '' || !preg_match('/^[a-zA-Z0-9_-]{2,80}$/', $value)) {
        return null;
    }
    return $value;
}

function sanitizePlayerName($value) {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > 30) {
        return null;
    }
    if (!preg_match('/^[\p{L}0-9 _\-]+$/u', $value)) {
        return null;
    }
    return $value;
}

function defaultAchievementCatalog() {
    return [
        ['id' => 'ach_beginner_1', 'title' => 'Beginner', 'target' => 1, 'image' => 'assets/avatars/beginner.png'],
        ['id' => 'ach_holz_10', 'title' => 'Holz', 'target' => 10, 'image' => 'assets/avatars/holz.png'],
        ['id' => 'ach_silber_50', 'title' => 'Silber', 'target' => 50, 'image' => 'assets/avatars/silber.png'],
        ['id' => 'ach_gold_200', 'title' => 'Gold', 'target' => 200, 'image' => 'assets/avatars/gold.png'],
        ['id' => 'ach_elite_400', 'title' => 'Elite', 'target' => 400, 'image' => 'assets/avatars/elite.png'],
        ['id' => 'ach_smaragd_600', 'title' => 'Smaragd', 'target' => 600, 'image' => 'assets/avatars/smaragd.png'],
        ['id' => 'ach_rubin_800', 'title' => 'Rubin', 'target' => 800, 'image' => 'assets/avatars/rubin.png'],
        ['id' => 'ach_diamant_1000', 'title' => 'Diamant', 'target' => 1000, 'image' => 'assets/avatars/diamant.png'],
        ['id' => 'ach_meister_1500', 'title' => 'Meister', 'target' => 1500, 'image' => 'assets/avatars/meister.png'],
        ['id' => 'ach_grossmeister_2000', 'title' => 'Grossmeister', 'target' => 2000, 'image' => 'assets/avatars/grossmeister.png']
    ];
}

function loadAchievementCatalog() {
    $path = __DIR__ . '/../data/achievement_items.json';
    if (!file_exists($path)) {
        return defaultAchievementCatalog();
    }

    $raw = file_get_contents($path);
    $db = json_decode($raw, true);
    if (!is_array($db) || !isset($db['items']) || !is_array($db['items'])) {
        return defaultAchievementCatalog();
    }

    $items = [];
    foreach ($db['items'] as $item) {
        if (!is_array($item)) {
            continue;
        }
        $id = (string)($item['id'] ?? '');
        $title = (string)($item['title'] ?? '');
        $target = (int)($item['target'] ?? 0);
        $image = (string)($item['image'] ?? '');
        $active = !isset($item['active']) || $item['active'] === true;

        if (!$active || $id === '' || $title === '' || $target < 1) {
            continue;
        }

        $items[] = [
            'id' => $id,
            'title' => $title,
            'target' => $target,
            'image' => $image
        ];
    }

    if (count($items) === 0) {
        return defaultAchievementCatalog();
    }

    usort($items, function ($a, $b) {
        $ta = (int)($a['target'] ?? 0);
        $tb = (int)($b['target'] ?? 0);
        if ($ta !== $tb) {
            return $ta <=> $tb;
        }
        return strcmp((string)($a['title'] ?? ''), (string)($b['title'] ?? ''));
    });

    return $items;
}

function getAchievementProfileUnlocks($completedCount, $catalogItems) {
    $completedCount = max(0, (int)$completedCount);
    $unlocked = [];

    foreach ((array)$catalogItems as $item) {
        $target = (int)($item['target'] ?? 0);
        if ($target > 0 && $completedCount >= $target) {
            $unlocked[] = [
                'id' => (string)($item['id'] ?? ''),
                'title' => (string)($item['title'] ?? ''),
                'target' => $target,
                'image' => (string)($item['image'] ?? '')
            ];
        }
    }

    return $unlocked;
}

function sanitizeDifficulty($value) {
    if ($value === null || $value === '') {
        return null;
    }

    $value = mb_strtolower(trim((string)$value));
    if (in_array($value, ['leicht', 'mittel', 'schwer'], true)) {
        return $value;
    }

    return null;
}

function defaultXpForDifficulty($difficulty) {
    if ($difficulty === 'leicht') {
        return 60;
    }
    if ($difficulty === 'mittel') {
        return 100;
    }
    if ($difficulty === 'schwer') {
        return 160;
    }
    return 100;
}

function loadSecuritySettings() {
    $path = __DIR__ . '/../data/security_settings.json';
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

function loadShopCatalog() {
    $path = __DIR__ . '/../data/shop_items.json';
    if (!file_exists($path)) {
        return null;
    }

    $raw = file_get_contents($path);
    $db = json_decode($raw, true);
    if (!is_array($db) || !isset($db['items']) || !is_array($db['items'])) {
        return null;
    }

    return $db['items'];
}

function findShopItemById($itemId) {
    $items = loadShopCatalog();
    if (!is_array($items)) {
        return null;
    }

    foreach ($items as $item) {
        if (!is_array($item)) {
            continue;
        }

        $id = (string)($item['id'] ?? '');
        $active = !isset($item['active']) || $item['active'] === true;
        if ($active && $id === (string)$itemId) {
            return $item;
        }
    }

    return null;
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'get_state');
$security = loadSecuritySettings();
$childPasswordCurrent = (string)($security['childPassword'] ?? DEFAULT_CHILD_PASSWORD);
$parentPinCurrent = (string)($security['parentPin'] ?? DEFAULT_PARENT_PIN);
$playerIdRaw = $_GET['player_id'] ?? ($body['player_id'] ?? null);
$playerId = sanitizePlayerId($playerIdRaw);

if ($playerId === null) {
    respond(['ok' => false, 'error' => 'Ungueltige player_id.'], 400);
}

$fp = fopen($storageFile, 'c+');
if (!$fp) {
    respond(['ok' => false, 'error' => 'Speicher konnte nicht geoeffnet werden.'], 500);
}

if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    respond(['ok' => false, 'error' => 'Speicher ist gesperrt.'], 500);
}

$raw = stream_get_contents($fp);
$db = json_decode($raw ?: '{"players":{}}', true);
if (!is_array($db) || !isset($db['players']) || !is_array($db['players'])) {
    $db = ['players' => []];
}

if (!isset($db['players'][$playerId])) {
    $db['players'][$playerId] = [
        'xp' => 0,
        'coins' => 0,
        'name' => 'Spieler',
        'profileImageItemId' => null,
        'ownedShopItems' => [],
        'quests' => [],
        'createdAt' => gmdate('c'),
        'updatedAt' => gmdate('c')
    ];
}

$player = &$db['players'][$playerId];

if (!isset($player['quests']) || !is_array($player['quests'])) {
    $player['quests'] = [];
}
if (!isset($player['xp'])) {
    $player['xp'] = 0;
}
if (!isset($player['coins'])) {
    $player['coins'] = 0;
}
if (!isset($player['ownedShopItems']) || !is_array($player['ownedShopItems'])) {
    $player['ownedShopItems'] = [];
}
if (!array_key_exists('profileImageItemId', $player)) {
    $player['profileImageItemId'] = null;
}

$completedQuestCount = 0;
foreach ($player['quests'] as $quest) {
    if (!empty($quest['completed'])) {
        $completedQuestCount++;
    }
}
$achievementCatalogItems = loadAchievementCatalog();
$achievementUnlockedEntries = getAchievementProfileUnlocks($completedQuestCount, $achievementCatalogItems);
$achievementUnlockedItemIds = array_values(array_map(function ($item) {
    return (string)($item['id'] ?? '');
}, $achievementUnlockedEntries));

if ($action === 'create_quest') {
    $title = sanitizeQuestTitle($body['title'] ?? '');
    $difficulty = sanitizeDifficulty($body['difficulty'] ?? null);
    $hasRewardInput = array_key_exists('rewardXp', $body);
    $rewardXp = $hasRewardInput ? (int)$body['rewardXp'] : defaultXpForDifficulty($difficulty);
    $rewardCoins = sanitizeRewardCoins($body['rewardCoins'] ?? 0);
    $description = sanitizeQuestDescription($body['description'] ?? '');
    $catalogId = sanitizeCatalogId($body['catalogId'] ?? null);
    $acceptPassword = (string)($body['acceptPassword'] ?? '');

    if ($title === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Ungueltiger Quest-Titel.'], 400);
    }

    if ($description === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Ungueltige Quest-Beschreibung.'], 400);
    }

    if ($rewardXp < 1 || $rewardXp > 1000) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'rewardXp muss zwischen 1 und 1000 liegen.'], 400);
    }

    if ($rewardCoins === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'rewardCoins muss zwischen 0 und 100000 liegen.'], 400);
    }

    if ($catalogId !== null) {
        if ($acceptPassword !== $childPasswordCurrent) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'Falsches Passwort fuer die Quest-Annahme.'], 403);
        }

        foreach ($player['quests'] as $existingQuest) {
            $existingCatalogId = $existingQuest['catalogId'] ?? null;
            if ($existingCatalogId !== null && (string)$existingCatalogId === (string)$catalogId) {
                flock($fp, LOCK_UN);
                fclose($fp);
                respond(['ok' => false, 'error' => 'Diese Quest wurde bereits angenommen.'], 409);
            }
        }
    }

    $questId = 'q_' . bin2hex(random_bytes(5));
    $player['quests'][] = [
        'id' => $questId,
        'title' => $title,
        'description' => $description,
        'rewardXp' => $rewardXp,
        'rewardCoins' => $rewardCoins,
        'difficulty' => $difficulty,
        'catalogId' => $catalogId,
        'completionRequested' => false,
        'completionRequestedAt' => null,
        'completed' => false,
        'createdAt' => gmdate('c'),
        'completedAt' => null
    ];
}

if ($action === 'complete_quest') {
    $questId = (string)($body['questId'] ?? '');
    $completePassword = (string)($body['completePassword'] ?? '');

    if ($completePassword !== $childPasswordCurrent) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Falsches Passwort fuer das Abschliessen der Quest.'], 403);
    }

    $found = false;

    foreach ($player['quests'] as &$quest) {
        if ($quest['id'] === $questId) {
            $found = true;
            if (!$quest['completed']) {
                $quest['completionRequested'] = true;
                $quest['completionRequestedAt'] = gmdate('c');
            }
            break;
        }
    }
    unset($quest);

    if (!$found) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Quest nicht gefunden.'], 404);
    }
}

if ($action === 'confirm_quest_completion') {
    $questId = (string)($body['questId'] ?? '');
    $confirmationPin = (string)($body['confirmationPin'] ?? '');

    if ($confirmationPin !== $parentPinCurrent) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Falsche PIN fuer die Bestaetigung.'], 403);
    }

    $found = false;

    foreach ($player['quests'] as &$quest) {
        if ($quest['id'] === $questId) {
            $found = true;

            if ($quest['completed']) {
                break;
            }

            $requested = isset($quest['completionRequested']) ? (bool)$quest['completionRequested'] : false;
            if (!$requested) {
                flock($fp, LOCK_UN);
                fclose($fp);
                respond(['ok' => false, 'error' => 'Quest wurde noch nicht zur Abgabe markiert.'], 409);
            }

            // --- Level-Up Boost: apply any active boosts to XP ---
            $xpBefore = (int)$player['xp'];
            $levelBefore = calculateLevel($xpBefore)['level'];

            if (!isset($player['activeBoosts']) || !is_array($player['activeBoosts'])) {
                $player['activeBoosts'] = [];
            }

            $baseXp = (int)$quest['rewardXp'];
            $totalMultiplier = 1.0;
            foreach ($player['activeBoosts'] as &$boost) {
                if (!is_array($boost)) { continue; }
                $rem = isset($boost['remainingQuests']) ? (int)$boost['remainingQuests'] : 0;
                if ($rem > 0) {
                    $totalMultiplier *= (float)($boost['multiplier'] ?? 1.0);
                    $boost['remainingQuests'] = $rem - 1;
                }
            }
            unset($boost);

            // Remove fully consumed boosts
            $player['activeBoosts'] = array_values(array_filter($player['activeBoosts'], function ($b) {
                return is_array($b) && isset($b['remainingQuests']) && (int)$b['remainingQuests'] > 0;
            }));

            $finalXp = (int)round($baseXp * $totalMultiplier);

            $quest['completed'] = true;
            $quest['completedAt'] = gmdate('c');
            $quest['completionRequested'] = false;
            $player['xp'] += $finalXp;
            $player['coins'] += (int)($quest['rewardCoins'] ?? 0);

            // Check for level-up
            $levelAfter = calculateLevel((int)$player['xp'])['level'];
            $leveledUp = $levelAfter > $levelBefore;

            // On level-up: grant a 5 % XP boost for the next quest
            if ($leveledUp) {
                $player['activeBoosts'][] = [
                    'id'             => 'boost_lu_' . $levelAfter . '_' . bin2hex(random_bytes(4)),
                    'label'          => 'Level-Up Boost (Level ' . $levelAfter . ')',
                    'multiplier'     => 1.05,
                    'source'         => 'level_up',
                    'sourceLevel'    => $levelAfter,
                    'remainingQuests' => 5
                ];
            }

            // System message
            if (!isset($player['systemMessages']) || !is_array($player['systemMessages'])) {
                $player['systemMessages'] = [];
            }
            $questTitle = (string)($quest['title'] ?? 'Quest');
            $bonusXp = $finalXp - $baseXp;
            if ($bonusXp > 0) {
                $msgText = 'Quest "' . $questTitle . '" abgeschlossen! ' . $finalXp . ' EP erhalten (' . $baseXp . ' + ' . $bonusXp . ' EP Boost).';
            } else {
                $msgText = 'Quest "' . $questTitle . '" abgeschlossen! ' . $finalXp . ' EP erhalten.';
            }
            if ($leveledUp) {
                $msgText .= ' Level-Up auf Level ' . $levelAfter . '! Naechste Quest gibt +5 % EP.';
            }
            $player['systemMessages'][] = ['text' => $msgText, 'timestamp' => gmdate('c')];
            // Keep only the last 5 messages
            if (count($player['systemMessages']) > 5) {
                $player['systemMessages'] = array_values(array_slice($player['systemMessages'], -5));
            }

            break;
        }
    }
    unset($quest);

    if (!$found) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Quest nicht gefunden.'], 404);
    }
}

if ($action === 'rename_player') {
    $newName = sanitizePlayerName($body['name'] ?? '');

    if ($newName === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Ungueltiger Name (max. 30 Zeichen, Buchstaben/Zahlen/Leerzeichen/- _).'], 400);
    }

    $player['name'] = $newName;
}

if ($action === 'purchase_item') {
    $itemId = sanitizeShopItemId($body['itemId'] ?? '');

    if ($itemId === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
    }

    $item = findShopItemById($itemId);
    if (!is_array($item)) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Item nicht gefunden oder inaktiv.'], 404);
    }

    $costCoins = (int)($item['costCoins'] ?? 0);
    if ($costCoins < 0) {
        $costCoins = 0;
    }

    foreach ($player['ownedShopItems'] as $ownedId) {
        if ((string)$ownedId === (string)$itemId) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'Item wurde bereits gekauft.'], 409);
        }
    }

    if ((int)$player['coins'] < $costCoins) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Nicht genug Coins.'], 409);
    }

    $player['coins'] -= $costCoins;
    $player['ownedShopItems'][] = $itemId;

    // Auto-select first bought profile image as active avatar.
    if (($player['profileImageItemId'] ?? null) === null && (($item['type'] ?? '') === 'profile_image')) {
        $player['profileImageItemId'] = $itemId;
    }

    // EP-Boost Perk: activate boost immediately on purchase
    if (($item['type'] ?? '') === 'xp_boost_perk') {
        if (!isset($player['activeBoosts']) || !is_array($player['activeBoosts'])) {
            $player['activeBoosts'] = [];
        }
        $boostPct   = max(1, (int)($item['boostPercent'] ?? 5));
        $boostQ     = max(1, (int)($item['boostQuests']  ?? 5));
        $player['activeBoosts'][] = [
            'id'              => 'boost_perk_' . bin2hex(random_bytes(4)),
            'label'           => 'Perk: ' . (string)($item['title'] ?? 'EP-Boost'),
            'multiplier'      => 1.0 + ($boostPct / 100.0),
            'source'          => 'perk',
            'remainingQuests' => $boostQ
        ];

        if (!isset($player['systemMessages']) || !is_array($player['systemMessages'])) {
            $player['systemMessages'] = [];
        }
        $player['systemMessages'][] = [
            'text'      => 'Perk "' . (string)($item['title'] ?? 'EP-Boost') . '" aktiviert! +' . $boostPct . ' % EP fuer die naechsten ' . $boostQ . ' Quests.',
            'timestamp' => gmdate('c')
        ];
        if (count($player['systemMessages']) > 5) {
            $player['systemMessages'] = array_values(array_slice($player['systemMessages'], -5));
        }
    }
}

if ($action === 'set_profile_image') {
    $itemIdRaw = $body['itemId'] ?? '';
    $itemIdRaw = is_string($itemIdRaw) ? trim($itemIdRaw) : '';

    if ($itemIdRaw === '') {
        $player['profileImageItemId'] = null;
    } else {
        $itemId = sanitizeShopItemId($itemIdRaw);
        if ($itemId === null) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'Ungueltige itemId.'], 400);
        }

        $item = findShopItemById($itemId);
        $isShopProfileImage = is_array($item) && (($item['type'] ?? '') === 'profile_image');

        $owned = false;
        foreach ($player['ownedShopItems'] as $ownedId) {
            if ((string)$ownedId === (string)$itemId) {
                $owned = true;
                break;
            }
        }

        $unlockedByAchievement = false;
        foreach ($achievementUnlockedItemIds as $unlockedId) {
            if ((string)$unlockedId === (string)$itemId) {
                $unlockedByAchievement = true;
                break;
            }
        }

        if (!$isShopProfileImage && !$unlockedByAchievement) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'Profilbild nicht gefunden oder nicht freigeschaltet.'], 404);
        }

        if ($isShopProfileImage && !$owned && !$unlockedByAchievement) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'Profilbild wurde noch nicht gekauft oder freigeschaltet.'], 409);
        }

        $player['profileImageItemId'] = $itemId;
    }
}

if ($action === 'reset_player') {
    $db['players'][$playerId] = [
        'xp' => 0,
        'coins' => 0,
        'name' => 'Spieler',
        'profileImageItemId' => null,
        'ownedShopItems' => [],
        'quests' => [],
        'createdAt' => gmdate('c'),
        'updatedAt' => gmdate('c')
    ];
    $player = &$db['players'][$playerId];
}

$player['updatedAt'] = gmdate('c');
$levelData = calculateLevel((int)$player['xp']);

$profileImage = null;
$profileImageItemId = $player['profileImageItemId'] ?? null;
if ($profileImageItemId !== null && $profileImageItemId !== '') {
    $selectedItem = findShopItemById((string)$profileImageItemId);
    if (is_array($selectedItem) && (($selectedItem['type'] ?? '') === 'profile_image')) {
        $profileImage = [
            'id' => (string)($selectedItem['id'] ?? ''),
            'title' => (string)($selectedItem['title'] ?? ''),
            'type' => (string)($selectedItem['type'] ?? ''),
            'image' => (string)($selectedItem['image'] ?? '')
        ];
    } else {
        foreach ($achievementUnlockedEntries as $achievementItem) {
            if ((string)($achievementItem['id'] ?? '') === (string)$profileImageItemId) {
                $profileImage = [
                    'id' => (string)($achievementItem['id'] ?? ''),
                    'title' => (string)($achievementItem['title'] ?? ''),
                    'type' => 'profile_image_achievement',
                    'image' => (string)($achievementItem['image'] ?? '')
                ];
                break;
            }
        }
    }
}

$response = [
    'ok' => true,
    'player' => [
        'id' => $playerId,
        'name' => $player['name'] ?? 'Spieler',
        'xp' => (int)$player['xp'],
        'coins' => (int)$player['coins'],
        'profileImageItemId' => $player['profileImageItemId'] ?? null,
        'profileImage' => $profileImage,
        'level' => $levelData['level'],
        'xpInLevel' => $levelData['xpInLevel'],
        'xpForNextLevel' => $levelData['xpForNextLevel'],
        'maxLevel' => $levelData['maxLevel'],
        'isMaxLevel' => $levelData['isMaxLevel'],
        'ownedShopItems' => array_values($player['ownedShopItems']),
        'achievementUnlockedItemIds' => array_values($achievementUnlockedItemIds),
        'achievementUnlockedProfileImages' => array_values($achievementUnlockedEntries),
        'completedQuestCount' => $completedQuestCount,
        'quests' => $player['quests'],
        'systemMessages' => array_values(isset($player['systemMessages']) && is_array($player['systemMessages']) ? $player['systemMessages'] : []),
        'activeBoosts' => array_values(isset($player['activeBoosts']) && is_array($player['activeBoosts']) ? $player['activeBoosts'] : []),
        'createdAt' => $player['createdAt'] ?? gmdate('c'),
        'updatedAt' => $player['updatedAt']
    ]
];

ftruncate($fp, 0);
rewind($fp);
fwrite($fp, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
fflush($fp);
flock($fp, LOCK_UN);
fclose($fp);

respond($response, 200);
