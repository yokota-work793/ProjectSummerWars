# 勤怠・給与集計システム

社員管理・月次集計・交通費/経費フォームの取り込み・社労士へのCSV送付を行う社内システム。
**画面は React（`frontend/`）、データと計算は Java（Spring Boot の API・`src/`）。** 画面は API（`/api/...`）を呼ぶだけで、計算や判断は Java に書く。
給与計算そのものは社労士が行う。このシステムは、社労士に渡すデータ（1人×1か月）を正しく集めてまとめる。
**Java 版はまだ構築中。** GAS 版は 2026-11-26 に停止済み（トリガー削除・デプロイのアーカイブ・メニュー非表示。社員管理表は「旧_社員管理表」として残してある）。

## 分担（だれが・何を）
| 人 | 担当 | 担当フォルダ・ファイル | まずやること |
|---|---|---|---|
| 指輪 | 画面・設定・全体のまとめ | `frontend/`（React の画面すべて）、`src/main/java/app/kintai/settings/`、`config/HomeController.java`、`src/test/java/app/kintai/ScreensTest.java` | 全体の調整及びシステムの土台を作成 |
| 横田 | 勤怠シートの読み取り・**集計ルール** | `src/main/java/app/kintai/attendance/`、`aggregate/`、それぞれのテスト | 社労士に集計ルールを確認し、テスト→AggregationRules の順で直す |
| 山川 | 月次集計・交通費経費・ログイン・DB | `src/main/java/app/kintai/monthly/`、`expense/`、`config/SecurityConfig.java`、`src/main/resources/db/migration/`、それぞれのテスト | 社労士が読める CSV の形を確認し、MonthlyColumns を合わせる |
| 宮谷 | 社員管理・Google 連携 | `src/main/java/app/kintai/employee/`、`google/`、そのテスト | サービスアカウントを作り、本物の Google で登録〜共有を確かめる |
| 全員 | 共通部分 | `common/`、`KintaiApplication.java`、`application.yml`、`build.gradle` など | 変えるときはチームに相談 |

**自分の担当外のファイルは変更しない。** 変えてほしいときは担当者に伝える（Issue か Pull Request に名前を書く）。
各フォルダの README.md に「担当内容」と「AIへの指示プロンプト（担当外を変更しない指示入り）」がある。AI に頼むときはそれをコピーして使う。

