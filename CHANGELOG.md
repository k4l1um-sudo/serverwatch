# Changelog

Dieses Protokoll dokumentiert fortlaufend alle funktionalen und visuellen Aenderungen im Projekt.

---

## 🚀 Release 1.0 — 2026-04-04

**Erstes vollstaendiges Release von Questio.**
Alle Kernfunktionen wurden implementiert, manuell getestet und fuer produktionsreif erklaert.
Ab diesem Stand wird das lokale Repository mit den Echtdaten des Webservers synchronisiert.

### Getestete Bereiche
- Fortschrittsseite: Level, EP-Balken, Quests annehmen/abgeben, Boost-Badge, Systemnachrichten
- Shop: Items kaufen, Coins abziehen, Profilbild auto-setzen, Perk-Boost aktivieren
- Profil: Spielername aendern, Profilbild auswaehlen (Shop + Achievement)
- Achievements: Pfad-Darstellung, Fortschritt, freigeschaltete Bilder
- Elternbereich: Graph, Statistiken, Quest-CRUD, Shop-CRUD, Achievement-CRUD, Quest bestaetigen, Systemnachrichten, ausklappbare Bereiche
- API: Alle Aktionen in quest.php, shop_items.php, achievement_items.php, quest_catalog.php, security.php

---

## 2026-04-04 (6)

### Shopitem-Typen
- Shopitems koennen jetzt drei Typen haben (auswaehlbar per Dropdown im Elternbereich):
  - **Reallife Gegenstand**: Kein Extra-Feld, rein symbolischer Gegenstand
  - **Profilbild**: Zeigt Bildpfad-Feld, wird nach Kauf im Profilbereich auswaehbar
  - **EP-Boost Perk**: Zeigt Felder fuer Boost-Prozent und Anzahl der Quests; wird nach Kauf sofort als aktiver Boost eingetragen
- Typenspezifische Felder (Bildpfad / Boost-Prozent / Boost-Quests) werden per Dropdown dynamisch ein- und ausgeblendet.
- `api/shop_items.php` erweitert: `type`, `image`, `boostPercent`, `boostQuests` werden serverseitig validiert und gespeichert.
- Metazeile in der Shopitem-Uebersicht zeigt jetzt Coins und Typ an.
- Beim Kauf eines EP-Boost Perks: Boost wird sofort in `player.activeBoosts` eingetragen und auf der Fortschrittsseite angezeigt. Systemnachricht wird erzeugt.

### Elternbereich UX
- Bereiche **Einstellungen**, **Shopbereich** und **Achievementbereich** sind jetzt ausklappbar (standardmaessig eingeklappt).
- Neue-Quest-, Neues-Shopitem- und Neues-Achievement-Formulare werden nach erfolgreichem Speichern automatisch ausgeblendet.

## 2026-04-04 (5)

### Bugfix
- Quest-Bestaetigung im Elternbereich korrigiert: Die originale Quest-ID (aus der Datenbank) wurde zuvor durch die Katalog-ID ueberschrieben, wodurch die Quest serverseitig nicht gefunden wurde. Nun wird die originale Player-Quest-ID (`_playerQuestId`) beim Bestaetigen korrekt verwendet.

### Shop
- Ueberschrift des Shopbereichs dynamisch umgestellt: Statt hartkodiertem "Profilbilder (10)" wird jetzt "Items (N)" mit der aktuellen Kataloganzahl angezeigt.

### Level-Up Boni und Systemnachrichten
- Bei Quest-Bestaetigung werden aktive EP-Boosts automatisch auf die Belohnung angewendet.
- Bei einem Level-Up erhaelt der Spieler automatisch einen EP-Boost: +5 % EP fuer die naechsten 5 Quests.
- Aktive Boosts werden in `player.activeBoosts` gespeichert und nach Verbrauch entfernt.
- Boost-Badge auf der Fortschrittsseite unter der EP-Leiste: zeigt an wenn ein Boost aktiv ist.
- Hover ueber das Badge zeigt ein Tooltip mit allen aktiven Boosts, Prozentwert und verbleibenden Quests.
- Systemnachrichten-Bereich auf der Fortschrittsseite (unten) und im Elternbereich (unter dem Graph):
  - Jede Quest-Bestaetigung erzeugt eine Nachricht mit EP-Details (inkl. Bonus-EP) und Level-Up-Hinweis.
  - Immer nur die letzten 5 Nachrichten werden pro Spieler gespeichert und angezeigt.
