import type { Release } from '@/lib/schema/rates';
export interface SheetsReadAdapter {
  getPublishedRelease(month: string): Promise<Release | null>;
}
export class NotConfiguredSheetsAdapter implements SheetsReadAdapter {
  async getPublishedRelease(): Promise<never> { throw new Error('Sheets adapter not configured'); }
}
