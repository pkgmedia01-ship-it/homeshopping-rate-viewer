import type { Release } from '@/lib/schema/rates';

export type ViewChannel = 'all' | 'ShoppingNT' | 'KT' | 'CJ';
export type ViewDay = 'all' | Release['airings'][number]['day'];
export type ViewOrder = 'weekday-time-asc' | 'weekday-time-desc';

const weekdayOrder: Record<Exclude<ViewDay, 'all'>, number> = {
  Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6
};

export function filterAndSortAirings(
  airings: Release['airings'],
  options: { channel: ViewChannel; day: ViewDay; order: ViewOrder }
): Release['airings'] {
  const direction = options.order === 'weekday-time-desc' ? -1 : 1;
  return [...airings
    .filter((airing) => options.channel === 'all' || airing.channel === options.channel)
    .filter((airing) => options.day === 'all' || airing.day === options.day)]
    .sort((a, b) => direction * (weekdayOrder[a.day] - weekdayOrder[b.day] || a.start.localeCompare(b.start)));
}
