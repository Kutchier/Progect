'use strict';

// ─── Enemy Portraits (PS1 low-poly grim dark style) ──────────────────────────
const ENEMY_SVG = {

goblin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#040606"/>
<!-- PS1 goblin: angular low-poly -->
<polygon points="40,88 14,90 66,90" fill="#020404"/>
<polygon points="20,90 18,52 28,34 40,30 52,34 62,52 60,90" fill="#0e1a08"/>
<polygon points="18,42 4,18 24,36" fill="#122008"/>
<polygon points="20,42 8,22 23,37" fill="#0c1606"/>
<polygon points="62,42 76,18 56,36" fill="#122008"/>
<polygon points="60,42 72,22 57,37" fill="#0c1606"/>
<polygon points="18,34 28,16 52,16 62,34 58,52 22,52" fill="#162a0e"/>
<polygon points="24,34 32,20 48,20 56,34 52,46 28,46" fill="#1c3410"/>
<rect x="22" y="28" width="14" height="10" fill="#060808"/>
<rect x="24" y="29" width="10" height="8" fill="#cc4400"/>
<rect x="27" y="30" width="5" height="6" fill="#ff8000"/>
<rect x="44" y="28" width="14" height="10" fill="#060808"/>
<rect x="46" y="29" width="10" height="8" fill="#cc4400"/>
<rect x="49" y="30" width="5" height="6" fill="#ff8000"/>
<polygon points="37,38 43,38 40,43" fill="#0e1806"/>
<rect x="24" y="44" width="32" height="9" fill="#050606"/>
<rect x="25" y="44" width="5" height="7" fill="#b8b840"/>
<rect x="32" y="44" width="5" height="8" fill="#c8c850"/>
<rect x="39" y="44" width="5" height="8" fill="#c8c850"/>
<rect x="46" y="44" width="5" height="7" fill="#b8b840"/>
<polygon points="16,54 4,54 2,76 14,76 22,66" fill="#0e1a08"/>
<polygon points="64,54 76,54 78,76 66,76 58,66" fill="#0e1a08"/>
<polygon points="2,74 0,82 4,84 8,76" fill="#122008"/>
<polygon points="78,74 80,82 76,84 72,76" fill="#122008"/>
<rect x="24" y="72" width="14" height="16" fill="#0e1a08"/>
<rect x="42" y="72" width="14" height="16" fill="#0e1a08"/>
<rect x="22" y="84" width="18" height="6" fill="#0a1406"/>
<rect x="40" y="84" width="18" height="6" fill="#0a1406"/>
</svg>`,

skeleton: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04040a"/>
<!-- PS1 skeleton: angular bone polygons -->
<line x1="32" y1="68" x2="28" y2="88" stroke="#8a8870" stroke-width="3" stroke-linecap="square"/>
<line x1="40" y1="68" x2="40" y2="88" stroke="#8a8870" stroke-width="3" stroke-linecap="square"/>
<line x1="48" y1="68" x2="52" y2="88" stroke="#8a8870" stroke-width="3" stroke-linecap="square"/>
<polygon points="24,58 56,58 54,72 26,72" fill="#9a9880"/>
<rect x="28" y="62" width="5" height="9" fill="#d8d8c0"/>
<rect x="35" y="62" width="5" height="10" fill="#e8e8d0"/>
<rect x="42" y="62" width="5" height="10" fill="#e8e8d0"/>
<rect x="49" y="62" width="5" height="9" fill="#d8d8c0"/>
<polygon points="14,44 18,14 40,10 62,14 66,44 60,62 20,62" fill="#b8b8a0"/>
<polygon points="18,44 22,18 40,14 58,18 62,44 56,58 24,58" fill="#c8c8b0"/>
<line x1="34" y1="18" x2="36" y2="40" stroke="#a0a088" stroke-width="1.5"/>
<line x1="50" y1="20" x2="48" y2="42" stroke="#a0a088" stroke-width="1.5"/>
<line x1="22" y1="44" x2="26" y2="52" stroke="#a0a088" stroke-width="1.5"/>
<line x1="58" y1="46" x2="54" y2="54" stroke="#a0a088" stroke-width="1.5"/>
<rect x="18" y="30" width="20" height="20" fill="#080608"/>
<rect x="42" y="30" width="20" height="20" fill="#080608"/>
<rect x="20" y="32" width="16" height="16" fill="#aa1000" opacity="0.5"/>
<rect x="44" y="32" width="16" height="16" fill="#aa1000" opacity="0.5"/>
<rect x="24" y="34" width="8" height="12" fill="#dd2200"/>
<rect x="48" y="34" width="8" height="12" fill="#dd2200"/>
<rect x="26" y="36" width="4" height="8" fill="#ff4422"/>
<rect x="50" y="36" width="4" height="8" fill="#ff4422"/>
<polygon points="36,50 40,56 44,50 43,46 37,46" fill="#080608"/>
<rect x="28" y="56" width="5" height="7" fill="#c8c8b0"/>
<rect x="35" y="56" width="5" height="8" fill="#d8d8c0"/>
<rect x="42" y="56" width="5" height="8" fill="#d8d8c0"/>
<rect x="49" y="56" width="5" height="7" fill="#c8c8b0"/>
</svg>`,

zombie: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#050708"/>
<polygon points="24,88 22,60 26,48 28,90" fill="#1a1408"/>
<polygon points="52,88 54,60 58,48 56,90" fill="#1a1408"/>
<polygon points="22,60 26,48 54,48 58,60" fill="#1e2010"/>
<polygon points="26,48 30,32 50,32 54,48 42,50 38,50" fill="#1a2208"/>
<polygon points="22,38 24,14 40,10 56,14 58,38 50,46 30,46" fill="#2a3018"/>
<polygon points="24,18 28,12 40,10 52,12 56,18 52,24 28,24" fill="#303818"/>
<polygon points="54,44 66,22 72,18 68,30 58,50" fill="#2a3018"/>
<polygon points="66,22 76,10 78,16 72,26 70,22" fill="#242c14"/>
<polygon points="26,46 18,58 14,70 20,68 24,56 28,52" fill="#2a3018"/>
<rect x="28" y="26" width="10" height="10" fill="#040606"/>
<rect x="29" y="27" width="8" height="8" fill="#707058"/>
<rect x="31" y="29" width="4" height="4" fill="#a0a880"/>
<rect x="42" y="25" width="12" height="10" fill="#040606"/>
<rect x="43" y="26" width="10" height="8" fill="#880800"/>
<rect x="45" y="27" width="6" height="6" fill="#cc1000"/>
<rect x="47" y="28" width="3" height="4" fill="#ff3010"/>
<rect x="33" y="36" width="14" height="4" fill="#030505"/>
<rect x="34" y="37" width="4" height="3" fill="#601010"/>
<rect x="24" y="62" width="12" height="26" fill="#161808"/>
<rect x="44" y="62" width="12" height="26" fill="#161808"/>
<rect x="22" y="84" width="16" height="6" fill="#0e1006"/>
<rect x="42" y="84" width="16" height="6" fill="#0e1006"/>
</svg>`,

dark_mage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04040c"/>
<polygon points="16,90 14,52 20,36 60,36 66,52 64,90" fill="#0c0820"/>
<polygon points="20,36 18,52 14,90 0,90 0,70 8,52 14,36" fill="#0a0618"/>
<polygon points="60,36 62,52 66,90 80,90 80,70 72,52 66,36" fill="#0a0618"/>
<polygon points="18,36 22,14 30,6 40,4 50,6 58,14 62,36 52,40 28,40" fill="#0e0a1e"/>
<polygon points="22,36 26,16 32,8 40,6 48,8 54,16 58,36 50,38 30,38" fill="#100c22"/>
<polygon points="28,28 30,18 40,16 50,18 52,28 48,36 32,36" fill="#0a0818"/>
<rect x="28" y="26" width="12" height="8" fill="#040210"/>
<rect x="29" y="27" width="10" height="6" fill="#5500aa"/>
<rect x="31" y="28" width="6" height="4" fill="#9922ff"/>
<rect x="32" y="29" width="4" height="2" fill="#cc88ff"/>
<rect x="40" y="26" width="12" height="8" fill="#040210"/>
<rect x="41" y="27" width="10" height="6" fill="#5500aa"/>
<rect x="43" y="28" width="6" height="4" fill="#9922ff"/>
<rect x="44" y="29" width="4" height="2" fill="#cc88ff"/>
<rect x="62" y="10" width="4" height="60" fill="#2a1840"/>
<polygon points="66,8 76,14 76,22 66,28 56,22 56,14" fill="#0c0820"/>
<polygon points="66,10 74,15 74,21 66,26 58,21 58,15" fill="#3300aa"/>
<polygon points="66,12 72,16 72,20 66,24 60,20 60,16" fill="#6622ff"/>
<rect x="63" y="13" width="6" height="8" fill="#9944ff"/>
<rect x="36" y="46" width="8" height="3" fill="#220044"/>
<rect x="36" y="54" width="8" height="3" fill="#220044"/>
<rect x="36" y="62" width="8" height="3" fill="#220044"/>
</svg>`,

troll: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#050608"/>
<polygon points="0,90 2,52 14,34 26,28 54,28 66,34 78,52 80,90" fill="#202818"/>
<polygon points="14,34 22,20 40,16 58,20 66,34 60,58 20,58" fill="#262e1a"/>
<polygon points="10,38 14,12 24,6 40,4 56,6 66,12 70,38 60,50 20,50" fill="#2c3420"/>
<polygon points="14,26 20,18 40,16 60,18 66,26 60,30 20,30" fill="#1e2816"/>
<rect x="18" y="28" width="12" height="10" fill="#030406"/>
<rect x="19" y="29" width="10" height="8" fill="#880000"/>
<rect x="21" y="30" width="6" height="6" fill="#cc1100"/>
<rect x="23" y="31" width="3" height="4" fill="#ff2200"/>
<rect x="34" y="22" width="12" height="10" fill="#030406"/>
<rect x="35" y="23" width="10" height="8" fill="#880000"/>
<rect x="37" y="24" width="6" height="6" fill="#cc1100"/>
<rect x="39" y="25" width="3" height="4" fill="#ff2200"/>
<rect x="50" y="28" width="12" height="10" fill="#030406"/>
<rect x="51" y="29" width="10" height="8" fill="#880000"/>
<rect x="53" y="30" width="6" height="6" fill="#cc1100"/>
<rect x="55" y="31" width="3" height="4" fill="#ff2200"/>
<polygon points="28,44 30,50 40,52 50,50 52,44 48,40 32,40" fill="#1a2010"/>
<rect x="30" y="44" width="5" height="6" fill="#060808"/>
<rect x="37" y="45" width="6" height="7" fill="#060808"/>
<rect x="45" y="44" width="5" height="6" fill="#060808"/>
<polygon points="14,34 2,44 0,60 6,60 12,46 18,40" fill="#262e1a"/>
<polygon points="66,34 78,44 80,60 74,60 68,46 62,40" fill="#262e1a"/>
<rect x="16" y="58" width="20" height="32" fill="#202818"/>
<rect x="44" y="58" width="20" height="32" fill="#202818"/>
<rect x="12" y="82" width="28" height="8" fill="#181e10"/>
<rect x="40" y="82" width="28" height="8" fill="#181e10"/>
</svg>`,

vampire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#05040a"/>
<polygon points="0,90 4,52 16,32 24,44 20,58 10,80 0,90" fill="#0c0818"/>
<polygon points="80,90 76,52 64,32 56,44 60,58 70,80 80,90" fill="#0c0818"/>
<polygon points="16,90 14,56 18,40 40,32 62,40 66,56 64,90" fill="#10081e"/>
<polygon points="20,44 24,36 40,32 56,36 60,44 52,50 28,50" fill="#0a0616"/>
<polygon points="22,44 24,18 30,10 40,8 50,10 56,18 58,44 52,56 28,56" fill="#d8d0e8"/>
<polygon points="26,20 28,12 40,10 52,12 54,20 52,28 28,28" fill="#e0d8f0"/>
<polygon points="22,20 24,10 30,8 34,16 30,22 22,20" fill="#0c0818"/>
<polygon points="58,20 56,10 50,8 46,16 50,22 58,20" fill="#0c0818"/>
<polygon points="36,16 38,8 40,6 42,8 44,16 40,18" fill="#100a20"/>
<rect x="25" y="28" width="14" height="10" fill="#060408"/>
<rect x="26" y="29" width="12" height="8" fill="#880000"/>
<rect x="28" y="30" width="8" height="6" fill="#cc0000"/>
<rect x="30" y="31" width="4" height="4" fill="#ff2222"/>
<rect x="31" y="32" width="2" height="2" fill="#ff9999"/>
<rect x="41" y="28" width="14" height="10" fill="#060408"/>
<rect x="42" y="29" width="12" height="8" fill="#880000"/>
<rect x="44" y="30" width="8" height="6" fill="#cc0000"/>
<rect x="46" y="31" width="4" height="4" fill="#ff2222"/>
<rect x="47" y="32" width="2" height="2" fill="#ff9999"/>
<polygon points="34,46 32,54 36,46" fill="#f0ecf8"/>
<polygon points="44,46 42,54 46,46" fill="#f0ecf8"/>
<polygon points="38,36 40,44 42,36 40,34" fill="#c0b8d0"/>
</svg>`,

lich: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04040e"/>
<polygon points="14,90 12,52 18,36 62,36 68,52 66,90" fill="#0e0c28"/>
<polygon points="18,36 14,52 12,90 0,90 0,76 6,58 12,40" fill="#0c0a20"/>
<polygon points="62,36 66,52 68,90 80,90 80,76 74,58 68,40" fill="#0c0a20"/>
<polygon points="24,58 56,58 54,72 26,72" fill="#9a9880"/>
<rect x="28" y="62" width="5" height="9" fill="#d8d8c0"/>
<rect x="35" y="62" width="5" height="10" fill="#e8e8d0"/>
<rect x="42" y="62" width="5" height="10" fill="#e8e8d0"/>
<rect x="49" y="62" width="5" height="9" fill="#d8d8c0"/>
<polygon points="18,44 22,14 40,10 58,14 62,44 56,58 24,58" fill="#b8b8a0"/>
<polygon points="22,44 26,18 40,14 54,18 58,44 52,56 28,56" fill="#c8c8b0"/>
<polygon points="20,18 16,8 22,14 28,6 32,14 40,4 48,14 52,6 58,14 64,8 60,18" fill="#5a3808"/>
<polygon points="22,18 18,10 24,14 30,8 34,14 40,6 46,14 50,8 56,14 62,10 58,18" fill="#786010"/>
<rect x="20" y="16" width="40" height="5" fill="#5a3808"/>
<rect x="22" y="17" width="36" height="3" fill="#786010"/>
<rect x="20" y="30" width="18" height="16" fill="#080610"/>
<rect x="22" y="32" width="14" height="12" fill="#5500aa"/>
<rect x="24" y="34" width="10" height="8" fill="#9933ff"/>
<rect x="26" y="36" width="6" height="4" fill="#cc99ff"/>
<rect x="42" y="30" width="18" height="16" fill="#080610"/>
<rect x="44" y="32" width="14" height="12" fill="#5500aa"/>
<rect x="46" y="34" width="10" height="8" fill="#9933ff"/>
<rect x="48" y="36" width="6" height="4" fill="#cc99ff"/>
<polygon points="30,48 32,56 40,58 48,56 50,48 46,44 34,44" fill="#080610"/>
<rect x="30" y="48" width="5" height="7" fill="#c8c8b0"/>
<rect x="37" y="48" width="6" height="8" fill="#d8d8c0"/>
<rect x="45" y="48" width="5" height="7" fill="#c8c8b0"/>
</svg>`,

demon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#06030a"/>
<polygon points="14,90 12,52 18,34 62,34 68,52 66,90" fill="#200810"/>
<polygon points="18,34 14,52 10,90 0,90 2,68 8,50 14,38" fill="#1a0608"/>
<polygon points="62,34 66,52 70,90 80,90 78,68 72,50 66,38" fill="#1a0608"/>
<polygon points="14,38 0,20 4,8 8,20 14,30 18,38" fill="#120408"/>
<polygon points="14,32 2,16 4,8 10,18 14,28" fill="#200810"/>
<polygon points="66,38 80,20 76,8 72,20 66,30 62,38" fill="#120408"/>
<polygon points="66,32 78,16 76,8 70,18 66,28" fill="#200810"/>
<polygon points="18,38 20,12 30,4 40,2 50,4 60,12 62,38 54,48 26,48" fill="#280e18"/>
<polygon points="22,16 16,0 24,12 28,4 30,16" fill="#200810"/>
<polygon points="22,14 18,2 24,10 26,4 28,14" fill="#380e18"/>
<polygon points="58,16 64,0 56,12 52,4 50,16" fill="#200810"/>
<polygon points="58,14 62,2 56,10 54,4 52,14" fill="#380e18"/>
<polygon points="38,12 36,2 40,0 44,2 42,12" fill="#2a0c14"/>
<rect x="22" y="26" width="16" height="8" fill="#040208"/>
<rect x="23" y="27" width="14" height="6" fill="#884400"/>
<rect x="25" y="28" width="10" height="4" fill="#ff8800"/>
<rect x="28" y="28" width="4" height="4" fill="#1a0a08"/>
<rect x="42" y="26" width="16" height="8" fill="#040208"/>
<rect x="43" y="27" width="14" height="6" fill="#884400"/>
<rect x="45" y="28" width="10" height="4" fill="#ff8800"/>
<rect x="48" y="28" width="4" height="4" fill="#1a0a08"/>
<polygon points="30,40 34,46 40,48 46,46 50,40 46,36 34,36" fill="#080410"/>
<rect x="30" y="40" width="5" height="6" fill="#c8a880"/>
<rect x="37" y="41" width="6" height="7" fill="#d8b890"/>
<rect x="45" y="40" width="5" height="6" fill="#c8a880"/>
<rect x="16" y="62" width="18" height="28" fill="#200810"/>
<rect x="46" y="62" width="18" height="28" fill="#200810"/>
<polygon points="14,86 16,90 34,90 34,86 20,84" fill="#180608"/>
<polygon points="46,86 46,90 64,90 66,86 60,84" fill="#180608"/>
</svg>`,

dragon_boss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04060a"/>
<polygon points="0,90 0,40 10,20 40,10 70,20 80,40 80,90" fill="#0e1a10"/>
<polygon points="0,40 10,30 20,38 10,46" fill="#122014"/>
<polygon points="20,28 30,20 40,28 30,36" fill="#122014"/>
<polygon points="40,24 50,18 60,26 50,34" fill="#122014"/>
<polygon points="60,30 70,22 80,32 70,40" fill="#122014"/>
<polygon points="10,50 20,44 30,52 20,60" fill="#0e1c10"/>
<polygon points="30,46 40,40 50,48 40,56" fill="#0e1c10"/>
<polygon points="50,44 60,38 70,46 60,54" fill="#0e1c10"/>
<polygon points="10,20 14,6 20,2 50,2 60,8 70,20 64,36 50,44 20,44 14,36" fill="#16241a"/>
<polygon points="14,36 10,52 16,60 22,56 24,44 20,36" fill="#1a2820"/>
<polygon points="10,50 4,60 10,70 18,64 18,54" fill="#162018"/>
<rect x="12" y="52" width="6" height="4" fill="#060c08"/>
<rect x="13" y="53" width="4" height="3" fill="#0c1810"/>
<rect x="44" y="14" width="24" height="20" fill="#060c08"/>
<rect x="46" y="16" width="20" height="16" fill="#884400"/>
<rect x="48" y="18" width="16" height="12" fill="#cc6600"/>
<rect x="50" y="20" width="12" height="8" fill="#ff9900"/>
<rect x="52" y="22" width="8" height="4" fill="#ffcc00"/>
<rect x="54" y="16" width="4" height="20" fill="#020408"/>
<polygon points="12,42 14,50 18,42" fill="#d8d8c0"/>
<polygon points="18,42 20,52 24,42" fill="#e8e8d0"/>
<polygon points="24,42 26,50 30,42" fill="#d8d8c0"/>
<polygon points="20,6 12,0 14,10 20,14" fill="#0e1a10"/>
<polygon points="50,4 46,0 50,8 54,6" fill="#0e1a10"/>
<polygon points="58,8 56,0 60,4 62,10" fill="#0e1a10"/>
<polygon points="0,50 0,90 10,70 6,42" fill="#0a1410"/>
<polygon points="80,50 80,90 70,70 74,42" fill="#0a1410"/>
</svg>`,

spider_queen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04050a"/>
<line x1="22" y1="52" x2="2" y2="36" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="20" y1="58" x2="0" y2="54" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="22" y1="64" x2="4" y2="78" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="24" y1="70" x2="8" y2="88" stroke="#1c1228" stroke-width="2" stroke-linecap="square"/>
<line x1="58" y1="52" x2="78" y2="36" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="60" y1="58" x2="80" y2="54" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="58" y1="64" x2="76" y2="78" stroke="#1c1228" stroke-width="3" stroke-linecap="square"/>
<line x1="56" y1="70" x2="72" y2="88" stroke="#1c1228" stroke-width="2" stroke-linecap="square"/>
<polygon points="20,78 16,64 20,52 40,48 60,52 64,64 60,78 40,84" fill="#1e1530"/>
<polygon points="22,76 18,64 22,54 40,50 58,54 62,64 58,76 40,82" fill="#261c3a"/>
<polygon points="34,58 40,64 46,58 44,54 36,54" fill="#cc0000" opacity="0.8"/>
<polygon points="34,72 40,66 46,72 44,76 36,76" fill="#cc0000" opacity="0.6"/>
<polygon points="24,52 26,34 40,28 54,34 56,52 48,56 32,56" fill="#201840"/>
<polygon points="26,50 28,36 40,30 52,36 54,50 48,54 32,54" fill="#2a2050"/>
<polygon points="28,28 24,18 30,22 32,14 38,20 40,12 42,20 48,14 50,22 56,18 52,28" fill="#5a3808"/>
<polygon points="30,28 26,20 31,23 33,16 38,21 40,14 42,21 47,16 49,23 54,20 50,28" fill="#786010"/>
<polygon points="26,44 28,28 40,24 52,28 54,44 48,52 32,52" fill="#281e40"/>
<rect x="28" y="32" width="8" height="6" fill="#040208"/>
<rect x="29" y="33" width="6" height="4" fill="#cc0000"/>
<rect x="30" y="34" width="4" height="2" fill="#ff2200"/>
<rect x="44" y="32" width="8" height="6" fill="#040208"/>
<rect x="45" y="33" width="6" height="4" fill="#cc0000"/>
<rect x="46" y="34" width="4" height="2" fill="#ff2200"/>
<rect x="32" y="38" width="6" height="5" fill="#040208"/>
<rect x="33" y="39" width="4" height="3" fill="#cc0000"/>
<rect x="42" y="38" width="6" height="5" fill="#040208"/>
<rect x="43" y="39" width="4" height="3" fill="#cc0000"/>
<polygon points="34,46 32,54 36,46" fill="#c8c0d0"/>
<polygon points="44,46 42,54 46,46" fill="#c8c0d0"/>
</svg>`,

rat_swarm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#05060a"/>
<polygon points="4,42 6,34 14,30 22,34 22,42 16,46 8,46" fill="#241a08"/>
<polygon points="8,34 4,28 8,22 12,28 10,34" fill="#201608"/>
<rect x="4" y="32" width="4" height="3" fill="#040206"/>
<rect x="5" y="33" width="2" height="2" fill="#cc2200"/>
<line x1="8" y1="46" x2="0" y2="56" stroke="#201608" stroke-width="1.5" stroke-linecap="square"/>
<line x1="10" y1="44" x2="4" y2="52" stroke="#201608" stroke-width="1.5" stroke-linecap="square"/>
<polygon points="58,38 60,30 68,26 76,30 76,38 70,42 62,42" fill="#241a08"/>
<polygon points="62,30 58,24 62,18 66,24 64,30" fill="#201608"/>
<rect x="58" y="28" width="4" height="3" fill="#040206"/>
<rect x="59" y="29" width="2" height="2" fill="#cc2200"/>
<line x1="74" y1="40" x2="80" y2="50" stroke="#201608" stroke-width="1.5" stroke-linecap="square"/>
<line x1="72" y1="38" x2="78" y2="46" stroke="#201608" stroke-width="1.5" stroke-linecap="square"/>
<polygon points="20,72 22,56 30,48 40,44 50,48 58,56 60,72 50,78 30,78" fill="#382c14"/>
<polygon points="30,48 22,40 20,30 26,22 30,30 32,42 34,48" fill="#2c2010"/>
<polygon points="22,56 18,42 22,32 30,28 38,32 40,40 38,52 30,56" fill="#3c2e18"/>
<rect x="22" y="38" width="8" height="6" fill="#040206"/>
<rect x="23" y="39" width="6" height="4" fill="#aa1800"/>
<rect x="24" y="40" width="4" height="2" fill="#ee3000"/>
<line x1="50" y1="72" x2="68" y2="84" stroke="#2c2010" stroke-width="2" stroke-linecap="square"/>
<line x1="68" y1="84" x2="76" y2="80" stroke="#2c2010" stroke-width="1.5" stroke-linecap="square"/>
<polygon points="52,62 54,54 60,50 66,54 66,62 62,66 54,66" fill="#302418"/>
<polygon points="54,54 50,48 54,44 58,48 56,54" fill="#281c10"/>
<rect x="50" y="52" width="4" height="3" fill="#040206"/>
<rect x="51" y="53" width="2" height="2" fill="#cc2200"/>
</svg>`,

cave_bat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04050a"/>
<polygon points="40,40 30,28 12,24 4,32 8,44 20,48 30,44" fill="#1e1430"/>
<polygon points="30,28 20,18 8,20 4,30 8,40 16,44 26,40 30,34" fill="#160e24"/>
<polygon points="20,18 12,10 4,16 4,28 12,32 18,28 22,22" fill="#120c1e"/>
<polygon points="40,40 50,28 68,24 76,32 72,44 60,48 50,44" fill="#1e1430"/>
<polygon points="50,28 60,18 72,20 76,30 72,40 64,44 54,40 50,34" fill="#160e24"/>
<polygon points="60,18 68,10 76,16 76,28 68,32 62,28 58,22" fill="#120c1e"/>
<polygon points="30,44 32,30 40,26 48,30 50,44 46,56 34,56" fill="#241838"/>
<polygon points="30,36 32,20 40,16 48,20 50,36 46,44 34,44" fill="#2c1e40"/>
<polygon points="32,20 26,8 30,18" fill="#241838"/>
<polygon points="48,20 54,8 50,18" fill="#241838"/>
<rect x="30" y="28" width="10" height="8" fill="#040208"/>
<rect x="31" y="29" width="8" height="6" fill="#880000"/>
<rect x="32" y="30" width="6" height="4" fill="#cc1000"/>
<rect x="33" y="31" width="4" height="2" fill="#ff4422"/>
<rect x="40" y="28" width="10" height="8" fill="#040208"/>
<rect x="41" y="29" width="8" height="6" fill="#880000"/>
<rect x="42" y="30" width="6" height="4" fill="#cc1000"/>
<rect x="43" y="31" width="4" height="2" fill="#ff4422"/>
<line x1="34" y1="56" x2="32" y2="70" stroke="#1c1030" stroke-width="2" stroke-linecap="square"/>
<line x1="46" y1="56" x2="48" y2="70" stroke="#1c1030" stroke-width="2" stroke-linecap="square"/>
<polygon points="28,68 32,70 34,66 36,70 32,72 26,70" fill="#1c1030"/>
<polygon points="44,66 48,70 50,66 52,70 48,72 42,70" fill="#1c1030"/>
</svg>`,

kobold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#050608"/>
<polygon points="46,74 60,80 70,84 68,88 60,84 50,78 44,80" fill="#1a2010"/>
<rect x="24" y="66" width="12" height="24" fill="#182010"/>
<rect x="44" y="66" width="12" height="24" fill="#182010"/>
<rect x="20" y="84" width="18" height="6" fill="#101808"/>
<rect x="42" y="84" width="18" height="6" fill="#101808"/>
<polygon points="18,68 16,50 22,36 58,36 64,50 62,68" fill="#1e2810"/>
<polygon points="22,36 14,28 10,36 12,48 18,52 22,46" fill="#1a2410"/>
<polygon points="58,36 66,28 70,36 68,48 62,52 58,46" fill="#1a2410"/>
<polygon points="10,34 6,30 8,38 12,40" fill="#162010"/>
<polygon points="70,34 74,30 72,38 68,40" fill="#162010"/>
<polygon points="20,38 22,14 30,6 40,4 50,6 58,14 60,38 52,48 28,48" fill="#22300e"/>
<polygon points="32,40 34,50 40,54 46,50 48,40 44,36 36,36" fill="#1c2a0c"/>
<polygon points="28,20 32,12 40,10 48,12 52,20 48,26 32,26" fill="#283612"/>
<polygon points="28,14 22,4 26,12" fill="#2a2208"/>
<polygon points="52,14 58,4 54,12" fill="#2a2208"/>
<rect x="26" y="24" width="12" height="8" fill="#040604"/>
<rect x="27" y="25" width="10" height="6" fill="#886600"/>
<rect x="28" y="26" width="8" height="4" fill="#ccaa00"/>
<rect x="30" y="26" width="4" height="4" fill="#ffdd22"/>
<rect x="42" y="24" width="12" height="8" fill="#040604"/>
<rect x="43" y="25" width="10" height="6" fill="#886600"/>
<rect x="44" y="26" width="8" height="4" fill="#ccaa00"/>
<rect x="46" y="26" width="4" height="4" fill="#ffdd22"/>
<rect x="32" y="44" width="5" height="6" fill="#040604"/>
<rect x="38" y="45" width="4" height="7" fill="#040604"/>
<rect x="43" y="44" width="5" height="6" fill="#040604"/>
</svg>`,

werewolf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#060507"/>
<polygon points="18,76 20,60 26,56 30,60 28,76 22,80" fill="#281e20"/>
<polygon points="52,76 50,60 56,56 60,60 62,76 58,80" fill="#281e20"/>
<polygon points="14,76 18,80 22,88 16,90 12,82" fill="#201618"/>
<polygon points="66,76 62,80 58,88 64,90 68,82" fill="#201618"/>
<polygon points="16,60 14,38 20,24 40,18 60,24 66,38 64,60 52,66 28,66" fill="#2c2228"/>
<polygon points="20,40 22,30 30,26 40,24 50,26 58,30 60,40 52,46 28,46" fill="#342830"/>
<polygon points="14,38 16,16 24,8 40,6 56,8 64,16 66,38 58,50 22,50" fill="#302428"/>
<polygon points="20,14 14,2 22,10" fill="#281e22"/>
<polygon points="22,12 16,2 23,9" fill="#3a2c30"/>
<polygon points="60,14 66,2 58,10" fill="#281e22"/>
<polygon points="58,12 64,2 57,9" fill="#3a2c30"/>
<polygon points="28,40 26,52 30,60 40,64 50,60 54,52 52,40 46,36 34,36" fill="#261c22"/>
<polygon points="36,42 34,50 38,56 40,60 42,56 46,50 44,42" fill="#2c2228"/>
<polygon points="36,42 40,46 44,42 42,38 38,38" fill="#0e0810"/>
<rect x="22" y="28" width="14" height="10" fill="#060406"/>
<rect x="23" y="29" width="12" height="8" fill="#884400"/>
<rect x="24" y="30" width="10" height="6" fill="#cc8800"/>
<rect x="26" y="31" width="6" height="4" fill="#ffaa00"/>
<rect x="29" y="31" width="2" height="3" fill="#0e0a08"/>
<rect x="44" y="28" width="14" height="10" fill="#060406"/>
<rect x="45" y="29" width="12" height="8" fill="#884400"/>
<rect x="46" y="30" width="10" height="6" fill="#cc8800"/>
<rect x="48" y="31" width="6" height="4" fill="#ffaa00"/>
<rect x="51" y="31" width="2" height="3" fill="#0e0a08"/>
<polygon points="14,38 6,32 4,38 8,44 14,44" fill="#281e22"/>
<polygon points="6,30 4,36 2,32 4,28" fill="#2c2228"/>
<polygon points="66,38 74,32 76,38 72,44 66,44" fill="#281e22"/>
<polygon points="74,30 76,36 78,32 76,28" fill="#2c2228"/>
<polygon points="32,54 30,62 34,54" fill="#d8d0c0"/>
<polygon points="38,56 36,64 40,56" fill="#e0d8c8"/>
<polygon points="44,56 42,64 46,56" fill="#e0d8c8"/>
<polygon points="50,54 48,62 52,54" fill="#d8d0c0"/>
</svg>`,

giant_spider: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04050a"/>
<line x1="26" y1="52" x2="4" y2="38" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="24" y1="58" x2="2" y2="58" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="26" y1="64" x2="6" y2="76" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="28" y1="70" x2="10" y2="88" stroke="#1a1228" stroke-width="2" stroke-linecap="square"/>
<line x1="54" y1="52" x2="76" y2="38" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="56" y1="58" x2="78" y2="58" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="54" y1="64" x2="74" y2="76" stroke="#1a1228" stroke-width="3" stroke-linecap="square"/>
<line x1="52" y1="70" x2="70" y2="88" stroke="#1a1228" stroke-width="2" stroke-linecap="square"/>
<polygon points="20,84 18,68 22,54 40,48 58,54 62,68 60,84 40,88" fill="#1e1630"/>
<polygon points="22,82 20,68 24,56 40,50 56,56 60,68 58,82 40,86" fill="#281e3c"/>
<polygon points="34,60 40,66 46,60 44,56 36,56" fill="#cc0000" opacity="0.7"/>
<polygon points="34,74 40,68 46,74 44,78 36,78" fill="#cc0000" opacity="0.5"/>
<polygon points="24,54 26,36 40,30 54,36 56,54 48,60 32,60" fill="#201840"/>
<polygon points="28,50 30,32 40,28 50,32 52,50 46,56 34,56" fill="#281e48"/>
<rect x="28" y="34" width="8" height="6" fill="#040208"/>
<rect x="29" y="35" width="6" height="4" fill="#cc0000"/>
<rect x="30" y="36" width="4" height="2" fill="#ff3300"/>
<rect x="44" y="34" width="8" height="6" fill="#040208"/>
<rect x="45" y="35" width="6" height="4" fill="#cc0000"/>
<rect x="46" y="36" width="4" height="2" fill="#ff3300"/>
<rect x="30" y="40" width="6" height="5" fill="#040208"/>
<rect x="31" y="41" width="4" height="3" fill="#cc0000"/>
<rect x="44" y="40" width="6" height="5" fill="#040208"/>
<rect x="45" y="41" width="4" height="3" fill="#cc0000"/>
<rect x="36" y="36" width="8" height="6" fill="#040208"/>
<rect x="37" y="37" width="6" height="4" fill="#aa0000"/>
<rect x="38" y="38" width="4" height="2" fill="#ee2200"/>
<polygon points="34,48 32,56 36,48" fill="#c0b8d0"/>
<polygon points="44,48 42,56 46,48" fill="#c0b8d0"/>
</svg>`,

shadow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#03030a"/>
<polygon points="30,88 20,72 16,52 22,32 40,24 58,32 64,52 60,72 50,88" fill="#0a0620" opacity="0.7"/>
<polygon points="32,86 22,70 18,52 24,34 40,26 56,34 62,52 58,70 48,86" fill="#0e082a" opacity="0.5"/>
<polygon points="20,72 10,80 14,86 22,80" fill="#080618" opacity="0.6"/>
<polygon points="60,72 70,80 66,86 58,80" fill="#080618" opacity="0.6"/>
<polygon points="24,34 14,24 12,30 18,36 22,40" fill="#080618" opacity="0.5"/>
<polygon points="56,34 66,24 68,30 62,36 58,40" fill="#080618" opacity="0.5"/>
<polygon points="24,50 26,28 40,22 54,28 56,50 50,60 30,60" fill="#0c0824" opacity="0.6"/>
<rect x="26" y="36" width="14" height="10" fill="#040210"/>
<rect x="27" y="37" width="12" height="8" fill="#440088"/>
<rect x="28" y="38" width="10" height="6" fill="#7722cc"/>
<rect x="29" y="39" width="8" height="4" fill="#9944ff"/>
<rect x="31" y="40" width="4" height="2" fill="#cc88ff"/>
<rect x="40" y="36" width="14" height="10" fill="#040210"/>
<rect x="41" y="37" width="12" height="8" fill="#440088"/>
<rect x="42" y="38" width="10" height="6" fill="#7722cc"/>
<rect x="43" y="39" width="8" height="4" fill="#9944ff"/>
<rect x="45" y="40" width="4" height="2" fill="#cc88ff"/>
<polygon points="30,80 26,90 34,86 30,80" fill="#0a0620" opacity="0.5"/>
<polygon points="40,82 38,90 42,90 44,84" fill="#0a0620" opacity="0.4"/>
<polygon points="50,80 48,88 54,86 52,80" fill="#0a0620" opacity="0.5"/>
</svg>`,

death_knight: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04050a"/>
<rect x="20" y="66" width="16" height="24" fill="#1c202c"/>
<rect x="44" y="66" width="16" height="24" fill="#1c202c"/>
<rect x="18" y="84" width="20" height="6" fill="#141828"/>
<rect x="42" y="84" width="20" height="6" fill="#141828"/>
<polygon points="18,86 20,90 38,90 38,86 24,84" fill="#0e1018"/>
<polygon points="42,86 42,90 60,90 62,86 56,84" fill="#0e1018"/>
<polygon points="14,68 10,48 14,32 66,32 70,48 66,68" fill="#20243a"/>
<polygon points="16,66 12,48 16,34 64,34 68,48 64,66" fill="#282c40"/>
<polygon points="10,34 2,28 0,38 4,48 10,52 14,44 14,36" fill="#1c2030"/>
<polygon points="70,34 78,28 80,38 76,48 70,52 66,44 66,36" fill="#1c2030"/>
<rect x="34" y="38" width="12" height="3" fill="#141828"/>
<rect x="34" y="46" width="12" height="3" fill="#141828"/>
<rect x="34" y="54" width="12" height="3" fill="#141828"/>
<rect x="39" y="34" width="2" height="28" fill="#141828"/>
<polygon points="14,36 16,10 24,4 40,2 56,4 64,10 66,36 58,44 22,44" fill="#1c2030"/>
<polygon points="16,34 18,12 26,6 40,4 54,6 62,12 64,34 58,42 22,42" fill="#242838"/>
<rect x="18" y="28" width="44" height="10" fill="#080c10"/>
<rect x="20" y="29" width="40" height="8" fill="#003c14"/>
<rect x="22" y="30" width="36" height="6" fill="#00aa44"/>
<rect x="24" y="31" width="32" height="4" fill="#22ee66"/>
<rect x="26" y="32" width="28" height="2" fill="#88ffaa"/>
<polygon points="28,4 24,0 30,2 32,0 34,4" fill="#1c2030"/>
<polygon points="40,2 38,0 40,0 42,0 40,2" fill="#282c40"/>
<polygon points="52,4 48,0 50,2 56,0 52,4" fill="#1c2030"/>
<rect x="66" y="40" width="5" height="40" fill="#2a3040"/>
<rect x="67" y="40" width="3" height="38" fill="#4a5060"/>
<rect x="60" y="56" width="18" height="4" fill="#383c50"/>
<polygon points="68,38 67,42 69,42" fill="#8090a0"/>
</svg>`,

golem: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#050508"/>
<rect x="18" y="66" width="18" height="24" fill="#2e2a34"/>
<rect x="44" y="66" width="18" height="24" fill="#2e2a34"/>
<rect x="14" y="82" width="26" height="8" fill="#26222e"/>
<rect x="40" y="82" width="26" height="8" fill="#26222e"/>
<rect x="10" y="34" width="60" height="36" fill="#363040"/>
<rect x="12" y="36" width="56" height="32" fill="#3c3644"/>
<polygon points="26,38 24,50 28,50 30,38" fill="#26222e" opacity="0.6"/>
<polygon points="50,36 52,52 54,48 52,36" fill="#26222e" opacity="0.5"/>
<polygon points="38,36 36,56 40,60 42,56 40,36" fill="#26222e" opacity="0.5"/>
<rect x="0" y="34" width="12" height="36" fill="#302c38"/>
<rect x="68" y="34" width="12" height="36" fill="#302c38"/>
<rect x="0" y="66" width="14" height="10" fill="#2a2634"/>
<rect x="66" y="66" width="14" height="10" fill="#2a2634"/>
<polygon points="0,68 0,78 6,80 12,76 12,68" fill="#242030"/>
<polygon points="68,68 68,76 74,80 80,78 80,68" fill="#242030"/>
<rect x="18" y="6" width="44" height="32" fill="#3a3444"/>
<rect x="20" y="8" width="40" height="28" fill="#403c4c"/>
<rect x="28" y="12" width="6" height="10" fill="#302c3c"/>
<rect x="46" y="12" width="6" height="10" fill="#302c3c"/>
<rect x="24" y="16" width="14" height="8" fill="#0c0a10"/>
<rect x="42" y="16" width="14" height="8" fill="#0c0a10"/>
<rect x="25" y="17" width="12" height="6" fill="#883300"/>
<rect x="26" y="18" width="10" height="4" fill="#cc5500"/>
<rect x="27" y="19" width="8" height="2" fill="#ff8800"/>
<rect x="43" y="17" width="12" height="6" fill="#883300"/>
<rect x="44" y="18" width="10" height="4" fill="#cc5500"/>
<rect x="45" y="19" width="8" height="2" fill="#ff8800"/>
<rect x="26" y="28" width="28" height="6" fill="#0c0a10"/>
<rect x="28" y="29" width="4" height="4" fill="#242030"/>
<rect x="34" y="29" width="4" height="4" fill="#242030"/>
<rect x="40" y="29" width="4" height="4" fill="#242030"/>
<rect x="46" y="29" width="4" height="4" fill="#242030"/>
</svg>`,

harpy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#05060a"/>
<polygon points="28,44 2,22 4,10 10,20 14,32 20,40 26,46" fill="#241e18"/>
<polygon points="28,48 0,36 0,50 8,52 18,50 24,50" fill="#1e1a14"/>
<polygon points="14,32 4,16 8,10 12,22 16,30" fill="#1a1610"/>
<polygon points="52,44 78,22 76,10 70,20 66,32 60,40 54,46" fill="#241e18"/>
<polygon points="52,48 80,36 80,50 72,52 62,50 56,50" fill="#1e1a14"/>
<polygon points="66,32 76,16 72,10 68,22 64,30" fill="#1a1610"/>
<polygon points="28,80 26,58 30,44 50,44 54,58 52,80" fill="#2a2030"/>
<polygon points="30,80 26,90 34,84 30,80" fill="#241c28"/>
<polygon points="40,82 38,90 42,90 40,82" fill="#241c28"/>
<polygon points="50,80 54,90 46,84 50,80" fill="#241c28"/>
<polygon points="28,82 24,86 26,90 30,88 30,82" fill="#201820"/>
<polygon points="32,84 28,90 32,90 34,88" fill="#1c1418"/>
<polygon points="48,82 52,86 50,90 46,88 50,82" fill="#201820"/>
<polygon points="48,84 52,90 48,90 46,88" fill="#1c1418"/>
<polygon points="26,46 28,22 34,14 40,12 46,14 52,22 54,46 48,52 32,52" fill="#2a2430"/>
<polygon points="32,22 28,12 32,18 34,10 36,18 40,8 44,18 46,10 48,18 52,12 48,22" fill="#1a1420"/>
<rect x="28" y="30" width="12" height="8" fill="#040408"/>
<rect x="29" y="31" width="10" height="6" fill="#886600"/>
<rect x="30" y="32" width="8" height="4" fill="#ddaa00"/>
<rect x="31" y="33" width="6" height="2" fill="#ffcc22"/>
<rect x="33" y="33" width="2" height="2" fill="#1a1408"/>
<rect x="40" y="30" width="12" height="8" fill="#040408"/>
<rect x="41" y="31" width="10" height="6" fill="#886600"/>
<rect x="42" y="32" width="8" height="4" fill="#ddaa00"/>
<rect x="43" y="33" width="6" height="2" fill="#ffcc22"/>
<rect x="45" y="33" width="2" height="2" fill="#1a1408"/>
<polygon points="36,40 40,46 44,40 42,38 38,38" fill="#aa8800"/>
<polygon points="37,40 40,44 43,40 42,38 38,38" fill="#ccaa00"/>
</svg>`,

witch: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04040c"/>
<polygon points="14,90 12,56 20,40 60,40 68,56 66,90" fill="#1c1038"/>
<polygon points="20,40 14,56 10,90 0,90 0,74 6,58 14,44" fill="#160c2c"/>
<polygon points="60,40 66,56 70,90 80,90 80,74 74,58 66,44" fill="#160c2c"/>
<polygon points="36,46 34,64 40,66 46,64 44,46 40,48" fill="#120a28"/>
<polygon points="32,40 20,40 16,36 40,2 64,36 60,40 48,40" fill="#0e0a1e"/>
<polygon points="34,40 22,40 18,36 40,6 62,36 58,40 46,40" fill="#141030"/>
<rect x="14" y="36" width="52" height="6" fill="#1a1430"/>
<rect x="16" y="37" width="48" height="4" fill="#221a3c"/>
<rect x="30" y="30" width="20" height="4" fill="#442a06"/>
<rect x="32" y="31" width="16" height="2" fill="#664010"/>
<polygon points="22,42 24,22 32,16 40,14 48,16 56,22 58,42 52,52 28,52" fill="#c0a888"/>
<polygon points="38,36 36,44 34,46 38,48 40,46 40,36" fill="#a89070"/>
<rect x="24" y="30" width="12" height="8" fill="#040608"/>
<rect x="25" y="31" width="10" height="6" fill="#004400"/>
<rect x="26" y="32" width="8" height="4" fill="#008800"/>
<rect x="27" y="33" width="6" height="2" fill="#00cc44"/>
<rect x="44" y="30" width="12" height="8" fill="#040608"/>
<rect x="45" y="31" width="10" height="6" fill="#004400"/>
<rect x="46" y="32" width="8" height="4" fill="#008800"/>
<rect x="47" y="33" width="6" height="2" fill="#00cc44"/>
<rect x="30" y="46" width="20" height="4" fill="#040608"/>
<rect x="30" y="46" width="4" height="4" fill="#c0a888"/>
<rect x="36" y="46" width="3" height="4" fill="#c0a888"/>
<rect x="41" y="46" width="3" height="4" fill="#c0a888"/>
<rect x="46" y="46" width="4" height="4" fill="#c0a888"/>
<rect x="60" y="14" width="4" height="60" fill="#2a1840"/>
<polygon points="62,12 70,16 72,22 68,28 62,30 56,26 54,20 58,14" fill="#0c0828"/>
<polygon points="62,14 68,17 70,22 67,27 62,29 57,26 55,21 58,15" fill="#3300aa"/>
<polygon points="62,16 67,19 68,22 66,26 62,28 58,25 57,22 59,17" fill="#6622ff"/>
</svg>`,

frost_giant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#040810"/>
<rect x="10" y="64" width="24" height="26" fill="#162436"/>
<rect x="46" y="64" width="24" height="26" fill="#162436"/>
<rect x="6" y="82" width="32" height="8" fill="#0e1c2c"/>
<rect x="42" y="82" width="32" height="8" fill="#0e1c2c"/>
<polygon points="4,68 2,40 10,22 70,22 78,40 76,68" fill="#1a2e48"/>
<polygon points="6,66 4,42 12,24 68,24 76,42 74,66" fill="#203450"/>
<polygon points="14,32 22,26 58,26 66,32 62,44 18,44" fill="#162c44"/>
<polygon points="16,34 22,28 58,28 64,34 60,42 20,42" fill="#1c3450"/>
<rect x="10" y="58" width="60" height="8" fill="#0e1c2c"/>
<rect x="12" y="59" width="56" height="6" fill="#162436"/>
<polygon points="2,40 0,24 6,14 12,24 10,42 6,48" fill="#162c44"/>
<polygon points="78,40 80,24 74,14 68,24 70,42 74,48" fill="#162c44"/>
<polygon points="0,44 0,58 8,62 12,56 10,44" fill="#1a3048"/>
<polygon points="80,44 80,58 72,62 68,56 70,44" fill="#1a3048"/>
<polygon points="2,50 0,46 4,48" fill="#2a4060"/>
<polygon points="6,52 4,48 8,50" fill="#2a4060"/>
<polygon points="74,50 76,46 72,48" fill="#2a4060"/>
<polygon points="78,52 80,48 76,50" fill="#2a4060"/>
<polygon points="10,24 12,4 22,0 40,0 58,0 68,4 70,24 62,36 18,36" fill="#1c3252"/>
<polygon points="22,4 18,0 22,0 24,4" fill="#2a4868"/>
<polygon points="32,2 30,0 34,0 32,2" fill="#304e70"/>
<polygon points="48,2 46,0 50,0 48,2" fill="#304e70"/>
<polygon points="58,4 54,0 58,0 62,0 58,4" fill="#2a4868"/>
<rect x="18" y="18" width="18" height="12" fill="#060c16"/>
<rect x="19" y="19" width="16" height="10" fill="#0033aa"/>
<rect x="20" y="20" width="14" height="8" fill="#0055cc"/>
<rect x="21" y="21" width="12" height="6" fill="#0088ff"/>
<rect x="22" y="22" width="10" height="4" fill="#44aaff"/>
<rect x="23" y="23" width="8" height="2" fill="#aaddff"/>
<rect x="44" y="18" width="18" height="12" fill="#060c16"/>
<rect x="45" y="19" width="16" height="10" fill="#0033aa"/>
<rect x="46" y="20" width="14" height="8" fill="#0055cc"/>
<rect x="47" y="21" width="12" height="6" fill="#0088ff"/>
<rect x="48" y="22" width="10" height="4" fill="#44aaff"/>
<rect x="49" y="23" width="8" height="2" fill="#aaddff"/>
<polygon points="18,32 22,46 30,52 40,54 50,52 58,46 62,32 56,36 40,38 24,36" fill="#1a2c44"/>
</svg>`,

nightmare: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04030c"/>
<rect x="12" y="62" width="8" height="28" fill="#14102a"/>
<rect x="24" y="58" width="8" height="32" fill="#14102a"/>
<rect x="48" y="58" width="8" height="32" fill="#14102a"/>
<rect x="60" y="62" width="8" height="28" fill="#14102a"/>
<polygon points="10,86 12,90 22,90 20,86" fill="#0c0820"/>
<polygon points="22,86 24,90 34,90 32,86" fill="#0c0820"/>
<polygon points="46,86 48,90 58,90 56,86" fill="#0c0820"/>
<polygon points="58,86 60,90 70,90 68,86" fill="#0c0820"/>
<polygon points="8,64 6,40 16,26 64,26 74,40 72,64" fill="#1a1630"/>
<polygon points="10,62 8,42 18,28 62,28 72,42 70,62" fill="#201c38"/>
<polygon points="20,32 22,10 30,4 38,2 44,4 48,14 46,32 34,36" fill="#18142c"/>
<polygon points="22,30 24,12 30,6 38,4 44,6 46,14 44,30 34,34" fill="#201c36"/>
<polygon points="22,14 24,2 34,0 46,0 50,4 48,16 40,20 28,20" fill="#16122a"/>
<polygon points="24,14 26,4 34,2 46,2 48,6 46,14 40,18 28,18" fill="#1e1a34"/>
<polygon points="22,14 14,8 16,18 22,20" fill="#120e24"/>
<polygon points="22,22 12,18 14,28 22,28" fill="#0e0c1e"/>
<polygon points="20,28 10,26 12,34 20,34" fill="#120e24"/>
<polygon points="20,34 10,34 12,40 20,38" fill="#0e0c1e"/>
<polygon points="28,8 26,14 30,16 34,10 30,6" fill="#100e20"/>
<rect x="26" y="8" width="10" height="8" fill="#040210"/>
<rect x="27" y="9" width="8" height="6" fill="#880000"/>
<rect x="28" y="10" width="6" height="4" fill="#cc1000"/>
<rect x="29" y="11" width="4" height="2" fill="#ff3010"/>
<rect x="30" y="11" width="2" height="2" fill="#ff9988"/>
<rect x="38" y="6" width="10" height="8" fill="#040210"/>
<rect x="39" y="7" width="8" height="6" fill="#880000"/>
<rect x="40" y="8" width="6" height="4" fill="#cc1000"/>
<rect x="41" y="9" width="4" height="2" fill="#ff3010"/>
<rect x="42" y="9" width="2" height="2" fill="#ff9988"/>
<polygon points="36,16 34,20 38,22 40,18 38,14" fill="#0a0818"/>
<polygon points="70,56 78,62 80,70 76,74 70,64 68,56" fill="#14102a"/>
<polygon points="76,66 80,72 80,80 78,78 74,68" fill="#0e0c20"/>
</svg>`,

chaos_lord: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90">
<rect width="80" height="90" fill="#04030a"/>
<polygon points="10,90 8,52 14,36 66,36 72,52 70,90" fill="#280818"/>
<polygon points="12,88 10,54 16,38 64,38 70,54 68,88" fill="#300e20"/>
<polygon points="14,36 2,18 0,6 6,12 10,24 14,32" fill="#1e0610"/>
<polygon points="14,36 0,28 0,40 6,44 10,40" fill="#180408"/>
<polygon points="66,36 78,18 80,6 74,12 70,24 66,32" fill="#1e0610"/>
<polygon points="66,36 80,28 80,40 74,44 70,40" fill="#180408"/>
<polygon points="28,36 20,14 26,22 28,10 32,20 34,8 36,22 36,36" fill="#2a0a18"/>
<polygon points="30,34 22,16 27,22 29,12 33,20 35,10 36,22 36,34" fill="#3a0e22"/>
<polygon points="40,34 36,10 38,20 40,6 42,20 44,10 44,34" fill="#300c1c"/>
<polygon points="52,36 44,8 46,22 48,10 50,22 54,14 58,22 52,36" fill="#2a0a18"/>
<polygon points="50,34 44,10 46,22 48,12 50,22 53,16 56,22 50,34" fill="#3a0e22"/>
<polygon points="14,38 16,12 24,6 40,4 56,6 64,12 66,38 58,50 22,50" fill="#2a0c1c"/>
<polygon points="16,36 18,14 26,8 40,6 54,8 62,14 64,36 56,48 24,48" fill="#340e22"/>
<rect x="20" y="26" width="16" height="10" fill="#040208"/>
<rect x="21" y="27" width="14" height="8" fill="#880000"/>
<rect x="22" y="28" width="12" height="6" fill="#cc0000"/>
<rect x="24" y="29" width="8" height="4" fill="#ff2200"/>
<rect x="25" y="30" width="6" height="2" fill="#ff9988"/>
<rect x="44" y="26" width="16" height="10" fill="#040208"/>
<rect x="45" y="27" width="14" height="8" fill="#880000"/>
<rect x="46" y="28" width="12" height="6" fill="#cc0000"/>
<rect x="48" y="29" width="8" height="4" fill="#ff2200"/>
<rect x="49" y="30" width="6" height="2" fill="#ff9988"/>
<rect x="28" y="18" width="8" height="6" fill="#040208"/>
<rect x="29" y="19" width="6" height="4" fill="#aa0000"/>
<rect x="30" y="20" width="4" height="2" fill="#dd2200"/>
<rect x="44" y="18" width="8" height="6" fill="#040208"/>
<rect x="45" y="19" width="6" height="4" fill="#aa0000"/>
<rect x="46" y="20" width="4" height="2" fill="#dd2200"/>
<rect x="36" y="14" width="8" height="6" fill="#040208"/>
<rect x="37" y="15" width="6" height="4" fill="#aa0000"/>
<rect x="38" y="16" width="4" height="2" fill="#dd2200"/>
<polygon points="24,42 28,50 40,54 52,50 56,42 50,38 30,38" fill="#0a0410"/>
<rect x="26" y="44" width="5" height="6" fill="#d0c8b8"/>
<rect x="33" y="44" width="5" height="7" fill="#dcd4c4"/>
<rect x="40" y="44" width="5" height="7" fill="#dcd4c4"/>
<rect x="47" y="44" width="5" height="6" fill="#d0c8b8"/>
<polygon points="24,52 22,64 28,62 26,52" fill="#440010" opacity="0.8"/>
<polygon points="50,52 52,62 56,60 54,52" fill="#440010" opacity="0.8"/>
<rect x="16" y="62" width="18" height="28" fill="#280818"/>
<rect x="46" y="62" width="18" height="28" fill="#280818"/>
<polygon points="12,86 16,90 34,90 34,86 20,84" fill="#1e0610"/>
<polygon points="46,86 46,90 64,90 68,86 60,84" fill="#1e0610"/>
</svg>`

};
// ─────────────────────────────────────────────────────────────────────────────

// ─── Item Icons (inline SVG, 40×40, for merchant shop) ────────────────────────
const ITEM_ICONS = {
ws_iron_sword:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M19,3 L21,3 L23,25 L20,28 L17,25Z" fill="#8090a0"/><path d="M20,3 L21,14 L20,16 L19,14Z" fill="#c8d8e0"/><rect x="12" y="25" width="16" height="3.5" fill="#b88c00" rx="1.5"/><rect x="18.5" y="28.5" width="3" height="8" fill="#7a5200" rx="1"/><circle cx="20" cy="37.5" r="2.5" fill="#b88c00"/></svg>`,
ws_bone_axe:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="18.5" y="14" width="3" height="23" fill="#8a7a60" rx="1"/><path d="M21.5,14 Q34,9 34,21 Q34,27 21.5,24Z" fill="#c8bc98"/><path d="M21.5,15 Q32,11 32,21 Q32,26 21.5,23Z" fill="#e0d8b0"/><circle cx="20" cy="11" r="3.5" fill="#8a7a60"/><circle cx="20" cy="36" r="3" fill="#7a6a50"/></svg>`,
ws_shadow_dagger:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M20,3 L21.5,24 L20,26 L18.5,24Z" fill="#484868"/><path d="M20,3 L21,13 L20,15 L19,13Z" fill="#8080a8"/><rect x="14" y="24" width="12" height="3" fill="#5533aa" rx="1.5"/><rect x="19" y="27" width="2" height="10" fill="#3a2070" rx="1"/><ellipse cx="20" cy="38" rx="2.5" ry="1.5" fill="#5533aa"/></svg>`,
ws_steel_sword:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M19,3 L21,3 L23,26 L20,29 L17,26Z" fill="#9ab0b8"/><path d="M20,3 L21.5,14 L20,17 L18.5,14Z" fill="#dceef8"/><rect x="11" y="26" width="18" height="3.5" fill="#cc9900" rx="1.5"/><rect x="18.5" y="29.5" width="3" height="7" fill="#7a5500" rx="1"/><ellipse cx="20" cy="37" rx="3.5" ry="2" fill="#cc9900"/></svg>`,
ws_battle_axe:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="18.5" y="6" width="3" height="30" fill="#9090a0" rx="1"/><path d="M21.5,6 Q35,6 35,15 Q35,19 21.5,18Z" fill="#b8c0c8"/><path d="M21.5,6 Q34,7 34,15 Q34,18 21.5,17Z" fill="#d8e0e8"/><path d="M18.5,18 Q5,20 5,25 Q5,30 18.5,28Z" fill="#b8c0c8"/><path d="M18.5,19 Q7,21 7,25 Q7,29 18.5,27Z" fill="#d0d8e0"/><circle cx="20" cy="36" r="3" fill="#666878"/></svg>`,
ws_bone_bow:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M14,4 Q7,20 14,36" stroke="#c8bc98" stroke-width="3" fill="none" stroke-linecap="round"/><line x1="14" y1="4" x2="14" y2="36" stroke="#c8bc98" stroke-width="1.5"/><line x1="14" y1="5" x2="28" y2="20" stroke="#6a5a40" stroke-width="1"/><line x1="14" y1="35" x2="28" y2="20" stroke="#6a5a40" stroke-width="1"/><line x1="24" y1="17" x2="33" y2="20" stroke="#c0b090" stroke-width="2" stroke-linecap="round"/><polygon points="33,18.5 35,20 33,21.5 30,20" fill="#c0b090"/></svg>`,
ws_frost_staff:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="18.5" y="12" width="3" height="26" fill="#8a9aa0" rx="1"/><circle cx="20" cy="9" r="7" fill="#001428" stroke="#66ccff" stroke-width="1.5"/><circle cx="20" cy="9" r="4.5" fill="#003060"/><circle cx="20" cy="9" r="2.5" fill="#4488cc"/><circle cx="20" cy="9" r="1.2" fill="#88ddff"/><line x1="20" y1="2" x2="20" y2="16" stroke="#88ccff" stroke-width="0.8" opacity="0.7"/><line x1="13" y1="9" x2="27" y2="9" stroke="#88ccff" stroke-width="0.8" opacity="0.7"/><line x1="15" y1="4" x2="25" y2="14" stroke="#88ccff" stroke-width="0.6" opacity="0.5"/><line x1="25" y1="4" x2="15" y2="14" stroke="#88ccff" stroke-width="0.6" opacity="0.5"/></svg>`,
ws_enchanted_blade:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M19,2 L21,2 L23,25 L20,28 L17,25Z" fill="#5577bb"/><path d="M20,2 L21.5,12 L20,15 L18.5,12Z" fill="#aaddff"/><rect x="11" y="25" width="18" height="3.5" fill="#330088" rx="1.5"/><rect x="18.5" y="28.5" width="3" height="8" fill="#220055" rx="1"/><circle cx="20" cy="37" r="2.5" fill="#5533cc"/><circle cx="17" cy="10" r="1.2" fill="#aaccff" opacity="0.6"/><circle cx="22" cy="18" r="1" fill="#88aaff" opacity="0.6"/></svg>`,
ws_fire_sword:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M19,3 L21,3 L23,26 L20,29 L17,26Z" fill="#aa3300"/><path d="M20,3 L21.5,13 L20,16 L18.5,13Z" fill="#ff9900"/><path d="M20,4 Q23,9 21,14 Q24,11 22,17" stroke="#ff6600" stroke-width="1.5" fill="none" opacity="0.7"/><rect x="11" y="26" width="18" height="3.5" fill="#550000" rx="1.5"/><rect x="18.5" y="29.5" width="3" height="7" fill="#330000" rx="1"/><ellipse cx="20" cy="37" rx="3.5" ry="2" fill="#770000"/></svg>`,
ws_cursed_blade:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M19,2 L21,2 L22.5,26 L20,29 L17.5,26Z" fill="#3a2060"/><path d="M20,2 L21.5,11 L20,14 L18.5,11Z" fill="#9955dd"/><path d="M17.5,9 Q15.5,13 17.5,17 M22.5,9 Q24.5,13 22.5,17" stroke="#6633aa" stroke-width="1" fill="none" opacity="0.7"/><rect x="10" y="26" width="20" height="3.5" fill="#1a0033" rx="1.5"/><rect x="18.5" y="29.5" width="3" height="7" fill="#110022" rx="1"/><circle cx="20" cy="37" r="2.5" fill="#5522aa"/><circle cx="14" cy="15" r="1" fill="#cc88ff" opacity="0.5"/><circle cx="25" cy="20" r="1" fill="#cc88ff" opacity="0.5"/></svg>`,
ws_dragon_fang:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M20,2 L24,9 L26,20 L23,29 L20,33 L17,29 L14,20 L16,9Z" fill="#c87800"/><path d="M20,3 L23,10 L24.5,21 L21.5,29 L20,32 L18.5,29 L15.5,21 L17,10Z" fill="#e09000"/><path d="M20,5 L22,11 L23,21 L21,28 L20,31 L19,28 L17,21 L18,11Z" fill="#ffc000"/><path d="M20,7 L21,13 L22,21 L20,28 L18,21 L19,13Z" fill="#ffe060" opacity="0.6"/><ellipse cx="20" cy="35" rx="5" ry="2.5" fill="#886600"/></svg>`,

as_leather_armor:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M12,8 L8,14 L8,32 Q20,37 32,32 L32,14 L28,8 Q24,12 20,12 Q16,12 12,8Z" fill="#7a5030"/><path d="M13,10 L10,15 L10,31 Q20,35 30,31 L30,15 L27,10 Q23,14 20,14 Q17,14 13,10Z" fill="#8a6040"/><line x1="20" y1="12" x2="20" y2="36" stroke="#6a4020" stroke-width="1.5" opacity="0.5"/><line x1="10" y1="20" x2="30" y2="20" stroke="#6a4020" stroke-width="1" opacity="0.4"/><path d="M13,10 L15,8 M27,10 L25,8" stroke="#aa8060" stroke-width="2" stroke-linecap="round"/></svg>`,
as_chain_mail:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,8 L8,14 L8,34 Q20,38 32,34 L32,14 L30,8 Q24,5 20,5 Q16,5 10,8Z" fill="#3a4050" opacity="0.6"/><g stroke="#8898b0" stroke-width="1.2" fill="none" opacity="0.85"><circle cx="14" cy="14" r="2.5"/><circle cx="20" cy="14" r="2.5"/><circle cx="26" cy="14" r="2.5"/><circle cx="11" cy="19.5" r="2.5"/><circle cx="17" cy="19.5" r="2.5"/><circle cx="23" cy="19.5" r="2.5"/><circle cx="29" cy="19.5" r="2.5"/><circle cx="14" cy="25" r="2.5"/><circle cx="20" cy="25" r="2.5"/><circle cx="26" cy="25" r="2.5"/><circle cx="11" cy="30.5" r="2.5"/><circle cx="17" cy="30.5" r="2.5"/><circle cx="23" cy="30.5" r="2.5"/><circle cx="29" cy="30.5" r="2.5"/></g></svg>`,
as_shadow_cloak:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M8,5 Q20,10 32,5 L35,38 Q20,43 5,38Z" fill="#16102a"/><path d="M10,7 Q20,12 30,7 L32,36 Q20,41 8,36Z" fill="#20183a"/><line x1="20" y1="10" x2="20" y2="38" stroke="#3a2855" stroke-width="1.5" opacity="0.5"/><path d="M8,5 Q14,3 20,5 Q26,3 32,5" stroke="#5533aa" stroke-width="1.5" fill="none"/><path d="M10,12 Q15,15 20,13 Q25,15 30,12" stroke="#3a2266" stroke-width="1" fill="none" opacity="0.5"/></svg>`,
as_mage_robe:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M11,6 Q20,9 29,6 L33,38 Q20,41 7,38Z" fill="#141e48"/><path d="M13,8 Q20,11 27,8 L30,36 Q20,39 10,36Z" fill="#1a2858"/><line x1="20" y1="9" x2="20" y2="38" stroke="#1e3888" stroke-width="1.5" opacity="0.7"/><path d="M11,6 Q15.5,4 20,6 Q24.5,4 29,6" stroke="#3355cc" stroke-width="2" fill="none"/><circle cx="20" cy="15" r="3" fill="#0a0818" stroke="#5577ff" stroke-width="1"/><circle cx="20" cy="15" r="1.5" fill="#3355cc" opacity="0.9"/><path d="M14,22 Q17,24 20,23 Q23,24 26,22" stroke="#1e3888" stroke-width="1" fill="none" opacity="0.6"/></svg>`,
as_battle_plate:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M8,8 L8,32 Q14,38 20,38 Q26,38 32,32 L32,8 Q26,3 20,3 Q14,3 8,8Z" fill="#585e6e"/><path d="M10,10 L10,31 Q15,36 20,36 Q25,36 30,31 L30,10 Q25,5 20,5 Q15,5 10,10Z" fill="#6e7484"/><line x1="20" y1="5" x2="20" y2="36" stroke="#484e5e" stroke-width="1.5" opacity="0.6"/><line x1="10" y1="18" x2="30" y2="18" stroke="#484e5e" stroke-width="1.5" opacity="0.6"/><path d="M8,8 Q14,3 20,3 Q26,3 32,8" stroke="#8888a0" stroke-width="2" fill="none"/></svg>`,
as_dragon_scale:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M8,9 L8,33 Q14,40 20,40 Q26,40 32,33 L32,9 Q26,1 20,1 Q14,1 8,9Z" fill="#182a1a"/><g fill="#22382a" opacity="0.95"><ellipse cx="14" cy="13" rx="5" ry="3.5"/><ellipse cx="26" cy="13" rx="5" ry="3.5"/><ellipse cx="20" cy="19" rx="5" ry="3.5"/><ellipse cx="13" cy="24.5" rx="4.5" ry="3.5"/><ellipse cx="27" cy="24.5" rx="4.5" ry="3.5"/><ellipse cx="20" cy="30" rx="5" ry="3.5"/><ellipse cx="14" cy="35.5" rx="4" ry="3"/><ellipse cx="26" cy="35.5" rx="4" ry="3"/></g><path d="M9,10 Q20,2 31,10" stroke="#2e4a30" stroke-width="1.5" fill="none"/></svg>`,
as_guardian_plate:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M8,8 L8,30 Q14,38 20,38 Q26,38 32,30 L32,8 Q26,2 20,2 Q14,2 8,8Z" fill="#484858"/><path d="M10,10 L10,29 Q15,36 20,36 Q25,36 30,29 L30,10 Q25,4 20,4 Q15,4 10,10Z" fill="#606070"/><path d="M8,8 Q14,2 20,2 Q26,2 32,8" stroke="#cc9900" stroke-width="2.5" fill="none"/><line x1="20" y1="4" x2="20" y2="36" stroke="#cc9900" stroke-width="1" opacity="0.5"/><line x1="10" y1="19" x2="30" y2="19" stroke="#cc9900" stroke-width="1" opacity="0.5"/><polygon points="20,9 21.5,13.5 26,13.5 22.5,16.5 23.5,21 20,18.5 16.5,21 17.5,16.5 14,13.5 18.5,13.5" fill="#cc9900" opacity="0.8"/></svg>`,

ac_ring_power:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="24" r="11" fill="none" stroke="#cc9900" stroke-width="3.5"/><circle cx="20" cy="24" r="7" fill="none" stroke="#996600" stroke-width="1"/><circle cx="20" cy="12" r="5" fill="#1a0606"/><circle cx="20" cy="12" r="3.5" fill="#880000" opacity="0.8"/><circle cx="20" cy="12" r="2" fill="#cc2200"/><circle cx="20" cy="12" r="1.2" fill="#ff5533"/><circle cx="18.8" cy="10.8" r="0.7" fill="#ff9988" opacity="0.7"/></svg>`,
ac_ring_defense:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="24" r="11" fill="none" stroke="#cc9900" stroke-width="3.5"/><circle cx="20" cy="24" r="7" fill="none" stroke="#996600" stroke-width="1"/><circle cx="20" cy="12" r="5" fill="#060818"/><circle cx="20" cy="12" r="3.5" fill="#002288" opacity="0.8"/><circle cx="20" cy="12" r="2" fill="#2244cc"/><circle cx="20" cy="12" r="1.2" fill="#4488ff"/><circle cx="18.8" cy="10.8" r="0.7" fill="#88bbff" opacity="0.7"/></svg>`,
ac_lucky_charm:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M20,5 Q17,3 14,5 Q11,8 13,11 Q15,14 20,18 Q25,14 27,11 Q29,8 26,5 Q23,3 20,5Z" fill="#18aa40"/><path d="M5,20 Q3,17 5,14 Q8,12 11,14 Q14,17 18,21 Q14,25 11,27 Q8,29 5,26 Q3,23 5,20Z" fill="#18aa40"/><path d="M35,20 Q37,17 35,14 Q32,12 29,14 Q26,17 22,21 Q26,25 29,27 Q32,29 35,26 Q37,23 35,20Z" fill="#18aa40"/><path d="M20,35 Q17,37 14,35 Q11,32 13,29 Q15,26 20,22 Q25,26 27,29 Q29,32 26,35 Q23,37 20,35Z" fill="#18aa40"/><circle cx="20" cy="21" r="3.5" fill="#cc9900"/></svg>`,
ac_ring_vitality:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="24" r="11" fill="none" stroke="#cc9900" stroke-width="3.5"/><circle cx="20" cy="24" r="7" fill="none" stroke="#996600" stroke-width="1"/><circle cx="20" cy="12" r="5" fill="#081408"/><circle cx="20" cy="12" r="3.5" fill="#006622" opacity="0.8"/><circle cx="20" cy="12" r="2" fill="#00aa44"/><circle cx="20" cy="12" r="1.2" fill="#33dd77"/><circle cx="18.8" cy="10.8" r="0.7" fill="#88ffaa" opacity="0.7"/></svg>`,
ac_mage_crystal:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><polygon points="20,3 27,14 31,27 20,34 9,27 13,14" fill="#160820"/><polygon points="20,3 27,14 31,27 20,34 9,27 13,14" fill="none" stroke="#7733bb" stroke-width="1.5"/><line x1="20" y1="3" x2="20" y2="34" stroke="#5522aa" stroke-width="0.8" opacity="0.5"/><line x1="9" y1="27" x2="31" y2="27" stroke="#5522aa" stroke-width="0.8" opacity="0.4"/><circle cx="20" cy="19" r="5.5" fill="#0e0218"/><circle cx="20" cy="19" r="3.5" fill="#5522bb" opacity="0.9"/><circle cx="20" cy="19" r="2" fill="#9944ee"/><circle cx="18.8" cy="17.8" r="0.9" fill="#cc99ff" opacity="0.7"/></svg>`,
ac_amulet_warrior:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="6" r="2" fill="#cc9900"/><line x1="20" y1="8" x2="20" y2="14" stroke="#996600" stroke-width="1.5"/><path d="M11,14 L29,14 L29,31 Q20,37 11,31Z" fill="#1a1206"/><path d="M12,15 L28,15 L28,30 Q20,36 12,30Z" fill="#261a0a"/><line x1="20" y1="14" x2="20" y2="36" stroke="#cc9900" stroke-width="0.8" opacity="0.5"/><line x1="12" y1="15" x2="28" y2="29" stroke="#cc9900" stroke-width="0.8" opacity="0.4"/><line x1="28" y1="15" x2="12" y2="29" stroke="#cc9900" stroke-width="0.8" opacity="0.4"/><circle cx="20" cy="25" r="4" fill="#0c0806"/><circle cx="20" cy="25" r="2.5" fill="#cc8800" opacity="0.8"/><circle cx="20" cy="25" r="1.5" fill="#ffcc44"/></svg>`,
ac_dark_pendant:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="6" r="2" fill="#441166"/><line x1="20" y1="8" x2="20" y2="14" stroke="#6622aa" stroke-width="1.5"/><path d="M11,14 Q7,21 11,28 Q15,36 20,36 Q25,36 29,28 Q33,21 29,14Z" fill="#1e0030"/><path d="M12,15 Q9,22 12,28 Q16,35 20,35 Q24,35 28,28 Q31,22 28,15Z" fill="#2a0040"/><circle cx="20" cy="25" r="6" fill="#150025"/><circle cx="20" cy="25" r="4" fill="#7722cc" opacity="0.8"/><circle cx="20" cy="25" r="2.5" fill="#aa44ff"/><circle cx="18.8" cy="23.8" r="0.9" fill="#dd99ff" opacity="0.7"/></svg>`,
ac_storm_ring:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="24" r="11" fill="none" stroke="#3377bb" stroke-width="3.5"/><circle cx="20" cy="24" r="7" fill="none" stroke="#1a4488" stroke-width="1"/><circle cx="20" cy="12" r="5.5" fill="#06080e"/><circle cx="20" cy="12" r="4" fill="#001a44" opacity="0.9"/><polygon points="20,7.5 21.5,11 24.5,11 22.2,13 23,16 20,14 17,16 17.8,13 15.5,11 18.5,11" fill="#44aaff"/></svg>`,
ac_ancient_talisman:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="7" r="2.5" fill="#aa8800"/><line x1="20" y1="9.5" x2="20" y2="15" stroke="#886600" stroke-width="1.5"/><polygon points="20,15 32,23 28,38 20,34 12,38 8,23" fill="#1a1206"/><polygon points="20,15 32,23 28,38 20,34 12,38 8,23" fill="none" stroke="#cc9900" stroke-width="1.5"/><circle cx="20" cy="27" r="7" fill="#080806"/><circle cx="20" cy="27" r="5" fill="none" stroke="#aa8800" stroke-width="1"/><ellipse cx="20" cy="27" rx="3" ry="2" fill="#0e0c06" stroke="#cc9900" stroke-width="1"/><circle cx="20" cy="27" r="1.5" fill="#cc9900"/></svg>`,

cs_potion_minor:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="6" width="6" height="4" fill="#445544" rx="1"/><path d="M15,10 L13,18 Q10,25 10,31 Q10,38 20,38 Q30,38 30,31 Q30,25 27,18 L25,10Z" fill="#081408"/><ellipse cx="20" cy="29" rx="7" ry="8" fill="#005520" opacity="0.8"/><ellipse cx="20" cy="27" rx="5" ry="6" fill="#00aa44" opacity="0.7"/><ellipse cx="17.5" cy="25" rx="2" ry="2.5" fill="#44ff88" opacity="0.4"/><rect x="17" y="6" width="6" height="2" fill="#667766" rx="1"/></svg>`,
cs_potion_health:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="16" y="4" width="8" height="5" fill="#446644" rx="1.5"/><path d="M13,9 L11,17 Q8,25 8,32 Q8,40 20,40 Q32,40 32,32 Q32,25 29,17 L27,9Z" fill="#0a1e0a"/><ellipse cx="20" cy="31" rx="9" ry="9" fill="#006620" opacity="0.8"/><ellipse cx="20" cy="28" rx="6.5" ry="7" fill="#00cc44" opacity="0.7"/><ellipse cx="17" cy="26" rx="2.5" ry="3" fill="#44ff88" opacity="0.4"/><line x1="17" y1="28" x2="23" y2="28" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/><line x1="20" y1="25" x2="20" y2="31" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/><rect x="16" y="4" width="8" height="2" fill="#668866" rx="1"/></svg>`,
cs_antidote:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="5" width="6" height="4" fill="#4a6444" rx="1"/><path d="M15,9 L14,16 Q11,23 11,30 Q11,38 20,38 Q29,38 29,30 Q29,23 26,16 L25,9Z" fill="#081408"/><ellipse cx="20" cy="28" rx="7" ry="8" fill="#1a4420" opacity="0.9"/><ellipse cx="20" cy="26" rx="5" ry="6" fill="#44aa44" opacity="0.7"/><ellipse cx="17.5" cy="24" rx="1.8" ry="2.2" fill="#88dd88" opacity="0.4"/><path d="M15.5,25 Q20,22 24.5,25 Q20,28 15.5,25Z" fill="#55cc55" opacity="0.3"/><rect x="17" y="5" width="6" height="1.5" fill="#6a8464" rx="1"/></svg>`,
cs_potion_greater:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="15" y="3" width="10" height="5" fill="#446644" rx="2"/><path d="M11,8 L9,16 Q6,24 6,32 Q6,40 20,40 Q34,40 34,32 Q34,24 31,16 L29,8Z" fill="#081408"/><ellipse cx="20" cy="32" rx="11" ry="9" fill="#006622" opacity="0.8"/><ellipse cx="20" cy="29" rx="8.5" ry="8" fill="#00aa44" opacity="0.7"/><ellipse cx="17" cy="27" rx="3" ry="3.5" fill="#44ff88" opacity="0.4"/><line x1="16" y1="29" x2="24" y2="29" stroke="#ffffff" stroke-width="2" opacity="0.3"/><line x1="20" y1="25" x2="20" y2="33" stroke="#ffffff" stroke-width="2" opacity="0.3"/><rect x="15" y="3" width="10" height="2" fill="#668866" rx="1"/></svg>`,
cs_elixir_life:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="3" width="6" height="5" fill="#886600" rx="1.5"/><path d="M14,8 L12,16 Q9,23 9,31 Q9,40 20,40 Q31,40 31,31 Q31,23 28,16 L26,8Z" fill="#120e02"/><ellipse cx="20" cy="30" rx="9" ry="9" fill="#aa7700" opacity="0.8"/><ellipse cx="20" cy="27" rx="6.5" ry="7" fill="#ddaa00" opacity="0.7"/><ellipse cx="17.5" cy="25" rx="2.5" ry="3" fill="#ffdd44" opacity="0.5"/><circle cx="20" cy="24" r="1.8" fill="#ffffff" opacity="0.4"/><rect x="17" y="3" width="6" height="2" fill="#cc9900" rx="1"/></svg>`,
cs_potion_rejuv:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="3" width="6" height="5" fill="#7777aa" rx="1.5"/><path d="M14,8 L12,16 Q9,23 9,31 Q9,40 20,40 Q31,40 31,31 Q31,23 28,16 L26,8Z" fill="#0e0e18"/><ellipse cx="20" cy="30" rx="9" ry="9" fill="#3333aa" opacity="0.7"/><ellipse cx="20" cy="27" rx="6.5" ry="7" fill="#7777ff" opacity="0.6"/><ellipse cx="17.5" cy="25" rx="2.5" ry="3" fill="#aaaaff" opacity="0.35"/><circle cx="20" cy="24" r="2" fill="#ffffff" opacity="0.3"/><circle cx="20" cy="20" r="3" fill="#ccccff" opacity="0.2"/><line x1="16" y1="27" x2="24" y2="27" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/><line x1="20" y1="23" x2="20" y2="31" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/><rect x="17" y="3" width="6" height="2" fill="#aaaacc" rx="1"/></svg>`,
cs_smoke_bomb:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="26" r="12" fill="#191920"/><circle cx="20" cy="26" r="10" fill="#242430"/><path d="M20,14 Q20,10 18,8" stroke="#555568" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M12,20 Q8,16 10,12" stroke="#404055" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/><path d="M28,20 Q32,16 30,12" stroke="#404055" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/><circle cx="20" cy="26" r="6" fill="#343445"/><circle cx="17.5" cy="25" r="2.5" fill="#484860"/></svg>`,
cs_potion_strength:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="5" width="6" height="4" fill="#551818" rx="1"/><path d="M15,9 L13,17 Q10,25 10,32 Q10,40 20,40 Q30,40 30,32 Q30,25 27,17 L25,9Z" fill="#1a0606"/><ellipse cx="20" cy="30" rx="8" ry="9" fill="#780000" opacity="0.8"/><ellipse cx="20" cy="28" rx="5.5" ry="7" fill="#cc2200" opacity="0.7"/><ellipse cx="17.5" cy="26" rx="2" ry="2.5" fill="#ff5533" opacity="0.4"/><line x1="18" y1="28" x2="22" y2="28" stroke="#ffcc88" stroke-width="1.5" opacity="0.5"/><line x1="20" y1="25" x2="20" y2="31" stroke="#ffcc88" stroke-width="1.5" opacity="0.5"/><rect x="17" y="5" width="6" height="1.5" fill="#883322" rx="1"/></svg>`,
cs_potion_defense:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="17" y="5" width="6" height="4" fill="#1a3355" rx="1"/><path d="M15,9 L13,17 Q10,25 10,32 Q10,40 20,40 Q30,40 30,32 Q30,25 27,17 L25,9Z" fill="#06080e"/><ellipse cx="20" cy="30" rx="8" ry="9" fill="#001a66" opacity="0.8"/><ellipse cx="20" cy="28" rx="5.5" ry="7" fill="#1e44cc" opacity="0.7"/><ellipse cx="17.5" cy="26" rx="2" ry="2.5" fill="#5577ff" opacity="0.4"/><path d="M15,28 Q20,32 25,28 Q20,26 15,28Z" fill="#3355dd" opacity="0.5"/><rect x="17" y="5" width="6" height="1.5" fill="#2244aa" rx="1"/></svg>`,
cs_potion_berserker:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="16" y="4" width="8" height="5" fill="#440a00" rx="1.5"/><path d="M13,9 L11,17 Q8,25 8,32 Q8,40 20,40 Q32,40 32,32 Q32,25 29,17 L27,9Z" fill="#180402"/><ellipse cx="20" cy="31" rx="9.5" ry="9" fill="#660000" opacity="0.8"/><ellipse cx="20" cy="28" rx="7" ry="7.5" fill="#aa0000" opacity="0.7"/><ellipse cx="17" cy="26" rx="2.5" ry="3" fill="#ff2200" opacity="0.4"/><path d="M13,27 L17,23 L19,27 L21,23 L25,27 L22,27 L20,31 L18,27Z" stroke="#ff8800" stroke-width="1.5" fill="none" opacity="0.6"/><rect x="16" y="4" width="8" height="2" fill="#770a00" rx="1"/></svg>`,
cs_war_paint:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M9,8 Q9,4 20,4 Q31,4 31,8 L33,33 Q20,38 7,33Z" fill="#1a1208"/><path d="M10,9 Q10,6 20,6 Q30,6 30,9 L31,31 Q20,36 9,31Z" fill="#261a0e"/><line x1="10" y1="13" x2="30" y2="13" stroke="#cc2200" stroke-width="3" opacity="0.85"/><line x1="10" y1="19" x2="30" y2="19" stroke="#cc9900" stroke-width="2.5" opacity="0.85"/><line x1="10" y1="24.5" x2="30" y2="24.5" stroke="#3388cc" stroke-width="2" opacity="0.85"/><line x1="10" y1="29.5" x2="30" y2="29.5" stroke="#33aa44" stroke-width="1.5" opacity="0.7"/><line x1="20" y1="8" x2="20" y2="5" stroke="#887755" stroke-width="1.5"/></svg>`,
cs_poison_vial:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><rect x="18" y="5" width="4" height="6" fill="#284422" rx="1"/><path d="M16,11 L15,18 Q12,25 12,31 Q12,38 20,38 Q28,38 28,31 Q28,25 25,18 L24,11Z" fill="#0a1606"/><ellipse cx="20" cy="29" rx="7" ry="8" fill="#194800" opacity="0.9"/><ellipse cx="20" cy="27" rx="5" ry="6" fill="#336600" opacity="0.8"/><ellipse cx="17.5" cy="25" rx="2" ry="2.5" fill="#66cc00" opacity="0.5"/><circle cx="22" cy="30" r="1.5" fill="#88ee00" opacity="0.5"/><line x1="15.5" y1="20" x2="24.5" y2="20" stroke="#44aa00" stroke-width="1" opacity="0.4"/><rect x="18" y="5" width="4" height="2" fill="#448833" rx="0.5"/></svg>`,
cs_scroll_fire:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,6 Q10,4 12,4 L28,4 Q30,4 30,6 L30,34 Q30,36 28,36 L12,36 Q10,36 10,34Z" fill="#c8a878"/><line x1="13" y1="9" x2="27" y2="9" stroke="#8a6840" stroke-width="1" opacity="0.5"/><line x1="13" y1="12.5" x2="27" y2="12.5" stroke="#8a6840" stroke-width="1" opacity="0.5"/><ellipse cx="10" cy="20" rx="3" ry="16" fill="#b89060" stroke="#8a6040" stroke-width="1"/><ellipse cx="30" cy="20" rx="3" ry="16" fill="#b89060" stroke="#8a6040" stroke-width="1"/><path d="M15,23 Q20,14 25,23 Q22.5,26 20,24.5 Q17.5,26 15,23Z" fill="#cc4400"/><path d="M16,23 Q20,15.5 24,23 Q21.5,25 20,24 Q18.5,25 16,23Z" fill="#ff8800"/><path d="M17.5,23 Q20,17 22.5,23 Q20,24.5 17.5,23Z" fill="#ffcc00" opacity="0.8"/></svg>`,
cs_scroll_lightning:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,6 Q10,4 12,4 L28,4 Q30,4 30,6 L30,34 Q30,36 28,36 L12,36 Q10,36 10,34Z" fill="#d4d0b8"/><line x1="13" y1="9" x2="27" y2="9" stroke="#a09878" stroke-width="1" opacity="0.4"/><line x1="13" y1="12.5" x2="27" y2="12.5" stroke="#a09878" stroke-width="1" opacity="0.4"/><ellipse cx="10" cy="20" rx="3" ry="16" fill="#c0bc98" stroke="#90806a" stroke-width="1"/><ellipse cx="30" cy="20" rx="3" ry="16" fill="#c0bc98" stroke="#90806a" stroke-width="1"/><polygon points="22,16 17.5,22.5 21,22.5 17.5,30.5 24.5,22.5 20.5,22.5" fill="#ffdd00" opacity="0.95"/><polygon points="22,17 18,22.5 21.5,22.5 18,29.5 24,22.5 20.5,22.5" fill="#ffffff" opacity="0.5"/></svg>`,
cs_scroll_ice:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,6 Q10,4 12,4 L28,4 Q30,4 30,6 L30,34 Q30,36 28,36 L12,36 Q10,36 10,34Z" fill="#b8d0e0"/><line x1="13" y1="9" x2="27" y2="9" stroke="#7090a8" stroke-width="1" opacity="0.4"/><line x1="13" y1="12.5" x2="27" y2="12.5" stroke="#7090a8" stroke-width="1" opacity="0.4"/><ellipse cx="10" cy="20" rx="3" ry="16" fill="#a0c0d4" stroke="#6080a0" stroke-width="1"/><ellipse cx="30" cy="20" rx="3" ry="16" fill="#a0c0d4" stroke="#6080a0" stroke-width="1"/><line x1="20" y1="15.5" x2="20" y2="26.5" stroke="#88ccff" stroke-width="2"/><line x1="15.2" y1="18.2" x2="24.8" y2="23.8" stroke="#88ccff" stroke-width="2"/><line x1="15.2" y1="23.8" x2="24.8" y2="18.2" stroke="#88ccff" stroke-width="2"/><circle cx="20" cy="21" r="2" fill="#aaddff"/></svg>`,
cs_bomb:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="26" r="12" fill="#181818"/><circle cx="20" cy="26" r="10" fill="#222222"/><circle cx="20" cy="26" r="8" fill="#1c1c1c"/><path d="M20,14 Q21.5,10 25.5,8" stroke="#cc8800" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="25.5" cy="8" r="2.5" fill="#ffcc00" opacity="0.9"/><circle cx="25.5" cy="8" r="1.2" fill="#ffffff" opacity="0.7"/><circle cx="16" cy="30" r="3" fill="#2c2c2c" opacity="0.9"/></svg>`,
cs_scroll_revival:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,6 Q10,4 12,4 L28,4 Q30,4 30,6 L30,34 Q30,36 28,36 L12,36 Q10,36 10,34Z" fill="#e4e4f0"/><ellipse cx="10" cy="20" rx="3" ry="16" fill="#d4d4e4" stroke="#9898b8" stroke-width="1"/><ellipse cx="30" cy="20" rx="3" ry="16" fill="#d4d4e4" stroke="#9898b8" stroke-width="1"/><path d="M15.5,25 Q20,16 24.5,25 M20,16 L20,11 M17,18 L20,16 L23,18" stroke="#7777ff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="20" cy="23" r="3.5" fill="#9999ff" opacity="0.35"/><circle cx="20" cy="23" r="2" fill="#ddddff" opacity="0.5"/></svg>`,

art_shadow_essence:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="20" r="13" fill="#08040e"/><circle cx="20" cy="20" r="10" fill="#100618"/><path d="M20,7 Q26,14 26,20 Q26,27 20,33 Q14,27 14,20 Q14,14 20,7Z" fill="#1e0830" opacity="0.8"/><path d="M7,20 Q14,14.5 20,13.5 Q26,14.5 33,20 Q26,25.5 20,26.5 Q14,25.5 7,20Z" fill="#280a3c" opacity="0.7"/><circle cx="20" cy="20" r="4" fill="#040208"/><circle cx="20" cy="20" r="2.5" fill="#5511aa" opacity="0.9"/><circle cx="20" cy="20" r="1.5" fill="#9933ff"/><circle cx="19" cy="19" r="0.8" fill="#cc99ff" opacity="0.7"/><circle cx="13" cy="14" r="0.8" fill="#5511aa" opacity="0.35"/><circle cx="27" cy="14" r="0.8" fill="#5511aa" opacity="0.35"/><circle cx="13" cy="26" r="0.8" fill="#5511aa" opacity="0.35"/><circle cx="27" cy="26" r="0.8" fill="#5511aa" opacity="0.35"/></svg>`,
art_death_mask:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M10,8 Q10,2 20,2 Q30,2 30,8 L32,28 Q30,38 20,38 Q10,38 8,28Z" fill="#c4bea8"/><path d="M12,10 Q12,5 20,5 Q28,5 28,10 L29.5,27 Q28,35 20,35 Q12,35 10.5,27Z" fill="#d8d2bc"/><ellipse cx="14" cy="18" rx="5" ry="6" fill="#0a0808"/><ellipse cx="26" cy="18" rx="5" ry="6" fill="#0a0808"/><circle cx="14" cy="18" r="3" fill="#aa1100" opacity="0.6"/><circle cx="26" cy="18" r="3" fill="#aa1100" opacity="0.6"/><circle cx="14" cy="18" r="1.8" fill="#cc2200" opacity="0.9"/><circle cx="26" cy="18" r="1.8" fill="#cc2200" opacity="0.9"/><path d="M14,29 L20,33 L26,29 L24.5,26.5 L20,28.5 L15.5,26.5Z" fill="#0a0808"/><rect x="15.5" y="27.5" width="3" height="5" rx="0.5" fill="#c4bea8"/><rect x="20.5" y="27.5" width="3" height="5.5" rx="0.5" fill="#d0cabb"/></svg>`,
art_blood_chalice:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M11,6 L14,20 Q14,28 20,28 Q26,28 26,20 L29,6Z" fill="#8a2020"/><path d="M12,7 L15,20 Q15,26 20,26 Q25,26 25,20 L28,7Z" fill="#b03030"/><line x1="11" y1="6" x2="29" y2="6" stroke="#cc4444" stroke-width="2" stroke-linecap="round"/><path d="M15,20 Q20,24 25,20" stroke="#770000" stroke-width="1" fill="none"/><rect x="18.5" y="28" width="3" height="5" fill="#8a2020"/><line x1="13" y1="33" x2="27" y2="33" stroke="#993333" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="20" cy="15" rx="5" ry="4" fill="#550000" opacity="0.7"/><ellipse cx="20" cy="14" rx="3" ry="2" fill="#aa0000" opacity="0.5"/></svg>`,
art_void_crystal:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><polygon points="20,2 30,13 28,29 20,36 12,29 10,13" fill="#080412"/><polygon points="20,2 30,13 28,29 20,36 12,29 10,13" fill="none" stroke="#5511aa" stroke-width="1.5"/><polygon points="20,2 25,13 23.5,29 20,36 16.5,29 15,13" fill="#120624" opacity="0.6"/><line x1="20" y1="2" x2="20" y2="36" stroke="#3a0a88" stroke-width="0.8" opacity="0.5"/><line x1="10" y1="13" x2="30" y2="13" stroke="#3a0a88" stroke-width="0.8" opacity="0.5"/><line x1="12" y1="29" x2="28" y2="29" stroke="#3a0a88" stroke-width="0.8" opacity="0.4"/><circle cx="20" cy="18" r="5.5" fill="#040210"/><circle cx="20" cy="18" r="3.5" fill="#3808aa" opacity="0.9"/><circle cx="20" cy="18" r="2" fill="#7722ff"/><circle cx="18.8" cy="16.8" r="0.9" fill="#bb99ff" opacity="0.7"/></svg>`,
art_heart_of_dungeon:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><path d="M20,34 Q9,25 7,17 Q5,9 14,7 Q18,6 20,12 Q22,6 26,7 Q35,9 33,17 Q31,25 20,34Z" fill="#770011"/><path d="M20,32 Q11,24 9,17 Q8,11 14.5,9 Q18,8 20,13 Q22,8 25.5,9 Q32,11 31,17 Q29,24 20,32Z" fill="#bb0022"/><path d="M20,30 Q12,22 11,17 Q10,13 15.5,11 Q18.5,10 20,13.5 Q21.5,10 24.5,11 Q30,13 29,17 Q28,22 20,30Z" fill="#ee1133"/><circle cx="17" cy="16" r="2.5" fill="#ff3355" opacity="0.5"/></svg>`,
art_philosophers_stone:`<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" fill="#06080c" rx="3"/><circle cx="20" cy="20" r="14" fill="#0c0a02"/><circle cx="20" cy="20" r="12" fill="#1a1604"/><circle cx="20" cy="20" r="9" fill="#281e06"/><circle cx="20" cy="20" r="6.5" fill="#cc9900" opacity="0.8"/><circle cx="20" cy="20" r="4.5" fill="#ddaa00" opacity="0.9"/><circle cx="20" cy="20" r="2.8" fill="#ffdd00"/><circle cx="18.5" cy="18.5" r="1.3" fill="#ffffff" opacity="0.6"/><circle cx="20" cy="20" r="13" fill="none" stroke="#cc9900" stroke-width="0.6" opacity="0.3"/><circle cx="20" cy="20" r="11" fill="none" stroke="#aa7700" stroke-width="0.5" opacity="0.2"/></svg>`
};
// ─────────────────────────────────────────────────────────────────────────────

