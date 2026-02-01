# Admin Interface

Platzhalter-Admin, um Endpoints (z. B. Statuspage-URLs) zentral zu verwalten.

Deployment:

1. Stelle sicher, dass PHP auf deinem Webspace verfügbar ist.
2. Lade den Ordner `admin/` ins Webroot (z. B. `public_html/admin/`).
3. Erstelle `admin/config.php` basierend auf `admin/config.sample.php` und setze ein sicheres Passwort.
4. Achte darauf, dass `admin/config.json` vom Webserver beschreibbar ist (`chmod 664` oder ähnlich).

Login:
- Öffne `/admin/index.php` im Browser und melde dich mit dem in `config.php` gesetzten Passwort an.

Sicherheit:
- Schütze das Verzeichnis zusätzlich per HTTP-Auth oder IP-Restriktion falls möglich.
- Entferne Testdateien nach der Einrichtung.
