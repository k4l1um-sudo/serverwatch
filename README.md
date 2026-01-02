# Custom WordPress Theme Template

Ein modernes, responsives WordPress-Theme mit Docker-basierter Entwicklungsumgebung.

## 🚀 Schnellstart

### Voraussetzungen
- [Docker Desktop](https://www.docker.com/products/docker-desktop) installiert und läuft

### Installation & Start

1. **Docker Container starten:**
   ```bash
   docker-compose up -d
   ```

2. **WordPress Setup durchführen:**
   - Öffnen Sie http://localhost:8080 im Browser
   - Folgen Sie dem WordPress-Installations-Assistenten
   - Wählen Sie Sprache: Deutsch
   - Erstellen Sie einen Admin-Account

3. **Theme aktivieren:**
   - Gehen Sie zu WordPress Dashboard → Design → Themes
   - Aktivieren Sie "Custom WordPress Template"

4. **phpMyAdmin öffnen (optional):**
   - URL: http://localhost:8081
   - Benutzername: `root`
   - Passwort: `root_password`

## 📁 Projektstruktur

```
WordpressTemplate/
├── theme/                  # Custom WordPress Theme
│   ├── style.css          # Theme-Styles und Metadaten
│   ├── functions.php      # Theme-Funktionen
│   ├── index.php          # Haupttemplate für Blog
│   ├── header.php         # Header-Template
│   ├── footer.php         # Footer-Template
│   ├── sidebar.php        # Sidebar-Template
│   ├── single.php         # Einzelbeitrag-Template
│   └── page.php           # Seiten-Template
├── docker-compose.yml     # Docker-Konfiguration
└── README.md              # Diese Datei
```

## 🎨 Theme-Features

- ✅ Responsives Design (Mobile-First)
- ✅ Sauberes, modernes Layout
- ✅ Custom Navigation Menüs
- ✅ Widget-Unterstützung
- ✅ Featured Images
- ✅ Post Thumbnails
- ✅ Custom Logo Support
- ✅ SEO-freundlich

## 🛠️ Entwicklung

### Live-Änderungen
Alle Änderungen im `/theme` Ordner werden sofort in WordPress übernommen. Einfach die Seite neu laden!

### Nützliche Befehle

**Container stoppen:**
```bash
docker-compose down
```

**Container neu starten:**
```bash
docker-compose restart
```

**Container-Logs anzeigen:**
```bash
docker-compose logs -f wordpress
```

**Datenbank zurücksetzen:**
```bash
docker-compose down -v
docker-compose up -d
```

## 📝 Theme-Anpassungen

### Farben ändern
Bearbeiten Sie die CSS-Variablen in `theme/style.css`:
- Primärfarbe: `#3498db` (Blau)
- Textfarbe: `#333`
- Hintergrund: `#f8f9fa`

### Menüs konfigurieren
1. Dashboard → Design → Menüs
2. Erstellen Sie ein neues Menü
3. Weisen Sie es dem "Primary Menu" zu

### Widgets hinzufügen
1. Dashboard → Design → Widgets
2. Ziehen Sie Widgets in die "Sidebar"

## 🔧 Technische Details

### Ports
- **WordPress:** http://localhost:8080
- **phpMyAdmin:** http://localhost:8081

### Datenbank-Zugangsdaten
- Host: `db`
- Datenbank: `wordpress_db`
- Benutzer: `wordpress`
- Passwort: `wordpress_password`

### Docker-Volumes
- `wordpress_data`: WordPress-Dateien (persistent)
- `db_data`: MySQL-Datenbank (persistent)

## 🎯 Nächste Schritte

1. Erstellen Sie Dummy-Content (Beiträge & Seiten)
2. Passen Sie das Design an Ihre Bedürfnisse an
3. Fügen Sie eigene PHP-Funktionen in `functions.php` hinzu
4. Erweitern Sie die Templates nach Bedarf

## 📚 WordPress-Standards

Das Theme folgt den [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/):
- Escaping mit `esc_html()`, `esc_url()`, `esc_attr()`
- Übersetzungsbereit mit `__()` Funktionen
- Sichere Datenbankabfragen
- Moderne PHP-Praktiken

## 🐛 Fehlerbehebung

**Problem:** Docker-Container startet nicht
- Lösung: Prüfen Sie, ob Docker Desktop läuft

**Problem:** Port 8080 bereits belegt
- Lösung: Ändern Sie den Port in `docker-compose.yml` (z.B. `"8090:80"`)

**Problem:** Theme wird nicht angezeigt
- Lösung: Überprüfen Sie die Volume-Einbindung und starten Sie Container neu

## 📄 Lizenz

GNU General Public License v2 or later

---

Viel Erfolg mit Ihrem WordPress-Theme! 🎉
