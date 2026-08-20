import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve(process.argv[2] || 'dist-v2/v2/catalog.js');
const source = readFileSync(target, 'utf8').trim();
const prefix = 'window.PLAY100_CATALOG=';
if (!source.startsWith(prefix)) throw new Error('Invalid PLAY100 catalog format');
const json = source.slice(prefix.length).replace(/;\s*$/, '');
const games = JSON.parse(json);

const categoryExtras = {
  Logic: ['사건 번호표','현장 시계','확인 도장','모순 경고등','기록 보관함','작업 순서표','진행 표시등','완료 보고서'],
  Spatial: ['축척 자','접이식 도면','위치 표식','회전 핀','빈칸 트레이','배치 확인판','공간 경계선','완료 스탬프'],
  Arcade: ['속도 계기판','충돌 경고등','연속 획득 링','위험 구역 표지','부스트 게이지','기록 전광판','체크포인트 깃발','재도전 토큰'],
  Word: ['글자 서랍','발음 표지','낱말 기록지','정답 종','연속 정답 도장','힌트 사전','시간 모래시계','문장 조립대'],
  Cozy: ['따뜻한 작업등','수집 도감','단골 기록장','작은 진열대','오늘의 주문표','성장 화분','휴식 의자','마감 일지'],
  Management: ['운영 현황판','자원 상자','대기 번호표','근무 보고서','수요 그래프','인력 배치표','경보 램프','마감 도장'],
  Strategy: ['전략 지도','행동 카드','자원 토큰','턴 표시기','방어선 표식','정찰 보고서','상대 의도 카드','승리 깃발'],
  Cards: ['전술 카드 덱','에너지 보석','턴 카운터','상태 토큰','강화 슬롯','상대 패턴표','보상 상자','승리 문장'],
  Party: ['왼쪽 선수 표식','오른쪽 선수 표식','라운드 종','승리 점수판','반칙 경고등','관중 깃발','즉시 재시작 버튼','챔피언 메달'],
  Story: ['선택 카드','상태 게이지','장면 기록지','결말 봉투','관계 표식','시간 시계','사건 지도','다음 장면 열쇠']
};

const modeMap = new Map([
  [11,'fold'],[12,'knot'],[13,'parking'],[16,'spatial'],[18,'packing'],
  [21,'orbit'],[22,'arcade'],[23,'gravity'],[24,'steering'],[25,'ricochet'],
  [26,'altitude'],[27,'pendulum'],[28,'polarity'],[29,'ice'],[30,'rhythm'],
  [31,'hangul'],[32,'missing'],[33,'emoji'],[34,'typing'],[35,'word'],[36,'deduction'],
  [37,'syllable'],[38,'sentence'],[39,'sprint'],[40,'deduction'],
  [92,'management'],[93,'deduction'],[94,'deduction'],[96,'debug'],[97,'management'],
  [98,'word'],[99,'memory'],[100,'meta']
]);

const roles = {
  fold:'지도 접기 설계자', knot:'항만 매듭 정비사', parking:'옥상 주차 관제사', packing:'화물 적재 설계자',
  orbit:'궤도 배송 조종사', gravity:'중력 세탁실 기사', steering:'급류 종이배 조타수', ricochet:'네온 반사 사수',
  altitude:'열기구 택시 조종사', pendulum:'야간 진자 도둑', polarity:'자기장 러너', ice:'빙상 화물 기사',
  hangul:'한글 릴레이 선수', missing:'간판 복원 기사', emoji:'이모지 사전 편집자', typing:'타이핑 탈출자',
  syllable:'음절 공장 조립공', sentence:'문장 수리 기사', sprint:'낱말 스프린터', debug:'디버그 던전 탐험가',
  meta:'백 번째 문의 수문장'
};

