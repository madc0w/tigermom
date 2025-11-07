@echo off
setlocal

REM Configure test environment variables
set "MONGODB_URI=mongodb+srv://db_user:QQ5RXw1amX7ZqCG7@test.2wsfopb.mongodb.net/?appName=test"
set "MONGODB_DB=test"

echo.
echo Starting Nuxt dev with:
echo   MONGODB_URI=%MONGODB_URI%
echo   MONGODB_DB=%MONGODB_DB%
echo.

REM Launch the app (Nuxt dev server)
call npm run dev

endlocal
