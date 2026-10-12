import { describe, expect, it } from 'vitest';
import { buildBatchUpdate, prepareCandidate, publishCandidate, recoverRelease, rollbackAsNewRelease } from '@/lib/apps-script/model';

describe('Apps Script publish model', () => {
  const rows = [{ id: 'a', value: 1 }];
  it('prepares deterministic candidate snapshots and detects stale source', () => {
    const candidate = prepareCandidate(rows, '2026-10', 'editor@company.example');
    expect(candidate.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(candidate.snapshot).toEqual(rows);
    expect(() => publishCandidate(candidate, [{ id: 'a', value: 2 }], { publisher: 'publisher@company.example', allowedPublishers: ['publisher@company.example'], lockAcquired: true, existingReleases: [] })).toThrow('stale');
  });
  it('requires lock and publisher allowlist and emits one batchUpdate model', () => {
    const candidate = prepareCandidate(rows, '2026-10', 'editor@company.example');
    expect(() => publishCandidate(candidate, rows, { publisher: 'evil@example.com', allowedPublishers: [], lockAcquired: true, existingReleases: [] })).toThrow('publisher');
    expect(() => publishCandidate(candidate, rows, { publisher: 'publisher@company.example', allowedPublishers: ['publisher@company.example'], lockAcquired: false, existingReleases: [] })).toThrow('lock');
    const release = publishCandidate(candidate, rows, { publisher: 'publisher@company.example', allowedPublishers: ['publisher@company.example'], lockAcquired: true, existingReleases: [] });
    expect(buildBatchUpdate(release).requests.length).toBeGreaterThan(0);
    expect(buildBatchUpdate(release).kind).toBe('spreadsheets.batchUpdate');
  });
  it('recovers idempotently, verifies readback and rolls back as a new release', () => {
    const candidate = prepareCandidate(rows, '2026-10', 'editor@company.example');
    const release = publishCandidate(candidate, rows, { publisher: 'publisher@company.example', allowedPublishers: ['publisher@company.example'], lockAcquired: true, existingReleases: [] });
    expect(recoverRelease(release, [release])).toEqual(release);
    expect(() => recoverRelease(release, [{ ...release, hash: '0'.repeat(64) }])).toThrow('readback');
    const rollback = rollbackAsNewRelease(release, 'publisher@company.example');
    expect(rollback.id).not.toBe(release.id);
    expect(rollback.rollbackOf).toBe(release.id);
  });
});
