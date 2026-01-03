$ftpServer = "k4l1um.de"
$ftpUsername = "70429f56742u1"
$ftpPassword = Read-Host -Prompt "FTP Password" -AsSecureString
$ftpPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($ftpPassword))
$remoteDir = "/wp-content/themes/custom-theme-3"

$filesToDelete = @(
    "/style.css",
    "/functions.php",
    "/header.php",
    "/footer.php",
    "/index.php",
    "/single.php",
    "/page.php",
    "/sidebar.php",
    "/comments.php",
    "/page-impressum.php",
    "/page-datenschutz.php",
    "/page-kontakt.php",
    "/js/cookie-banner.js",
    "/js/stars.js"
)

Write-Host "Deleting Diablo Theme files from FTP..." -ForegroundColor Cyan

foreach ($file in $filesToDelete) {
    $remotePath = "$remoteDir$file"
    
    try {
        Write-Host "Deleting $remotePath..." -ForegroundColor Yellow
        
        $uri = "ftp://$ftpServer$remotePath"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUsername, $ftpPassword)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::DeleteFile
        $ftpRequest.UsePassive = $true
        $ftpRequest.EnableSsl = $true
        $ftpRequest.Timeout = 30000
        [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
        
        $response = $ftpRequest.GetResponse()
        Write-Host "DELETED: $file" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "SKIP: $file - $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host "`nDeletion complete!" -ForegroundColor Cyan
Write-Host "Note: Directories must be deleted manually via FTP client if needed" -ForegroundColor Yellow
