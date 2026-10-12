import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { z } from 'zod';
import { parseImportArgs } from '../src/lib/import/options';
import { DraftOfferSchema } from '../src/lib/schema/rates';

async function main() {
  const options = parseImportArgs(process.argv.slice(2));
  if (!options.file) { console.log('DRY RUN: no local JSON supplied; CLI boundary is configured. No external writes.'); return; }
  const path = resolve(process.cwd(), options.file);
  const parsed = JSON.parse(await readFile(path, 'utf8')) as unknown;
  const result = z.array(DraftOfferSchema).safeParse(parsed);
  if (!result.success) throw new Error(`invalid draft JSON: ${result.error.issues.map((x) => x.message).join('; ')}`);
  console.log(`DRY RUN: validated ${result.data.length} draft offers from ${path}. No external writes.`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
