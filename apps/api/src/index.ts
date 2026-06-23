import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createYoga } from 'graphql-yoga';
import { config } from './config.js';
import { loadMvpDataSource } from './data.js';
import { createComatrixContext, createExecutableSchema } from './resolvers.js';

const mvpData = await loadMvpDataSource(config.COMATRIX_DATA_SOURCE, config.COMATRIX_DATABASE_URL);
const yoga = createYoga({
  schema: createExecutableSchema(mvpData),
  graphqlEndpoint: '/graphql',
  cors: {
    origin: ['http://localhost:4200'],
    credentials: false,
  },
  context: createComatrixContext(),
});

const WEB_DIST = process.env.COMATRIX_WEB_DIST ?? join(process.cwd(), '../web/dist/web/browser');
const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function log(level: 'info' | 'warn' | 'error', message: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...fields });
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

async function serveWeb(request: http.IncomingMessage, response: http.ServerResponse): Promise<boolean> {
  const urlPath = decodeURIComponent((request.url ?? '/').split('?')[0]);
  const safe = normalize('.' + urlPath).replace(/^([/\\]\.\.[/\\])+/, '');
  const candidate = join(WEB_DIST, safe);
  try {
    const info = await stat(candidate);
    if (info.isFile()) {
      const data = await readFile(candidate);
      response.writeHead(200, { 'content-type': MIME[extname(candidate)] ?? 'application/octet-stream' });
      response.end(data);
      return true;
    }
  } catch {
    // fall through to SPA index
  }
  try {
    const index = await readFile(join(WEB_DIST, 'index.html'));
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(index);
    return true;
  } catch {
    return false;
  }
}

const server = http.createServer((request, response) => {
  if (request.method === 'GET' && request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        ok: true,
        service: 'comatrix-api',
        dataSource: config.COMATRIX_DATA_SOURCE,
      }),
    );
    return;
  }

  if (request.method === 'GET' && request.url === '/readyz') {
    const ready = mvpData.organization?.id !== undefined;
    response.writeHead(ready ? 200 : 503, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        ready,
        service: 'comatrix-api',
        dataSource: config.COMATRIX_DATA_SOURCE,
        organizationId: mvpData.organization?.id ?? null,
      }),
    );
    return;
  }

  if (request.url === '/graphql') {
    const started = Date.now();
    log('info', 'graphql.request', { method: request.method });
    response.on('finish', () => {
      log('info', 'graphql.response', { status: response.statusCode, durationMs: Date.now() - started });
    });
    yoga(request, response);
    return;
  }

  if (request.method === 'GET') {
    serveWeb(request, response).then((served) => {
      if (!served) {
        response.writeHead(404, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ error: 'Not found', service: 'comatrix-api' }));
      }
    });
    return;
  }

  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(JSON.stringify({ error: 'Not found', service: 'comatrix-api' }));
});

server.listen(config.COMATRIX_API_PORT, '0.0.0.0', () => {
  log('info', 'api.listening', {
    port: config.COMATRIX_API_PORT,
    host: '0.0.0.0',
    dataSource: config.COMATRIX_DATA_SOURCE,
    webDist: WEB_DIST,
  });
});
