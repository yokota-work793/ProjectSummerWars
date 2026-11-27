# employee：社員管理　担当：宮谷

社員の登録・変更・削除と、勤怠シート・個人フォルダの作成・共有。

| ファイル | 中身 |
|---|---|
| Employee / ProjectAssignment | 社員と案件・参画履歴（表 employee・project_assignment） |
| EmployeeRepository | 社員の検索 |
| EmployeeForm | 画面から届く入力（JSON）とチェックのルール。項目名を変えるときは指輪（React）に伝える |
| EmployeeService | 登録・変更・削除、勤怠シートの作成・差し替え、毎朝7時の共有、GAS版からの取り込み |
| EmployeeController | 社員管理の API（/api/employees）。画面は frontend/src/pages/EmployeeList.jsx・EmployeeForm.jsx（指輪） |
| EmployeeImport | GAS版「社員管理表」を読む（切り替え用） |

## やること
- [ ] 本物の Google で、登録 → 勤怠シート作成 → 入社日の共有 → 削除（共有解除・退職者フォルダへ移動）を通しで確認する
- [ ] GAS版からの取り込みを、本物の社員管理表で確認する（GAS版は 2026-11-26 に停止済み）
- [ ] 入力チェックの追加（社員番号の形、入社日が未来すぎないか など）が要るか、山本さんに確認する
- [ ] 社員の変更履歴を残すか決める

## 守ること
- 画面の入力チェックは EmployeeForm、業務のチェック（社員番号の重複など）は EmployeeService に書く
- Google を触るときは google パッケージの GoogleWorkspace を使う（直接 API を呼ばない）


## 担当内容（宮谷さん）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は宮谷で、担当は「社員管理」です。

# 今回やりたいこと
（例）社員番号の形（半角数字4桁）を登録時にチェックしたい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - src/main/java/app/kintai/employee/
  - src/main/java/app/kintai/google/
  - src/test/java/app/kintai/employee/
- 担当範囲の外のファイルは絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある db/migration の SQL（V1〜V3）は変更しないでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 変更したら、対応するテストを足すか直し、`gradle test` が通る形にしてください。
- 作業の前に、担当フォルダの README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
