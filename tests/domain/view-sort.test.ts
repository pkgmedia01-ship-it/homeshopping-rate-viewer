import { describe, expect, it } from 'vitest';
import { filterAndSortAirings } from '@/lib/domain/view-sort';
import type { Release } from '@/lib/schema/rates';

const airings = [
  { id: 'sun-19', offerId: 'o1', channel: 'CJ', day: 'Sun', start: '19:00', end: '20:00', endDayOffset: 0, kind: 'live', timeKind: 'explicit', evidenceId: 'e' },
  { id: 'mon-20', offerId: 'o2', channel: 'ShoppingNT', day: 'Mon', start: '20:00', end: '21:00', endDayOffset: 0, kind: 'slot', timeKind: 'explicit', evidenceId: 'e' },
  { id: 'mon-08', offerId: 'o3', channel: 'KT', day: 'Mon', start: '08:00', end: '09:00', endDayOffset: 0, kind: 'slot', timeKind: 'explicit', evidenceId: 'e' }
] as Release['airings'];

describe('viewer sorting', () => {
  it('filters by company and weekday without inventing calendar dates', () => {
    expect(filterAndSortAirings(airings, { channel: 'KT', day: 'Mon', order: 'weekday-time-asc' }).map((x) => x.id)).toEqual(['mon-08']);
  });

  it('sorts by weekday then time in both directions', () => {
    expect(filterAndSortAirings(airings, { channel: 'all', day: 'all', order: 'weekday-time-asc' }).map((x) => x.id)).toEqual(['mon-08', 'mon-20', 'sun-19']);
    expect(filterAndSortAirings(airings, { channel: 'all', day: 'all', order: 'weekday-time-desc' }).map((x) => x.id)).toEqual(['sun-19', 'mon-20', 'mon-08']);
  });
});
