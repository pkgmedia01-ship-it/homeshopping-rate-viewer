import { afterEach, describe, expect, it } from 'vitest';
import { GET as getRates } from '@/app/api/rates/route';
import { GET as getVideos } from '@/app/api/videos/route';

const original = { ...process.env };
afterEach(() => { process.env = { ...original }; });

describe('read-only APIs', () => {
  it('returns synthetic rates only in explicit local mode with private no-store', async () => {
    process.env.LOCAL_SYNTHETIC_MODE = 'true'; (process.env as Record<string, string | undefined>).NODE_ENV = 'test'; delete process.env.VERCEL;
    const response = await getRates(new Request('http://local/api/rates?month=2026-11'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const json = await response.json();
    expect(json.synthetic).toBe(true);
    expect(json.counts.offers).toBe(399);
  });
  it('rejects malformed months and never accepts request spreadsheet selectors', async () => {
    process.env.LOCAL_SYNTHETIC_MODE = 'true'; (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    expect((await getRates(new Request('http://local/api/rates?month=2026-1'))).status).toBe(400);
    expect((await getRates(new Request('http://local/api/rates?month=2026-11&spreadsheetId=attacker'))).status).toBe(400);
    expect((await getRates(new Request('http://local/api/rates?month=2026-11&fileUrl=https://evil'))).status).toBe(400);
  });
  it('fails closed with 503 when no live adapter is configured', async () => {
    delete process.env.LOCAL_SYNTHETIC_MODE; (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    expect((await getRates(new Request('http://local/api/rates?month=2026-11'))).status).toBe(503);
  });
  it('serves the reviewed dataset when public deployment mode is explicit', async () => {
    delete process.env.LOCAL_SYNTHETIC_MODE; process.env.PUBLIC_DEMO_MODE = 'true'; (process.env as Record<string, string | undefined>).NODE_ENV = 'production'; process.env.VERCEL = '1';
    const response = await getRates(new Request('https://example.vercel.app/api/rates?month=2026-11'));
    expect(response.status).toBe(200);
    expect((await response.json()).counts.videos).toBe(46);
  });
  it('returns the public approved channel videos with safe YouTube URLs', async () => {
    process.env.LOCAL_SYNTHETIC_MODE = 'true'; (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    const response = await getVideos(new Request('http://local/api/videos?month=2026-11'));
    const json = await response.json();
    expect(json.videos).toHaveLength(46);
    expect(json.videos.every((video: { url: string }) => /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/.test(video.url))).toBe(true);
  });
});
