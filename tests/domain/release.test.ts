import { describe, expect, it } from 'vitest';
import { createSyntheticRelease } from '@/lib/data/synthetic';
import { canonicalJson, sha256Canonical, validateReleaseIntegrity } from '@/lib/domain/release';
import { DraftOfferSchema, PublishedReleaseSchema } from '@/lib/schema/rates';

describe('release domain', () => {
  it('keeps canonical JSON and hash stable regardless of object key order', () => {
    expect(canonicalJson({ b: 2, a: { d: 4, c: 3 } })).toBe('{"a":{"c":3,"d":4},"b":2}');
    expect(sha256Canonical({ a: 1, b: 2 })).toBe(sha256Canonical({ b: 2, a: 1 }));
  });

  it('allows unknown draft values but published data requires resolved positive confirmed prices', () => {
    expect(DraftOfferSchema.safeParse({ id: 'draft-1', month: null, channel: null, priceManwon: null, reviewState: 'unresolved', monthConfirmed: false }).success).toBe(true);
    const release = createSyntheticRelease();
    expect(PublishedReleaseSchema.safeParse(release).success).toBe(true);
    release.offers[0]!.priceManwon = 0;
    expect(PublishedReleaseSchema.safeParse(release).success).toBe(false);
    release.offers[0]!.priceManwon = 1;
    (release.offers[0] as { reviewState: string }).reviewState = 'unresolved';
    expect(PublishedReleaseSchema.safeParse(release).success).toBe(false);
    (release.offers[0] as { reviewState: string }).reviewState = 'approved';
    (release.offers[0] as { monthConfirmed: boolean }).monthConfirmed = false;
    expect(PublishedReleaseSchema.safeParse(release).success).toBe(false);
  });

  it('builds the exact synthetic regression fixture and validates relations', () => {
    const release = createSyntheticRelease();
    expect(release.synthetic).toBe(true);
    expect(release.evidence.every((e) => /^[a-f0-9]{64}$/.test(e.sha256))).toBe(true);
    expect(release.evidence.find((e) => e.id === 'ev-shoppingnt')).toMatchObject({ synthetic: false, sha256: '0da5da5e0b241a87abb960be2a60550ce1a01457cbb9f20f6e6bb4a96ab774af' });
    expect(release.evidence.find((e) => e.id === 'ev-kt')).toMatchObject({ synthetic: false, sha256: 'ed963f23bba5e31d39350c9468338475999d130fa643db22a6da8f6a7f2bb03e', page: 1 });
    expect(release.evidence.find((e) => e.id === 'ev-cj')).toMatchObject({ synthetic: false, sha256: '0ba560ab04466efecc7a240c8048db3ebfc5395375738a616142be354f6e75e0', page: 1 });
    expect(release.offers.filter((x) => x.channel === 'ShoppingNT')).toHaveLength(168);
    expect(release.airings.filter((x) => x.channel === 'ShoppingNT')).toHaveLength(168);
    expect(release.offers.filter((x) => x.channel === 'KT')).toHaveLength(56);
    expect(release.airings.filter((x) => x.channel === 'KT')).toHaveLength(56);
    expect(release.offers.filter((x) => x.channel === 'CJ')).toHaveLength(7);
    expect(release.airings.filter((x) => x.channel === 'CJ')).toHaveLength(9);
    const cjSets = release.offers.filter((x) => x.channel === 'CJ' && x.priceBasis === 'set_fee');
    expect(cjSets.map((x) => x.priceManwon)).toEqual([5700, 5300]);
    expect(cjSets.map((x) => release.airings.filter((a) => a.offerId === x.id).length)).toEqual([2, 2]);
    expect(release.airings.filter((x) => x.offerId === cjSets[0]!.id).map((x) => [x.day, x.start, x.end, x.endDayOffset])).toEqual([
      ['Fri', '22:45', '23:45', 0],
      ['Sun', '18:45', '19:45', 0]
    ]);
    expect(release.airings.filter((x) => x.offerId === cjSets[1]!.id).map((x) => [x.day, x.start, x.end, x.endDayOffset])).toEqual([
      ['Fri', '23:45', '00:45', 1],
      ['Sun', '19:45', '20:45', 0]
    ]);
    expect(release.airings.every((x) => !Object.hasOwn(x, 'priceManwon'))).toBe(true);
    const cjPeak = release.offers.find((x) => x.id === 'cj-live-sun-1925');
    expect(cjPeak?.priceManwon).toBe(14885);
    expect(release.airings.find((x) => x.offerId === cjPeak?.id)?.end).toBe('20:30');
    expect(release.offers.find((x) => x.id === 'kt-offer-tue-19')?.priceManwon).toBe(4342);
    expect(release.offers.find((x) => x.id === 'kt-offer-wed-19')?.priceManwon).toBe(4343);
    expect(release.rules.some((x) => x.priceManwon === null)).toBe(true);
    expect(release.videos).toHaveLength(46);
    expect(release.videos.filter((video) => video.country === '베트남')).toHaveLength(20);
    expect(release.videos.filter((video) => video.country === '필리핀')).toHaveLength(9);
    expect(release.videos.filter((video) => video.region === '다낭')).toHaveLength(8);
    expect(release.videos.every((video) => video.sourceChannel === '패키지미디어' && video.approved)).toBe(true);
    expect(validateReleaseIntegrity(release)).toEqual([]);
  });

  it('preserves all 56 KT prices from the supplied PDF', () => {
    const release = createSyntheticRelease();
    const hours = ['00', '17', '18', '19', '20', '21', '22', '23'];
    const expected = {
      Mon: [1390, 2750, 3150, 4450, 5081, 4650, 3450, 2500],
      Tue: [1390, 2800, 3220, 4342, 5290, 4650, 3420, 2520],
      Wed: [1390, 2800, 3220, 4343, 5500, 4650, 3420, 2520],
      Thu: [1390, 2800, 3220, 4400, 5247, 4650, 3420, 2500],
      Fri: [1390, 2800, 3150, 4350, 5000, 4500, 3550, 2630],
      Sat: [1560, 3750, 3800, 4700, 5430, 4940, 4200, 2650],
      Sun: [1530, 3800, 3860, 4940, 5480, 4750, 4230, 2580]
    } as const;
    for (const [day, prices] of Object.entries(expected)) {
      expect(hours.map((hour) => release.offers.find((offer) => offer.id === `kt-offer-${day.toLowerCase()}-${hour}`)?.priceManwon)).toEqual(prices);
    }
  });

  it('detects broken relation and declared-count integrity', () => {
    const release = createSyntheticRelease();
    release.airings[0]!.offerId = 'missing-offer';
    release.counts.offers = 0;
    release.contentHash = '0'.repeat(64);
    expect(validateReleaseIntegrity(release).join(' ')).toMatch(/missing-offer/);
    expect(validateReleaseIntegrity(release).join(' ')).toMatch(/offer count/);
    expect(validateReleaseIntegrity(release).join(' ')).toMatch(/content hash/);
  });
});