## ファイルの場所（細かく）
```
ProjectSummerWars/
├─ README.md ・・・・・・・・・・ このファイル（全員）
├─ build.gradle / settings.gradle ・ ビルド設定（全員・変えるときは相談）
├─ gradlew / gradlew.bat / gradle/wrapper/ ・ Gradle を自動で用意するもの（触らない）
├─ .gitignore ・・・・・・・・・・ Git に入れないファイル（鍵・.env）
├─ .devcontainer/devcontainer.json ・ Codespaces の開発環境
├─ .github/workflows/build.yml ・・ push するとビルドとテストが自動で動く
├─ frontend/ ・・・・・・・・・・ 【指輪】画面（React + Vite）。詳しくは frontend/README.md
│  ├─ src/pages/ ・・・・・・・ 画面ごとのファイル（Login・EmployeeList・EmployeeForm・Monthly・Settings）
│  ├─ src/api.js ・・・・・・・ Java の API を呼ぶ窓口
│  ├─ src/Layout.jsx ・・・・ 左メニュー・お知らせ表示
│  ├─ src/app.css ・・・・・・ 見た目
│  └─ vite.config.js ・・・・ 画面は 5123、/api は 5124 の Java へ中継（つながりは下の「全体のイメージ」）
└─ src/
   ├─ main/java/app/kintai/
   │  ├─ KintaiApplication.java ・・ 起動クラス（全員・触らない）
   │  ├─ aggregate/ ・・・・・・・・ 【横田】集計ルール
   │  │   ├─ AggregationRules.java ・ 残業・深夜・休日などの計算ルール
   │  │   └─ MonthlySummary.java ・・ 計算の結果（分）
   │  ├─ attendance/ ・・・・・・・ 【横田】勤怠シートの読み取り
   │  │   ├─ AttendanceReader.java ・ 勤怠シートを読む
   │  │   ├─ MonthSheetParser.java ・ 日ごとの勤怠にする・入力チェック
   │  │   ├─ DayRecord.java / MonthSheet.java ・ 1日分・1か月分
   │  │   └─ MonthSheetService.java ・ 全員の勤怠シートに月のシートを作る
   │  ├─ employee/ ・・・・・・・・ 【宮谷】社員管理
   │  │   ├─ Employee.java / ProjectAssignment.java ・ 社員・案件
   │  │   ├─ EmployeeRepository.java ・ 社員の検索
   │  │   ├─ EmployeeForm.java ・・・ 画面の入力とチェック
   │  │   ├─ EmployeeService.java ・ 登録・変更・削除・勤怠シート作成・共有
   │  │   ├─ EmployeeController.java ・ 社員管理の API（/api/employees）
   │  │   └─ EmployeeImport.java ・・ GAS版社員管理表の読み込み
   │  ├─ google/ ・・・・・・・・・ 【宮谷】Google の窓口
   │  │   ├─ GoogleWorkspace.java ・ できること一覧
   │  │   ├─ GoogleRestWorkspace.java ・ 本物（Sheets/Drive API）
   │  │   ├─ FakeGoogleWorkspace.java ・ 仮データ
   │  │   └─ GoogleConfig.java ・・・ 本物か仮かの切り替え
   │  ├─ monthly/ ・・・・・・・・ 【山川】月次集計・社労士への送付
   │  │   ├─ MonthlyService.java ・・ 集計の流れ・確定・CSV・メール
   │  │   ├─ MonthlyController.java ・ 月次集計の API（/api/monthly）
   │  │   ├─ MonthlyRecord.java / MonthlyRecordRepository.java ・ 月次集計の表
   │  │   ├─ MonthlyColumns.java ・・ 画面とCSVの列
   │  │   └─ CsvExporter.java ・・・ CSV にする
   │  ├─ expense/ ・・・・・・・・ 【山川】交通費・経費
   │  │   ├─ ExpenseTotals.java ・・ 承認済みの金額を合計
   │  │   └─ ExpenseService.java ・・ 回答シートを読む
   │  ├─ config/
   │  │   ├─ SecurityConfig.java ・・ 【山川】ログイン
   │  │   └─ HomeController.java ・・ 【指輪】画面の URL に React を返す・/api/me
   │  ├─ settings/ ・・・・・・・・ 【指輪】画面「設定」
   │  │   ├─ AppSettings.java ・・・ 設定の読み書き
   │  │   └─ SettingsController.java ・ 設定の API・GAS版からの取り込み
   │  └─ common/ ・・・・・・・・・ 【全員】共通部品（TimeText・Ids・例外・API のエラーの形）
   ├─ main/resources/
   │  ├─ application.yml ・・・・・ 【全員】アプリの設定
   │  └─ db/migration/ ・・・・・・ 【山川】DB の表（V1〜V3。足すときは V4__）
   └─ test/java/app/kintai/
      ├─ aggregate/AggregationRulesTest.java ・ 【横田】
      ├─ attendance/MonthSheetParserTest.java ・ 【横田】
      ├─ employee/EmployeeImportTest.java ・・ 【宮谷】
      ├─ expense/ExpenseTotalsTest.java ・・・ 【山川】
      ├─ monthly/CsvExporterTest.java ・・・・ 【山川】
      └─ ScreensTest.java ・・・・・・・・・ 【指輪】API の流れ（ログイン→登録→集計→CSV）
```

## 管理画面の開き方（自分のPC）

### 全体のイメージ
```
ブラウザ ─> http://localhost:5123  … ターミナル2：React（画面）
                 │ /api/... は自動で中継（frontend/vite.config.js）
                 ▼
            http://localhost:5124  … ターミナル1：Java（API・データ）
```
- **ブラウザで開くのは 5123 だけ。** 5124 は開かなくてよいが、**動かしておく**（止まっていると画面に「エラーが起きました」と出る）
- ターミナルは **2つ** 使う。どちらも使い終わるまで閉じない
- 本番では React を Java の中に入れるので、Java 1つ・ポート1つで動く（下の「本番用にまとめる」）

