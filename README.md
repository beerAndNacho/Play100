# PLAY100

**PLAY100**은 설치와 로그인 없이 바로 즐기는 오리지널 브라우저 게임 100개 프로젝트입니다.

현재 다음 두 게임을 플레이할 수 있습니다.

1. **GAME-001 Arrow Harbor** — 신호 부표를 돌려 화물선을 입항시키는 항구 관제 퍼즐
2. **GAME-002 Harbor Lost & Found** — 항구의 다섯 장면에서 분실물을 찾는 숨은그림찾기

나머지 게임은 `catalog/games.json`, `catalog/overrides.json`, `docs/GAME-CATALOG-100.md`에서 제작 순서를 관리합니다.

## Current milestone

- 포털: 100개 게임 마스터 인덱스
- GAME-001: Arrow Harbor, 12개 고유 퍼즐 스테이지
- GAME-002: Harbor Lost & Found, 5개 환경과 무작위 수색 목록
- 터치·마우스·키보드 조작
- 동·은·금 메달과 최고 기록
- `localStorage` 기반 진행 저장
- 카탈로그·퍼즐·TypeScript 검증
- GitHub Actions CI와 Pages 배포 구조

## Repository structure

```text
Play100/
├─ apps/
│  └─ portal/                       # PLAY100 메인 포털
├─ catalog/
│  ├─ games.json                    # GAME-001~100 기본 메타데이터
│  └─ overrides.json                # 구현 순서에 따른 카탈로그 변경
├─ games/
│  ├─ 001-arrow-harbor/             # 항구 관제 논리 퍼즐
│  └─ 002-harbor-lost-found/        # 숨은그림찾기
├─ packages/
│  └─ game-sdk/                     # 저장·메달·분석·사운드 공통 모듈
├─ scripts/
│  ├─ build-all.mjs
│  ├─ validate-catalog.mjs
│  └─ validate-levels.mjs
└─ docs/
   ├─ GAME-CATALOG-100.md
   └─ GAME-DESIGN-RULES.md
```

## Run

Vite 8은 Node.js 20.19+ 또는 22.12+가 필요합니다. 이 저장소는 Node.js 22 이상을 기준으로 합니다.

```bash
npm install
npm run check
npm run dev
```

개별 게임 실행:

```bash
npm run dev:game001
npm run dev:game002
```

전체 정적 빌드:

```bash
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## Game design direction

- 첫 조작은 10초 안에 이해할 수 있게 만듭니다.
- 제목과 실제 소재·환경·실패·성공 연출을 일치시킵니다.
- 한 판은 2~6분을 기본으로 하되 다시 할 이유를 제공합니다.
- 기능 수보다 장면 반응, 타격감, 소리, 움직임을 먼저 개선합니다.
- 같은 게임의 색상 변경판을 별도 게임으로 계산하지 않습니다.

상세 기준은 [GAME-DESIGN-RULES.md](docs/GAME-DESIGN-RULES.md)를 참고하세요.

## Engine strategy

- 퍼즐·단어·UI 중심 게임: TypeScript + Canvas/DOM/SVG
- 액션·물리·전략 게임: Phaser 4 계열을 게임별로 선택 도입
- 공통 진행·메달·분석: `@play100/game-sdk`
- 게임은 독립 빌드가 가능하며 포털에서 공통 진행도를 읽습니다.

## Next validation games

1. GAME-003 Lightkeeper — 거울과 등대 빛 퍼즐
2. GAME-021 Orbit Courier — 물리 아케이드
3. GAME-041 Desk Garden — 코지 방치형
4. GAME-051 Traffic at Six — 운영 시뮬레이션
5. GAME-081 Keyboard Sumo — 로컬 2인용

100개 전체 목록은 [GAME-CATALOG-100.md](docs/GAME-CATALOG-100.md)를 참고하세요.
