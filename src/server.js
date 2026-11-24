import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { speakWithVoicevox } from './voicevox.js';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (request.method === 'POST' && pathname === '/api/speak') {
    try {
      const { text } = JSON.parse(await readBody(request));
      const audio = await speakWithVoicevox(text);
      response.writeHead(200, { 'content-type': 'audio/wav', 'content-length': audio.length });
      response.end(audio);
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  if (request.method !== 'GET') {
    response.writeHead(405).end('Method not allowed');
    return;
  }
  const relative = normalize(pathname === '/' ? 'index.html' : pathname.slice(1));
  if (relative.startsWith('..')) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const content = await readFile(join(root, relative));
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
    response.writeHead(200, { 'content-type': types[extname(relative)] || 'application/octet-stream' });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`summarize-reader GUI: http://127.0.0.1:${port}`));

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 128_000) {
        reject(new Error('文章が長すぎます (上限 128 KB)。'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}
