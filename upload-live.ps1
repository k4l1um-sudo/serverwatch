$ftpServer = "k4l1um.de"
$ftpUsername = "70429f56742u1"
$ftpPassword = Read-Host -Prompt "FTP Password" -AsSecureString
$ftpPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPassword))
$remoteDir = "/wp-content/themes/custom-theme-3"

$files = @(
    "theme/style.css",
    "theme/functions.php",
    "theme/header.php",
    "theme/footer.php",
    "theme/index.php",
    "theme/single.php",
    "theme/page.php",
    "theme/sidebar.php",
    "theme/comments.php",
    "theme/page-impressum.php",
    "theme/page-datenschutz.php",
    "theme/page-kontakt.php",
    "theme/js/cookie-banner.js"
)

Write-Host "Starting FTP upload..." -ForegroundColor Cyan

foreach ($file in $files) {
    $localPath = Join-Path $PSScriptRoot $file
    $fileName = Split-Path $file -Leaf
    $fileDir = Split-Path ($file -replace 'theme/', '') -Parent
    
    if ($fileDir) {
        $remotePath = "$remoteDir/$fileDir/$fileName"
    } else {
        $remotePath = "$remoteDir/$fileName"
    }
    
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
    else {
        Write-Host "NOT FOUND: $file" -ForegroundColor Red
    }
}

Write-Host "Upload complete!" -ForegroundColor Cyan
