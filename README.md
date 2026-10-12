# 홈쇼핑 요금 뷰어

읽기 전용 Next.js POC입니다. 쇼핑엔티·KT알파쇼핑·CJ온스타일 `2026-10` 요금은 사용자가 제공한 PDF를 반영했습니다. 쇼핑엔티 168개 셀, KT 56개 셀, CJ 7개 요금 항목과 9개 구성 방송을 검증합니다. 영상 리스트는 공개 YouTube 채널 `@pkgvendor`의 영상 46개를 나라·지역·분류별로 정리했습니다. 원본 PDF·개인정보·비밀값은 저장소나 공개 정적 파일에 복사하지 않습니다.

## 실행

```bash
npm install
LOCAL_SYNTHETIC_MODE=true npm run dev
```

Windows cmd에서는 `set LOCAL_SYNTHETIC_MODE=true&& npm run dev`, PowerShell에서는 `$env:LOCAL_SYNTHETIC_MODE='true'; npm run dev`를 사용합니다.

## 명령

- `npm run dev` / `npm run build`
- `npm run lint` / `npm run typecheck`
- `npm test`
- `npm run test:e2e` (webServer가 로컬 합성 모드를 명시적으로 설정)
- `npm run validate:import` (기본 dry-run, 외부 쓰기 없음)

## 보안 경계

로컬 합성 모드는 `LOCAL_SYNTHETIC_MODE=true`이고 `development`/`test`이며 `VERCEL`이 없을 때만 활성화됩니다. Vercel 공개 배포는 별도의 `PUBLIC_DEMO_MODE=true`로 검수된 읽기 전용 데이터만 제공합니다. 두 모드는 동시에 활성화할 수 없습니다. API는 요청에서 Spreadsheet ID나 파일 URL을 받지 않으며 `private, no-store`입니다. import에는 publish 함수가 없고 live writer는 의도적으로 미구현입니다.

Vercel 공개 배포 절차는 `docs/VERCEL_DEPLOY.md`를 따릅니다. 현재 운영 주소는 <https://homeshopping-rate-viewer.vercel.app>이며 GitHub `main` 브랜치 push 시 Vercel이 자동 재배포합니다. Google 연동은 완료된 것으로 간주하지 않습니다. Google 설정은 `docs/GOOGLE_SETUP.md`, 운영은 `docs/OPERATIONS.md`, 결과 구분은 `docs/VERIFICATION.md`를 참고하세요.
