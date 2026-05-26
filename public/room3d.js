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
  const cy = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 10);
  const cn = (r, h, s) => new THREE.ConeGeometry(r, h, s || 8);

  // ── Shared corridor shell ───────────────────────────────────────────────────
  function mkCorridor() {
    const g = new THREE.Group();

    // Floor — stone tile base
    const floor = mk(bx(7.2, 0.3, 26), 0x0e0b09);
    floor.position.set(0, -1.72, -9); g.add(floor);
    // Floor tile transverse joints (every ~2 units along z)
    for (let z = -0.6; z >= -17; z -= 2.1) {
      const s = mk(bx(7.2, 0.025, 0.07), 0x09080a);
      s.position.set(0, -1.565, z); g.add(s);
    }
    // Floor tile longitudinal joints
    for (const x of [-2.4, 0, 2.4]) {
      const s = mk(bx(0.07, 0.025, 26), 0x09080a);
      s.position.set(x, -1.565, -9); g.add(s);
    }
    // Floor edge trim
    for (const x of [-3.28, 3.28]) {
      const t = mk(bx(0.16, 0.1, 26), 0x18141c);
      t.position.set(x, -1.575, -9); g.add(t);
    }

    // Ceiling
    const ceil = mk(bx(7.2, 0.3, 26), 0x060408);
    ceil.position.set(0, 2.22, -9); g.add(ceil);
    // Ceiling transverse ribs with corbel caps
    for (let z = -0.4; z >= -17; z -= 3.6) {
      const rib = mk(bx(7.4, 0.28, 0.2), 0x0d0a12);
      rib.position.set(0, 2.08, z); g.add(rib);
      for (const x of [-3.35, 3.35]) {
        const corbel = mk(bx(0.22, 0.36, 0.24), 0x100c18);
        corbel.position.set(x, 1.96, z); g.add(corbel);
      }
    }

    // Left wall
    const wL = mk(bx(0.28, 4.2, 26), 0x13101a);
    wL.position.set(-3.42, 0.2, -9); g.add(wL);
    // Right wall
    const wR = mk(bx(0.28, 4.2, 26), 0x13101a);
    wR.position.set(3.42, 0.2, -9); g.add(wR);

    // Stone block HORIZONTAL COURSES on walls
    const stoneSeamY = [-1.38, -0.48, 0.48, 1.38, 2.06];
    for (const sy of stoneSeamY) {
      for (const sx of [-3.285, 3.285]) {
        const seam = mk(bx(0.06, 0.055, 26), 0x0a0810);
        seam.position.set(sx, sy, -9); g.add(seam);
      }
    }

    // Stone block VERTICAL DIVIDERS (staggered masonry pattern)
    for (let zi = 0; zi < 10; zi++) {
      const z = -0.3 - zi * 1.72;
      const evenRow = zi % 2 === 0;
      for (const sx of [-3.285, 3.285]) {
        const offA = evenRow ? 0 : 0.86;
        const divA = mk(bx(0.055, 0.88, 0.055), 0x0a0810);
        divA.position.set(sx, -0.93, z - offA); g.add(divA);
        const divB = mk(bx(0.055, 0.88, 0.055), 0x0a0810);
        divB.position.set(sx, 0.0, z); g.add(divB);
        const divC = mk(bx(0.055, 0.88, 0.055), 0x0a0810);
        divC.position.set(sx, 0.93, z - offA); g.add(divC);
      }
    }

    // Wall base molding
    for (const sx of [-3.42, 3.42]) {
      const base = mk(bx(0.24, 0.2, 26), 0x1a1622);
      base.position.set(sx, -1.5, -9); g.add(base);
    }

    return g;
  }

  // ── Wall torch — iron sconce bracket design ─────────────────────────────────
  function mkTorch(x, z) {
    const g = new THREE.Group();
    const side = x < 0 ? 1 : -1;          // +1 inward for left wall, -1 for right
    const wallX = x < 0 ? -3.28 : 3.28;   // wall face position
    const flameX = wallX + side * 0.56;    // flame sits 0.56 inward from wall

    // Stone wall mounting block
    const mount = mk(bx(0.18, 0.26, 0.24), 0x1c1820);
    mount.position.set(wallX + side * 0.06, 0.90, z); g.add(mount);

    // Iron bracket arm (horizontal, extends inward)
    const armCx = (wallX + side * 0.06 + flameX) / 2;
    const armLen = Math.abs(flameX - (wallX + side * 0.06));
    const arm = mk(bx(armLen - 0.02, 0.06, 0.06), 0x282222);
    arm.position.set(armCx, 1.0, z); g.add(arm);

    // Rivet knobs on arm
    for (let ri = 0; ri < 2; ri++) {
      const rv = mk(bx(0.07, 0.1, 0.1), 0x222020);
      rv.position.set(wallX + side * (0.16 + ri * 0.15), 0.99, z); g.add(rv);
    }

    // Torch body / handle
    const hnd = mk(cy(0.045, 0.055, 0.32, 8), 0x2e1c06);
    hnd.position.set(flameX, 0.84, z); g.add(hnd);

    // Torch cup / bowl
    const cup = mk(cy(0.12, 0.08, 0.14, 10), 0x4a3410);
    cup.position.set(flameX, 1.02, z); g.add(cup);

    // Ember glow at cup base
    const ember = mk(bx(0.1, 0.03, 0.1), 0xff4400);
    ember.position.set(flameX, 1.08, z); g.add(ember);

    // Three-layer flame cones for depth
    const fl1 = mk(cn(0.17, 0.50, 8), 0xff5c00);
    fl1.position.set(flameX, 1.30, z); _flames.push(fl1); g.add(fl1);
    const fl2 = mk(cn(0.10, 0.33, 8), 0xffaa18);
    fl2.position.set(flameX, 1.33, z); _flames.push(fl2); g.add(fl2);
    const fl3 = mk(cn(0.05, 0.22, 7), 0xfff080);
    fl3.position.set(flameX, 1.36, z); _flames.push(fl3); g.add(fl3);

    const lgt = new THREE.PointLight(0xff6600, 2.63, 8.5);
    lgt.userData.base = 2.63;
    lgt.position.set(flameX, 1.3, z); _lights.push(lgt); g.add(lgt);
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
      // Keystone wedge
      const ks = mk(bx(0.36, 0.3, 0.4), 0x221e30);
      ks.position.set(0, 1.8, z); g.add(ks);
      // Door-jamb pilasters
      for (const px of [-1.16, 1.16]) {
        const pil = mk(bx(0.12, 3.2, 0.36), 0x1a1828);
        pil.position.set(px, 0.12, z); g.add(pil);
      }
    } else {
      const w = mk(bx(7.2, 4.2, 0.32), 0x13101a);
      w.position.set(0, 0.2, z); g.add(w);

      // Carved stone relief panel — outer frame
      const panelFrame = mk(bx(2.8, 3.4, 0.04), 0x1a1626);
      panelFrame.position.set(0, 0.2, z + 0.17); g.add(panelFrame);
      const panelInner = mk(bx(2.56, 3.16, 0.04), 0x15121e);
      panelInner.position.set(0, 0.2, z + 0.19); g.add(panelInner);

      // Dragon bas-relief carving
      const dBody = mk(bx(0.56, 0.68, 0.06), 0x201c2e);
      dBody.position.set(0, 0.16, z + 0.22); g.add(dBody);
      const dBelly = mk(bx(0.36, 0.44, 0.05), 0x24203a);
      dBelly.position.set(0, 0.10, z + 0.24); g.add(dBelly);
      // Wings
      const dWL = mk(bx(0.88, 0.52, 0.04), 0x1e1a2c);
      dWL.rotation.z = 0.35; dWL.position.set(-0.66, 0.50, z + 0.22); g.add(dWL);
      const dWL2 = mk(bx(0.58, 0.26, 0.03), 0x1a1628);
      dWL2.rotation.z = 0.58; dWL2.position.set(-0.96, 0.26, z + 0.21); g.add(dWL2);
      const dWR = mk(bx(0.88, 0.52, 0.04), 0x1e1a2c);
      dWR.rotation.z = -0.35; dWR.position.set(0.66, 0.50, z + 0.22); g.add(dWR);
      const dWR2 = mk(bx(0.58, 0.26, 0.03), 0x1a1628);
      dWR2.rotation.z = -0.58; dWR2.position.set(0.96, 0.26, z + 0.21); g.add(dWR2);
      // Neck and head
      const dNeck = mk(bx(0.22, 0.34, 0.05), 0x201c2e);
      dNeck.rotation.z = 0.12; dNeck.position.set(0.04, 0.72, z + 0.22); g.add(dNeck);
      const dHead = mk(bx(0.36, 0.28, 0.06), 0x1e1a2e);
      dHead.position.set(0.06, 1.0, z + 0.22); g.add(dHead);
      const dSnout = mk(bx(0.2, 0.12, 0.05), 0x201c2c);
      dSnout.position.set(0.08, 0.93, z + 0.24); g.add(dSnout);
      // Eye sockets
      const dEyeL = mk(bx(0.08, 0.08, 0.04), 0x2e1a44);
      dEyeL.position.set(-0.06, 1.03, z + 0.24); g.add(dEyeL);
      const dEyeR = mk(bx(0.08, 0.08, 0.04), 0x2e1a44);
      dEyeR.position.set(0.15, 1.03, z + 0.24); g.add(dEyeR);
      // Tail curling
      const dT1 = mk(bx(0.14, 0.74, 0.04), 0x1e1a2a);
      dT1.rotation.z = 0.55; dT1.position.set(-0.24, -0.48, z + 0.21); g.add(dT1);
      const dT2 = mk(bx(0.1, 0.48, 0.04), 0x1c1826);
      dT2.rotation.z = -0.3; dT2.position.set(-0.52, -0.76, z + 0.20); g.add(dT2);
      // Front claws
      for (const ci of [-1, 1]) {
        const claw = mk(bx(0.14, 0.08, 0.04), 0x1e1a2c);
        claw.rotation.z = ci * 0.4; claw.position.set(ci * 0.22, -0.26, z + 0.22); g.add(claw);
      }
      // Corner ornament squares
      for (const [ox, oy] of [[-1.22, 1.76], [-1.22, -1.36], [1.22, 1.76], [1.22, -1.36]]) {
        const orn = mk(bx(0.22, 0.22, 0.05), 0x221e30);
        orn.position.set(ox, oy, z + 0.19); g.add(orn);
        const ornInner = mk(bx(0.12, 0.12, 0.04), 0x2c2840);
        ornInner.position.set(ox, oy, z + 0.21); g.add(ornInner);
      }
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

    // Symmetric side pedestals flanking the path (like reference image)
    for (const px of [-2.6, 2.6]) {
      for (const pz of [-4.5, -8.5]) {
        const pBase = mk(bx(0.8, 0.14, 0.8), 0x1a1626);
        pBase.position.set(px, -1.65, pz); g.add(pBase);
        const pShaft = mk(bx(0.64, 0.64, 0.64), 0x171220);
        pShaft.position.set(px, -1.33, pz); g.add(pShaft);
        const pCap = mk(bx(0.78, 0.12, 0.78), 0x1e1a2c);
        pCap.position.set(px, -1.01, pz); g.add(pCap);
        // Flame on top of pedestal
        const pFlame = mk(cn(0.1, 0.3, 8), 0xaa00ff);
        pFlame.position.set(px, -0.82, pz); _flames.push(pFlame); g.add(pFlame);
        const pFlame2 = mk(cn(0.055, 0.2, 8), 0xdd88ff);
        pFlame2.position.set(px, -0.78, pz); _flames.push(pFlame2); g.add(pFlame2);
      }
    }

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
    // Altar glow ring
    const altarRing = mk(bx(1.18, 0.04, 1.18), 0x440044);
    altarRing.position.set(0, -0.77, -9.5); g.add(altarRing);

    // Boss purple light
    const bL = new THREE.PointLight(0xaa00cc, 3.38, 16);
    bL.userData.base = 3.38;
    bL.position.set(0, 1.5, -9.5); _lights.push(bL); g.add(bL);

    // Hanging chains with skulls
    for (let i = 0; i < 3; i++) {
      const cx = -2.1 + i * 2.1;
      const ch = mk(cy(0.025, 0.025, 2.8, 8), 0x2c2c2c);
      ch.position.set(cx, 0.4, -7); ch.rotation.x = 0.22; g.add(ch);
      // Skull at chain end
      const sk = mk(bx(0.18, 0.16, 0.2), 0x706858);
      sk.position.set(cx + 0.6, -0.95, -7.6); g.add(sk);
    }

    return g;
  }

  function buildRest() {
    const g = new THREE.Group();
    g.add(mkCorridor());
    g.add(mkBackWall(-10, false));
    g.add(mkTorch(-3.05, -2.2)); g.add(mkTorch(3.05, -2.2));

    // Campfire logs
    const log1 = mk(cy(0.12, 0.15, 1.3, 10), 0x3a1e08);
    log1.rotation.z = Math.PI / 2; log1.position.set(0.3, -1.54, -4.8); g.add(log1);
    const log2 = mk(cy(0.12, 0.15, 1.3, 10), 0x2e1808);
    log2.rotation.set(0.35, 0.9, Math.PI / 2); log2.position.set(-0.35, -1.54, -5.1); g.add(log2);
    const log3 = mk(cy(0.1, 0.12, 1.0, 9), 0x3c2008);
    log3.rotation.set(0.1, 0.5, 1.4); log3.position.set(0, -1.54, -5.3); g.add(log3);
    const ember = mk(bx(0.58, 0.04, 0.58), 0xcc3800);
    ember.position.set(0, -1.58, -4.95); g.add(ember);

    // Campfire flames
    const f1 = mk(cn(0.23, 0.62, 8), 0xff7010);
    f1.position.set(0, -1.21, -4.95); _flames.push(f1); g.add(f1);
    const f2 = mk(cn(0.14, 0.44, 8), 0xffcc30);
    f2.position.set(0.05, -1.06, -4.95); _flames.push(f2); g.add(f2);
    const f3 = mk(cn(0.07, 0.26, 7), 0xfff0a0);
    f3.position.set(0, -0.97, -4.95); _flames.push(f3); g.add(f3);

    // Warm fire light
    const fl = new THREE.PointLight(0xff7020, 4.32, 12);
    fl.userData.base = 4.32;
    fl.position.set(0, -0.9, -4.95); _lights.push(fl); g.add(fl);

    // Bedroll
    const bed = mk(bx(1.0, 0.1, 2.1), 0x483020);
    bed.position.set(-2.05, -1.64, -5.8); g.add(bed);
    const roll = mk(cy(0.22, 0.22, 1.0, 10), 0x5a3c28);
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
      const coin = mk(cy(0.09, 0.09, 0.025, 10), 0xd4a810);
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
    const pb = mk(cy(0.11, 0.13, 0.35, 10), 0x2a1060);
    pb.position.set(-0.9, -0.64, -6.0); g.add(pb);
    const pn = mk(cy(0.05, 0.1, 0.16, 9), 0x2a1060);
    pn.position.set(-0.9, -0.45, -6.0); g.add(pn);
    // Scroll
    const scr = mk(cy(0.09, 0.09, 0.3, 12), 0xd4b870);
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
      const col = mk(cy(0.21, 0.27, 3.9, 10), 0x1e1828);
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
