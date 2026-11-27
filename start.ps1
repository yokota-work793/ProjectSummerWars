# 全員：管理画面をまとめて起動する（最新を取る → Java → React → 自動で最新を取り続ける）
# 使い方：PowerShell で  cd ~\ProjectSummerWars  →  .\start.ps1
$root = $PSScriptRoot
Set-Location $root

Write-Host "最新を取っています（git pull）..." -ForegroundColor Cyan
git pull --ff-only
if ($LASTEXITCODE -ne 0) {
    Write-Host "git pull できませんでした。自分の変更があるなら先に .\save.ps1 で保存してください（README の「うまくいかないとき」も参照）" -ForegroundColor Red
    exit 1
}

Write-Host "画面の部品を確認しています（npm install）..." -ForegroundColor Cyan
Push-Location "$root\frontend"
npm install
Pop-Location

# 3つの窓を開く：Java（5124）・React（5123）・自動で最新を取る
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; `$host.UI.RawUI.WindowTitle = 'Java（API・5124）閉じない'; .\gradlew bootRun"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend'; `$host.UI.RawUI.WindowTitle = 'React（画面・5123）閉じない'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$root\sync.ps1"

Write-Host "起動しています。少し待つとブラウザで http://localhost:5123 が開きます（初回は Java の準備に数分かかります）" -ForegroundColor Green
Start-Sleep -Seconds 25
Start-Process "http://localhost:5123"
