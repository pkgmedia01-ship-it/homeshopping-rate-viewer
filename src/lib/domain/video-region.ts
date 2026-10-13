const groupedRegions: Record<string, Record<string, string>> = {
  태국: {
    방콕: '방콕 파타야',
    파타야: '방콕 파타야',
    '방콕·파타야': '방콕 파타야',
    '방콕 & 파타야': '방콕 파타야'
  },
  베트남: {
    나트랑: '나트랑 달랏',
    달랏: '나트랑 달랏',
    '나트랑·달랏': '나트랑 달랏',
    '나트랑 & 달랏': '나트랑 달랏'
  }
};

export function normalizeVideoRegion(country: string, region: string): string {
  return groupedRegions[country]?.[region] ?? region.replaceAll('·', ' ').replaceAll(' & ', ' ').replace(/\s+/g, ' ').trim();
}
