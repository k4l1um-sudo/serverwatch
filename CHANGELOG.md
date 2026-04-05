# Changelog

Dieses Protokoll dokumentiert fortlaufend alle funktionalen und visuellen Aenderungen im Projekt.

---

## 2026-04-05 14:31:33

### Elternbereich: News anlegen
- Neue Seite `eltern-news.html` hinzugefuegt (im Eltern-Menue erreichbar).
- Neuer Bereich **Aktuelle News** zeigt die letzten 5 News mit **Bearbeiten**-Button.
- Formular fuer News erstellt mit:
  - Titel
  - Teaser
  - grossem Inhaltsfeld mit einfachem Texteditor (Fett, Kursiv, Unterstrichen, Liste)
  - Speichern-Button
- Beim Bearbeiten wird das Formular mit den bestehenden Werten vorbefuellt.

### News-Backend und Datenhaltung
- Neue API `api/news.php` hinzugefuegt (`list`, `save`).
- Neue Datei `data/news.json` als persistenter News-Speicher hinzugefuegt.
- News werden serverseitig mit Titel, Teaser, HTML-Inhalt, Zeitstempeln und Standardbild gespeichert.

### Landingpage und News-Seite wieder mit echten News
- `js/news.js` von Platzhaltermodus auf echte News-Daten (`api/news.php`) umgestellt.
- Landingpage zeigt wieder News-Kacheln.
- Klick auf eine Kachel auf der Landingpage fuehrt in den News-Bereich (`news.html`) zum passenden Eintrag.
- `news.html` rendert die News nun als Artikelliste mit Titel, Teaser, Inhalt und Zeit.

### Elternnavigation erweitert
- Eltern-Menueleiste um den Punkt **News anlegen** erweitert auf:
  - `elternbereich.html`
  - `eltern-aktive-quests.html`
  - `eltern-coins.html`
  - `eltern-shopbereich.html`
  - `eltern-belohnungen.html`
  - `eltern-achievementbereich.html`
  - `eltern-news.html`
- Aktive Seite bleibt auf allen Eltern-Unterseiten korrekt gehighlightet.

### Passwort-/PIN-Abfragen weiter reduziert
- PIN-Abfrage auf Eltern-Unterseiten entfernt:
  - `eltern-aktive-quests.html`
  - `eltern-coins.html`
  - `eltern-shopbereich.html`
  - `eltern-belohnungen.html`
  - `eltern-achievementbereich.html`
- Quest-Bestaetigung in **Aktive Quests** (Elternbereich) benoetigt keine PIN mehr:
  - Frontend-Anpassung in `js/elternbereich.js`
  - Backend-Anpassung in `api/quest.php` (`confirm_quest_completion` ohne PIN-Pruefung)

---

## 2026-04-05 14:16:37

### Landingpage und News
- Auf `index.html` wurde der Textbereich „Worum geht es auf dieser Seite?“ durch den Bereich **News** ersetzt.
- Das Headerbild auf der Landingpage bleibt aktiv und wurde wieder oberhalb des News-Bereichs eingebunden.
- Neue Seite `news.html` erstellt und im Hamburgermenue verlinkt.
- Neuer Menuepunkt **News** im Hamburgermenue auf allen Seiten ausgerollt.
- `js/menu.js` erweitert: aktueller Menuepunkt im Hamburgermenue wird automatisch gehighlightet (`active` / `aria-current`).

### News-Logik (vorlaeufig deaktiviert)
- `js/news.js` eingefuehrt und anschliessend auf Platzhalterbetrieb umgestellt.
- Aktuell werden **keine** News aus Systemnachrichten angezeigt.
- Landingpage-News und News-Seite zeigen bewusst nur einen Hinweistext.
- Standard-Newsbild auf `assets/News.png` gesetzt.

### Quest-Annahme ohne Passwort
- Passwortabfrage beim Annehmen von Quests im Frontend entfernt (`js/progress.js`).
- Backend-Pruefung auf `acceptPassword` bei `create_quest` entfernt (`api/quest.php`).
- Quest-Annahme funktioniert nun ohne Passwort, Duplikatpruefung bleibt bestehen.

