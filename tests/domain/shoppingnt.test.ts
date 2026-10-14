import { describe, expect, it } from 'vitest';
import { createSyntheticRelease } from '@/lib/data/synthetic';
import { shoppingNtZone } from '@/lib/domain/shoppingnt';

describe('ShoppingNT November XLSX-backed release', () => {
  it('preserves all 336 nationwide and IPTV rates with known values', () => {
    const release = createSyntheticRelease();
    const offers = release.offers.filter((offer) => offer.channel === 'ShoppingNT');
    expect(offers).toHaveLength(336);
    expect(offers.find((offer) => offer.id === 'snt-national-mon-00')?.priceManwon).toBe(954);
    expect(offers.find((offer) => offer.id === 'snt-national-fri-23')?.priceManwon).toBe(1465);
    expect(offers.find((offer) => offer.id === 'snt-national-sun-20')?.priceManwon).toBe(3154);
    expect(offers.find((offer) => offer.id === 'snt-iptv-mon-00')?.priceManwon).toBe(570);
    expect(offers.find((offer) => offer.id === 'snt-iptv-sat-19')?.priceManwon).toBe(1670);
    expect(offers.find((offer) => offer.id === 'snt-iptv-sun-20')?.priceManwon).toBe(1780);
    expect(release.airings.find((airing) => airing.offerId === 'snt-national-mon-00')?.start).toBe('00:33');
    expect(release.airings.find((airing) => airing.offerId === 'snt-iptv-mon-00')?.end).toBe('01:33');
  });

  it('matches the PDF red boundary exactly', () => {
    expect(shoppingNtZone('Sat', 6)).toBe('inside_box');
    expect(shoppingNtZone('Sun', 22)).toBe('inside_box');
    expect(shoppingNtZone('Mon', 19)).toBe('inside_box');
    expect(shoppingNtZone('Fri', 22)).toBe('inside_box');
    expect(shoppingNtZone('Fri', 18)).toBe('outside_box');
    expect(shoppingNtZone('Sat', 23)).toBe('outside_box');
    expect(shoppingNtZone('Mon', 0)).toBe('outside_box');
  });
});
