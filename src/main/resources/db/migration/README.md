# db/migration：DB の表　担当：山川

Flyway が、起動のときに V1 → V2 → … の順に1回だけ実行する。

| ファイル | 表 |
|---|---|
| V1__create_employee.sql | employee・project_assignment（社員・案件） |
| V2__create_app_setting.sql | app_setting（画面「設定」） |
| V3__create_monthly_record.sql | monthly_record（月次集計） |

## 守ること
- **一度 GitHub に入れたファイルは直さない。** 表を変えるときは V4__〇〇.sql を足す（V1〜V3 は中身を1文字でも変えると起動時にエラーになるため、コメントも足していない）
- 開発用の DB（./data）を作り直したいときは、data フォルダを消して起動し直す

## 担当内容（山川さん）
- 表を足す・列を足すときに、新しい V4__ 以降の SQL を作る
- H2（開発）と PostgreSQL（本番）の両方で動く SQL にする
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は山川で、担当は「DBの表」です。

# 今回やりたいこと
（例）monthly_record に「深夜残業」の列を足す V4__ の SQL を作りたい。

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
