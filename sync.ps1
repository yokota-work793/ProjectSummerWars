# 全員：1分ごとに GitHub の最新を取る（start.ps1 が自動で開く。この窓を閉じると止まる）
# 画面（React）の変更はブラウザにすぐ出る。Java が変わったときは、起動し直すよう知らせる
$root = $PSScriptRoot
Set-Location $root
$host.UI.RawUI.WindowTitle = "自動で最新を取る（1分ごと）"
Write-Host "1分ごとに GitHub の最新を取ります。止めるときはこの窓を閉じてください" -ForegroundColor Cyan

while ($true) {
    $branch = git rev-parse --abbrev-ref HEAD
    if ($branch -ne "main") {
        Write-Host "$(Get-Date -Format HH:mm) いまは main ではなく $branch にいるので、自動では取りません" -ForegroundColor DarkYellow
    } else {
        git fetch --quiet
        $behind = [int](git rev-list --count HEAD..origin/main)
        if ($behind -gt 0) {
            $files = git diff --name-only HEAD origin/main
            git pull --ff-only --quiet
            if ($LASTEXITCODE -eq 0) {
                Write-Host "$(Get-Date -Format HH:mm) 最新にしました（$behind 件）" -ForegroundColor Green
                git log --oneline -n $behind | ForEach-Object { Write-Host "    $_" }
                if ($files -match '^src/|^build\.gradle') {
                    Write-Host "  ★ Java が変わりました。Java の窓で Ctrl+C → Y → .\gradlew bootRun で起動し直してください" -ForegroundColor Yellow
                }
                if ($files -match '^frontend/package\.json') {
                    Write-Host "  ★ 画面の部品が変わりました。React の窓で Ctrl+C → npm install → npm run dev" -ForegroundColor Yellow
                }
            } else {
                Write-Host "$(Get-Date -Format HH:mm) 自分の変更とぶつかったので取れませんでした。先に .\save.ps1 で保存してください" -ForegroundColor Red
            }
        }
    }
    Start-Sleep -Seconds 60
}
