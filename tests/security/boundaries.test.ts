import { describe, expect, it } from 'vitest';
import { assertRuntimeDataMode, assertSyntheticMode, isPublicDemoMode, isSyntheticMode } from '@/lib/security/environment';
import { emailBelongsToWorkspace, validateGoogleClaims } from '@/lib/security/auth';
import { isApprovedVideoUrl } from '@/lib/security/video-url';
import { parseMonth, privateNoStoreHeaders } from '@/lib/http';

describe('fail-closed boundaries', () => {
  it('parses only strict calendar months', () => {
    expect(parseMonth('2026-10')).toBe('2026-10');
    for (const bad of ['2026-1','2026-00','2026-13',' 2026-10','2026-10?x']) expect(() => parseMonth(bad)).toThrow('month');
  });
  it('requires exact workspace domains and verified Google claims', () => {
    expect(emailBelongsToWorkspace('person@company.example', 'company.example')).toBe(true);
    expect(emailBelongsToWorkspace('person@company.example.evil', 'company.example')).toBe(false);
    expect(validateGoogleClaims({ email: 'person@company.example', email_verified: true, hd: 'company.example' }, 'company.example')).toBe(true);
    expect(validateGoogleClaims({ email: 'person@company.example', email_verified: false, hd: 'company.example' }, 'company.example')).toBe(false);
    expect(validateGoogleClaims({ email: 'person@company.example', email_verified: true, hd: 'other.example' }, 'company.example')).toBe(false);
  });
  it('allows only approved exact YouTube HTTPS hosts', () => {
    expect(isApprovedVideoUrl('https://youtube.com/watch?v=abc')).toBe(true);
    expect(isApprovedVideoUrl('https://www.youtube.com/watch?v=abc')).toBe(true);
    expect(isApprovedVideoUrl('https://youtu.be/abc')).toBe(true);
    expect(isApprovedVideoUrl('javascript:alert(1)')).toBe(false);
    expect(isApprovedVideoUrl('https://youtube.com.evil/watch?v=abc')).toBe(false);
  });
  it('enables fixtures only by explicit flag in local development or test and refuses cloud/production', () => {
    expect(isSyntheticMode({ LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'development' })).toBe(true);
    expect(isSyntheticMode({ LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'test' })).toBe(true);
    expect(isSyntheticMode({ LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'production' })).toBe(false);
    expect(isSyntheticMode({ LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'development', VERCEL: '1' })).toBe(false);
    expect(() => assertSyntheticMode({ LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'production' })).toThrow('refused');
  });
  it('allows the reviewed public dataset only with an explicit public deployment flag', () => {
    expect(isPublicDemoMode({ PUBLIC_DEMO_MODE: 'true', NODE_ENV: 'production', VERCEL: '1' })).toBe(true);
    expect(isPublicDemoMode({ NODE_ENV: 'production', VERCEL: '1' })).toBe(false);
    expect(() => assertRuntimeDataMode({ PUBLIC_DEMO_MODE: 'true', LOCAL_SYNTHETIC_MODE: 'true', NODE_ENV: 'test' })).toThrow('mutually exclusive');
  });
  it('marks API responses private and non-cacheable', () => {
    expect(privateNoStoreHeaders()['Cache-Control']).toBe('private, no-store');
  });
});
