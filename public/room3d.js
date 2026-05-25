window.Room3D = (() => {
  'use strict';
  let _ren = null, _scene = null, _cam = null, _animId = null;
  let _container = null, _roomGroup = null, _currentType = null;
  let _flames = [], _lights = [], _t = 0;

  // ── Geometry helpers ────────────────────────────────────────────────────────
  function mk(geo, hex, opts) {
    return new THREE.Mesh(geo, new THREE.MeshLambertMaterial(
      Object.assign({ color: hex, flatShading: true }, opts || {})));
  }
  const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const cy = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 6);
  const cn = (r, h, s) => new THREE.ConeGeometry(r, h, s || 6);

  // ── Shared corridor shell ───────────────────────────────────────────────────
  function mkCorridor() {
    const g = new THREE.Group();

    // Floor
    const floor = mk(bx(7.2, 0.3, 26), 0x100d0b);
    floor.position.set(0, -1.72, -9); g.add(floor);
    // Floor seam strips
    for (let z = -1; z >= -17; z -= 3.8) {
      const s = mk(bx(7.2, 0.025, 0.1), 0x1c1714);
      s.position.set(0, -1.57, z); g.add(s);
    }

    // Ceiling
    const ceil = mk(bx(7.2, 0.3, 26), 0x08060c);
    ceil.position.set(0, 2.22, -9); g.add(ceil);

    // Left wall
    const wL = mk(bx(0.28, 4.2, 26), 0x13101a);
    wL.position.set(-3.42, 0.2, -9); g.add(wL);
    // Right wall
    const wR = mk(bx(0.28, 4.2, 26), 0x13101a);
    wR.position.set(3.42, 0.2, -9); g.add(wR);

    // Stone block outlines on walls
    for (let z = -0.5; z >= -16; z -= 3.6) {
      for (const x of [-3.3, 3.3]) {
        const blk = mk(bx(0.06, 1.5, 3.4), 0x1c1828);
        blk.position.set(x, 0.2, z); g.add(blk);
        const blk2 = mk(bx(0.06, 1.1, 3.4), 0x1c1828);
        blk2.position.set(x, -1.05, z); g.add(blk2);
      }
    }

    return g;
  }

  // ── Wall torch (one side) ───────────────────────────────────────────────────
  function mkTorch(x, z) {
    const g = new THREE.Group();
    const br = mk(bx(0.18, 0.1, 0.38), 0x3a2808);
    br.position.set(x, 0.88, z); g.add(br);
    const hnd = mk(cy(0.05, 0.06, 0.4, 5), 0x2c1a06);
    hnd.position.set(x, 0.65, z); g.add(hnd);

    const fl1 = mk(cn(0.14, 0.38, 5), 0xff8010);
    fl1.position.set(x, 1.06, z); _flames.push(fl1); g.add(fl1);
    const fl2 = mk(cn(0.07, 0.25, 5), 0xffcc40);
    fl2.position.set(x, 1.1, z); _flames.push(fl2); g.add(fl2);

    const lgt = new THREE.PointLight(0xff6600, 2.63, 8.5);
    lgt.userData.base = 2.63;
    lgt.position.set(x, 1.1, z); _lights.push(lgt); g.add(lgt);
    return g;
  }

  // ── Back wall (solid or with arch opening) ──────────────────────────────────
  function mkBackWall(z, arch) {
    const g = new THREE.Group();
    if (arch) {
      const pL = mk(bx(2.1, 4.2, 0.32), 0x13101a);
      pL.position.set(-2.55, 0.2, z); g.add(pL);
      const pR = mk(bx(2.1, 4.2, 0.32), 0x13101a);
      pR.position.set(2.55, 0.2, z); g.add(pR);
      const top = mk(bx(7.2, 0.9, 0.32), 0x13101a);
      top.position.set(0, 1.9, z); g.add(top);
      // Arch keystone frame
      const aL = mk(bx(0.24, 3.2, 0.38), 0x1e1a2c);
      aL.position.set(-1.28, 0.12, z); g.add(aL);
      const aR = mk(bx(0.24, 3.2, 0.38), 0x1e1a2c);
      aR.position.set(1.28, 0.12, z); g.add(aR);
      const aTop = mk(bx(2.8, 0.22, 0.38), 0x1e1a2c);
      aTop.position.set(0, 1.68, z); g.add(aTop);
    } else {
      const w = mk(bx(7.2, 4.2, 0.32), 0x13101a);
      w.position.set(0, 0.2, z); g.add(w);
    }
    return g;
  }

  // ── Room builders ───────────────────────────────────────────────────────────

  function buildCombat() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkTorch(-3.05, -0.7)); g.add(mkTorch(3.05, -0.7));
    g.add(mkTorch(-3.05, -7.8)); g.add(mkTorch(3.05, -7.8));
    g.add(mkBackWall(-12, true));

    // Dried blood smear on left wall
    const smear = mk(bx(0.04, 0.75, 1.7), 0x3d0606);
    smear.position.set(-3.3, -0.4, -4.8); g.add(smear);
    const smear2 = mk(bx(0.04, 0.4, 0.8), 0x2e0404);
    smear2.position.set(-3.3, -0.9, -3.9); g.add(smear2);

    // Bones in corner
    const b1 = mk(cy(0.04, 0.07, 0.75, 4), 0x686050);
    b1.rotation.z = 0.7; b1.position.set(-2.6, -1.58, -5.2); g.add(b1);
    const b2 = mk(cy(0.04, 0.04, 0.55, 4), 0x686050);
    b2.rotation.z = -1.1; b2.position.set(-2.35, -1.58, -5.6); g.add(b2);
    const skull = mk(bx(0.18, 0.16, 0.2), 0x706858);
    skull.position.set(-2.55, -1.55, -5.9); g.add(skull);

    return g;
  }

  function buildBoss() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkTorch(-3.05, -0.6)); g.add(mkTorch(3.05, -0.6));
    g.add(mkTorch(-3.05, -5.8)); g.add(mkTorch(3.05, -5.8));
    g.add(mkTorch(-3.05, -10.5)); g.add(mkTorch(3.05, -10.5));
    g.add(mkBackWall(-14, false));

    // Boss altar / pedestal
    const base = mk(bx(1.9, 0.2, 1.9), 0x1c182a);
    base.position.set(0, -1.63, -9.5); g.add(base);
    const pillar = mk(bx(0.95, 0.9, 0.95), 0x201c30);
    pillar.position.set(0, -1.18, -9.5); g.add(pillar);
    const cap2 = mk(bx(1.15, 0.12, 1.15), 0x2a1e3a);
    cap2.position.set(0, -0.78, -9.5); g.add(cap2);
    // Sacrificial gem
    const gem = mk(bx(0.15, 0.15, 0.15), 0xcc0020);
    gem.rotation.y = 0.8; gem.position.set(0, -0.68, -9.5); g.add(gem);

    // Boss purple light
    const bL = new THREE.PointLight(0xaa00cc, 3.38, 16);
    bL.userData.base = 3.38;
    bL.position.set(0, 1.5, -9.5); _lights.push(bL); g.add(bL);

    // Hanging chains
    for (let i = 0; i < 3; i++) {
      const ch = mk(cy(0.025, 0.025, 2.8, 4), 0x2c2c2c);
      ch.position.set(-2.1 + i * 2.1, 0.4, -7); ch.rotation.x = 0.22; g.add(ch);
    }

    return g;
  }

  function buildRest() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -2.2)); g.add(mkTorch(3.05, -2.2));

    // Campfire logs
    const log1 = mk(cy(0.12, 0.15, 1.3, 6), 0x3a1e08);
    log1.rotation.z = Math.PI / 2; log1.position.set(0.3, -1.54, -4.8); g.add(log1);
    const log2 = mk(cy(0.12, 0.15, 1.3, 6), 0x2e1808);
    log2.rotation.set(0.35, 0.9, Math.PI / 2); log2.position.set(-0.35, -1.54, -5.1); g.add(log2);
    const log3 = mk(cy(0.1, 0.12, 1.0, 5), 0x3c2008);
    log3.rotation.set(0.1, 0.5, 1.4); log3.position.set(0, -1.54, -5.3); g.add(log3);
    const ember = mk(bx(0.58, 0.04, 0.58), 0xcc3800);
    ember.position.set(0, -1.58, -4.95); g.add(ember);

    // Campfire flames
    const f1 = mk(cn(0.23, 0.62, 5), 0xff7010);
    f1.position.set(0, -1.21, -4.95); _flames.push(f1); g.add(f1);
    const f2 = mk(cn(0.14, 0.44, 5), 0xffcc30);
    f2.position.set(0.05, -1.06, -4.95); _flames.push(f2); g.add(f2);
    const f3 = mk(cn(0.07, 0.26, 4), 0xfff0a0);
    f3.position.set(0, -0.97, -4.95); _flames.push(f3); g.add(f3);

    // Warm fire light
    const fl = new THREE.PointLight(0xff7020, 4.32, 12);
    fl.userData.base = 4.32;
    fl.position.set(0, -0.9, -4.95); _lights.push(fl); g.add(fl);

    // Bedroll
    const bed = mk(bx(1.0, 0.1, 2.1), 0x483020);
    bed.position.set(-2.05, -1.64, -5.8); g.add(bed);
    const roll = mk(cy(0.22, 0.22, 1.0, 6), 0x5a3c28);
    roll.rotation.z = Math.PI / 2; roll.position.set(-2.05, -1.51, -4.75); g.add(roll);
    // Satchel near bedroll
    const satch = mk(bx(0.35, 0.28, 0.28), 0x5a3c18);
    satch.position.set(-2.4, -1.54, -6.5); g.add(satch);

    return g;
  }

  function buildTreasure() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -1.0)); g.add(mkTorch(3.05, -1.0));
    g.add(mkTorch(-3.05, -8.8)); g.add(mkTorch(3.05, -8.8));

    // Main chest
    const body = mk(bx(1.55, 1.05, 1.05), 0x6a3e10);
    body.position.set(0, -1.2, -6.8); g.add(body);
    const band1 = mk(bx(1.57, 0.13, 1.07), 0x8a5818);
    band1.position.set(0, -0.9, -6.8); g.add(band1);
    const band2 = mk(bx(1.57, 0.13, 1.07), 0x8a5818);
    band2.position.set(0, -1.44, -6.8); g.add(band2);
    // Lid cracked open
    const lid = mk(bx(1.55, 0.18, 1.05), 0x7a4812);
    lid.position.set(0, -0.73, -6.86); lid.rotation.x = -0.38; g.add(lid);
    const lk = mk(bx(0.22, 0.26, 0.09), 0xc09010);
    lk.position.set(0, -1.15, -6.28); g.add(lk);

    // Glow from inside chest
    const gL = new THREE.PointLight(0xffd020, 3.95, 7.5);
    gL.userData.base = 3.95;
    gL.position.set(0, -0.5, -6.8); _lights.push(gL); g.add(gL);

    // Scattered coins
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const coin = mk(cy(0.09, 0.09, 0.025, 6), 0xd4a810);
      coin.position.set(Math.cos(a) * 0.65, -1.63, -6.8 + Math.sin(a) * 0.38); g.add(coin);
    }
    // Small side chest
    const sc = mk(bx(0.7, 0.55, 0.55), 0x5a340e);
    sc.position.set(1.8, -1.42, -5.8); g.add(sc);
    const scl = mk(bx(0.72, 0.1, 0.57), 0x6a3c10);
    scl.position.set(1.8, -1.16, -5.8); scl.rotation.x = -0.15; g.add(scl);

    return g;
  }

  function buildMerchant() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -0.8)); g.add(mkTorch(3.05, -0.8));
    g.add(mkTorch(-3.05, -8.5)); g.add(mkTorch(3.05, -8.5));

    // Counter top
    const ctr = mk(bx(3.4, 0.14, 0.95), 0x5c3c0e);
    ctr.position.set(0, -0.83, -6.0); g.add(ctr);
    const front = mk(bx(3.4, 1.1, 0.16), 0x4a3008);
    front.position.set(0, -1.37, -5.52); g.add(front);
    for (const x of [-1.5, 1.5]) {
      const leg = mk(bx(0.16, 0.94, 0.82), 0x3c2606);
      leg.position.set(x, -1.28, -6.0); g.add(leg);
    }

    // Potion bottle
    const pb = mk(cy(0.11, 0.13, 0.35, 6), 0x2a1060);
    pb.position.set(-0.9, -0.64, -6.0); g.add(pb);
    const pn = mk(cy(0.05, 0.1, 0.16, 5), 0x2a1060);
    pn.position.set(-0.9, -0.45, -6.0); g.add(pn);
    // Scroll
    const scr = mk(cy(0.09, 0.09, 0.3, 8), 0xd4b870);
    scr.rotation.z = Math.PI / 2; scr.position.set(0.4, -0.73, -6.0); g.add(scr);
    // Sword
    const hilt = mk(bx(0.08, 0.42, 0.08), 0x4a4c50);
    hilt.position.set(1.0, -0.62, -6.0); g.add(hilt);
    const guard = mk(bx(0.3, 0.08, 0.1), 0x6a6c70);
    guard.position.set(1.0, -0.54, -6.0); g.add(guard);
    // Shield leaning against counter
    const shld = mk(bx(0.55, 0.75, 0.06), 0x2a1830);
    shld.position.set(-1.8, -1.08, -5.57); shld.rotation.x = 0.15; g.add(shld);
    const shldB = mk(bx(0.4, 0.1, 0.08), 0xb08010);
    shldB.position.set(-1.8, -0.88, -5.56); g.add(shldB);

    // Warm shop light
    const sL = new THREE.PointLight(0xffaa40, 3.20, 10);
    sL.userData.base = 3.20;
    sL.position.set(0, 0.5, -6.0); _lights.push(sL); g.add(sL);

    return g;
  }

  function buildRiddle() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -2.2)); g.add(mkTorch(3.05, -2.2));

    // Stone tablets on back wall
    for (let i = -1; i <= 1; i++) {
      const frame = mk(bx(1.12, 0.08, 1.72), 0x1e1a2c);
      frame.rotation.x = Math.PI / 2; frame.position.set(i * 1.55, 0.35, -9.84); g.add(frame);
      const slab = mk(bx(1.0, 0.06, 1.6), 0x26203a);
      slab.rotation.x = Math.PI / 2; slab.position.set(i * 1.55, 0.35, -9.78); g.add(slab);
      // Rune rows
      for (let r = 0; r < 3; r++) {
        for (let c = -1; c <= 1; c++) {
          const rn = mk(bx(0.12, 0.02, 0.04), r === 0 ? 0x7050e0 : 0x5040b0);
          rn.rotation.x = Math.PI / 2;
          rn.position.set(i * 1.55 + c * 0.22, 0.56 - r * 0.28, -9.72); g.add(rn);
        }
      }
    }

    // Arcane blue-purple glow
    const rl = new THREE.PointLight(0x4028cc, 3.20, 13);
    rl.userData.base = 3.20;
    rl.position.set(0, 1.0, -9); _lights.push(rl); g.add(rl);

    return g;
  }

  function buildSecret() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -2.2)); g.add(mkTorch(3.05, -2.2));

    // Concentric rune circles on back wall (segments)
    for (let ring = 0; ring < 3; ring++) {
      const r = 0.46 + ring * 0.4;
      const segs = 10 + ring * 4;
      for (let s = 0; s < segs; s++) {
        const a = (s / segs) * Math.PI * 2;
        const seg = mk(bx(0.16, 0.05, 0.05), ring === 0 ? 0x9060ff : 0x7050dd);
        seg.position.set(Math.cos(a) * r, Math.sin(a) * r + 0.18, -9.82);
        seg.rotation.z = a; g.add(seg);
      }
    }
    // Center cross glyph
    const cv = mk(bx(0.08, 0.36, 0.05), 0xa070ff);
    cv.position.set(0, 0.18, -9.8); g.add(cv);
    const ch = mk(bx(0.3, 0.08, 0.05), 0xa070ff);
    ch.position.set(0, 0.24, -9.8); g.add(ch);

    // Purple arcane glow
    const sl = new THREE.PointLight(0x8840ff, 4.5, 13);
    sl.userData.base = 4.5;
    sl.position.set(0, 0.18, -9.2); _lights.push(sl); g.add(sl);

    return g;
  }

  function buildStart() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-14, true));
    g.add(mkTorch(-3.05, -0.8)); g.add(mkTorch(3.05, -0.8));
    g.add(mkTorch(-3.05, -10.5)); g.add(mkTorch(3.05, -10.5));

    // Columns flanking entrance
    for (const x of [-2.82, 2.82]) {
      const col = mk(cy(0.21, 0.27, 3.9, 6), 0x1e1828);
      col.position.set(x, 0.18, -2.2); g.add(col);
      const cap = mk(bx(0.62, 0.22, 0.62), 0x2a2238);
      cap.position.set(x, 2.09, -2.2); g.add(cap);
      const colBase = mk(bx(0.6, 0.14, 0.6), 0x2a2238);
      colBase.position.set(x, -1.58, -2.2); g.add(colBase);
    }
    // Wide welcome rug
    const rug = mk(bx(3.0, 0.025, 5.0), 0x380c0c);
    rug.position.set(0, -1.57, -3); g.add(rug);
    const rugBorder = mk(bx(3.3, 0.02, 5.3), 0x6a3010);
    rugBorder.position.set(0, -1.58, -3); g.add(rugBorder);

    // Grand golden glow
    const eL = new THREE.PointLight(0xd0a030, 1.875, 20);
    eL.userData.base = 1.875;
    eL.position.set(0, 1.2, -12); _lights.push(eL); g.add(eL);

    return g;
  }

  const BUILDERS = {
    combat: buildCombat, boss: buildBoss,
    rest: buildRest, treasure: buildTreasure,
    merchant: buildMerchant, riddle: buildRiddle,
    secret: buildSecret, start: buildStart,
  };

  // ── Renderer lifecycle ──────────────────────────────────────────────────────

  function mount(type, containerEl) {
    if (!containerEl) return;
    const w = containerEl.offsetWidth || 500;
    const h = containerEl.offsetHeight || 220;
    if (w === 0) { requestAnimationFrame(() => mount(type, containerEl)); return; }
    if (_container === containerEl && _currentType === type) return;

    unmount();
    _container = containerEl;
    _currentType = type;
    _flames = []; _lights = [];

    _scene = new THREE.Scene();
    _scene.background = new THREE.Color(0x050308);
    _scene.fog = new THREE.Fog(0x050308, 14, 26);
    _scene.add(new THREE.AmbientLight(0x09080e, 1.875));

    _cam = new THREE.PerspectiveCamera(70, w / h, 0.06, 32);
    _cam.position.set(0, 0.28, 4.1);
    _cam.lookAt(0, 0.1, -10);

    _roomGroup = (BUILDERS[type] || buildCombat)();
    _scene.add(_roomGroup);

    _ren = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    _ren.setSize(w, h);
    _ren.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    const cvs = _ren.domElement;
    cvs.id = 'room3d-canvas';
    cvs.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;z-index:0;';
    // Insert as first child so it renders behind enemy zone, hands, and hit-flash
    containerEl.insertBefore(cvs, containerEl.firstChild);

    _t = 0;
    _loop();
  }

  function _loop() {
    _animId = requestAnimationFrame(_loop);
    _t += 0.016;

    _flames.forEach((f, i) => {
      const fl = Math.sin(_t * 8.3 + i * 1.4) * 0.09 + Math.sin(_t * 14.7 + i * 2.8) * 0.04;
      f.scale.set(1 + fl, 1 + fl * 1.6, 1 + fl);
    });
    _lights.forEach((l, i) => {
      l.intensity = l.userData.base + Math.sin(_t * 9.1 + i * 1.9) * 0.26;
    });

    // Gentle camera sway
    _cam.position.y = 0.28 + Math.sin(_t * 0.72) * 0.014;
    _cam.position.x = Math.sin(_t * 0.44) * 0.009;

    _ren.render(_scene, _cam);
  }

  function update(type) {
    if (!_scene) return;
    if (_currentType === type) return;
    _currentType = type;
    if (_roomGroup) _scene.remove(_roomGroup);
    _flames = []; _lights = [];
    _roomGroup = (BUILDERS[type] || buildCombat)();
    _scene.add(_roomGroup);
  }

  function unmount() {
    if (_animId) { cancelAnimationFrame(_animId); _animId = null; }
    if (_ren) { _ren.domElement.remove(); _ren.dispose(); _ren = null; }
    _scene = null; _cam = null; _roomGroup = null;
    _flames = []; _lights = [];
    _container = null; _currentType = null;
  }

  return { mount, update, unmount };
})();
