import { searchNews } from './news.js';
import { summarizeNews } from './summarize.js';
import { speakWithVoicevox } from './voicevox.js';

export async function readNews(query, options = {}) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('検索キーワードを入力してください。');
  const progress = options.onProgress ?? (() => {});
  progress('ニュースを検索しています…');
  const articles = await (options.searchNews ?? searchNews)(query.trim(), { limit: options.limit ?? 5 });
  progress(`ニュースを ${articles.length} 件取得しました。要約しています…`);
  const summary = await (options.summarizeNews ?? summarizeNews)(articles, options.summaryOptions);
  let audio;
  if (options.speak !== false) {
    progress('要約ができました。VOICEVOX で音声を生成しています…');
    audio = await (options.speakWithVoicevox ?? speakWithVoicevox)(summary, options.voiceOptions);
  }
  return { query: query.trim(), articles, summary, audio };
}
