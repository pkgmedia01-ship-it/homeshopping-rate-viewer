import { describe, expect, it } from 'vitest';
import { manwonToKrw } from '@/lib/schema/money';

describe('manwonToKrw', () => {
  it('converts an integer 만원 amount to won without rounding', () => {
    expect(manwonToKrw(14885)).toBe(148_850_000);
  });

  it('preserves missing values instead of turning them into zero', () => {
    expect(manwonToKrw(null)).toBeNull();
  });
});
