# List of API routes that need the dynamic configuration
$routesToFix = @(
    'app\api\analytics\track\route.js',
    'app\api\creator\onboarding\route.js',
    'app\api\blogs\edit\[id]\route.js',
    'app\api\debug\user-account-type\route.js',
    'app\api\discount-codes\apply\route.js',
    'app\api\notifications\[id]\route.js',
    'app\api\notifications\followers\event\route.js',
    'app\api\notifications\mark-all-read\route.js',
    'app\api\points\test\route.js',
    'app\api\redemptions\[redemptionId]\answer\route.js',
    'app\api\redemptions\[redemptionId]\fulfill\route.js',
    'app\api\redemptions\fan\[creatorUsername]\route.js',
    'app\api\redemptions\fulfilled\route.js',
    'app\api\users\[id]\follow\route.js',
    'app\api\vault\[creatorUsername]\route.js',
    'app\api\vault\add\route.js',
    'app\api\vault\delete\[itemId]\route.js',
    'app\api\vault\redeem\route.js',
    'app\api\vault\redeemed\[creatorUsername]\route.js'
)

$exportLines = @(
    '',
    'export const runtime = "nodejs";',
    'export const dynamic = "force-dynamic";'
)

$baseDir = "c:\Users\Arpit\Desktop\Coding\Web Dev\Next JS\InstaFam\"

foreach ($route in $routesToFix) {
    $fullPath = Join-Path $baseDir $route
    if (Test-Path $fullPath) {
        Write-Host "Processing: $route"
        $content = Get-Content $fullPath -Raw
        
        # Check if already has the runtime export
        if (-not ($content -match "export\s+const\s+runtime\s*=")) {
            # Split content into lines
            $lines = $content -split "`r?`n"
            
            # Find the end of the import section
            $insertIndex = 0
            for ($i = 0; $i -lt $lines.Length; $i++) {
                if ($lines[$i] -match "^import\s" -or $lines[$i] -match "^const\s.*=\s*require") {
                    $insertIndex = $i + 1
                }
            }
            
            # Insert export configs after imports
            $newLines = @()
            if ($insertIndex -gt 0) {
                $newLines += $lines[0..($insertIndex-1)]
            }
            $newLines += $exportLines
            if ($insertIndex -lt $lines.Length) {
                $newLines += $lines[$insertIndex..($lines.Length-1)]
            }
            
            $newContent = $newLines -join "`n"
            Set-Content $fullPath $newContent -Encoding UTF8 -NoNewline
            Write-Host "Added dynamic config to: $route"
        } else {
            Write-Host "Already configured: $route"
        }
    } else {
        Write-Host "File not found: $route"
    }
}

Write-Host ""
Write-Host "Completed processing all routes!"
Write-Host "You can now run npm run build to test the build process."
