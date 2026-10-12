import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: '홈쇼핑 요금 뷰어',
  description: '홈쇼핑 방송 요금과 패키지미디어 여행 영상을 확인하는 읽기 전용 뷰어',
  robots: { index: false, follow: false }
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