- API: `player`-Antwort enthaelt jetzt `systemMessages` und `activeBoosts`.

### Elternbereich
- Achievements koennen jetzt im Elternbereich angelegt, bearbeitet und geloescht werden (neuer Abschnitt "Achievementbereich").
- Neues API: `api/achievement_items.php` mit CRUD-Aktionen (create_item, update_item, delete_item).
- Zentrale Achievement-Datenquelle: `data/achievement_items.json` (ersetzt alle hardkodierten Meilensteine).
- Ausstehende Quests zur Bestaetigung koennen direkt im Elternbereich per Button und PIN bestaetigt werden.
- Systemnachrichten werden unterhalb des Fortschrittsgraphen angezeigt (letzte 5).

---

### Navigation und Seiten
- Menue um neue Bereiche erweitert: Mein Profil und Elternbereich.
- Shop-Seite um Header-Bild mit WebP/PNG-Unterstuetzung erweitert.

### Profilbereich
- Profilseite mit editierbarem Spielernamen umgesetzt.
- Backend-Aktion zum Umbenennen des Spielers integriert.
- Bereich fuer gekaufte Artikel auf der Profilseite hinzugefuegt.
- Auswahl und Setzen des aktiven Profilbilds aus gekauften Profilbildern hinzugefuegt.
- Graues Platzhalter-Profilbild eingefuehrt (assets/avatar-placeholder.svg).

### Shop und Coins
- Coin-System in Spielerstatus integriert (Coins verdienen und ausgeben).
- Shop-Katalog fuer kaufbare Profilbilder eingefuehrt (data/shop_items.json + api/shop_items.php).
- Shop-UI auf kaufbare Profilbilder umgebaut (inkl. Preis, Kaufstatus, Vorschau).
- Gekaufte Profilbilder werden im Shop ausgeblendet.
- Coin-Anzeige bei Quests erweitert (mit kleinem Coin-Symbol).
- Quest-Coinlogik angepasst: nicht jede Quest gibt Coins, Anzeige dann als "-".
- Profilbilder nach Coins sortiert und Preise final angepasst:
  - Beginner 5
  - Holz 20
  - Silber 50
  - Gold 75
  - Elite 125
  - Smaragd 200
  - Rubin 300
  - Diamant 400
  - Meister 500
  - Grossmeister 1000

### Fortschritt und Anzeige
- Im Fortschritt wird statt technischer Spieler-ID jetzt der vergebene Spielername angezeigt.
- Profilbild links im Levelbereich der Fortschrittsseite integriert.

### Sicherheit und Zugang
- Sicherheits-API eingefuehrt (api/security.php) zum Verifizieren/Aktualisieren von Zugangsdaten.
- Kind-Passwort fuer geschuetzte Bereiche dynamisch pruefbar gemacht.
- Elternbereich-Zugang final auf festen Eltern-PIN 6407 gesetzt.
- Einstellungsbereich in zwei getrennte Formulare aufgeteilt:
  - Kinderpasswort aendern
  - Eltern-PIN aendern
- Beide Aenderungen jeweils nur mit Eingabe des aktuellen Eltern-PIN moeglich.

### Elternbereich (Dashboard)
- Fortschrittsgraph (Level 1-1000) mit EP-Kurve und hervorgehobenem erreichtem Abschnitt integriert.
- Statistikbereich hinzugefuegt mit:
  - Achievements gesamt und diese Woche
  - Quests gesamt und diese Woche
  - Bisher ausgegebene Coins
- Aktive Quests als drei optisch getrennte Bereiche hinzugefuegt:
  - Verfuegbar
  - Angenommen
  - Zur Bestaetigung markiert
