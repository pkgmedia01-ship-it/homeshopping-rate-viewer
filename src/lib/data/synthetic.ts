import { sha256Canonical } from '@/lib/domain/release';
import { shoppingNtDays } from '@/lib/domain/shoppingnt';
import type { Release } from '@/lib/schema/rates';
import { pkgVendorVideos } from '@/lib/data/pkgvendor-videos';
import { shoppingNtIptvRates, shoppingNtNationalRates, shoppingNtNovemberStarts, type ShoppingNtRateMode } from '@/lib/data/shoppingnt-november';

const days = shoppingNtDays;
const releaseMonth = '2026-11';
const evidence = [
  { id: 'ev-shoppingnt', label: '사용자 제공 11월 쇼핑엔티 방송 요금표 XLSX', sha256: '3ddeb86392dc9fdcc7fdcff07a5fc4f7821243b165cae10e991f2915ba3ebdf3', page: 1, locator: 'Sheet1:전국 방송 기준,IPTV 기준', synthetic: false },
  { id: 'ev-kt', label: '10월 KT알파쇼핑 요금표 PDF', sha256: 'ed963f23bba5e31d39350c9468338475999d130fa643db22a6da8f6a7f2bb03e', page: 1, locator: 'table:운영시간대별 수수료', synthetic: false },
  { id: 'ev-cj', label: '10월 CJ온스타일 요금표 PDF', sha256: '0ba560ab04466efecc7a240c8048db3ebfc5395375738a616142be354f6e75e0', page: 1, locator: 'tables:TV LIVE,T커머스', synthetic: false }
] as const;

type Channel = 'ShoppingNT' | 'KT' | 'CJ';
type Segment = 'DEFAULT' | 'TV_LIVE' | 'T_COMMERCE';
type Basis = 'time_slot_fee' | 'live_airing_fee' | 'set_fee';
function offer(id: string, channel: Channel, segment: Segment, label: string, priceManwon: number, evidenceId: string, priceBasis: Basis, vat: 'excluded' | 'unspecified') {
  return { id, month: releaseMonth, channel, segment, label, priceManwon, vat, priceBasis, reviewState: 'approved' as const, monthConfirmed: true as const, evidenceId };
}

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

  const shoppingNtTables: Record<ShoppingNtRateMode, typeof shoppingNtNationalRates> = { national: shoppingNtNationalRates, iptv: shoppingNtIptvRates };
  for (const [mode, rates] of Object.entries(shoppingNtTables) as [ShoppingNtRateMode, typeof shoppingNtNationalRates][]) {
    for (const day of days) for (let hour = 0; hour < 24; hour++) {
      const h = String(hour).padStart(2, '0');
      const id = `snt-${mode}-${day.toLowerCase()}-${h}`;
      const start = shoppingNtNovemberStarts[hour]!;
      const end = shoppingNtNovemberStarts[(hour + 1) % 24]!;
      offers.push(offer(id, 'ShoppingNT', 'DEFAULT', `${mode === 'national' ? '전국 방송' : 'IPTV'} ${day} ${start}`, rates[day][hour]!, 'ev-shoppingnt', 'time_slot_fee', 'excluded'));
      airings.push({ id: `${id}-airing`, offerId: id, channel: 'ShoppingNT', day, start, end, endDayOffset: hour === 23 ? 1 : 0, kind: 'slot', timeKind: 'explicit', evidenceId: 'ev-shoppingnt' });
    }
  }

  const ktHours = [0, 17, 18, 19, 20, 21, 22, 23] as const;
  for (const day of days) for (const [hourIndex, hour] of ktHours.entries()) {
    const h = String(hour).padStart(2, '0');
    const id = `kt-offer-${day.toLowerCase()}-${h}`;
    const price = ktRates[day][hourIndex]!;
    offers.push(offer(id, 'KT', 'DEFAULT', `${day} ${h}:38`, price, 'ev-kt', 'time_slot_fee', 'unspecified'));
    airings.push({ id: `kt-${day.toLowerCase()}-${h}`, offerId: id, channel: 'KT', day, start: `${h}:38`, end: `${String((hour + 1) % 24).padStart(2, '0')}:38`, endDayOffset: hour === 23 ? 1 : 0, kind: 'slot', timeKind: 'explicit', evidenceId: 'ev-kt' });
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
    { id: 'snt-condition', channel: 'ShoppingNT', kind: 'condition', label: '11월 9일부터 전국 방송과 IPTV 분리송출 요금 적용.', priceManwon: null, evidenceId: 'ev-shoppingnt' },
    { id: 'kt-disclaimer', channel: 'KT', kind: 'disclaimer', label: 'KT 기준안: 내부 가중치에 따라 실제 청구 요금이 달라질 수 있음. 01–16시는 원본 미기재.', priceManwon: null, evidenceId: 'ev-kt' },
    { id: 'cj-vat', channel: 'CJ', kind: 'vat', label: 'CJ 정액 수수료는 VAT 제외.', priceManwon: null, evidenceId: 'ev-cj' }
  ];
  const videos: Release['videos'] = pkgVendorVideos;
  const base = { id: 'release-xlsx-review-2026-11-v1', month: releaseMonth, version: '2026.11', publishedAt: '2026-10-14T00:00:00.000Z', unit: '만원' as const, synthetic: true, evidence: [...evidence], offers, airings, rules, videos, counts: { offers: offers.length, airings: airings.length, rules: rules.length, videos: videos.length } };
  return { ...base, contentHash: sha256Canonical(base) };
}

export function createReviewedRelease(): Release {
  const { contentHash: _contentHash, ...release } = createSyntheticRelease();
  void _contentHash;
  const reviewed = { ...release, synthetic: false };
  return { ...reviewed, contentHash: sha256Canonical(reviewed) };
}
