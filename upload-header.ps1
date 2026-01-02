$ftpServer = "ftp://k4l1um.de"
$username = "70429f56742u1"
$password = "AW31612w131287AW"

[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

$localPath = Join-Path $PSScriptRoot "theme\header.php"
$ftpUri = "$ftpServer/wp-content/themes/custom-theme-3/header.php"

Write-Host "Uploading header.php..." -ForegroundColor Cyan

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
    Write-Host "Erfolgreich hochgeladen!" -ForegroundColor Green
    Write-Host "Titel geaendert zu: Hello World!" -ForegroundColor Yellow
    $response.Close()
}
catch {
    Write-Host "Fehler: $($_.Exception.Message)" -ForegroundColor Red
}
