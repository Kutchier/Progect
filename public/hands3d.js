'use strict';

// ─── 3D First-Person Hands Renderer ─────────────────────────────────────────
// Renders procedural low-poly Three.js hand/weapon models per player class.
// Mounts a transparent canvas into #bs-hands, overlaid on the dungeon corridor.

window.Hands3D = (() => {

  let renderer = null, scene = null, camera = null;
  let rightGroup = null, leftGroup = null;
  let animId = null;
  let attackTimer = -1;

  // ─── Geometry helpers ─────────────────────────────────────────────────────

  function m(color, extra) {
    return new THREE.MeshLambertMaterial(Object.assign({ color, flatShading: true }, extra || {}));
  }
  function em(emissive) {
    return new THREE.MeshLambertMaterial({ color: 0x060606, emissive, flatShading: true });
  }
  function bx(mat, w, h, d, x, y, z, rx, rz) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    if (x !== undefined) mesh.position.set(x, y, z);
    if (rx) mesh.rotation.x = rx;
    if (rz) mesh.rotation.z = rz;
    return mesh;
  }
  function cy(mat, rt, rb, h, s, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat);
    if (x !== undefined) mesh.position.set(x, y, z);
    return mesh;
  }
  function sp(mat, r, s, x, y, z) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, s, s), mat);
    if (x !== undefined) mesh.position.set(x, y, z);
    return mesh;
  }

  // ─── Hand base pieces ─────────────────────────────────────────────────────

  // Steel-plated gauntlet (warrior / cleric)
  function mkGauntlet(armorC, accentC) {
    const g = new THREE.Group();
    const am = m(armorC), ac = m(accentC);
    g.add(bx(am, 0.76, 0.62, 0.56));                                  // palm
    for (let i = 0; i < 4; i++)
      g.add(cy(am, 0.072, 0.078, 0.32, 8, -0.28 + i * 0.19, 0.43, 0.13)); // fingers
    g.add(bx(ac, 0.78, 0.07, 0.57, 0,  0.24, 0));                    // knuckle trim
    g.add(bx(am, 0.78, 0.34, 0.57, 0, -0.46, 0));                    // wrist plate
    g.add(bx(ac, 0.78, 0.06, 0.57, 0, -0.28, 0));                    // wrist trim
    g.add(cy(am, 0.34, 0.40, 1.55, 10,  0,   -1.22, 0));              // forearm
    return g;
  }

  // Fabric sleeve + bare hand (mage / rogue)
  function mkSleeveHand(skinC, sleeveC, cuffC) {
    const g = new THREE.Group();
    g.add(bx(m(skinC), 0.58, 0.56, 0.44));
    for (let i = 0; i < 4; i++)
      g.add(cy(m(skinC), 0.058, 0.063, 0.27, 8, -0.20 + i * 0.14, 0.37, 0.13));
    g.add(cy(m(cuffC),  0.38, 0.38, 0.20, 10, 0, -0.38, 0));         // cuff ring
    g.add(cy(m(sleeveC), 0.30, 0.40, 1.30, 10, 0, -1.10, 0));        // sleeve
    return g;
  }

  // ─── Warrior ──────────────────────────────────────────────────────────────
  function buildWarriorHands() {
    const armorC = 0x282c3e, accentC = 0xb07818, bladeC = 0x6878a0;

    // Right: armored fist + longsword
    const right = new THREE.Group();
    right.add(mkGauntlet(armorC, accentC));

    const sword = new THREE.Group();
    sword.add(bx(m(bladeC), 0.10, 1.88, 0.06, 0, 1.20, 0.09));
    sword.add(bx(m(0xb8c8e0), 0.04, 1.85, 0.03, 0.04, 1.20, 0.12));  // edge glint
    sword.add(bx(m(accentC), 0.60, 0.10, 0.12, 0, 0.26, 0.09));      // crossguard
    sword.add(cy(m(0x3a2808), 0.07, 0.07, 0.55, 10, 0, -0.12, 0.09));  // grip
    sword.add(bx(m(accentC), 0.18, 0.18, 0.18, 0, -0.47, 0.09));     // pommel
    right.add(sword);

    // Left: armored fist + kite shield
    const left = new THREE.Group();
    left.add(mkGauntlet(armorC, accentC));

    const shield = new THREE.Group();
    shield.add(bx(m(0x161830), 1.00, 1.28, 0.10, -0.50,  0.60, 0));
    shield.add(bx(m(accentC), 1.00, 0.08, 0.13, -0.50,  0.80, 0));   // top trim
    shield.add(bx(m(accentC), 1.00, 0.08, 0.13, -0.50, -0.18, 0));   // bottom trim
    shield.add(bx(m(accentC), 0.08, 1.28, 0.13, -0.02,  0.60, 0));   // left trim
    shield.add(bx(m(accentC), 0.08, 1.28, 0.13, -0.98,  0.60, 0));   // right trim
    shield.add(bx(m(0x800808), 0.14, 1.02, 0.05, -0.50,  0.60, 0.07)); // cross V
    shield.add(bx(m(0x800808), 0.82, 0.14, 0.05, -0.50,  0.60, 0.07)); // cross H
    shield.add(bx(m(accentC), 0.20, 0.20, 0.14, -0.50,  0.60, 0.08)); // boss
    left.add(shield);

    return { right, left };
  }

  // ─── Mage ─────────────────────────────────────────────────────────────────
  function buildMageHands() {
    const skinC = 0xb0a888, sleeveC = 0x0e0a1e, cuffC = 0x3355cc;

    // Right: sleeve + arcane staff
    const right = new THREE.Group();
    right.add(mkSleeveHand(skinC, sleeveC, cuffC));

    const staff = new THREE.Group();
    staff.add(cy(m(0x6a5030), 0.058, 0.058, 2.25, 10, 0, 0.84, 0.08));
    staff.add(sp(m(0x001428, { emissive: 0x4488cc }), 0.22, 12, 0, 1.97, 0.08));
    staff.add(sp(m(0x4488cc, { emissive: 0x88ddff }), 0.12, 12, 0, 1.97, 0.08));  // inner glow
    right.add(staff);

    // Left: sleeve + channelling orb in palm
    const left = new THREE.Group();
    left.add(mkSleeveHand(skinC, sleeveC, cuffC));
    left.add(sp(m(0x2244aa, { emissive: 0xaaccff, transparent: true, opacity: 0.68 }), 0.30, 14, 0, 0.56, 0.18));
    left.add(sp(m(0x001428, { emissive: 0x4488ff, transparent: true, opacity: 0.32 }), 0.50, 14, 0, 0.56, 0.18));

    return { right, left };
  }

  // ─── Rogue ────────────────────────────────────────────────────────────────
  function buildRogueHands() {
    const gloveC = 0x111018, sleeveC = 0x1c1428, cuffC = 0x5533aa, bladeC = 0x505070;

    const mkDagger = (xOff, rz) => {
      const g = new THREE.Group();
      g.add(bx(m(bladeC), 0.07, 1.28, 0.06, xOff, 0.78, 0.08));
      g.add(bx(m(0x8080b8), 0.03, 1.25, 0.03, xOff + 0.03, 0.78, 0.11));  // edge
      g.add(bx(m(cuffC), 0.40, 0.07, 0.09, xOff, 0.16, 0.08));           // guard
      g.add(cy(m(0x1a1428), 0.058, 0.058, 0.38, 10, xOff, -0.10, 0.08));   // grip
      if (rz) g.rotation.z = rz;
      return g;
    };

    const right = new THREE.Group();
    right.add(mkSleeveHand(gloveC, sleeveC, cuffC));
    right.add(mkDagger(0, 0));

    const left = new THREE.Group();
    left.add(mkSleeveHand(gloveC, sleeveC, cuffC));
    left.add(mkDagger(0.10, 0.20));  // slight angle

    return { right, left };
  }

  // ─── Cleric ───────────────────────────────────────────────────────────────
  function buildClericHands() {
    const armorC = 0x363020, accentC = 0xcc9900;

    // Right: gauntlet + holy mace
    const right = new THREE.Group();
    right.add(mkGauntlet(armorC, accentC));

    const mace = new THREE.Group();
    mace.add(cy(m(0x7a5828), 0.065, 0.065, 1.65, 10, 0, 0.78, 0.08));   // handle
    mace.add(bx(m(armorC), 0.46, 0.46, 0.46, 0, 1.63, 0.08));          // head
    mace.add(bx(m(accentC), 0.56, 0.10, 0.56, 0, 1.78, 0.08));         // top band
    mace.add(bx(m(accentC), 0.56, 0.10, 0.56, 0, 1.48, 0.08));         // bottom band
    mace.add(sp(m(0xffe060, { emissive: 0xcc9900 }), 0.18, 12, 0, 1.95, 0.08)); // gem
    right.add(mace);

    // Left: gauntlet + divine aura
    const left = new THREE.Group();
    left.add(mkGauntlet(armorC, accentC));
    left.add(sp(m(0xffeea0, { emissive: 0xddcc55, transparent: true, opacity: 0.58 }), 0.36, 14, 0, 0.52, 0.18));
    left.add(sp(m(0xffcc40, { emissive: 0xbb8800, transparent: true, opacity: 0.28 }), 0.58, 14, 0, 0.52, 0.18));

    return { right, left };
  }

  // ─── Builder map ──────────────────────────────────────────────────────────
  const BUILDERS = {
    warrior: buildWarriorHands,
    mage:    buildMageHands,
    rogue:   buildRogueHands,
    cleric:  buildClericHands
  };

  // ─── Resting positions (returned to after attack) ─────────────────────────
  const REST_R = { x: 2.35, y: -1.15, z: 1.40, rx: -0.22, ry: -0.28, rz: 0.12 };
  const REST_L = { x: -2.35, y: -1.15, z: 1.40, rx: -0.22, ry:  0.28, rz: -0.12 };

  // ─── Three.js init ────────────────────────────────────────────────────────
  function init(w, h) {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 50);
    camera.position.set(0, 0.4, 5.0);
    camera.lookAt(0, -0.6, 0);

    scene.add(new THREE.AmbientLight(0x14101a, 3.0));

    const tL = new THREE.PointLight(0xff6a0a, 4.2, 18);
    tL.position.set(-4, 3, 7);
    scene.add(tL);

    const tR = new THREE.PointLight(0xff4a06, 2.8, 18);
    tR.position.set(4, 2, 6);
    scene.add(tR);

    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(w, h);
    try { renderer.outputColorSpace = THREE.SRGBColorSpace; } catch (e) {}
  }

  function disposeGroup(g) {
    if (!g) return;
    g.traverse(c => { if (c.isMesh) { c.geometry.dispose(); c.material.dispose(); } });
  }

  // ─── Mount ────────────────────────────────────────────────────────────────
  function mount(classId, containerEl) {
    if (typeof THREE === 'undefined') return;

    const w = containerEl.clientWidth;
    const h = containerEl.clientHeight;
    if (!w || !h) {
      // Container not laid out yet — retry next frame
      requestAnimationFrame(() => mount(classId, containerEl));
      return;
    }

    if (animId) { cancelAnimationFrame(animId); animId = null; }

    const oldCvs = containerEl.querySelector('canvas.h3d');
    if (oldCvs) oldCvs.remove();

    disposeGroup(rightGroup); disposeGroup(leftGroup);
    if (scene) { scene.remove(rightGroup); scene.remove(leftGroup); }

    if (!renderer) {
      init(w, h);
    } else {
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const builder = BUILDERS[classId] || BUILDERS.warrior;
    const hands = builder();
    rightGroup = hands.right;
    leftGroup  = hands.left;

    // Arms rise from bottom corners — weapons pointing up
    rightGroup.position.set(REST_R.x, REST_R.y, REST_R.z);
    rightGroup.rotation.set(REST_R.rx, REST_R.ry, REST_R.rz);
    leftGroup.position.set(REST_L.x, REST_L.y, REST_L.z);
    leftGroup.rotation.set(REST_L.rx, REST_L.ry, REST_L.rz);

    scene.add(rightGroup);
    scene.add(leftGroup);

    attackTimer = -1;

    const cvs = renderer.domElement;
    cvs.className = 'h3d';
    cvs.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;display:block;';
    containerEl.appendChild(cvs);

    startLoop();
  }

  // ─── Animation loop ───────────────────────────────────────────────────────
  function startLoop() {
    const t0 = performance.now();

    function loop(now) {
      animId = requestAnimationFrame(loop);
      if (!rightGroup || !leftGroup) return;

      const t = (now - t0) / 1000;

      // Idle bob (only when not attacking)
      if (attackTimer < 0) {
        rightGroup.position.y = REST_R.y + Math.sin(t * 1.55) * 0.055;
        leftGroup.position.y  = REST_L.y + Math.sin(t * 1.55 + 0.50) * 0.055;
        // Tiny sway
        rightGroup.rotation.z = REST_R.rz + Math.sin(t * 0.90) * 0.02;
        leftGroup.rotation.z  = REST_L.rz + Math.sin(t * 0.90 + 0.3) * 0.02;
      }

      // Attack swing: right hand lunges forward-up then returns
      if (attackTimer >= 0) {
        attackTimer += 0.062;
        const p   = Math.min(attackTimer, 1);
        const sw  = p < 0.35 ? p / 0.35 : Math.max(0, 1 - (p - 0.35) / 0.65);

        rightGroup.position.set(
          REST_R.x - sw * 0.55,
          REST_R.y - sw * 0.40,
          REST_R.z + sw * 2.20
        );
        rightGroup.rotation.set(
          REST_R.rx - sw * 0.65,
          REST_R.ry + sw * 0.10,
          REST_R.rz - sw * 0.38
        );

        if (attackTimer >= 1) {
          attackTimer = -1;
          rightGroup.position.set(REST_R.x, REST_R.y, REST_R.z);
          rightGroup.rotation.set(REST_R.rx, REST_R.ry, REST_R.rz);
        }
      }

      renderer.render(scene, camera);
    }

    animId = requestAnimationFrame(loop);
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  function triggerAttack() { if (attackTimer < 0) attackTimer = 0; }

  function unmount() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    disposeGroup(rightGroup); disposeGroup(leftGroup);
    if (scene) { scene.remove(rightGroup); scene.remove(leftGroup); }
    rightGroup = null; leftGroup = null;
    const cvs = renderer?.domElement;
    if (cvs && cvs.parentNode) cvs.parentNode.removeChild(cvs);
  }

  return { mount, triggerAttack, unmount };

})();
