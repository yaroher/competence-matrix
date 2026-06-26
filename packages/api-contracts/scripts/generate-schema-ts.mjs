// Generates src/schema.ts (runtime typeDefs export) from the single source of
// truth src/schema.graphql. Run as part of `codegen`. Do not edit schema.ts by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const sdlPath = join(here, '..', 'src', 'schema.graphql');
const outPath = join(here, '..', 'src', 'schema.ts');

const sdl = readFileSync(sdlPath, 'utf8').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

const contents = `// AUTO-GENERATED from schema.graphql by scripts/generate-schema-ts.mjs.
// Do not edit by hand — change schema.graphql and run \`yarn codegen\`.
export const schema = /* GraphQL */ \`
${sdl}\`;
`;

writeFileSync(outPath, contents);
console.log(`schema.ts generated from schema.graphql (${sdl.length} chars)`);
