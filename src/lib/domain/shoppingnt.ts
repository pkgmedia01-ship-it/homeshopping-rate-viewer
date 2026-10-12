export const shoppingNtDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type ShoppingNtDay = (typeof shoppingNtDays)[number];
export type ShoppingNtZone = 'inside_box' | 'outside_box';

export function shoppingNtZone(day: ShoppingNtDay, hour: number): ShoppingNtZone {
  const weekendInside = (day === 'Sat' || day === 'Sun') && hour >= 6 && hour <= 22;
  const weekdayEveningInside = day !== 'Sat' && day !== 'Sun' && hour >= 19 && hour <= 22;
  return weekendInside || weekdayEveningInside ? 'inside_box' : 'outside_box';
}

export function shoppingNtBoundary(day: ShoppingNtDay, hour: number) {
  const dayIndex = shoppingNtDays.indexOf(day);
  const inside = shoppingNtZone(day, hour) === 'inside_box';
  if (!inside) return { top: false, right: false, bottom: false, left: false };
  const previousDay = dayIndex > 0 ? shoppingNtDays[dayIndex - 1] : null;
  const nextDay = dayIndex < shoppingNtDays.length - 1 ? shoppingNtDays[dayIndex + 1] : null;
  return {
    top: hour === 0 || shoppingNtZone(day, hour - 1) === 'outside_box',
    right: nextDay === null || shoppingNtZone(nextDay, hour) === 'outside_box',
    bottom: hour === 23 || shoppingNtZone(day, hour + 1) === 'outside_box',
    left: previousDay === null || shoppingNtZone(previousDay, hour) === 'outside_box'
  };
}
