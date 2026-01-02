$ftpServer = "ftp://k4l1um.de"
$username = "70429f56742u1"
$password = "AW31612w131287AW"

# SSL-Zertifikat-Validierung deaktivieren
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$files = @(
    @{Local="theme\js\stars.js"; Remote="/wp-content/themes/custom-theme-3/js/stars.js"},
    @{Local="theme\js\cookie-banner.js"; Remote="/wp-content/themes/custom-theme-3/js/cookie-banner.js"}
)

Write-Host "FTP Upload wird gestartet..." -ForegroundColor Cyan

foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file.Local
    $ftpUri = "$ftpServer$($file.Remote)"
    
    Write-Host "`nUploading: $($file.Local)" -ForegroundColor Yellow
    Write-Host "Ziel: $ftpUri" -ForegroundColor Gray
    
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
        Write-Host "Erfolg: $($response.StatusDescription)" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "Fehler: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nUpload abgeschlossen!" -ForegroundColor Green
