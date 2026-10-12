export type ImportOptions = { mode: 'dry-run'; file?: string };
export function parseImportArgs(args: string[]): ImportOptions {
  const apply = args.includes('--apply');
  const positional = args.filter((arg, index) => !arg.startsWith('--') && args[index - 1] !== '--target-spreadsheet-id' && args[index - 1] !== '--confirm');
  const file = positional[0];
  if (file && /^[a-z][a-z0-9+.-]*:\/\//i.test(file)) throw new Error('input must be a local JSON file');
  if (apply) {
    const targetAt = args.indexOf('--target-spreadsheet-id'); const confirmAt = args.indexOf('--confirm');
    if (targetAt < 0 || !args[targetAt + 1]) throw new Error('apply requires explicit target spreadsheet ID');
    if (confirmAt < 0 || args[confirmAt + 1] !== 'APPLY_LOCAL_DRAFT') throw new Error('apply requires confirmation token APPLY_LOCAL_DRAFT');
    throw new Error('live Sheets writer is not configured; apply refused');
  }
  return file ? { mode: 'dry-run', file } : { mode: 'dry-run' };
}
