import type { ObjectKind, SceneDefinition, SceneObject } from "./types";

function objectSymbols(): string {
  return `
    <symbol id="obj-key" viewBox="-30 -30 60 60">
      <circle cx="-12" cy="0" r="9" fill="none" stroke="currentColor" stroke-width="6"/>
      <path d="M-3 0H22M12 0V9M20 0V7" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
    </symbol>
    <symbol id="obj-glove" viewBox="-30 -30 60 60">
      <path d="M-13 22C-21 14-21 5-17-2l2-16c1-5 8-4 8 1v12l2-20c1-5 8-4 8 1v18l3-17c1-5 8-3 7 2L11-3l5-12c2-5 9-2 7 3L18 5c-2 10-8 18-18 21-5 2-9 0-13-4Z" fill="currentColor" stroke="#182326" stroke-width="2"/>
    </symbol>
    <symbol id="obj-sock" viewBox="-30 -30 60 60">
      <path d="M-13-24H8v27c0 7 7 9 14 11l-5 12c-12-2-24-7-29-16-3-5-1-12-1-18Z" fill="currentColor" stroke="#182326" stroke-width="2"/>
      <path d="M-12-13H8M-12-2H8" stroke="#b74f42" stroke-width="4"/>
    </symbol>
    <symbol id="obj-camera" viewBox="-30 -30 60 60">
      <rect x="-24" y="-16" width="48" height="34" rx="5" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <rect x="-13" y="-22" width="18" height="8" rx="2" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <circle cx="3" cy="1" r="11" fill="#b9d2cf" stroke="#172326" stroke-width="4"/>
      <circle cx="3" cy="1" r="5" fill="#294f58"/>
      <circle cx="-16" cy="-7" r="2.5" fill="#e7a936"/>
    </symbol>
    <symbol id="obj-compass" viewBox="-30 -30 60 60">
      <circle cx="0" cy="0" r="23" fill="#efe4c3" stroke="currentColor" stroke-width="5"/>
      <circle cx="0" cy="0" r="15" fill="none" stroke="#584a36" stroke-width="2"/>
      <path d="M0-17 6 3 0 17-6-3Z" fill="#d9533f"/>
      <path d="M0-17-6-3 0 2 6-3Z" fill="#294f58"/>
      <circle r="3" fill="#584a36"/>
    </symbol>
    <symbol id="obj-bottle" viewBox="-30 -30 60 60">
      <path d="M-7-25H7v10l6 7v27c0 5-4 8-9 8H-4c-5 0-9-3-9-8V-8l6-7Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <path d="M-10 4H10" stroke="#d9eee8" stroke-width="4" opacity=".7"/>
    </symbol>
    <symbol id="obj-umbrella" viewBox="-34 -30 68 60">
      <path d="M-28 0C-23-20 20-22 28 0c-7-5-13-5-19 0-6-5-12-5-18 0-6-5-12-5-19 0Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <path d="M0-16V19c0 9 13 9 13 1" fill="none" stroke="#172326" stroke-width="4" stroke-linecap="round"/>
    </symbol>
    <symbol id="obj-starfish" viewBox="-30 -30 60 60">
      <path d="m0-25 7 16 18-5-11 14 13 12-18-1-4 17-8-16-17 6 10-15-13-11 18 1Z" fill="currentColor" stroke="#6b3b32" stroke-width="2"/>
      <circle cx="-5" cy="-5" r="1.5" fill="#f2c2a0"/><circle cx="8" cy="4" r="1.5" fill="#f2c2a0"/><circle cx="-2" cy="12" r="1.5" fill="#f2c2a0"/>
    </symbol>
    <symbol id="obj-hat" viewBox="-34 -30 68 60">
      <path d="M-20 2c2-18 38-18 40 0l5 12H-25Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <path d="M-28 14H28c-4 9-15 13-28 13s-24-4-28-13Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <path d="M-18 7H18" stroke="#2e6575" stroke-width="5"/>
    </symbol>
    <symbol id="obj-paperboat" viewBox="-34 -30 68 60">
      <path d="M-29 10 0-22l29 32-14 16h-30Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <path d="M0-22V10M-29 10H29M-15 26 0 10l15 16" fill="none" stroke="#927f60" stroke-width="2"/>
    </symbol>
    <symbol id="obj-apple" viewBox="-30 -30 60 60">
      <path d="M0-15c15-12 26 2 22 18-4 17-13 25-22 20-9 5-18-3-22-20-4-16 7-30 22-18Z" fill="currentColor" stroke="#26372e" stroke-width="3"/>
      <path d="M0-14c0-8 4-13 9-17" stroke="#5c442d" stroke-width="4" stroke-linecap="round"/>
      <path d="M6-21c7-7 15-5 18 1-8 3-14 2-18-1Z" fill="#5b8b49"/>
    </symbol>
    <symbol id="obj-shell" viewBox="-30 -30 60 60">
      <path d="M-22 15C-20-10-7-24 10-22c18 2 20 20 11 34C12 27-9 28-22 15Z" fill="currentColor" stroke="#6f4e42" stroke-width="3"/>
      <path d="M-11 12C-8-5 0-13 10-12c9 1 10 10 5 17-5 8-17 10-26 7Zm7-3c2-8 6-11 11-10 4 1 4 5 2 8-3 4-8 5-13 2Z" fill="none" stroke="#f0c7a6" stroke-width="3"/>
    </symbol>
    <symbol id="obj-anchor" viewBox="-32 -32 64 64">
      <circle cx="0" cy="-20" r="7" fill="none" stroke="currentColor" stroke-width="5"/>
      <path d="M0-13V22M-18-4H18M-23 10c3 12 11 18 23 18s20-6 23-18M-23 10l-5 4M23 10l5 4" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    </symbol>
    <symbol id="obj-lantern" viewBox="-30 -32 60 64">
      <path d="M-13-21c2-11 24-11 26 0" fill="none" stroke="#172326" stroke-width="4"/>
      <rect x="-18" y="-18" width="36" height="42" rx="5" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <rect x="-11" y="-10" width="22" height="25" rx="4" fill="#ffd87d" opacity=".86"/>
      <path d="M-20 24H20" stroke="#172326" stroke-width="5"/>
    </symbol>
    <symbol id="obj-watch" viewBox="-26 -34 52 68">
      <rect x="-9" y="-32" width="18" height="64" rx="6" fill="currentColor" stroke="#172326" stroke-width="2"/>
      <circle cx="0" cy="0" r="17" fill="#e8e0c7" stroke="#172326" stroke-width="4"/>
      <path d="M0 0V-9M0 0l8 5" stroke="#6b5a44" stroke-width="3" stroke-linecap="round"/>
    </symbol>
    <symbol id="obj-binoculars" viewBox="-34 -28 68 56">
      <path d="M-26-10-18-22H-4l4 13 4-13h14l8 12v25H7L0 7l-7 8h-19Z" fill="currentColor" stroke="#172326" stroke-width="3"/>
      <circle cx="-17" cy="11" r="11" fill="#9fc0c0" stroke="#172326" stroke-width="3"/>
      <circle cx="17" cy="11" r="11" fill="#9fc0c0" stroke="#172326" stroke-width="3"/>
    </symbol>
    <symbol id="obj-crab" viewBox="-34 -28 68 56">
      <ellipse cx="0" cy="5" rx="19" ry="14" fill="currentColor" stroke="#65372f" stroke-width="3"/>
      <path d="M-16 0-28-10M16 0 28-10M-13 15-23 23M-4 18-9 27M13 15 23 23M4 18 9 27" stroke="#65372f" stroke-width="4" stroke-linecap="round"/>
      <path d="M-28-10c-6-8 4-13 10-6M28-10c6-8-4-13-10-6" fill="none" stroke="#65372f" stroke-width="4"/>
      <circle cx="-7" cy="1" r="2.5" fill="#172326"/><circle cx="7" cy="1" r="2.5" fill="#172326"/>
    </symbol>
    <symbol id="obj-postcard" viewBox="-34 -25 68 50">
      <rect x="-30" y="-20" width="60" height="40" rx="2" fill="currentColor" stroke="#6b5b46" stroke-width="3"/>
      <rect x="15" y="-14" width="9" height="10" fill="#d75a45"/>
      <path d="M2-14V14M7 2H24M7 8H21M-23-9h17M-23-3h13M-23 8h18" stroke="#85745b" stroke-width="2"/>
    </symbol>
    <symbol id="obj-bell" viewBox="-28 -30 56 60">
      <path d="M-20 14h40c-6-7-7-13-7-24 0-16-26-16-26 0 0 11-1 17-7 24Z" fill="currentColor" stroke="#5b4630" stroke-width="3"/>
      <circle cx="0" cy="19" r="5" fill="#6d4e2a"/>
      <path d="M-24 14H24" stroke="#5b4630" stroke-width="4"/>
    </symbol>
    <symbol id="obj-seahorse" viewBox="-26 -34 52 68">
      <path d="M7-26c-15-3-23 10-16 22 6 10 17 5 16-3-1-7-10-7-12-2 8-2 12 7 7 15-4 7-3 15 4 18 6 3 12-1 11-8-1-5-7-7-11-4 4 1 6 5 3 8" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
      <path d="M6-26 18-20 8-16" fill="currentColor"/>
      <circle cx="5" cy="-21" r="2" fill="#172326"/>
    </symbol>
  `;
}

