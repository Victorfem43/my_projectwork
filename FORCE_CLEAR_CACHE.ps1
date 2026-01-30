# Force Clear Cache Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FORCE CLEAR CACHE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3
Write-Host "  ✓ Node processes stopped" -ForegroundColor Green

# Step 2: Navigate to frontend
$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

# Step 3: Clear cache
Write-Host "Step 2: Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    try {
        # Try to remove files individually first
        Get-ChildItem ".next" -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
        Remove-Item ".next" -Force -Recurse -ErrorAction Stop
        Write-Host "  ✓ Cache cleared successfully!" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Some files are locked" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please do this:" -ForegroundColor Yellow
        Write-Host "  1. Close Cursor/VS Code completely" -ForegroundColor White
        Write-Host "  2. Close all terminal windows" -ForegroundColor White
        Write-Host "  3. Run this script again" -ForegroundColor White
        Write-Host ""
        Write-Host "OR manually delete: frontend\.next folder" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ✓ Cache already cleared" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DONE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Open your IDE" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor Green
Write-Host "  3. Hard refresh browser: Ctrl+Shift+R" -ForegroundColor Green
Write-Host ""

Set-Location $PSScriptRoot
