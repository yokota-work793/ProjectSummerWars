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
│  └─ vite.config.js ・・・・ 画面は 5123、/api は 5124 の Java へ中継（つながりは下の「5123 と 5124 のつながり」）
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

## 5123 と 5124 のつながり
```
ブラウザ ──> http://localhost:5123（React の画面・npm run dev）
                 │  画面が /api/... を呼ぶと
                 ▼  自動で中継（frontend/vite.config.js の proxy）
             http://localhost:5124（Java の API・bootRun / Eclipse）── DB（data/ フォルダ）
```
- ブラウザで開くのは **5123 だけ**。5124 は開かなくてよいが、**起動はしておく**（止まっていると画面に「エラーが起きました」と出る）
- 中継の設定は `frontend/vite.config.js`（指輪）、Java のポートは `application.yml` の `server.port`（全員）。どちらかを変えたら、もう片方も合わせる
- ログインの状態（Cookie）は 5123 のまま保たれるので、画面から見ると1つのサイトに見える
- 本番では `npm run build` で React を Java の中に入れるので、Java 1つ（ポート1つ）で動く

## 最新に更新する（毎朝・作業の前）
1. Java と React を両方 `Ctrl + C` で止める（Eclipse なら赤い四角の停止ボタン）
2. ルートで `git pull`
3. 変わったものに合わせて：
   | 変わったもの | やること |
   |---|---|
   | `frontend/package.json` | `cd frontend` → `npm install` |
   | `build.gradle` | Eclipse：プロジェクトを右クリック →「Gradle」→「Gradle プロジェクトのリフレッシュ」（ターミナルなら何もしなくてよい） |
   | `db/migration/` に新しい V〇 | 何もしなくてよい（起動したとき自動で表が変わる）。起動でエラーなら Java を止めて `data` フォルダを消して起動し直す（自分のPCの登録データは消える） |
   | それ以外 | 何もしなくてよい |
4. Java → React の順に起動し直す
- だれが何を変えたかは GitHub のコミットメッセージ（先頭の【〇〇担当】）で見る

## 変えたものを反映する（画面に出す）
| 変えたもの | 反映のしかた |
|---|---|
| React（`frontend/src/...`） | 保存するだけ。ブラウザが自動で変わる |
| Java（`src/main/java/...`） | Java を止めて起動し直す → ブラウザを再読み込み（F5） |
| `application.yml` | Java を起動し直す |
| `db/migration/` | Java を起動し直す（必要なら `data` フォルダを消す） |
| `vite.config.js`・`package.json` | React（`npm run dev`）を起動し直す |
- 反映できたら、テスト（`.\gradlew test` か Eclipse の JUnit）を通してから commit・push する

## Eclipse で開く（Java 担当向け）
React（`frontend/`）は Eclipse ではなく **VS Code** で触るのがおすすめ。Eclipse は Java（API）用に使う。

### 最初の1回だけ
1. Eclipse は「Eclipse IDE for Enterprise Java and Web Developers」（2024-03 以降）を使う。Java 21 が入っていること（上の「最初の1回だけ」）
2. 「ウィンドウ」→「設定」→「Java」→「インストール済みの JRE」で、Temurin 21（`C:\Program Files\Eclipse Adoptium\jdk-21...`）を追加してチェック
3. 「ファイル」→「インポート」→「Gradle」→「既存の Gradle プロジェクト」→ ルートの `ProjectSummerWars` フォルダを選ぶ →「完了」
   - 下の「Gradle 配布」は「Gradle ラッパー」のままでよい（gradlew と同じものを使う）
   - Eclipse が作る `.project`・`.classpath`・`.settings/`・`bin/` は Git に入れない（.gitignore 済み）
4. ターミナルで `cd frontend` → `npm install`（React の部品）

### 毎回
1. 作業前に `git pull`（Eclipse の Git でもターミナルでもよい）。build.gradle が変わったら Gradle のリフレッシュ
2. `src/main/java/app/kintai/KintaiApplication.java` を右クリック →「実行」→「Java アプリケーション」（Spring Tools を入れていれば「Spring Boot App」）
   - コンソールに `Started KintaiApplication` と出たら 5124 で起動済み
   - 2回目からは上の緑の実行ボタンでよい
3. ターミナル（Eclipse の「ターミナル」ビューか PowerShell）で `cd frontend` → `npm run dev`
4. ブラウザで http://localhost:5123（`demo` / `1111`）
5. Java を直したら：赤い四角で止める → 緑の実行ボタン → ブラウザを F5
6. テスト：`src/test/java` を右クリック →「実行」→「JUnit テスト」（1つだけならそのテストファイルを右クリック）
- 止めずにもう1回起動すると「Port 5124 was already in use」と出る。コンソールの赤い四角で古い方を止めてから起動する
- デバッグしたいときは「実行」の代わりに「デバッグ」→ 行番号の左をダブルクリックで止める場所を置き、画面を操作すると止まる

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
