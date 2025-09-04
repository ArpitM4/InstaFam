# PowerShell script to add dynamic export configs to API routes
$routesToFix = @(
    'app\api\users\creator\onboarding\route.js',
    'app\api\users\route.js',
    'app\api\test-notifications\route.js',
    'app\api\vault\route.js',
    'app\api\vault\claim\route.js',
    'app\api\award-points\route.js',
    'app\api\upload\route.js',
    'app\api\blogs\[id]\route.js',
    'app\api\explore\route.js',
    'app\api\notifications\read\route.js',
    'app\api\notifications\route.js',
    'app\api\payments\create-order\route.js',
    'app\api\payments\route.js',
    'app\api\paypal\execute-payment\route.js',
    'app\api\razorpay\route.js',
    'app\api\redemptions\route.js',
    'app\api\search\route.js',
    'app\api\stripe\route.js',
    'app\api\users\follow\[id]\route.js',
    'app\api\users\profile\route.js',
    'app\api\users\[id]\route.js'
)

$exportConfig = @'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
'@

foreach ($route in $routesToFix) {
    $fullPath = "c:\Users\Arpit\Desktop\Coding\Web Dev\Next JS\InstaFam\$route"
    if (Test-Path $fullPath) {
        Write-Host "Processing: $route"
        $content = Get-Content $fullPath -Raw
        
        # Check if already has the exports
        if (-not ($content -match "export const runtime")) {
            # Find the end of imports (after the last import or require statement)
            $lines = $content -split "`n"
            $insertIndex = 0
            
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import\s|^const\s.*require\(" -and $lines[$i] -notmatch "^import\s*{" -or $lines[$i] -match "^import\s*{.*}\s*from") {
                    $insertIndex = $i + 1
                }
            }
            
            # Insert the export config after imports
            $newLines = @()
            $newLines += $lines[0..($insertIndex-1)]
            $newLines += $exportConfig
            $newLines += $lines[$insertIndex..($lines.Length-1)]
            
            $newContent = $newLines -join "`n"
            Set-Content $fullPath $newContent -Encoding UTF8
            Write-Host "Added dynamic config to: $route"
        } else {
            Write-Host "Already configured: $route"
        }
    } else {
        Write-Host "File not found: $route"
    }
}

Write-Host "Completed processing all routes!"
