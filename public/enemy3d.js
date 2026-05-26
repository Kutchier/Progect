'use strict';

// ─── 3D Enemy Renderer ────────────────────────────────────────────────────────
// Renders procedural low-poly Three.js enemy models in place of 2D SVG portraits.
// Single WebGLRenderer shared across all mounts (one active portrait at a time).

window.Enemy3D = (() => {

  let renderer = null, scene = null, camera = null, hitLight = null;
  let activeGroup = null, animId = null, currentTypeId = null;
  let hitTimer = -1, deathTimer = -1, attackTimer = -1;

  const MAGIC_TYPES = new Set([
    'dark_mage', 'witch', 'lich', 'shadow', 'chaos_lord', 'spider_queen'
  ]);

  // ─── Material & geometry helpers ───────────────────────────────────────────

  function m(color, transparent, opacity) {
    return new THREE.MeshLambertMaterial({
      color,
      flatShading: true,
      transparent: transparent || opacity < 1 || false,
      opacity: opacity ?? 1
    });
  }

  function em(emissiveHex) {
    return new THREE.MeshLambertMaterial({ color: 0x040404, emissive: emissiveHex, flatShading: true });
  }

  function bx(mat, w, h, d, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    if (x !== undefined) mesh.position.set(x, y, z);
    return mesh;
  }

  function cn(mat, r, h, s, x, y, z, rx, rz) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r, h, s), mat);
    mesh.position.set(x ?? 0, y ?? 0, z ?? 0);
    if (rx) mesh.rotation.x = rx;
    if (rz) mesh.rotation.z = rz;
    return mesh;
  }

  function cy(mat, rt, rb, h, s, x, y, z, rx) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat);
    mesh.position.set(x ?? 0, y ?? 0, z ?? 0);
    if (rx) mesh.rotation.x = rx;
    return mesh;
  }

  function sp(mat, r, s, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, s, s), mat);
    mesh.position.set(x ?? 0, y ?? 0, z ?? 0);
    return mesh;
  }

  // ─── Humanoid base ─────────────────────────────────────────────────────────
  // Builds a standard biped from boxes.

  function humanoid(cfg) {
    const {
      bodyC, legsC, headC, eyeC,
      scl = 1,
      tw = 1.3, th = 1.3, td = 0.7,
      lw = 0.48, lh = 1.05, lg = 0.3,
      aw = 0.36, ah = 1.1,
      hw = 1.0,  hh = 0.95, hd = 0.88,
      ew = 0.2,  eh = 0.2,  eox = 0.2, eoy = 0
    } = cfg;

    const g = new THREE.Group();
    const mb = m(bodyC), ml = m(legsC ?? bodyC), mh = m(headC), me = em(eyeC);
    const ag = tw / 2 + aw / 2;
    const hy = th / 2 + hh / 2;

    g.add(bx(ml, lw, lh, lw, -lg, -th / 2 - lh / 2, 0));
    g.add(bx(ml, lw, lh, lw,  lg, -th / 2 - lh / 2, 0));
    g.add(bx(mb, tw, th, td));
    g.add(bx(mb, aw, ah, aw, -ag, 0, 0));
    g.add(bx(mb, aw, ah, aw,  ag, 0, 0));
    g.add(bx(mh, hw, hh, hd, 0, hy, 0));
    const ez = hd / 2 + 0.04;
    g.add(bx(me, ew, eh, 0.06, -eox, hy + eoy, ez));
    g.add(bx(me, ew, eh, 0.06,  eox, hy + eoy, ez));

    g.scale.setScalar(scl);
    return g;
  }

  // ─── Enemy builders ────────────────────────────────────────────────────────

  function buildGoblin() {
    const g = humanoid({ bodyC: 0x162a0e, legsC: 0x0e1a08, headC: 0x1c3410, eyeC: 0xff8000, scl: 0.88, hw: 1.1, hh: 0.92 });
    const earM = m(0x0e1a08);
    g.add(bx(earM, 0.16, 0.52, 0.1, -0.73, 1.33, 0));
    g.add(bx(earM, 0.16, 0.52, 0.1,  0.73, 1.33, 0));
    const toothM = m(0xb8b840);
    for (let i = 0; i < 4; i++) g.add(bx(toothM, 0.1, 0.18, 0.05, -0.2 + i * 0.14, 0.62, 0.38));
    return g;
  }

  function buildSkeleton() {
    const g = new THREE.Group();
    const bone = m(0xc8c8b0), boneDk = m(0x9a9880), eyeM = em(0xff4422);
    // Legs
    g.add(bx(bone, 0.32, 1.05, 0.32, -0.28, -1.12, 0));
    g.add(bx(bone, 0.32, 1.05, 0.32,  0.28, -1.12, 0));
    // Pelvis
    g.add(bx(boneDk, 1.1, 0.3, 0.6, 0, -0.53, 0));
    // Ribcage
    g.add(bx(boneDk, 1.25, 1.15, 0.62, 0, 0.1, 0));
    for (let i = 0; i < 3; i++) g.add(bx(m(0x040404), 1.22, 0.06, 0.63, 0, -0.12 + i * 0.24, 0.01));
    // Arms
    g.add(bx(bone, 0.28, 1.05, 0.28, -0.9, 0.1, 0));
    g.add(bx(bone, 0.28, 1.05, 0.28,  0.9, 0.1, 0));
    // Skull
    g.add(bx(bone, 0.95, 0.95, 0.86, 0, 1.15, 0));
    g.add(bx(boneDk, 0.72, 0.24, 0.72, 0, 0.63, 0.04));
    for (let i = 0; i < 4; i++) g.add(bx(m(0xe8e8d0), 0.1, 0.18, 0.06, -0.2 + i * 0.14, 0.61, 0.4));
    g.add(bx(eyeM, 0.3, 0.33, 0.06, -0.22, 1.18, 0.44));
    g.add(bx(eyeM, 0.3, 0.33, 0.06,  0.22, 1.18, 0.44));
    return g;
  }

  function buildZombie() {
    const g = humanoid({ bodyC: 0x1a2208, legsC: 0x161808, headC: 0x2a3018, eyeC: 0xcc1000 });
    g.rotation.x = 0.13;
    const ra = bx(m(0x1a2208), 0.38, 0.95, 0.38, 0.88, 0.38, 0.32);
    ra.rotation.x = -0.48;
    g.add(ra);
    return g;
  }

  function buildDarkMage() {
    const g = new THREE.Group();
    const robe = m(0x0e0a1e), robeDk = m(0x0a0618), skin = m(0x110c22);
    const eyeM = em(0xcc88ff), staffC = m(0x2a1840);
    g.add(bx(robe,   1.5,  2.0, 0.8,  0, -0.5,  0));
    g.add(bx(robeDk, 1.75, 0.5, 0.9,  0, -1.45, 0));
    g.add(bx(robeDk, 0.42, 1.2, 0.42, -1.1,  0, 0));
    g.add(bx(robeDk, 0.42, 1.2, 0.42,  1.1,  0, 0));
    g.add(bx(skin,   1.0,  1.0, 0.88,  0,  1.1, 0));
    g.add(bx(robeDk, 1.12, 0.65, 0.94, 0, 1.35, 0.06));
    g.add(bx(eyeM, 0.2, 0.2, 0.07, -0.22, 1.1, 0.45));
    g.add(bx(eyeM, 0.2, 0.2, 0.07,  0.22, 1.1, 0.45));
    g.add(cy(staffC, 0.055, 0.055, 2.7, 9, 1.5, -0.15, 0.35));
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshLambertMaterial({ color: 0x3300aa, emissive: 0x6622ff, flatShading: true }));
    orb.position.set(1.5, 1.35, 0.35);
    g.add(orb);
    return g;
  }

  function buildTroll() {
    const g = humanoid({
      bodyC: 0x262e1a, legsC: 0x202818, headC: 0x2c3420, eyeC: 0xff2200,
      scl: 1.2, tw: 1.7, th: 1.5, td: 0.9, lw: 0.6, aw: 0.52, ah: 1.3, hw: 1.3, hh: 1.1
    });
    // Third center eye
    g.add(bx(em(0xff2200), 0.2, 0.2, 0.07, 0, 1.75 + 0.1, 0.52));
    // Club
    const clubM = m(0x1a1808);
    g.add(cy(clubM, 0.1, 0.08, 1.5, 9, -1.05 - 0.52 - 0.12, -0.5, 0));
    g.add(bx(m(0x141206), 0.35, 0.42, 0.35, -1.05 - 0.52 - 0.12, -1.55, 0));
    return g;
  }

  function buildVampire() {
    const g = humanoid({ bodyC: 0x0c0818, legsC: 0x0a0614, headC: 0xd8d0e8, eyeC: 0xff2222, tw: 1.4 });
    const capeM = m(0x06040e);
    g.add(bx(capeM, 2.0, 2.5, 0.12, 0, -0.3, -0.45));
    const cL = bx(capeM, 0.5, 2.2, 0.12, -1.05, -0.3, -0.28);
    cL.rotation.z = 0.22; g.add(cL);
    const cR = bx(capeM, 0.5, 2.2, 0.12, 1.05, -0.3, -0.28);
    cR.rotation.z = -0.22; g.add(cR);
    // Fangs
    const fM = m(0xf0ecf8);
    g.add(bx(fM, 0.09, 0.24, 0.05, -0.14, 0.58, 0.45));
    g.add(bx(fM, 0.09, 0.24, 0.05,  0.14, 0.58, 0.45));
    return g;
  }

  function buildLich() {
    const g = new THREE.Group();
    const bone = m(0xb8b8a0), boneDk = m(0x9a9880), robe = m(0x0e0c28), crownC = m(0x5a3808);
    const eyeM = em(0xcc99ff);
    g.add(bx(robe,   1.5,  2.0, 0.8,  0, -0.5, 0));
    g.add(bx(robe,   1.75, 0.45, 0.88, 0, -1.4, 0));
    g.add(bx(robe,   0.42, 1.2, 0.42, -1.1, 0, 0));
    g.add(bx(robe,   0.42, 1.2, 0.42,  1.1, 0, 0));
    g.add(bx(bone,   0.95, 0.95, 0.86, 0, 1.12, 0));
    g.add(bx(boneDk, 0.72, 0.24, 0.7,  0,  0.6, 0.04));
    for (let i = 0; i < 3; i++) g.add(bx(m(0xd8d8c0), 0.1, 0.18, 0.05, -0.15 + i * 0.15, 0.6, 0.4));
    // Crown band + spikes
    g.add(bx(crownC, 1.02, 0.22, 0.88, 0, 1.65, 0));
    for (let i = 0; i < 5; i++) g.add(cn(crownC, 0.08, 0.35, 7, -0.4 + i * 0.2, 1.87, 0));
    g.add(bx(eyeM, 0.28, 0.28, 0.06, -0.22, 1.16, 0.44));
    g.add(bx(eyeM, 0.28, 0.28, 0.06,  0.22, 1.16, 0.44));
    return g;
  }

  function buildDemon() {
    const g = humanoid({ bodyC: 0x280e18, legsC: 0x200810, headC: 0x2e0e1c, eyeC: 0xff8800, tw: 1.45, aw: 0.44, hw: 1.1 });
    const hornM = m(0x180408);
    g.add(cn(hornM, 0.12, 0.72, 7, -0.38, 1.98, 0, 0, -0.36));
    g.add(cn(hornM, 0.12, 0.72, 7,  0.38, 1.98, 0, 0,  0.36));
    g.add(cy(m(0x200810), 0.07, 0.13, 0.8, 8, 0, -2.0, -0.4, 0.4));
    g.add(cn(m(0x180408), 0.15, 0.3, 6, 0, -2.56, -0.22, 0.4));
    return g;
  }

  function buildDragonBoss() {
    const g = new THREE.Group();
    const sc = m(0x16241a), scDk = m(0x0e1a10);
    const eyeM = em(0xff9900);
    // Main body
    g.add(bx(sc, 2.5, 1.8, 1.6));
    // Neck + head
    g.add(bx(sc, 1.0, 1.4, 1.0, 0, 1.5, 0.3));
    g.add(bx(sc, 1.6, 1.1, 1.4, 0, 2.4, 0.4));
    g.add(bx(scDk, 1.0, 0.65, 0.9, 0, 2.1, 1.15));
    g.add(bx(eyeM, 0.28, 0.28, 0.08, -0.42, 2.48, 0.86));
    g.add(bx(eyeM, 0.28, 0.28, 0.08,  0.42, 2.48, 0.86));
    // Spine spikes
    for (let i = 0; i < 5; i++) g.add(cn(scDk, 0.1, 0.55 - i * 0.07, 7, 0, 1.0 - i * 0.28, -0.78));
    // Front legs
    g.add(bx(scDk, 0.65, 1.3, 0.65, -1.45, -0.7, 0.4));
    g.add(bx(scDk, 0.65, 1.3, 0.65,  1.45, -0.7, 0.4));
    // Tail stub
    g.add(bx(sc,   0.9,  0.7, 0.7, 0, -0.2, -1.2));
    g.add(bx(scDk, 0.55, 0.5, 0.5, 0, -0.25, -2.1));
    g.scale.setScalar(0.68);
    return g;
  }

  function buildSpiderQueen() {
    const g = new THREE.Group();
    const bd = m(0x261c3a), bdLt = m(0x2a2050), eyeM = em(0xff2200), crownC = m(0x5a3808);
    // Spider abdomen + thorax
    g.add(sp(m(0x1e1530), 0.85, 12, 0, -1.1, -0.4));
    g.add(sp(bdLt, 0.65, 12, 0, -0.1, -0.15));
    // Human torso + head
    g.add(bx(bd, 1.2, 1.1, 0.7, 0, 0.62, 0));
    g.add(bx(bdLt, 0.95, 0.9, 0.84, 0, 1.55, 0));
    // Crown
    g.add(bx(crownC, 1.0, 0.2, 0.86, 0, 2.06, 0));
    for (let i = 0; i < 3; i++) g.add(cn(crownC, 0.07, 0.3, 7, -0.3 + i * 0.3, 2.22, 0));
    // 4 pairs of eyes
    for (let i = 0; i < 4; i++) g.add(bx(eyeM, 0.14, 0.14, 0.06, -0.34 + i * 0.24, 1.58, 0.43));
    // Spider legs (8 total)
    for (let i = 0; i < 4; i++) {
      const lm = m(0x201530);
      const lL = cy(lm, 0.06, 0.04, 1.0, 8, -0.62, -0.35, 0);
      lL.rotation.z =  (0.4 + i * 0.12);
      lL.rotation.x = (-0.3 + i * 0.12);
      g.add(lL);
      const lR = cy(lm, 0.06, 0.04, 1.0, 8,  0.62, -0.35, 0);
      lR.rotation.z = -(0.4 + i * 0.12);
      lR.rotation.x = (-0.3 + i * 0.12);
      g.add(lR);
    }
    g.scale.setScalar(0.65);
    return g;
  }

  function buildRatSwarm() {
    const g = new THREE.Group();
    const ratC = m(0x241a08), ratDk = m(0x201608), eyeM = em(0xcc2200);

    function rat(x, y, z, sc) {
      const r = new THREE.Group();
      r.add(bx(ratC, 0.7, 0.5, 0.9));
      r.add(bx(ratDk, 0.45, 0.42, 0.5, 0, 0.22, 0.55));
      r.add(bx(eyeM, 0.1, 0.1, 0.05, -0.12, 0.28, 0.78));
      r.add(bx(eyeM, 0.1, 0.1, 0.05,  0.12, 0.28, 0.78));
      r.add(cn(ratDk, 0.08, 0.2, 7, -0.18, 0.6, 0.4));
      r.add(cn(ratDk, 0.08, 0.2, 7,  0.18, 0.6, 0.4));
      r.add(cy(ratDk, 0.04, 0.03, 0.7, 8, 0, 0, -0.55, 0.3));
      r.position.set(x, y, z);
      r.scale.setScalar(sc);
      return r;
    }

    g.add(rat(-0.65, -0.8, 0.2,  0.9));
    g.add(rat( 0.65, -0.8, 0.1,  0.95));
    g.add(rat( 0.0,  -0.2, -0.2, 1.1));
    return g;
  }

  function buildCaveBat() {
    const g = new THREE.Group();
    const wingC = m(0x1e1430), wingDk = m(0x160e24), bodyC = m(0x241838), eyeM = em(0xff4422);
    g.add(sp(bodyC, 0.38, 12, 0, 0, 0));
    g.add(bx(bodyC, 0.48, 0.44, 0.44, 0, 0.42, 0));
    g.add(bx(eyeM, 0.12, 0.12, 0.05, -0.12, 0.46, 0.24));
    g.add(bx(eyeM, 0.12, 0.12, 0.05,  0.12, 0.46, 0.24));
    const wL = bx(wingDk, 1.5, 0.07, 1.1, -1.06, 0.12, -0.1);
    wL.rotation.z = 0.35; wL.rotation.x = -0.15; g.add(wL);
    const wR = bx(wingDk, 1.5, 0.07, 1.1,  1.06, 0.12, -0.1);
    wR.rotation.z = -0.35; wR.rotation.x = -0.15; g.add(wR);
    g.add(bx(wingC, 0.9, 0.06, 0.7, -0.6, 0.08, 0));
    g.add(bx(wingC, 0.9, 0.06, 0.7,  0.6, 0.08, 0));
    g.add(cy(m(0x1e1430), 0.05, 0.04, 0.4, 8, -0.15, -0.46, 0, 0.2));
    g.add(cy(m(0x1e1430), 0.05, 0.04, 0.4, 8,  0.15, -0.46, 0, 0.2));
    g.scale.setScalar(1.1);
    return g;
  }

  function buildKobold() {
    const g = humanoid({
      bodyC: 0x22300e, legsC: 0x182010, headC: 0x283612, eyeC: 0xffdd22,
      scl: 0.82, hw: 1.05, hh: 0.88
    });
    g.add(bx(m(0x22300e), 0.55, 0.35, 0.45, 0, 1.04, 0.56));
    g.add(cn(m(0x2a2208), 0.07, 0.28, 7, -0.28, 1.72, 0, 0, -0.22));
    g.add(cn(m(0x2a2208), 0.07, 0.28, 7,  0.28, 1.72, 0, 0,  0.22));
    return g;
  }

  function buildWerewolf() {
    const g = humanoid({
      bodyC: 0x302428, legsC: 0x281e22, headC: 0x302428, eyeC: 0xffaa00,
      scl: 1.08, tw: 1.4, th: 1.45, hw: 1.15, hh: 1.05, hd: 0.96
    });
    g.add(cn(m(0x281e22), 0.12, 0.55, 7, -0.38, 2.28, 0, 0, -0.22));
    g.add(cn(m(0x281e22), 0.12, 0.55, 7,  0.38, 2.28, 0, 0,  0.22));
    g.add(bx(m(0x261c22), 0.6, 0.4, 0.52, 0, 1.12, 0.56));
    // Claws
    const clawM = m(0xd8d0c0);
    g.add(cn(clawM, 0.06, 0.22, 6, -1.3, -0.38, 0.15, Math.PI * 0.5));
    g.add(cn(clawM, 0.06, 0.22, 6,  1.3, -0.38, 0.15, Math.PI * 0.5));
    return g;
  }

  function buildGiantSpider() {
    const g = new THREE.Group();
    const bd = m(0x201840), bdLt = m(0x281e48), eyeM = em(0xcc0000);
    g.add(sp(bdLt, 1.05, 12, 0, -0.9, -0.3));
    g.add(sp(bd,   0.72, 12, 0,  0,    0.1));
    for (let i = 0; i < 3; i++) g.add(bx(eyeM, 0.16, 0.16, 0.06, -0.25 + i * 0.25, 0.4, 0.62));
    g.add(cn(m(0x180e2e), 0.1, 0.45, 7, -0.22, -0.2, 0.76, Math.PI * 0.5, -0.3));
    g.add(cn(m(0x180e2e), 0.1, 0.45, 7,  0.22, -0.2, 0.76, Math.PI * 0.5,  0.3));
    for (let i = 0; i < 4; i++) {
      const lm = m(0x201840);
      const lL = cy(lm, 0.06, 0.04, 1.05, 8, -0.65, -0.1, 0);
      lL.rotation.z =  (0.5 + i * 0.15);
      lL.rotation.x = (-0.25 + i * 0.1);
      g.add(lL);
      const lR = cy(lm, 0.06, 0.04, 1.05, 8,  0.65, -0.1, 0);
      lR.rotation.z = -(0.5 + i * 0.15);
      lR.rotation.x = (-0.25 + i * 0.1);
      g.add(lR);
    }
    g.scale.setScalar(0.88);
    return g;
  }

  function buildShadow() {
    const g = new THREE.Group();
    const ghostC = m(0x0e082a, true, 0.78), ghostLt = m(0x0c0620, true, 0.65);
    const eyeM = em(0xcc88ff);
    g.add(bx(ghostC,  1.4, 2.5, 0.8,  0, -0.2, 0));
    g.add(bx(ghostLt, 1.6, 0.7, 0.9,  0, -1.3, 0));
    g.add(bx(ghostC,  1.2, 1.1, 0.75, 0,  1.0, 0));
    for (let i = 0; i < 3; i++) g.add(cn(m(0x0a061e, true, 0.5), 0.12, 0.65, 7, -0.45 + i * 0.45, -1.85, 0));
    g.add(bx(eyeM, 0.28, 0.28, 0.06, -0.22, 1.04, 0.38));
    g.add(bx(eyeM, 0.28, 0.28, 0.06,  0.22, 1.04, 0.38));
    return g;
  }

  function buildDeathKnight() {
    const g = new THREE.Group();
    const arm = m(0x20243a), armLt = m(0x282c40), armDk = m(0x141828);
    const visorM = em(0x22ee66), swordC = m(0x4a5060), swordB = m(0x383c50);
    g.add(bx(arm,   0.52, 1.1,  0.52, -0.32, -1.15, 0));
    g.add(bx(arm,   0.52, 1.1,  0.52,  0.32, -1.15, 0));
    g.add(bx(armLt, 1.45, 1.55, 0.85, 0, 0.1, 0));
    g.add(bx(armDk, 0.6,  0.42, 0.72, -0.95, 0.65, 0));
    g.add(bx(armDk, 0.6,  0.42, 0.72,  0.95, 0.65, 0));
    g.add(bx(arm,   0.42, 1.2,  0.42, -0.95, -0.05, 0));
    g.add(bx(arm,   0.42, 1.2,  0.42,  0.95, -0.05, 0));
    g.add(bx(armLt, 1.1,  1.1,  1.0,  0, 1.25, 0));
    g.add(bx(visorM, 0.9, 0.22, 0.1,  0, 1.25, 0.51));
    // Sword
    g.add(bx(swordC, 0.12, 2.2, 0.08, 1.52, 0.2, 0.3));
    g.add(bx(swordB, 0.55, 0.12, 0.12, 1.52, -0.55, 0.3));
    g.add(cn(swordC, 0.07, 0.28, 7, 1.52, 1.35, 0.3));
    return g;
  }

  function buildGolem() {
    const g = new THREE.Group();
    const st = m(0x363040), stLt = m(0x3c3644), stDk = m(0x26222e), eyeM = em(0xff8800);
    g.add(bx(stDk, 0.75, 1.0, 0.75, -0.55, -1.4, 0));
    g.add(bx(stDk, 0.75, 1.0, 0.75,  0.55, -1.4, 0));
    g.add(bx(st,   1.85, 1.8, 1.1));
    g.add(bx(stDk, 0.72, 1.5, 0.72, -1.45, -0.05, 0));
    g.add(bx(stDk, 0.72, 1.5, 0.72,  1.45, -0.05, 0));
    g.add(bx(st,   0.82, 0.82, 0.82, -1.45, -1.1, 0.1));
    g.add(bx(st,   0.82, 0.82, 0.82,  1.45, -1.1, 0.1));
    g.add(bx(stLt, 1.35, 1.3, 1.15, 0, 1.45, 0));
    g.add(bx(eyeM, 0.32, 0.32, 0.08, -0.28, 1.52, 0.58));
    g.add(bx(eyeM, 0.32, 0.32, 0.08,  0.28, 1.52, 0.58));
    g.add(bx(m(0x0c0a10), 0.06, 0.85, 0.1, -0.3, 0.1, 0.56));
    g.add(bx(m(0x0c0a10), 0.06, 0.6,  0.1,  0.4, 0.35, 0.56));
    g.scale.setScalar(0.72);
    return g;
  }

  function buildHarpy() {
    const g = humanoid({
      bodyC: 0x2a2430, legsC: 0x241c28, headC: 0x2a2430, eyeC: 0xddaa00,
      scl: 0.95, lh: 0.8, lw: 0.35
    });
    g.add(cn(m(0x1c1418), 0.06, 0.2, 6, -0.25, -1.82, 0.15, Math.PI * 0.5));
    g.add(cn(m(0x1c1418), 0.06, 0.2, 6,  0.25, -1.82, 0.15, Math.PI * 0.5));
    // Wings replace arms
    const wM = m(0x241e18), wDk = m(0x1a1610);
    const wL = new THREE.Group();
    wL.add(bx(wM,  1.55, 0.08, 1.2, -0.75, 0, 0));
    wL.add(bx(wDk, 0.9,  0.07, 0.9, -0.4, 0.1, -0.15));
    wL.rotation.z = 0.3; wL.position.set(-0.72, 0.3, 0); g.add(wL);
    const wR = new THREE.Group();
    wR.add(bx(wM,  1.55, 0.08, 1.2, 0.75, 0, 0));
    wR.add(bx(wDk, 0.9,  0.07, 0.9, 0.4, 0.1, -0.15));
    wR.rotation.z = -0.3; wR.position.set(0.72, 0.3, 0); g.add(wR);
    g.add(cn(m(0xaa8800), 0.1, 0.32, 7, 0, 1.12, 0.55, Math.PI * 0.5));
    return g;
  }

  function buildWitch() {
    const g = new THREE.Group();
    const robe = m(0x1c1038), robeDk = m(0x160c2c), skin = m(0xc0a888);
    const eyeM = em(0x00cc44), hatC = m(0x0e0a1e), staffC = m(0x2a1840);
    g.add(bx(robe,   1.45, 2.1, 0.78, 0, -0.5, 0));
    g.add(bx(robeDk, 1.7,  0.5, 0.88, 0, -1.48, 0));
    g.add(bx(robeDk, 0.42, 1.2, 0.42, -1.1, 0, 0));
    g.add(bx(robeDk, 0.42, 1.2, 0.42,  1.1, 0, 0));
    g.add(bx(skin, 1.0, 1.0, 0.9, 0, 1.1, 0));
    // Witch hat (brim + cone)
    g.add(bx(hatC, 1.6, 0.12, 1.4, 0, 1.72, 0));
    g.add(cn(hatC, 0.5, 1.4, 9, 0, 2.48, 0));
    g.add(bx(eyeM, 0.2, 0.2, 0.07, -0.22, 1.1, 0.46));
    g.add(bx(eyeM, 0.2, 0.2, 0.07,  0.22, 1.1, 0.46));
    g.add(cy(staffC, 0.055, 0.055, 2.8, 9, -1.5, -0.15, 0.32));
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12),
      new THREE.MeshLambertMaterial({ color: 0x3300aa, emissive: 0x6622ff, flatShading: true }));
    orb.position.set(-1.5, 1.28, 0.32);
    g.add(orb);
    return g;
  }

  function buildFrostGiant() {
    const g = humanoid({
      bodyC: 0x1a2e48, legsC: 0x162436, headC: 0x1c3252, eyeC: 0x44aaff,
      scl: 1.25, tw: 1.85, th: 1.7, td: 1.0,
      lw: 0.68, lh: 1.3, aw: 0.62, ah: 1.4, hw: 1.45, hh: 1.3, hd: 1.1
    });
    const iceM = m(0x2a4868);
    g.add(bx(m(0x162c44), 0.75, 0.38, 0.9, -1.1, 0.88, 0));
    g.add(bx(m(0x162c44), 0.75, 0.38, 0.9,  1.1, 0.88, 0));
    g.add(cn(iceM, 0.1, 0.45, 7, -1.1, 1.15, 0));
    g.add(cn(iceM, 0.1, 0.45, 7,  0.0, 1.15, 0));
    g.add(cn(iceM, 0.1, 0.45, 7,  1.1, 1.15, 0));
    return g;
  }

  function buildNightmare() {
    const g = new THREE.Group();
    const bd = m(0x14102a), bdDk = m(0x0c0820), maneC = m(0x200e3a);
    const eyeM = em(0xcc1000);
    // Horse body (4-legged)
    g.add(bx(bd, 1.8, 1.1, 3.0));
    g.add(bx(bdDk, 0.4, 1.3, 0.4, -0.55, -1.2,  0.8));
    g.add(bx(bdDk, 0.4, 1.3, 0.4,  0.55, -1.2,  0.8));
    g.add(bx(bdDk, 0.4, 1.3, 0.4, -0.55, -1.2, -0.8));
    g.add(bx(bdDk, 0.4, 1.3, 0.4,  0.55, -1.2, -0.8));
    // Neck + head
    g.add(bx(bd,   0.85, 1.3,  0.85, 0,  0.9, 1.15));
    g.add(bx(bdDk, 0.85, 0.75, 1.3,  0,  1.5, 1.55));
    g.add(bx(bd,   0.65, 0.5,  0.6,  0,  1.22, 2.15));
    g.add(bx(eyeM, 0.22, 0.22, 0.07, -0.32, 1.55, 1.95));
    g.add(bx(eyeM, 0.22, 0.22, 0.07,  0.32, 1.55, 1.95));
    for (let i = 0; i < 4; i++) g.add(bx(maneC, 0.18, 0.55 - i * 0.05, 0.18, 0, 1.3 + i * 0.05, 0.9 - i * 0.1));
    g.add(cn(m(0x18142a), 0.08, 0.5, 7, 0, 1.95, 1.7, -0.3));
    g.scale.setScalar(0.62);
    return g;
  }

  function buildChaosLord() {
    const g = humanoid({
      bodyC: 0x2a0c1c, legsC: 0x200610, headC: 0x300e22, eyeC: 0xff2200,
      scl: 1.12, tw: 1.6, th: 1.5, hw: 1.2, hh: 1.1, hd: 1.0
    });
    const hornM = m(0x180408);
    g.add(cn(hornM, 0.12, 0.65, 7, -0.42, 2.12, 0, 0, -0.4));
    g.add(cn(hornM, 0.12, 0.65, 7,  0.42, 2.12, 0, 0,  0.4));
    g.add(cn(hornM, 0.09, 0.4,  7,  0.0,  2.18, 0, 0,  0.0));
    g.add(cn(hornM, 0.09, 0.45, 7, -0.72, 1.95, 0, 0, -0.6));
    g.add(cn(hornM, 0.09, 0.45, 7,  0.72, 1.95, 0, 0,  0.6));
    // Extra chaos eye (forehead)
    g.add(bx(em(0xff4400), 0.2, 0.2, 0.07, 0, 2.02, 0.52));
    // Wings
    const wM = m(0x200810);
    const wL = bx(wM, 2.0, 0.07, 1.5, -1.5, 0.2, -0.35);
    wL.rotation.z = 0.25; g.add(wL);
    const wR = bx(wM, 2.0, 0.07, 1.5,  1.5, 0.2, -0.35);
    wR.rotation.z = -0.25; g.add(wR);
    return g;
  }

  function buildDefault() {
    return humanoid({ bodyC: 0x1a1824, legsC: 0x14101c, headC: 0x201c28, eyeC: 0xcc0000 });
  }

  // ─── Builder map ───────────────────────────────────────────────────────────

  const BUILDERS = {
    goblin:       buildGoblin,
    skeleton:     buildSkeleton,
    zombie:       buildZombie,
    dark_mage:    buildDarkMage,
    troll:        buildTroll,
    vampire:      buildVampire,
    lich:         buildLich,
    demon:        buildDemon,
    dragon_boss:  buildDragonBoss,
    spider_queen: buildSpiderQueen,
    rat_swarm:    buildRatSwarm,
    cave_bat:     buildCaveBat,
    kobold:       buildKobold,
    werewolf:     buildWerewolf,
    giant_spider: buildGiantSpider,
    shadow:       buildShadow,
    death_knight: buildDeathKnight,
    golem:        buildGolem,
    harpy:        buildHarpy,
    witch:        buildWitch,
    frost_giant:  buildFrostGiant,
    nightmare:    buildNightmare,
    chaos_lord:   buildChaosLord
  };

  // ─── Three.js init ─────────────────────────────────────────────────────────

  function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, 180 / 200, 0.1, 100);
    camera.position.set(0, 0.3, 6.2);
    camera.lookAt(0, 0, 0);

    // Dungeon torch ambiance
    scene.add(new THREE.AmbientLight(0x14101a, 3.5));

    const torchL = new THREE.PointLight(0xff6a0a, 4.5, 18);
    torchL.position.set(-3.5, 2.5, 5);
    scene.add(torchL);

    const torchR = new THREE.PointLight(0xff4a06, 3.0, 18);
    torchR.position.set(3.5, 1.5, 4);
    scene.add(torchR);

    const rimLight = new THREE.DirectionalLight(0x060412, 1.0);
    rimLight.position.set(0, -2, -3);
    scene.add(rimLight);

    // Hit flash light (off by default)
    hitLight = new THREE.PointLight(0xff4422, 0, 8);
    hitLight.position.set(0, 0.5, 4.5);
    scene.add(hitLight);

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1); // PS1 pixelated aesthetic
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(180, 200);
    try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) { /* r149 compat */ }
  }

  // ─── Group disposal ────────────────────────────────────────────────────────

  function disposeGroup(g) {
    g.traverse(c => {
      if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); }
    });
  }

  // ─── Mount ─────────────────────────────────────────────────────────────────

  function mount(typeId, containerEl, boss) {
    if (typeof THREE === 'undefined') return;
    if (!renderer) init();

    if (animId) { cancelAnimationFrame(animId); animId = null; }

    // Remove existing canvas / SVG from container
    const oldCvs = containerEl.querySelector('canvas.e3d');
    if (oldCvs) oldCvs.remove();
    const oldSvg = containerEl.querySelector('svg');
    if (oldSvg) oldSvg.remove();

    // Replace active group
    if (activeGroup) { scene.remove(activeGroup); disposeGroup(activeGroup); activeGroup = null; }

    activeGroup = (BUILDERS[typeId] || buildDefault)();
    scene.add(activeGroup);

    // Resize for boss vs normal
    const w = boss ? 210 : 180;
    const h = boss ? 235 : 200;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    const cvs = renderer.domElement;
    cvs.className = 'e3d';
    containerEl.appendChild(cvs);

    hitTimer = -1;
    deathTimer = -1;
    attackTimer = -1;
    currentTypeId = typeId;
    hitLight.intensity = 0;

    startLoop();
  }

  // ─── Animation loop ────────────────────────────────────────────────────────

  function startLoop() {
    const t0 = performance.now();

    function loop(now) {
      animId = requestAnimationFrame(loop);
      if (!activeGroup) return;

      const t = (now - t0) / 1000;

      // Idle: gentle bob + slow sway
      if (deathTimer < 0) {
        activeGroup.position.y = Math.sin(t * 1.5) * 0.07;
        activeGroup.rotation.y = Math.sin(t * 0.85) * 0.2;
      }

      // Hit flash
      if (hitTimer >= 0) {
        hitTimer += 0.065;
        hitLight.intensity = Math.max(0, 1 - hitTimer * 2.2) * 12;
        const scl = hitTimer < 0.5 ? 1 + Math.sin(hitTimer * Math.PI * 2) * 0.07 : 1;
        activeGroup.scale.setScalar(scl);
        if (hitTimer >= 1) { hitTimer = -1; hitLight.intensity = 0; activeGroup.scale.setScalar(1); }
      }

      // Attack lunge
      if (attackTimer >= 0 && deathTimer < 0) {
        attackTimer += 0.055;
        const p = Math.min(attackTimer, 1);
        const curve = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        if (MAGIC_TYPES.has(currentTypeId)) {
          activeGroup.position.z = curve * 0.7;
          activeGroup.rotation.x = curve * 0.18;
        } else {
          activeGroup.position.z = curve * 1.5;
        }
        if (hitTimer < 0) activeGroup.scale.setScalar(1 + curve * 0.06);
        if (attackTimer >= 1) {
          attackTimer = -1;
          activeGroup.position.z = 0;
          activeGroup.rotation.x = 0;
          if (hitTimer < 0) activeGroup.scale.setScalar(1);
        }
      }

      // Death fall
      if (deathTimer >= 0) {
        deathTimer += 0.011;
        const p = Math.min(deathTimer, 1);
        activeGroup.rotation.z = -p * 0.85;
        activeGroup.position.y = -p * 2.8 + Math.sin(t * 1.5) * 0.07 * (1 - p);
        activeGroup.scale.setScalar(1 - p * 0.55);
        if (p >= 1) { cancelAnimationFrame(animId); animId = null; return; }
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(loop);
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  function triggerHit()    { if (hitTimer    < 0) hitTimer    = 0; }
  function triggerDeath()  { if (deathTimer  < 0) deathTimer  = 0; }
  function triggerAttack() { if (attackTimer < 0) attackTimer = 0; }

  return { mount, triggerHit, triggerDeath, triggerAttack };

})();
