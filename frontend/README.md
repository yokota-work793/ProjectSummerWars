# frontend：画面（React + Vite）　担当：指輪

画面はすべてここ。データの読み書きと計算は Java（`src/`）の API が行い、画面は API を呼んで表示するだけ。

| ファイル | 中身 |
|---|---|
| src/main.jsx | 入口 |
| src/App.jsx | URL ごとにどの画面を出すか・ログインの確認 |
| src/Layout.jsx | 左メニュー・お知らせ表示（Flash） |
| src/api.js | Java の API を呼ぶ窓口（ログインの Cookie・安全対策の値もここで扱う） |
| src/pages/Login.jsx | ログイン（POST /api/login） |
| src/pages/EmployeeList.jsx | 社員一覧（GET /api/employees） |
| src/pages/EmployeeForm.jsx | 社員の登録・詳細（/api/employees） |
| src/pages/Monthly.jsx | 月次集計（/api/monthly） |
| src/pages/Settings.jsx | 設定（/api/settings） |
| src/app.css | 見た目（全画面共通） |
| vite.config.js | 開発サーバー（5123）。/api は Java（5124）へ送る |

## 動かし方
Java を先に起動（ターミナル1で `cd ~\ProjectSummerWars` → `git pull` → `.\gradlew bootRun`）してから、ターミナル2で：
```
cd ~\ProjectSummerWars\frontend
npm install      # 毎回やってよい（変わっていなければ数秒）
npm run dev      # http://localhost:5123
```

## API（Java 側）
| 画面 | API | 担当（Java） |
|---|---|---|
| ログイン | POST /api/login（username・password）、POST /api/logout、GET /api/me | 山川（SecurityConfig）・指輪（HomeController） |
| 社員管理 | GET/POST /api/employees、GET/PUT/DELETE /api/employees/{社員番号}、POST /api/employees/{社員番号}/recreate-sheet | 宮谷（EmployeeController・EmployeeForm） |
| 月次集計 | GET /api/monthly?ym=、POST /api/monthly/{sheets\|collect\|send\|fix}?ym=、GET /api/monthly/csv?ym= | 山川（MonthlyController・MonthlyColumns） |
| 設定 | GET/PUT /api/settings、POST /api/settings/import | 指輪（SettingsController） |

エラーのときは `{message, errors: {入力欄の名前: メッセージ}}` が返る（common/ApiErrors）。画面は errors を入力欄の下に出す。

## やること
- [ ] 山本さんに画面を触ってもらい、使いにくいところを直す
- [ ] 実際にスマホで開いて、使いにくいところがないか確認する
- [ ] 画面のテスト（Vitest など）を入れるか決める

## 守ること
- 画面に計算や判断を書かない（Java の Service に書く）。画面は表示と入力だけ
- API を呼ぶときは必ず `src/api.js` を使う（ログインと安全対策の値を自動で付ける）
- 入力欄を足す・変えるときは、Java の担当者（社員管理は宮谷さん、月次集計の列は山川さん）と名前を合わせる
- `node_modules` はコミットしない

## 担当内容（指輪）
- 上の「やること」を上から順に進める
- 画面の動きを変えたら、Java の ScreensTest（API の流れ）も合わせる
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## 作業のしかた（画面が React になってから）
- 編集は **VS Code** がおすすめ（Eclipse は Java 用）。Java を先に起動（ターミナル1で `cd ~\ProjectSummerWars` → `git pull` → `.\gradlew bootRun`）→ ターミナル2で `cd ~\ProjectSummerWars\frontend` → `npm install` → `npm run dev` → http://localhost:5123
- 保存するとブラウザが自動で変わる。Java 側（API）が変わったときは Java を起動し直す
- 5123 → 5124 の中継は vite.config.js の proxy。ポートを変えるときは application.yml（Java）と合わせる
- API の形（項目名・URL）が変わったら、その画面のファイルを直す。Java の担当者から連絡が来る
- 新しい画面（URL）を足したら、App.jsx と config/HomeController.java（指輪）の両方に足す

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は指輪で、担当は「画面（React）」です。

# 今回やりたいこと
（例）社員一覧の画面に、社員番号で並べ替えるボタンを足したい。

# 必ず守ること
- 変更してよいのは、私の担当範囲の次のファイル・フォルダだけです：
  - frontend/
  - src/main/java/app/kintai/settings/
  - src/main/java/app/kintai/config/HomeController.java
  - src/test/java/app/kintai/ScreensTest.java
- 担当範囲の外のファイルは絶対に変更しないでください。範囲外の変更（API の追加など）が必要なときは、コードを書き換えずに「どの担当者の、どのファイルを、なぜ、どう変えてほしいか」を提案として文章で出してください。
- 画面に計算や判断を書かないでください（Java 側に書く作りです）。API は frontend/src/api.js を通して呼んでください。
- 鍵ファイル・パスワード・URL をコードに直接書かないでください（URL やメールは画面「設定」に保存する作りです）。
- 作業の前に、frontend/README.md を読んでください。
- 変更したファイルの一覧と、何をなぜ変えたかを日本語で説明してください。
```
