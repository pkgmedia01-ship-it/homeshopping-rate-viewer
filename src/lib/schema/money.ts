export function manwonToKrw(amount: number | null): number | null {
  if (amount === null) return null;
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError('만원 금액은 0 이상의 안전한 정수여야 합니다.');
  }
  const won = amount * 10_000;
  if (!Number.isSafeInteger(won)) {
    throw new RangeError('원화 변환 결과가 안전한 정수 범위를 벗어납니다.');
  }
  return won;
}
