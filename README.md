# Admin UI Kit

**v0.3:** 첫 화면을 영상 참고 운영 대시보드로 바꿨습니다. [영상 기준 레이아웃](docs/design/REFERENCE-LAYOUT.md) · [범용 컴포넌트](docs/design/COMPONENTS.md)

관리자 화면을 위한 라이브 컴포넌트 카탈로그와 대시보드 예제입니다. [공개 카탈로그 열기](https://edwin-space.github.io/admin-ui-kit/)

- **Foundations:** 색상, 여백, 서체 등 공통 토큰
- **Components:** 영상 참고 13개, 운영 화면 공통 확장 9개. 검색·출처 필터·미리보기·복사 가능한 코드
- **Blocks:** 운영 대시보드, 처리 대기열. 가짜 데이터 검색·필터와 로딩, 빈 화면, 오류, 연결 복구 예제

서버, 계정 연동, 외부 API가 필요하지 않습니다. 저장소를 내려받아 `index.html`을 열거나 [작은 시작 예제](examples/starter.html)를 참고하세요. 재사용 가능한 파일은 `src/tokens.css`, `src/components.css`, `src/components.js`입니다. [컴포넌트 사용법](docs/design/COMPONENTS.md) · [Claude·Codex 적용 가이드](docs/design/ADOPT-WITH-AI.md)

이 키트는 shadcn/ui의 **컴포넌트와 화면 예제를 분리하는 문서 구성**을 참고한 독립형 HTML/CSS/JavaScript 키트입니다. shadcn/ui 패키지나 커맨드 설치용 registry는 포함하지 않습니다. 화면과 업무 동작은 모두 예제이며 실제 데이터 접근, 인증, 권한은 사용 프로젝트에서 구현해야 합니다.

로컬 렌더링 로직 테스트: `node tests/render.test.cjs`. 브라우저 테스트는 테스트 환경에 Playwright와 Chromium을 설치한 뒤 `python tests/smoke.py`.
