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
│  └─ vite.config.js ・・・・ 画面は 5123、/api は 5124 の Java へ
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

## 管理画面の開き方（自分のPC・おすすめ）
重い・無料枠が減る Codespaces より、自分のPCで動かすのがおすすめ。どちらでも、最新は GitHub（main）から `git pull` で取ってくる。
**ターミナルを2つ使う**：1つ目で Java（API・5124）、2つ目で React（画面・5123）を動かし、ブラウザは **http://localhost:5123** を開く。

### 最初の1回だけ
1. **Java 21・Node.js・Git を入れる**
   - Windows（PowerShell）：
     ```
     winget install EclipseAdoptium.Temurin.21.JDK
     winget install OpenJS.NodeJS.LTS
     winget install Git.Git
     ```
   - Mac：`brew install --cask temurin@21` と `brew install node git`
   - 入れたら PowerShell（ターミナル）を全部閉じて開き直し、`java -version` で `21`、`node -v` で `v20` 以上が出ればOK
   - **Gradle は入れなくてよい**（`gradlew` が自動で用意する）
2. **コードを取ってくる**（好きなフォルダで）
   ```
   git clone https://github.com/yokota-work793/ProjectSummerWars.git
   cd ProjectSummerWars
   ```
3. **画面の部品を入れる**（`frontend/package.json` が変わったときも、もう一度）
   ```
   cd frontend
   npm install
   cd ..
   ```

### 毎回
**ターミナル1（Java・API）**
```
git pull                   # 作業前に必ず最新にする
.\gradlew bootRun          # Windows（Mac・Linux は bash gradlew bootRun）
```
`Started KintaiApplication` が出るまで待つ（初回は数分）。

**ターミナル2（React・画面）**
```
cd frontend
npm run dev
```
1. ブラウザで **http://localhost:5123** を開く
2. ユーザー名 `demo`、パスワード `1111` でログイン（開発用。本番では環境変数で変える）
3. 終わったら、両方のターミナルで `Ctrl + C`

画面のファイル（`frontend/src/...`）を保存すると、ブラウザがすぐ変わる。Java のファイルを変えたときは、ターミナル1を `Ctrl + C` して起動し直す。
テストは `.\gradlew test`（Mac は `bash gradlew test`）。

### うまくいかないとき
- **`JAVA_HOME is not set` と出る**：Java が入っていないか、入れたあと PowerShell を開き直していない。`winget install EclipseAdoptium.Temurin.21.JDK` → PowerShell を全部閉じて開き直す → `java -version` で 21 を確認してから `.\gradlew bootRun`
- **開き直しても同じ**：PowerShell で次を実行してから起動（その画面を閉じるまで有効）
  ```
  $env:JAVA_HOME = (Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory | Select-Object -First 1).FullName
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"
  ```
- **`npm` が見つからない**：Node.js を入れて PowerShell を開き直す。`npm` で「スクリプトの実行が無効」と出たら `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` を1回実行
- **画面は出るがログインできない／「エラーが起きました」と出る**：ターミナル1（Java）が動いているか確認。止まっていると画面から API が呼べない
- **localhost:5123 が開かない**：ターミナル2で `npm run dev` が動いているか確認

### 注意
- Google の鍵を入れていないので、勤怠シートは仮データ（平日 9:30〜18:30）で動く。本物の Google には何も書き込まない
- 画面で登録したデータは自分のPCの `data` フォルダだけに保存され、Git には入らない。消したいときは Java を止めてから `data` フォルダを消す
- `frontend/node_modules` と `src/main/resources/static`（React をビルドしたもの）は Git に入れない

### 本番用に1つにまとめるとき
`cd frontend` → `npm run build` で React が `src/main/resources/static` に入り、Java だけ（5124）で画面も API も出せる。本番の出し方は決まってから決める。

### Codespaces で開く場合（PCに入れられないとき）
1. 緑の「Code」→「Codespaces」→ 作成または既存を選ぶ
2. ターミナル1で `git pull` → `bash gradlew bootRun`、ターミナル2で `cd frontend && npm install && npm run dev`
3. 「ポート」タブの 5123 を開く
4. 終わったら `Ctrl + C`、Codespace も停止（止めないと無料枠が減る）

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
