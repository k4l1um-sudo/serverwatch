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
$storageFile = $storageDir . '/news.json';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0775, true);
}

if (!file_exists($storageFile)) {
    file_put_contents($storageFile, json_encode(['items' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
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

function sanitizeTitle($value) {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > 120) {
        return null;
    }
    return $value;
}

function sanitizeTeaser($value) {
    $value = trim((string)$value);
    if ($value === '' || mb_strlen($value) > 240) {
        return null;
    }
    return $value;
}

function sanitizeContentHtml($value) {
    $value = trim((string)$value);
    if ($value === '') {
        return null;
    }

    $allowed = '<p><br><strong><b><em><i><u><ul><ol><li><h3><h4><h5><blockquote>';
    $safe = strip_tags($value, $allowed);

    if (mb_strlen($safe) > 12000) {
        return null;
    }

    return $safe;
}

$body = readBody();
$action = $_GET['action'] ?? ($body['action'] ?? 'list');

$fp = fopen($storageFile, 'c+');
if (!$fp) {
    respond(['ok' => false, 'error' => 'News-Speicher konnte nicht geoeffnet werden.'], 500);
}

if (!flock($fp, LOCK_EX)) {
    fclose($fp);
    respond(['ok' => false, 'error' => 'News-Speicher ist gesperrt.'], 500);
}

rewind($fp);
$raw = stream_get_contents($fp);
$db = json_decode($raw ?: '', true);
if (!is_array($db)) {
    $db = ['items' => []];
}
if (!isset($db['items']) || !is_array($db['items'])) {
    $db['items'] = [];
}

if ($action === 'list') {
    $items = $db['items'];
    usort($items, function ($a, $b) {
        $aTime = strtotime((string)($a['updatedAt'] ?? $a['createdAt'] ?? '1970-01-01T00:00:00Z'));
        $bTime = strtotime((string)($b['updatedAt'] ?? $b['createdAt'] ?? '1970-01-01T00:00:00Z'));
        return $bTime <=> $aTime;
    });

    flock($fp, LOCK_UN);
    fclose($fp);
    respond(['ok' => true, 'items' => array_values($items)]);
}

if ($action === 'save') {
    $id = trim((string)($body['id'] ?? ''));
    $title = sanitizeTitle($body['title'] ?? '');
    $teaser = sanitizeTeaser($body['teaser'] ?? '');
    $contentHtml = sanitizeContentHtml($body['contentHtml'] ?? '');

    if ($title === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Titel ist ungueltig (1-120 Zeichen).'], 400);
    }
    if ($teaser === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Teaser ist ungueltig (1-240 Zeichen).'], 400);
    }
    if ($contentHtml === null) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'Inhalt ist ungueltig oder leer.'], 400);
    }

    $now = gmdate('c');
    $savedItem = null;

    if ($id !== '') {
        $updated = false;
        foreach ($db['items'] as &$item) {
            if ((string)($item['id'] ?? '') === $id) {
                $item['title'] = $title;
                $item['teaser'] = $teaser;
                $item['contentHtml'] = $contentHtml;
                $item['updatedAt'] = $now;
                $savedItem = $item;
                $updated = true;
                break;
            }
        }
        unset($item);

        if (!$updated) {
            flock($fp, LOCK_UN);
            fclose($fp);
            respond(['ok' => false, 'error' => 'News-Eintrag nicht gefunden.'], 404);
        }
    } else {
        $newId = 'news_' . bin2hex(random_bytes(5));
        $savedItem = [
            'id' => $newId,
            'title' => $title,
            'teaser' => $teaser,
            'contentHtml' => $contentHtml,
            'image' => 'assets/News.png',
            'createdAt' => $now,
            'updatedAt' => $now
        ];
        $db['items'][] = $savedItem;
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    respond(['ok' => true, 'item' => $savedItem]);
}

if ($action === 'delete') {
    $id = trim((string)($body['id'] ?? ''));
    if ($id === '') {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'News-ID fehlt.'], 400);
    }

    $beforeCount = count($db['items']);
    $db['items'] = array_values(array_filter($db['items'], function ($item) use ($id) {
        return (string)($item['id'] ?? '') !== $id;
    }));

    if (count($db['items']) === $beforeCount) {
        flock($fp, LOCK_UN);
        fclose($fp);
        respond(['ok' => false, 'error' => 'News-Eintrag nicht gefunden.'], 404);
    }

    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    respond(['ok' => true, 'deletedId' => $id]);
}

flock($fp, LOCK_UN);
fclose($fp);
respond(['ok' => false, 'error' => 'Ungueltige Aktion.'], 400);
