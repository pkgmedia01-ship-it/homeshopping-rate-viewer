import type { Metadata } from 'next';
import './globals.css';

const title = '홈쇼핑 요금 뷰어';
const description = '11월 기준 홈쇼핑 방송 요금과 패키지미디어 여행 영상을 확인하세요.';
const previewImage = {
  url: '/social-preview-2026-11.png',
  width: 1200,
  height: 630,
  alt: '어딩과 (주)패키지 로고 · 홈쇼핑 요금 뷰어'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://homeshopping-rate-viewer.vercel.app'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    images: [previewImage]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [previewImage]
  },
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
