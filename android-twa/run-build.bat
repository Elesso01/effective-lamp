@echo off
set JAVA_HOME=C:\Users\HP\AppData\Local\Android\jdk17\jdk-17.0.20.1+1
set ANDROID_HOME=C:\Users\HP\AppData\Local\Android\sdk
set ANDROID_SDK_ROOT=C:\Users\HP\AppData\Local\Android\sdk
cd /d "C:\Users\HP\Documents\effective-lamp\android-twa"
C:\Users\HP\AppData\Local\Android\gradle-8.10.2\bin\gradle.bat assembleRelease --console=plain --no-daemon
echo EXITCODE=%ERRORLEVEL%
