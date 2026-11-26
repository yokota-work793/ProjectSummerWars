# 勤怠・給与集計システム

社員管理・月次集計・交通費/経費フォームの取り込み・社労士へのCSV送付を、1つの Java（Spring Boot）の画面で行う。
給与計算そのものは社労士が行う。このシステムは、社労士に渡すデータ（1人×1か月）を正しく集めてまとめる。
**Java 版はまだ構築中。** GAS 版は 2026-11-26 に停止済み（トリガー削除・デプロイのアーカイブ・メニュー非表示。社員管理表は「旧_社員管理表」として残してある）。

## 分担（だれが・何を）
| 人 | 担当 | 担当フォルダ・ファイル | まずやること |
|---|---|---|---|
| 指輪 | 画面・設定・全体のまとめ | `src/main/resources/templates/`、`src/main/resources/static/`、`src/main/java/app/kintai/settings/`、`config/HomeController.java`、`src/test/java/app/kintai/ScreensTest.java` | 全体の調整及びシステムの土台を作成 |
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
├─ .gitignore ・・・・・・・・・・ Git に入れないファイル（鍵・.env）
├─ .devcontainer/devcontainer.json ・ Codespaces の開発環境
├─ .github/workflows/build.yml ・・ push するとビルドとテストが自動で動く
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
   │  │   ├─ EmployeeController.java ・ 画面「社員管理」(/employees)
   │  │   └─ EmployeeImport.java ・・ GAS版社員管理表の読み込み
   │  ├─ google/ ・・・・・・・・・ 【宮谷】Google の窓口
   │  │   ├─ GoogleWorkspace.java ・ できること一覧
   │  │   ├─ GoogleRestWorkspace.java ・ 本物（Sheets/Drive API）
   │  │   ├─ FakeGoogleWorkspace.java ・ 仮データ
   │  │   └─ GoogleConfig.java ・・・ 本物か仮かの切り替え
   │  ├─ monthly/ ・・・・・・・・ 【山川】月次集計・社労士への送付
   │  │   ├─ MonthlyService.java ・・ 集計の流れ・確定・CSV・メール
   │  │   ├─ MonthlyController.java ・ 画面「月次集計」(/monthly)
   │  │   ├─ MonthlyRecord.java / MonthlyRecordRepository.java ・ 月次集計の表
   │  │   ├─ MonthlyColumns.java ・・ 画面とCSVの列
   │  │   └─ CsvExporter.java ・・・ CSV にする
   │  ├─ expense/ ・・・・・・・・ 【山川】交通費・経費
   │  │   ├─ ExpenseTotals.java ・・ 承認済みの金額を合計
   │  │   └─ ExpenseService.java ・・ 回答シートを読む
   │  ├─ config/
   │  │   ├─ SecurityConfig.java ・・ 【山川】ログイン
   │  │   └─ HomeController.java ・・ 【指輪】トップ・ログイン画面
   │  ├─ settings/ ・・・・・・・・ 【指輪】画面「設定」
   │  │   ├─ AppSettings.java ・・・ 設定の読み書き
   │  │   └─ SettingsController.java ・ 画面「設定」・GAS版からの取り込み
   │  └─ common/ ・・・・・・・・・ 【全員】共通部品（TimeText・Ids・例外）
   ├─ main/resources/
   │  ├─ application.yml ・・・・・ 【全員】アプリの設定
   │  ├─ db/migration/ ・・・・・・ 【山川】DB の表（V1〜V3。足すときは V4__）
   │  ├─ templates/ ・・・・・・・ 【指輪】画面（Thymeleaf）
   │  │   ├─ fragments/layout.html ・ 共通の枠・メニュー
   │  │   ├─ login.html ・・・・・ ログイン
   │  │   ├─ employees/list.html・form.html ・ 社員一覧・登録
   │  │   ├─ monthly/index.html ・ 月次集計
   │  │   └─ settings/index.html ・ 設定
   │  └─ static/css/app.css ・・・ 【指輪】見た目
   └─ test/java/app/kintai/
      ├─ aggregate/AggregationRulesTest.java ・ 【横田】
      ├─ attendance/MonthSheetParserTest.java ・ 【横田】
      ├─ employee/EmployeeImportTest.java ・・ 【宮谷】
      ├─ expense/ExpenseTotalsTest.java ・・・ 【山川】
      ├─ monthly/CsvExporterTest.java ・・・・ 【山川】
      └─ ScreensTest.java ・・・・・・・・・ 【指輪】画面の流れ
```

## 管理画面の開き方
1. **Codespaces を開く**
   GitHub のリポジトリ画面で、緑の「Code」→「Codespaces」タブを押します。前に作ったものがあればそれを選び、なければ「Create codespace on main」を押します。最初の起動は数分かかります。

2. **アプリを起動する**
   画面下のターミナルで次を実行します。
   ```
   gradle bootRun
   ```
   `Started KintaiApplication` と出たら起動完了です。初回はライブラリのダウンロードで数分かかります。

3. **画面を開く**
   右下に「ポート 5123 で…」と出たら「ブラウザーで開く」を押します。出ないときは、ターミナルの隣の「ポート」タブで 5123 の地球マークを押します。

4. **ログインする**
   ユーザー名は `yamamoto`、パスワードは `change-me` です。

**見られる画面**
- **社員管理**：一覧、登録、詳細
- **月次集計**：シート作成、集計、CSV ダウンロード
- **設定**：ひな型・フォームの URL など

**注意**
- Google の鍵を入れていないので、勤怠シートは仮データ（平日 9:30〜18:30）で動きます。本物の Google には何も書き込まれません。
- 画面で登録したデータは、その Codespace の中にだけ保存されます。GitHub のコードには影響しません。
- ターミナルに `git commit` や `git push` を打たなければ、リポジトリは何も変わりません。

**終わったら**
1. ターミナルで `Ctrl + C` を押してアプリを止めます。
2. Codespace 自体も止めます。左下の「Codespaces」から「Stop Current Codespace」を選ぶか、github.com/codespaces で「…」→「Stop codespace」を押します。止めないと無料枠が減ります。

## 動かす（Codespaces・自分のPC）
```
gradle bootRun            # http://localhost:5123 （ユーザー名 yamamoto ／ パスワード change-me）
gradle test               # テスト
```
何も設定しなければ、DB はファイル（./data）、Google は仮データで動く。

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