### Elternbereich in Unterseiten aufgeteilt
- Neue Eltern-Menueleiste im Stil der Spieler-Menueleiste eingefuehrt.
- Ausklappbereiche aus dem Elternbereich in eigene Seiten ausgelagert und verlinkt:
  - `eltern-aktive-quests.html`
  - `eltern-coins.html`
  - `eltern-shopbereich.html`
  - `eltern-belohnungen.html`
  - `eltern-achievementbereich.html`
- Auf allen neuen Elternseiten ist die Menueleiste enthalten und die jeweils aktive Seite gehighlightet.
- `elternbereich.html` dient jetzt als Uebersichtsseite (Graph + Statistik + Navigation), die ausgelagerten Bereiche wurden dort entfernt.

### Shop-Seite
- Reihenfolge auf `shop.html` angepasst: Menueleiste steht jetzt oberhalb des Shop-Headers.

---

## 2026-04-05 13:58:09

### Spielerbereich umgebaut und erweitert
- `spieler.html` von Platzhalter auf vollwertige Spieler-Uebersicht umgestellt.
- Obere Spieler-Menueleiste eingefuehrt und visuell an das Hamburgermenue angepasst (inkl. Hover-Effekte und eigener Abhebung).
- Menueleiste um zusaetzlichen Punkt **Spieler** erweitert.
- Aktive Seite in der Spieler-Menueleiste wird nun klar gehighlightet (`active` / `aria-current="page"`).

### Inhalte auf eigene Seiten ausgelagert
- Die ausklappbaren Bereiche **Quest**, **Level-Meilensteine**, **Belohnungen** und **Historie** aus der Spielerseite entfernt und in eigene Seiten ueberfuehrt:
  - `spieler-quests.html`
  - `spieler-level-meilensteine.html`
  - `spieler-belohnungen.html`
  - `spieler-historie.html`
- Diese Seiten wurden mit den benoetigten bestehenden Skripten verbunden, damit Daten weiterhin dynamisch geladen werden.

### Navigation angepasst
- Shop und Mein Profil aus allen Hamburgermenues entfernt.
- Gewuenschter Zugriffspfad umgesetzt: Navigation zu Shop/Profil ueber den Spielerbereich und die dortige Menueleiste.
- Spieler-Menueleiste auf folgende Seiten ausgerollt:
  - `spieler.html`
  - `spieler-quests.html`
  - `spieler-level-meilensteine.html`
  - `spieler-belohnungen.html`
  - `spieler-historie.html`
  - `shop.html`
  - `profil.html`

### Passwortschutz angepasst
- Passwortschutz fuer `spieler.html` gesetzt (`DortMund1.0`).
- Passwortschutz anschliessend fuer folgende Seiten entfernt:
  - `spieler-quests.html`
  - `spieler-level-meilensteine.html`
  - `spieler-belohnungen.html`
  - `spieler-historie.html`
  - `shop.html`
  - `profil.html`

### Fortschritt-Seite bereinigt
- Aus `progress.html` folgende Bereiche entfernt:
  - Quests (ausklappbar)
  - Belohnungen (ausklappbar)
  - Systemnachrichten

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

## 2026-04-04 (9)

### Belohnungen aus Shop ausgeblendet
- `reward_item`-Eintraege werden im Shop (`shop.html`) nicht mehr angezeigt – unabhaengig davon, ob sie per Coins kaufbar sind.
- Belohnungen sind ausschliesslich im Belohnungsbereich sichtbar (Fortschrittsseite und Elternbereich).

### Systemnachricht bei neuer Belohnung
- Wenn eine neue Belohnung im Elternbereich angelegt wird, erhalten alle Spieler automatisch eine Systemnachricht.
- Die Nachricht nennt den Titel der Belohnung und die freigeschaltete Bedingung (z. B. Coinskosten oder Anzahl erledigter Quests).
- Die neue Nachricht wird wie alle anderen Systemnachrichten in der `quest_db.json` gespeichert (max. 5 pro Spieler) und auf der Fortschrittsseite angezeigt.

