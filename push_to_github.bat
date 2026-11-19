@echo off
echo ==============================================
echo   Dota 2D - GitHubga yuklash (Push)
echo ==============================================
echo.
echo 1. Avval GitHub profilingizda (https://github.com/new)
echo    nomi "dota-2d" bo'lgan yangi repozitoriy oching.
echo.
echo 2. Loyihani GitHubga yuborish boshlanmoqda...
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [MUVAFFAQINATLI] O'yin GitHubga muvaffaqiyatli yuklandi!
    echo Havola: https://github.com/d3000871-ui/dota-2d
) else (
    echo [XATOLIK] Repozitoriy hali GitHubda yaratilmagan bo'lishi mumkin.
    echo Iltimos, https://github.com/new manziliga kiring va "dota-2d" nomli repo yarating, keyin yana shu faylni ishga tushiring!
)
pause

