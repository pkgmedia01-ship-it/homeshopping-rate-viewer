import { describe, expect, it } from 'vitest';
import { normalizeVideoRegion } from '@/lib/domain/video-region';

describe('video region labels', () => {
  it('groups overlapping Bangkok and Pattaya labels under one combined region', () => {
    expect(normalizeVideoRegion('태국', '방콕')).toBe('방콕 파타야');
    expect(normalizeVideoRegion('태국', '파타야')).toBe('방콕 파타야');
    expect(normalizeVideoRegion('태국', '방콕·파타야')).toBe('방콕 파타야');
  });

  it('groups overlapping Nha Trang and Da Lat labels under one combined region', () => {
    expect(normalizeVideoRegion('베트남', '나트랑')).toBe('나트랑 달랏');
    expect(normalizeVideoRegion('베트남', '달랏')).toBe('나트랑 달랏');
    expect(normalizeVideoRegion('베트남', '나트랑·달랏')).toBe('나트랑 달랏');
  });

  it('keeps unrelated regions unchanged and normalizes separators', () => {
    expect(normalizeVideoRegion('베트남', '다낭')).toBe('다낭');
    expect(normalizeVideoRegion('태국', '치앙마이·치앙라이')).toBe('치앙마이 치앙라이');
  });
});
