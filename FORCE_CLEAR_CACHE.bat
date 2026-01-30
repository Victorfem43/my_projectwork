@echo off
echo ========================================
echo   FORCE CLEAR CACHE - STOP ALL PROCESSES
echo ========================================
echo.

echo Step 1: Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Stopping Next.js processes...
taskkill /F /IM next.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 3: Clearing cache...
cd /d "%~dp0frontend"

if exist .next (
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
    timeout /t 1 /nobreak >nul
    
    if exist .next (
        echo.
        echo WARNING: Some files are still locked!
        echo.
        echo Please:
        echo   1. Close Cursor/VS Code completely
        echo   2. Close all terminal windows
        echo   3. Run this script again
        echo.
        echo OR manually delete: frontend\.next folder
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
echo   DONE
echo ========================================
echo.
echo Next steps:
echo   1. Open your IDE
echo   2. Run: npm run dev
echo   3. Hard refresh browser: Ctrl+Shift+R
echo.
pause