const socket = io({ reconnectionAttempts: 5, reconnectionDelay: 2000 });

// ─── State ────────────────────────────────────────────────────────────────────
const S = {
  roomId: null,
  mySocketId: null,
  playerName: null,
  sessionToken: null,
  gameState: null,
  selectedAction: null,
  selectedAbility: null,
  selectedTarget: null,
  selectedItem: null,
  myVote: null,
  voteTimerInterval: null,
  chatOpen: false,
  bsActiveEnemyId: null,
  bsHandsSet: false,
  // Bonus system
  currentBonus: null,
  bonusExpiresAt: null,
  bonusTimerInterval: null,
  // Door challenge
  resAnimFrame: null,
  mgTimerInterval: null
};

function saveSession() {
  if (S.roomId && S.sessionToken && S.playerName) {
    localStorage.setItem('dungeon_session', JSON.stringify({
      roomId: S.roomId,
      sessionToken: S.sessionToken,
      playerName: S.playerName
    }));
  }
}

function clearSession() {
  localStorage.removeItem('dungeon_session');
  S.sessionToken = null;
}

function loadSavedSession() {
  try {
    const raw = localStorage.getItem('dungeon_session');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

(function initReconnectButton() {
  const saved = loadSavedSession();
  if (!saved) return;
  S.sessionToken = saved.sessionToken;
  const btn = document.getElementById('btn-reconnect');
  const info = document.getElementById('reconnect-saved-info');
  if (btn) {
    btn.style.display = 'inline-block';
    if (info) {
      info.style.display = 'block';
      info.textContent = `Сохранена игра: ${saved.roomId} (${saved.playerName})`;
    }
    if (saved.playerName && !document.getElementById('player-name').value) {
      document.getElementById('player-name').value = saved.playerName;
    }
  }
})();

// ─── Screen Management ────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    el.classList.add('active');
  }
}

