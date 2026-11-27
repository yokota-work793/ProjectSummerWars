# 全員：自分の変更をコミットして GitHub に送る（push）。送るとほかの人の PC にも1分以内に入る（sync.ps1 を動かしている場合）
# 使い方：.\save.ps1 "【横田担当】残業のルールを直しました"
# 注意：自分の担当外のファイルは変えない。鍵ファイル・パスワードは入れない（.gitignore 済み）
param([Parameter(Mandatory = $true)][string]$Message)
$root = $PSScriptRoot
Set-Location $root

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "保存する変更がありません" -ForegroundColor DarkYellow; exit 0 }

git pull --rebase
if ($LASTEXITCODE -ne 0) {
    Write-Host "ほかの人の変更とぶつかりました。git rebase --abort で元に戻して、担当者に相談してください" -ForegroundColor Red
    exit 1
}

git push
if ($LASTEXITCODE -eq 0) {
    Write-Host "GitHub に送りました（push 済み）" -ForegroundColor Green
} else {
    Write-Host "push できませんでした。GitHub にログインしているか確認してください" -ForegroundColor Red
}
