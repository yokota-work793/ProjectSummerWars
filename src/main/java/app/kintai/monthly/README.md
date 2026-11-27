# monthly：月次集計・社労士への送付　担当：山川

勤怠（attendance）→ 計算（aggregate）→ 手当・インセンティブ・交通費・経費を足して、1人×1か月で保存する。CSV にして社労士へ送る。

| ファイル | 中身 |
|---|---|
| MonthlyService | 集計の流れ、確定、CSV、メール送信 |
| MonthlyController | 月次集計の API（/api/monthly）。画面は frontend/src/pages/Monthly.jsx（指輪） |
| MonthlyRecord / MonthlyRecordRepository | 月次集計の表（monthly_record） |
| MonthlyColumns | 画面の表とCSVの列（列を足すときはここ） |
| CsvExporter | CSV にする（BOM付き） |

## やること
- [ ] 社労士の給与計算ソフトが読める CSV の形（列の順番・名前・時間の書き方）を確認し、MonthlyColumns を合わせる
- [ ] メール送信の設定（SPRING_MAIL_HOST など）を用意する
- [ ] 「確定」を取り消す機能が要るか決める
- [ ] 社労士から給与明細（PDF）を受け取って配る流れを作るか決める

## 列を足すとき
1. db/migration に V4__… を足して monthly_record に列を足す
2. MonthlyRecord に項目、MonthlyService.fill に値を入れる処理を足す
3. MonthlyColumns の HEADER と row に同じ順番で足す


## 担当内容（山川さん）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）にある。このフォルダは Java 側で、画面の HTML はもう Java にはない（Thymeleaf は廃止）
- 動かす：Java（5124）を Eclipse（KintaiApplication を「実行」）か `.\gradlew bootRun` で起動 → 別のターミナルで `cd frontend` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 作業前に `git pull`。手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md
- API は MonthlyController（/api/monthly）。画面は frontend/src/pages/Monthly.jsx（指輪）
- 画面の表の列は MonthlyColumns から API で届くので、**列を足す・並べ替えるのは Java だけでよい**（React の変更は要らない）
- ボタン（シート作成・集計・送信・確定）を増やすときは指輪に伝える

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は山川で、担当は「月次集計・社労士への送付」です。

# 今回やりたいこと
（例）社労士の給与ソフトに合わせて、CSV の列の順番と名前を変えたい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - src/main/java/app/kintai/monthly/
  - src/main/java/app/kintai/expense/
  - src/main/java/app/kintai/config/SecurityConfig.java
  - src/main/resources/db/migration/（新しい V4__ 以降のファイルを足すだけ）
  - src/test/java/app/kintai/monthly/
  - src/test/java/app/kintai/expense/
- 担当範囲の外のファイルは絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある db/migration の SQL（V1〜V3）は変更しないでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 変更したら、対応するテストを足すか直し、`gradle test` が通る形にしてください。
- 作業の前に、担当フォルダの README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
