# common：みんなで使う小さな部品　担当：全員

| ファイル | 中身 |
|---|---|
| TimeText | 「9:30」と分（570）の変換 |
| Ids | Google の URL から ID を取り出す |
| BusinessException / NotFoundException | 画面に出すエラー |

ここに足すのは、2つ以上のパッケージで使うものだけ。

## 担当内容（全員）
- 2つ以上の機能で使う部品だけをここに足す
- ここを変えると全員に影響するので、変える前にチームに相談する
- 1つの機能でしか使わないものは、その担当フォルダに置く

## 作業のしかた（画面が React になってから）
- 画面は `frontend/`（React・指輪）にある。このフォルダは Java 側で、画面の HTML はもう Java にはない（Thymeleaf は廃止）
- 動かす：Java（5124）を Eclipse（KintaiApplication を「実行」）か `.\gradlew bootRun` で起動 → 別のターミナルで `cd frontend` → `npm run dev` → ブラウザで http://localhost:5123（`demo` / `1111`）
- Java を変えたら：Java を止めて起動し直す → ブラウザを F5。テストは Eclipse でテストファイルを右クリック →「JUnit テスト」か `.\gradlew test`
- 作業前に `git pull`。手順の詳細（Eclipse のつなげ方・更新のしかた）はルートの README.md
- ApiMessage・ApiErrors は画面（React）とのやり取りの形。変えると全画面に影響するので、指輪（frontend/src/api.js）と相談してから

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私はこのチームのメンバーで、今回は全員共通の「共通部品」（src/main/java/app/kintai/common/）を触ります。

# 今回やりたいこと
（例）2つ以上の機能で使う日付の変換処理をここに足したい。

# 必ず守ること
- 変更してよいのは src/main/java/app/kintai/common/ と、そのテストだけです。チームで合意した内容だけを変更してください。
- それ以外のファイル（他の人の担当範囲）は絶対に変更しないでください。範囲外の変更が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 既にある部品の動きを変えるときは、どのファイルが使っているかを一覧にして先に見せてください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください。
- 変更したら、テストを足すか直し、`gradle test` が通る形にしてください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
