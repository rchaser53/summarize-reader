export async function speakWithVoicevox(text, { baseUrl = process.env.VOICEVOX_URL || 'http://127.0.0.1:50021', speaker = Number(process.env.VOICEVOX_SPEAKER_ID ?? 3), outputPath, fetchImpl = fetch } = {}) {
  if (!text?.trim()) throw new Error('読み上げる文章が空です。');
  const base = baseUrl.replace(/\/$/, '');
  const chunks = splitText(cleanForSpeech(text));
  const clips = [];
  for (const chunk of chunks) {
    const queryUrl = new URL(`${base}/audio_query`);
    queryUrl.searchParams.set('text', chunk);
    queryUrl.searchParams.set('speaker', String(speaker));
    const queryResponse = await fetchImpl(queryUrl, { method: 'POST' });
    if (!queryResponse.ok) throw new Error(`VOICEVOX 音声クエリに失敗しました (HTTP ${queryResponse.status})。VOICEVOX Engine が起動しているか確認してください。`);
    const synthesisUrl = new URL(`${base}/synthesis`);
    synthesisUrl.searchParams.set('speaker', String(speaker));
    const synthesisResponse = await fetchImpl(synthesisUrl, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(await queryResponse.json()),
    });
    if (!synthesisResponse.ok) throw new Error(`VOICEVOX 音声合成に失敗しました (HTTP ${synthesisResponse.status})`);
    clips.push(Buffer.from(await synthesisResponse.arrayBuffer()));
  }
  const audio = joinWaveClips(clips);
  if (outputPath) {
    const { writeFile } = await import('node:fs/promises');
    await writeFile(outputPath, audio);
  }
  return audio;
}

function cleanForSpeech(text) {
  return text
    .replace(/^\s*(?:[-*]\s*)?URL\s*:\s*.*$/gim, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[*#`_]/g, '')
    .replace(/^\s*[-*]\s*/gm, '')
    .replace(/^\s*\d+[.)]\s*/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n+/g, '。')
    .trim();
}

function splitText(text, maxLength = 250) {
  const sentences = text.replace(/\r/g, '').split(/(?<=[。！？.!?\n])\s*/u).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    let remaining = sentence;
    while (remaining.length > maxLength) {
      if (current) chunks.push(current);
      current = '';
      chunks.push(remaining.slice(0, maxLength));
      remaining = remaining.slice(maxLength);
    }
    if (!remaining) continue;
    const next = current ? `${current} ${remaining}` : remaining;
    if (next.length > maxLength && current) {
      chunks.push(current);
      current = remaining;
    } else current = next;
  }
  if (current) chunks.push(current);
  return chunks;
}

function joinWaveClips(clips) {
  if (clips.length === 1) return clips[0];
  const firstData = findWaveData(clips[0]);
  const pcm = clips.map((clip) => {
    const data = findWaveData(clip);
    return clip.subarray(data.offset, data.offset + data.size);
  }).reduce((all, part) => Buffer.concat([all, part]), Buffer.alloc(0));
  const header = Buffer.from(clips[0].subarray(0, firstData.offset));
  header.writeUInt32LE(header.length + pcm.length - 8, 4);
  header.writeUInt32LE(pcm.length, firstData.sizeOffset);
  return Buffer.concat([header, pcm]);
}

function findWaveData(wave) {
  if (wave.toString('ascii', 0, 4) !== 'RIFF' || wave.toString('ascii', 8, 12) !== 'WAVE') throw new Error('VOICEVOX から WAV 音声を取得できませんでした。');
  let offset = 12;
  while (offset + 8 <= wave.length) {
    const size = wave.readUInt32LE(offset + 4);
    if (wave.toString('ascii', offset, offset + 4) === 'data') return { offset: offset + 8, sizeOffset: offset + 4, size };
    offset += 8 + size + (size % 2);
  }
  throw new Error('VOICEVOX の WAV に音声データがありません。');
}
