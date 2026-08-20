import json
from pathlib import Path

families = {
    'spatial': {
        'category':'Spatial', 'accent':'#ef6b3a','bg':'#111b25',
        'role':'공간 퍼즐 설계자',
        'defaults':['측량 격자','작업 도면','회전 손잡이','승인 도장','단계 기록표'],
        'envs':['새벽 작업실','비 내리는 야간 작업장','햇빛 드는 전시실'],
        'feedback':['선택 강조','오브젝트 이동','잘못된 배치 흔들림','성공 조명','점수 변화','효과음','환경 전환']
    },
    'arcade': {
        'category':'Arcade','accent':'#48d2e8','bg':'#081629','role':'현장 조종사',
        'defaults':['속도 계기','위험 경보','목표 표식','콤보 표시','최고 기록판'],
        'envs':['맑은 낮','폭풍 전야','네온 야간'],
        'feedback':['관성 이동','충돌 파티클','카메라 흔들림','콤보 상승','성공 폭발','효과음','속도 변화']
    },
    'word': {
        'category':'Word','accent':'#f4c34f','bg':'#211a24','role':'언어 해결사',
        'defaults':['문자 카드','제한 시간계','정답 도장','연속 정답판','오늘의 기록지'],
        'envs':['아침 편집실','도심 전광판 거리','심야 라디오 부스'],
        'feedback':['글자 선택 강조','정답 도장','오답 흔들림','연속 정답 콤보','시간 경보','효과음','결과 공유판']
    },
    'cozy': {
        'category':'Cozy','accent':'#8dd7a8','bg':'#17251f','role':'작은 공간의 주인',
        'defaults':['성장 일지','단골 도감','꾸미기 선반','오늘의 주문','작은 수집함'],
        'envs':['포근한 아침','비 오는 오후','별빛 깊은 밤'],
        'feedback':['성장 애니메이션','수집 반짝임','상태 변화','단골 반응','환경음','완료 연출','도감 기록']
    },
    'management': {
        'category':'Management','accent':'#ff8c42','bg':'#17202a','role':'현장 운영 관리자',
        'defaults':['상황 보드','인력 토큰','자원 계기','대기열','근무 보고서'],
        'envs':['평온한 첫 근무','혼잡한 피크 시간','비상 상황 야간'],
        'feedback':['대기열 이동','자원 증감','경보 점멸','연속 처리 콤보','고객 반응','효과음','교대 보고서']
    },
    'strategy': {
        'category':'Strategy','accent':'#df596d','bg':'#20171e','role':'전략 지휘관',
        'defaults':['전술 격자','자원 토큰','위험 파동','라운드 기록','승리 깃발'],
        'envs':['첫 번째 방어선','안개 낀 중반 전장','붉은 최종 공세'],
        'feedback':['유닛 배치','공격 파티클','피해 숫자','자원 변화','턴 전환','승리 연출','효과음']
    },
    'deck': {
        'category':'Turn / Deck','accent':'#a98cff','bg':'#19172a','role':'턴제 모험가',
        'defaults':['선택 카드 세 장','체력 계기','위험 주사위','유물 슬롯','여정 지도'],
        'envs':['안전한 출발지','위험한 중간 구역','보스가 기다리는 밤'],
        'feedback':['카드 뒤집기','자원 증감','피해 흔들림','연계 콤보','유물 발광','턴 효과음','승리 보고서']
    },
    'party': {
        'category':'Local Party','accent':'#50e3a4','bg':'#101c25','role':'두 명의 경쟁자',
        'defaults':['왼쪽 조작 패널','오른쪽 조작 패널','라운드 종','점수 깃발','재대결 버튼'],
        'envs':['연습 경기장','관중 가득한 본선','네온 결승 무대'],
        'feedback':['두 선수 이동','충돌 반동','점수 폭발','라운드 카운트','관중 반응','효과음','승리 세리머니']
    },
    'story': {
        'category':'Story / Learning','accent':'#f08f73','bg':'#1f1b22','role':'이야기의 결정자',
        'defaults':['선택 기록지','관계 계기','시간 표시','사건 지도','결말 카드'],
        'envs':['평범한 시작','갈등이 깊어진 중반','결정이 남는 마지막 장면'],
        'feedback':['선택 카드 이동','상태 계기 변화','대사 전환','위험 경보','기억 기록','효과음','결말 연출']
    }
}

