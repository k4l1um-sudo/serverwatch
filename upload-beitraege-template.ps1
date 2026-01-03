$ftpServer = "k4l1um.de"
$ftpUsername = "70429f56742u1"
$ftpPassword = "AW31612w131287AW"
$remoteDir = "/wp-content/themes/custom-theme-3"

$localFile = "theme/page-alle-beitraege.php"
$remoteFile = "$remoteDir/page-alle-beitraege.php"

Write-Host "Uploading $localFile..." -ForegroundColor Yellow

try {
    $uri = "ftp://$ftpServer$remoteFile"
    $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
    $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    $ftpRequest.UseBinary = $true
    $ftpRequest.UsePassive = $true
    $ftpRequest.EnableSsl = $true
    $ftpRequest.Timeout = 30000
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    
    $fileContent = [System.IO.File]::ReadAllBytes($localFile)
    $ftpRequest.ContentLength = $fileContent.Length
    
    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    $response = $ftpRequest.GetResponse()
    Write-Host "OK: Template 'Alle Beitraege' erfolgreich hochgeladen!" -ForegroundColor Green
    $response.Close()
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}
