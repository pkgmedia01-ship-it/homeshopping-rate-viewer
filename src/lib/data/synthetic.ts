import { sha256Canonical } from '@/lib/domain/release';
import { shoppingNtDays } from '@/lib/domain/shoppingnt';
import type { Release } from '@/lib/schema/rates';
import { pkgVendorVideos } from '@/lib/data/pkgvendor-videos';

const days = shoppingNtDays;
const evidence = [
  { id: 'ev-shoppingnt', label: '사용자 제공 10월 쇼핑엔티 방송 요금표 PDF · 로컬 검수 초안', sha256: '0da5da5e0b241a87abb960be2a60550ce1a01457cbb9f20f6e6bb4a96ab774af', page: 1, locator: 'table:운영시간대별 수수료', synthetic: false },
  { id: 'ev-kt', label: '10월 KT알파쇼핑 요금표 PDF', sha256: 'ed963f23bba5e31d39350c9468338475999d130fa643db22a6da8f6a7f2bb03e', page: 1, locator: 'table:운영시간대별 수수료', synthetic: false },
  { id: 'ev-cj', label: '10월 CJ온스타일 요금표 PDF', sha256: '0ba560ab04466efecc7a240c8048db3ebfc5395375738a616142be354f6e75e0', page: 1, locator: 'tables:TV LIVE,T커머스', synthetic: false }
] as const;

type Channel = 'ShoppingNT' | 'KT' | 'CJ';
type Segment = 'DEFAULT' | 'TV_LIVE' | 'T_COMMERCE';
type Basis = 'time_slot_fee' | 'live_airing_fee' | 'set_fee';
function offer(id: string, channel: Channel, segment: Segment, label: string, priceManwon: number, evidenceId: string, priceBasis: Basis, vat: 'excluded' | 'unspecified') {
  return { id, month: '2026-10', channel, segment, label, priceManwon, vat, priceBasis, reviewState: 'approved' as const, monthConfirmed: true as const, evidenceId };
}

const shoppingNtRates: Record<(typeof days)[number], readonly number[]> = {
  Mon: [938,487,365,302,720,1392,1899,2079,2119,2107,1943,1820,1790,1650,1559,1807,1946,1905,1901,2367,2832,2591,1999,1496],
  Tue: [907,492,364,298,724,1403,1960,2161,2170,2174,1956,1825,1817,1671,1568,1803,1952,1916,1908,2384,2831,2617,1994,1470],
  Wed: [907,492,364,298,724,1403,1960,2161,2170,2174,1956,1825,1817,1671,1568,1803,1952,1916,1908,2384,2831,2617,1994,1470],
  Thu: [907,492,364,298,724,1403,1960,2161,2170,2174,1956,1825,1817,1671,1568,1803,1952,1916,1908,2384,2831,2617,1994,1470],
  Fri: [907,492,364,298,724,1403,1960,2161,2170,2174,1956,1825,1817,1671,1568,1803,1952,1916,1908,2384,2831,2617,1994,1467],
  Sat: [944,590,485,518,675,1525,2647,3051,3021,2916,2713,2488,2474,2485,2471,2524,2628,2561,2575,2916,3141,2922,2251,1604],
  Sun: [953,576,471,465,668,1524,2630,3047,3019,2921,2744,2480,2462,2539,2587,2673,2697,2561,2557,2952,3148,2896,2294,1640]
};

const ktRates: Record<(typeof days)[number], readonly number[]> = {
  Mon: [1390,2750,3150,4450,5081,4650,3450,2500],
  Tue: [1390,2800,3220,4342,5290,4650,3420,2520],
  Wed: [1390,2800,3220,4343,5500,4650,3420,2520],
  Thu: [1390,2800,3220,4400,5247,4650,3420,2500],
  Fri: [1390,2800,3150,4350,5000,4500,3550,2630],
  Sat: [1560,3750,3800,4700,5430,4940,4200,2650],
  Sun: [1530,3800,3860,4940,5480,4750,4230,2580]
};

