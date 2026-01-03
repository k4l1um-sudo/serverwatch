$ftpServer = "ftp://k4l1um.de"
$username = "70429f56742u1"
$password = "AW31612w131287AW"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  DIABLO IV THEME FTP UPLOAD" -ForegroundColor Red
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Schritt 1: js/ Ordner sicherstellen
$createDirUri = "$ftpServer/wp-content/themes/custom-theme-3/js/"
Write-Host "Prüfe js/ Ordner..." -ForegroundColor Cyan

try {
    $request = [System.Net.FtpWebRequest]::Create($createDirUri)
    $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
    $request.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
    $request.EnableSsl = $true
    $response = $request.GetResponse()
    Write-Host "Ordner erstellt!" -ForegroundColor Green
    $response.Close()
}
catch {
    Write-Host "Ordner existiert bereits" -ForegroundColor Yellow
}

Write-Host ""

# Schritt 2: Alle Theme-Dateien hochladen
$files = @(
    @{Local="theme\style.css"; Remote="/wp-content/themes/custom-theme-3/style.css"; Name="style.css"},
    @{Local="theme\header.php"; Remote="/wp-content/themes/custom-theme-3/header.php"; Name="header.php"},
    @{Local="theme\footer.php"; Remote="/wp-content/themes/custom-theme-3/footer.php"; Name="footer.php"},
    @{Local="theme\index.php"; Remote="/wp-content/themes/custom-theme-3/index.php"; Name="index.php"},
    @{Local="theme\functions.php"; Remote="/wp-content/themes/custom-theme-3/functions.php"; Name="functions.php"},
    @{Local="theme\single.php"; Remote="/wp-content/themes/custom-theme-3/single.php"; Name="single.php"},
    @{Local="theme\page.php"; Remote="/wp-content/themes/custom-theme-3/page.php"; Name="page.php"},
    @{Local="theme\page-kontakt.php"; Remote="/wp-content/themes/custom-theme-3/page-kontakt.php"; Name="page-kontakt.php"},
    @{Local="theme\page-impressum.php"; Remote="/wp-content/themes/custom-theme-3/page-impressum.php"; Name="page-impressum.php"},
    @{Local="theme\page-datenschutz.php"; Remote="/wp-content/themes/custom-theme-3/page-datenschutz.php"; Name="page-datenschutz.php"},
    @{Local="theme\sidebar.php"; Remote="/wp-content/themes/custom-theme-3/sidebar.php"; Name="sidebar.php"},
    @{Local="theme\js\cookie-banner.js"; Remote="/wp-content/themes/custom-theme-3/js/cookie-banner.js"; Name="js/cookie-banner.js"}
)

Write-Host "Starte Upload von $($files.Count) Dateien..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$errorCount = 0

foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file.Local
    $ftpUri = "$ftpServer$($file.Remote)"
    
    Write-Host "[$($successCount + $errorCount + 1)/$($files.Count)] $($file.Name)" -ForegroundColor Yellow -NoNewline
    
    if (-not (Test-Path $localPath)) {
        Write-Host " - ÜBERSPRUNGEN" -ForegroundColor DarkGray
        continue
    }
    
    try {
        $request = [System.Net.FtpWebRequest]::Create($ftpUri)
        $request.Credentials = New-Object System.Net.NetworkCredential($username, $password)
        $request.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $request.UseBinary = $true
        $request.KeepAlive = $false
        $request.EnableSsl = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localPath)
        $request.ContentLength = $fileContent.Length
        
        $requestStream = $request.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $request.GetResponse()
        Write-Host " - ERFOLG" -ForegroundColor Green
        $response.Close()
        $successCount++
    }
    catch {
        Write-Host " - FEHLER: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Erfolgreich: $successCount | Fehler: $errorCount" -ForegroundColor $(if ($errorCount -eq 0) { "Green" } else { "Yellow" })
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Theme-URL: https://k4l1um.de" -ForegroundColor Cyan
Write-Host ""

