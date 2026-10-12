import { MonthSchema } from '@/lib/schema/rates';
export function parseMonth(value: string | null): string {
  const parsed = MonthSchema.safeParse(value);
  if (!parsed.success) throw new Error('invalid month');
  return parsed.data;
}
export function privateNoStoreHeaders(): Record<string, string> { return { 'Cache-Control': 'private, no-store', 'Content-Type': 'application/json; charset=utf-8' }; }
