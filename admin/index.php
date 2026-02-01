<?php
session_start();

// Simple admin UI for managing endpoints (stores in admin/config.json)

$configPath = __DIR__ . '/config.json';
$publicNote = "\n\nSecurity: protect /admin/ with .htaccess or set a strong password in config.php.";

// Optional password file: create admin/config.php with $ADMIN_PASS = 'yourpassword';
if(file_exists(__DIR__.'/config.php')){
    include __DIR__.'/config.php';
}

// Login handling
if(isset($_POST['action']) && $_POST['action']==='login'){
    $pw = $_POST['password'] ?? '';
    if(isset($ADMIN_PASS) && $pw === $ADMIN_PASS){
        $_SESSION['admin']=true;
        header('Location: index.php'); exit;
    } else {
        $error = 'Ungültiges Passwort';
    }
}

if(isset($_GET['action']) && $_GET['action']==='logout'){
    session_unset(); session_destroy(); header('Location: index.php'); exit;
}

$authed = !empty($_SESSION['admin']);

?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Serverwatch — Admin</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#061523;color:#e6f8ff;padding:18px}
    .card{background:rgba(255,255,255,0.03);padding:16px;border-radius:8px;max-width:900px}
    input,button,textarea{font:inherit}
    .row{display:flex;gap:8px;margin-bottom:8px}
    .grow{flex:1}
    .muted{color:#9fb3c6}
    .note{font-size:0.9rem;color:#aac}
    .top{display:flex;justify-content:space-between;align-items:center}
  </style>
</head>
<body>
  <div class="top">
    <h2>Serverwatch — Admin</h2>
    <div>
      <?php if($authed): ?>
        <a href="?action=logout" style="color:#9fb3c6">Logout</a>
      <?php endif; ?>
    </div>
  </div>

  <div class="card">
    <?php if(!$authed): ?>
      <h3>Login</h3>
      <?php if(isset($error)): ?><div style="color:#ffb3b3;margin-bottom:8px"><?=htmlspecialchars($error)?></div><?php endif; ?>
      <?php if(!isset($ADMIN_PASS)): ?>
        <div class="note">Noch kein Passwort konfiguriert. Erstelle <code>admin/config.php</code> mit <code>$ADMIN_PASS = 'deinPasswort';</code> oder schütze das Verzeichnis per HTTP-Auth.</div>
      <?php endif; ?>
      <form method="post">
        <input type="hidden" name="action" value="login">
        <div class="row">
          <input name="password" placeholder="Admin-Passwort" class="grow" autocomplete="off">
          <button type="submit">Login</button>
        </div>
      </form>
    <?php else: ?>
      <h3>Manage Endpoints</h3>
      <div class="note">Endpoints werden in <code>admin/config.json</code> gespeichert. Dateiberechtigungen müssen Schreibrechte für den Webserver erlauben.</div>

      <div id="app">
        <div id="list"></div>
        <hr>
        <h4>Neu hinzufügen</h4>
        <div class="row">
          <input id="new-name" placeholder="Name" class="grow">
          <input id="new-url" placeholder="https://.../summary.json" class="grow">
          <button id="add">Hinzufügen</button>
        </div>
        <div style="margin-top:12px">
          <button id="save">Speichern</button>
        </div>
      </div>

      <script>
        async function load(){
          const res = await fetch('api.php?action=get');
          const json = await res.json();
          render(json.endpoints||[]);
        }
        function render(items){
          const list = document.getElementById('list'); list.innerHTML='';
          items.forEach((it,idx)=>{
            const row = document.createElement('div'); row.className='row';
            const n = document.createElement('input'); n.value=it.name; n.className='grow';
            const u = document.createElement('input'); u.value=it.url; u.className='grow';
            const del = document.createElement('button'); del.textContent='−'; del.onclick=()=>{ items.splice(idx,1); render(items); };
            row.appendChild(n); row.appendChild(u); row.appendChild(del);
            list.appendChild(row);
          });
          // store on window for save
          window.__endpoints = items;
        }
        document.getElementById('add').addEventListener('click', ()=>{
          const n = document.getElementById('new-name').value.trim();
          const u = document.getElementById('new-url').value.trim();
          if(!n||!u) return alert('Name und URL erforderlich');
          const items = window.__endpoints||[]; items.push({name:n,url:u}); render(items);
          document.getElementById('new-name').value=''; document.getElementById('new-url').value='';
        });
        document.getElementById('save').addEventListener('click', async ()=>{
          const items = window.__endpoints||[];
          const res = await fetch('api.php?action=save', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoints:items})});
          const j = await res.json();
          if(j.ok) alert('Gespeichert'); else alert('Fehler: '+(j.error||'unknown'));
        });
        load();
      </script>

    <?php endif; ?>
  </div>

  <div style="max-width:900px;margin-top:14px;color:#9fb3c6">
    <p class="muted">Hinweis: <?=nl2br(htmlspecialchars($publicNote))?></p>
  </div>
</body>
</html>
