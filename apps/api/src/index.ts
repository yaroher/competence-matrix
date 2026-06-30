import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createDb, createPool } from '@comatrix/db';
import { DomainError } from '@comatrix/domain';
import { GraphQLError } from 'graphql';
import { createYoga } from 'graphql-yoga';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { createDrizzleCatalogRepository } from './catalog-repository.js';
import { createAccessRepository, type ViewerData } from './access-repository.js';
import { createExecutableSchema, type AppContext } from './resolvers.js';

const pool = createPool();
const db = createDb(pool);
const repository = createDrizzleCatalogRepository(db);
const access = createAccessRepository(db);
const JWT_SECRET = process.env.COMATRIX_JWT_SECRET ?? 'comatrix-dev-secret-change-me';

const yoga = createYoga({
  schema: createExecutableSchema(repository, access, JWT_SECRET),
  graphqlEndpoint: '/graphql',
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    credentials: false,
  },
  context: async ({ request }): Promise<AppContext> => {
    const header = request.headers.get('authorization') ?? '';
    const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';
    if (!token) {
      return { viewer: null };
    }
    let viewer: ViewerData | null = null;
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { sub?: string };
      if (payload.sub) {
        viewer = await access.loadViewer(payload.sub);
      }
    } catch {
      viewer = null;
    }
    return { viewer };
  },
  maskedErrors: {
    // Surface domain validation messages; keep everything else masked.
    maskError(error: unknown, message: string) {
      const original =
        error && typeof error === 'object' && 'originalError' in error
          ? (error as { originalError?: unknown }).originalError
          : error;
      // Surface domain validation + intentional GraphQLErrors (auth/forbidden); mask the rest.
      if (original instanceof DomainError) {
        return new GraphQLError(original.message);
      }
      if (error instanceof GraphQLError && error.extensions?.code) {
        return error;
      }
      return new GraphQLError(message);
    },
  },
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
    response.end(JSON.stringify({ ok: true, service: 'comatrix-api' }));
    return;
  }

  if (request.method === 'GET' && request.url === '/readyz') {
    repository
      .ping()
      .then(() => {
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(JSON.stringify({ ready: true, service: 'comatrix-api' }));
      })
      .catch((error: unknown) => {
        response.writeHead(503, { 'content-type': 'application/json' });
        response.end(
          JSON.stringify({
            ready: false,
            service: 'comatrix-api',
            error: error instanceof Error ? error.message : 'unknown database error',
          }),
        );
      });
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
    webDist: WEB_DIST,
  });
});