function waves(scene: SceneDefinition): string {
  const lines = Array.from({ length: 10 }, (_, index) => {
    const y = 316 + index * 34;
    const shift = (index % 2) * 28;
    return `<path class="wave wave-${index % 3}" d="M${-80 + shift} ${y} Q20 ${y - 13} 120 ${y}T320 ${y}T520 ${y}T720 ${y}T920 ${y}T1120 ${y}T1320 ${y}" />`;
  }).join("");
  return `<g class="waves" stroke="${scene.palette.structureLight}" opacity=".22" fill="none" stroke-width="3">${lines}</g>`;
}

function marketEnvironment(scene: SceneDefinition): string {
  const p = scene.palette;
  return `
    <rect width="1200" height="720" fill="url(#sky-${scene.id})"/>
    <rect y="270" width="1200" height="450" fill="url(#water-${scene.id})"/>
    ${waves(scene)}
    <path d="M0 455H1200V720H0Z" fill="${p.ground}"/>
    <path d="M0 472H1200" stroke="#503b2f" stroke-width="7"/>
    <g opacity=".7">
      <path d="M0 226 140 194 280 223 430 184 600 218 745 172 930 210 1200 162V285H0Z" fill="${p.structure}" opacity=".35"/>
      <rect x="1035" y="82" width="28" height="156" fill="${p.structure}"/>
      <path d="M1011 84h76l-38-52Z" fill="${p.accent}"/>
      <circle cx="1049" cy="101" r="17" fill="#ffe9a6" opacity=".8"/>
    </g>
    <g class="boat-decoration">
      <path d="M760 344h170l-30 44H790Z" fill="#d9d0bb" stroke="${p.ink}" stroke-width="5"/>
      <rect x="810" y="297" width="69" height="49" fill="${p.structureLight}" stroke="${p.ink}" stroke-width="4"/>
      <path d="M845 297v-61" stroke="${p.ink}" stroke-width="5"/>
      <path d="M845 241 907 280h-62Z" fill="${p.accent}" opacity=".75"/>
    </g>
    <g class="market-stalls">
      <rect x="60" y="365" width="250" height="174" fill="${p.structureLight}" stroke="${p.ink}" stroke-width="5"/>
      <path d="M45 365h280l-31-66H79Z" fill="#e4d7b8" stroke="${p.ink}" stroke-width="5"/>
      <path d="M73 307h55v57H73Zm110 0h55v57h-55Z" fill="${p.accent}" opacity=".88"/>
      <rect x="344" y="386" width="260" height="147" fill="#c9b18d" stroke="${p.ink}" stroke-width="5"/>
      <path d="M330 386h288l-37-70H370Z" fill="#3e7580" stroke="${p.ink}" stroke-width="5"/>
      <path d="M379 326h55v58h-55Zm112 0h55v58h-55Z" fill="#eee0bd" opacity=".9"/>
      <rect x="928" y="396" width="218" height="143" fill="#b89c75" stroke="${p.ink}" stroke-width="5"/>
      <path d="M910 396h254l-28-65H941Z" fill="#d26043" stroke="${p.ink}" stroke-width="5"/>
      <path d="M956 339h50v55h-50Zm98 0h50v55h-50Z" fill="#e7d9b8" opacity=".9"/>
    </g>
    <g class="clutter" stroke="${p.ink}" stroke-width="3">
      <rect x="89" y="548" width="126" height="74" fill="#8d6041"/>
      <path d="M89 572h126M130 548v74M174 548v74" opacity=".6"/>
      <rect x="357" y="548" width="118" height="72" fill="#79604b"/>
      <path d="M357 570h118M397 548v72M438 548v72" opacity=".6"/>
      <rect x="805" y="522" width="108" height="72" fill="#9b704c"/>
      <path d="M805 547h108M841 522v72M879 522v72" opacity=".6"/>
      <ellipse cx="558" cy="617" rx="80" ry="34" fill="none" stroke="#d4c3a3" stroke-width="7"/>
      <path d="M509 593c24 26 70 26 98 0M511 640c23-25 67-25 94 0" fill="none" stroke="#d4c3a3" stroke-width="4"/>
      <path d="M680 495c42-49 102-48 145 3M683 502c48 32 98 33 139 0" fill="none" stroke="#6f5b47" stroke-width="7"/>
    </g>
    <g class="gulls" fill="none" stroke="${p.ink}" stroke-width="4" stroke-linecap="round" opacity=".65">
      <path d="M152 144q17-16 34 0 17-16 34 0"/>
      <path d="M586 106q14-13 28 0 14-13 28 0"/>
      <path d="M900 142q12-11 24 0 12-11 24 0"/>
    </g>
  `;
}

