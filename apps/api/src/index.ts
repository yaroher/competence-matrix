import http from 'node:http';
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

function log(level: 'info' | 'warn' | 'error', message: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg: message, ...fields });
  if (level === 'error') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
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
  }

  yoga(request, response);
});

server.listen(config.COMATRIX_API_PORT, () => {
  log('info', 'api.listening', { port: config.COMATRIX_API_PORT, dataSource: config.COMATRIX_DATA_SOURCE });
});
