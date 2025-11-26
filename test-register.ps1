# Test register API
$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    fullname = "Test User"
    email = "test@example.com"
    password = "test123456"
    is_admin = $false
} | ConvertTo-Json

Write-Host "Testing register API..."
Write-Host "URL: https://fanpageschatbot.foxai.com.vn:8143/users"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "https://fanpageschatbot.foxai.com.vn:8143/users" `
        -Method Post `
        -Headers $headers `
        -Body $body `
        -SkipCertificateCheck
    
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Message: $($_.Exception.Message)"
    
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "Response: $responseBody"
}
