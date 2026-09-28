# 스트리머 주루마블 작업 지침

- 공통 작업 정책과 Firebase 공유 규칙은 상위 `/Users/jaechanpark/Documents/GitHub/AGENTS.md`를 따른다.
- 이 저장소는 Firebase 프로젝트 `soop-stock-market`의 Cloud Functions codebase `jurumable`을 사용한다. 함수 전체 배포는 금지하고, 이번에 변경한 함수명을 명시한다.
- RTDB 규칙 파일을 이 저장소에 따로 만들지 않는다. 방 상태의 읽기·쓰기는 서버 함수에서 처리하고, OBS 읽기는 URL의 방별 키로 검증한다.
- 웹 앱은 번들러 없는 정적 페이지이며 GitHub Pages로 배포한다. 익명 인증은 진행자 세션 생성과 OBS 전용 앱 인증에 사용한다.
- 배포 전 JavaScript 문법과 Firebase 규칙 dry-run을 확인한다. 규칙 배포는 공유 사본이 모두 동일하고 안전한 작업 트리인지 먼저 확인한다.
