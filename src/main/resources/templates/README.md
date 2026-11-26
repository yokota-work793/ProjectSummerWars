# templates：画面（Thymeleaf）　担当：指輪

| ファイル | 画面 |
|---|---|
| fragments/layout.html | 共通（頭・左メニュー・お知らせ表示） |
| login.html | ログイン |
| employees/list.html・form.html | 社員一覧・社員の登録／詳細 |
| monthly/index.html | 月次集計 |
| settings/index.html | 設定 |

見た目は static/css/app.css。

## やること
- [ ] 山本さんに画面を触ってもらい、使いにくいところを直す
- [x] 案件・参画履歴に「＋ 行を追加」ボタンを付けた（2026-11-26）
- [x] スマホ・狭い画面でも崩れないようにした（app.css の @media。2026-11-26）
- [ ] 実際にスマホで開いて、使いにくいところがないか確認する

## 守ること
- 画面に計算や判断を書かない（Controller・Service に書く）
- フォームは th:action を使う（ログインの安全対策の値が自動で入る）
- 社員管理の入力欄は宮谷さん（EmployeeForm）、月次集計の列は山川さん（MonthlyColumns）と合わせる

## 担当内容（指輪）
- 上の「やること」を上から順に進める
- 画面を変えたら ScreensTest も合わせる
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3 / Thymeleaf / Flyway / Gradle）の開発を手伝うアシスタントです。
私は指輪で、担当は「画面」です。

# 今回やりたいこと
（例）社員一覧の画面に、社員番号で検索する欄を足したい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - src/main/resources/templates/
  - src/main/resources/static/
  - src/main/java/app/kintai/settings/
  - src/main/java/app/kintai/config/HomeController.java
  - src/test/java/app/kintai/ScreensTest.java
- 担当範囲の外のファイルは絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある db/migration の SQL（V1〜V3）は変更しないでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 変更したら、対応するテストを足すか直し、`gradle test` が通る形にしてください。
- 作業の前に、担当フォルダの README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
