# 운영 절차

## 합성 로컬 검증

1. `.env.example`을 참고하되 비밀값을 저장하지 않는다.
2. `LOCAL_SYNTHETIC_MODE=true npm run dev`로 시작한다.
3. 요금·시간·VAT·편성 조건이 표시되고 내부 검증용 해시·출처 문구가 사용자 화면에 노출되지 않는지 확인한다.
4. `/api/rates?month=2026-11`, `/api/videos?month=2026-11` 응답의 `Cache-Control: private, no-store`를 확인한다.
5. `npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e && npm run validate:import`를 실행한다.

## 장애 상태

- 미로그인: `/?state=login`
- 권한 없음: `/?state=403`
- 어댑터 미구성: `/?state=503`
- 공개 릴리스 없음: `/?state=empty`

## 라이브 운영 전 차단 항목

Google OAuth/Sheets 어댑터 및 Apps Script reader를 실제 환경에서 구현·검증하기 전에는 503이 정상이다. 가져오기는 dry-run만 허용되며 `--apply`는 target ID와 확인 토큰을 요구한 뒤에도 writer 미구성으로 거부된다. Apps Script rollback은 과거 릴리스를 변경하지 않고 새 릴리스로 기록해야 한다. 배포 전 Vercel 요금제/Hobby의 사내 사용 적합성 및 정책을 별도로 검토한다.