// ─── Socket Events ────────────────────────────────────────────────────────────
socket.on('connect', () => {
  S.mySocketId = socket.id;
  console.log('Connected:', socket.id);
});

socket.on('disconnect', () => {
  showModal('Соединение потеряно', 'Попытка переподключения...', []);
});

socket.on('reconnect', () => {
  hideModal();
  const saved = loadSavedSession();
  if (saved?.roomId && saved?.sessionToken) {
    socket.emit('reconnect_game', { roomId: saved.roomId, sessionToken: saved.sessionToken }, (res) => {
      if (res?.ok) {
        S.playerName = res.playerName;
      } else if (S.roomId) {
        socket.emit('get_state', (state) => {
          if (state) { S.gameState = state; renderGameState(); }
        });
      }
    });
  } else if (S.roomId) {
    socket.emit('get_state', (state) => {
      if (state) { S.gameState = state; renderGameState(); }
    });
  }
});

socket.on('room_update', (state) => {
  S.gameState = state;
  S.roomId = state.roomId;
  renderGameState();
});

socket.on('log', (entry) => {
  appendCombatLog(entry.msg);
  if (window.Enemy3D && isEnemyAttackLog(entry.msg)) Enemy3D.triggerAttack();
});

socket.on('bonus_update', ({ bonus, expiresAt }) => {
  S.currentBonus = bonus;
  S.bonusExpiresAt = expiresAt;
  updateBonusBanner();
  startBonusTimer();
});

