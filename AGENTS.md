# Admin UI Kit: AI가 읽는 진입점

이 저장소는 **재사용할 부품과 화면 패턴의 소스**다. 첫 화면은 가짜 데이터가 들어간 실행 예제일 뿐이다. 다른 프로젝트에 대시보드나 전체 저장소를 그대로 복제하지 않는다.

## 찾아서 가져가는 순서

1. [registry/index.json](registry/index.json)에서 필요한 항목 ID를 찾는다. `components`는 범용 부품, `blocks`는 여러 부품을 묶은 화면 패턴이다. `requiredFiles`, `example.call`, `hostBehavior`를 확인한다.
2. 스타일은 [레이아웃 명세](docs/design/LAYOUT-SPEC.md)에서 확인한다. 시안 좌표를 CSS로 복사하지 말고 여백·폰트·정렬 규칙만 적용한다. 화면 용어와 데이터는 대상 프로젝트가 우선이다.
3. 일반 HTML/JS면 실제로 쓰는 함수와 필요한 자산만 가져간다. 범용 부품은 공통 CSS 두 개와 JS 한 개를 공유한다. [최소 부품 예제](examples/starter.html)와 [블록 예제](examples/blocks-starter.html)는 카탈로그나 대시보드 런타임 없이 작동한다. React/Vue 등에서는 기존 UI 부품을 우선 사용하고 레이아웃·토큰·상태를 매핑한다.
4. `src/app.js`, `src/catalog.js`, `src/fixtures.js`, `src/kit.css`는 데모 전용이다. `demoDataOnly` 항목은 예시 모양만 참고한다. 회사 데이터, 인증, 권한, API, 승인 규칙은 바꾸거나 예제 저장소로 보내지 않는다.
5. 대상 화면 한 곳부터 검증한다. 기존 검색/정렬/필터/권한이 유지되는지, 로딩·실제 0건·오류가 구분되는지, 모바일/키보드/긴 문구에서 동작하는지 확인한다. 다른 화면과 배포는 별도 범위다.

[복사용 적용 지시문](docs/design/ADOPT-WITH-AI.md)