---

## 2026-04-04 (8)

### Belohnungsbereich

#### Elternbereich
- Neuer eigener Abschnitt **Belohnungen** im Elternbereich (neben Shopbereich und Achievementbereich).
- Belohnungen koennen angelegt, bearbeitet und geloescht werden (CRUD vollstaendig).
- Beim Anlegen waehlt man eine Freischalte-Bedingung:
  - **Coins** (direkt kaufbar)
  - **Quest-Abschluesse** (N Quests seit Anlage erledigt)
  - **Levelaufstiege** (N Levelaufstiege seit Anlage erreicht)
  - **Level erreichen** (Level X seit Anlage ueberschritten)
- Bedingungsfelder werden per Dropdown dynamisch ein-/ausgeblendet.
- Jede Belohnung hat optionale Startpunkte (`unlockStartCompletedQuests`, `unlockStartLevel`), sodass der Fortschritt ab dem Zeitpunkt der Anlage gerechnet wird.
- Elternbereich kann eine Belohnung manuell per **Einloesen**-Button freischalten (ohne das Kind-Passwort).
- Aktive und eingeloeste Belohnungen werden getrennt in zwei Listen dargestellt.
- Jede Belohnung zeigt einen Fortschrittsbalken (farbkodiert nach Bedingungstyp) mit aktuellem Stand.

#### Fortschrittsseite (Spieler)
- Neuer ausklappbarer Abschnitt **Belohnungen** auf der Fortschrittsseite.
- Alle aktiven Belohnungen werden mit Titel, Bedingung, Fortschrittsbalken und optionalem Bild angezeigt.
- Bereits eingeloeste Belohnungen erscheinen als abgeschlossen.

#### Backend
- `api/shop_items.php` erweitert: `reward_item`-Typ mit Feldern `unlockConditionType`, `unlockConditionValue`, `unlockStartCompletedQuests`, `unlockStartLevel`.
- `api/quest.php`: Neue Hilfsfunktion `autoUnlockConditionRewards()` prueft nach jeder Quest-Bestaetigung, ob Bedingungsbelohnungen automatisch freigeschaltet werden; Ergebnis wird in `player.unlockedRewardItemIds` gespeichert.
- Neue API-Aktion `unlock_reward_item` in `quest.php`: Manuelles Freischalten einer Belohnung per PIN durch Elternteil.

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

## 2026-04-04 (7)

### Level-Up Coins (neue Staffelung)
- Bei jedem Levelaufstieg gibt es jetzt Coins (nicht nur ueber Quest-Belohnungen).
- Level 2 bis 50: immer **5 Coins** pro erreichtem Level.
- Ab Level 51 steigt die Basisbelohnung stufenweise an (mehr Coins als bis Level 50).
- Wenn bei einem Quest-Abschluss mehrere Level auf einmal erreicht werden, werden die Coins fuer alle uebersprungenen Level korrekt aufsummiert.

### Meilenstein-Boni fuer grosse Levelschritte
- Grosse Level-Meilensteine geben einmalige Extra-Boni (z. B. bei runden Schritten wie 100).
- Jeder Meilenstein gibt einen besonders hohen Coin-Bonus.
- Meilenstein-Belohnungen sind gedeckelt: **nie mehr als 500 Coins** pro Meilenstein.
- Die hoechsten Belohnungen werden erst sehr spaet erreicht.

### Fortschrittsbereich
- Auf der Fortschrittsseite wurde ein neuer Abschnitt **Level-Meilensteine** ergaenzt.
- Unter jedem Meilenstein wird die konkrete Coin-Belohnung angezeigt.
- Der Status je Meilenstein (erreicht/offen) wird direkt in der Liste dargestellt.

### Backend und Meldungen
- API-Logik in `api/quest.php` erweitert: Level-Up-Coins und Meilenstein-Boni werden serverseitig vergeben.
- Systemnachrichten zeigen jetzt Coins aus Quest-Belohnung und Level-Up getrennt an.
- Bei erreichten Level-Meilensteinen werden die Bonus-Coins in den Systemnachrichten explizit ausgewiesen.

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