function warehouseEnvironment(scene: SceneDefinition): string {
  const p = scene.palette;
  return `
    <rect width="1200" height="720" fill="${p.structure}"/>
    <rect x="70" y="70" width="1060" height="585" fill="#3c4b4b" stroke="${p.ink}" stroke-width="8"/>
    <path d="M70 180H1130M270 70V655M605 70V655M930 70V655" stroke="${p.structureLight}" stroke-width="6" opacity=".28"/>
    <rect x="792" y="95" width="294" height="174" fill="url(#sky-${scene.id})" stroke="${p.ink}" stroke-width="7"/>
    <rect x="792" y="188" width="294" height="81" fill="url(#water-${scene.id})"/>
    ${waves(scene)}
    <path d="M0 650H1200V720H0Z" fill="${p.ground}"/>
    <g class="warehouse-shelves">
      <rect x="105" y="220" width="410" height="28" fill="#252f30"/>
      <rect x="105" y="402" width="410" height="28" fill="#252f30"/>
      <rect x="105" y="576" width="410" height="28" fill="#252f30"/>
      <path d="M122 215V612M498 215V612" stroke="#1b2526" stroke-width="13"/>
      <rect x="135" y="255" width="122" height="122" fill="#8c694b" stroke="${p.ink}" stroke-width="4"/>
      <rect x="275" y="270" width="196" height="107" fill="#79604b" stroke="${p.ink}" stroke-width="4"/>
      <rect x="126" y="439" width="174" height="120" fill="#9b724e" stroke="${p.ink}" stroke-width="4"/>
      <rect x="320" y="449" width="157" height="110" fill="#6f5b49" stroke="${p.ink}" stroke-width="4"/>
    </g>
    <g class="forklift" transform="translate(585 450)">
      <rect x="0" y="50" width="190" height="94" rx="14" fill="${p.accent}" stroke="${p.ink}" stroke-width="6"/>
      <rect x="92" y="-15" width="72" height="72" fill="#d7d4bd" stroke="${p.ink}" stroke-width="6"/>
      <path d="M173-20V150M173 128h82" stroke="${p.ink}" stroke-width="10"/>
      <circle cx="44" cy="151" r="26" fill="#202728"/><circle cx="145" cy="151" r="26" fill="#202728"/>
    </g>
    <g class="floor-clutter">
      <rect x="822" y="488" width="176" height="116" fill="#8c6b4e" stroke="${p.ink}" stroke-width="5"/>
      <rect x="1010" y="516" width="108" height="88" fill="#705d4d" stroke="${p.ink}" stroke-width="5"/>
      <ellipse cx="728" cy="629" rx="76" ry="29" fill="none" stroke="#a69b7b" stroke-width="8"/>
      <path d="M678 610c33 30 74 29 102 0M679 647c29-25 69-25 100 0" fill="none" stroke="#a69b7b" stroke-width="5"/>
      <path d="M559 246h176l-16 116H579Z" fill="#4e5d5b" stroke="${p.ink}" stroke-width="5"/>
      <path d="M585 269h124M592 300h110M598 331h95" stroke="#89938a" stroke-width="4"/>
    </g>
    <g class="fog" opacity=".18" fill="#e4ece5">
      <ellipse cx="920" cy="260" rx="300" ry="95"/>
      <ellipse cx="660" cy="398" rx="290" ry="80"/>
    </g>
  `;
}

