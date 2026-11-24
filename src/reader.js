import { speakWithVoicevox } from './voicevox.js';

export async function readSummary(text, options = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('読み上げる文章を入力してください。');
  const summary = text.trim();
  const audio = await (options.speakWithVoicevox ?? speakWithVoicevox)(summary, options.voiceOptions);
  return { summary, audio };
}