rows = [
(11,'011-fold-the-map','Fold the Map','spatial','fold','종이를 접어 목표 도형과 표시가 한 점에 겹치게 만듭니다.','접이식 관광지도,산맥 주름선,도시 스탬프,강줄기 인쇄','산악 기차 지도실'),
(12,'012-knot-harbor','Knot Harbor','spatial','untangle','서로 얽힌 부두 밧줄의 매듭을 끌어 교차 없이 풉니다.','계류 밧줄,부두 말뚝,도르래,어선 닻','바람 센 어선 부두'),
(13,'013-parking-rooftop','Parking Rooftop','spatial','parking','옥상 주차장의 차량을 밀어 빨간 배달차의 출구를 엽니다.','빨간 배달차,주차 차단봉,옥상 환풍기,방향 화살표','석양의 도심 옥상'),
(14,'014-shadow-cabinet','Shadow Cabinet','spatial','shadow','진열품을 회전해 벽에 비친 목표 실루엣과 맞춥니다.','회전 진열대,골동품 조각상,투사 조명,그림자 스크린','문 닫은 박물관 수장고'),
(15,'015-number-vault','Number Vault','spatial','vault','제한된 비교 단서로 금고의 세 자리 암호를 추론합니다.','황동 번호판,회전 다이얼,보석 서랍,보안 기록지','지하 은행 금고실'),
(16,'016-tile-museum','Tile Museum','spatial','slide','밀기 타일을 움직여 훼손된 박물관 벽화를 복원합니다.','유리 보존틀,벽화 조각,복원 붓,작품 번호표','공사 중인 고대미술관'),
(17,'017-magnet-boxes','Magnet Boxes','spatial','magnet','자석의 극성을 바꿔 금속 상자를 목표 선반으로 이동합니다.','적색 자석,청색 자석,강철 상자,자기장 표시기','실험용 자기 창고'),
(18,'018-shape-packing','Shape Packing','spatial','packing','회전 가능한 화물 조각을 빈 공간 없이 수하물 상자에 넣습니다.','여행 가방,테트로미노 화물,깨짐주의 스티커,수하물 저울','공항 수하물 포장대'),
(19,'019-conveyor-colors','Conveyor Colors','spatial','conveyor','컨베이어의 게이트를 바꿔 제품을 색상별 출고 라인으로 보냅니다.','색상 제품 상자,분기 게이트,바코드 스캐너,출고 팔레트','자동화 도색 공장'),
(20,'020-signal-tower','Signal Tower','spatial','signal','제한된 신호탑을 배치해 산악 마을의 모든 지점을 연결합니다.','무선 신호탑,산악 오두막,전파 반경,중계 안테나','눈 덮인 산악 통신망'),
(21,'021-orbit-courier','Orbit Courier','arcade','orbit','행성 중력을 이용해 우주 소포를 목표 정거장으로 발사합니다.','소포 캡슐,소행성,중력 궤도,우주 정거장','푸른 행성 저궤도'),
(22,'022-rooftop-pigeon','Rooftop Pigeon','arcade','pigeon','점프와 활공으로 옥상 사이의 편지와 빵조각을 수집합니다.','도시 비둘기,빨랫줄,굴뚝,편지 봉투','비 갠 오래된 지붕'),
(23,'023-gravity-laundry','Gravity Laundry','arcade','gravity','중력을 뒤집어 우주 세탁실의 양말을 모두 수집합니다.','떠다니는 양말,세탁 드럼,중력 스위치,세제 캡슐','무중력 궤도 세탁실'),
(24,'024-paper-boat-rapids','Paper Boat Rapids','arcade','boat','좌우 조작으로 종이배를 급류와 빗물 배수구 사이로 이끕니다.','종이배,빗방울,나뭇잎 급류,배수구 소용돌이','폭우 뒤 골목 수로'),
(25,'025-neon-ricochet','Neon Ricochet','arcade','ricochet','발사 각도를 정해 네온 공을 벽에 튕기며 모든 표적을 맞힙니다.','네온 구슬,반사 벽,빛 표적,각도 조준선','자정의 네온 경기장'),
(26,'026-balloon-taxi','Balloon Taxi','arcade','balloon','열기구의 고도를 조절해 구름 도시의 승객을 안전하게 운송합니다.','열기구 택시,구름 정류장,바람 깃발,승객 바구니','노을 진 구름 도시'),
(27,'027-pendulum-thief','Pendulum Thief','arcade','pendulum','가로등과 크레인 사이를 진자처럼 이동해 보석을 훔치고 탈출합니다.','갈고리 줄,가로등,박물관 보석,경비 탐조등','안개 낀 항구 야간'),
(28,'028-magnet-runner','Magnet Runner','arcade','magnet_runner','극성을 바꿔 천장과 바닥 레일 사이를 달리며 장애물을 피합니다.','자석 부츠,금속 레일,극성 게이트,전기 장벽','고속 자기부상 터널'),
(29,'029-ice-parcel','Ice Parcel','arcade','ice','멈출 수 없는 얼음 소포를 벽과 완충재를 이용해 목적지로 보냅니다.','얼음 소포,냉동 창고,고무 완충재,배송 도장','서리 낀 북극 물류창고'),
(30,'030-beat-bounce','Beat Bounce','arcade','beat','박자에 맞춰 공을 튕겨 빛나는 발판과 음표를 이어갑니다.','리듬 공,빛 발판,박자 링,음표 조각','네온 지하 공연장'),
(31,'031-hangul-relay','한글 릴레이','word','relay','앞 단어의 마지막 음절로 시작하는 새 단어를 빠르게 고릅니다.','한글 음절 카드,릴레이 바통,단어 사전,연속 정답 불빛','방송국 한글 퀴즈 스튜디오'),
(32,'032-missing-signboard','사라진 간판','word','missing','빠진 글자를 채워 골목의 낡은 간판 이름을 복원합니다.','낡은 상점 간판,빠진 글자판,전구 테두리,골목 지도','비 오는 복고 상점가'),
(33,'033-emoji-dictionary','이모지 연상 사전','word','emoji','이모지 조합이 뜻하는 단어와 관용 표현을 추측합니다.','이모지 카드,연상 사전,표현 스티커,힌트 돋보기','알록달록 디지털 도서관'),
(34,'034-typing-escape','Typing Escape','word','typing','문장을 정확히 입력해 추격자와 닫히는 문보다 먼저 탈출합니다.','타자기 키,추격 그림자,보안문,탈출 문장','경보 울리는 기록 보관소'),
(35,'035-reverse-dictionary','Reverse Dictionary','word','reverse','설명만 읽고 사전에 숨어 있는 정확한 단어를 찾습니다.','정의 카드,두꺼운 사전,색인 탭,정답 책갈피','밤의 사전 편집실'),
(36,'036-four-clue-place','네 단서 한 장소','word','place','네 가지 단서가 공통으로 가리키는 장소를 맞힙니다.','장소 엽서,나침반,교통표,네 장의 단서 카드','세계 여행 안내소'),
(37,'037-syllable-factory','음절 공장','word','syllable','초성·중성·종성을 조립해 주문서의 목표 단어를 생산합니다.','초성 톱니,중성 벨트,종성 프레스,완성 단어 상자','한글 음절 조립 공장'),
(38,'038-sentence-repair','문장 수리점','word','sentence','순서가 뒤섞인 단어 부품을 올바른 문장으로 조립합니다.','문장 부품,문법 렌치,마침표 볼트,수리 주문서','문장 기계 수리점'),
(39,'039-category-sprint','Category Sprint','word','sprint','제한 시간 안에 같은 범주의 단어를 연속으로 입력합니다.','범주 출발선,단어 러닝 트랙,타이머 깃발,연속 기록판','단어 육상 경기장'),
(40,'040-daily-riddle','오늘의 수수께끼','word','riddle','하루 한 개의 짧은 수수께끼를 풀고 결과를 공유합니다.','봉인된 수수께끼,오늘 날짜 인장,답안 카드,공유 격자','새벽 신문 수수께끼 코너'),
(41,'041-desk-garden','Desk Garden','cozy','water','책상 위 화분에 물을 주고 가지를 다듬어 작은 정원을 성장시킵니다.','책상 화분,물뿌리개,새싹,업무 타이머','햇살 드는 창가 책상'),
(42,'042-tiny-aquarium','Tiny Aquarium','cozy','aquarium','먹이와 수질을 관리해 작은 물고기와 수초 도감을 채웁니다.','유리 수조,작은 물고기,수초,공기 방울','푸른 조명의 방 한켠'),
(43,'043-moon-bakery','Moon Bakery','cozy','bakery','달빛 재료를 섞고 구워 밤손님에게 빵을 판매합니다.','초승달 반죽,별설탕,작은 화덕,야간 주문표','달빛 골목의 빵집'),
(44,'044-cloud-sheep-ranch','Cloud Sheep Ranch','cozy','ranch','구름 양을 먹이고 빗어 날씨 털을 수확합니다.','구름 양,무지개 빗,날씨 목초,비구름 울타리','하늘 위 목장'),
(45,'045-night-bookshop','Night Bookshop','cozy','bookshop','밤손님의 기분에 맞는 책을 추천해 단골 책방을 만듭니다.','낡은 책장,손님 취향표,달빛 스탠드,추천 쪽지','자정의 골목 책방'),
(46,'046-firefly-terrarium','Firefly Terrarium','cozy','terrarium','반딧불을 모아 유리 정원의 빛과 습도를 조절합니다.','유리 테라리움,반딧불,이끼 바닥,작은 분무기','여름밤 숲속 작업실'),
(47,'047-island-post-office','Island Post Office','cozy','post','섬 주민의 편지를 분류하고 배에 실어 정확한 섬으로 보냅니다.','빨간 우체통,섬 편지,작은 우편선,파도 우표','바람 부는 군도 우체국'),
(48,'048-mini-museum','Mini Museum','cozy','museum','작은 유물을 수집하고 전시 동선을 꾸며 방문객 만족을 높입니다.','미니 유물,전시 받침대,관람 화살표,기념품 표','작은 개인 박물관'),
(49,'049-tea-cart','Tea Cart','cozy','tea','찻잎과 향 재료를 섞어 손님 취향에 맞는 차를 우립니다.','이동식 찻수레,찻잎 통,도자기 찻잔,향 조합표','비 오는 공원 찻수레'),
(50,'050-pocket-observatory','Pocket Observatory','cozy','stars','망원경을 정렬해 별과 행성을 발견하고 밤하늘 도감을 완성합니다.','주머니 망원경,별자리 판,행성 렌즈,관측 도감','옥상 소형 관측소'),
(51,'051-traffic-at-six','Traffic at Six','management','traffic','퇴근 시간 신호등과 차선을 조절해 교차로 정체를 해소합니다.','교차로 신호등,버스 차선,차량 대기열,사고 경보','비 내리는 도심 퇴근길'),
(52,'052-harbor-dispatcher','Harbor Dispatcher','management','harbor','선박·부두·크레인의 시간을 배정해 항만 충돌과 지연을 줄입니다.','화물선,부두 번호,컨테이너 크레인,입항 시간표','혼잡한 산업 항만'),
(53,'053-food-truck-rush','Food Truck Rush','management','foodtruck','한정된 재료와 조리대를 이용해 축제 주문을 빠르게 처리합니다.','푸드트럭,주문 티켓,그릴,재료 통','저녁 거리 축제'),
(54,'054-tiny-hotel','Tiny Hotel','management','hotel','객실 배치·청소·체크인을 조정해 작은 호텔을 운영합니다.','객실 열쇠,예약 장부,청소 카트,프런트 벨','눈 오는 산장 호텔'),
(55,'055-power-grid-night','Power Grid Night','management','power','제한된 발전량을 병원·주택·공장에 배분해 야간 도시를 지킵니다.','발전소 계기,송전선,병원 전력,도시 불빛','폭풍 속 야간 전력망'),
(56,'056-festival-queue','Festival Queue','management','festival','입장 게이트와 직원을 배치해 축제 대기열의 불만을 줄입니다.','축제 손목띠,입장 게이트,안내 직원,대기 줄','여름 음악 축제장'),
(57,'057-weather-station','Weather Station','management','weather','관측 자료를 읽어 경보·항공·농업 일정의 우선순위를 정합니다.','기압계,레이더 화면,풍향계,경보 방송','산 정상 기상 관측소'),
(58,'058-recycling-plant','Recycling Plant','management','recycle','컨베이어 속도와 작업자를 배치해 폐기물을 올바르게 분류합니다.','재활용 벨트,금속 자석,유리 통,압축기','도시 자원 순환 센터'),
(59,'059-newsroom-deadline','Newsroom Deadline','management','news','기자·편집자·지면을 배정해 마감 전에 중요한 기사를 발행합니다.','기사 원고,편집 데스크,속보 전광판,인쇄 마감시계','심야 신문 편집국'),
(60,'060-airport-gate-manager','Airport Gate Manager','management','airport','항공편과 게이트를 배정해 연결편 충돌과 승객 지연을 막습니다.','항공편 보드,탑승 게이트,견인차,연결 승객','안개 낀 국제공항'),
(61,'061-castle-garden-defense','Castle Garden Defense','strategy','garden_defense','식물 수호자를 배치해 정원 길로 들어오는 해충을 막습니다.','장미 궁수,버섯 방패,달팽이 적,성 정원문','노을 진 성곽 정원'),
(62,'062-dungeon-shopkeeper','Dungeon Shopkeeper','strategy','shopkeeper','모험가의 직업과 다음 방을 읽고 맞는 장비를 판매합니다.','검과 방패,마법 물약,모험가 카드,던전 지도','지하 던전 입구 상점'),
(63,'063-space-colony-seven','Space Colony Seven','strategy','colony','7일 동안 산소·식량·전력을 배분해 우주 식민지를 생존시킵니다.','산소 탱크,수경 농장,태양 전지,거주 모듈','붉은 행성 식민지'),
(64,'064-train-timetable','Train Timetable','strategy','timetable','제한된 선로에 열차 시간을 배치해 교차역 충돌을 방지합니다.','열차 카드,단선 철로,교차역,시간표 핀','눈 내리는 산악 철도'),
(65,'065-town-waterworks','Town Waterworks','strategy','waterworks','펌프와 저수조를 배치해 도시 구역에 안정적으로 물을 공급합니다.','저수탑,펌프장,수도관,도시 블록','여름 가뭄의 소도시'),
(66,'066-forest-ranger','Forest Ranger','strategy','ranger','산불·야생동물·관광객 동선을 관리해 숲의 균형을 지킵니다.','감시탑,산불 경계선,야생동물 길,등산객 표지','건조한 국립공원'),
(67,'067-five-minute-kingdom','Five-Minute Kingdom','strategy','kingdom','5분 동안 농장·시장·성벽을 세워 작은 왕국을 성장시킵니다.','왕관 자원,농장 타일,시장,성벽','아침 안개 평원 왕국'),
(68,'068-cargo-port','Cargo Port','strategy','cargo','창고·크레인·선박 동선을 배치해 화물 처리량을 높입니다.','항만 창고,갠트리 크레인,화물 트럭,선박 슬롯','새벽 컨테이너 부두'),
(69,'069-restaurant-shift','Restaurant Shift','strategy','restaurant','직원의 역할과 테이블 순서를 정해 저녁 영업을 버텨냅니다.','테이블 번호,주방 주문,서버 토큰,대기 손님','금요일 저녁 레스토랑'),
(70,'070-island-rescue-planner','Island Rescue Planner','strategy','rescue','구조선·헬기·의료팀의 순서를 정해 섬의 재난 신고를 해결합니다.','구조 헬기,구명정,의료 키트,폭풍 지도','태풍 지난 군도'),
(71,'071-three-card-knight','Three-Card Knight','deck','knight','매 턴 세 장 중 한 장을 골라 기사로서 성문까지 전진합니다.','검 카드,방패 카드,말 카드,성문 보스','비 내리는 중세 성도'),
(72,'072-dice-alchemist','Dice Alchemist','deck','alchemist','주사위 눈과 재료 카드를 조합해 주문된 포션을 완성합니다.','연금술 주사위,약초,수정 병,가마솥','연기 자욱한 연금술실'),
(73,'073-hex-garden-war','Hex Garden War','deck','hex','육각 정원에 씨앗 카드를 놓아 영토와 햇빛을 확보합니다.','육각 화단,씨앗 카드,햇빛 토큰,가시 덩굴','마법 왕실 정원'),
(74,'074-robot-draft-arena','Robot Draft Arena','deck','robot','부품 카드를 드래프트해 로봇을 조립하고 경기장 상대와 싸웁니다.','로봇 코어,팔 부품,바퀴 모듈,경기장 표식','폐공장 로봇 아레나'),
(75,'075-spell-queue','Spell Queue','deck','spell','마법 카드의 실행 순서를 미리 배열해 적의 방어를 깨뜨립니다.','주문 카드,마나 수정,룬 대기열,마법 방패','부유하는 마법 도서관'),
(76,'076-potion-duel','Potion Duel','deck','duel','상대의 효과를 읽고 반대 성질의 포션을 골라 결투합니다.','불 포션,얼음 포션,해독제,결투 탁자','마녀 시장의 결투장'),
(77,'077-bounty-route','Bounty Route','deck','bounty','위험·보상 카드를 비교해 현상금 사냥 경로를 선택합니다.','현상금 포스터,사막 지도,탄약 토큰,말 안장','먼지 나는 변경 마을'),
(78,'078-ten-night-survival','Ten-Night Survival','deck','survival','열 번의 밤 동안 음식·불·방어 카드를 선택해 생존합니다.','모닥불,식량 카드,울타리,밤의 짐승','눈 덮인 외딴 오두막'),
(79,'079-chess-relic','Chess Relic','deck','chess','체스식 이동 카드와 유물 능력을 조합해 유적 수호자를 돌파합니다.','기사 말,비숍 유물,체스 격자,석상 수호자','사막 체스 유적'),
(80,'080-ghost-train-heist','Ghost Train Heist','deck','heist','객차 이동과 위장 카드를 골라 유령 열차의 금고를 털고 탈출합니다.','유령 객차,금고 열쇠,경비 영혼,탈출 레버','자정의 유령 열차'),
(81,'081-keyboard-sumo','Keyboard Sumo','party','sumo','두 명이 한 키씩 눌러 원형 경기장에서 상대를 밀어냅니다.','스모 캐릭터,원형 도효,밀기 파동,심판 깃발','축제 천막 경기장'),
(82,'082-one-button-fencing','One-Button Fencing','party','fencing','한 버튼의 눌렀다 떼는 타이밍으로 찌르기와 회피를 겨룹니다.','펜싱 검,결투선,방어 자세,득점 램프','고전 펜싱 살롱'),
(83,'083-split-tank','Split Tank','party','tank','한 화면에서 두 전차가 회전·발사하며 먼저 세 점을 얻습니다.','미니 전차,벽돌 미로,포탄,점수 깃발','장난감 전차 창고'),
(84,'084-rhythm-tug','Rhythm Tug','party','tug','각자 박자에 맞춰 키를 눌러 줄을 자기 쪽으로 당깁니다.','줄다리기 밧줄,박자 링,팀 깃발,관중 북','야간 운동회 무대'),
(85,'085-goal-line','Goal Line','party','soccer','30초 동안 좌우 선수로 공을 밀어 더 많은 골을 넣습니다.','미니 축구공,골대,잔디 선,득점 전광판','옥상 풋살장'),
(86,'086-reaction-chef','Reaction Chef','party','chef','화면에 뜬 올바른 재료를 먼저 눌러 요리를 완성합니다.','프라이팬,채소 카드,주문 종,완성 접시','분주한 오픈 키친'),
(87,'087-bluff-courier','Bluff Courier','party','bluff','진짜와 가짜 소포 단서를 번갈아 보고 상대의 선택을 속입니다.','봉인 소포,진짜 송장,가짜 도장,의심 토큰','야간 기차 우편칸'),
(88,'088-cooperative-switchboard','Cooperative Switchboard','party','switchboard','두 명이 서로 다른 스위치를 동시에 조작해 전력망을 안정시킵니다.','대형 스위치,전력 램프,동시 타이머,경보 벨','오래된 발전소 제어실'),
(89,'089-two-person-maze','Two-Person Maze','party','maze','한 명은 탐험가를 움직이고 다른 한 명은 제한된 지도 단서를 제공합니다.','미로 탐험가,부분 지도,출구 열쇠,통신 버튼','지하 석조 미로'),
(90,'090-pass-the-phone-detective','Pass-the-Phone Detective','party','pass','휴대폰을 번갈아 보며 각자 다른 비밀 단서를 조합해 범인을 맞힙니다.','비밀 단서 화면,용의자 카드,전달 타이머,최종 지목','파티용 탐정 사무실'),
(91,'091-last-bus-home','Last Bus Home','story','bus','막차 안에서 만나는 승객과 선택에 따라 귀가와 관계의 결말이 달라집니다.','막차 승차권,빈 좌석,정류장 벨,창밖 비','비 오는 자정 버스'),
(92,'092-one-day-mayor','One-Day Mayor','story','mayor','하루 동안 도시 민원과 예산을 선택해 시민 만족과 재정을 균형 잡습니다.','시장실 책상,민원 서류,도시 예산,시민 지지도','축제 전날 시청'),
(93,'093-space-radio-operator','Space Radio Operator','story','radio','끊긴 우주 무전을 해석하고 답신을 선택해 조난선의 상황을 추론합니다.','우주 무전기,잡음 파형,좌표 지도,산소 계기','외딴 달 기지 통신실'),
(94,'094-neighborhood-mystery','Neighborhood Mystery','story','mystery','동네 지도와 주민 대화를 비교해 사라진 물건의 행방을 밝힙니다.','동네 지도,주민 초상,가게 영수증,골목 CCTV','해질녘 오래된 동네'),
(95,'095-interview-rpg','Interview RPG','story','interview','면접 질문에 답하며 자신감·구체성·직무 적합도를 관리합니다.','면접 질문 카드,경력 노트,자신감 계기,채용 결과','유리벽 회의실'),
(96,'096-debug-dungeon','Debug Dungeon','story','debug','코드의 버그 줄을 찾아 수정해 던전 문과 함정을 해제합니다.','코드 두루마리,버그 괴물,디버그 횃불,잠긴 문','픽셀 지하 던전'),
(97,'097-budget-quest','Budget Quest','story','budget','한 달 자원을 배분해 주거·식사·행복·비상금의 균형을 지킵니다.','월급 코인,생활비 장부,비상금 상자,행복 계기','한 달 생활 보드'),
(98,'098-language-cafe','Language Café','story','language','외국어 주문과 짧은 대화를 골라 카페 손님과 자연스럽게 소통합니다.','메뉴판,외국어 문장 카드,주문 잔,친밀도 계기','다국적 골목 카페'),
(99,'099-memory-palace','Memory Palace','story','memory','방과 사물의 순서를 기억해 기억 궁전의 문을 차례로 엽니다.','기억 방,상징 오브젝트,순서 문양,회상 지도','꿈속 기억 궁전'),
(100,'100-the-hundredth-door','The Hundredth Door','story','meta','앞선 게임의 메달과 기록을 열쇠로 사용해 마지막 100번째 문을 엽니다.','백 개의 문,공통 메달,게임 열쇠,최종 아케이드 코어','모든 세계가 겹치는 중앙 홀')
]