function pierEnvironment(scene: SceneDefinition): string {
  const p = scene.palette;
  return `
    <rect width="1200" height="720" fill="url(#sky-${scene.id})"/>
    <circle cx="970" cy="145" r="68" fill="#ffd284" opacity=".75"/>
    <rect y="278" width="1200" height="442" fill="url(#water-${scene.id})"/>
    ${waves(scene)}
    <g class="ferry" transform="translate(610 230)">
      <path d="M0 130h415l-55 86H58Z" fill="#e6dfcc" stroke="${p.ink}" stroke-width="6"/>
      <rect x="86" y="44" width="244" height="92" rx="5" fill="#d4d1c1" stroke="${p.ink}" stroke-width="6"/>
      <rect x="116" y="66" width="42" height="30" fill="#5b8791"/>
      <rect x="176" y="66" width="42" height="30" fill="#5b8791"/>
      <rect x="236" y="66" width="42" height="30" fill="#5b8791"/>
      <path d="M107 44V0h40v44" fill="${p.accent}" stroke="${p.ink}" stroke-width="6"/>
    </g>
    <path d="M0 490 1200 420V720H0Z" fill="${p.ground}"/>
    <g class="pier-planks" stroke="#513b2d" stroke-width="4" opacity=".65">
      ${Array.from({ length: 15 }, (_, index) => `<path d="M${index * 86 - 40} 480 ${index * 92 + 20} 720"/>`).join("")}
      <path d="M0 540 1200 470M0 610 1200 540M0 680 1200 610"/>
    </g>
    <g class="ticket-booth">
      <rect x="76" y="298" width="254" height="218" fill="${p.structureLight}" stroke="${p.ink}" stroke-width="6"/>
      <path d="M55 300h300l-42-68H96Z" fill="${p.accent}" stroke="${p.ink}" stroke-width="6"/>
      <rect x="115" y="348" width="100" height="78" fill="#53818c" stroke="${p.ink}" stroke-width="5"/>
      <rect x="239" y="348" width="58" height="168" fill="#6e5c49" stroke="${p.ink}" stroke-width="5"/>
    </g>
    <g class="pier-furniture" stroke="${p.ink}" stroke-width="5">
      <path d="M397 493v104M499 487v103M378 544h143M384 514h130" fill="none"/>
      <path d="M884 505v99M984 499v99M866 553h136M872 523h124" fill="none"/>
      <path d="M1130 397v194M1105 397h50" fill="none" stroke-width="8"/>
      <circle cx="1130" cy="384" r="26" fill="#ffd986" opacity=".82"/>
      <path d="M555 455c25-55 79-56 111 0M557 463c36 24 76 24 108 0" fill="none" stroke="#6d5947" stroke-width="8"/>
    </g>
  `;
}

