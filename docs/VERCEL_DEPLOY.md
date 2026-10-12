# Vercel 공개 배포 안내

이 앱은 인증 없이 누구나 URL로 접속하는 공개 읽기 전용 사이트로 배포한다. 검색엔진 노출은 `noindex, nofollow`로 억제하지만, 이것은 접근 통제가 아니다. URL을 아는 사람은 요금표와 영상 목록을 볼 수 있다.

## 0. 배포 전 확인

- `PUBLIC_DEMO_MODE=true`: 검수된 2026년 10월 요금과 공개 YouTube 영상 46개를 표시한다.
- `LOCAL_SYNTHETIC_MODE`: Vercel에 추가하지 않는다. `true`이면 빌드가 실패하도록 차단되어 있다.
- 원본 PDF와 비밀값은 배포 파일에 포함되지 않는다.
- Vercel Hobby는 공식 문서상 비상업적 개인 용도만 허용된다. 회사 업무, 고객 제공, 수익 목적, 유급 업무와 연결되면 Pro/Enterprise를 사용하거나 Vercel 지원팀에 적합성을 확인한다.

## 1. 가장 쉬운 방법: GitHub와 Vercel 연결

### 1-1. GitHub 저장소 만들기

1. <https://github.com/new>에 로그인한다.
2. 저장소 이름을 예: `homeshopping-rate-viewer`로 입력한다.
3. 공개 소스 배포가 목적이 아니면 **Private**를 선택한다. 저장소가 Private여도 배포 사이트는 공개로 만들 수 있다.
4. README, `.gitignore`, License 자동 생성을 모두 끄고 빈 저장소를 만든다.
5. GitHub가 보여 주는 저장소 URL을 복사한다.

### 1-2. 로컬 소스를 GitHub에 올리기

Git Bash에서 아래 폴더로 이동한 뒤 실행한다.

```bash
cd 'C:/Users/pkg02/Desktop/Works/projects/홈쇼핑요금뷰어/app'
git status
git add .
git commit -m 'Prepare public Vercel deployment'
git branch -M main
git remote add origin https://github.com/내계정/homeshopping-rate-viewer.git
git push -u origin main
```

이미 `origin`이 있으면 `git remote add` 대신 다음 명령으로 URL을 확인한다.

```bash
git remote -v
```

잘못된 URL이면 다음처럼 교체한다.

```bash
git remote set-url origin https://github.com/내계정/homeshopping-rate-viewer.git
```

GitHub 인증 창이 뜨면 본인 GitHub 계정으로 승인한다. 채팅이나 소스 파일에 비밀번호·토큰을 입력하지 않는다.

### 1-3. Vercel 프로젝트 만들기

1. <https://vercel.com/new>에 로그인한다. GitHub 계정 연결 방식이 가장 간단하다.
2. 방금 만든 `homeshopping-rate-viewer` 저장소 옆의 **Import**를 누른다.
3. 프로젝트 설정을 아래처럼 확인한다.
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: 비워 둠(Next.js 기본값)
   - Node.js Version: `22.x`
4. Environment Variables에서 다음 값을 확인하거나 추가한다.
   - 이름: `PUBLIC_DEMO_MODE`
   - 값: `true`
   - 적용 범위: Production, Preview
5. `LOCAL_SYNTHETIC_MODE`는 만들지 않는다. 기존에 있다면 삭제한다.
6. **Deploy**를 누른다.
7. 빌드가 끝나면 `https://프로젝트명.vercel.app` 형태의 주소가 생성된다.

`vercel.json`에도 공개 모드와 보안 헤더가 선언되어 있으므로 기본 배포는 동일하게 동작한다.

## 2. 배포 후 확인

생성된 주소에서 다음을 확인한다.

1. 첫 화면에 `503 데이터 연결이 준비되지 않았습니다`가 아니라 요금표가 표시된다.
2. `전체`, `쇼핑엔티`, `KT알파쇼핑`, `CJ온스타일`, `영상 리스트` 탭이 열린다.
3. 홈쇼핑사를 `전체 홈쇼핑사`로 둔 채 요일만 선택해 세 회사 결과가 함께 나오는지 확인한다.
4. 영상 리스트에서 `베트남` → `다낭`을 선택했을 때 8개 영상이 표시되는지 확인한다.
5. 모바일 브라우저에서 표를 좌우 스크롤할 수 있고 필터와 로고가 겹치지 않는지 확인한다.
6. 아래 API를 직접 열어 상태를 확인한다.
   - `https://프로젝트명.vercel.app/api/rates?month=2026-10`
   - `https://프로젝트명.vercel.app/api/videos?month=2026-10`
7. API 응답 헤더 `Cache-Control`이 `private, no-store`인지 개발자 도구 Network 탭에서 확인한다.

## 3. 이후 수정본 배포

GitHub 연결 후에는 `main` 브랜치에 push할 때마다 Production이 자동 재배포된다.

```bash
cd 'C:/Users/pkg02/Desktop/Works/projects/홈쇼핑요금뷰어/app'
git add .
git commit -m 'Update rates or videos'
git push
```

다른 브랜치에 push하거나 Pull Request를 만들면 Preview URL이 생성된다. Preview에서 먼저 확인한 뒤 `main`에 병합한다.

## 4. 문제 해결

### 빌드가 `Synthetic bypass refused`로 실패

Vercel Settings → Environment Variables에서 `LOCAL_SYNTHETIC_MODE`를 삭제하고 Redeploy한다.

### 첫 화면에 503만 표시

`PUBLIC_DEMO_MODE=true`가 Production 또는 Preview 환경에 적용됐는지 확인하고, 환경 변수 변경 후 반드시 새로 Redeploy한다. 환경 변수 변경은 기존 배포에 소급 적용되지 않는다.

### GitHub 저장소가 Vercel에 안 보임

Vercel의 GitHub App 권한에서 해당 Private 저장소 접근을 허용한다.

### 요금·영상이 갱신되지 않음

현재 데이터는 코드에 포함된 정적 스냅샷이다. 새 PDF나 YouTube 업로드는 자동 반영되지 않는다. 데이터를 수정한 뒤 테스트하고 새 commit을 push해야 한다.

## 5. 공개 범위 변경

현재 배포는 애플리케이션 로그인이 없는 공개 사이트다. `noindex`는 보안 장치가 아니다. 회사 계정 전용으로 바꾸려면 Google Workspace 인증과 서버 측 권한 검사를 구현한 뒤 공개 모드를 제거해야 한다.

공식 참고 문서:

- Vercel Hobby: <https://vercel.com/docs/plans/hobby>
- 공정 사용 및 상업적 이용: <https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage>
- 환경 변수: <https://vercel.com/docs/projects/environment-variables>
- Next.js 배포: <https://vercel.com/docs/frameworks/full-stack/nextjs>
