# Deployment / Upload per FTP

Kurzanleitung, um das Serverwatch-Layout als Questsystem auf einen Webspace zu bringen.

## Questsystem (neu)

Das Repo enthaelt ein Quest- und Levelsystem fuer Kinder (ohne Login):

- Seite: `index.html`
- Seite: `progress.html` (aktuelles Level + offene Quests)
- Seite: `achievements.html` (erreichte/offene Achievements)
- Seite: `history.html` (erledigte Quests als Historie)
- Frontend-Logik: `js/questsystem.js`
- Frontend-Logik: `js/progress.js`, `js/achievements.js`, `js/history.js`
- API-Endpoint: `api/quest.php`
- API-Endpoint fuer zentralen Quest-Katalog: `api/quest_catalog.php`
- Datenspeicher (Datei-DB): `data/quest_db.json` (wird automatisch erzeugt)
- Zentral gepflegte Quest-Vorlagen: `data/quest_catalog.json`

## Quest-Bereich auf dem Webspace pflegen

Ja, ihr koennt Quests zentral auf dem Webspace ablegen und pflegen:

- Datei: `data/quest_catalog.json`
- Per FTP editierbar (Titel, Beschreibung, rewardXp, active)
- Auslesen per API: `api/quest_catalog.php`

Beispiel fuer eine Quest in `quest_catalog.json`:

```json
{
	"id": "zimmer_aufr",
	"title": "Zimmer aufraeumen",
	"description": "Raeume dein Zimmer auf und stelle alles an seinen Platz.",
	"rewardXp": 25,
	"category": "Alltag",
	"active": true
}
```

Wichtig fuer den Webspace:

- PHP muss verfuegbar sein.
- Der Ordner `data/` muss Schreibrechte fuer PHP haben, damit XP und Quests gespeichert werden.
- Kein Login noetig: Der Browser erzeugt eine lokale Spieler-ID und verwendet diese fuer den API-Aufruf.

1) Lokale Pruefung

Fuer das Questsystem mit API rufe die Seite ueber einen lokalen Webserver mit PHP auf, z. B.:

```bash
php -S localhost:8000
```

Dann:

- `http://localhost:8000/index.html`

2) Manuelles Hochladen (Finder / FileZilla)

- Verbinde dich mit deinem FTP-Server (Host, Benutzer, Passwort).
- Lade das komplette Repo (inkl. `api/`, `js/`, `css/`, `data/`) in das Webroot-Verzeichnis hoch (z. B. `public_html` oder `www`).

3) Upload per Kommandozeile (empfohlen fuer Reproduzierbarkeit)

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

Erlaeuterung: `mirror -R` spiegelt lokal nach remote; `--delete` entfernt entfernte Dateien, die lokal geloescht wurden.

Alternativ mit `curl` (einzelne Dateien):

```bash
curl -T index.html ftp://user:pass@host/path/to/index.html
```

4) Automatisches Skript (optional)

Du kannst ein kleines Skript `upload.sh` anlegen, das `lftp` nutzt. Achte darauf, Zugangsdaten sicher zu handhaben (nicht ins Repo committed!).

5) Nach dem Upload

- Pruefe die Seite im Browser unter deiner Domain:
	- `/index.html`
- Wenn du `--delete` verwendest: Vorsicht, entfernte Dateien werden gelöscht.

Wenn du moechtest, erstelle ich als naechsten Schritt noch ein Admin-Bereich mit PIN (nur Eltern duerfen Quests anlegen/loeschen) und eine reine Kind-Ansicht zum Abhaken.
