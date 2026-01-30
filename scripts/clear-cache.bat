@echo off
echo Clearing Next.js cache...
cd /d "%~dp0\..\frontend"
if exist .next (
    echo Stopping any running processes...
    taskkill /F /IM node.exe 2>nul
    timeout /t 2 /nobreak >nul
    echo Removing .next directory...
    rmdir /s /q .next 2>nul
    if exist .next (
        echo Some files are still locked. Please close your IDE/terminal and try again.
    ) else (
        echo ✅ Cache cleared successfully!
    )
) else (
    echo ⚠️  .next directory not found
)
pause