function nightEnvironment(scene: SceneDefinition): string {
  const p = scene.palette;
  return `
    <rect width="1200" height="720" fill="url(#sky-${scene.id})"/>
    <circle cx="972" cy="104" r="45" fill="#dce6d7" opacity=".65"/>
    <rect y="305" width="1200" height="415" fill="url(#water-${scene.id})"/>
    ${waves(scene)}
    <path d="M0 520H1200V720H0Z" fill="${p.ground}"/>
    <g class="containers" stroke="#0d171d" stroke-width="6">
      <rect x="55" y="305" width="250" height="135" fill="#8f3d35"/>
      <path d="M87 305v135M127 305v135M167 305v135M207 305v135M247 305v135" opacity=".55"/>
      <rect x="323" y="342" width="260" height="140" fill="#275b70"/>
      <path d="M359 342v140M399 342v140M439 342v140M479 342v140M519 342v140" opacity=".55"/>
      <rect x="827" y="333" width="310" height="155" fill="#6b5a35"/>
      <path d="M866 333v155M910 333v155M954 333v155M998 333v155M1042 333v155M1086 333v155" opacity=".55"/>
    </g>
    <g class="cranes" fill="none" stroke="#0c171d" stroke-width="12">
      <path d="M675 430V104h268M680 142h197M870 105v208"/>
      <path d="M84 305V130h260M92 167h180M272 132v125"/>
    </g>
    <g class="dock-lights">
      <path d="M632 365v264M1155 354v274" stroke="#1a2427" stroke-width="10"/>
      <circle cx="632" cy="348" r="28" fill="#ffd371"/>
      <circle cx="1155" cy="337" r="28" fill="#ffd371"/>
      <path d="M632 348 525 630h215ZM1155 337 1043 630h157Z" fill="#ffd371" opacity=".08"/>
    </g>
    <g class="night-clutter">
      <rect x="83" y="555" width="165" height="94" fill="#654b3b" stroke="#101b20" stroke-width="5"/>
      <rect x="347" y="570" width="121" height="80" fill="#756146" stroke="#101b20" stroke-width="5"/>
      <rect x="873" y="550" width="158" height="101" fill="#574b3d" stroke="#101b20" stroke-width="5"/>
      <ellipse cx="722" cy="624" rx="88" ry="31" fill="none" stroke="#75868a" stroke-width="8"/>
      <path d="M660 603c36 32 89 32 124 0M661 644c34-27 86-27 121 0" fill="none" stroke="#75868a" stroke-width="5"/>
    </g>
    <g class="rain" stroke="#b8d5d7" stroke-width="3" opacity=".32">
      ${Array.from({ length: 46 }, (_, index) => {
        const x = (index * 79) % 1240 - 30;
        const y = (index * 137) % 670;
        return `<path d="M${x} ${y}l-14 34"/>`;
      }).join("")}
    </g>
  `;
}

