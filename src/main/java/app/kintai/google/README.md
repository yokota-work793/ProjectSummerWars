# google：Google（スプレッドシート・ドライブ）の窓口　担当：宮谷

システムから Google を触るときは、必ずここの GoogleWorkspace を通す。

| ファイル | 中身 |
|---|---|
| GoogleWorkspace | できること一覧（読む・シート複製・セルに書く・フォルダ作成・コピー・共有・共有解除・移動） |
| GoogleRestWorkspace | 本物（サービスアカウントで Sheets API・Drive API を呼ぶ） |
| FakeGoogleWorkspace | 仮データ（鍵がないとき・テストのとき） |
| GoogleConfig | 環境変数 GOOGLE_CREDENTIALS があれば本物、なければ仮データ |

## やること
- [ ] Google Cloud でプロジェクトとサービスアカウントを作り、Sheets API・Drive API を有効にする（README の「Google の準備」）
- [ ] 鍵ファイルを安全な場所に置き、GOOGLE_CREDENTIALS に場所を入れる（鍵は Git に入れない）
- [ ] GoogleRestWorkspace の全部の機能を、本物のファイルで1つずつ確認する
- [ ] 共有ドライブを使うか決める（使うなら共有ドライブにサービスアカウントを追加）


## 担当内容（宮谷さん）
- 上の「やること」を上から順に進める
- このフォルダのファイルを変えたら、対応するテストも足す
- 他の人の担当フォルダを変えたいときは、自分で直さずに担当者へ伝える（Issue か Pull Request に名前を書く）

## AIへの指示プロンプト（コピーして使う）
AI（Claude など）に作業を頼むときは、下をそのまま貼り、「今回やりたいこと」だけ書き換えてください。

```
あなたは「勤怠・給与集計システム」（GitHub: yokota-work793/ProjectSummerWars。Java 21 / Spring Boot 3（API） / React + Vite（画面・frontend/） / Flyway / Gradle）の開発を手伝うアシスタントです。
私は宮谷で、担当は「Google連携」です。

# 今回やりたいこと
（例）GoogleRestWorkspace の共有解除が本物の Google で動くか確かめる手順と、足りない処理を直したい。

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
