const ALLOWED = new Set(['youtube.com', 'www.youtube.com', 'youtu.be']);
export function isApprovedVideoUrl(value: string): boolean {
  try { const url = new URL(value); return url.protocol === 'https:' && ALLOWED.has(url.hostname.toLowerCase()); }
  catch { return false; }
}