socket.on('chat', (entry) => {
  appendChat(entry.sender, entry.msg);
});

// ─── Main Renderer ────────────────────────────────────────────────────────────
function renderGameState() {
  if (!S.gameState) return;
  const { phase } = S.gameState;

  if (phase === 'lobby') renderLobby();
  else if (phase === 'class_select') renderClassSelect();
  else if (phase === 'playing' || phase === 'voting') renderGame();
  else if (phase === 'door_challenge') renderDoorChallenge(S.gameState);
  else if (phase === 'game_over') renderEndScreen(false);
  else if (phase === 'victory') renderEndScreen(true);
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
document.getElementById('btn-create').addEventListener('click', () => {
  const name = getPlayerName();
  if (!name) return;
  socket.emit('create_room', { playerName: name }, (res) => {
    if (!res.ok) return showError(res.reason);
    S.playerName = name;
    S.sessionToken = res.sessionToken;
    S.roomId = res.roomId;
    saveSession();
  });
});

document.getElementById('btn-join-open').addEventListener('click', () => {
  document.getElementById('join-form').classList.toggle('hidden');
});

document.getElementById('btn-join-confirm').addEventListener('click', doJoin);
document.getElementById('room-id-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') doJoin(); });
document.getElementById('player-name').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('btn-create').click(); });

function doJoin() {
  const name = getPlayerName();
  if (!name) return;
  const roomId = document.getElementById('room-id-input').value.trim().toUpperCase();
  if (!roomId) return showError('Введите код комнаты');
  socket.emit('join_room', { roomId, playerName: name }, (res) => {
    if (!res.ok) return showError(res.reason);
    S.playerName = name;
    S.sessionToken = res.sessionToken;
    S.roomId = res.roomId;
    saveSession();
  });
}

document.getElementById('btn-scores').addEventListener('click', loadScores);

document.getElementById('btn-reconnect').addEventListener('click', () => {
  const saved = loadSavedSession();
  if (!saved?.roomId || !saved?.sessionToken) return;
  socket.emit('reconnect_game', { roomId: saved.roomId, sessionToken: saved.sessionToken }, (res) => {
    if (!res.ok) {
      showError(res.reason || 'Не удалось переподключиться.');
      clearSession();
      document.getElementById('btn-reconnect').style.display = 'none';
      document.getElementById('reconnect-saved-info').style.display = 'none';
    } else {
      S.playerName = res.playerName;
    }
  });
});

function getPlayerName() {
  const name = document.getElementById('player-name').value.trim();
  if (!name) { showError('Введите имя'); return null; }
  return name;
}

function showError(msg) {
  const el = document.getElementById('menu-error');
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 3000);
}

// ─── Class Select ─────────────────────────────────────────────────────────────
function renderClassSelect() {
  showScreen('screen-class');
  const state = S.gameState;
  if (!S.mySocketId) S.mySocketId = socket.id;

  const myPlayer = state.players.find(p => p.socketId === S.mySocketId);
  const selectedClass = myPlayer?.classId;
  const allSelected = state.players.every(p => p.classId);
  const selectedCount = state.players.filter(p => p.classId).length;
  const total = state.players.length;

  // Highlight selected card
  document.querySelectorAll('.class-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.class === selectedClass);
  });

  // Status text under header
  const infoEl = document.getElementById('class-room-info');
  infoEl.innerHTML = selectedClass
    ? `✓ Выбрано: <strong style="color:var(--gold)">${selectedClass}</strong>. Нажмите «Выбрать» снова чтобы сменить класс.`
    : `Нажмите кнопку <strong>«Выбрать»</strong> под карточкой класса`;

  // Hint at footer
  const hintEl = document.getElementById('class-selected-info');
  if (selectedClass) {
    hintEl.style.color = 'var(--green)';
    hintEl.textContent = `✓ Выбран класс: ${selectedClass}. ${allSelected ? 'Нажмите Начать игру!' : ''}`;
  } else {
    hintEl.style.color = '';
    hintEl.textContent = '← Нажмите «Выбрать» под любым классом';
  }

  // Players list
  document.getElementById('class-players-list').innerHTML = state.players.map(p =>
    `<div class="player-class-badge" style="${p.classId ? 'border-color:var(--green)' : ''}">${p.name}: ${p.classId ? '✓ ' + p.classId : '...'}</div>`
  ).join('');

  // Start button (only host)
  const startBtn = document.getElementById('btn-start-from-class');
  if (myPlayer?.isHost) {
    startBtn.style.display = 'inline-block';
    startBtn.disabled = !allSelected;
    startBtn.textContent = allSelected
      ? '▶ Начать игру'
      : `Ждём выбора... (${selectedCount}/${total})`;
  } else {
    startBtn.style.display = 'none';
  }
}

document.querySelectorAll('.btn-select').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const classId = btn.dataset.class;
    socket.emit('select_class', { classId }, () => {});
  });
});

document.getElementById('btn-start-from-class').addEventListener('click', () => {
  socket.emit('start_game', (res) => {
    if (res && !res.ok) alert(res.reason || 'Не все игроки выбрали класс.');
  });
});

// ─── Lobby ────────────────────────────────────────────────────────────────────
function renderLobby() {
  showScreen('screen-lobby');
  const state = S.gameState;
  document.getElementById('lobby-room-id').textContent = state.roomId;

  const reconnectCodeEl = document.getElementById('lobby-reconnect-code');
  if (reconnectCodeEl && S.sessionToken) {
    reconnectCodeEl.textContent = `${state.roomId}-${S.sessionToken}`;
    document.getElementById('reconnect-code-row').style.display = '';
  }
  S.roomId = state.roomId;
  saveSession();

  // Sync mySocketId if somehow it got lost
  if (!S.mySocketId) S.mySocketId = socket.id;

  const myPlayer = state.players.find(p => p.socketId === S.mySocketId);
  const isHost = myPlayer?.isHost ?? state.players[0]?.isHost; // fallback: first player
  const isReady = myPlayer?.isReady ?? false;

  const playersEl = document.getElementById('lobby-players');
  playersEl.innerHTML = state.players.map(p => `
    <div class="lobby-player-card ${p.isReady ? 'ready' : ''} ${p.socketId === S.mySocketId ? 'you' : ''}">
      <div>
        <div class="lobby-player-name">${p.name} ${p.isHost ? '★' : ''} ${p.socketId === S.mySocketId ? '(Вы)' : ''}</div>
      </div>
      <div class="lobby-player-ready ${p.isReady ? 'yes' : 'no'}">${p.isReady ? '✓ Готов' : '○ Ожидание'}</div>
    </div>
  `).join('');

  const readyBtn = document.getElementById('btn-ready');
  readyBtn.textContent = isReady ? '○ Не готов' : '✓ Готов';
  readyBtn.className = `btn ${isReady ? 'btn-ghost' : 'btn-secondary'}`;

  const startBtn = document.getElementById('btn-start-game');
  if (isHost) {
    startBtn.style.display = 'inline-block';
  } else {
    startBtn.style.display = 'none';
  }

  const readyCount = state.players.filter(p => p.isReady).length;
  const total = state.players.length;
  const statusEl = document.getElementById('lobby-status');
  if (isHost) {
    statusEl.textContent = `${readyCount}/${total} готовы. Нажмите «Выбрать классы» чтобы продолжить.`;
  } else {
    statusEl.textContent = `${readyCount}/${total} готовы. Ждём хоста...`;
  }

  updateBonusBanner();
}

document.getElementById('btn-ready').addEventListener('click', () => {
  const myPlayer = S.gameState?.players.find(p => p.socketId === S.mySocketId);
  socket.emit('set_ready', { ready: !myPlayer?.isReady });
});

document.getElementById('btn-start-game').addEventListener('click', () => {
  socket.emit('start_class_select', (res) => {
    if (res && !res.ok) alert(res.reason || 'Ошибка');
  });
});

document.getElementById('btn-copy-room-id').addEventListener('click', () => {
  const id = document.getElementById('lobby-room-id').textContent;
  navigator.clipboard?.writeText(id);
  document.getElementById('btn-copy-room-id').textContent = '✓';
  setTimeout(() => { document.getElementById('btn-copy-room-id').textContent = '⎘'; }, 1500);
});

document.getElementById('btn-copy-reconnect-code').addEventListener('click', () => {
  const code = document.getElementById('lobby-reconnect-code').textContent;
  navigator.clipboard?.writeText(code);
  document.getElementById('btn-copy-reconnect-code').textContent = '✓';
  setTimeout(() => { document.getElementById('btn-copy-reconnect-code').textContent = '⎘'; }, 1500);
});

