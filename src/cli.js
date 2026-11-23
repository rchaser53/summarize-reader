#!/usr/bin/env node
import { readNews } from './reader.js';
import { playAudio } from './play-audio.js';

const args = process.argv.slice(2);
const usage = '使い方: summarize-reader <検索キーワード> [--no-speak] [--output summary.wav]';
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(usage);
  if (!args.length) process.exitCode = 1;
} else {
  const noSpeak = args.includes('--no-speak');
  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
  const query = args.filter((arg, index) => arg !== '--no-speak' && arg !== '--output' && (outputIndex < 0 || index !== outputIndex + 1)).join(' ');
  try {
    const result = await readNews(query, { speak: !noSpeak, onProgress: (message) => console.error(message), voiceOptions: outputPath ? { outputPath } : undefined });
    console.log(`検索語: ${result.query}\n\n${result.summary}`);
    if (result.audio && outputPath) console.log(`\n音声ファイル: ${outputPath}`);
    else if (result.audio) {
      await playAudio(result.audio);
      console.log('\n音声再生を開始しました。再生はバックグラウンドで続きます。');
    }
  } catch (error) {
    console.error(`エラー: ${error.message}`);
    process.exitCode = 1;
  }
}
