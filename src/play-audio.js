import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function playAudio(audio) {
  const directory = await mkdtemp(join(tmpdir(), 'summarize-reader-'));
  const file = join(directory, 'summary.wav');
  await writeFile(file, audio);
  const [command, args] = process.platform === 'darwin'
    ? ['afplay', [file]]
    : process.platform === 'win32'
      ? ['powershell', ['-NoProfile', '-Command', `(New-Object System.Media.SoundPlayer '${file.replaceAll("'", "''")}').PlaySync()`]]
      : ['ffplay', ['-nodisp', '-autoexit', '-loglevel', 'error', file]];
  await new Promise((resolve, reject) => {
    const player = spawn(command, args, { detached: process.platform !== 'win32', stdio: 'ignore' });
    let started = false;
    const cleanup = () => rm(directory, { recursive: true, force: true }).catch(() => {});
    player.once('spawn', () => {
      started = true;
      player.once('exit', cleanup);
      player.unref();
      resolve();
    });
    player.once('error', (error) => {
      if (!started) cleanup();
      reject(new Error(`音声プレーヤー ${command} を起動できませんでした: ${error.message}`));
    });
  });
}
