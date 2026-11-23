export async function speakWithVoicevox(text, { baseUrl = process.env.VOICEVOX_URL || 'http://127.0.0.1:50021', speaker = Number(process.env.VOICEVOX_SPEAKER_ID ?? 3), outputPath, fetchImpl = fetch } = {}) {
  if (!text?.trim()) throw new Error('読み上げる文章が空です。');
  const base = baseUrl.replace(/\/$/, '');
  const queryUrl = new URL(`${base}/audio_query`);
  queryUrl.searchParams.set('text', text);
  queryUrl.searchParams.set('speaker', String(speaker));
  const queryResponse = await fetchImpl(queryUrl, { method: 'POST' });
  if (!queryResponse.ok) throw new Error(`VOICEVOX 音声クエリに失敗しました (HTTP ${queryResponse.status})。VOICEVOX Engine が起動しているか確認してください。`);
  const synthesisUrl = new URL(`${base}/synthesis`);
  synthesisUrl.searchParams.set('speaker', String(speaker));
  const synthesisResponse = await fetchImpl(synthesisUrl, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(await queryResponse.json()),
  });
  if (!synthesisResponse.ok) throw new Error(`VOICEVOX 音声合成に失敗しました (HTTP ${synthesisResponse.status})`);
  const audio = Buffer.from(await synthesisResponse.arrayBuffer());
  if (outputPath) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(outputPath, audio);
  }
  return audio;
}
