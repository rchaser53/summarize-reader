# summarize-reader

ChatGPT で作成した要約文を、VOICEVOX のずんだもんに読み上げてもらうローカルアプリです。要約に AI API は使いません。

## 必要なもの

- Node.js 20 以降
- VOICEVOX Engine（読み上げ時）
- ChatGPT アプリ（要約を作成するため）

## 使い方

1. ChatGPT のチャット欄に記事 URL を貼り、例えば次のように依頼します。

   ```text
   このURLの記事を日本語で要約してください。音声で聞きやすいよう、見出しやURLを含めず、要約本文だけを出してください。
   https://example.com/article
   ```

2. ChatGPT の要約文をコピーします。
3. 読み上げ方を選びます。

### GUI に貼り付ける

```sh
npm start
```

ブラウザーで <http://127.0.0.1:4173> を開き、ChatGPT の要約文を貼り付けて「ずんだもんで読み上げる」を押します。音声ができたらページ内プレーヤーの再生ボタンを押してください。

### CLI で読み上げる

要約文をコピーした状態で macOS のターミナルから実行します。

```sh
pbpaste | node src/cli.js
```

または要約文を直接渡します。

```sh
node src/cli.js "ここにChatGPTの要約文を貼り付ける"
```

WAV ファイルとして保存する場合:

```sh
pbpaste | node src/cli.js --output summary.wav
```

CLI は WAV を生成後に外部プレーヤーを起動し、再生の終了を待たずにターミナルへ戻ります。

## 設定

| 環境変数 | 初期値 | 説明 |
| --- | --- | --- |
| `VOICEVOX_URL` | `http://127.0.0.1:50021` | VOICEVOX Engine の URL |
| `VOICEVOX_SPEAKER_ID` | `3` | 話者 ID。3 はずんだもん（ノーマル） |
| `PORT` | `4173` | GUI サーバーのポート |

このアプリは記事の要約を生成しません。ChatGPT に URL を渡して要約を作り、結果を貼り付ける使い方です。そのため `OPENAI_API_KEY` は不要で、アプリから OpenAI API へのリクエストも行いません。
