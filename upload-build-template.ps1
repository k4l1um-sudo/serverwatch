$ftpServer = "k4l1um.de"
$ftpUsername = "70429f56742u1"
$ftpPassword = "AW31612w131287AW"
$remoteDir = "/wp-content/themes/custom-theme-3"

$files = @(
    "theme/page-build-guide.php",
    "theme/style.css"
)

Write-Host "Uploading Build Template..." -ForegroundColor Cyan

foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file
    $fileName = Split-Path $file -Leaf
    $remotePath = "$remoteDir/$fileName"
    
    if (Test-Path $localPath) {
        try {
            Write-Host "Uploading $file..." -ForegroundColor Yellow
            
            $uri = "ftp://$ftpServer$remotePath"
            $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.UseBinary = $true
            $ftpRequest.UsePassive = $true
            $ftpRequest.EnableSsl = $true
            $ftpRequest.Timeout = 30000
            [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
            
            $fileContent = [System.IO.File]::ReadAllBytes($localPath)
            $ftpRequest.ContentLength = $fileContent.Length
            
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            $response = $ftpRequest.GetResponse()
            Write-Host "OK: $file" -ForegroundColor Green
            $response.Close()
        }
        catch {
            Write-Host "ERROR: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nBuild Template uploaded!" -ForegroundColor Cyan