function shipyardEnvironment(scene: SceneDefinition): string {
  const p = scene.palette;
  return `
    <rect width="1200" height="720" fill="url(#sky-${scene.id})"/>
    <rect y="245" width="1200" height="190" fill="url(#water-${scene.id})"/>
    ${waves(scene)}
    <rect y="435" width="1200" height="285" fill="${p.ground}"/>
    <g class="ship-hull" transform="translate(500 205)">
      <path d="M0 150h610l-73 190H88Z" fill="#d9d8c7" stroke="${p.ink}" stroke-width="8"/>
      <path d="M78 205h485" stroke="${p.accent}" stroke-width="24" opacity=".9"/>
      <rect x="172" y="54" width="255" height="103" fill="#e0ddcb" stroke="${p.ink}" stroke-width="7"/>
      <rect x="213" y="84" width="53" height="37" fill="#5b8590"/>
      <rect x="287" y="84" width="53" height="37" fill="#5b8590"/>
      <rect x="361" y="84" width="35" height="37" fill="#5b8590"/>
      <path d="M202 54V0h60v54" fill="${p.accent}" stroke="${p.ink}" stroke-width="7"/>
    </g>
    <g class="yard-crane" fill="none" stroke="${p.ink}" stroke-width="13">
      <path d="M92 470V95h330M100 140h255M354 95v205"/>
      <path d="M354 300v70" stroke-width="7"/>
      <path d="M338 370h32l-7 30h-18Z" fill="${p.accent}" stroke-width="5"/>
    </g>
    <g class="scaffold" stroke="${p.structure}" stroke-width="8" fill="none">
      <path d="M465 360V650M581 341V650M697 326V650M813 311V650M929 296V650M1045 281V650"/>
      <path d="M445 425h626M445 508h626M445 591h626"/>
      <path d="M465 360l116 290M581 341l116 309M697 326l116 324M813 311l116 339M929 296l116 354"/>
    </g>
    <g class="workbenches" stroke="${p.ink}" stroke-width="5">
      <rect x="75" y="535" width="258" height="86" fill="#7a5b43"/>
      <path d="M94 621v70M312 621v70"/>
      <rect x="70" y="502" width="90" height="34" fill="#3b4a49"/>
      <rect x="187" y="492" width="129" height="44" fill="#4c5957"/>
      <rect x="1068" y="555" width="91" height="91" fill="#695647"/>
    </g>
    <g class="yard-clutter">
      <ellipse cx="378" cy="627" rx="75" ry="29" fill="none" stroke="#5c4a3c" stroke-width="8"/>
      <path d="M331 607c26 28 67 27 95 0M330 645c28-24 68-24 96 0" fill="none" stroke="#5c4a3c" stroke-width="5"/>
      <rect x="20" y="640" width="200" height="80" fill="#6d5845"/>
      <path d="M20 666h200M88 640v80M154 640v80" stroke="#44362d" stroke-width="4"/>
    </g>
  `;
}

