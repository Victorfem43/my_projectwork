@echo off
echo ========================================
echo   FINAL CACHE CLEAR
echo ========================================
echo.

echo Step 1: Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul

echo Step 2: Clearing Next.js cache...
cd /d "%~dp0frontend"

if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
    timeout /t 2 /nobreak >nul
    
    if exist .next (
        echo.
        echo WARNING: Cache files are still locked!
        echo.
        echo Please:
        echo   1. Close Cursor/VS Code completely
        echo   2. Close ALL terminal windows
        echo   3. Run this script again
        echo.
        echo OR manually delete: frontend\.next folder
        echo.
        pause
        exit /b 1
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
echo   1. Open your IDE
echo   2. Run: npm run dev
echo   3. Wait for compilation
echo   4. Hard refresh browser: Ctrl+Shift+R
echo.
pause
