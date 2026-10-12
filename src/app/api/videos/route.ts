import { createReviewedRelease, createSyntheticRelease } from '@/lib/data/synthetic';
import { parseMonth, privateNoStoreHeaders } from '@/lib/http';
import { assertRuntimeDataMode, isPublicDemoMode, isRuntimeDataMode } from '@/lib/security/environment';
import { isApprovedVideoUrl } from '@/lib/security/video-url';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if ([...url.searchParams.keys()].some((key) => key !== 'month')) return Response.json({ error: 'unsupported query parameter' }, { status: 400, headers: privateNoStoreHeaders() });
  let month: string; try { month = parseMonth(url.searchParams.get('month')); } catch { return Response.json({ error: 'invalid month' }, { status: 400, headers: privateNoStoreHeaders() }); }
  try { assertRuntimeDataMode(process.env); } catch { return Response.json({ error: 'data mode refused' }, { status: 503, headers: privateNoStoreHeaders() }); }
  if (!isRuntimeDataMode(process.env)) return Response.json({ error: 'Sheets adapter not configured' }, { status: 503, headers: privateNoStoreHeaders() });
  if (month !== '2026-10') return Response.json({ videos: [] }, { status: 404, headers: privateNoStoreHeaders() });
  const publicDemo = isPublicDemoMode(process.env);
  const videos = (publicDemo ? createReviewedRelease() : createSyntheticRelease()).videos.filter((video) => video.approved && isApprovedVideoUrl(video.url));
  return Response.json({ month, synthetic: !publicDemo, videos }, { headers: privateNoStoreHeaders() });
}
