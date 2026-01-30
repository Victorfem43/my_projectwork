@echo off
echo Checking MongoDB status...

netstat -an | findstr ":27017" >nul
if %errorlevel% equ 0 (
    echo MongoDB is already running on port 27017
    goto :end
)

echo MongoDB is not running.
echo.
echo Starting MongoDB...
echo.

REM Try to start MongoDB service
net start MongoDB 2>nul
if %errorlevel% equ 0 (
    echo MongoDB service started successfully
    goto :end
)

echo.
echo Could not start MongoDB automatically.
echo.
echo Please start MongoDB manually using one of these methods:
echo.
echo 1. Start MongoDB service:
echo    net start MongoDB
echo.
echo 2. Run MongoDB directly:
echo    "C:\Program Files\MongoDB\Server\<version>\bin\mongod.exe"
echo.
echo 3. Use MongoDB Atlas (cloud) - Update MONGODB_URI in .env file
echo    https://www.mongodb.com/cloud/atlas
echo.

:end
pause
