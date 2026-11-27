# attendance：勤怠シートの読み取り　担当：横田

社員の勤怠シート（Google スプレッドシート）の「YYYY年MM月」シートを読み、入力をチェックする。月のシートも作る。

| ファイル | 中身 |
|---|---|
| AttendanceReader | 勤怠シートから月のシート・標準時間（J10）・休日シートを読む |
| MonthSheetParser | 表示どおりの文字を読み取り、日ごとの勤怠（DayRecord）にする。入力エラーもここで見つける |
| DayRecord / MonthSheet | 1日分・1か月分の勤怠 |
| MonthSheetService | 全員の勤怠シートに月のシートを作る（「テンプレ」を複製して G6 に年月を入れる） |

## やること
- [ ] 本物の勤怠シートで読み取りを確認する（日付の書き方、24時以降の退勤、空行）
- [ ] 入力チェックを山本さんと決めて足す（例：休憩なしで6時間超え、出勤が早すぎる など）。足したら MonthSheetParserTest に例を書く
- [ ] 遅刻・早退・欠勤を記録する欄を勤怠シートに作るか決める（作るなら DayRecord に項目を足す）

## 守ること
- 読み取り（ここ）と計算（aggregate）を混ぜない。ここは「何時から何時まで働いたか」までを作る


## 担当内容（横田さん）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）にある。このフォルダは Java 側で、画面の HTML はもう Java にはない（Thymeleaf は廃止）
- 動かす：Java（5124）を Eclipse（KintaiApplication を「実行」）か `.\gradlew bootRun` で起動 → 別のターミナルで `cd frontend` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 作業前に `git pull`。手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md
- まずはテスト（MonthSheetParserTest）で確かめる。画面では「月次集計」→「① 月のシートを作る」「② 集計する」で、入力エラーが画面上に赤く出る
- 入力エラーの文言を変えると、そのまま画面に出る（React 側の変更は要らない）

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は横田で、担当は「勤怠シートの読み取り」です。

# 今回やりたいこと
（例）休憩なしで6時間を超える日を入力エラーにするチェックを MonthSheetParser に足したい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - src/main/java/app/kintai/aggregate/
  - src/main/java/app/kintai/attendance/
  - src/test/java/app/kintai/aggregate/
  - src/test/java/app/kintai/attendance/
- 担当範囲の外のファイルは絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある db/migration の SQL（V1〜V3）は変更しないでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 変更したら、対応するテストを足すか直し、`gradle test` が通る形にしてください。
- 作業の前に、担当フォルダの README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
