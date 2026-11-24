@echo off
title Pushing MediBook to GitHub
cd /d "C:\Users\admin\Desktop\doctor-appointment"
echo ============================================================
echo   Pushing MediBook to GitHub
echo   Repository: https://github.com/poorvivs06/MediBook-Doctor-Appointment-.git
echo ============================================================
echo.
"C:\Users\admin\AppData\Local\Programs\Git\cmd\git.exe" push -u origin main
echo.
echo ============================================================
pause
