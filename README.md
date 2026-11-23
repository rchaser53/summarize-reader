# summarize-reader

指定したキーワードでニュースを検索し、記事情報を日本語で要約して、VOICEVOX のずんだもんに読み上げてもらう Node.js アプリです。ローカル GUI と CLI のどちらからも利用できます。

## 必要なもの

- Node.js 20 以降
- 要約用の OpenAI API キー
- 読み上げる場合は起動中の VOICEVOX Engine

このアプリは追加の npm パッケージを使いません。ニュース検索には Google News RSS を使います。

## GUI

```sh
export OPENAI_API_KEY="your-api-key"
npm start
```

ブラウザーで <http://127.0.0.1:4173> を開き、キーワードを入力します。デフォルトでは VOICEVOX Engine を `http://127.0.0.1:50021` で参照します。GUI はブラウザーで再生するため、VOICEVOX に接続できる環境で開いてください。

## CLI

```sh
OPENAI_API_KEY="your-api-key" node src/cli.js "生成AIの最新ニュース"
```

VOICEVOX を使わず要約だけを表示する場合:

```sh
OPENAI_API_KEY="your-api-key" node src/cli.js "生成AIの最新ニュース" --no-speak
```

音声を WAV ファイルとして保存する場合:

```sh
OPENAI_API_KEY="your-api-key" node src/cli.js "生成AIの最新ニュース" --output summary.wav
```

## 設定

| 環境変数 | 初期値 | 説明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | なし | 要約 API の認証キー |
| `OPENAI_MODEL` | `gpt-4o-mini` | Chat Completions API のモデル |
| `VOICEVOX_URL` | `http://127.0.0.1:50021` | VOICEVOX Engine の URL |
| `VOICEVOX_SPEAKER_ID` | `3` | 話者 ID。3 はずんだもん（ノーマル） |
| `PORT` | `4173` | GUI サーバーのポート |

要約は RSS に含まれるタイトル・配信元・概要をもとに作成します。記事本文の取得は行わず、元記事のリンクを結果に表示します。
