# Google 설정 (미실행)

이 문서는 향후 설정 체크리스트이며 Google 계정·Drive·Sheets·Apps Script에 어떤 변경도 수행하지 않았다.

1. Google Cloud에서 OAuth 동의 화면과 웹 클라이언트를 조직 정책에 맞게 생성한다.
2. `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_WORKSPACE_DOMAIN`을 비밀 저장소에 등록한다.
3. 콜백 URL을 환경별로 제한한다.
4. 토큰의 `email_verified === true`, `hd` exact match, email의 `@domain` exact match를 모두 검증한다.
5. 고정된 서버 측 Spreadsheet ID로 read-only adapter를 구현한다. 요청 파라미터에서 ID/URL을 받지 않는다.
6. `apps-script/`를 별도 검토 후 배포한다. Script Property의 publisher allowlist를 설정하고 Advanced Sheets API를 활성화한다.
7. `readRelease_`를 실제 시트 레이아웃에 맞게 구현하고 준비→stale 검사→lock→단일 batchUpdate→readback→idempotent recovery→새 릴리스 rollback을 통합 테스트한다.

서비스 계정 키나 refresh token을 저장소에 넣지 않는다. 실제 도메인/이메일은 이 POC에 포함하지 않는다.
