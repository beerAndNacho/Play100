import type { SceneDefinition } from "./types";

export const scenes: SceneDefinition[] = [
  {
    id: 1,
    name: "새벽 어시장",
    callSign: "MORNING CATCH",
    subtitle: "경매가 시작되기 전, 주인을 잃은 물건을 찾아주세요.",
    briefing:
      "생선 상자와 그물 사이에 분실물이 섞여 있습니다. 목록에 적힌 물건만 빠르게 회수하세요.",
    weather: "맑은 새벽 · 잔물결",
    timeLimit: 78,
    layout: "market",
    palette: {
      skyA: "#f6b873",
      skyB: "#d7e4dd",
      waterA: "#2f7c87",
      waterB: "#164b59",
      ground: "#b78355",
      structure: "#35515a",
      structureLight: "#d9c9a8",
      accent: "#e65532",
      ink: "#172329"
    },
    objects: [
      { id: "s1-key", label: "황동 열쇠", kind: "key", x: 155, y: 526, scale: 0.8, rotation: -18, color: "#d7a72f" },
      { id: "s1-glove", label: "빨간 장갑", kind: "glove", x: 478, y: 470, scale: 0.88, rotation: 22, color: "#c94435" },
      { id: "s1-sock", label: "줄무늬 양말", kind: "sock", x: 868, y: 224, scale: 0.78, rotation: -13, color: "#e9d9ad" },
      { id: "s1-camera", label: "낡은 카메라", kind: "camera", x: 1042, y: 506, scale: 0.72, rotation: 7, color: "#27383d" },
      { id: "s1-compass", label: "나침반", kind: "compass", x: 625, y: 575, scale: 0.72, rotation: 0, color: "#d1a23c" },
      { id: "s1-bottle", label: "파란 병", kind: "bottle", x: 342, y: 279, scale: 0.8, rotation: -5, color: "#1f6e8f" },
      { id: "s1-umbrella", label: "노란 우산", kind: "umbrella", x: 768, y: 522, scale: 0.9, rotation: -22, color: "#e5bd43" },
      { id: "s1-starfish", label: "불가사리", kind: "starfish", x: 1140, y: 631, scale: 0.75, rotation: 18, color: "#d76b4d" },
      { id: "s1-hat", label: "선원 모자", kind: "hat", x: 544, y: 211, scale: 0.82, rotation: 3, color: "#edf0dc" },
      { id: "s1-paperboat", label: "종이배", kind: "paperboat", x: 958, y: 646, scale: 0.72, rotation: -7, color: "#f1e8cf" },
      { id: "s1-apple", label: "초록 사과", kind: "apple", x: 247, y: 610, scale: 0.8, rotation: 0, color: "#6c9b42" },
      { id: "s1-shell", label: "소라 껍데기", kind: "shell", x: 706, y: 302, scale: 0.68, rotation: 26, color: "#c99878" },
      { id: "s1-bell", label: "작은 종", kind: "bell", x: 1090, y: 166, scale: 0.7, rotation: -8, color: "#b88a2a" },
      { id: "s1-postcard", label: "항구 엽서", kind: "postcard", x: 420, y: 620, scale: 0.74, rotation: -10, color: "#e7d4a9" }
    ]
  },
  {
    id: 2,
    name: "안개 창고",
    callSign: "WAREHOUSE 7",
    subtitle: "입고 기록과 맞지 않는 물건들이 창고 곳곳에 숨어 있습니다.",
    briefing:
      "상자, 밧줄, 작업 도구가 뒤섞인 창고입니다. 안개가 짙어지기 전에 분실 목록을 정리하세요.",
    weather: "짙은 해무 · 가시거리 2 NM",
    timeLimit: 84,
    layout: "warehouse",
    palette: {
      skyA: "#8da2a1",
      skyB: "#c7d1c9",
      waterA: "#4c7880",
      waterB: "#284e58",
      ground: "#665a4b",
      structure: "#303f41",
      structureLight: "#9b9a86",
      accent: "#d57b36",
      ink: "#182022"
    },
    objects: [
      { id: "s2-anchor", label: "작은 닻", kind: "anchor", x: 120, y: 565, scale: 0.82, rotation: -10, color: "#37484a" },
      { id: "s2-watch", label: "손목시계", kind: "watch", x: 378, y: 354, scale: 0.74, rotation: 34, color: "#c6b47b" },
      { id: "s2-binoculars", label: "쌍안경", kind: "binoculars", x: 1015, y: 258, scale: 0.76, rotation: -12, color: "#293b3d" },
      { id: "s2-lantern", label: "주황 랜턴", kind: "lantern", x: 825, y: 528, scale: 0.82, rotation: 3, color: "#d76d2f" },
      { id: "s2-key", label: "황동 열쇠", kind: "key", x: 620, y: 204, scale: 0.72, rotation: 21, color: "#c89b34" },
      { id: "s2-glove", label: "작업 장갑", kind: "glove", x: 520, y: 585, scale: 0.88, rotation: -18, color: "#8e543d" },
      { id: "s2-camera", label: "낡은 카메라", kind: "camera", x: 1080, y: 596, scale: 0.72, rotation: -4, color: "#202c2e" },
      { id: "s2-bottle", label: "초록 병", kind: "bottle", x: 252, y: 220, scale: 0.86, rotation: 9, color: "#3d725f" },
      { id: "s2-shell", label: "소라 껍데기", kind: "shell", x: 716, y: 610, scale: 0.72, rotation: -25, color: "#b78668" },
      { id: "s2-hat", label: "선원 모자", kind: "hat", x: 905, y: 182, scale: 0.82, rotation: -9, color: "#dfe0c8" },
      { id: "s2-postcard", label: "낡은 엽서", kind: "postcard", x: 432, y: 192, scale: 0.68, rotation: 12, color: "#c9b793" },
      { id: "s2-bell", label: "부두 종", kind: "bell", x: 1132, y: 390, scale: 0.76, rotation: 4, color: "#ad8530" },
      { id: "s2-sock", label: "줄무늬 양말", kind: "sock", x: 178, y: 404, scale: 0.72, rotation: 17, color: "#b8aa8d" },
      { id: "s2-apple", label: "초록 사과", kind: "apple", x: 660, y: 468, scale: 0.78, rotation: 0, color: "#668d42" }
    ]
  },
  {
    id: 3,
    name: "노을 여객부두",
    callSign: "SUNSET FERRY",
    subtitle: "마지막 배가 떠나기 전 승객들의 분실물을 찾아주세요.",
    briefing:
      "벤치, 매표소, 계류줄 사이를 살펴보세요. 노을빛과 비슷한 색의 물건이 특히 잘 숨어 있습니다.",
    weather: "노을 · 남서풍 2",
    timeLimit: 76,
    layout: "pier",
    palette: {
      skyA: "#f28b63",
      skyB: "#f2cf9a",
      waterA: "#2b6678",
      waterB: "#183d50",
      ground: "#8b6548",
      structure: "#33464c",
      structureLight: "#d6b786",
      accent: "#d84a37",
      ink: "#172128"
    },
    objects: [
      { id: "s3-umbrella", label: "파란 우산", kind: "umbrella", x: 270, y: 510, scale: 0.9, rotation: 18, color: "#2f7293" },
      { id: "s3-camera", label: "여행 카메라", kind: "camera", x: 922, y: 300, scale: 0.74, rotation: -7, color: "#253338" },
      { id: "s3-watch", label: "손목시계", kind: "watch", x: 685, y: 550, scale: 0.72, rotation: -30, color: "#c4a458" },
      { id: "s3-paperboat", label: "종이배", kind: "paperboat", x: 1068, y: 620, scale: 0.72, rotation: 8, color: "#f2e3c1" },
      { id: "s3-starfish", label: "불가사리", kind: "starfish", x: 144, y: 645, scale: 0.72, rotation: -10, color: "#d5674b" },
      { id: "s3-compass", label: "나침반", kind: "compass", x: 444, y: 236, scale: 0.72, rotation: 0, color: "#d0a743" },
      { id: "s3-hat", label: "선원 모자", kind: "hat", x: 786, y: 196, scale: 0.82, rotation: 6, color: "#ebe4cb" },
      { id: "s3-bottle", label: "보라 병", kind: "bottle", x: 1160, y: 470, scale: 0.78, rotation: 5, color: "#665185" },
      { id: "s3-key", label: "황동 열쇠", kind: "key", x: 540, y: 612, scale: 0.72, rotation: -24, color: "#cf9d31" },
      { id: "s3-postcard", label: "여행 엽서", kind: "postcard", x: 330, y: 285, scale: 0.7, rotation: -9, color: "#e7c995" },
      { id: "s3-shell", label: "소라 껍데기", kind: "shell", x: 864, y: 632, scale: 0.72, rotation: 18, color: "#cb9173" },
      { id: "s3-binoculars", label: "쌍안경", kind: "binoculars", x: 1028, y: 198, scale: 0.7, rotation: 14, color: "#354348" },
      { id: "s3-apple", label: "빨간 사과", kind: "apple", x: 605, y: 340, scale: 0.78, rotation: 0, color: "#c94b3c" },
      { id: "s3-bell", label: "작은 종", kind: "bell", x: 182, y: 208, scale: 0.72, rotation: 4, color: "#b88b2d" }
    ]
  },
  {
    id: 4,
    name: "비 내리는 야간항",
    callSign: "NIGHT SHIFT",
    subtitle: "정전 점검 중 사라진 장비를 등대 불빛 아래서 찾아주세요.",
    briefing:
      "컨테이너와 작업등이 만드는 강한 그림자를 이용하세요. 잘못 누르면 남은 시간이 줄어듭니다.",
    weather: "야간 소나기 · 돌풍",
    timeLimit: 90,
    layout: "night",
    palette: {
      skyA: "#071827",
      skyB: "#153a4a",
      waterA: "#113d50",
      waterB: "#061e2d",
      ground: "#253139",
      structure: "#17252c",
      structureLight: "#61757a",
      accent: "#f0a530",
      ink: "#e8eee8"
    },
    objects: [
      { id: "s4-lantern", label: "주황 랜턴", kind: "lantern", x: 168, y: 500, scale: 0.82, rotation: -3, color: "#f08b34" },
      { id: "s4-key", label: "은색 열쇠", kind: "key", x: 482, y: 614, scale: 0.72, rotation: 15, color: "#aebdc0" },
      { id: "s4-compass", label: "나침반", kind: "compass", x: 720, y: 296, scale: 0.72, rotation: 0, color: "#caa44c" },
      { id: "s4-glove", label: "방수 장갑", kind: "glove", x: 1004, y: 518, scale: 0.86, rotation: -24, color: "#3a6c79" },
      { id: "s4-watch", label: "손목시계", kind: "watch", x: 357, y: 247, scale: 0.7, rotation: 28, color: "#899b9d" },
      { id: "s4-binoculars", label: "쌍안경", kind: "binoculars", x: 1120, y: 245, scale: 0.72, rotation: -8, color: "#18282e" },
      { id: "s4-umbrella", label: "노란 우산", kind: "umbrella", x: 855, y: 606, scale: 0.88, rotation: 20, color: "#d8aa31" },
      { id: "s4-bell", label: "비상 종", kind: "bell", x: 610, y: 168, scale: 0.72, rotation: 0, color: "#c59635" },
      { id: "s4-camera", label: "검은 카메라", kind: "camera", x: 248, y: 638, scale: 0.72, rotation: -6, color: "#111c21" },
      { id: "s4-bottle", label: "파란 병", kind: "bottle", x: 941, y: 198, scale: 0.78, rotation: 7, color: "#1f6081" },
      { id: "s4-anchor", label: "작은 닻", kind: "anchor", x: 548, y: 458, scale: 0.78, rotation: 8, color: "#718287" },
      { id: "s4-seahorse", label: "해마 장식", kind: "seahorse", x: 1065, y: 637, scale: 0.75, rotation: -14, color: "#d1764f" },
      { id: "s4-postcard", label: "젖은 엽서", kind: "postcard", x: 764, y: 528, scale: 0.7, rotation: -18, color: "#9ba89f" },
      { id: "s4-hat", label: "선원 모자", kind: "hat", x: 120, y: 217, scale: 0.8, rotation: 11, color: "#cbd2c5" }
    ]
  },
  {
    id: 5,
    name: "수리 조선소",
    callSign: "DRY DOCK",
    subtitle: "출항 점검표에 없는 물건을 선체와 작업대 사이에서 찾아주세요.",
    briefing:
      "크레인, 공구함, 선체 도장 무늬가 시선을 방해합니다. 확대 기능을 활용해 천천히 살펴보세요.",
    weather: "맑음 · 건조한 북서풍",
    timeLimit: 86,
    layout: "shipyard",
    palette: {
      skyA: "#86b2bd",
      skyB: "#d9e2d7",
      waterA: "#296c7a",
      waterB: "#164652",
      ground: "#8d775d",
      structure: "#3e4b4a",
      structureLight: "#c7b68f",
      accent: "#d75535",
      ink: "#182326"
    },
    objects: [
      { id: "s5-camera", label: "낡은 카메라", kind: "camera", x: 186, y: 620, scale: 0.72, rotation: 10, color: "#2b3636" },
      { id: "s5-key", label: "큰 열쇠", kind: "key", x: 512, y: 344, scale: 0.8, rotation: -18, color: "#b58b30" },
      { id: "s5-glove", label: "용접 장갑", kind: "glove", x: 984, y: 582, scale: 0.88, rotation: 16, color: "#8f513f" },
      { id: "s5-anchor", label: "작은 닻", kind: "anchor", x: 724, y: 620, scale: 0.82, rotation: 0, color: "#4d5c5d" },
      { id: "s5-bell", label: "황동 종", kind: "bell", x: 1090, y: 232, scale: 0.72, rotation: 7, color: "#b88729" },
      { id: "s5-compass", label: "나침반", kind: "compass", x: 342, y: 247, scale: 0.72, rotation: 0, color: "#d1a23e" },
      { id: "s5-bottle", label: "초록 병", kind: "bottle", x: 618, y: 566, scale: 0.78, rotation: -5, color: "#47745e" },
      { id: "s5-watch", label: "손목시계", kind: "watch", x: 865, y: 306, scale: 0.72, rotation: -26, color: "#c2ae7a" },
      { id: "s5-paperboat", label: "종이배", kind: "paperboat", x: 1142, y: 640, scale: 0.72, rotation: 4, color: "#e9dfc4" },
      { id: "s5-apple", label: "초록 사과", kind: "apple", x: 436, y: 600, scale: 0.78, rotation: 0, color: "#6d8f43" },
      { id: "s5-sock", label: "줄무늬 양말", kind: "sock", x: 236, y: 413, scale: 0.72, rotation: -12, color: "#d3c4a1" },
      { id: "s5-lantern", label: "작업 랜턴", kind: "lantern", x: 786, y: 190, scale: 0.8, rotation: 0, color: "#d77432" },
      { id: "s5-shell", label: "소라 껍데기", kind: "shell", x: 1042, y: 405, scale: 0.72, rotation: 18, color: "#bc8469" },
      { id: "s5-binoculars", label: "쌍안경", kind: "binoculars", x: 568, y: 200, scale: 0.7, rotation: 13, color: "#314344" }
    ]
  }
];
