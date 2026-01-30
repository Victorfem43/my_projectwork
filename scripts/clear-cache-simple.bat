@echo off
echo ========================================
echo   Clear Next.js Cache
echo ========================================
echo.

cd /d "%~dp0\..\frontend"

if not exist .next (
    echo .next directory not found - cache may already be cleared
    pause
    exit /b
)

echo WARNING: Please stop your server first (Ctrl+C)
echo.
echo Press any key to continue after stopping the server...
pause >nul

echo.
echo Removing .next directory...
rmdir /s /q .next 2>nul

if exist .next (
    echo.
    echo ERROR: Could not remove .next directory
    echo Some files may be locked. Please:
    echo   1. Close your IDE/terminal completely
    echo   2. Run this script again
    echo.
) else (
    echo.
    echo SUCCESS: Cache cleared!
    echo.
    echo You can now restart your server with: npm run dev
    echo.
)

pause
