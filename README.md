# Admin UI Kit

프로젝트마다 재사용할 수 있는 공개 관리자 UI 키트입니다. **회사 코드·데이터, 실제 API 또는 계정 연동은 없습니다.**

## 필요한 부품만 가져가기

**[공개 카탈로그](https://edwin-space.github.io/admin-ui-kit/#components)** · **[AI 적용 진입점](AGENTS.md)** · **[기계 판독용 소스 목록](registry/index.json)**

Claude/Codex에는 “이 저장소의 `AGENTS.md`와 `registry/index.json`을 읽고, 필요한 부품 ID를 찾아 기존 화면에 적용해”라고 전달하면 됩니다. 소스 목록에는 범용 부품 22개, 개별 블록과 차트 패턴 6개 각각의 필수 파일, 실제 호출 예, 호스트가 연결할 동작이 들어 있습니다. 카탈로그의 **사용 코드 → AI 지시문 복사**에서 부품 하나를 지정할 수 있습니다.

대시보드는 부품을 조합한 미리보기입니다. [최소 부품 예제](examples/starter.html)와 [독립 블록 예제](examples/blocks-starter.html)는 카탈로그·대시보드 런타임 없이 필요한 자산만 사용합니다. 차트 패턴 중 `demoDataOnly`가 표시된 항목은 레이아웃만 참고합니다.

## 열어보기

이 저장소에서 **Code → Download ZIP**으로 내려받아 압축을 푼 다음, **`index.html`을 Chrome이나 Edge에서 엽니다.** 서버, Node.js, npm 설치는 필요 없습니다. 사내 브라우저 정책이 `file://`을 막으면 Python이 있는 환경에서 저장소 루트에서 `python -m http.server 8000 --bind 127.0.0.1`을 실행하고 `http://localhost:8000`으로 엽니다.

| 보기 | 목적 |
|---|---|
| 시작하기 | 키트가 제공하는 규칙·부품·화면 예제의 개요 |
| 컴포넌트 | [22개 부품](docs/design/COMPONENTS.md)의 미리보기와 복사 가능한 사용 코드. 영상 참고 13개와 공통 확장 9개를 검색·필터로 구분 |
| 화면 예제 | 대시보드·대기열, 검색·상태 필터·가짜 검토 동작, 기본·로딩·빈 화면·조회 오류·연결 끊김 및 복구 시나리오 |
| [작은 시작 예제](examples/starter.html) | 전체 카탈로그 없이 요약과 표만 사용하는 별도 HTML 파일. 다운로드한 폴더에서 열기 |

예제 동작은 브라우저 메모리 안에만 적용되며 새로고침으로 초기화됩니다. 오프라인 시나리오는 실제 네트워크 변경이 아닌 모의 동작입니다. 공개 사이트는 예제 전용이며 실서비스와 연결되지 않습니다.

## 다른 프로젝트에 가져가기

1. [디자인 가이드](docs/design/LAYOUT-SPEC.md)에서 화면과 상태 규칙을 확인합니다. 예제의 실제 수치는 `src/tokens.css`와 구현이 우선이며, 시안 좌표와 실제 웹 권장값을 구분합니다.
2. **HTML/JS 프로젝트:** `src/tokens.css`, `src/components.css`, `src/components.js`만 복사하고 컨테이너에 `.ak`를 지정합니다. [작은 시작 예제](examples/starter.html)의 경로와 데이터 모양을 참고합니다. CSS를 직접 적용하기 불편한 프로젝트에는 기존 UI 라이브러리로 같은 역할과 상태를 다시 매핑합니다.
3. **React/Vue 등:** 기존 기능·접근성·폼 검증은 보존하고, 토큰과 배치 및 상태 규칙을 해당 앱의 컴포넌트에 적용합니다. 예제의 문서 전역이나 HTML 렌더러를 그대로 붙일 필요는 없습니다.
4. `src/fixtures.js`와 미리보기 앱은 복사용 실데이터나 운영 API가 아닙니다. 새 프로젝트에 가져갈 때 실제 데이터 공급, 서버 권한, 오류/재시도 동작은 프로젝트가 구현합니다.
5. [AI 적용 프롬프트](docs/design/ADOPT-WITH-AI.md)로 실제 화면 한 곳에서 먼저 적용하고 비교합니다.

**shadcn/ui에서 참고한 점:** Foundations → Components → Blocks로 나누고 미리보기 옆에 사용 코드를 둡니다. 이 키트는 프레임워크에 의존하지 않는 독립형 예제로, shadcn/ui 패키지나 설치용 registry는 포함하지 않습니다. [공식 컴포넌트](https://ui.shadcn.com/docs/components) · [공식 Blocks](https://ui.shadcn.com/blocks)

개발 검수: 브라우저 없이 `node tests/render.test.cjs`로 구성 부품과 상태 처리 로직을 확인할 수 있습니다. 레지스트리의 예제를 독립적으로 실행하려면 `node tests/registry.test.cjs`를 사용합니다. JS 구문은 `node --check src/app.js` 등으로 확인합니다. 브라우저 검수는 테스트 환경에서만 Playwright와 Chromium을 설치한 뒤 `python tests/smoke.py`로 실행합니다. 설치된 Chromium 경로는 선택적으로 `CHROMIUM_PATH`로 지정합니다.