document.getElementById('btn-lobby-chat-send').addEventListener('click', sendLobbyChat);
document.getElementById('lobby-chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendLobbyChat(); });

function sendLobbyChat() {
  const input = document.getElementById('lobby-chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('chat_message', { message: msg });
  input.value = '';
}

// ─── Game ─────────────────────────────────────────────────────────────────────
let lastRenderedPhase = null;
let lastRenderedRoom = null;

function renderGame() {
  document.getElementById('door-overlay')?.classList.add('hidden');
  stopMinigameAnimations();
  showScreen('screen-game');
  const state = S.gameState;

  renderPlayerStats(state.players);
  renderMiniMap(state.mapOverview);
  renderFloorIndicator(state.floorNumber);

  if (state.currentRoom) {
    const room = state.currentRoom;

    if (lastRenderedRoom !== room.id) {
      lastRenderedRoom = room.id;
      S.bsActiveEnemyId = null;
      S.bsHandsSet = false;
      document.getElementById('room-name').textContent = `${room.symbol} ${room.name}`;
      document.getElementById('room-description').textContent = room.description;

      if (window.Combat3D) {
        const isCombatRoom = room.type === 'combat' || room.type === 'boss';
        if (isCombatRoom && room.combatGrid) {
          const c3dEl = document.getElementById('combat3d-container');
          if (c3dEl) {
            Combat3D.mount(c3dEl, {
              onCellClick: (x, z) => {
                // Ranged AoE aim mode: cell = AoE center
                if (S.abilityAimMode?.rangeType === 'ranged-aoe') {
                  const { abilityId } = S.abilityAimMode;
                  S.abilityAimMode = null;
                  Combat3D.clearAbilityAimMode?.();
                  _clearAimHint();
                  submitAction({ type: 'ability', abilityId, targetCell: { x, z } });
                  return;
                }
                if (canMoveNow()) submitMove(x, z);
              },
              onEntityClick: (id, isEnemy) => {
                // Ranged single aim mode: click in-range enemy
                if (S.abilityAimMode?.rangeType === 'ranged-single' && isEnemy) {
                  const { abilityId } = S.abilityAimMode;
                  S.abilityAimMode = null;
                  Combat3D.clearAbilityAimMode?.();
                  _clearAimHint();
                  submitAction({ type: 'ability', abilityId, targetId: id });
                  return;
                }
                if (isEnemy && S.attackAimMode && canActNow()) {
                  S.attackAimMode = false;
                  _clearAimHint();
                  submitAction({ type: 'attack', targetId: id });
                }
              }
            });
          }
        } else {
          Combat3D.unmount();
        }
      }

      const combatLogEl = document.getElementById('combat-log');
      if (state.combatLog) {
        combatLogEl.innerHTML = '';
        state.combatLog.forEach(e => appendCombatLogEl(e.msg));
      }
    }

    if (window.Combat3D && Combat3D.isActive()) {
      Combat3D.updateState(state, S.mySocketId);
    }

    renderEnemies(room);
    renderRoomActions(room, state);
    renderInitiativeOrder(state);
  }

  renderActionsBar(state);

  if (state.phase === 'voting') {
    renderVoting(state.vote);
  } else {
    const va = document.getElementById('voting-area');
    va.classList.add('hidden');
    va.classList.remove('combat-overlay');
    document.getElementById('enemies-area')?.classList.remove('combat-voting-blur');
    if (S.voteTimerInterval) { clearInterval(S.voteTimerInterval); S.voteTimerInterval = null; }
  }
}

function renderFloorIndicator(floor) {
  document.getElementById('floor-indicator').textContent = `Этаж ${floor}`;
}

function renderInitiativeOrder(state) {
  const tracker = document.getElementById('initiative-tracker');
  const list = document.getElementById('initiative-list');
  if (!tracker || !list) return;

  const room = state.currentRoom;
  if (!room || !room.initiativeOrder || (room.type !== 'combat' && room.type !== 'boss') || room.isCleared) {
    tracker.classList.add('hidden');
    return;
  }

  tracker.classList.remove('hidden');

  list.innerHTML = room.initiativeOrder.map((entry, idx) => {
    let isAlive;
    if (entry.isPlayer) {
      const p = state.players.find(p => p.socketId === entry.id);
      isAlive = p?.character?.isAlive ?? true;
    } else {
      const e = room.enemies?.find(e => e.id === entry.id);
      isAlive = e?.isAlive ?? true;
    }

    const rollText = entry.bonus > 0 ? `${entry.roll}+${entry.bonus}=${entry.total}` : `${entry.total}`;

    return `<div class="init-entry ${!isAlive ? 'init-dead' : ''} ${entry.isBoss ? 'init-boss' : ''} ${entry.isPlayer ? 'init-player' : 'init-enemy'} ${room.currentTurnEntityId === entry.id ? 'init-current' : ''}">
      <span class="init-pos">${idx + 1}</span>
      <span class="init-sym">${entry.symbol}</span>
      <span class="init-name">${entry.name}</span>
      <span class="init-roll">⚄${rollText}</span>
    </div>`;
  }).join('');
}

function renderPlayerStats(players) {
  const el = document.getElementById('player-stats-list');
  el.innerHTML = players.map(p => {
    const ch = p.character;
    if (!ch) return `<div class="player-stat-card"><div class="psc-name">${p.name}</div></div>`;

    const hpPct = ch.maxHp > 0 ? Math.max(0, (ch.hp / ch.maxHp) * 100) : 0;
    let hpClass = 'full';
    if (hpPct < 25) hpClass = 'critical';
    else if (hpPct < 50) hpClass = 'low';
    else if (hpPct < 75) hpClass = 'mid';

    const mp = ch.mp ?? 0;
    const maxMp = ch.maxMp ?? 0;
    const mpPct = maxMp > 0 ? Math.max(0, Math.min(100, (mp / maxMp) * 100)) : 0;
    let mpClass = '';
    if (mpPct <= 0) mpClass = 'mp-empty';
    else if (mpPct < 30) mpClass = 'mp-low';

    const effects = renderEffectBadges(ch.effects || []);
    const isMe = p.socketId === S.mySocketId;

<<<<<<< HEAD
    const ultKills = ch.ultKills || 0;
    const ultNeeded = ch.ultKillsNeeded || 5;
    const ultReady = ch.ultReady || false;
    const ultPct = Math.min(100, Math.round((ultKills / ultNeeded) * 100));
    let ultClass = 'ult-empty';
    if (ultReady) ultClass = 'ult-ready';
    else if (ultKills >= Math.floor(ultNeeded * 0.4)) ultClass = 'ult-charging';

    const ultTitle = ch.ultName ? `${ch.ultName}: ${ch.ultDescription || ''}` : 'Ульта не готова';
    const orbClickable = isMe && ultReady ? 'ult-orb-btn' : '';
    const orbRole = isMe && ultReady ? 'button' : '';

    return `
      <div class="player-stat-card ${!ch.isAlive ? 'dead' : ''}" id="psc-${p.socketId}">
        <div class="psc-header">
          <div class="ult-orb ${!ch.isAlive ? 'ult-dead' : ultClass} ${orbClickable}"
               ${orbRole ? `role="${orbRole}"` : ''}
               data-socketid="${p.socketId}"
               data-ult-name="${(ch.ultName || 'Ульта').replace(/"/g, '&quot;')}"
               data-ult-desc="${(ch.ultDescription || '').replace(/"/g, '&quot;')}"
               data-ult-ready="${ultReady ? '1' : '0'}"
               data-ult-kills="${ultKills}"
               data-ult-needed="${ultNeeded}">
            <span class="ult-orb-icon">${ultReady ? '★' : ultKills > 0 ? ultKills : '○'}</span>
          </div>
=======
    return `
      <div class="player-stat-card ${!ch.isAlive ? 'dead' : ''}" id="psc-${p.socketId}">
        <div class="psc-header">
>>>>>>> eb20a372805b03e5b77f22be3660b26ce694cd21
          <div class="psc-name">${ch.symbol} ${p.name}${isMe ? ' ◄' : ''}${p.isHost ? ' ★' : ''}${ch.isAI ? ' 🤖' : ''}</div>
          <div class="psc-class">${ch.className} Lv${ch.level}</div>
        </div>
        <div class="hp-bar-container">
          <div class="hp-bar-fill ${hpClass}" style="width:${hpPct}%"></div>
        </div>
        <div class="psc-hp-text">
          <span>${ch.hp}/${ch.maxHp} HP</span>
          <span class="psc-acted ${ch.hasActed ? 'done' : ''}">${ch.hasActed ? '✓ Ход' : '○ Ждёт'}</span>
        </div>
        <div class="mp-bar-container">
          <div class="mp-bar-fill ${mpClass}" style="width:${mpPct}%"></div>
        </div>
        <div class="psc-mp-text">⬡ ${mp}/${maxMp} MP</div>
        <div class="psc-stats-mini">
          <span>⚔${ch.attack}</span>
          <span>🛡${ch.defense}</span>
          <span>💰${ch.gold}</span>
          <span>🧪${ch.potions}</span>
        </div>
        ${effects ? `<div class="psc-effects">${effects}</div>` : ''}
      </div>
    `;
  }).join('');
<<<<<<< HEAD

  // Wire up ult orb click handlers after rendering
  el.querySelectorAll('.ult-orb-btn').forEach(orbEl => {
    orbEl.addEventListener('click', () => {
      const sid = orbEl.dataset.socketid;
      if (sid !== S.mySocketId) return;
      const myPlayer = S.gameState?.players?.find(p => p.socketId === S.mySocketId);
      if (!myPlayer?.character?.ultReady) return;
      socket.emit('player_action', { type: 'ultimate' });
    });
  });
=======
>>>>>>> eb20a372805b03e5b77f22be3660b26ce694cd21
}

function renderEffectBadges(effects) {
  return effects.map(e => {
    let label = e.type;
    let cls = 'buff';
    if (e.type === 'poison') { label = `☠ Яд(${e.duration})`; cls = 'poison'; }
    else if (e.type === 'stun') { label = `⚡ Оглушён(${e.duration})`; cls = 'stun'; }
    else if (e.type === 'invulnerable') { label = `✦ Неуязв`; cls = 'invulnerable'; }
    else if (e.type === 'attackBonus') { label = `↑Атк(${e.duration})`; cls = 'buff'; }
    else if (e.type === 'defenseBonus') { label = `↑Защ(${e.duration})`; cls = 'buff'; }
    else if (e.type === 'shadowStep') { label = `🌑 Тень`; cls = 'buff'; }
    else return '';
    return `<span class="effect-badge ${cls}">${label}</span>`;
  }).join('');
}

function renderMiniMap(mapData) {
  if (!mapData) return;
  const el = document.getElementById('minimap');

  const W = 370, H = 200;

  const xs = mapData.map(r => r.mapX ?? 0);
  const ys = mapData.map(r => r.mapY ?? 0);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const rangeX = Math.max(maxX - minX, 0);
  const rangeY = Math.max(maxY - minY, 0);

  // Dynamic step sizes that scale to fit the viewport
  const maxStepX = rangeX > 0 ? (W - 50) / rangeX : W;
  const maxStepY = rangeY > 0 ? (H - 40) / rangeY : H;
  const STEP_X = Math.min(maxStepX, 48);
  const STEP_Y = Math.min(maxStepY, 32);
  const sc = Math.min(STEP_X / 48, STEP_Y / 32);
  const RW = Math.max(Math.round(24 * sc), 10);
  const RH = Math.max(Math.round(16 * sc), 7);
  const CORR = Math.max(Math.round(6 * sc), 3);

  const totalW = rangeX * STEP_X + RW;
  const totalH = rangeY * STEP_Y + RH;
  const offX = (W - totalW) / 2;
  const offY = (H - totalH) / 2;

  const rCX = r => offX + ((r.mapX ?? 0) - minX) * STEP_X + RW / 2;
  const rCY = r => offY + ((r.mapY ?? 0) - minY) * STEP_Y + RH / 2;

  const roomMap = new Map(mapData.map(r => [r.id, r]));

  // Rooms adjacent to visited/current (visible but not yet entered)
  const adjUnvisited = new Set();
  for (const r of mapData) {
    if (r.isVisited || r.isCurrent) {
      for (const c of (r.connections || [])) {
        const t = roomMap.get(c.to);
        if (t && !t.isVisited && !t.isCurrent) adjUnvisited.add(c.to);
      }
    }
  }

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">`;

  // Stone tile background pattern
  svg += `<defs>
    <pattern id="mp_tile" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="#060810"/>
      <rect x="0" y="0" width="5" height="5" fill="#07091280" opacity="1"/>
      <rect x="5" y="5" width="5" height="5" fill="#07091280" opacity="1"/>
    </pattern>
    <filter id="mp_blur"><feGaussianBlur stdDeviation="1.5"/></filter>
  </defs>`;
  svg += `<rect width="${W}" height="${H}" fill="url(#mp_tile)"/>`;

  // Draw corridors under rooms (L-shaped paths between room centers)
  for (const r of mapData) {
    const vis = r.isVisited || r.isCurrent;
    if (!vis && !adjUnvisited.has(r.id)) continue;

    const cx1 = rCX(r), cy1 = rCY(r);

    for (const conn of (r.connections || [])) {
      const target = roomMap.get(conn.to);
      if (!target) continue;
      const cx2 = rCX(target), cy2 = rCY(target);

      let corrColor, corrOpacity;
      if (r.isCurrent || target.isCurrent) { corrColor = '#3c2a44'; corrOpacity = 0.95; }
      else if (r.isVisited && target.isVisited) { corrColor = '#28203a'; corrOpacity = 1; }
      else if (vis) { corrColor = '#14101e'; corrOpacity = 0.7; }
      else { corrColor = '#0d0b14'; corrOpacity = 0.35; }

      // L-shaped corridor: vertical segment from r, then horizontal to target
      const pathD = Math.abs(cx1 - cx2) < 1
        ? `M ${cx1.toFixed(1)} ${cy1.toFixed(1)} L ${cx2.toFixed(1)} ${cy2.toFixed(1)}`
        : `M ${cx1.toFixed(1)} ${cy1.toFixed(1)} L ${cx1.toFixed(1)} ${cy2.toFixed(1)} L ${cx2.toFixed(1)} ${cy2.toFixed(1)}`;

      svg += `<path d="${pathD}" stroke="${corrColor}" stroke-width="${CORR}" fill="none" opacity="${corrOpacity}" stroke-linejoin="round" stroke-linecap="square"/>`;
    }
  }

  // Draw room rectangles
  for (const r of mapData) {
    const vis = r.isVisited || r.isCurrent;
    const dim = adjUnvisited.has(r.id);
    if (!vis && !dim) continue;

    const cx = rCX(r), cy = rCY(r);
    const rx = cx - RW / 2, ry = cy - RH / 2;

    let wallColor, floorFill, floorStroke, symColor;

    if (r.isCurrent) {
      wallColor = '#5a1a10'; floorFill = '#2e1218'; floorStroke = '#cc3322'; symColor = '#ff7755';
    } else if (r.type === 'boss' && r.isVisited) {
      wallColor = '#3a1008'; floorFill = '#1e0a0a'; floorStroke = '#7a1a10'; symColor = '#cc3322';
    } else if (r.type === 'boss') {
      wallColor = '#1e0a08'; floorFill = '#100608'; floorStroke = '#3a1010'; symColor = '#552010';
    } else if (r.isVisited && r.isCleared) {
      wallColor = '#1e1c2c'; floorFill = '#18162000'; floorStroke = '#26223a'; symColor = '#4a4465';
    } else if (r.isVisited) {
      wallColor = '#221828'; floorFill = '#1c1424'; floorStroke = '#302040'; symColor = '#6a4878';
    } else {
      // Adjacent unvisited - faint fog-of-war
      wallColor = '#100e18'; floorFill = '#0c0a12'; floorStroke = '#18141e'; symColor = '#221c2e';
    }

    // Outer stone wall shadow
    svg += `<rect x="${(rx - 2).toFixed(1)}" y="${(ry - 2).toFixed(1)}" width="${RW + 4}" height="${RH + 4}" fill="${wallColor}" rx="2"/>`;
    // Room floor
    svg += `<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${RW}" height="${RH}" fill="${wallColor}" stroke="${floorStroke}" stroke-width="1" rx="1"/>`;
    // Inner floor (slightly lighter center)
    if (RW > 10 && RH > 7) {
      svg += `<rect x="${(rx + 1.5).toFixed(1)}" y="${(ry + 1.5).toFixed(1)}" width="${RW - 3}" height="${RH - 3}" fill="${vis ? (r.isCurrent ? '#3a1a20' : '#1e1c2a') : '#0e0c14'}" rx="1" opacity="0.9"/>`;
    }

    // Stone floor lines (subtle texture)
    if (vis && RH > 9) {
      const lineAlpha = r.isCurrent ? '30' : '1a';
      const lineColor = r.isCurrent ? `#ff6040${lineAlpha}` : `#8070a0${lineAlpha}`;
      svg += `<line x1="${(rx+2).toFixed(1)}" y1="${(ry + RH*0.4).toFixed(1)}" x2="${(rx+RW-2).toFixed(1)}" y2="${(ry + RH*0.4).toFixed(1)}" stroke="${lineColor}" stroke-width="0.5"/>`;
      svg += `<line x1="${(rx+2).toFixed(1)}" y1="${(ry + RH*0.7).toFixed(1)}" x2="${(rx+RW-2).toFixed(1)}" y2="${(ry + RH*0.7).toFixed(1)}" stroke="${lineColor}" stroke-width="0.5"/>`;
    }

    // Room type symbol
    if (vis) {
      const fSize = Math.max(Math.round(7 * sc), 5);
      svg += `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-size="${fSize}" fill="${symColor}" font-family="monospace">${r.symbol || '?'}</text>`;
    }

    // Current room indicator glow + dot
    if (r.isCurrent) {
      svg += `<rect x="${(rx - 1.5).toFixed(1)}" y="${(ry - 1.5).toFixed(1)}" width="${RW + 3}" height="${RH + 3}" fill="none" stroke="#cc3322" stroke-width="1.5" rx="2" opacity="0.7"/>`;
      svg += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.5" fill="#ff5533"/>`;
    }
  }

  svg += '</svg>';
  el.innerHTML = svg;
}

// ─── FP Hands SVGs (first-person weapon view per class) ───────────────────────
const FP_HANDS = {
warrior: {
  right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="30,230 220,230 210,190 40,190" fill="#c08858"/>
    <polygon points="32,228 218,228 208,194 42,194" fill="#b07848" opacity="0.5"/>
    <polygon points="30,230 220,230 210,205 40,205" fill="#1e2840"/>
    <polygon points="32,228 218,228 208,207 42,207" fill="#2a3450"/>
    <line x1="32" y1="210" x2="218" y2="210" stroke="#3a4460" stroke-width="1.5" opacity="0.8"/>
    <line x1="50" y1="207" x2="50" y2="230" stroke="#3a4460" stroke-width="1" opacity="0.5"/>
    <line x1="100" y1="207" x2="100" y2="230" stroke="#3a4460" stroke-width="1" opacity="0.5"/>
    <line x1="150" y1="207" x2="150" y2="230" stroke="#3a4460" stroke-width="1" opacity="0.5"/>
    <line x1="200" y1="207" x2="200" y2="230" stroke="#3a4460" stroke-width="1" opacity="0.5"/>
    <ellipse cx="110" cy="196" rx="38" ry="22" fill="#c08858"/>
    <ellipse cx="88" cy="188" rx="9" ry="6" fill="#d0a878" opacity="0.6"/>
    <ellipse cx="103" cy="185" rx="9" ry="6" fill="#d0a878" opacity="0.6"/>
    <ellipse cx="118" cy="185" rx="9" ry="6" fill="#d0a878" opacity="0.6"/>
    <ellipse cx="133" cy="188" rx="8" ry="5" fill="#d0a878" opacity="0.6"/>
    <rect x="82" y="173" width="12" height="22" rx="5" fill="#a87848"/>
    <rect x="95" y="170" width="12" height="25" rx="5" fill="#a87848"/>
    <rect x="108" y="170" width="12" height="25" rx="5" fill="#a87848"/>
    <rect x="121" y="172" width="11" height="22" rx="5" fill="#a87848"/>
    <rect x="94" y="25" width="22" height="155" rx="5" fill="#5a3010"/>
    <rect x="97" y="26" width="16" height="153" rx="4" fill="#7a4520"/>
    <line x1="94" y1="55" x2="116" y2="55" stroke="#3a1a05" stroke-width="2.5"/>
    <line x1="94" y1="75" x2="116" y2="75" stroke="#3a1a05" stroke-width="2.5"/>
    <line x1="94" y1="95" x2="116" y2="95" stroke="#3a1a05" stroke-width="2.5"/>
    <line x1="94" y1="115" x2="116" y2="115" stroke="#3a1a05" stroke-width="2.5"/>
    <line x1="94" y1="135" x2="116" y2="135" stroke="#3a1a05" stroke-width="2.5"/>
    <line x1="94" y1="155" x2="116" y2="155" stroke="#3a1a05" stroke-width="2.5"/>
    <rect x="70" y="15" width="70" height="12" rx="5" fill="#b88c00"/>
    <rect x="72" y="16" width="66" height="6" fill="#ddbb00" opacity="0.5"/>
    <polygon points="97,0 108,0 118,15 87,15" fill="#9ab0b8"/>
    <polygon points="99,2 107,2 115,14 90,14" fill="#d8eeff" opacity="0.4"/>
    <line x1="108" y1="0" x2="118" y2="15" stroke="#e8f8ff" stroke-width="1.5" opacity="0.5"/>
    <polygon points="100,100 108,100 112,130 96,130" fill="#660000" opacity="0.35"/>
  </svg>`,
  left: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="0,230 195,230 180,190 10,190" fill="#c08858"/>
    <polygon points="2,228 193,228 178,194 12,194" fill="#b07848" opacity="0.5"/>
    <polygon points="0,230 195,230 180,205 10,205" fill="#1e2840"/>
    <polygon points="2,228 193,228 178,207 12,207" fill="#2a3450"/>
    <line x1="2" y1="210" x2="193" y2="210" stroke="#3a4460" stroke-width="1.5" opacity="0.8"/>
    <polygon points="0,20 58,0 72,210 0,230" fill="#1a1834" opacity="0.97"/>
    <polygon points="3,24 55,5 69,208 3,226" fill="#262050"/>
    <rect x="3" y="22" width="52" height="3" fill="#b88c00"/>
    <rect x="3" y="204" width="65" height="3" fill="#b88c00"/>
    <line x1="3" y1="113" x2="60" y2="110" stroke="#b88c00" stroke-width="2"/>
    <rect x="14" y="55" width="5" height="100" fill="#770000"/>
    <rect x="5" y="103" width="52" height="5" fill="#770000"/>
    <circle cx="18" cy="108" r="11" fill="#b88c00"/>
    <circle cx="18" cy="108" r="7" fill="#886200"/>
    <circle cx="18" cy="108" r="3.5" fill="#ddbb00"/>
    <ellipse cx="80" cy="196" rx="32" ry="20" fill="#c08858"/>
    <rect x="66" y="182" width="11" height="20" rx="4" fill="#a87848"/>
    <rect x="77" y="179" width="11" height="23" rx="4" fill="#a87848"/>
    <rect x="89" y="179" width="11" height="23" rx="4" fill="#a87848"/>
  </svg>`
},
mage: {
  right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="30,230 220,230 210,190 40,190" fill="#141e48"/>
    <polygon points="32,228 218,228 208,192 42,192" fill="#1a2858" opacity="0.7"/>
    <rect x="30" y="190" width="190" height="6" fill="#3355cc" opacity="0.6"/>
    <ellipse cx="110" cy="196" rx="34" ry="18" fill="#c0a888"/>
    <rect x="85" y="175" width="10" height="26" rx="4" fill="#a89070"/>
    <rect x="95" y="172" width="10" height="29" rx="4" fill="#a89070"/>
    <rect x="106" y="172" width="10" height="29" rx="4" fill="#a89070"/>
    <rect x="117" y="174" width="9" height="26" rx="4" fill="#a89070"/>
    <rect x="99" y="30" width="12" height="160" rx="4" fill="#6a5030"/>
    <rect x="101" y="32" width="8" height="156" rx="3" fill="#8a6840"/>
    <line x1="99" y1="65" x2="111" y2="65" stroke="#4488cc" stroke-width="1" opacity="0.7"/>
    <line x1="99" y1="105" x2="111" y2="105" stroke="#4488cc" stroke-width="1" opacity="0.7"/>
    <line x1="99" y1="145" x2="111" y2="145" stroke="#4488cc" stroke-width="1" opacity="0.7"/>
    <circle cx="105" cy="16" r="16" fill="#001428" stroke="#66ccff" stroke-width="2"/>
    <circle cx="105" cy="16" r="11" fill="#003060"/>
    <circle cx="105" cy="16" r="7" fill="#4488cc"/>
    <circle cx="105" cy="16" r="3.5" fill="#88ddff"/>
    <circle cx="105" cy="16" r="20" fill="none" stroke="#44aaff" stroke-width="1" opacity="0.4"/>
    <circle cx="85" cy="10" r="2.5" fill="#88ddff" opacity="0.7"/>
    <circle cx="125" cy="8" r="2" fill="#88ddff" opacity="0.7"/>
    <circle cx="91" cy="28" r="2" fill="#88ddff" opacity="0.5"/>
    <circle cx="119" cy="26" r="2.5" fill="#88ddff" opacity="0.5"/>
  </svg>`,
  left: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="0,230 195,230 180,190 10,190" fill="#141e48"/>
    <polygon points="2,228 193,228 178,192 12,192" fill="#1a2858" opacity="0.7"/>
    <rect x="0" y="190" width="195" height="6" fill="#3355cc" opacity="0.6"/>
    <ellipse cx="90" cy="196" rx="34" ry="18" fill="#c0a888"/>
    <rect x="60" y="160" width="10" height="34" rx="5" fill="#a89070" style="transform-origin:65px 160px; transform:rotate(-14deg)"/>
    <rect x="75" y="155" width="10" height="38" rx="5" fill="#a89070" style="transform-origin:80px 155px; transform:rotate(-6deg)"/>
    <rect x="90" y="152" width="10" height="42" rx="5" fill="#a89070"/>
    <rect x="105" y="155" width="10" height="38" rx="5" fill="#a89070" style="transform-origin:110px 155px; transform:rotate(6deg)"/>
    <rect x="119" y="162" width="9" height="32" rx="5" fill="#a89070" style="transform-origin:124px 162px; transform:rotate(14deg)"/>
    <circle cx="92" cy="155" r="9" fill="#4488ff" opacity="0.35"/>
    <circle cx="92" cy="148" r="13" fill="#6699ff" opacity="0.25"/>
    <circle cx="92" cy="142" r="18" fill="#4488ff" opacity="0.15"/>
    <ellipse cx="92" cy="162" rx="22" ry="14" fill="#aabbff" opacity="0.2"/>
    <circle cx="92" cy="160" r="5" fill="#ccddff" opacity="0.4"/>
  </svg>`
},
rogue: {
  right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="20,230 215,230 205,190 30,190" fill="#1a1218"/>
    <polygon points="22,228 213,228 203,192 32,192" fill="#241820"/>
    <circle cx="48" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="70" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="92" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="155" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="177" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="199" cy="197" r="3.5" fill="#5533aa"/>
    <ellipse cx="110" cy="202" rx="36" ry="20" fill="#c08050"/>
    <rect x="93" y="188" width="10" height="20" rx="4" fill="#a07040"/>
    <rect x="104" y="185" width="10" height="23" rx="4" fill="#a07040"/>
    <rect x="115" y="185" width="10" height="23" rx="4" fill="#a07040"/>
    <rect x="126" y="188" width="9" height="20" rx="4" fill="#a07040"/>
    <rect x="76" y="205" width="28" height="20" rx="4" fill="#3a2070"/>
    <line x1="76" y1="212" x2="104" y2="212" stroke="#220a50" stroke-width="2.5"/>
    <line x1="76" y1="219" x2="104" y2="219" stroke="#220a50" stroke-width="2.5"/>
    <rect x="72" y="197" width="36" height="10" rx="3" fill="#5533aa"/>
    <polygon points="82,0 96,0 110,197 68,197" fill="#484868"/>
    <polygon points="84,2 94,2 106,100 72,105" fill="#8080a8" opacity="0.5"/>
    <line x1="96" y1="0" x2="110" y2="197" stroke="#9090bb" stroke-width="1" opacity="0.6"/>
    <polygon points="90,100 97,100 102,130 85,130" fill="#220060" opacity="0.3"/>
  </svg>`,
  left: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="5,230 200,230 190,190 15,190" fill="#1a1218"/>
    <polygon points="7,228 198,228 188,192 17,192" fill="#241820"/>
    <circle cx="30" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="52" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="130" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="152" cy="197" r="3.5" fill="#5533aa"/>
    <circle cx="174" cy="197" r="3.5" fill="#5533aa"/>
    <ellipse cx="95" cy="202" rx="36" ry="20" fill="#c08050"/>
    <rect x="78" y="188" width="10" height="20" rx="4" fill="#a07040"/>
    <rect x="89" y="185" width="10" height="23" rx="4" fill="#a07040"/>
    <rect x="100" y="185" width="10" height="23" rx="4" fill="#a07040"/>
    <rect x="111" y="188" width="9" height="20" rx="4" fill="#a07040"/>
    <rect x="87" y="205" width="28" height="20" rx="4" fill="#3a2070"/>
    <line x1="87" y1="212" x2="115" y2="212" stroke="#220a50" stroke-width="2.5"/>
    <line x1="87" y1="219" x2="115" y2="219" stroke="#220a50" stroke-width="2.5"/>
    <rect x="82" y="197" width="36" height="10" rx="3" fill="#5533aa"/>
    <polygon points="105,0 119,0 135,197 98,200" fill="#484868"/>
    <polygon points="107,2 117,2 130,100 100,105" fill="#8080a8" opacity="0.5"/>
    <line x1="119" y1="0" x2="135" y2="197" stroke="#9090bb" stroke-width="1" opacity="0.6"/>
  </svg>`
},
cleric: {
  right: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="30,230 220,230 210,190 40,190" fill="#101820"/>
    <polygon points="32,228 218,228 208,192 42,192" fill="#162030" opacity="0.8"/>
    <rect x="30" y="190" width="190" height="6" fill="#cc9900" opacity="0.55"/>
    <ellipse cx="110" cy="197" rx="35" ry="21" fill="#c0a888"/>
    <rect x="87" y="177" width="11" height="26" rx="5" fill="#a89070"/>
    <rect x="98" y="174" width="11" height="29" rx="5" fill="#a89070"/>
    <rect x="110" y="174" width="11" height="29" rx="5" fill="#a89070"/>
    <rect x="121" y="177" width="10" height="26" rx="5" fill="#a89070"/>
    <rect x="100" y="25" width="14" height="160" rx="4" fill="#7a5030"/>
    <rect x="102" y="27" width="10" height="156" rx="3" fill="#9a6a40"/>
    <ellipse cx="107" cy="16" rx="19" ry="17" fill="#5a6070"/>
    <polygon points="95,7 107,4 119,7 117,22 95,22" fill="#6a7080"/>
    <polygon points="88,16 104,8 106,15 90,20" fill="#6a7080"/>
    <polygon points="126,16 110,8 108,15 124,20" fill="#6a7080"/>
    <polygon points="88,16 104,24 106,17 90,12" fill="#6a7080"/>
    <polygon points="126,16 110,24 108,17 124,12" fill="#6a7080"/>
    <line x1="107" y1="7" x2="107" y2="25" stroke="#ddaa00" stroke-width="2.5"/>
    <line x1="98" y1="16" x2="116" y2="16" stroke="#ddaa00" stroke-width="2.5"/>
    <circle cx="107" cy="16" r="28" fill="rgba(200,180,50,0.12)"/>
    <circle cx="107" cy="16" r="35" fill="rgba(200,180,50,0.07)"/>
  </svg>`,
  left: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 230">
    <polygon points="0,230 195,230 180,190 10,190" fill="#101820"/>
    <polygon points="2,228 193,228 178,192 12,192" fill="#162030" opacity="0.8"/>
    <rect x="0" y="190" width="195" height="6" fill="#cc9900" opacity="0.55"/>
    <ellipse cx="90" cy="197" rx="35" ry="21" fill="#c0a888"/>
    <rect x="84" y="146" width="13" height="52" rx="6" fill="#a89070"/>
    <rect x="68" y="175" width="12" height="26" rx="5" fill="#a89070"/>
    <rect x="100" y="178" width="11" height="23" rx="5" fill="#a89070"/>
    <rect x="112" y="180" width="10" height="21" rx="5" fill="#a89070"/>
    <rect x="73" y="176" width="11" height="22" rx="4" style="transform:rotate(14deg); transform-origin:78px 176px;" fill="#a89070"/>
    <ellipse cx="90" cy="142" rx="10" ry="6" fill="#ddcc88" opacity="0.45"/>
    <ellipse cx="90" cy="136" rx="14" ry="9" fill="#ddcc88" opacity="0.28"/>
    <ellipse cx="90" cy="130" rx="18" ry="12" fill="#ddcc88" opacity="0.16"/>
    <circle cx="90" cy="128" r="5" fill="#ffe88a" opacity="0.35"/>
  </svg>`
}
};

// ─── Battle Scene ─────────────────────────────────────────────────────────────
function renderEnemies(room) {
  const area = document.getElementById('enemies-area');

  if (window.Combat3D && Combat3D.isActive()) {
    area.classList.remove('hidden');
    return;
  }

  const enemyZone = document.getElementById('bs-enemy-zone');
  const hasRoom3D = !!window.Room3D;

  const hasEnemies = room.enemies && room.enemies.length > 0 && room.type !== 'start';

  // With Room3D: always show area (room view is background); without it: old behavior
  if (hasRoom3D) {
    area.classList.remove('hidden');
  } else if (!hasEnemies) {
    area.classList.add('hidden');
    S.bsActiveEnemyId = null;
    S.bsHandsSet = false;
    if (window.Hands3D) Hands3D.unmount();
    return;
  } else {
    area.classList.remove('hidden');
  }

  if (!hasEnemies) {
    enemyZone?.classList.add('hidden');
    document.getElementById('bs-nav')?.classList.add('hidden');
    S.bsActiveEnemyId = null;
    return;
  }

  enemyZone?.classList.remove('hidden');
  document.getElementById('bs-nav')?.classList.remove('hidden');

  // Ensure active enemy points to a valid alive enemy
  const alive = room.enemies.filter(e => e.isAlive);
  if (!S.bsActiveEnemyId || !room.enemies.find(e => e.id === S.bsActiveEnemyId)) {
    S.bsActiveEnemyId = alive[0]?.id || room.enemies[0]?.id;
  }

  // Set class-specific hands once
  if (!S.bsHandsSet) {
    const ch = getMyChar();
    setBsHands(ch?.classId || 'warrior');
    S.bsHandsSet = true;
  }

  const enemy = room.enemies.find(e => e.id === S.bsActiveEnemyId);
  if (enemy) {
    const portEl = document.getElementById('bs-portrait');
    const wasAlive = portEl && !portEl.classList.contains('dead') && !portEl.classList.contains('dying');
    if (wasAlive && !enemy.isAlive) {
      // Enemy just died — play death anim then switch
      playBsEnemyDeath();
      setTimeout(() => {
        const nextAlive = room.enemies.find(e => e.isAlive);
        if (nextAlive) {
          S.bsActiveEnemyId = nextAlive.id;
          updateBsEnemy(nextAlive);
          updateBsNav(room.enemies);
        } else {
          updateBsEnemy(enemy);
          updateBsNav(room.enemies);
        }
      }, 950);
    } else {
      updateBsEnemy(enemy);
    }
  }
  updateBsNav(room.enemies);

  // Show/hide attack target cursor
  const isCombat = room.type === 'combat' || room.type === 'boss';
  const canAct = canActNow();
  const container = document.getElementById('bs-portrait-container');
  if (container) {
    container.classList.toggle('attack-target', isCombat && canAct);
    document.getElementById('bs-enemy-zone')?.classList.toggle('selectable', isCombat);
  }
}

function setBsHands(classId) {
  if (window.Hands3D) {
    const left = document.getElementById('bs-hand-left');
    const right = document.getElementById('bs-hand-right');
    if (left) left.style.display = 'none';
    if (right) right.style.display = 'none';
    Hands3D.mount(classId, document.getElementById('bs-hands'));
  } else {
    const hands = FP_HANDS[classId] || FP_HANDS.warrior;
    const left = document.getElementById('bs-hand-left');
    const right = document.getElementById('bs-hand-right');
    if (left) left.innerHTML = hands.left;
    if (right) right.innerHTML = hands.right;
  }
}

function updateBsEnemy(enemy) {
  const hpPct = enemy.maxHp > 0 ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0;
  const portrait = ENEMY_SVG[enemy.typeId] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90"><rect width="80" height="90" fill="#060810"/><text x="40" y="54" text-anchor="middle" font-size="36" fill="#c0392b">${enemy.symbol}</text></svg>`;

  const nameEl = document.getElementById('bs-enemy-name-lbl');
  const hpFill = document.getElementById('bs-hp-fill');
  const hpText = document.getElementById('bs-hp-text');
  const portEl = document.getElementById('bs-portrait');
  const effectsEl = document.getElementById('bs-effects-row');

  if (nameEl) nameEl.textContent = enemy.name + (enemy.isBoss ? ' [БОСС]' : '');
  if (hpText) hpText.textContent = `${enemy.hp}/${enemy.maxHp}`;

  if (hpFill) {
    hpFill.style.width = hpPct + '%';
    hpFill.className = 'bs-hp-fill' +
      (hpPct > 75 ? '' : hpPct > 50 ? ' mid' : hpPct > 25 ? ' low' : ' crit');
  }

  if (portEl) {
    if (portEl.dataset.e3dEid !== enemy.id) {
      portEl.dataset.e3dEid = enemy.id;
      if (window.Enemy3D) {
        Enemy3D.mount(enemy.typeId, portEl, enemy.isBoss);
      } else {
        portEl.innerHTML = portrait;
        portEl.querySelector('svg')?.setAttribute('data-eid', enemy.id);
      }
    }
    portEl.className = 'bs-portrait' +
      (enemy.isBoss ? ' boss' : '') +
      (!enemy.isAlive ? ' dead' : '');
  }

  if (effectsEl) {
    effectsEl.innerHTML = (enemy.effects || []).map(ef => {
      if (ef.type === 'poison') return `<span class="effect-badge poison">☠</span>`;
      if (ef.type === 'stun') return `<span class="effect-badge stun">⚡</span>`;
      return '';
    }).join('');
  }
}

function updateBsNav(enemies) {
  const nav = document.getElementById('bs-nav');
  if (!nav) return;
  if (enemies.length <= 1) { nav.innerHTML = ''; return; }

  nav.innerHTML = enemies.map(e => {
    const hpPct = e.maxHp > 0 ? Math.max(0, (e.hp / e.maxHp) * 100) : 0;
    const portrait = ENEMY_SVG[e.typeId] || `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90"><rect width="80" height="90" fill="#060810"/><text x="40" y="54" text-anchor="middle" font-size="20" fill="#c0392b">${e.symbol}</text></svg>`;
    return `
      <div class="bs-nav-thumb ${e.id === S.bsActiveEnemyId ? 'active' : ''} ${!e.isAlive ? 'dead' : ''}"
           onclick="bsSwitchEnemy('${e.id}')">
        ${portrait}
        <div class="bs-nav-hp"><div class="bs-nav-hp-fill" style="width:${hpPct}%"></div></div>
      </div>
    `;
  }).join('');
}

function bsSwitchEnemy(id) {
  const room = S.gameState?.currentRoom;
  if (!room) return;
  const enemy = room.enemies.find(e => e.id === id);
  if (!enemy) return;
  S.bsActiveEnemyId = id;
  updateBsEnemy(enemy);
  updateBsNav(room.enemies);
}

function bsSelectEnemy() {
  if (!S.bsActiveEnemyId) return;
  const enemy = S.gameState?.currentRoom?.enemies?.find(e => e.id === S.bsActiveEnemyId);
  if (!enemy || !enemy.isAlive) return;

  if (S.selectedAction === 'attack') {
    submitAction({ type: 'attack', targetId: S.bsActiveEnemyId });
  } else if (S.selectedAction === 'ability' && S.selectedAbility) {
    const ability = getMyAbility(S.selectedAbility);
    if (ability && needsTarget(ability) && ability.target === 'single') {
      submitAction({ type: 'ability', abilityId: S.selectedAbility, targetId: S.bsActiveEnemyId });
    }
  }
}

// called when ability-select panel's target-btn is clicked in 2D with ability aim


function playBsAttack() {
  if (window.Hands3D) {
    Hands3D.triggerAttack();
  } else {
    const handR = document.getElementById('bs-hand-right');
    if (!handR) return;
    handR.classList.remove('attacking');
    void handR.offsetWidth;
    handR.classList.add('attacking');
    handR.addEventListener('animationend', () => handR.classList.remove('attacking'), { once: true });
  }
}

function playBsEnemyHit() {
  if (window.Enemy3D) {
    Enemy3D.triggerHit();
  } else {
    const portEl = document.getElementById('bs-portrait');
    if (portEl) {
      portEl.classList.remove('hit');
      void portEl.offsetWidth;
      portEl.classList.add('hit');
      portEl.addEventListener('animationend', () => portEl.classList.remove('hit'), { once: true });
    }
  }
  const flash = document.getElementById('bs-hit-flash');
  if (flash) {
    flash.classList.remove('flashing');
    void flash.offsetWidth;
    flash.classList.add('flashing');
    flash.addEventListener('animationend', () => flash.classList.remove('flashing'), { once: true });
  }
}

function playBsEnemyDeath() {
  if (window.Enemy3D) {
    Enemy3D.triggerDeath();
  } else {
    const portEl = document.getElementById('bs-portrait');
    if (portEl) portEl.classList.add('dying');
  }
}

function selectEnemy(id) {
  if (S.selectedAction === 'attack') {
    S.selectedTarget = id;
    submitAction({ type: 'attack', targetId: id });
  } else if (S.selectedAction === 'ability' && S.selectedAbility) {
    const ability = getMyAbility(S.selectedAbility);
    if (ability && needsTarget(ability)) {
      S.selectedTarget = id;
      submitAction({ type: 'ability', abilityId: S.selectedAbility, targetId: id });
    }
  }
}

function renderRoomActions(room, state) {
  const area = document.getElementById('room-actions-area');
  area.innerHTML = '';
  area.classList.add('hidden');

  const myPlayer = state.players.find(p => p.socketId === S.mySocketId);
  const isHost = myPlayer?.isHost;

  if (room.type === 'riddle' && room.riddle && !room.riddle.solved) {
    area.classList.remove('hidden');
    area.innerHTML = `
      <div class="riddle-box">
        <div class="riddle-question">🔮 ${room.riddle.question}</div>
        <div class="riddle-hint">${room.riddle.hint}</div>
        ${room.riddle.attempts > 0 ? `<div class="riddle-attempts">Попытки: ${room.riddle.attempts}/3</div>` : ''}
        <div class="riddle-input-row">
          <input type="text" id="riddle-answer" placeholder="Ваш ответ..." maxlength="50">
          <button class="btn btn-primary" onclick="submitRiddle()">Ответить</button>
        </div>
      </div>
    `;
    document.getElementById('riddle-answer')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitRiddle();
    });
  }

  if (room.type === 'secret' && !room.secretRevealed) {
    area.classList.remove('hidden');
    const risk = room.secretRisk ?? 40;
    const riskColor = risk <= 20 ? 'var(--green)' : risk <= 40 ? 'var(--gold)' : risk <= 55 ? '#e67e22' : 'var(--red-bright)';
    area.innerHTML += `
      <div class="secret-box">
        <div style="color:var(--purple);font-size:20px;margin-bottom:8px">? Тайная комната</div>
        <div style="color:var(--text-dim);font-size:13px;margin-bottom:12px">
          Здесь скрыто нечто ценное... но, возможно, и ловушка. Исследовать?
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
          <button class="btn btn-secondary" onclick="exploreSecret()">🔍 Исследовать (<span style="color:${riskColor}">${risk}% риск</span>)</button>
          <button class="btn btn-ghost" onclick="skipSecret()">🚪 Пройти мимо</button>
        </div>
      </div>
    `;
  }

  if (room.type === 'rest' && room.isCleared) {
    area.classList.remove('hidden');
    area.innerHTML += `
      <div style="padding:10px;color:var(--green);font-size:13px">
        ⛺ Группа отдыхает. HP восстановлено.
      </div>
    `;
  }

  if (room.type === 'treasure') {
    area.classList.remove('hidden');
    const hasLoot = room.loot && room.loot.length > 0;
    area.innerHTML += `
      <div>
        <div class="panel-title" style="margin-bottom:8px">★ СОКРОВИЩА</div>
        ${hasLoot ? `
          <div class="treasure-box" id="loot-list">
            ${room.loot.map(item => `
              <div class="loot-item" onclick="collectLoot('${item.id}')">
                ${item.type === 'gold' ? '💰' : item.type === 'weapon' ? '⚔' : item.type === 'armor' ? '🛡' : '🧪'} ${item.name}
              </div>
            `).join('')}
          </div>
        ` : '<div style="color:var(--text-dim);font-size:12px;padding:4px 0">Всё подобрано.</div>'}
        ${state.phase !== 'voting' ? '<button class="btn btn-secondary" style="margin-top:8px" onclick="requestProceed()">→ Идти дальше</button>' : ''}
      </div>
    `;
  }

  if (room.type === 'merchant' && room.shopItems !== undefined) {
    area.classList.remove('hidden');
    const gold = myPlayer?.character?.gold ?? 0;
    const inventory = myPlayer?.character?.inventory || [];
    const TYPE_LABELS = {
      weapon: '⚔ Оружие', armor: '🛡 Броня', accessory: '💍 Аксессуар',
      consumable: '🧪 Расходник', artifact: '✨ Артефакт'
    };
    const TYPE_EMOJI = { weapon: '⚔', armor: '🛡', accessory: '💍', consumable: '🧪', artifact: '✨' };
    const TIER_CLS = { 1: 'tier-1', 2: 'tier-2', 3: 'tier-3' };
    const items = room.shopItems;

    const shopHtml = items.length > 0
      ? `<div class="shop-grid">${items.map(item => {
          const icon = ITEM_ICONS[item.iconId] || '';
          const canAfford = gold >= item.price;
          const typeLabel = TYPE_LABELS[item.type] || item.type;
          const tierCls = TIER_CLS[item.tier] || 'tier-1';
          return `<div class="shop-item">
            <div class="shop-item-icon">${icon}</div>
            <div class="shop-item-body">
              <div class="shop-item-meta">
                <span class="shop-type-badge ${item.type}">${typeLabel}</span>
                <span class="shop-tier-badge ${tierCls}">T${item.tier}</span>
              </div>
              <div class="shop-item-name">${item.name}</div>
              <div class="shop-item-desc">${item.desc}</div>
              <div class="shop-item-footer">
                <span class="shop-price${canAfford ? '' : ' shop-price-poor'}">💰 ${item.price}</span>
                <button class="btn-buy" onclick="buyItem('${item.id}')" ${canAfford ? '' : 'disabled'}>Купить</button>
              </div>
            </div>
          </div>`;
        }).join('')}</div>`
      : '<div class="shop-empty">Торговец всё распродал.</div>';

    const sellHtml = inventory.length > 0
      ? `<div class="sell-section">
          <div class="sell-title">💸 Продать торговцу</div>
          <div class="sell-list">${inventory.map(item => {
            const sp = computeSellPrice(item);
            const icon = ITEM_ICONS[item.iconId] || ITEM_ICONS[item.id];
            const iconHtml = icon
              ? `<div class="sell-item-icon">${icon}</div>`
              : `<div class="sell-item-icon">${TYPE_EMOJI[item.type] || '?'}</div>`;
            return `<div class="sell-item">
              ${iconHtml}
              <span class="sell-item-name">${item.name}</span>
              <span class="sell-item-price">+${sp}💰</span>
              <button class="btn-sell" onclick="sellItem('${item.id}')">Продать</button>
            </div>`;
          }).join('')}</div>
        </div>`
      : '';

    area.innerHTML += `
      <div class="merchant-box">
        <div class="panel-title" style="margin-bottom:10px">⚖ ЛАВКА ТОРГОВЦА</div>
        <div class="merchant-gold">💰 Ваше золото: <span class="gold-amount">${gold}</span></div>
        ${shopHtml}
        ${sellHtml}
        ${state.phase !== 'voting' ? '<button class="btn btn-secondary" style="margin-top:8px" onclick="requestProceed()">→ Идти дальше</button>' : ''}
      </div>
    `;
  }
}

function submitRiddle() {
  const input = document.getElementById('riddle-answer');
  if (!input) return;
  const answer = input.value.trim();
  if (!answer) return;
  socket.emit('solve_riddle', { answer }, () => {});
  input.value = '';
}

function skipSecret() {
  socket.emit('skip_secret', () => {});
}

function exploreSecret() {
  socket.emit('explore_secret', () => {});
}

function collectLoot(itemId) {
  socket.emit('collect_loot', { itemId }, (res) => {});
}

function computeSellPrice(item) {
  if (item.price) return Math.max(5, Math.floor(item.price * 0.4));
  let val = 0;
  if (item.attackBonus)  val += item.attackBonus * 5;
  if (item.defenseBonus) val += item.defenseBonus * 5;
  if (item.maxHpBonus)   val += item.maxHpBonus;
  if (item.healAmount)   val += Math.floor(item.healAmount * 0.35);
  return Math.max(5, val);
}

function buyItem(itemId) {
  socket.emit('buy_item', { itemId }, (res) => {
    if (!res?.ok) {
      showModal('Не удалось купить', res?.reason || 'Недостаточно золота.', [{ label: 'Закрыть', action: hideModal }]);
    }
  });
}

function sellItem(itemId) {
  socket.emit('sell_item', { itemId }, (res) => {
    if (!res?.ok) {
      showModal('Ошибка продажи', res?.reason || 'Не удалось продать предмет.', [{ label: 'Закрыть', action: hideModal }]);
    }
  });
}

function requestProceed() {
  socket.emit('request_proceed');
}

// ─── Actions Bar ──────────────────────────────────────────────────────────────
function renderActionsBar(state) {
  const actionsArea = document.getElementById('actions-area');
  const myPlayer = state.players.find(p => p.socketId === S.mySocketId);
  const ch = myPlayer?.character;
  const room = state.currentRoom;

  const isCombat = room?.type === 'combat' || room?.type === 'boss';
  const isMyTurn = !room?.currentTurnEntityId || room.currentTurnEntityId === S.mySocketId;
  const canAct = ch?.isAlive && !ch?.hasActed && state.phase === 'playing' && isCombat && isMyTurn;

  document.getElementById('action-buttons').querySelectorAll('.btn-action').forEach(btn => {
    btn.disabled = !canAct;
  });

  if (!canAct) {
    hideSubMenus();
  }

  const endTurnBtn = document.getElementById('btn-end-turn');
  if (endTurnBtn) {
    const isGridCombat = isCombat && !!(window.Combat3D?.isActive?.());
    endTurnBtn.classList.toggle('hidden', !isGridCombat);
    endTurnBtn.disabled = !ch?.isAlive || state.phase !== 'playing' || !isMyTurn || !isGridCombat;
  }
}

function hideSubMenus() {
  document.getElementById('target-select').classList.add('hidden');
  document.getElementById('target-backdrop').classList.add('hidden');
  document.getElementById('ability-select').classList.add('hidden');
  document.getElementById('ability-backdrop').classList.add('hidden');
  document.getElementById('item-select').classList.add('hidden');
  document.getElementById('item-backdrop').classList.add('hidden');
  S.selectedAction = null;
  S.selectedAbility = null;
  S.abilityAimMode = null;
  S.attackAimMode = false;
  if (window.Combat3D?.isActive?.()) Combat3D.clearAbilityAimMode?.();
  _clearAimHint();
}

function _showAimHint(text, opts = {}) {
  let hint = document.getElementById('aim-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'aim-hint';
    hint.style.cssText = 'position:absolute;top:8px;left:50%;transform:translateX(-50%);' +
      'font-family:monospace;font-size:13px;' +
      'padding:5px 14px;border:1px solid;border-radius:4px;pointer-events:none;z-index:50;';
    const c3d = document.getElementById('combat3d-container');
    if (c3d) { c3d.style.position = 'relative'; c3d.appendChild(hint); }
    else document.body.appendChild(hint);
  }
  hint.style.background = opts.bg     || 'rgba(80,0,160,0.82)';
  hint.style.color       = opts.color  || '#cc88ff';
  hint.style.borderColor = opts.border || '#aa44ff';
  hint.textContent = text;
  hint.style.display = 'block';
}

function _clearAimHint() {
  const hint = document.getElementById('aim-hint');
  if (hint) hint.style.display = 'none';
}

document.getElementById('btn-attack').addEventListener('click', () => {
  if (!canActNow()) return;
  hideSubMenus();
  S.selectedAction = 'attack';

  const enemies = getAliveEnemies();
  if (enemies.length === 0) return;

  if (window.Combat3D?.isActive?.()) {
    S.attackAimMode = true;
    _showAimHint('⚔ Нажмите на врага для атаки  |  ESC — отмена', {
      bg:     'rgba(120,10,10,0.88)',
      color:  '#ffaaaa',
      border: '#e03030'
    });
  } else {
    showTargetSelect(enemies.map(e => ({ id: e.id, type: 'enemy', label: `${e.symbol} ${e.name} (${e.hp}HP)` })));
  }
});

document.getElementById('btn-ability').addEventListener('click', () => {
  if (!canActNow()) return;
  S.selectedAction = 'ability';
  document.getElementById('target-select').classList.add('hidden');
  document.getElementById('item-select').classList.add('hidden');
  showAbilitySelect();
});

document.getElementById('btn-defend').addEventListener('click', () => {
  if (!canActNow()) return;
  submitAction({ type: 'defend' });
});

document.getElementById('btn-item').addEventListener('click', () => {
  if (!canActNow()) return;
  hideSubMenus();
  S.selectedAction = 'item';
  showItemSelect();
});

document.getElementById('btn-cancel-action').addEventListener('click', hideSubMenus);
document.getElementById('btn-cancel-ability').addEventListener('click', hideSubMenus);
document.getElementById('btn-cancel-item').addEventListener('click', hideSubMenus);
document.getElementById('target-backdrop').addEventListener('click', hideSubMenus);
document.getElementById('item-backdrop').addEventListener('click', hideSubMenus);

document.getElementById('btn-end-turn').addEventListener('click', () => {
  if (!canEndTurnNow()) return;
  socket.emit('player_action', { type: 'end_turn' }, (res) => {
    if (!res.ok) appendCombatLog(res.reason || 'Не удалось завершить ход.');
  });
});

function showTargetSelect(targets) {
  const el = document.getElementById('target-select');
  const list = document.getElementById('target-list');
  list.innerHTML = targets.map(t => `
    <button class="target-btn" onclick="onTargetSelected('${t.id}', '${t.type}')">${t.label}</button>
  `).join('');
  el.classList.remove('hidden');
  document.getElementById('target-backdrop').classList.remove('hidden');
  document.getElementById('ability-select').classList.add('hidden');
  document.getElementById('ability-backdrop').classList.add('hidden');
  document.getElementById('item-select').classList.add('hidden');
  document.getElementById('item-backdrop').classList.add('hidden');
}

const ABILITY_ICONS = {
  shield_bash:     '⊞',
  whirlwind:       '✦',
  battle_cry:      '⚑',
  provoke:         '◎',
  execute:         '✕',
  fireball:        '◉',
  ice_lance:       '▲',
  arcane_shield:   '◈',
  curse:           '◐',
  chain_lightning: '≋',
  backstab:        '†',
  poison_blade:    '⊗',
  shadow_step:     '◑',
  smoke_bomb:      '◌',
  fan_of_knives:   '✶',
  heal:            '✚',
  mass_heal:       '✙',
  holy_smite:      '✦',
  divine_shield:   '◇',
  resurrect:       '✾',
};

const TYPE_LABELS = {
  attack: 'Атака',
  buff: 'Усиление',
  debuff: 'Ослабление',
  heal: 'Исцеление',
  shield: 'Щит',
  taunt: 'Провокация',
  resurrect: 'Воскрешение',
};

const TYPE_COLORS = {
  attack:    'rgba(255,100,80,0.85)',
  buff:      'rgba(100,210,100,0.85)',
  debuff:    'rgba(190,100,255,0.85)',
  heal:      'rgba(80,210,200,0.85)',
  shield:    'rgba(80,150,255,0.85)',
  taunt:     'rgba(255,185,80,0.85)',
  resurrect: 'rgba(220,210,80,0.85)',
};

function showAbilitySelect() {
  const ch = getMyChar();
  if (!ch) return;

  const el = document.getElementById('ability-select');
  const list = document.getElementById('ability-list');

  list.className = 'ability-grid';
  list.innerHTML = ch.abilities.map(a => {
    const onCD = a.currentCooldown > 0;
    const noMana = a.mpCost > 0 && ch.mp < a.mpCost;
    const disabled = onCD || noMana;
    const typeClass = `t-${a.type || 'attack'}`;
    const glyph = ABILITY_ICONS[a.id] || '✦';
    const typeLabel = TYPE_LABELS[a.type] || a.type;
    const typeColor = TYPE_COLORS[a.type] || 'rgba(200,200,200,0.7)';
    const mpText = a.mpCost > 0 ? `<span class="abl-stat-mp">⬡ ${a.mpCost} MP</span>` : '';
    const cdText = a.cooldown > 0 ? `<span class="abl-stat-cd">↺ ${a.cooldown} ход.</span>` : '';
    const cdOverlay = onCD ? `<div class="abl-cd-overlay">${a.currentCooldown}</div>` : '';
    const dimStyle = noMana && !onCD ? ' abl-no-mana' : '';
    const rangeLabel = a.rangeType === 'melee' ? `<span class="abl-stat-range abl-melee">⚔ ближний</span>` :
                       a.rangeType === 'ranged' ? `<span class="abl-stat-range abl-ranged">⟳ ${a.maxRange} кл.</span>` : '';

    return `
      <button class="ability-icon-btn${dimStyle}" onclick="onAbilitySelected('${a.id}')" ${disabled ? 'disabled' : ''}>
        <div class="abl-icon ${typeClass}">
          <span class="abl-glyph">${glyph}</span>
          ${cdOverlay}
        </div>
        <span class="abl-label">${a.name}</span>
        <div class="abl-tooltip">
          <div class="abl-tooltip-name">${a.name}</div>
          <div class="abl-tooltip-type" style="color:${typeColor}">▸ ${typeLabel}</div>
          <div class="abl-tooltip-desc">${a.description}</div>
          <div class="abl-tooltip-stats">${rangeLabel}${mpText}${cdText}</div>
        </div>
      </button>
    `;
  }).join('');

  el.classList.remove('hidden');
  document.getElementById('ability-backdrop').classList.remove('hidden');
  document.getElementById('target-select').classList.add('hidden');
}

function showItemSelect() {
  const ch = getMyChar();
  if (!ch) return;

  const el = document.getElementById('item-select');
  const list = document.getElementById('item-list');

  const items = [];
  if (ch.potions > 0) {
    items.push({ id: 'potion', label: `🧪 Зелье лечения ×${ch.potions}`, isPotions: true });
  }
  ch.inventory.filter(i => i.type === 'consumable').forEach(i => {
    items.push({ id: i.id, label: `✦ ${i.name}` });
  });

  if (items.length === 0) {
    list.innerHTML = '<div style="color:var(--text-dim);font-size:12px;grid-column:1/-1">Нет предметов</div>';
  } else {
    list.innerHTML = items.map(item => `
      <button class="item-btn" onclick="onItemSelected('${item.id}')">${item.label}</button>
    `).join('');
  }

  el.classList.remove('hidden');
  document.getElementById('item-backdrop').classList.remove('hidden');
  document.getElementById('target-select').classList.add('hidden');
  document.getElementById('ability-select').classList.add('hidden');
  document.getElementById('ability-backdrop').classList.add('hidden');
}

function onTargetSelected(targetId, type) {
  hideSubMenus();
  if (S.selectedAction === 'attack') {
    submitAction({ type: 'attack', targetId });
  } else if (S.selectedAction === 'ability' && S.selectedAbility) {
    submitAction({ type: 'ability', abilityId: S.selectedAbility, targetId });
  } else if (S.selectedAction === 'item' && S.selectedItem) {
    submitAction({ type: 'item', itemId: S.selectedItem, targetId });
  }
}

function onAbilitySelected(abilityId) {
  S.selectedAbility = abilityId;
  const ability = getMyAbility(abilityId);
  if (!ability) return;

  document.getElementById('ability-select').classList.add('hidden');
  document.getElementById('ability-backdrop').classList.add('hidden');

  const rangeType = ability.rangeType || 'any';
  const is3D = window.Combat3D?.isActive?.();

  // ── Self / AoE-all-allies abilities (no position target) ─────────────────
  if (!needsTarget(ability) && rangeType !== 'ranged') {
    submitAction({ type: 'ability', abilityId, targetId: null });
    return;
  }

  // ── Ranged AoE: player selects a cell on the battlefield ─────────────────
  if (!needsTarget(ability) && rangeType === 'ranged') {
    if (is3D) {
      S.abilityAimMode = { abilityId, rangeType: 'ranged-aoe', maxRange: ability.maxRange || 7 };
      Combat3D.setAbilityAimMode({
        rangeType: 'ranged-aoe',
        maxRange: ability.maxRange || 7,
        aoeRadius: ability.aoeRadius || 2
      });
      _showAimHint(`${ability.name}: выберите точку на поле боя`);
    } else {
      // 2D fallback: server applies to all enemies without targetCell
      submitAction({ type: 'ability', abilityId, targetId: null });
    }
    return;
  }

  // ── Ranged single enemy ───────────────────────────────────────────────────
  if (ability.target === 'single' && rangeType === 'ranged') {
    const enemies = getAliveEnemies();
    if (enemies.length === 0) return;

    if (is3D) {
      // In 3D: highlight in-range enemies, player clicks one
      S.abilityAimMode = { abilityId, rangeType: 'ranged-single', maxRange: ability.maxRange || 6 };
      Combat3D.setAbilityAimMode({ rangeType: 'ranged-single', maxRange: ability.maxRange || 6 });
      _showAimHint(`${ability.name}: выберите врага в радиусе ${ability.maxRange || 6} клеток`);
    } else {
      // 2D: target select panel (server validates range)
      if (enemies.length === 1) {
        submitAction({ type: 'ability', abilityId, targetId: enemies[0].id });
      } else {
        S.selectedAction = 'ability';
        showTargetSelect(enemies.map(e => ({ id: e.id, type: 'enemy', label: `${e.symbol} ${e.name} (${e.hp}HP)` })));
      }
    }
    return;
  }

  // ── Ranged single debuff targeting enemy (e.g. curse) ────────────────────
  if (ability.target === 'single' && rangeType === 'any') {
    const enemies = getAliveEnemies();
    if (enemies.length === 0) return;
    if (enemies.length === 1) {
      submitAction({ type: 'ability', abilityId, targetId: enemies[0].id });
    } else if (is3D) {
      S.selectedAction = 'ability';
      showTargetSelect(enemies.map(e => ({ id: e.id, type: 'enemy', label: `${e.symbol} ${e.name} (${e.hp}HP)` })));
    } else {
      submitAction({ type: 'ability', abilityId, targetId: S.bsActiveEnemyId || enemies[0].id });
    }
    return;
  }

  // ── Melee single enemy ────────────────────────────────────────────────────
  if (ability.target === 'single' && rangeType === 'melee') {
    const enemies = getAliveEnemies();
    if (enemies.length === 0) return;
    const ch = getMyChar();

    if (is3D && ch?.gridX !== undefined) {
      const meleeRange = ability.maxRange || 1.5;
      const inRange = enemies.filter(e =>
        e.gridX !== undefined &&
        Math.hypot(e.gridX - ch.gridX, e.gridZ - ch.gridZ) <= meleeRange + 0.01
      );
      if (inRange.length === 0) {
        appendCombatLog(`${ability.name}: нет врагов в зоне ближнего боя! Подойдите ближе.`);
        hideSubMenus();
        return;
      }
      if (inRange.length === 1) {
        submitAction({ type: 'ability', abilityId, targetId: inRange[0].id });
      } else {
        S.selectedAction = 'ability';
        showTargetSelect(inRange.map(e => ({ id: e.id, type: 'enemy', label: `${e.symbol} ${e.name} (${e.hp}HP)` })));
      }
    } else {
      // Non-3D: let server validate; show select if multiple
      if (enemies.length === 1) {
        submitAction({ type: 'ability', abilityId, targetId: enemies[0].id });
      } else {
        S.selectedAction = 'ability';
        showTargetSelect(enemies.map(e => ({ id: e.id, type: 'enemy', label: `${e.symbol} ${e.name} (${e.hp}HP)` })));
      }
    }
    return;
  }

  // ── Ally / dead-ally targeting ────────────────────────────────────────────
  if (['single_ally', 'dead_ally'].includes(ability.target)) {
    const targets = getTargetsForAbility(ability);
    if (targets.length === 0) { hideSubMenus(); return; }
    if (targets.length === 1) {
      submitAction({ type: 'ability', abilityId, targetId: targets[0].id });
    } else {
      S.selectedAction = 'ability';
      showTargetSelect(targets);
    }
    return;
  }

  // Fallback: no target needed
  submitAction({ type: 'ability', abilityId, targetId: null });
}

function onItemSelected(itemId) {
  S.selectedItem = itemId;
  document.getElementById('item-select').classList.add('hidden');
  document.getElementById('item-backdrop').classList.add('hidden');

  const alivePlayers = S.gameState?.players.filter(p => p.character?.isAlive) || [];

  if (alivePlayers.length <= 1) {
    submitAction({ type: 'item', itemId, targetId: S.mySocketId });
  } else {
    showTargetSelect(alivePlayers.map(p => ({
      id: p.socketId,
      label: `${p.character.symbol} ${p.name} (${p.character.hp}/${p.character.maxHp}HP)`,
      type: 'ally'
    })));
    S.selectedAction = 'item';
  }
}

function needsTarget(ability) {
  return ['single', 'single_ally', 'dead_ally'].includes(ability.target);
}

function getTargetsForAbility(ability) {
  const state = S.gameState;
  if (!state) return [];

  if (ability.target === 'single') {
    return getAliveEnemies().map(e => ({
      id: e.id, label: `${e.symbol} ${e.name} (${e.hp}HP)`, type: 'enemy'
    }));
  }
  if (ability.target === 'single_ally') {
    return state.players.filter(p => p.character?.isAlive).map(p => ({
      id: p.socketId, label: `${p.character.symbol} ${p.name} (${p.character.hp}HP)`, type: 'ally'
    }));
  }
  if (ability.target === 'dead_ally') {
    return state.players.filter(p => p.character && !p.character.isAlive).map(p => ({
      id: p.socketId, label: `☠ ${p.name}`, type: 'dead'
    }));
  }
  return [];
}

function submitAction(action) {
  // Trigger 3D visual effect for ranged abilities before sending to server
  if (action.type === 'ability' && window.Combat3D?.isActive?.()) {
    const ability = getMyAbility(action.abilityId);
    if (ability?.rangeType === 'ranged') {
      const ch = getMyChar();
      if (ch?.gridX !== undefined) {
        let toGX, toGZ;
        if (action.targetCell) {
          toGX = action.targetCell.x; toGZ = action.targetCell.z;
        } else if (action.targetId) {
          const tgt = getAliveEnemies().find(e => e.id === action.targetId);
          if (tgt?.gridX !== undefined) { toGX = tgt.gridX; toGZ = tgt.gridZ; }
        }
        if (toGX !== undefined) {
          Combat3D.triggerAbilityEffect(action.abilityId, ch.gridX, ch.gridZ, toGX, toGZ);
        }
      }
    }
  }

  if (!window.Combat3D?.isActive?.()) {
    const isAttack = action.type === 'attack';
    const isOffensiveAbility = action.type === 'ability' &&
      (getMyAbility(action.abilityId)?.type === 'attack');
    if (isAttack || isOffensiveAbility) {
      playBsAttack();
      setTimeout(playBsEnemyHit, 260);
    }
  }

  hideSubMenus();
  socket.emit('player_action', action, (res) => {
    if (!res.ok) {
      appendCombatLog(res.reason || 'Ошибка действия.');
    }
  });
}

function canActNow() {
  const state = S.gameState;
  if (!state || state.phase !== 'playing') return false;
  const ch = getMyChar();
  if (!ch?.isAlive || ch.hasActed) return false;
  const room = state.currentRoom;
  if (room?.type !== 'combat' && room?.type !== 'boss') return false;
  if (room.currentTurnEntityId && room.currentTurnEntityId !== S.mySocketId) return false;
  return true;
}

function canMoveNow() {
  const state = S.gameState;
  if (!state || state.phase !== 'playing') return false;
  const ch = getMyChar();
  if (!ch?.isAlive || ch.hasMoved) return false;
  const room = state.currentRoom;
  if (room?.type !== 'combat' && room?.type !== 'boss') return false;
  return room.currentTurnEntityId === S.mySocketId;
}

function canEndTurnNow() {
  const state = S.gameState;
  if (!state || state.phase !== 'playing') return false;
  const ch = getMyChar();
  if (!ch?.isAlive) return false;
  const room = state.currentRoom;
  if (room?.type !== 'combat' && room?.type !== 'boss') return false;
  return room.currentTurnEntityId === S.mySocketId;
}

function submitMove(x, z) {
  socket.emit('player_action', { type: 'move', x, z }, (res) => {
    if (!res.ok) appendCombatLog(res.reason || 'Нельзя переместиться туда.');
  });
}

function getAliveEnemies() {
  return S.gameState?.currentRoom?.enemies?.filter(e => e.isAlive) || [];
}

function getMyChar() {
  const p = S.gameState?.players.find(p => p.socketId === S.mySocketId);
  return p?.character || null;
}

function getMyAbility(id) {
  const ch = getMyChar();
  return ch?.abilities?.find(a => a.id === id) || null;
}

// ─── Room 3D Preview ───────────────────────────────────────────────────────────
function renderRoomPreviewSVG(type, uid) {
  const W = 160, H = 90;
  const bx1 = 36, by1 = 13, bx2 = 124, by2 = 66;
  const cx = (bx1 + bx2) / 2, cy = (by1 + by2) / 2;
  const gid = 'rvg_' + uid;

  const themes = {
    combat:   { bg: '#060810', floor: '#0b0f1a', ceil: '#040608', back: '#0d1020', lw: '#0e1628', rw: '#0c1422', accent: '#4a1010', torch: '#cc4010', glow: 'rgba(200,50,30,0.45)'  },
    treasure: { bg: '#060810', floor: '#0c1018', ceil: '#060810', back: '#0e1218', lw: '#101822', rw: '#0e1620', accent: '#5a4010', torch: '#d4a020', glow: 'rgba(212,160,30,0.45)' },
    rest:     { bg: '#040a0e', floor: '#080e0c', ceil: '#040608', back: '#080c10', lw: '#0c1418', rw: '#0a1216', accent: '#1a6030', torch: '#20c060', glow: 'rgba(40,160,70,0.4)'   },
    boss:     { bg: '#0a0408', floor: '#0e060a', ceil: '#080408', back: '#14040a', lw: '#140608', rw: '#120608', accent: '#900818', torch: '#ff2020', glow: 'rgba(200,20,30,0.55)'   },
    riddle:   { bg: '#06060e', floor: '#08080e', ceil: '#040408', back: '#0c0c18', lw: '#0e0e1c', rw: '#0c0c1a', accent: '#283088', torch: '#5080ee', glow: 'rgba(80,110,230,0.45)'  },
    secret:   { bg: '#050508', floor: '#080810', ceil: '#040408', back: '#0a0a14', lw: '#0c0c18', rw: '#0a0a16', accent: '#501080', torch: '#9040cc', glow: 'rgba(130,50,200,0.4)'   },
    merchant: { bg: '#060810', floor: '#0c0e10', ceil: '#060808', back: '#0e1010', lw: '#101418', rw: '#0e1216', accent: '#7a5008', torch: '#c89030', glow: 'rgba(200,150,50,0.4)'   },
    start:    { bg: '#040810', floor: '#080e14', ceil: '#040608', back: '#0a1018', lw: '#0c1420', rw: '#0a1218', accent: '#103060', torch: '#4080c0', glow: 'rgba(50,90,180,0.35)'   },
  };
  const t = themes[type] || themes.start;

  let stoneLines = '';
  for (let x = bx1 + 22; x < bx2 - 4; x += 22) stoneLines += `<line x1="${x}" y1="${by1}" x2="${x}" y2="${by2}" stroke="${t.accent}" stroke-width="0.4" opacity="0.35"/>`;
  for (let y = by1 + 13; y < by2 - 2; y += 13) stoneLines += `<line x1="${bx1}" y1="${y}" x2="${bx2}" y2="${y}" stroke="${t.accent}" stroke-width="0.35" opacity="0.3"/>`;

  let floorLines = '';
  for (let i = 1; i < 4; i++) {
    const p = i / 4;
    const fx1 = bx1 * (1 - p), fy = by2 + (H - by2) * p, fx2 = bx2 + (W - bx2) * (1 - p) + W * p;
    floorLines += `<line x1="${fx1|0}" y1="${fy|0}" x2="${W - fx1|0}" y2="${fy|0}" stroke="${t.accent}" stroke-width="0.4" opacity="0.22"/>`;
  }

  const torch = (tx, ty) => `
    <rect x="${tx-1.5}" y="${ty+1}" width="3" height="5" rx="0.8" fill="#2a1a08"/>
    <ellipse cx="${tx}" cy="${ty}" rx="2.5" ry="3.5" fill="${t.torch}" opacity="0.55"/>
    <ellipse cx="${tx}" cy="${ty-1.5}" rx="1.8" ry="2.5" fill="rgba(255,200,80,0.85)"/>
    <ellipse cx="${tx}" cy="${ty-3}" rx="1.1" ry="1.8" fill="rgba(255,240,160,0.95)"/>
    <circle cx="${tx}" cy="${ty-4.5}" r="0.7" fill="#fffacc"/>`;
  const ltx = bx1 + 11, lty = by1 + (by2 - by1) * 0.38;
  const rtx = bx2 - 11, rty = lty;

  const decos = {
    combat: `
      <ellipse cx="${cx}" cy="${cy}" rx="20" ry="26" fill="${t.glow}"/>
      <line x1="${cx-14}" y1="${cy-15}" x2="${cx+10}" y2="${cy+11}" stroke="#7a7070" stroke-width="2" stroke-linecap="round"/>
      <line x1="${cx+14}" y1="${cy-15}" x2="${cx-10}" y2="${cy+11}" stroke="#7a7070" stroke-width="2" stroke-linecap="round"/>
      <line x1="${cx-17}" y1="${cy-5}" x2="${cx-8}" y2="${cy-5}" stroke="#6a5030" stroke-width="2" stroke-linecap="round"/>
      <line x1="${cx+8}" y1="${cy-5}" x2="${cx+17}" y2="${cy-5}" stroke="#6a5030" stroke-width="2" stroke-linecap="round"/>`,
    treasure: `
      <ellipse cx="${cx}" cy="${cy+3}" rx="22" ry="16" fill="${t.glow}"/>
      <rect x="${cx-13}" y="${cy-1}" width="26" height="17" rx="2" fill="#3a2808" stroke="#8a6010" stroke-width="1"/>
      <rect x="${cx-13}" y="${cy-1}" width="26" height="9" rx="2" fill="#281e06" stroke="#8a6010" stroke-width="1"/>
      <rect x="${cx-3.5}" y="${cy+1}" width="7" height="4.5" rx="1" fill="#c8a020"/>
      <ellipse cx="${cx}" cy="${cy-1}" rx="12" ry="3.5" fill="${t.glow}" opacity="0.6"/>`,
    rest: `
      <ellipse cx="${cx}" cy="${cy+9}" rx="22" ry="11" fill="${t.glow}" opacity="0.55"/>
      <line x1="${cx-12}" y1="${cy+8}" x2="${cx+5}" y2="${cy+5}" stroke="#3a1a08" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="${cx-5}" y1="${cy+8}" x2="${cx+12}" y2="${cy+5}" stroke="#3a1a08" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="${cx}" cy="${cy+3}" rx="5.5" ry="8" fill="rgba(200,80,10,0.8)"/>
      <ellipse cx="${cx}" cy="${cy+1}" rx="4" ry="6" fill="rgba(240,140,10,0.9)"/>
      <ellipse cx="${cx}" cy="${cy-1}" rx="2.5" ry="4" fill="rgba(255,210,60,0.95)"/>
      <ellipse cx="${cx}" cy="${cy-3.5}" rx="1.4" ry="2.5" fill="rgba(255,245,190,1)"/>`,
    boss: `
      <ellipse cx="${cx}" cy="${cy}" rx="24" ry="30" fill="${t.glow}"/>
      <ellipse cx="${cx}" cy="${cy-5}" rx="13" ry="13" fill="#1a0808" stroke="#601010" stroke-width="1.2"/>
      <ellipse cx="${cx-5.5}" cy="${cy-7}" rx="3.5" ry="4.5" fill="${t.glow}" opacity="0.9"/>
      <ellipse cx="${cx+5.5}" cy="${cy-7}" rx="3.5" ry="4.5" fill="${t.glow}" opacity="0.9"/>
      <rect x="${cx-8}" y="${cy+6}" width="16" height="6" rx="1" fill="#1a0808" stroke="#601010" stroke-width="0.8"/>
      <line x1="${cx-5}" y1="${cy+6}" x2="${cx-5}" y2="${cy+11}" stroke="#601010" stroke-width="1.2"/>
      <line x1="${cx}" y1="${cy+6}" x2="${cx}" y2="${cy+12}" stroke="#601010" stroke-width="1.2"/>
      <line x1="${cx+5}" y1="${cy+6}" x2="${cx+5}" y2="${cy+11}" stroke="#601010" stroke-width="1.2"/>`,
    riddle: `
      <circle cx="${cx}" cy="${cy}" r="20" fill="none" stroke="${t.torch}" stroke-width="0.6" opacity="0.5"/>
      <circle cx="${cx}" cy="${cy}" r="14" fill="${t.glow}" opacity="0.5"/>
      <circle cx="${cx}" cy="${cy}" r="14" fill="none" stroke="${t.torch}" stroke-width="0.9" stroke-dasharray="3,5" opacity="0.8"/>
      <text x="${cx}" y="${cy+6}" text-anchor="middle" font-size="18" fill="${t.torch}" opacity="0.85" font-family="serif">ᚱ</text>
      <circle cx="${cx}" cy="${cy}" r="3" fill="${t.torch}" opacity="0.5"/>`,
    secret: `
      <ellipse cx="${cx}" cy="${cy}" rx="22" ry="28" fill="${t.glow}" opacity="0.35"/>
      <rect x="${cx-11}" y="${cy-19}" width="22" height="32" rx="1" fill="none" stroke="${t.torch}" stroke-width="0.9" stroke-dasharray="2,3" opacity="0.7"/>
      <circle cx="${cx+7}" cy="${cy}" r="2.5" fill="${t.torch}" opacity="0.7"/>
      <text x="${cx-9}" y="${cy-8}" font-size="8" fill="${t.torch}" opacity="0.5" font-family="serif">?</text>
      <text x="${cx+5}" y="${cy+17}" font-size="8" fill="${t.torch}" opacity="0.5" font-family="serif">?</text>`,
    merchant: `
      <ellipse cx="${cx}" cy="${cy}" rx="22" ry="22" fill="${t.glow}" opacity="0.4"/>
      <line x1="${cx}" y1="${cy-22}" x2="${cx}" y2="${cy-16}" stroke="${t.torch}" stroke-width="1.2"/>
      <rect x="${cx-5}" y="${cy-16}" width="10" height="14" rx="1.5" fill="#1a1008" stroke="${t.torch}" stroke-width="0.9"/>
      <ellipse cx="${cx}" cy="${cy-9}" rx="3.5" ry="5" fill="${t.glow}" opacity="0.85"/>
      <ellipse cx="${cx-12}" cy="${cy+6}" rx="6" ry="8" fill="#281e08" stroke="#6a5020" stroke-width="0.8"/>
      <ellipse cx="${cx+12}" cy="${cy+7}" rx="5" ry="7" fill="#281e08" stroke="#6a5020" stroke-width="0.8"/>`,
    start: `
      <ellipse cx="${cx}" cy="${cy}" rx="18" ry="22" fill="${t.glow}" opacity="0.35"/>
      <path d="M${cx-15},${cy+13} L${cx-15},${cy-2} Q${cx-15},${cy-19} ${cx},${cy-19} Q${cx+15},${cy-19} ${cx+15},${cy-2} L${cx+15},${cy+13}" fill="none" stroke="${t.torch}" stroke-width="1.3" opacity="0.7"/>`,
  };
  const deco = decos[type] || decos.start;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    <defs>
      <radialGradient id="${gid}" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stop-color="${t.glow}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="${t.bg}"/>
    <polygon points="0,0 ${bx1},${by1} ${bx2},${by1} ${W},0" fill="${t.ceil}"/>
    <polygon points="0,${H} ${bx1},${by2} ${bx2},${by2} ${W},${H}" fill="${t.floor}"/>
    <polygon points="0,0 0,${H} ${bx1},${by2} ${bx1},${by1}" fill="${t.lw}"/>
    <polygon points="${W},0 ${W},${H} ${bx2},${by2} ${bx2},${by1}" fill="${t.rw}"/>
    <rect x="${bx1}" y="${by1}" width="${bx2 - bx1}" height="${by2 - by1}" fill="${t.back}"/>
    ${stoneLines}${floorLines}
    <rect x="${bx1}" y="${by1}" width="${bx2 - bx1}" height="${by2 - by1}" fill="url(#${gid})"/>
    ${deco}
    ${torch(ltx, lty)}${torch(rtx, rty)}
    <line x1="0"   y1="0"   x2="${bx1}" y2="${by1}" stroke="rgba(212,175,55,0.28)" stroke-width="1.2"/>
    <line x1="${W}" y1="0"   x2="${bx2}" y2="${by1}" stroke="rgba(212,175,55,0.28)" stroke-width="1.2"/>
    <line x1="0"   y1="${H}" x2="${bx1}" y2="${by2}" stroke="rgba(212,175,55,0.28)" stroke-width="1.2"/>
    <line x1="${W}" y1="${H}" x2="${bx2}" y2="${by2}" stroke="rgba(212,175,55,0.28)" stroke-width="1.2"/>
    <line x1="${bx1}" y1="${by1}" x2="${bx2}" y2="${by1}" stroke="rgba(212,175,55,0.6)" stroke-width="1.5"/>
    <line x1="${bx1}" y1="${by2}" x2="${bx2}" y2="${by2}" stroke="rgba(212,175,55,0.6)" stroke-width="1.5"/>
    <line x1="${bx1}" y1="${by1}" x2="${bx1}" y2="${by2}" stroke="rgba(212,175,55,0.6)" stroke-width="1.5"/>
    <line x1="${bx2}" y1="${by1}" x2="${bx2}" y2="${by2}" stroke="rgba(212,175,55,0.6)" stroke-width="1.5"/>
  </svg>`;
}

// ─── Voting ────────────────────────────────────────────────────────────────────
function renderCorridorSVG(options) {
  const hasLeft     = options.some(o => o.direction === 'left');
  const hasRight    = options.some(o => o.direction === 'right');
  const hasStraight = options.some(o => o.direction === 'straight');

  const W = 300, H = 76;
  const ix1 = 86, iy1 = 22, ix2 = 214, iy2 = 58;
  const ix1b = ix1 + Math.round((ix2 - ix1) * 0.3);
  const ix2b = ix2 - Math.round((ix2 - ix1) * 0.3);
  const iy1b = iy1 + Math.round((iy2 - iy1) * 0.35);
  const iy2b = iy2 - Math.round((iy2 - iy1) * 0.35);

  const g  = 'rgba(212,175,55,0.6)';
  const sl = '#182840';
  const ltx = 20,   lty = 52;
  const rtx = W-20, rty = 52;
  const imid = (iy1 + iy2) / 2;

  const defs = `<defs>
    <linearGradient id="crCeil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#050710"/>
      <stop offset="100%" stop-color="#0c1626"/>
    </linearGradient>
    <linearGradient id="crFloor" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#06090f"/>
      <stop offset="100%" stop-color="#111c2c"/>
    </linearGradient>
    <linearGradient id="crWL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#14202e"/>
      <stop offset="55%" stop-color="#0d1828"/>
      <stop offset="100%" stop-color="#06101c"/>
    </linearGradient>
    <linearGradient id="crWR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#14202e"/>
      <stop offset="55%" stop-color="#0d1828"/>
      <stop offset="100%" stop-color="#06101c"/>
    </linearGradient>
    <radialGradient id="crTL" cx="${ltx}" cy="${lty}" r="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#c06010" stop-opacity="0.5"/>
      <stop offset="40%" stop-color="#803010" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="crTR" cx="${rtx}" cy="${rty}" r="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#c06010" stop-opacity="0.5"/>
      <stop offset="40%" stop-color="#803010" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="crDP" cx="150" cy="${imid}" r="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1a3456" stop-opacity="0.6"/>
      <stop offset="65%" stop-color="#040c18" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>`;

  const flame = (tx, ty) => `
    <rect x="${tx-2.5}" y="${ty}" width="5" height="9" rx="1" fill="#3a2608"/>
    <rect x="${tx-1}" y="${ty-2}" width="2" height="3" fill="#583a12"/>
    <ellipse cx="${tx}" cy="${ty-3}" rx="3.2" ry="4.2" fill="#cc5000" opacity="0.55"/>
    <ellipse cx="${tx}" cy="${ty-5}" rx="2.1" ry="3.2" fill="#ee8000" opacity="0.9"/>
    <ellipse cx="${tx}" cy="${ty-7}" rx="1.3" ry="2.2" fill="#ffaa10" opacity="0.95"/>
    <ellipse cx="${tx}" cy="${ty-9}" rx="0.8" ry="1.5" fill="#ffdd50"/>
    <circle  cx="${tx}" cy="${ty-10}" r="0.6" fill="#fffacc"/>`;

  const corner = (cx, cy) =>
    `<rect x="${cx-3}" y="${cy-3}" width="6" height="6" transform="rotate(45,${cx},${cy})" fill="#5c3d0a" stroke="rgba(212,175,55,0.75)" stroke-width="0.7"/>`;

  const leftClosed = `
    <polygon points="0,0 0,${H} ${ix1},${iy2} ${ix1},${iy1}" fill="url(#crWL)"/>
    <rect x="0" y="0" width="${ix1}" height="${H}" fill="url(#crTL)"/>
    <line x1="2" y1="11" x2="41" y2="11" stroke="${sl}" stroke-width="0.5" opacity="0.5"/>
    <line x1="2" y1="${iy1+9}"  x2="${ix1-2}" y2="${iy1+9}"  stroke="${sl}" stroke-width="0.5" opacity="0.5"/>
    <line x1="2" y1="${iy1+18}" x2="${ix1-2}" y2="${iy1+18}" stroke="${sl}" stroke-width="0.5" opacity="0.45"/>
    <line x1="2" y1="${iy1+27}" x2="${ix1-2}" y2="${iy1+27}" stroke="${sl}" stroke-width="0.5" opacity="0.4"/>
    <line x1="2" y1="67" x2="41" y2="67" stroke="${sl}" stroke-width="0.5" opacity="0.4"/>
    <line x1="${ix1}" y1="${iy1}" x2="${ix1}" y2="${iy2}" stroke="${g}" stroke-width="1.5"/>
    ${flame(ltx, lty)}`;

  const rightClosed = `
    <polygon points="${W},0 ${W},${H} ${ix2},${iy2} ${ix2},${iy1}" fill="url(#crWR)"/>
    <rect x="${ix2}" y="0" width="${W-ix2}" height="${H}" fill="url(#crTR)"/>
    <line x1="${W-41}" y1="11" x2="${W-2}" y2="11" stroke="${sl}" stroke-width="0.5" opacity="0.5"/>
    <line x1="${ix2+2}" y1="${iy1+9}"  x2="${W-2}" y2="${iy1+9}"  stroke="${sl}" stroke-width="0.5" opacity="0.5"/>
    <line x1="${ix2+2}" y1="${iy1+18}" x2="${W-2}" y2="${iy1+18}" stroke="${sl}" stroke-width="0.5" opacity="0.45"/>
    <line x1="${ix2+2}" y1="${iy1+27}" x2="${W-2}" y2="${iy1+27}" stroke="${sl}" stroke-width="0.5" opacity="0.4"/>
    <line x1="${W-41}" y1="67" x2="${W-2}" y2="67" stroke="${sl}" stroke-width="0.5" opacity="0.4"/>
    <line x1="${ix2}" y1="${iy1}" x2="${ix2}" y2="${iy2}" stroke="${g}" stroke-width="1.5"/>
    ${flame(rtx, rty)}`;

  const leftSide  = hasLeft  ? `<polygon points="0,0 0,${H} ${ix1},${iy2} ${ix1},${iy1}" fill="#020408"/>` : leftClosed;
  const rightSide = hasRight ? `<polygon points="${W},0 ${W},${H} ${ix2},${iy2} ${ix2},${iy1}" fill="#020408"/>` : rightClosed;

  const centerPassage = `
    <rect x="${ix1}" y="${iy1}" width="${ix2-ix1}" height="${iy2-iy1}" fill="#020208"/>
    <polygon points="${ix1},${iy1} ${ix2},${iy1} ${ix2b},${iy1b} ${ix1b},${iy1b}" fill="#07060e"/>
    <polygon points="${ix1},${iy2} ${ix2},${iy2} ${ix2b},${iy2b} ${ix1b},${iy2b}" fill="#06060c"/>
    <polygon points="${ix1},${iy1} ${ix1},${iy2} ${ix1b},${iy2b} ${ix1b},${iy1b}" fill="#050409"/>
    <polygon points="${ix2},${iy1} ${ix2},${iy2} ${ix2b},${iy2b} ${ix2b},${iy1b}" fill="#050409"/>
    <rect x="${ix1b}" y="${iy1b}" width="${ix2b-ix1b}" height="${iy2b-iy1b}" fill="#010108"/>
    <ellipse cx="${(ix1b+ix2b)/2}" cy="${(iy1b+iy2b)/2}" rx="${(ix2b-ix1b)*0.65}" ry="${(iy2b-iy1b)*0.65}" fill="url(#crDP)"/>`;

  const centerWall = `
    <rect x="${ix1}" y="${iy1}" width="${ix2-ix1}" height="${iy2-iy1}" fill="#0c1828"/>
    <line x1="${ix1+2}" y1="${iy1+9}"  x2="${ix2-2}" y2="${iy1+9}"  stroke="${sl}" stroke-width="0.5" opacity="0.55"/>
    <line x1="${ix1+2}" y1="${iy1+18}" x2="${ix2-2}" y2="${iy1+18}" stroke="${sl}" stroke-width="0.5" opacity="0.5"/>
    <line x1="${(ix1+ix2)/2|0}" y1="${iy1+2}" x2="${(ix1+ix2)/2|0}" y2="${iy2-2}" stroke="${sl}" stroke-width="0.7" opacity="0.5"/>`;

  const centerContent = hasStraight ? centerPassage : centerWall;

  const frameLines = `
    <line x1="0"   y1="0"   x2="${ix1}" y2="${iy1}" stroke="${g}" stroke-width="1.2"/>
    <line x1="${W}" y1="0"   x2="${ix2}" y2="${iy1}" stroke="${g}" stroke-width="1.2"/>
    <line x1="0"   y1="${H}" x2="${ix1}" y2="${iy2}" stroke="${g}" stroke-width="1.2"/>
    <line x1="${W}" y1="${H}" x2="${ix2}" y2="${iy2}" stroke="${g}" stroke-width="1.2"/>
    <line x1="${ix1}" y1="${iy1}" x2="${ix2}" y2="${iy1}" stroke="${g}" stroke-width="2"/>
    <line x1="${ix1}" y1="${iy2}" x2="${ix2}" y2="${iy2}" stroke="${g}" stroke-width="2"/>
    <line x1="${ix1}" y1="${iy1}" x2="${ix1}" y2="${iy2}" stroke="${g}" stroke-width="2"/>
    <line x1="${ix2}" y1="${iy1}" x2="${ix2}" y2="${iy2}" stroke="${g}" stroke-width="2"/>
    ${corner(ix1,iy1)}${corner(ix2,iy1)}${corner(ix1,iy2)}${corner(ix2,iy2)}`;

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">
    ${defs}
    <rect width="${W}" height="${H}" fill="#04060c"/>
    <polygon points="0,0 ${W},0 ${ix2},${iy1} ${ix1},${iy1}" fill="url(#crCeil)"/>
    <polygon points="0,${H} ${W},${H} ${ix2},${iy2} ${ix1},${iy2}" fill="url(#crFloor)"/>
    ${leftSide}
    ${rightSide}
    ${centerContent}
    ${frameLines}
  </svg>`;
}

function renderVoting(vote) {
  if (!vote) return;

  const area = document.getElementById('voting-area');
  area.classList.remove('hidden');

  const enemiesArea = document.getElementById('enemies-area');
  const combatVisible = enemiesArea && !enemiesArea.classList.contains('hidden');
  if (combatVisible) {
    area.classList.add('combat-overlay');
    enemiesArea.classList.add('combat-voting-blur');
  } else {
    area.classList.remove('combat-overlay');
  }

  const optionsEl = document.getElementById('vote-options');
  const myVote = S.myVote;

  const DIR_ARROW = { left: '◀', straight: '▲', right: '▶' };
  const DIR_TEXT  = { left: 'НАЛЕВО', straight: 'ПРЯМО', right: 'НАПРАВО' };
  const DIR_SOUNDS = {
    combat:   ['Слышны звуки схватки...', 'Запах крови в воздухе.', 'Что-то рычит во тьме.', 'Звон оружия.'],
    treasure: ['Мерцает слабый свет.', 'Запах старого металла.', 'Тихий звон монет...', 'Что-то блестит.'],
    rest:     ['Спокойный, тихий воздух.', 'Едва слышно журчание воды.', 'Слабый запах дыма.', 'Тишина.'],
    merchant: ['Запах дыма и воска.', 'Чей-то шёпот в темноте...', 'Звяканье и шорох.', 'Мерцание огней.'],
    riddle:   ['Мерцание магических рун.', 'Необычная тишина.', 'Ощущение наблюдения...', 'Гравюры на стенах.'],
    secret:   ['Сквозняк из темноты.', 'Тонкий запах тайны.', 'Едва видимая надпись.', 'Что-то скрыто...'],
    boss:     ['ТЯЖЁЛЫЕ ШАГИ...', 'Земля дрожит.', 'Запах серы и гари.', 'Стены дрожат...'],
    start:    ['Коридор уходит вперёд.', 'Путь в неизвестность.', 'Темнота ждёт.'],
  };
  const ROOM_TYPE_COLOR = {
    combat:   '#8a1818', treasure: '#8a6208', rest:     '#145a30',
    boss:     '#6a0c18', riddle:   '#28287a', secret:   '#4a1870',
    merchant: '#6a4a08', start:    '#0e2858',
  };

  const btnHtml = vote.options.map(opt => {
    const voteCount = Object.values(vote.votes || {}).filter(v => v === opt.id).length;
    const isMyVote = myVote === opt.id;
    const sounds = DIR_SOUNDS[opt.type] || ['Неизвестность впереди...'];
    const hint = sounds[opt.id % sounds.length];
    const arrow = DIR_ARROW[opt.direction] || '▲';
    const dirText = DIR_TEXT[opt.direction] || opt.direction.toUpperCase();
    const roomColor = ROOM_TYPE_COLOR[opt.type] || '#1a2840';
    const preview = renderRoomPreviewSVG(opt.type, opt.id);
    return `
      <button class="dir-btn dir-btn-${opt.direction} ${isMyVote ? 'voted' : ''}"
              style="--room-color:${roomColor}" onclick="castVote(${opt.id})">
        <div class="dir-btn-preview">${preview}</div>
        <div class="dir-btn-body">
          <div class="dir-btn-header">
            <span class="dir-btn-arrow">${arrow}</span>
            <span class="dir-btn-direction">${dirText}</span>
          </div>
          <div class="dir-btn-divider"></div>
          <div class="dir-btn-room-row">
            <span class="dir-btn-symbol">${opt.symbol}</span>
            <span class="dir-btn-name">${opt.name}</span>
          </div>
          <div class="dir-btn-hint">${hint}</div>
          ${opt.locked ? `<div class="dir-btn-lock">🔒 Заперто</div>` : ''}
          ${voteCount > 0 ? `<div class="dir-btn-votes">${voteCount} ✓</div>` : ''}
        </div>
      </button>`;
  }).join('');

  optionsEl.innerHTML = `<div class="dir-buttons">${btnHtml}</div>`;

  if (vote.deadline) {
    updateVoteTimer(vote.deadline);
    if (!S.voteTimerInterval) {
      S.voteTimerInterval = setInterval(() => updateVoteTimer(vote.deadline), 1000);
    }
  }
}

function updateVoteTimer(deadline) {
  const remaining = Math.max(0, deadline - Date.now());
  const pct = (remaining / 30000) * 100;
  const fill = document.getElementById('vote-timer-fill');
  if (fill) fill.style.width = `${pct}%`;
  if (remaining === 0 && S.voteTimerInterval) {
    clearInterval(S.voteTimerInterval);
    S.voteTimerInterval = null;
  }
}

function castVote(roomId) {
  S.myVote = roomId;
  socket.emit('cast_vote', { roomId });
  renderVoting(S.gameState?.vote);
}

// ─── Combat Log ───────────────────────────────────────────────────────────────
function appendCombatLog(msg) {
  appendCombatLogEl(msg);
}

function appendCombatLogEl(msg) {
  const el = document.getElementById('combat-log');
  if (!el) return;

  const div = document.createElement('div');
  div.className = 'log-entry ' + classifyLog(msg);
  div.textContent = msg;
  el.appendChild(div);

  if (el.children.length > 100) el.removeChild(el.firstChild);
  el.scrollTop = el.scrollHeight;
}

function classifyLog(msg) {
  if (msg.includes('===') || msg.includes('---')) return 'separator';
  if (msg.includes('урона') && (msg.includes('атакует') || msg.includes('наносит'))) return 'damage';
  if (msg.includes('восстанавл') || msg.includes('исцеляет') || msg.includes('HP')) return 'heal';
  if (msg.includes('пал') || msg.includes('повержен') || msg.includes('умирает') || msg.includes('ПОРАЖЕНИЕ')) return 'death';
  if (msg.includes('золот') || msg.includes('получает:') || msg.includes('подбирает')) return 'loot';
  if (msg.includes('уровня') || msg.includes('ПОБЕДА') || msg.includes('🎉')) return 'level';
  if (msg.includes('КРИТ')) return 'critical';
  return 'system';
}

const ENEMY_ATTACK_PATTERN = /атакует|наносит|извергает|бросает|кусает|высасывает|хлещет/;

function isEnemyAttackLog(msg) {
  const room = S.gameState?.currentRoom;
  if (!room?.enemies) return false;
  return room.enemies.some(e => msg.startsWith(e.name) && ENEMY_ATTACK_PATTERN.test(msg));
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
function appendChat(sender, msg) {
  appendChatTo('lobby-chat-log', sender, msg);
  appendChatTo('game-chat-log', sender, msg);
}

function appendChatTo(elId, sender, msg) {
  const el = document.getElementById(elId);
  if (!el) return;
  const div = document.createElement('div');
  div.className = 'chat-entry';
  div.innerHTML = `<span class="sender">${escapeHtml(sender)}:</span> <span class="chat-msg">${escapeHtml(msg)}</span>`;
  el.appendChild(div);
  if (el.children.length > 50) el.removeChild(el.firstChild);
  el.scrollTop = el.scrollHeight;
}

document.getElementById('btn-game-chat-send').addEventListener('click', sendGameChat);
document.getElementById('game-chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendGameChat(); });

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && S.attackAimMode) {
    S.attackAimMode = false;
    S.selectedAction = null;
    _clearAimHint();
  }
});

function sendGameChat() {
  const input = document.getElementById('game-chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  socket.emit('chat_message', { message: msg });
  input.value = '';
}

// ─── End Screen ───────────────────────────────────────────────────────────────
function renderEndScreen(won) {
  showScreen('screen-end');
  const state = S.gameState;

  const titleEl = document.getElementById('end-title');
  titleEl.textContent = won ? '⚔ ПОБЕДА ⚔' : '☠ ПОРАЖЕНИЕ ☠';
  titleEl.className = `end-title ${won ? 'victory' : 'defeat'}`;

  const statsEl = document.getElementById('end-stats');
  const lines = state.players.map(p => {
    const ch = p.character;
    if (!ch) return `${p.name}: не участвовал`;
    return `${ch.symbol} ${p.name} (${ch.className} Lv${ch.level}) — ${ch.gold} золота`;
  });
  statsEl.innerHTML = lines.join('<br>');
}

document.getElementById('btn-back-menu').addEventListener('click', () => {
  clearSession();
  S.roomId = null;
  S.gameState = null;
  S.myVote = null;
  S.playerName = null;
  document.getElementById('btn-reconnect').style.display = 'none';
  document.getElementById('reconnect-saved-info').style.display = 'none';
  showScreen('screen-menu');
});

// ─── Scores ───────────────────────────────────────────────────────────────────
function loadScores() {
  fetch('/api/scores')
    .then(r => r.json())
    .then(scores => {
      showScreen('screen-scores');
      const el = document.getElementById('scores-list');
      if (!scores.length) {
        el.innerHTML = '<div style="color:var(--text-dim);padding:20px">Пока нет записей.</div>';
        return;
      }
      el.innerHTML = scores.map((s, i) => `
        <div class="score-entry">
          <div class="score-rank">#${i + 1}</div>
          <div class="score-players">${s.players?.map(p => `${p.name}(${p.class || '?'})`).join(', ') || 'Неизвестно'}</div>
          <div class="score-score">${s.score} очков</div>
          <div class="score-result ${s.won ? 'win' : 'loss'}">${s.won ? '✓ ПОБЕДА' : '✗ Поражение'}</div>
        </div>
      `).join('');
    })
    .catch(() => {
      showScreen('screen-scores');
      document.getElementById('scores-list').innerHTML = '<div style="color:var(--text-dim)">Ошибка загрузки.</div>';
    });
}

document.getElementById('btn-back-from-scores').addEventListener('click', () => showScreen('screen-menu'));

// ─── Modal ────────────────────────────────────────────────────────────────────
function showModal(title, body, buttons) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const footer = document.getElementById('modal-footer');
  footer.innerHTML = buttons.map(b =>
    `<button class="btn btn-ghost" onclick="${b.onclick.toString().includes('hideModal') ? 'hideModal()' : ''}">${b.label}</button>`
  ).join('');
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function hideModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) hideModal();
});