function environment(scene: SceneDefinition): string {
  if (scene.layout === "market") return marketEnvironment(scene);
  if (scene.layout === "warehouse") return warehouseEnvironment(scene);
  if (scene.layout === "pier") return pierEnvironment(scene);
  if (scene.layout === "night") return nightEnvironment(scene);
  return shipyardEnvironment(scene);
}

function objectMarkup(
  object: SceneObject,
  targetIds: ReadonlySet<string>,
  foundIds: ReadonlySet<string>
): string {
  const isTarget = targetIds.has(object.id);
  const isFound = foundIds.has(object.id);
  const classes = [
    "scene-object",
    isTarget ? "is-target" : "is-decoy",
    isFound ? "is-found" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <g
      class="${classes}"
      data-object-id="${object.id}"
      transform="translate(${object.x} ${object.y}) rotate(${object.rotation}) scale(${object.scale})"
      role="button"
      tabindex="0"
      aria-label="장면 속 물건"
      style="color:${object.color}"
    >
      <circle class="hit-area" cx="0" cy="0" r="36" fill="transparent"/>
      <use href="#obj-${object.kind}" x="-30" y="-30" width="60" height="60"/>
      <circle class="found-ring" cx="0" cy="0" r="31" fill="none"/>
      <path class="found-check" d="M-12 1-3 10 15-11" fill="none"/>
    </g>
  `;
}

export function renderSceneSvg(
  scene: SceneDefinition,
  targetIds: ReadonlySet<string>,
  foundIds: ReadonlySet<string>
): string {
  return `
    <svg
      id="hidden-scene"
      class="hidden-scene"
      viewBox="0 0 1200 720"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="${scene.name} 숨은그림찾기 장면"
    >
      <defs>
        <linearGradient id="sky-${scene.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${scene.palette.skyA}"/>
          <stop offset="1" stop-color="${scene.palette.skyB}"/>
        </linearGradient>
        <linearGradient id="water-${scene.id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${scene.palette.waterA}"/>
          <stop offset="1" stop-color="${scene.palette.waterB}"/>
        </linearGradient>
        <filter id="soft-shadow-${scene.id}" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0b171a" flood-opacity=".35"/>
        </filter>
        ${objectSymbols()}
      </defs>
      <g class="environment">${environment(scene)}</g>
      <g class="object-layer" filter="url(#soft-shadow-${scene.id})">
        ${scene.objects.map((object) => objectMarkup(object, targetIds, foundIds)).join("")}
      </g>
      <g class="feedback-layer" id="feedback-layer"></g>
    </svg>
  `;
}

export function objectLabel(scene: SceneDefinition, id: string): string {
  return scene.objects.find((object) => object.id === id)?.label ?? "분실물";
}

export function objectKind(scene: SceneDefinition, id: string): ObjectKind | null {
  return scene.objects.find((object) => object.id === id)?.kind ?? null;
}
