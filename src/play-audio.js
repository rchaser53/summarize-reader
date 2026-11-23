import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function playAudio(audio) {
  const directory = await mkdtemp(join(tmpdir(), 'summarize-reader-'));
  const file = join(directory, 'summary.wav');
  await writeFile(file, audio);
  try {
    const [command, args] = process.platform === 'darwin'
      ? ['afplay', [file]]
      : process.platform === 'win32'
        ? ['powershell', ['-NoProfile', '-Command', `(New-Object System.Media.SoundPlayer '${file.replaceAll("'", "''")}').PlaySync()`]]
        : ['ffplay', ['-nodisp', '-autoexit', '-loglevel', 'error', file]];
    await new Promise((resolve, reject) => {
      const player = spawn(command, args, { stdio: ['ignore', 'ignore', 'pipe'] });
      let stderr = '';
      player.stderr.setEncoding('utf8');
      player.stderr.on('data', (chunk) => { stderr += chunk; });
      player.once('error', (error) => reject(new Error(`音声プレーヤー ${command} を起動できませんでした: ${error.message}`)));
      player.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} が終了コード ${code} で停止しました。${stderr.trim() ? ` ${stderr.trim()}` : ''}`)));
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