> **大事：PowerShell を開いた直後は `C:\Users\自分の名前` にいる。**
> 必ず最初に `cd` でプロジェクトのフォルダへ移動する（しないと「not a git repository」「.\gradlew は認識されません」と出る）。
> 下の例は `C:\Users\自分の名前\ProjectSummerWars` に置いた場合。別の場所なら `~\ProjectSummerWars` をその場所に読み替える。

---

### 最初の1回だけ（準備）
**① Java 21・Node.js・Git を入れる**（PowerShell）
```
winget install EclipseAdoptium.Temurin.21.JDK
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```
入れたら PowerShell を**全部閉じて開き直す**。`java -version` で 21、`node -v` で v20 以上が出ればOK。Gradle は入れなくてよい。
Mac は `brew install --cask temurin@21` と `brew install node git`。

**② コードを取ってくる**
```
cd ~
git clone https://github.com/yokota-work793/ProjectSummerWars.git
```

---

### 毎回（作業のはじめ）
最新を取る（更新）のも、この手順に入っている。毎回このとおりにやれば、いつも最新で開ける。

**ターミナル1：Java（API・5124）**
```
cd ~\ProjectSummerWars
git pull
.\gradlew bootRun
```
- `<====---> 80% EXECUTING  > :bootRun` と出たまま止まって見えれば **起動成功**（100% にはならない）
- このターミナルは閉じない。Ctrl + C や「バッチ ジョブを終了しますか」で Y を押すと止まる

**ターミナル2：React（画面・5123）** ＝ PowerShell の「＋」で新しいタブを開く
```
cd ~\ProjectSummerWars\frontend
npm install
npm run dev
```
- `npm install` は毎回やってよい（変わっていなければ数秒で終わる。他の人が部品を足したときもこれで揃う）
- `Local: http://localhost:5123/` と出たら起動成功

**ブラウザ**
1. **http://localhost:5123** を開く
2. ユーザー名 `demo`／パスワード `1111` でログイン（開発用）

**終わるとき**：両方のターミナルで `Ctrl + C` →「Y」

---

### 変えたものを画面に出す（反映）
| 変えたもの | やること |
|---|---|
| 画面（`frontend/src/...`） | 保存するだけ。ブラウザが自動で変わる |
| Java（`src/main/java/...`）・`application.yml` | ターミナル1を `Ctrl + C`→Y で止めて `.\gradlew bootRun` → ブラウザを F5 |
| DB の表（`db/migration/`） | Java を起動し直す。エラーなら下の「うまくいかないとき」の data を消す |
| `vite.config.js`・`package.json` | ターミナル2を止めて `npm install` → `npm run dev` |

反映できたら、テスト（ルートで `.\gradlew test`）が通るのを確かめてから commit・push する。

---

### うまくいかないとき
| 出たもの | 原因と直し方 |
|---|---|
| `not a git repository`／`.\gradlew は認識されません` | フォルダが違う。`cd ~\ProjectSummerWars` してからやり直す |
| `cd : パス ...\frontend\frontend が存在しない` | もう frontend にいる。`cd frontend` は飛ばしてよい |
| `'vite' は…認識されていません` | `npm install` をしていない。frontend で `npm install` → `npm run dev` |
| `JAVA_HOME is not set` | Java を入れたあと PowerShell を開き直していない。全部閉じて開き直す |
| `npm` が見つからない | Node.js を入れて PowerShell を開き直す。「スクリプトの実行が無効」なら `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` を1回 |
| `BUILD FAILED`（bootRun） | 上にスクロールして `Caused by:` を見る。多いのは下の2つ |
| 　└ `Port 5124 was already in use` | 前の Java が別タブで動いている。そのタブで Ctrl + C、または `Get-NetTCPConnection -LocalPort 5124 \| % { Stop-Process -Id $_.OwningProcess -Force }` |
| 　└ `Flyway` / `Migration` のエラー | 自分のPCの試しデータが古い。Java を止めて ルートで `Remove-Item -Recurse -Force data` → 起動し直す |
| 画面は出るがログインできない／「エラーが起きました」 | ターミナル1（Java）が止まっている。起動し直す |
| localhost:5123 が開かない | ターミナル2（`npm run dev`）が止まっている |

