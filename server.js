import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const root = import.meta.dirname ?? new URL('.', import.meta.url).pathname;
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
const files = new Set(['/index.html', '/styles.css', '/app.js', '/generator.js', '/assets/conversation.png', '/assets/birds.png', '/assets/ZenMaruGothic-Medium.ttf']);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};

createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try {
    pathname = new URL(request.url, 'http://localhost').pathname;
  } catch {
    response.writeHead(400).end();
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  if (!files.has(pathname)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }
  try {
    const body = await readFile(join(root, pathname));
    response.writeHead(200, { 'Content-Type': contentTypes[extname(pathname)], 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, host, () => {
  console.log(`ほほえみシナリオノートを起動しました: http://localhost:${port}`);
});
