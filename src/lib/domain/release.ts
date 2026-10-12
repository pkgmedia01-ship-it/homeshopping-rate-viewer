import { createHash } from 'node:crypto';
import type { Release } from '@/lib/schema/rates';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
  return value;
}
export function canonicalJson(value: unknown): string { return JSON.stringify(canonical(value)); }
export function sha256Canonical(value: unknown): string { return createHash('sha256').update(canonicalJson(value)).digest('hex'); }

export function validateReleaseIntegrity(release: Release): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const item of [...release.evidence, ...release.offers, ...release.airings, ...release.rules, ...release.videos]) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`); ids.add(item.id);
  }
  const offers = new Set(release.offers.map((x) => x.id));
  const evidence = new Set(release.evidence.map((x) => x.id));
  for (const airing of release.airings) if (!offers.has(airing.offerId)) errors.push(`missing offer ${airing.offerId}`);
  for (const item of [...release.offers, ...release.airings, ...release.rules]) if (item.evidenceId && !evidence.has(item.evidenceId)) errors.push(`missing evidence ${item.evidenceId}`);
  if (release.counts.offers !== release.offers.length) errors.push('offer count mismatch');
  if (release.counts.airings !== release.airings.length) errors.push('airing count mismatch');
  if (release.counts.rules !== release.rules.length) errors.push('rule count mismatch');
  if (release.counts.videos !== release.videos.length) errors.push('video count mismatch');
  const { contentHash, ...content } = release;
  if (sha256Canonical(content) !== contentHash) errors.push('content hash mismatch');
  return errors;
}
