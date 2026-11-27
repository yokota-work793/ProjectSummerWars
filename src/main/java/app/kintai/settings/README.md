# settings：画面「設定」　担当：指輪

URL やメールアドレスをコードに書かず、画面から変えられるようにする（表 app_setting）。GAS版からの取り込みボタンもここ。

| ファイル | 中身 |
|---|---|
| AppSettings | 設定の読み書き（キーの一覧もここ） |
| SettingsController | 設定の API（/api/settings）、GAS版からの取り込み（/api/settings/import）。画面は frontend/src/pages/Settings.jsx |

## やること
- [ ] 本番の値（ひな型・フォルダ・フォーム・社労士のメール）を入れる
- [ ] 設定を足すときは、AppSettings にキーを足し、frontend/src/pages/Settings.jsx に入力欄を足す


## 担当内容（指輪）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）にある。このフォルダは「設定」の Java 側（API）で、画面の HTML はもう Java にはない（Thymeleaf は廃止）
- 動かす：ターミナル1で `cd ~\ProjectSummerWars` → `git pull` → `.\gradlew bootRun`（Eclipse なら KintaiApplication を「実行」）、ターミナル2で `cd ~\ProjectSummerWars\frontend` → `npm install` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）。`80% EXECUTING` で止まって見えれば起動成功
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 手順の詳細・エラーが出たとき・Eclipse はルートの README.md
- 画面は frontend/src/pages/Settings.jsx（指輪）。設定の項目を足すときは、AppSettings（Java）と Settings.jsx（React）の両方を直す

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は指輪で、担当は「設定画面」です。

# 今回やりたいこと
（例）設定画面に「給与締め日」の入力欄を足したい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - frontend/
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
