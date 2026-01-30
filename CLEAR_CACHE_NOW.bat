@echo off
echo ========================================
echo   CLEARING NEXT.JS CACHE
echo ========================================
echo.

echo IMPORTANT: Make sure your server is stopped (Ctrl+C)
echo.
pause

cd /d "%~dp0frontend"

if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
    if exist .next (
        echo.
        echo ERROR: Could not remove .next directory
        echo Some files are locked. Please:
        echo   1. Stop your server completely (Ctrl+C)
        echo   2. Close your IDE/terminal
        echo   3. Run this script again
        echo.
    ) else (
        echo.
        echo SUCCESS: Cache cleared!
        echo.
    )
) else (
    echo Cache already cleared (.next not found)
    echo.
)

cd ..

echo ========================================
echo   CACHE CLEARED!
echo ========================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Hard refresh browser: Ctrl+Shift+R
echo.
pause