// ─── Util ─────────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Bonus System ─────────────────────────────────────────────────────────────
function updateBonusBanner() {
  const banner = document.getElementById('lobby-bonus-banner');
  if (!banner) return;
  if (!S.currentBonus) { banner.classList.add('hidden'); return; }
  banner.classList.remove('hidden');
  document.getElementById('bonus-title').textContent = S.currentBonus.title || '—';
  document.getElementById('bonus-desc').textContent = S.currentBonus.desc || '—';
}

function startBonusTimer() {
  if (S.bonusTimerInterval) { clearInterval(S.bonusTimerInterval); S.bonusTimerInterval = null; }
  tickBonusTimer();
  S.bonusTimerInterval = setInterval(tickBonusTimer, 1000);
}

function tickBonusTimer() {
  const el = document.getElementById('bonus-timer');
  if (!el || !S.bonusExpiresAt) return;
  const remaining = Math.max(0, S.bonusExpiresAt - Date.now());
  if (remaining === 0) { el.textContent = 'скоро...'; return; }
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  el.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ─── Door Challenge ────────────────────────────────────────────────────────────
function renderDoorChallenge(state) {
  const dc = state.doorChallenge;
  if (!dc) return;

  // Show the game screen underneath (for player stat panel visibility)
  showScreen('screen-game');
  renderPlayerStats(state.players);
  renderMiniMap(state.mapOverview);
  renderFloorIndicator(state.floorNumber);

  // Show door overlay on top
  const overlay = document.getElementById('door-overlay');
  overlay.classList.remove('hidden');

  document.getElementById('door-room-name').textContent = `→ ${dc.roomName}`;

  const myId = S.mySocketId;
  const amVolunteer = dc.volunteerId === myId;
  const triedIds = dc.triedIds || [];
  const alreadyTried = triedIds.includes(myId);
  const someoneActive = !!dc.volunteerId;

  // Fail info
  const failEl = document.getElementById('door-fail-info');
  failEl.textContent = dc.failedAttempts > 0 ? `Неудачных попыток: ${dc.failedAttempts}/3` : '';

  // Players list — show who tried, who is trying, who hasn't tried yet
  const playersHtml = state.players.map(p => {
    let status = '';
    if (p.socketId === dc.volunteerId) status = ' 🔓 взламывает...';
    else if (triedIds.includes(p.socketId)) status = ' ✗ не вышло';
    else status = '';
    return `<div class="door-player-row">${p.name}${status}</div>`;
  }).join('');
  document.getElementById('door-players-list').innerHTML = playersHtml;

  const volunteerSection = document.getElementById('door-volunteer-section');
  const minigameSection = document.getElementById('door-minigame-section');
  const waitingSection = document.getElementById('door-waiting-section');

  if (amVolunteer && dc.minigame) {
    volunteerSection.classList.add('hidden');
    waitingSection.classList.add('hidden');
    minigameSection.classList.remove('hidden');
    renderMinigame(dc.minigame);
  } else if (someoneActive) {
    volunteerSection.classList.add('hidden');
    minigameSection.classList.add('hidden');
    waitingSection.classList.remove('hidden');
    const volunteer = state.players.find(p => p.socketId === dc.volunteerId);
    document.getElementById('door-waiting-msg').textContent =
      `${volunteer?.name || 'Игрок'} пытается взломать дверь...`;
    stopMinigameAnimations();
  } else {
    volunteerSection.classList.remove('hidden');
    minigameSection.classList.add('hidden');
    waitingSection.classList.add('hidden');
    const btn = document.getElementById('btn-volunteer-door');
    btn.disabled = alreadyTried;
    btn.textContent = alreadyTried ? '✗ Попытка не удалась' : '🔓 Взломать дверь';
    const hintEl = document.getElementById('door-hint-text');
    hintEl.textContent = alreadyTried
      ? 'Вы уже пробовали. Ждём других...'
      : 'Вызовитесь взломать дверь. У каждого класса есть своя мини-игра.';
    stopMinigameAnimations();
  }

  // If phase is no longer door_challenge (e.g. server moved on), hide overlay
  if (state.phase !== 'door_challenge') {
    overlay.classList.add('hidden');
  }
}

function stopMinigameAnimations() {
  if (S.resAnimFrame) { cancelAnimationFrame(S.resAnimFrame); S.resAnimFrame = null; }
  if (S.mgTimerInterval) { clearInterval(S.mgTimerInterval); S.mgTimerInterval = null; }
  if (towerGame) { towerGame.destroy(); towerGame = null; }
}

function renderMinigame(mg) {
  const type = mg.type;
  document.getElementById('mg-title').textContent = MG_TITLES[type] || type;
  document.getElementById('mg-hint').textContent = MG_HINTS[type] || '';

  // Show only the relevant body
  ['mg-lockpick', 'mg-tower', 'mg-arcane', 'mg-resonance'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  const bodyId = { lockpick: 'mg-lockpick', tower_stack: 'mg-tower', arcane_sequence: 'mg-arcane', holy_resonance: 'mg-resonance' }[type];
  if (bodyId) document.getElementById(bodyId).classList.remove('hidden');

  // Timer bar (tower_stack manages its own time display on canvas)
  if (type !== 'tower_stack') startMgTimer(mg);

  if (type === 'lockpick') renderLockpick(mg);
  else if (type === 'tower_stack') renderTowerStack(mg);
  else if (type === 'arcane_sequence') renderArcaneSequence(mg);
  else if (type === 'holy_resonance') renderHolyResonance(mg);
}

const MG_TITLES = {
  lockpick: '🔑 ВЗЛОМ ЗАМКА',
  tower_stack: '🏰 БАШНЯ ВОИНА',
  arcane_sequence: '✨ МАГИЧЕСКАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ',
  holy_resonance: '✝ СВЯТОЙ РЕЗОНАНС'
};
const MG_HINTS = {
  lockpick: 'Нажимайте символы в нужном порядке. Следите за следующим символом!',
  tower_stack: 'Стройте башню до золотой линии. Двигайте мышь, нажмите чтобы бросить блок.',
  arcane_sequence: 'Запомните руны, затем введите их в том же порядке.',
  holy_resonance: 'Нажмите УДАР когда курсор окажется в золотой зоне!'
};

// Lockpick
function renderLockpick(mg) {
  const progressEl = document.getElementById('mg-lp-progress');
  const nextEl = document.getElementById('mg-lp-next');
  const attEl = document.getElementById('mg-lp-attempts');
  const buttonsEl = document.getElementById('mg-lp-buttons');

  const done = mg.currentIndex || 0;
  const total = mg.sequenceLength || 0;

  progressEl.innerHTML = Array.from({ length: total }, (_, i) =>
    `<span class="mg-lp-pip ${i < done ? 'done' : ''}">${i < done ? '✓' : '○'}</span>`
  ).join('');

  nextEl.textContent = mg.nextSymbol ?? '?';
  attEl.textContent = `Попытки: ${mg.attemptsLeft}/${mg.maxAttempts}`;

  const syms = mg.availableSymbols || ['↑', '↓', '←', '→'];
  buttonsEl.innerHTML = syms.map(sym =>
    `<button class="btn mg-lp-sym-btn" onclick="lpClick('${sym}')">${sym}</button>`
  ).join('');
}

function lpClick(symbol) {
  socket.emit('door_action', { symbol });
}

// ─── Tower Stack (Warrior) ─────────────────────────────────────────────────────
let towerGame = null;

class TowerPhysics {
  constructor(canvas, piecesTotal, targetHeight, deadlineTs) {
    this.canvas   = canvas;
    this.ctx      = canvas.getContext('2d');
    this.W        = canvas.width;
    this.H        = canvas.height;
    this.FLOOR_Y  = this.H - 28;
    this.WALL_L   = 12;
    this.WALL_R   = this.W - 12;
    this.TARGET_Y = this.FLOOR_Y - (this.FLOOR_Y - 28) * targetHeight;
    this.piecesTotal  = piecesTotal;
    this.bodies   = [];
    this.dragging = null;   // { body, offX, offY, lastMx, lastMy, dvx, dvy }
    this.done     = false;
    this.success  = false;
    this.gravity  = 520;
    this.lastTime = null;
    this.raf      = null;
    this._stableMs   = 0;
    this._deadlineTs = deadlineTs;
    this._spawnAll();
    this._bindEvents();
    this.raf = requestAnimationFrame(t => this._loop(t));
  }

  _rectVerts(hw, hh) {
    return [{ x: -hw, y: -hh }, { x: hw, y: -hh }, { x: hw, y: hh }, { x: -hw, y: hh }];
  }

  _spawnAll() {
    const usable = this.WALL_R - this.WALL_L - 4;
    const slot   = usable / this.piecesTotal;
    for (let i = 0; i < this.piecesTotal; i++) {
      const hw = slot * 0.5 * (0.58 + Math.random() * 0.34);
      const hh = 9 + Math.random() * 8;
      const x  = this.WALL_L + 2 + slot * (i + 0.5);
      const y  = this.FLOOR_Y - hh;
      this.bodies.push({ verts: this._rectVerts(hw, hh), hw, hh, x, y, rotation: 0, vx: 0, vy: 0, omega: 0 });
    }
  }

  _wv(b) {
    const c = Math.cos(b.rotation), s = Math.sin(b.rotation);
    return b.verts.map(v => ({ x: b.x + v.x * c - v.y * s, y: b.y + v.x * s + v.y * c }));
  }

  _hitTest(b, mx, my) {
    const c = Math.cos(-b.rotation), s = Math.sin(-b.rotation);
    const dx = mx - b.x, dy = my - b.y;
    const lx = dx * c - dy * s, ly = dx * s + dy * c;
    return Math.abs(lx) <= b.hw + 4 && Math.abs(ly) <= b.hh + 4;
  }

  _toCanvas(e) {
    const r = this.canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - r.left) * (this.W / r.width),
      y: (src.clientY - r.top)  * (this.H / r.height)
    };
  }

  _bindEvents() {
    this._onDown = e => {
      if (this.done) return;
      const { x, y } = this._toCanvas(e);
      for (let i = this.bodies.length - 1; i >= 0; i--) {
        const b = this.bodies[i];
        if (this._hitTest(b, x, y)) {
          b.vx = 0; b.vy = 0; b.omega = 0;
          this.dragging = { body: b, offX: b.x - x, offY: b.y - y, lastMx: x, lastMy: y, dvx: 0, dvy: 0 };
          this.canvas.style.cursor = 'grabbing';
          break;
        }
      }
    };
    this._onMove = e => {
      if (!this.dragging || this.done) return;
      if (e.cancelable) e.preventDefault();
      const { x, y } = this._toCanvas(e);
      const d = this.dragging;
      d.dvx = d.dvx * 0.4 + (x - d.lastMx) * 0.6;
      d.dvy = d.dvy * 0.4 + (y - d.lastMy) * 0.6;
      d.lastMx = x; d.lastMy = y;
      d.body.x = x + d.offX;
      d.body.y = y + d.offY;
      d.body.vx = 0; d.body.vy = 0; d.body.omega = 0;
    };
    this._onUp = () => {
      if (!this.dragging) return;
      const d = this.dragging;
      d.body.vx = d.dvx * 55;
      d.body.vy = d.dvy * 55;
      this.dragging = null;
      this.canvas.style.cursor = 'grab';
    };
    const el = this.canvas;
    el.addEventListener('mousedown',  this._onDown);
    el.addEventListener('mousemove',  this._onMove);
    el.addEventListener('mouseup',    this._onUp);
    el.addEventListener('mouseleave', this._onUp);
    el.addEventListener('touchstart', this._onDown, { passive: true });
    el.addEventListener('touchmove',  this._onMove, { passive: false });
    el.addEventListener('touchend',   this._onUp,   { passive: true });
  }

  _sat(va, vb) {
    let minD = Infinity, minN = null;
    for (const vs of [va, vb]) {
      for (let i = 0; i < vs.length; i++) {
        const j = (i + 1) % vs.length;
        const ex = vs[j].x - vs[i].x, ey = vs[j].y - vs[i].y;
        const len = Math.hypot(ex, ey); if (len < 0.001) continue;
        const nx = -ey / len, ny = ex / len;
        const pa = va.map(v => v.x * nx + v.y * ny);
        const pb = vb.map(v => v.x * nx + v.y * ny);
        const [minA, maxA] = [Math.min(...pa), Math.max(...pa)];
        const [minB, maxB] = [Math.min(...pb), Math.max(...pb)];
        if (maxA <= minB || maxB <= minA) return null;
        const d = Math.min(maxA - minB, maxB - minA);
        if (d < minD) { minD = d; minN = { x: nx, y: ny }; }
      }
    }
    return { depth: minD, nx: minN.x, ny: minN.y };
  }

  _resolveFloor(b) {
    const vs = this._wv(b);
    const maxY = Math.max(...vs.map(v => v.y));
    if (maxY > this.FLOOR_Y) {
      b.y -= maxY - this.FLOOR_Y;
      // Zero restitution on floor — no bounce, just friction
      if (b.vy > 0) { b.vy = 0; b.vx *= 0.7; b.omega *= 0.5; }
    }
    const minX = Math.min(...vs.map(v => v.x));
    const maxX = Math.max(...vs.map(v => v.x));
    if (minX < this.WALL_L) { b.x += this.WALL_L - minX; b.vx = Math.abs(b.vx) * 0.15; }
    if (maxX > this.WALL_R) { b.x -= maxX - this.WALL_R; b.vx = -Math.abs(b.vx) * 0.15; }
  }

  _resolveBodyBody(bA, bB) {
    const va = this._wv(bA), vb = this._wv(bB);
    const man = this._sat(va, vb); if (!man) return;
    let { depth, nx, ny } = man;
    const dx = bA.x - bB.x, dy = bA.y - bB.y;
    if (dx * nx + dy * ny < 0) { nx = -nx; ny = -ny; }
    const dragA = this.dragging?.body === bA;
    const dragB = this.dragging?.body === bB;
    // Soft positional correction with slop — each non-kinematic body gets half
    const slop = 0.6;
    const corrTotal = Math.max(depth - slop, 0) * 0.22;
    if (!dragA && !dragB) {
      bA.x += nx * corrTotal; bA.y += ny * corrTotal;
      bB.x -= nx * corrTotal; bB.y -= ny * corrTotal;
    } else if (!dragA) {
      bA.x += nx * corrTotal * 2; bA.y += ny * corrTotal * 2;
    } else if (!dragB) {
      bB.x -= nx * corrTotal * 2; bB.y -= ny * corrTotal * 2;
    }
    const rvx = bA.vx - bB.vx, rvy = bA.vy - bB.vy;
    const vn  = rvx * nx + rvy * ny;
    if (vn > 0) return;
    // Near-zero restitution so blocks don't bounce off each other
    const j = -vn * 0.5;
    if (!dragA) { bA.vx += j * nx; bA.vy += j * ny; bA.omega += j * 0.02 * (Math.random() - 0.5); }
    if (!dragB) { bB.vx -= j * nx; bB.vy -= j * ny; bB.omega -= j * 0.02 * (Math.random() - 0.5); }
    // Friction between blocks
    const tx = -ny, ty = nx, vt = rvx * tx + rvy * ty, jf = -vt * 0.35 * 0.5;
    if (!dragA) { bA.vx += jf * tx; bA.vy += jf * ty; }
    if (!dragB) { bB.vx -= jf * tx; bB.vy -= jf * ty; }
  }

  _settled(b) { return Math.abs(b.vx) < 4 && Math.abs(b.vy) < 4 && Math.abs(b.omega) < 0.04; }

  _update(dt) {
    const dragged = this.dragging?.body;
    for (const b of this.bodies) {
      if (b === dragged) continue;
      b.vy += this.gravity * dt;
      b.x  += b.vx * dt; b.y += b.vy * dt;
      b.rotation += b.omega * dt;
      // Strong angular + linear damping so blocks settle fast
      b.omega *= 0.88; b.vx *= 0.97; b.vy *= 0.998;
      this._resolveFloor(b);
    }
    // More iterations for stable stacking convergence
    for (let iter = 0; iter < 5; iter++) {
      for (let i = 0; i < this.bodies.length; i++)
        for (let j = i + 1; j < this.bodies.length; j++)
          this._resolveBodyBody(this.bodies[i], this.bodies[j]);
      for (const b of this.bodies) if (b !== dragged) this._resolveFloor(b);
    }
    // Snap tiny velocities to zero to prevent perpetual micro-sliding
    for (const b of this.bodies) {
      if (b === dragged) continue;
      if (Math.abs(b.vx)    < 0.6)  b.vx    = 0;
      if (Math.abs(b.vy)    < 0.6)  b.vy    = 0;
      if (Math.abs(b.omega) < 0.004) b.omega = 0;
    }
    // Clamp dragged piece to canvas bounds
    if (dragged) {
      const vs = this._wv(dragged);
      const minX = Math.min(...vs.map(v => v.x)), maxX = Math.max(...vs.map(v => v.x));
      const maxY = Math.max(...vs.map(v => v.y));
      if (minX < this.WALL_L) dragged.x += this.WALL_L - minX;
      if (maxX > this.WALL_R) dragged.x -= maxX - this.WALL_R;
      if (maxY > this.FLOOR_Y) dragged.y -= maxY - this.FLOOR_Y;
    }
    // Success: any block top crosses the target line and stays there for 3 s.
    // Countdown resets if the block falls back below the line or player picks something up.
    const reached = this.bodies.some(b => Math.min(...this._wv(b).map(v => v.y)) <= this.TARGET_Y);
    if (!dragged && reached) {
      this._stableMs += dt * 1000;
      if (this._stableMs >= 3000) { this.done = true; this.success = true; }
    } else {
      this._stableMs = 0;
    }
    // Timeout
    if (this._deadlineTs && Date.now() > this._deadlineTs) { this.done = true; this.success = false; }
  }

  _draw() {
    const { ctx, W, H, FLOOR_Y, WALL_L, WALL_R, TARGET_Y } = this;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#04060c'; ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
    for (let x = WALL_L; x <= WALL_R; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, FLOOR_Y); ctx.stroke();
    }

    // Target line
    ctx.save();
    ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 2; ctx.setLineDash([8, 5]);
    ctx.beginPath(); ctx.moveTo(WALL_L, TARGET_Y); ctx.lineTo(WALL_R, TARGET_Y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#cc9900'; ctx.font = 'bold 9px monospace';
    ctx.fillText('▲ ЦЕЛЬ', WALL_L + 4, TARGET_Y - 4);
    ctx.restore();

    // Floor
    ctx.fillStyle = '#16102a'; ctx.fillRect(WALL_L, FLOOR_Y, WALL_R - WALL_L, H - FLOOR_Y);
    ctx.strokeStyle = '#5a2aaa'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(WALL_L, FLOOR_Y); ctx.lineTo(WALL_R, FLOOR_Y); ctx.stroke();

    // Walls
    ctx.strokeStyle = 'rgba(90,42,170,0.35)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(WALL_L, 0); ctx.lineTo(WALL_L, FLOOR_Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(WALL_R, 0); ctx.lineTo(WALL_R, FLOOR_Y); ctx.stroke();

    // Blocks (draw dragged last so it appears on top)
    const dragged = this.dragging?.body;
    for (const b of this.bodies) {
      if (b === dragged) continue;
      const settled = this._settled(b);
      this._drawBlock(b, settled ? '#1e1040' : '#140a30', settled ? '#8855ee' : '#cc66ff');
    }
    if (dragged && !this.done) {
      this._drawBlock(dragged, '#0a2a18', '#00ee88', 0.92);
    }

    // Stable countdown — drawn after blocks so it's always on top
    if (this._stableMs > 0) {
      const frac     = Math.min(this._stableMs / 3000, 1);
      const secsLeft = Math.ceil((3000 - this._stableMs) / 1000);
      const sz       = 72 + Math.round(frac * 20);
      const midX     = W / 2;
      const midY     = (TARGET_Y + 28) / 2 + sz * 0.35;
      ctx.save();
      ctx.textAlign  = 'center';
      ctx.font       = `bold ${sz}px monospace`;
      // Dark outline for readability over any background
      ctx.lineWidth   = 8;
      ctx.strokeStyle = 'rgba(0,0,0,0.75)';
      ctx.lineJoin    = 'round';
      ctx.strokeText(secsLeft, midX, midY);
      // Bright green fill, more saturated as time runs out
      ctx.fillStyle = `rgb(0,${220 + Math.round(frac * 35)},${80 + Math.round(frac * 60)})`;
      ctx.fillText(secsLeft, midX, midY);
      // Progress bar just above target line
      const barY = TARGET_Y - 7, barW = WALL_R - WALL_L - 4;
      ctx.fillStyle = 'rgba(0,60,30,0.7)';
      ctx.fillRect(WALL_L + 2, barY, barW, 5);
      ctx.fillStyle = `rgba(0,220,100,0.95)`;
      ctx.fillRect(WALL_L + 2, barY, barW * frac, 5);
      ctx.textAlign = 'left';
      ctx.restore();
    }

    // Timer & block count
    const remaining = this._deadlineTs ? Math.max(0, this._deadlineTs - Date.now()) : 0;
    const secs = Math.ceil(remaining / 1000);
    ctx.fillStyle = '#9966ff'; ctx.font = '9px monospace';
    ctx.fillText(`Блоков: ${this.piecesTotal}`, WALL_L + 4, 13);
    ctx.fillStyle = secs < 10 ? '#cc2200' : '#445566';
    ctx.textAlign = 'right'; ctx.fillText(`${secs}с`, WALL_R - 4, 13); ctx.textAlign = 'left';

    // Result overlay
    if (this.done) {
      ctx.fillStyle = this.success ? 'rgba(0,130,60,0.8)' : 'rgba(130,0,0,0.8)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(this.success ? '✓ БАШНЯ ВОЗВЕДЕНА!' : '✗ БАШНЯ РУХНУЛА', W / 2, H / 2 - 8);
      ctx.font = '10px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(this.success ? 'Дверь открыта!' : 'Попытка провалена', W / 2, H / 2 + 12);
      ctx.textAlign = 'left';
    }
  }

  _drawBlock(b, fill, stroke, alpha = 1) {
    const ctx = this.ctx, vs = this._wv(b);
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.moveTo(vs[0].x, vs[0].y);
    for (let i = 1; i < vs.length; i++) ctx.lineTo(vs[i].x, vs[i].y);
    ctx.closePath();
    ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
    // Top-edge highlight
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(vs[0].x, vs[0].y); ctx.lineTo(vs[1].x, vs[1].y); ctx.stroke();
    ctx.restore();
  }

  _loop(ts) {
    if (!this.lastTime) this.lastTime = ts;
    const dt = Math.min((ts - this.lastTime) / 1000, 0.033);
    this.lastTime = ts;
    this._update(dt);
    this._draw();
    if (!this.done) this.raf = requestAnimationFrame(t => this._loop(t));
    else this._draw();
  }

  destroy() {
    if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; }
    const el = this.canvas;
    el.removeEventListener('mousedown',  this._onDown);
    el.removeEventListener('mousemove',  this._onMove);
    el.removeEventListener('mouseup',    this._onUp);
    el.removeEventListener('mouseleave', this._onUp);
    el.removeEventListener('touchstart', this._onDown);
    el.removeEventListener('touchmove',  this._onMove);
    el.removeEventListener('touchend',   this._onUp);
    this.canvas.style.cursor = '';
  }
}

