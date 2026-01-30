# Clear Next.js Cache Script
Write-Host "🧹 Clearing Next.js cache..." -ForegroundColor Cyan

# Navigate to frontend directory
$frontendPath = Join-Path $PSScriptRoot "..\frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    Write-Host "📁 Changed to frontend directory" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Check if .next directory exists
if (Test-Path ".next") {
    Write-Host "🔍 Found .next directory" -ForegroundColor Yellow
    
    # Try to stop any Node processes (optional - user can do this manually)
    Write-Host "⚠️  Please stop your server first (Ctrl+C in the terminal)" -ForegroundColor Yellow
    Write-Host "   Press any key to continue after stopping the server..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    # Remove .next directory
    Write-Host "🗑️  Removing .next directory..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force ".next" -ErrorAction Stop
        Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error clearing cache: $_" -ForegroundColor Red
        Write-Host "💡 Try closing your IDE/terminal and running this script again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⚠️  .next directory not found (cache may already be cleared)" -ForegroundColor Yellow
}

# Also clear node_modules cache if it exists
if (Test-Path "node_modules\.cache") {
    Write-Host "🗑️  Removing node_modules cache..." -ForegroundColor Yellow
    try {
        Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction Stop
        Write-Host "✅ Node modules cache cleared!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Could not clear node_modules cache (this is okay)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ Done! You can now restart your server with: npm run dev" -ForegroundColor Green
Write-Host ""