export function createSyntheticRelease(): Release {
  const offers: Release['offers'] = [];
  const airings: Release['airings'] = [];

  for (const day of days) for (let hour = 0; hour < 24; hour++) {
    const h = String(hour).padStart(2, '0');
    const id = `snt-${day.toLowerCase()}-${h}`;
    offers.push(offer(id, 'ShoppingNT', 'DEFAULT', `${day} ${h}시`, shoppingNtRates[day][hour]!, 'ev-shoppingnt', 'time_slot_fee', 'unspecified'));
    airings.push({ id: `${id}-airing`, offerId: id, channel: 'ShoppingNT', day, start: `${h}:00`, end: `${String((hour + 1) % 24).padStart(2, '0')}:00`, endDayOffset: hour === 23 ? 1 : 0, kind: 'slot', timeKind: 'derived_example', evidenceId: 'ev-shoppingnt' });
  }

  const ktHours = [0, 17, 18, 19, 20, 21, 22, 23] as const;
  for (const day of days) for (const [hourIndex, hour] of ktHours.entries()) {
    const h = String(hour).padStart(2, '0');
    const id = `kt-offer-${day.toLowerCase()}-${h}`;
    const price = ktRates[day][hourIndex]!;
    offers.push(offer(id, 'KT', 'DEFAULT', `${day} ${h}시`, price, 'ev-kt', 'time_slot_fee', 'unspecified'));
    airings.push({ id: `kt-${day.toLowerCase()}-${h}`, offerId: id, channel: 'KT', day, start: `${h}:00`, end: `${String((hour + 1) % 24).padStart(2, '0')}:00`, endDayOffset: hour === 23 ? 1 : 0, kind: 'slot', timeKind: 'derived_example', evidenceId: 'ev-kt' });
  }

  const cjRows = [
    ['cj-live-sat-1840', 'TV_LIVE', '토 LIVE 18:40', 5330, 'live_airing_fee', 'Sat', '18:40', '19:30', 0, 'live'],
    ['cj-live-sun-1735', 'TV_LIVE', '일 LIVE 17:35', 7800, 'live_airing_fee', 'Sun', '17:35', '18:30', 0, 'live'],
    ['cj-live-sun-1830', 'TV_LIVE', '일 LIVE 18:30', 6825, 'live_airing_fee', 'Sun', '18:30', '19:25', 0, 'live'],
    ['cj-live-sun-1925', 'TV_LIVE', '일 LIVE 19:25', 14885, 'live_airing_fee', 'Sun', '19:25', '20:30', 0, 'live'],
    ['cj-live-sun-2135', 'TV_LIVE', '일 LIVE 21:35', 11700, 'live_airing_fee', 'Sun', '21:35', '22:40', 0, 'live'],
    ['cj-tcommerce-set-1', 'T_COMMERCE', 'T커머스 1세트', 5700, 'set_fee', null, null, null, null, null],
    ['cj-tcommerce-set-2', 'T_COMMERCE', 'T커머스 2세트', 5300, 'set_fee', null, null, null, null, null]
  ] as const;
  for (const [id, segment, label, price, basis, day, start, end, offset, kind] of cjRows) {
    offers.push(offer(id, 'CJ', segment, label, price, 'ev-cj', basis, 'excluded'));
    if (day && start && end && offset !== null && kind) airings.push({ id: `${id}-airing`, offerId: id, channel: 'CJ', day, start, end, endDayOffset: offset, kind, timeKind: 'explicit', evidenceId: 'ev-cj' });
  }
  airings.push(
    { id: 'cj-set-1-fri', offerId: 'cj-tcommerce-set-1', channel: 'CJ', day: 'Fri', start: '22:45', end: '23:45', endDayOffset: 0, kind: 'set-component', timeKind: 'explicit', evidenceId: 'ev-cj' },
    { id: 'cj-set-1-sun', offerId: 'cj-tcommerce-set-1', channel: 'CJ', day: 'Sun', start: '18:45', end: '19:45', endDayOffset: 0, kind: 'set-component', timeKind: 'explicit', evidenceId: 'ev-cj' },
    { id: 'cj-set-2-fri', offerId: 'cj-tcommerce-set-2', channel: 'CJ', day: 'Fri', start: '23:45', end: '00:45', endDayOffset: 1, kind: 'set-component', timeKind: 'explicit', evidenceId: 'ev-cj' },
    { id: 'cj-set-2-sun', offerId: 'cj-tcommerce-set-2', channel: 'CJ', day: 'Sun', start: '19:45', end: '20:45', endDayOffset: 0, kind: 'set-component', timeKind: 'explicit', evidenceId: 'ev-cj' }
  );

  const rules: Release['rules'] = [
    { id: 'snt-condition', channel: 'ShoppingNT', kind: 'condition', label: '합성 UI 검증용 조건. 실제 원문 검수 전 자동 견적 금지.', priceManwon: null, evidenceId: 'ev-shoppingnt' },
    { id: 'kt-disclaimer', channel: 'KT', kind: 'disclaimer', label: 'KT 기준안: 내부 가중치에 따라 실제 청구 요금이 달라질 수 있음. 01–16시는 원본 미기재.', priceManwon: null, evidenceId: 'ev-kt' },
    { id: 'cj-vat', channel: 'CJ', kind: 'vat', label: 'CJ 정액 수수료는 VAT 제외.', priceManwon: null, evidenceId: 'ev-cj' }
  ];
  const videos: Release['videos'] = pkgVendorVideos;
  const base = { id: 'release-pdf-review-2026-10-v3', month: '2026-10', version: '2026.10', publishedAt: '2026-10-01T00:00:00.000Z', unit: '만원' as const, synthetic: true, evidence: [...evidence], offers, airings, rules, videos, counts: { offers: offers.length, airings: airings.length, rules: rules.length, videos: videos.length } };
  return { ...base, contentHash: sha256Canonical(base) };
}

export function createReviewedRelease(): Release {
  const { contentHash: _contentHash, ...release } = createSyntheticRelease();
  void _contentHash;
  const reviewed = { ...release, synthetic: false };
  return { ...reviewed, contentHash: sha256Canonical(reviewed) };
}