`JAVA_HOME` が開き直しても直らないとき（その画面を閉じるまで有効）：
```
$env:JAVA_HOME = (Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory | Select-Object -First 1).FullName
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

### 知っておくこと
- Google の鍵を入れていないので、勤怠シートは**仮データ**（平日 9:30〜18:30）で動く。本物の Google には何も書き込まない
- 画面で登録したデータは自分のPCの `data` フォルダだけに入る。Git には入らない
- `frontend/node_modules` と `src/main/resources/static` は Git に入れない

---

## Eclipse で開く（Java 担当向け）
Eclipse は **Java（ターミナル1の代わり）** に使う。画面（React）は上の「ターミナル2」のまま。React の編集は VS Code がおすすめ。

### 最初の1回だけ
1. 「Eclipse IDE for Enterprise Java and Web Developers」（2024-03 以降）を入れる
2. 「ウィンドウ」→「設定」→「Java」→「インストール済みの JRE」→ Temurin 21（`C:\Program Files\Eclipse Adoptium\jdk-21…`）を追加してチェック
3. 「ファイル」→「インポート」→「Gradle」→「既存の Gradle プロジェクト」→ `ProjectSummerWars` フォルダを選ぶ →「完了」（Gradle 配布は「Gradle ラッパー」のまま）

### 毎回
1. **最新にする**：プロジェクトを右クリック →「チーム」→「プル」（またはターミナル1の `git pull`）
   - `build.gradle` が変わっていたら：右クリック →「Gradle」→「Gradle プロジェクトのリフレッシュ」
2. **Java を起動**：`src/main/java/app/kintai/KintaiApplication.java` を右クリック →「実行」→「Java アプリケーション」
   - コンソールに `Started KintaiApplication` と出たらOK（2回目からは緑の実行ボタン）
3. **画面を起動**：上の「ターミナル2」と同じ（`cd ~\ProjectSummerWars\frontend` → `npm install` → `npm run dev`）
4. ブラウザで http://localhost:5123

### Java を直したら
赤い四角（停止）→ 緑の実行ボタン → ブラウザを F5
- 止めずに2回起動すると `Port 5124 was already in use`。コンソールの赤い四角で古い方を止める
- テスト：`src/test/java` を右クリック →「実行」→「JUnit テスト」
- デバッグ：「実行」の代わりに「デバッグ」。行番号の左をダブルクリックで止める場所を置く
- Eclipse が作る `.project`・`.classpath`・`.settings/`・`bin/` は Git に入れない（.gitignore 済み）

---

## 本番用にまとめる（決まってから）
```
cd ~\ProjectSummerWars\frontend
npm run build
```
React が `src/main/resources/static` に入り、Java だけ（5124）で画面も API も出せる。

## Codespaces で開く（PCに入れられないとき）
1. GitHub の緑の「Code」→「Codespaces」→ 作成または既存を選ぶ
2. ターミナル1：`git pull` → `bash gradlew bootRun`
3. ターミナル2：`cd frontend` → `npm install` → `npm run dev`
4. 「ポート」タブの 5123 を開く
5. 終わったら Ctrl + C、Codespace も停止（止めないと無料枠が減る）

## Git の使い方（ぶつからないように）
1. 作業を始める前に `git pull`
2. 作業ごとにブランチを作る：`git switch -c 名前/作業内容`（例：`yokota/overtime-rule`）
3. こまめにコミット。メッセージは日本語で「何をしたか」を書く
4. `git push` して Pull Request を作り、だれか1人に見てもらってから main に入れる
5. Actions（自動テスト）が緑になってから入れる
- 鍵ファイル・パスワードは絶対にコミットしない

## 本番の設定（環境変数。本番に出すと決めてから用意する）
| 名前 | 中身 |
|---|---|
| DB_URL / DB_USER / DB_PASSWORD | PostgreSQL の接続先 |
| ADMIN_USER / ADMIN_PASSWORD | ログイン（必ず変える） |
| GOOGLE_CREDENTIALS | サービスアカウントの鍵ファイルの場所（鍵は Git に入れない） |
| SPRING_MAIL_HOST / SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD | 社労士へのメール |