- Neue Quest anlegen per aufklappbarem Formular ergaenzt (Titel, Beschreibung, Coins, Schwierigkeit).
- EP-Vorschlag fuer neue Quests anhand aktuellem Kind-Level und Schwierigkeit integriert.
- Quest-Bearbeitung im Elternbereich eingefuehrt:
  - Bearbeiten-Button neben Quests
  - Formular mit bestehenden Daten
  - Speichern und Loeschen (mit Sicherheitsabfrage vor Loeschen)
- Formulare im Quest-Bereich um X-Schliessen-Button oben rechts erweitert.
- Feldbeschriftungen ueber allen relevanten Eingabefeldern hinzugefuegt.

### API und Datenmodell
- api/quest.php erweitert um:
  - coins
  - ownedShopItems
  - profileImageItemId/profileImage
  - Aktionen purchase_item und set_profile_image
- api/quest_catalog.php erweitert um Katalog-Schreibzugriffe:
  - create_quest
  - update_quest
  - delete_quest

---

## 2026-04-04 (4)

### Elternbereich: Shop-Verwaltung
- Neuer Abschnitt "Shopbereich" im Elternbereich hinzugefuegt fuer Verwaltung von Shopitems.
- Shopitems-Uebersicht mit Titel und Coinwert pro Item angezeigt.
- Beschreibungen je Item ausklappbar (Knopf "Beschreibung" zeigt/verbirgt Details).
- "Shopitem anlegen"-Button mit aufklappbarem Formular:
  - Felder: Titel, Beschreibung, Coinwert
  - Speichern ueber API-Action create_item
  - X-Schliessen-Button zum Schliessen ohne Speichern
- "Shopitem bearbeiten"-Formular mit:
  - Vorschau der aktuellen Daten
  - Felder: Titel, Beschreibung, Coinwert
  - "Speichern"-Button aktualisiert Item und schliessst Panel automatisch
  - "Loeschen"-Button mit Bestaetigung vor Loesch-Aktion
  - X-Schliessen-Button zum Abbrechen
- Gespeicherte Items werden sofort in Uebersicht und Shop-Seite angezeigt.
- Loeschaktion mit Sicherheitsabfrage (confirm-Dialog).

### Shop and Items API
- api/shop_items.php erweitert um volle CRUD-Funktionalitaet:
  - GET: Liefert alle aktiven Shopitems
  - POST-Actions:
    - create_item: Neues Item mit title, description, costCoins anlegen
    - update_item: Item nach itemId aendern
    - delete_item: Item nach itemId loeschen
  - Eindeutige Item-IDs aus Titel generiert
  - Validierung allg. Eingaben

### Shop-Frontend
- Shop-Seite angepasst, um nicht nur profile_image sondern alle generischen Shopitems zu unterstuetzen.
- Karten zeigen jetzt title und description statt nur Name und Typ.
- Profilbild-Vorschau (img-Tag) nur fuer profile_image-Items angezeigt.
- Datei-Hinweis nur bei profile_image sichtbar.
- Sortierung nach Coins beibehalten.

### Styling
- Neue CSS-Klassen fuer Shop-Admin-UI:
  - .parent-shop-list: Grid-Layout fuer Shopitem-Eintrage
  - .parent-shop-entry: Eintragskarte mit Header und Beschreibung
  - .parent-shop-header: Flex-Zeile mit Titel/Meta und Action-Buttons
  - .parent-shop-actions: Button-Gruppe fuer Beschreibung/Bearbeiten
  - .parent-shop-description: Ausklappbarer Beschreibungs-Bereich

### Achievements and Quest Visualisierung
- Achievement-Bilder zu neuen Quest-Meilensteinen verknuepft (1, 10, 50, 200, 400, 600, 800, 1000, 1500, 2000 Quests).
- Neue Funktionalitaet getAchievementImage() mapt Meilensteine zu Profilbildern:
  - 1 Quest → Anfaenger
  - 10 Quests → Holz
  - 50 Quests → Silber
  - 200 Quests → Gold
  - 400 Quests → Elite
  - 600 Quests → Smaragd
  - 800 Quests → Rubin
  - 1000 Quests → Diamant
  - 1500 Quests → Meister
  - 2000 Quests → Grossmeister