out=[]
for id_,slug,title,family,variant,desc,materials_str,unique_env in rows:
    fam=families[family]
    materials=[x.strip() for x in materials_str.split(',')]
    signatures=list(dict.fromkeys(materials+fam['defaults']))[:10]
    while len(signatures)<8: signatures.append(f'{title} 전용 장치 {len(signatures)+1}')
    envs=[unique_env]+fam['envs']
    theme=f"{fam['role']}가 {desc} 제목에 등장하는 장소와 사물을 실제 조작 대상으로 사용하며 점수와 환경 변화를 통해 임무를 완수한다."
    mechanics=f"{title}의 핵심 조작은 '{desc}'라는 사건을 직접 수행하도록 설계하고, 버튼·상태판·실패·성공 연출을 모두 {unique_env}의 세계관 용어로 표현한다."
    out.append({
        'id':id_,'slug':slug,'title':title,'family':family,'variant':variant,
        'category':fam['category'],'mode':'Solo' if family!='party' else 'Local 2P',
        'duration':'1–5 min' if family in ('arcade','word','party') else '3–8 min',
        'description':desc,'accent':fam['accent'],'background':fam['bg'],
        'themePromise':theme,'mechanicsToTheme':mechanics,
        'coreVerbs':['inspect the scene','perform the title-specific action','react to feedback','complete and replay the mission'],
        'signatureObjects':signatures,'environments':envs[:4],
        'feedback':fam['feedback']+['최고 기록 저장'],
        'input':['mouse','touch','keyboard'],
        'funLoop':{'onboardingSeconds':12,'firstSuccessSeconds':90,'restartSeconds':1,'sessionMinutes':'1-8','replayMotivators':['medal grade','high score or efficiency','environment variation','daily or best record']}
    })

path=Path('games/factory')
path.mkdir(exist_ok=True)
(path/'games.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
print('wrote',len(out),'games', (path/'games.json').stat().st_size)
