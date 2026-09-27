import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root.endsWith(sep) ? root : root + sep) || !['.html', '.css', '.js', '.svg', '.json'].includes(extname(path)) || pathname.includes('/.')) {
      res.writeHead(404).end('Not found'); return;
    }
    const content = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }).end(content);
  } catch { res.writeHead(404).end('Not found'); }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log(`Little Keys is ready at http://localhost:${server.address().port}`));
