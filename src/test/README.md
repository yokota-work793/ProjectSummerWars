# test：テスト　担当：各テストの担当者（下の表）

`gradle test` で全部動く。GitHub に push すると自動でも動く（Actions タブ）。

| テスト | 確かめること | 担当 |
|---|---|---|
| aggregate/AggregationRulesTest | 集計ルール | 横田 |
| attendance/MonthSheetParserTest | 勤怠シートの読み取り・入力チェック | 横田 |
| expense/ExpenseTotalsTest | 交通費・経費の合計 | 山川 |
| monthly/CsvExporterTest | CSV の形 | 山川 |
| employee/EmployeeImportTest | GAS版からの取り込み | 宮谷 |
| ScreensTest | 画面（React）が使う API の流れ（ログイン → 登録 → 集計 → CSV） | 指輪 |

## 担当内容（全員）
- 自分の機能を足したり直したりしたら、自分の担当のテストを足す
- 他の人の担当のテストは変更しない。落ちたら担当者に伝える
- Actions が赤くなったら、まず自分の変更を見直し、直してから次の作業をする

## 作業のしかた（画面が React になってから）
- 画面は React（`frontend/`）になったので、ScreensTest は画面ではなく **API** を確かめる（JSON の中身を jsonPath で見る）
- 実行：Eclipse で `src/test/java` を右クリック →「実行」→「JUnit テスト」、またはルートで `.\gradlew test`
- 日本語は `content().string(...)` だと文字化けで落ちるので、`jsonPath(...)` で確かめる
- push すると GitHub の Actions でも自動で動く。赤くなったら「失敗したテスト」の欄を見る
- 手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md

## AIへの指示プロンプト（テストを書くとき。コピーして使う）
```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3 / JUnit 5 / Gradle）の開発を手伝うアシスタントです。
私は〇〇（名前）で、担当のテストは src/test/java/app/kintai/〇〇/ です。

# 今回やりたいこと
（例）自分の担当の機能を足したので、そのテストを書きたい。

# 必ず守ること
- 変更してよいのは、私の担当のテストのフォルダ（上に書いたもの）だけです。
- 他の人の担当のテストや、src/main の本体のコードは絶対に変更しないでください。本体の修正が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- テストは「入力」と「期待する答え」がはっきり分かる形で書いてください。
- `gradle test` が通る形にしてください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
