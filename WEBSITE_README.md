# Deployment / Upload per FTP

Kurzanleitung, um die gerade erstellte statische Website auf einen reinen FTP-Webspace zu bringen.

1) Lokale Prüfung

Öffne die Datei `index.html` lokal im Browser, um das Ergebnis zu prüfen.

2) Manuelles Hochladen (Finder / FileZilla)

- Verbinde dich mit deinem FTP-Server (Host, Benutzer, Passwort).
- Lade die Dateien und Ordner (`index.html`, `css/`) in das Webroot-Verzeichnis hoch (z. B. `public_html` oder `www`).

3) Upload per Kommandozeile (empfohlen für Reproduzierbarkeit)

Mit `lftp` (empfohlen):

```bash
# Einmalig installieren (macOS Homebrew):
brew install lftp

# Beispiel-Upload (ersetze host user pass target-dir):
lftp -u user,pass host << 'EOF'
mirror -R --parallel=4 --delete ./ /target-dir/
quit
EOF
```

Erläuterung: `mirror -R` spiegelt lokal nach remote; `--delete` entfernt entfernte Dateien, die lokal gelöscht wurden.

Alternativ mit `curl` (einzelne Dateien):

```bash
curl -T index.html ftp://user:pass@host/path/to/index.html
```

4) Automatisches Skript (optional)

Du kannst ein kleines Skript `upload.sh` anlegen, das `lftp` nutzt. Achte darauf, Zugangsdaten sicher zu handhaben (nicht ins Repo committed!).

5) Nach dem Upload

- Prüfe die Seite im Browser unter deiner Domain.
- Wenn du `--delete` verwendest: Vorsicht, entfernte Dateien werden gelöscht.

Wenn du möchtest, erstelle ich ein `upload.sh` Script oder commite die neuen Dateien direkt in dein Git-Repo und pushe sie. Sage mir kurz, welche Option du willst.
