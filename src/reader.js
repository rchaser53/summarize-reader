import { searchNews } from './news.js';
import { summarizeNews } from './summarize.js';
import { speakWithVoicevox } from './voicevox.js';

export async function readNews(query, options = {}) {
  if (typeof query !== 'string' || !query.trim()) throw new Error('検索キーワードを入力してください。');
  const articles = await (options.searchNews ?? searchNews)(query.trim(), { limit: options.limit ?? 5 });
  const summary = await (options.summarizeNews ?? summarizeNews)(articles, options.summaryOptions);
  let audio;
  if (options.speak !== false) audio = await (options.speakWithVoicevox ?? speakWithVoicevox)(summary, options.voiceOptions);
  return { query: query.trim(), articles, summary, audio };
}
