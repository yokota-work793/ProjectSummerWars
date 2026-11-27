# aggregate：集計（計算）ルール　担当：横田

日ごとの勤怠から、出勤日数・総労働・残業・深夜・土曜・休日・休日深夜・有給・特別休暇を出す。**このシステムの中心。**

| ファイル | 中身 |
|---|---|
| AggregationRules | 計算ルール（今は仮ルール。中のコメント参照） |
| MonthlySummary | 計算の結果（時間はすべて分） |
| テスト：src/test/java/app/kintai/aggregate/AggregationRulesTest | ルールの例 |

## やること
- [ ] 社労士にルールを確認する：残業の基準（1日8時間／週40時間）、深夜に休憩が重なったとき、法定休日と所定休日の区別、遅刻・早退・欠勤
- [ ] 決まったルールを、まず AggregationRulesTest に例（入力と答え）として書く → 失敗するのを確かめる → AggregationRules を直して通す
- [ ] 月60時間超えの残業など、割増の段階が要るか確認する（要るなら MonthlySummary に項目を足し、monthly の列も足す）

## 守ること
- ここは Google も DB も触らない（入力は MonthSheet、出力は MonthlySummary だけ）。だからテストで全部確かめられる
- ルールを変えたら、必ずテストを足す


## 今の仮ルール（社労士に確認して直す）
- 平日：1日の勤務が標準時間を超えた分を「残業」
- 土曜：勤務した時間をすべて「土曜出勤」／日曜・祝日：すべて「休日出勤」
- 22:00〜翌5:00 は「深夜」（日曜・祝日は「休日深夜」）。休憩は深夜から引かない
- 備考「有給」→1日（「半休」「半日」は0.5日）、「特別休暇」「夏季休暇」→特別休暇1日
- 欠勤は数えない

## 担当内容（横田さん）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）にある。このフォルダは Java 側で、画面の HTML はもう Java にはない（Thymeleaf は廃止）
- 動かす：Java（5124）を Eclipse（KintaiApplication を「実行」）か `.\gradlew bootRun` で起動 → 別のターミナルで `cd frontend` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 作業前に `git pull`。手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md
- まずはテスト（AggregationRulesTest）で確かめる。画面で見るときは「月次集計」→「② 集計する」（勤怠は仮データ 9:30〜18:30）
- 計算の結果に項目を足したら、画面の列は山川さん（MonthlyColumns）、表示は指輪（frontend/src/pages/Monthly.jsx）に伝える

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は横田で、担当は「集計ルール」です。

# 今回やりたいこと
（例）社労士に確認した残業のルール「1日8時間・週40時間を超えた分が残業」をテストに例として書き、AggregationRules を直したい。

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
