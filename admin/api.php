<?php
session_start();

$configPath = __DIR__ . '/config.json';

// require auth
if(!(isset($_SESSION['admin']) && $_SESSION['admin'])){
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error'=>'unauthorized']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? 'get';
if($action === 'get'){
    if(!file_exists($configPath)){
        echo json_encode(['endpoints'=>[]]); exit;
    }
    $data = file_get_contents($configPath);
    $json = json_decode($data, true);
    if($json === null) $json = ['endpoints'=>[]];
    echo json_encode($json);
    exit;
}

if($action === 'save'){
    $body = file_get_contents('php://input');
    $json = json_decode($body, true);
    if(!$json || !isset($json['endpoints']) || !is_array($json['endpoints'])){
        http_response_code(400); echo json_encode(['error'=>'invalid_payload']); exit;
    }
    // basic validation
    $clean = ['endpoints'=>[]];
    foreach($json['endpoints'] as $e){
        if(!isset($e['name'])||!isset($e['url'])) continue;
        $url = filter_var($e['url'], FILTER_VALIDATE_URL);
        if(!$url) continue;
        $clean['endpoints'][] = ['name'=>substr($e['name'],0,200),'url'=>$url];
    }
    $w = json_encode($clean, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES);
    $ok = @file_put_contents($configPath, $w);
    if($ok === false){ http_response_code(500); echo json_encode(['error'=>'write_failed']); exit; }
    echo json_encode(['ok'=>true]); exit;
}

http_response_code(400); echo json_encode(['error'=>'unknown_action']); exit;
