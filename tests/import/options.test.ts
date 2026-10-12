import { describe, expect, it } from 'vitest';
import { parseImportArgs } from '@/lib/import/options';

describe('draft import options', () => {
  it('defaults to dry run and accepts only a local JSON path', () => {
    expect(parseImportArgs([])).toEqual({ mode: 'dry-run' });
    expect(parseImportArgs(['fixtures/draft.json'])).toEqual({ mode: 'dry-run', file: 'fixtures/draft.json' });
    expect(() => parseImportArgs(['https://example.com/file.json'])).toThrow('local');
  });
  it('requires explicit target and confirmation for apply then remains writer-disabled', () => {
    expect(() => parseImportArgs(['--apply'])).toThrow('target');
    expect(() => parseImportArgs(['--apply','--target-spreadsheet-id','sheet-id','--confirm','APPLY_LOCAL_DRAFT'])).toThrow('not configured');
  });
});
