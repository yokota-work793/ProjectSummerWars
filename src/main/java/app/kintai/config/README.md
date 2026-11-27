# config：ログイン・トップ画面　担当：山川（ログイン）・指輪（トップ画面）

| ファイル | 中身 | 担当 |
|---|---|---|
| SecurityConfig | ログイン（今は管理者1人。ADMIN_USER / ADMIN_PASSWORD）。React からは POST /api/login、/api/** はログイン必須、安全対策（CSRF）は Cookie「XSRF-TOKEN」 | 山川 |
| HomeController | 画面の URL で React（index.html）を返す、ログイン中の人（GET /api/me） | 指輪 |

## やること
- [ ] 本番前に ADMIN_PASSWORD を必ず変える
- [ ] ログインする人を増やすか決める（増やすなら、ユーザーの表を作って SecurityConfig を DB から読む形にする）
- [ ] 画面ごとに見られる人を分けるか決める（例：月次集計は山本さんだけ）

## 担当内容
- 山川さん：SecurityConfig（上の「やること」）
- 指輪：HomeController（トップ画面の行き先を変えるとき）
- 他の人の担当ファイルを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）。ログイン画面も React（frontend/src/pages/Login.jsx）で、Java はログインの受付（POST /api/login）だけ
- 動かす：Java（5124）を Eclipse（KintaiApplication を「実行」）か `.\gradlew bootRun` で起動 → 別のターミナルで `cd frontend` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 作業前に `git pull`。手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md
- SecurityConfig（山川さん）：ログインの URL・Cookie の名前（XSRF-TOKEN）を変えるときは、指輪（frontend/src/api.js）に必ず伝える。変えると画面からログインできなくなる
- HomeController（指輪）：React の画面の URL を足したら、ここの一覧にも足す（足さないと、その URL を直接開いたり F5 したとき 404 になる）

## AIへの指示プロンプト（山川さん用。コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。指輪は frontend/README.md のプロンプトを使う。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は山川で、担当は「ログイン」です。

# 今回やりたいこと
（例）ログインできる人を複数にするため、ユーザーの表を足して SecurityConfig を DB から読む形にしたい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - src/main/java/app/kintai/monthly/
  - src/main/java/app/kintai/expense/
  - src/main/java/app/kintai/config/SecurityConfig.java
  - src/main/resources/db/migration/（新しい V4__ 以降のファイルを足すだけ）
  - src/test/java/app/kintai/monthly/
  - src/test/java/app/kintai/expense/
- 担当範囲の外のファイル（HomeController.java を含む）は絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある db/migration の SQL（V1〜V3）は変更しないでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 変更したら、対応するテストを足すか直し、`gradle test` が通る形にしてください。
- 作業の前に、担当フォルダの README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
