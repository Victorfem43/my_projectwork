# Comprehensive Tailwind CSS Fix Script
Write-Host "🔧 Fixing Tailwind CSS..." -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
$rootPath = Join-Path $PSScriptRoot ".."
Set-Location $rootPath

# Step 1: Stop any running processes
Write-Host "1️⃣  Stopping any running Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clear Next.js cache
Write-Host "2️⃣  Clearing Next.js cache..." -ForegroundColor Yellow
$frontendPath = Join-Path $rootPath "frontend"
if (Test-Path (Join-Path $frontendPath ".next")) {
    try {
        Remove-Item -Recurse -Force (Join-Path $frontendPath ".next") -ErrorAction Stop
        Write-Host "   ✅ Cache cleared" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Some files locked. Please close IDE/terminal and run again." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✅ Cache already cleared" -ForegroundColor Green
}

# Step 3: Verify Tailwind config exists
Write-Host "3️⃣  Verifying Tailwind configuration..." -ForegroundColor Yellow
$tailwindConfig = Join-Path $frontendPath "tailwind.config.js"
$postcssConfig = Join-Path $frontendPath "postcss.config.js"
$globalsCss = Join-Path $frontendPath "app\globals.css"

if (Test-Path $tailwindConfig) {
    Write-Host "   ✅ tailwind.config.js found" -ForegroundColor Green
} else {
    Write-Host "   ❌ tailwind.config.js NOT FOUND!" -ForegroundColor Red
}

if (Test-Path $postcssConfig) {
    Write-Host "   ✅ postcss.config.js found" -ForegroundColor Green
} else {
    Write-Host "   ❌ postcss.config.js NOT FOUND!" -ForegroundColor Red
}

if (Test-Path $globalsCss) {
    Write-Host "   ✅ globals.css found" -ForegroundColor Green
    $cssContent = Get-Content $globalsCss -Raw
    if ($cssContent -match "@tailwind") {
        Write-Host "   ✅ Tailwind directives found in globals.css" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Tailwind directives NOT FOUND in globals.css!" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ globals.css NOT FOUND!" -ForegroundColor Red
}

# Step 4: Check if Tailwind is installed
Write-Host "4️⃣  Checking Tailwind installation..." -ForegroundColor Yellow
Set-Location $frontendPath
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
if ($packageJson.devDependencies.tailwindcss) {
    Write-Host "   ✅ Tailwind CSS installed (v$($packageJson.devDependencies.tailwindcss))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Tailwind CSS NOT INSTALLED!" -ForegroundColor Red
    Write-Host "   Run: cd frontend && npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Fix complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Make sure all files above are ✅" -ForegroundColor White
Write-Host "   2. Run: npm run dev" -ForegroundColor Green
Write-Host "   3. Hard refresh browser: Ctrl+Shift+R" -ForegroundColor Green
Write-Host ""

Set-Location $rootPath
