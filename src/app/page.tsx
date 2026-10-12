import Viewer from '@/components/viewer';
import { createReviewedRelease, createSyntheticRelease } from '@/lib/data/synthetic';
import { assertRuntimeDataMode, isPublicDemoMode, isRuntimeDataMode } from '@/lib/security/environment';

const states: Record<string, { code: string; title: string; detail: string }> = {
  empty: { code: 'EMPTY', title: '표시할 데이터가 없습니다', detail: '선택한 월의 공개 릴리스가 없습니다.' },
  '403': { code: '403', title: '접근 권한이 없습니다', detail: '정확한 Workspace 도메인 계정만 접근할 수 있습니다.' },
  '503': { code: '503', title: '데이터 연결이 준비되지 않았습니다', detail: 'Google Sheets 읽기 어댑터가 구성되지 않았습니다.' },
  login: { code: 'LOGIN', title: '로그인이 필요합니다', detail: '라이브 모드에서는 검증된 Workspace 로그인이 필요합니다.' }
};
export default async function Home({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  if (state && states[state]) { const view = states[state]; return <main className="state"><span>{view.code}</span><h1>{view.title}</h1><p>{view.detail}</p></main>; }
  assertRuntimeDataMode(process.env);
  if (!isRuntimeDataMode(process.env)) { const view = states['503']!; return <main className="state"><span>{view.code}</span><h1>{view.title}</h1><p>{view.detail}</p></main>; }
  return <Viewer release={isPublicDemoMode(process.env) ? createReviewedRelease() : createSyntheticRelease()} />;
}
