#!/usr/bin/env node
import { readSummary } from './reader.js';
import { playAudio } from './play-audio.js';

const args = process.argv.slice(2);
const usage = '使い方: pbpaste | node src/cli.js [--output summary.wav]\nまたは: node src/cli.js "ChatGPTで作成した要約" [--output summary.wav]';
if (args.includes('--help') || args.includes('-h')) {
  console.log(usage);
} else {
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
  const textArgs = args.filter((arg, index) => arg !== '--output' && (outputIndex < 0 || index !== outputIndex + 1));
  if (outputIndex >= 0 && (!outputPath || outputPath.startsWith('--'))) {
    console.error('--output の後に保存先のファイル名を指定してください。');
    process.exitCode = 1;
  } else if (!textArgs.length && process.stdin.isTTY) {
    console.log(usage);
    process.exitCode = 1;
  } else {
  try {
    const text = textArgs.length ? textArgs.join(' ') : await readStdin();
    console.error('VOICEVOX で音声を生成しています…');
    const result = await readSummary(text, { voiceOptions: outputPath ? { outputPath } : undefined });
    if (outputPath) console.log(`音声ファイル: ${outputPath}`);
    else {
      await playAudio(result.audio);
      console.log('\n音声再生を開始しました。再生はバックグラウンドで続きます。');
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exitCode = 1;
  }
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}