- Achievement-Ansicht von Karten auf einen horizontalen Pfad (Strahl) von links nach rechts umgestellt.
- Profilbilder werden als Stationen auf dem Achievement-Pfad dargestellt.
- Fortschritt auf dem Strahl kenntlich gemacht:
  - gefuellte Fortschrittslinie je nach Anzahl errungener Achievements
  - Hervorhebung des naechsten offenen Achievements ("Naechstes Ziel")
- Achievement-freigeschaltete Profilbilder koennen im Profil zusaetzlich zu gekauften Bildern ausgewaehlt werden.
- API erweitert: Freischaltungen aus abgeschlossenen Quests werden serverseitig berechnet und bei set_profile_image beruecksichtigt.

---

## 2026-04-04 (2)

### Neu
- Seite "Mein Profil" (profil.html) erstellt – Platzhalter für zukünftige Profilfunktionen.
- Seite "Elternbereich" (elternbereich.html) erstellt – Platzhalter für Verwaltung und Einstellungen durch Eltern.
- Beide neuen Seiten in das Navigationsmenü auf allen 7 Hauptseiten eingebunden.

---

## 2026-04-04

### Neu
- Questio Seitenstruktur mit Landingpage, Fortschritt, Achievements und Historie erstellt.
- Hamburger-Menue mit Slide-in Panel auf allen Hauptseiten integriert.
- Fixiertes Logo oben links auf allen Hauptseiten integriert.
- Zentraler Quest-Katalog fuer Webspace-Pflege erstellt: data/quest_catalog.json.
- API fuer Quest-Katalog erstellt: api/quest_catalog.php.
- Fortschrittsseite mit 3 Bereichen umgesetzt:
  - Level/EP Fortschrittsbalken
  - Angenommene Quests
  - Verfuegbare Quests
- Quest-Darstellung als ausklappbare Karten umgesetzt (Titel, EP, Quest-ID sichtbar im eingeklappten Zustand, Beschreibung im Detailbereich).
- Historie als dynamische Liste erledigter Quests mit Datum/Zeitstempel umgesetzt.
- Achievements-Seite mit 2 Bereichen umgesetzt:
  - Errungen
  - Noch zu erledigen
- Achievement-Meilensteine fuer abgeschlossene Quests eingefuehrt:
  - 1 und 5
  - 10er Schritte bis 100
  - 20er Schritte bis 200
  - 50er Schritte bis 500
  - 100er Schritte bis 1000
- Achievement-Unlock Popup nach final bestaetigtem Quest-Abschluss auf der Fortschrittsseite integriert.

### Sicherheit und Freigaben
- Passwortschutz fuer Quest-Annahme eingefuehrt (DortMund1.0).
- Passwortschutz fuer Markierung zur Abgabe eingefuehrt (DortMund1.0).
- Zwei-Stufen-Abgabe umgesetzt:
  - Schritt 1: Als erledigt markieren (bleibt sichtbar mit gruenem Haken)
  - Schritt 2: Finale Bestaetigung mit PIN 6407
- EP werden erst nach finaler PIN-Bestaetigung gutgeschrieben, danach wird die Quest in die Historie verschoben.

### Progression
- Nicht-lineares Levelsystem eingefuehrt.
- Kurve auf sanften Einstieg mit staerkerem Endgame angepasst.
- Kalibrierung bis Max-Level 1000 integriert.

### Datenmodell
- Quest-Daten um Felder erweitert:
  - catalogId
  - description
  - difficulty
  - completionRequested
  - completionRequestedAt
  - completedAt

### Update
- Neue Seite erstellt: shop.html.
- Shop-Link im Menue auf allen Hauptseiten hinzugefuegt (Home, Fortschritt, Achievements, Historie, Shop).
- Shop-Link im unteren Landingpage-Linkbereich auf der Startseite hinzugefuegt.
