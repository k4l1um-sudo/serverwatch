# LÖSUNG FÜR LIVE-SEITE (k4l1um.de)

## Problem
Die Live-Seite k4l1um.de ist nicht erreichbar, vermutlich wegen eines Fehlers im Diablo 4-Theme.

## Lösung über phpMyAdmin (EMPFOHLEN)

1. **Öffne phpMyAdmin auf dem Live-Server**
   - Gehe zu deinem Hosting-Panel
   - Öffne phpMyAdmin

2. **Wähle die WordPress-Datenbank**
   - Meist heißt sie ähnlich wie dein Benutzername

3. **Führe diese SQL-Befehle aus:**
```sql
UPDATE wp_options 
SET option_value = 'twentytwentyfour' 
WHERE option_name = 'template';

UPDATE wp_options 
SET option_value = 'twentytwentyfour' 
WHERE option_name = 'stylesheet';
```

4. **Alternative: Verwende ein anderes Standard-Theme**
```sql
-- Für Twenty Twenty-Three
UPDATE wp_options SET option_value = 'twentytwentythree' WHERE option_name = 'template';
UPDATE wp_options SET option_value = 'twentytwentythree' WHERE option_name = 'stylesheet';

-- Für Twenty Twenty-Two
UPDATE wp_options SET option_value = 'twentytwentytwo' WHERE option_name = 'template';
UPDATE wp_options SET option_value = 'twentytwentytwo' WHERE option_name = 'stylesheet';
```

5. **Nach der Änderung:**
   - Teste https://k4l1um.de
   - Die Seite sollte jetzt mit dem Standard-Theme laden
   - Dann können wir das Diablo 4-Theme Schritt für Schritt debuggen

## Was war das Problem?
Wahrscheinlich ein PHP-Syntax-Fehler oder ein fehlender `?>` Tag in einer der Theme-Dateien.

## Nächste Schritte
1. Seite mit Standard-Theme wieder online bringen
2. Theme-Dateien lokal auf Fehler prüfen
3. Korrigierte Version hochladen
