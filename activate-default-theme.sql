-- WordPress Standard-Theme aktivieren
-- Führe dies in phpMyAdmin oder MySQL aus

-- Zeige aktuelles Theme
SELECT option_name, option_value 
FROM wp_options 
WHERE option_name IN ('template', 'stylesheet');

-- Setze auf Twenty Twenty-Four (WordPress Standard-Theme)
UPDATE wp_options 
SET option_value = 'twentytwentyfour' 
WHERE option_name = 'template';

UPDATE wp_options 
SET option_value = 'twentytwentyfour' 
WHERE option_name = 'stylesheet';

-- Alternativ Twenty Twenty-Three:
-- UPDATE wp_options SET option_value = 'twentytwentythree' WHERE option_name IN ('template', 'stylesheet');

-- Prüfe Änderung
SELECT option_name, option_value 
FROM wp_options 
WHERE option_name IN ('template', 'stylesheet');
