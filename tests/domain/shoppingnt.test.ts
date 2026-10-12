import { describe, expect, it } from 'vitest';
import { createSyntheticRelease } from '@/lib/data/synthetic';
import { shoppingNtZone } from '@/lib/domain/shoppingnt';

describe('ShoppingNT PDF-backed draft', () => {
  it('preserves all 168 PDF rates and known values', () => {
    const release = createSyntheticRelease();
    const offers = release.offers.filter((offer) => offer.channel === 'ShoppingNT');
    expect(offers).toHaveLength(168);
    expect(offers.find((offer) => offer.id === 'snt-mon-00')?.priceManwon).toBe(938);
    expect(offers.find((offer) => offer.id === 'snt-fri-23')?.priceManwon).toBe(1467);
    expect(offers.find((offer) => offer.id === 'snt-sun-20')?.priceManwon).toBe(3148);
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
