(function () {
  var button = document.getElementById('wartung-disable-btn');
  var msg = document.getElementById('wartung-disable-msg');

  function setMsg(text, isError) {
    if (!msg) {
      return;
    }
    msg.textContent = text || '';
    msg.style.color = isError ? '#ff9aa4' : '';
  }

  async function disableMaintenance() {
    if (!button) {
      return;
    }

    var password = window.prompt('Passwort eingeben, um die Wartung aufzuheben:');
    if (password === null) {
      return;
    }

    if (password !== 'Megatron') {
      setMsg('Falsches Passwort.', true);
      return;
    }

    button.disabled = true;
    setMsg('Wartung wird deaktiviert...', false);

    try {
      var response = await fetch('api/maintenance.php?action=set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false })
      });
      var data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error((data && data.error) || 'Wartung konnte nicht deaktiviert werden.');
      }

      setMsg('Wartung deaktiviert. Weiterleitung...', false);
      window.setTimeout(function () {
        window.location.replace('index.html');
      }, 400);
    } catch (err) {
      setMsg(String(err && err.message ? err.message : 'Unbekannter Fehler'), true);
      button.disabled = false;
    }
  }

  if (button) {
    button.addEventListener('click', disableMaintenance);
  }
})();
