# 검증 결과

검증일: 2026-10-14 KST

## 실제 로컬 실행 결과

- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm test -- --run`: **9 files, 30 tests PASS**
- `npm run build`: PASS (Next.js 16.3.8, `/`, `/api/rates`, `/api/videos` 생성)
- `npm run test:e2e`: **desktop + 390px, 6 tests PASS**
- `npm run validate:import`: PASS, dry-run 및 외부 쓰기 없음
- `LOCAL_SYNTHETIC_MODE=true npm run build`: 의도대로 FAIL (`Synthetic bypass refused outside local development/test`)

스크린샷은 E2E 실행 시 `test-results/desktop-viewer.png`, `test-results/mobile-390-viewer.png`에 생성된다. 이 경로는 git에서 제외한다.

## 검증한 로컬 범위

- 쇼핑엔티 제공 Excel의 전국 방송 168개·IPTV 168개, 총 336개 요금 셀과 SHA-256 검증
- 00:33~23:33 시작시간, 빨간 경계(주말 06~22시·평일 19~22시), 전국 방송·IPTV 전환 UI 검증
- 11월 9일 분리송출 시행, 동시송출/IPTV 조합 및 주말 19·20시 IPTV 필수 안내 검증
- KT 제공 PDF의 56개 요금 셀 전수 회귀값과 SHA-256, 기준안·미기재 시간·공휴일 규칙
- CJ 제공 PDF의 LIVE 5개와 T커머스 세트 2개, 구성 방송 9개와 SHA-256
- 공개 YouTube 채널 `@pkgvendor` 영상 46개를 안전한 watch URL로 등록하고 국가·지역·콘텐츠 분류 필터 검증
- 사용자 화면에서는 출처·해시·합성/검수 상태 문구를 숨기고 요금·시간·VAT·편성 조건만 표시
- 홈쇼핑사·요일 기준 필터와 월→일/일→월 시간 정렬. `전체 홈쇼핑사` 상태에서 요일만 선택해도 쇼핑엔티·KT·CJ 결과와 회사별 빈 상태를 한 화면에 표시. 특정 날짜가 없는 원본은 실제 달력 날짜로 확장하지 않음
- CJ 세트 금액은 offer당 한 번만 저장되고 각 세트에 2개 airing이 연결됨
- CJ 23:45→00:45의 `endDayOffset=1`, KT 4,342/4,343 및 CJ 14,885 회귀값
- airing에 가격을 중복 저장하지 않음
- canonical JSON/hash, 릴리스 참조·count 무결성
- 월/도메인/claim/YouTube URL 경계, 요청자 지정 spreadsheet 파라미터 거부
- API 오류와 정상 응답의 `Cache-Control: private, no-store`
- import dry-run 및 apply fail-closed
- Apps Script 게시 알고리즘의 로컬 TypeScript 모델

## 라이브에서만 가능한 미완료 항목

- 실제 Workspace OAuth 로그인, 토큰 서명/issuer/audience/expiry 검증, 외부 계정·ACL 403 검증
- 실제 비공개 Sheets 사용자 OAuth 읽기 및 quota/장애 처리
- 실제 초안/게시 Spreadsheet 생성·공유와 원본 Drive ACL
- Apps Script의 `readRelease_`, 실제 시트 열 매핑, 배포 및 단일 batchUpdate/read-back 통합 검증
- 원본 PDF·Excel 전체 셀 대조와 실제 영상 주석 검수
- Vercel 배포 및 Hobby 이용 조건 적합성 확인

로컬 성공을 Google, Apps Script 또는 Vercel 운영 성공으로 해석하지 않는다.
