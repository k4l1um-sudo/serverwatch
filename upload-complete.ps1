$ftpServer = "ftp://k4l1um.de"
$username = "70429f56742u1"
$password = "AW31612w131287AW"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

# Schritt 1: js/ Ordner erstellen
$createDirUri = "$ftpServer/wp-content/themes/custom-theme-3/js/"
Write-Host "Erstelle Ordner: $createDirUri" -ForegroundColor Cyan

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
    Write-Host "Ordner existiert bereits oder Fehler: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Schritt 2: Dateien hochladen
$files = @(
    @{Local="theme\js\stars.js"; Remote="/wp-content/themes/custom-theme-3/js/stars.js"},
    @{Local="theme\js\cookie-banner.js"; Remote="/wp-content/themes/custom-theme-3/js/cookie-banner.js"}
)

foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file.Local
    $ftpUri = "$ftpServer$($file.Remote)"
    
    Write-Host "`nUploading: $($file.Local)" -ForegroundColor Yellow
    
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
        Write-Host "Erfolg!" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "Fehler: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nFertig!" -ForegroundColor Green
