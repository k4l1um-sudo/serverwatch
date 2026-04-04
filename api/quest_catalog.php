<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$catalogFile = __DIR__ . '/../data/quest_catalog.json';

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

function sanitizeDifficulty($value) {
    $value = mb_strtolower(trim((string)$value));
    if (!in_array($value, ['leicht', 'mittel', 'schwer'], true)) {
        return null;
    }
    return $value;
}

function sanitizeCoins($value) {
    if ($value === null || $value === '') {
        return 0;
    }
    $coins = (int)$value;
    if ($coins < 0 || $coins > 100000) {
        return null;
    }
    return $coins;
}

function sanitizeRewardXp($value) {
    $xp = (int)$value;
    if ($xp < 1 || $xp > 1000) {
        return null;
    }
    return $xp;
}

function nextNumericQuestId($quests) {
    $maxId = 0;
    foreach ($quests as $quest) {
        if (!is_array($quest)) {
            continue;
        }
        $id = $quest['id'] ?? null;
        if (is_int($id) || (is_string($id) && ctype_digit($id))) {
            $maxId = max($maxId, (int)$id);
        }
    }
    return $maxId + 1;
}

function findQuestIndexById($quests, $questId) {
    foreach ($quests as $index => $quest) {
        if (!is_array($quest)) {
            continue;
        }
        $id = $quest['id'] ?? null;
        if ((string)$id === (string)$questId) {
            return $index;
        }
    }
    return -1;
}

if (!file_exists($catalogFile)) {
    respond([
        'ok' => false,
        'error' => 'Quest-Katalog nicht gefunden.',
        'path' => 'data/quest_catalog.json'
    ], 404);
}

$raw = file_get_contents($catalogFile);
$db = json_decode($raw, true);

if (!is_array($db) || !isset($db['quests']) || !is_array($db['quests'])) {
    respond([
        'ok' => false,
        'error' => 'Quest-Katalog ist ungueltig formatiert.',
        'path' => 'data/quest_catalog.json'
    ], 500);
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'list');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'create_quest') {
    $title = sanitizeTitle($body['title'] ?? '');
    $description = sanitizeDescription($body['description'] ?? '');
    $difficulty = sanitizeDifficulty($body['difficulty'] ?? '');
    $rewardXp = sanitizeRewardXp($body['rewardXp'] ?? 0);
    $rewardCoins = sanitizeCoins($body['rewardCoins'] ?? 0);

    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($description === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Beschreibung.'], 400);
    }
    if ($difficulty === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Schwierigkeitsgrad.'], 400);
    }
    if ($rewardXp === null) {
        respond(['ok' => false, 'error' => 'Ungueltige EP (1 bis 1000).'], 400);
    }
    if ($rewardCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Coins (0 bis 100000).'], 400);
    }

    $newQuest = [
        'id' => nextNumericQuestId($db['quests']),
        'title' => $title,
        'description' => $description,
        'rewardXp' => $rewardXp,
        'rewardCoins' => $rewardCoins,
        'rewardText' => $rewardXp . ' EP',
        'difficulty' => $difficulty,
        'category' => 'Elternbereich',
        'active' => true
    ];

    $db['quests'][] = $newQuest;
    $db['updatedAt'] = gmdate('c');

    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond([
        'ok' => true,
        'quest' => $newQuest,
        'updatedAt' => $db['updatedAt']
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'update_quest') {
    $questId = $body['questId'] ?? null;
    $title = sanitizeTitle($body['title'] ?? '');
    $description = sanitizeDescription($body['description'] ?? '');
    $difficulty = sanitizeDifficulty($body['difficulty'] ?? '');
    $rewardXp = sanitizeRewardXp($body['rewardXp'] ?? 0);
    $rewardCoins = sanitizeCoins($body['rewardCoins'] ?? 0);

    if ($questId === null || $questId === '') {
        respond(['ok' => false, 'error' => 'Ungueltige questId.'], 400);
    }
    if ($title === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Titel.'], 400);
    }
    if ($description === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Beschreibung.'], 400);
    }
    if ($difficulty === null) {
        respond(['ok' => false, 'error' => 'Ungueltiger Schwierigkeitsgrad.'], 400);
    }
    if ($rewardXp === null) {
        respond(['ok' => false, 'error' => 'Ungueltige EP (1 bis 1000).'], 400);
    }
    if ($rewardCoins === null) {
        respond(['ok' => false, 'error' => 'Ungueltige Coins (0 bis 100000).'], 400);
    }

    $idx = findQuestIndexById($db['quests'], $questId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Quest nicht gefunden.'], 404);
    }

    $existing = is_array($db['quests'][$idx]) ? $db['quests'][$idx] : [];
    $db['quests'][$idx] = array_merge($existing, [
        'id' => $existing['id'] ?? $questId,
        'title' => $title,
        'description' => $description,
        'rewardXp' => $rewardXp,
        'rewardCoins' => $rewardCoins,
        'rewardText' => $rewardXp . ' EP',
        'difficulty' => $difficulty,
        'active' => true
    ]);

    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond([
        'ok' => true,
        'quest' => $db['quests'][$idx],
        'updatedAt' => $db['updatedAt']
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete_quest') {
    $questId = $body['questId'] ?? null;
    if ($questId === null || $questId === '') {
        respond(['ok' => false, 'error' => 'Ungueltige questId.'], 400);
    }

    $idx = findQuestIndexById($db['quests'], $questId);
    if ($idx < 0) {
        respond(['ok' => false, 'error' => 'Quest nicht gefunden.'], 404);
    }

    array_splice($db['quests'], $idx, 1);
    $db['updatedAt'] = gmdate('c');
    file_put_contents($catalogFile, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    respond([
        'ok' => true,
        'updatedAt' => $db['updatedAt']
    ]);
}

$quests = array_values(array_filter($db['quests'], function ($quest) {
    return is_array($quest) && (!isset($quest['active']) || $quest['active'] === true);
}));

respond([
    'ok' => true,
    'version' => $db['version'] ?? 1,
    'updatedAt' => $db['updatedAt'] ?? null,
    'quests' => $quests
]);
