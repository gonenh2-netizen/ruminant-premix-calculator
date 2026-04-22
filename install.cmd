@echo off
REM Convenience wrapper — double-click install.cmd to run install.ps1
REM (bypasses the default PowerShell execution policy that blocks .ps1 double-click)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1"
pause