function renderTowerStack(mg) {
  const canvas = document.getElementById('mg-tower-canvas');
  if (!canvas) return;
  if (towerGame && !towerGame.done) return; // already running
  if (towerGame) { towerGame.destroy(); towerGame = null; }

  towerGame = new TowerPhysics(canvas, mg.piecesTotal, mg.targetHeight, mg.deadline);

  let reported = false;
  const poll = setInterval(() => {
    if (!towerGame?.done) return;
    clearInterval(poll);
    if (!reported) {
      reported = true;
      socket.emit('door_action', { success: towerGame.success });
    }
  }, 150);
}

// Arcane Sequence
const RUNE_SYMBOLS = { 1: '⬡', 2: '⬟', 3: '⬠', 4: '⬢' };
function renderArcaneSequence(mg) {
  const runesEl = document.getElementById('mg-arcane-runes');
  const inputEl = document.getElementById('mg-arcane-input');
  const attEl = document.getElementById('mg-arcane-attempts');

  attEl.textContent = `Попытки: ${mg.attemptsLeft}/${mg.maxAttempts}`;

  if (mg.revealed) {
    // Show the sequence to memorize
    runesEl.innerHTML = (mg.runes || []).map(r =>
      `<span class="mg-rune mg-rune-reveal">${RUNE_SYMBOLS[r] || r}</span>`
    ).join('');
    inputEl.innerHTML = '<div class="mg-arcane-status">Запоминайте...</div>';
  } else {
    // Input phase — show what has been entered
    const entered = mg.input || [];
    runesEl.innerHTML = Array.from({ length: mg.sequenceLength || 4 }, (_, i) =>
      `<span class="mg-rune ${i < entered.length ? 'entered' : 'blank'}">${i < entered.length ? (RUNE_SYMBOLS[entered[i]] || entered[i]) : '?'}</span>`
    ).join('');
    inputEl.innerHTML = '';
  }
}

