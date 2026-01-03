$ftpServer = "ftp://k4l1um.de"
$username = "70429f56742u1"
$password = "AW31612w131287AW"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Write-Host "==================================" -ForegroundColor Red
Write-Host "  THEME DEAKTIVIEREN (NOTFALL)" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Red
Write-Host ""

# Versuche den Theme-Ordner umzubenennen
Write-Host "Versuche Theme zu deaktivieren..." -ForegroundColor Cyan

try {
    $renameUri = "$ftpServer/wp-content/themes/"
    $request = [System.Net.FtpWebRequest]::Create("$renameUri")
    $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::Rename
    $request.RenameTo = "custom-theme-3-DISABLED"
    $request.EnableSsl = $true
    
    $response = $request.GetResponse()
    Write-Host "✓ Theme wurde deaktiviert!" -ForegroundColor Green
    Write-Host "WordPress sollte jetzt auf ein Standard-Theme zurückfallen." -ForegroundColor Green
    $response.Close()
}
catch {
    Write-Host "✗ Fehler beim Umbenennen: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "ALTERNATIVE: Über phpMyAdmin das Theme ändern:" -ForegroundColor Yellow
    Write-Host "1. Öffne: http://localhost:8081 (phpMyAdmin)" -ForegroundColor Cyan
    Write-Host "2. Wähle die WordPress-Datenbank" -ForegroundColor Cyan
    Write-Host "3. Führe aus:" -ForegroundColor Cyan
    Write-Host "   UPDATE wp_options SET option_value = 'twentytwentyfour' WHERE option_name = 'template';" -ForegroundColor White
    Write-Host "   UPDATE wp_options SET option_value = 'twentytwentyfour' WHERE option_name = 'stylesheet';" -ForegroundColor White
}

Write-Host ""
