import { sha256Canonical } from '@/lib/domain/release';
export interface Candidate { id: string; month: string; hash: string; snapshot: unknown[]; preparedBy: string }
export interface ModelRelease extends Candidate { publishedBy: string; status: 'published'; rollbackOf?: string }
export function prepareCandidate(rows: unknown[], month: string, preparedBy: string): Candidate {
  const snapshot = structuredClone(rows); const hash = sha256Canonical({ month, rows: snapshot });
  return { id: `candidate-${month}-${hash.slice(0, 12)}`, month, hash, snapshot, preparedBy };
}
export function publishCandidate(candidate: Candidate, currentRows: unknown[], options: { publisher: string; allowedPublishers: string[]; lockAcquired: boolean; existingReleases: ModelRelease[] }): ModelRelease {
  if (!options.lockAcquired) throw new Error('publish lock required');
  if (!options.allowedPublishers.includes(options.publisher)) throw new Error('publisher not allowed');
  if (sha256Canonical({ month: candidate.month, rows: currentRows }) !== candidate.hash) throw new Error('stale candidate');
  const id = `release-${candidate.month}-${candidate.hash.slice(0, 12)}`;
  const existing = options.existingReleases.find((x) => x.id === id);
  if (existing) return recoverRelease({ ...candidate, id, publishedBy: options.publisher, status: 'published' }, options.existingReleases);
  return { ...candidate, id, publishedBy: options.publisher, status: 'published' };
}
export function buildBatchUpdate(release: ModelRelease) { return { kind: 'spreadsheets.batchUpdate' as const, requests: [{ updateCells: { range: { sheetId: 0 }, rows: release.snapshot, fields: 'userEnteredValue' } }, { appendCells: { sheetId: 1, rows: [release], fields: 'userEnteredValue' } }] }; }
export function recoverRelease(expected: ModelRelease, releases: ModelRelease[]): ModelRelease {
  const found = releases.find((x) => x.id === expected.id);
  if (!found || found.hash !== expected.hash) throw new Error('readback verification failed');
  return found;
}
export function rollbackAsNewRelease(previous: ModelRelease, publisher: string): ModelRelease {
  const nonce = sha256Canonical({ previous: previous.id, publisher, marker: 'rollback' }).slice(0, 8);
  return { ...previous, id: `release-${previous.month}-rollback-${nonce}`, publishedBy: publisher, rollbackOf: previous.id };
}