function arcaneRune(runeId) {
  socket.emit('door_action', { rune: parseInt(runeId) });
}

// Holy Resonance
function renderHolyResonance(mg) {
  const zoneEl = document.getElementById('mg-res-zone');
  const attEl  = document.getElementById('mg-res-attempts');
  const hitsEl = document.getElementById('mg-res-hits');

  const zoneLeft  = mg.zoneStart;
  const zoneWidth = mg.zoneEnd - mg.zoneStart;
  zoneEl.style.left  = `${zoneLeft}%`;
  zoneEl.style.width = `${zoneWidth}%`;

  attEl.textContent = `Попытки: ${mg.attemptsLeft}/${mg.maxAttempts}`;

  const scored   = mg.hitsScored   ?? 0;
  const required = mg.hitsRequired ?? 3;
  if (hitsEl) {
    hitsEl.innerHTML = Array.from({ length: required }, (_, i) =>
      `<span class="mg-res-hit-pip ${i < scored ? 'scored' : ''}">${i < scored ? '✝' : '✝'}</span>`
    ).join('');
  }

  startResAnimation(mg);
}

function startResAnimation(mg) {
  if (S.resAnimFrame) cancelAnimationFrame(S.resAnimFrame);
  const cursor = document.getElementById('mg-res-cursor');
  if (!cursor) return;

  // Use server's authoritative position + direction as baseline, animate from there
  let pos = mg.barPosition || 0;
  let dir = mg.direction || 1;
  let lastTime = performance.now();

  function tick(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    pos += dir * mg.speed * dt;
    if (pos >= 100) { pos = 100; dir = -1; }
    if (pos <= 0)   { pos = 0;   dir =  1; }
    cursor.style.left = `${pos}%`;
    S.resAnimFrame = requestAnimationFrame(tick);
  }
  S.resAnimFrame = requestAnimationFrame(tick);
}

function strikeClick() {
  socket.emit('door_action', { strike: true });
}

// Mini-game timer bar — mg.deadline is the absolute expiry timestamp
function startMgTimer(mg) {
  if (S.mgTimerInterval) { clearInterval(S.mgTimerInterval); S.mgTimerInterval = null; }
  const fill = document.getElementById('mg-timer-fill');
  if (!fill || !mg.deadline) return;

  const totalMs = mg.deadline - mg.startedAt;

  function tick() {
    const remaining = Math.max(0, mg.deadline - Date.now());
    const pct = totalMs > 0 ? (remaining / totalMs) * 100 : 0;
    fill.style.width = `${pct}%`;
    fill.style.background = pct < 30 ? '#cc2200' : pct < 60 ? '#cc9900' : '#00aa44';
    if (pct <= 0) { clearInterval(S.mgTimerInterval); S.mgTimerInterval = null; }
  }
  tick();
  S.mgTimerInterval = setInterval(tick, 100);
}

// ─── Door Volunteer Button ─────────────────────────────────────────────────────
document.getElementById('btn-volunteer-door').addEventListener('click', () => {
  socket.emit('volunteer_door', (res) => {
    if (!res?.ok) console.log('volunteer_door error:', res?.reason);
  });
});

document.getElementById('btn-strike').addEventListener('click', strikeClick);

document.querySelectorAll('.mg-rune-btn').forEach(btn => {
  btn.addEventListener('click', () => arcaneRune(btn.dataset.rune));
});


// ─── Init ─────────────────────────────────────────────────────────────────────
showScreen('screen-menu');
