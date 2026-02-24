$functions = @(
    "submit-complaint",
    "analysis-worker",
    "triage-agent",
    "chatbot",
    "list-complaints",
    "auth-register",
    "auth-login",
    "auth-profile",
    "list-department-complaints",
    "resolve-complaint",
    "list-user-complaints"
)

foreach ($fn in $functions) {
    Write-Host "Processing $fn..."
    $zipPath = "updates/$fn.zip"
    $distPath = "dist/$fn/*"
    
    if (Test-Path "dist/$fn") {
        Compress-Archive -Path $distPath -DestinationPath $zipPath -Force
        aws lambda update-function-code --function-name $fn --zip-file "fileb://$zipPath" --no-cli-pager
    } else {
        Write-Warning "Dist path not found for $fn"
    }
}
