# PLAY100

**PLAY100**은 설치와 로그인 없이 바로 즐기는 오리지널 브라우저 게임 100개 프로젝트입니다.

현재 첫 번째 게임 **GAME-001 Arrow Harbor**를 플레이할 수 있으며, 나머지 게임은 `catalog/games.json`과 `docs/GAME-CATALOG-100.md`에서 제작 순서를 관리합니다.

## Current milestone

- 포털: 100개 게임 마스터 인덱스
- GAME-001: Arrow Harbor
- 12개 고유 퍼즐 스테이지
- 터치·마우스·키보드 조작
- 동·은·금 메달과 최고 기록
- `localStorage` 기반 진행 저장
- 카탈로그·퍼즐 유일해 검증
- GitHub Actions CI와 Pages 배포 구조

## Repository structure

```text
Play100/
├─ apps/
│  └─ portal/                    # PLAY100 메인 포털
├─ catalog/
│  └─ games.json                 # GAME-001~100 메타데이터
├─ games/
│  └─ 001-arrow-harbor/          # 첫 번째 게임
├─ packages/
│  └─ game-sdk/                  # 저장·메달·분석·사운드 공통 모듈
├─ scripts/
│  ├─ build-all.mjs
│  ├─ validate-catalog.mjs
│  └─ validate-levels.mjs
└─ docs/
   └─ GAME-CATALOG-100.md
```

## Run

Vite 8.1은 Node.js 20.19+ 또는 22.12+가 필요합니다. 이 저장소는 Node.js 22 이상을 기준으로 합니다.

```bash
npm install
npm run check
npm run dev
```

Arrow Harbor만 실행:

```bash
npm run dev:game001
```

전체 정적 빌드:

```bash
npm run build
```

빌드 결과는 `dist/`에 생성됩니다.

## Engine strategy

- 퍼즐·단어·UI 중심 게임: TypeScript + Canvas/DOM
- 액션·물리·전략 게임: Phaser 4 계열을 게임별로 선택 도입
- 공통 진행·메달·분석: `@play100/game-sdk`
- 게임은 독립 빌드가 가능하며 포털에서 공통 진행도를 읽습니다.

## Roadmap

첫 검증 묶음:

1. GAME-001 Arrow Harbor — 논리 퍼즐
2. GAME-021 Orbit Courier — 물리 아케이드
3. GAME-041 Desk Garden — 코지 방치형
4. GAME-051 Traffic at Six — 운영 시뮬레이션
5. GAME-081 Keyboard Sumo — 로컬 2인용

100개 전체 목록은 [GAME-CATALOG-100.md](docs/GAME-CATALOG-100.md)를 참고하세요.