const verbs = {
  fold:['접는 방향 선택','겹친 표식 확인','최종 지도 완성'],
  knot:['교차선 관찰','매듭 위치 교환','밧줄 교차 제거'],
  parking:['차량 선택','빈 공간으로 이동','출구 경로 확보'],
  packing:['조각 회전','빈칸 선택','화물칸 완성'],
  orbit:['발사각 조절','추진력 결정','궤도 정거장 접안'],
  gravity:['중력 반전','양말 수집','세탁실 장애물 회피'],
  steering:['좌우 조타','급류 회피','부표 통과'],
  ricochet:['발사각 조절','반사 경로 예측','네온 표적 명중'],
  altitude:['고도 상승','승객 승차','착륙장 접근'],
  pendulum:['갈고리 연결','진자 이동','보석 회수'],
  polarity:['자기 극성 전환','금속 장애물 밀기','결승선 통과'],
  ice:['이동 방향 선택','벽까지 미끄러지기','화물 도착'],
  hangul:['끝 음절 확인','다음 단어 선택','연속 기록 유지'],
  missing:['빈 글자 확인','글자 조각 선택','간판 복구'],
  emoji:['그림 단서 해석','표현 비교','사전 항목 확정'],
  typing:['문장 읽기','정확히 입력','추격 거리 벌리기'],
  syllable:['초성 선택','중성·종성 결합','목표 단어 생산'],
  sentence:['문장 부품 선택','순서 조립','수리 검사'],
  sprint:['범주 확인','단어 빠르게 입력','중복 없이 기록'],
  debug:['오류 줄 조사','수정안 선택','던전 문 해제'],
  meta:['메달 기록 확인','문양 조합','백 번째 문 개방']
};

const modeObjects = {
  fold:['접는 선','지도 모서리','목표 도장','겹침 창'], knot:['계류 밧줄','부두 고리','교차 경고','매듭 번호'],
  parking:['배달 밴','소형차','출구 차단봉','주차 칸'], packing:['화물 조각','적재 격자','회전 손잡이','공간 측정기'],
  orbit:['행성 중력장','배송 캡슐','궤도 정거장','추진력 다이얼'], gravity:['중력 스위치','양말 묶음','천장 레일','세탁 바구니'],
  steering:['종이배','급류 바위','물살 화살표','항로 부표'], ricochet:['네온 광선','반사 벽','표적 코어','발사 조준기'],
  altitude:['열기구','승객 승강장','고도계','바람 깃발'], pendulum:['진자 갈고리','가로등 앵커','보석 진열창','경비 탐조등'],
  polarity:['플러스 자석','마이너스 자석','금속 장벽','극성 스위치'], ice:['빙판 화물','정지 벽','목적지 창고','방향 패널'],
  hangul:['끝 음절 카드','단어 사슬','연속 기록판','금지 단어 표지'], missing:['빠진 글자 홈','간판 글자 조각','상점 힌트','복원 도장'],
  emoji:['이모지 조합','표현 카드','감정 사전','연상 힌트'], typing:['도주 거리계','입력 문장','추격 그림자','정확도 표시'],
  syllable:['초성 블록','중성 톱니','종성 도장','완성 단어 상자'], sentence:['주어 부품','서술어 부품','조사 나사','문장 검사대'],
  sprint:['범주 깃발','입력 레인','중복 경고','기록 타이머'], debug:['코드 두루마리','오류 벌레','수정 패치','던전 문'],
  meta:['99개 메달 벽','황금 문','세 개의 문양','최종 열쇠']
};

for (const game of games) {
  if (game.custom) continue;
  const specificMode = modeMap.get(game.id);
  if (specificMode) {
    game.mode = specificMode;
    game.role = roles[specificMode] || game.role;
    game.verbs = verbs[specificMode] || game.verbs;
  }

  const extras = [
    ...(modeObjects[game.mode] || []),
    ...(categoryExtras[game.category] || categoryExtras.Story)
  ];
  const cleaned = (game.objects || []).filter((item) => !/ 전용 소재 \d+$/.test(item));
  for (const item of extras) if (!cleaned.includes(item)) cleaned.push(item);
  game.objects = cleaned.slice(0, 12);
  game.environments = [
    `${game.objects[0]}과 ${game.objects[1]}이 등장하는 입문 구역`,
    `${game.objects[2]} 위험이 추가되는 이동 구역`,
    `${game.objects[3]}과 야간 조명이 겹치는 최종 구역`
  ];
}

writeFileSync(target, `${prefix}${JSON.stringify(games)};\n`);
console.log(`enhanced ${games.filter((game) => !game.custom).length} PLAY100 game definitions`);
