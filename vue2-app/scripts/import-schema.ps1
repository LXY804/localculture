$ErrorActionPreference = "Stop"

# Defaults (can be overridden by env vars or prompt)
$host = $env:DB_HOST
if (-not $host -or $host -eq "") { $host = "127.0.0.1" }

$port = $env:DB_PORT
if (-not $port -or $port -eq "") { $port = "3306" }

$user = $env:DB_USER
if (-not $user -or $user -eq "") { $user = "root" }

$db = $env:DB_NAME
if (-not $db -or $db -eq "") { $db = "localculture" }

$schemaPath = Join-Path $PSScriptRoot "..\server\schema.sql"
$schemaPath = [System.IO.Path]::GetFullPath($schemaPath)

Write-Host "MySQL Host:" $host " Port:" $port " User:" $user " DB:" $db
$securePwd = Read-Host -AsSecureString "请输入 MySQL 密码 (输入时不显示)"
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
$plainPwd = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

# Use cmd for input redirection compatibility
$cmd = "mysql -h $host -P $port -u $user -p$plainPwd < `"$schemaPath`""
Write-Host "执行：" $cmd
cmd /c $cmd

if ($LASTEXITCODE -eq 0) {
  Write-Host "导入完成" -ForegroundColor Green
  exit 0
} else {
  Write-Error ("导入失败，退出码：" + $LASTEXITCODE)
  exit $LASTEXITCODE
}


