'use strict';

// ─── Isometric Tactical Combat Renderer ───────────────────────────────────────
window.Combat3D = (() => {
  let renderer, scene, camera, animId;
  let gridGroup, entityGroup, highlightGroup, labelGroup, lightGroup;
  let raycaster, mouse;
  let container = null;
  let onCellClick = null, onEntityClick = null;

  let _combatGrid = null, _players = [], _enemies = [];
  let _mySocketId = null, _currentTurnEntityId = null, _myCharacter = null;
  let _prevTurnEntityId = null;

  let effectGroup = null;
  const abilityEffects = [];

  const entityMeshes = {};   // id → THREE.Group (body)
  const entityLabels = {};   // id → { sprite, texture, canvas, ctx }
  const entityHpCache = {};  // id → hp  (for detecting changes)
  const anims = {};          // id → { type, t, dur }

  let reachableCells = new Set();
  let attackableIds  = new Set();
  let abilityRangeCells   = new Set();  // cells in AoE ability range (purple)
  let abilityTargetableIds = new Set(); // enemy IDs in ranged-single ability range (teal)
  let _abilityAimMode = null;           // { rangeType:'ranged-aoe'|'ranged-single', maxRange, aoeRadius }
  let hoveredCell    = null;

  const CELL = 1.0;
  const GRID_SIZE = 14;

  // ─── Room themes ───────────────────────────────────────────────────────────
  const T = {
    dungeon:  { floor:0x1a140e, wall:0x0e0a08, wTop:0x181210, obs:0x2a1e12, bg:0x060408, fog:0x060408, amb:[0x201810,1.98], dir:[0xffeedd,0.9], torchColor:0xff8800 },
    crypt:    { floor:0x161418, wall:0x100c14, wTop:0x1c1820, obs:0x201c28, bg:0x050407, fog:0x050407, amb:[0x100a18,1.8], dir:[0xbbbbff,0.72], torchColor:0x8844ff },
    forest:   { floor:0x18280e, wall:0x0e1808, wTop:0x1e3012, obs:0x2a3c18, bg:0x050802, fog:0x060a04, amb:[0x101808,2.34], dir:[0x88ffaa,0.9], torchColor:0x44ff88 },
    ice:      { floor:0x161e30, wall:0x0e1424, wTop:0x1a2238, obs:0x22304c, bg:0x040810, fog:0x040810, amb:[0x0a1020,2.16], dir:[0xaaddff,0.9], torchColor:0x44aaff },
    lava:     { floor:0x1a0c06, wall:0x100604, wTop:0x180a06, obs:0x280e06, bg:0x080302, fog:0x080302, amb:[0x1e0804,1.8], dir:[0xff8844,1.08], torchColor:0xff4400 },
    library:  { floor:0x1e1608, wall:0x14100a, wTop:0x201e10, obs:0x2c1e0e, bg:0x060504, fog:0x060504, amb:[0x181008,2.16], dir:[0xffeecc,0.9], torchColor:0xffcc66 },
    throne:   { floor:0x1a0e0e, wall:0x100808, wTop:0x1e1010, obs:0x2c1212, bg:0x060303, fog:0x060303, amb:[0x180808,1.98], dir:[0xffccaa,0.9], torchColor:0xff3300 },
    sewer:    { floor:0x0e1410, wall:0x080e0a, wTop:0x101810, obs:0x182018, bg:0x030604, fog:0x030604, amb:[0x0a100a,1.62], dir:[0xaaccaa,0.54], torchColor:0x44aa22 },
    temple:   { floor:0x1e1c16, wall:0x141210, wTop:0x22201a, obs:0x2e2c20, bg:0x060605, fog:0x060605, amb:[0x181814,2.34], dir:[0xffffff,1.08], torchColor:0xffee88 },
    workshop: { floor:0x181420, wall:0x100e18, wTop:0x1c1a24, obs:0x26223c, bg:0x050408, fog:0x050408, amb:[0x14101c,1.8], dir:[0xffccaa,0.9], torchColor:0xff7700 },
  };

  // ─── Colour helpers ────────────────────────────────────────────────────────
  const C = {
    moveBlue:0x1a4a9a, moveEdge:0x3a7acc,
    atkRed:0x9a1a1a,   atkEdge:0xcc3a3a,
    abilRange:0x4a1080, abilRangeEdge:0xaa44ff,  // purple: AoE ability range
    abilTeal:0x005a50,  abilTealEdge:0x00ccaa,    // teal: ranged single target
    turnGold:0xffcc00,
    playerWarrior:0x3a5a80, playerMage:0x5a2a8a,
    playerRogue:0x1a3a2a,   playerCleric:0x7a6020,
    playerSkin:0xc8a878,    playerArmor:0x4a5068,
    enemyBase:0x600808, enemyHead:0x7a1010, enemyEye:0xff2200, enemyDark:0x480808,
  };

  // ─── Geometry helpers ──────────────────────────────────────────────────────
  function mat(color, emissive=0x000000, opacity=1) {
    return new THREE.MeshLambertMaterial({ color, emissive, flatShading:true,
      transparent: opacity<1, opacity });
  }
  function matB(color, opacity=0.7) {
    return new THREE.MeshBasicMaterial({ color, transparent:true, opacity, side:THREE.DoubleSide });
  }
  function box(w,h,d,m,x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), m);
    mesh.position.set(x,y,z); return mesh;
  }
  function cyl(rt,rb,h,segs,m,x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segs), m);
    mesh.position.set(x,y,z); return mesh;
  }
  function sph(r,segs,m,x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r,segs,segs), m);
    mesh.position.set(x,y,z); return mesh;
  }
  function cone(r,h,segs,m,x=0,y=0,z=0) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(r,h,segs), m);
    mesh.position.set(x,y,z); return mesh;
  }

  // ─── Label system (name + HP bar sprites) ──────────────────────────────────
  function makeLabelCanvas(name, hp, maxHp, isEnemy, isAlive) {
    const W = 200, H = 42;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    // Background pill
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    roundRect(ctx, 2, 2, W-4, H-4, 5);
    ctx.fill();

    // Name text
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = isEnemy ? '#ff8888' : '#88ccff';
    if (!isAlive) ctx.fillStyle = '#666666';
    ctx.fillText(name.length > 14 ? name.slice(0,13)+'…' : name, W/2, 17);

    // HP bar background
    const barX = 10, barY = 22, barW = W-20, barH = 10;
    ctx.fillStyle = '#1a0808';
    ctx.fillRect(barX, barY, barW, barH);

    // HP bar fill
    const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp/maxHp)) : 0;
    const hpColor = pct > 0.6 ? '#22cc44' : pct > 0.3 ? '#ddaa22' : '#cc2222';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, Math.floor(barW * pct), barH);

    // HP text
    ctx.font = '9px monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText(`${hp}/${maxHp}`, W/2, barY + barH - 1);

    return canvas;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
  }

  function createLabel(id, name, hp, maxHp, isEnemy, isAlive, headY) {
    const canvas = makeLabelCanvas(name, hp, maxHp, isEnemy, isAlive);
    const texture = new THREE.CanvasTexture(canvas);
    const spMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
    const sprite = new THREE.Sprite(spMat);
    sprite.scale.set(1.6, 0.34, 1);
    sprite.position.set(0, headY + 0.42, 0);
    entityLabels[id] = { sprite, texture, canvas };
    return sprite;
  }

  function updateLabel(id, name, hp, maxHp, isEnemy, isAlive) {
    const lbl = entityLabels[id];
    if (!lbl) return;
    const ctx = lbl.canvas.getContext('2d');
    ctx.clearRect(0,0,lbl.canvas.width, lbl.canvas.height);
    const fresh = makeLabelCanvas(name, hp, maxHp, isEnemy, isAlive);
    ctx.drawImage(fresh, 0, 0);
    lbl.texture.needsUpdate = true;
  }

  // ─── Grid / room building ──────────────────────────────────────────────────
  function buildGrid(combatGrid) {
    // Clean up old lights from previous room
    if (lightGroup) { lightGroup.clear(); }

    const theme = T[combatGrid.theme] || T.dungeon;
    const size = combatGrid.size;

    // Update scene background and fog to match theme
    scene.background.set(theme.bg);
    if (scene.fog) { scene.fog.color.set(theme.fog); }

    // Reset ambient and directional lights
    scene.children.forEach(c => {
      if (c.isAmbientLight) c.color.set(theme.amb[0]), c.intensity = theme.amb[1];
      if (c.isDirectionalLight) c.color.set(theme.dir[0]), c.intensity = theme.dir[1];
    });

    const mFloor = mat(theme.floor, 0x040400);
    const mWall  = mat(theme.wall,  0x020202);
    const mWTop  = mat(theme.wTop,  0x050403);
    const mObs   = mat(theme.obs,   0x080604);

    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const cell = combatGrid.grid[x][z];
        const wx = x * CELL - size * CELL / 2 + CELL / 2;
        const wz = z * CELL - size * CELL / 2 + CELL / 2;

        if (cell === 'wall') {
          const wm = box(CELL, 1.4, CELL, mWall, wx, 0.7, wz);
          wm.userData.isWall = true;
          gridGroup.add(wm);
          gridGroup.add(box(CELL*0.96, 0.1, CELL*0.96, mWTop, wx, 1.45, wz));
        } else if (cell === 'obstacle') {
          gridGroup.add(box(CELL*0.94, 0.1, CELL*0.94, mFloor, wx, 0.05, wz));
          buildObstacle(gridGroup, combatGrid.theme, wx, wz, mObs, mWTop);
        } else {
          const tile = box(CELL*0.94, 0.1, CELL*0.94, mFloor, wx, 0.05, wz);
          tile.userData = { cellX:x, cellZ:z, isFloor:true };
          tile.receiveShadow = true;
          gridGroup.add(tile);
          const edge = box(CELL*0.97, 0.02, CELL*0.97, matB(theme.obs, 0.25), wx, 0.07, wz);
          edge.userData = { cellX:x, cellZ:z, isEdge:true };
          gridGroup.add(edge);
        }
      }
    }

    // Outer walls with decorative stone face
    buildBorderWalls(size, theme);

    // Theme-specific props
    buildProps(size, combatGrid.theme, theme);
  }

  function buildObstacle(group, themeName, wx, wz, mObs, mWTop) {
    // Per-theme obstacle appearance
    switch(themeName) {
      case 'forest': {
        // Tree stump
        group.add(cyl(0.22, 0.28, 0.6, 8, mat(0x3a2810), wx, 0.35, wz));
        group.add(cyl(0.28, 0.28, 0.08, 8, mat(0x4a3418), wx, 0.68, wz));
        break;
      }
      case 'ice': {
        // Ice spike cluster
        group.add(cone(0.15, 0.8, 6, mat(0x88aacc,0x224466), wx, 0.5, wz));
        group.add(cone(0.1, 0.55, 6, mat(0x8899bb,0x1a3355), wx+0.18, 0.38, wz-0.15));
        break;
      }
      case 'lava': {
        // Lava rock
        group.add(sph(0.28, 7, mat(0x2a1408,0x600800), wx, 0.32, wz));
        // Glowing crack on top
        group.add(box(0.08, 0.04, 0.28, mat(0xff4400,0xcc2200), wx, 0.56, wz));
        break;
      }
      case 'crypt': {
        // Stone coffin fragment / sarcophagus lid
        group.add(box(0.5, 0.28, 0.7, mat(0x181420,0x080408), wx, 0.2, wz));
        group.add(box(0.42, 0.08, 0.6, mat(0x22202a,0x080408), wx, 0.38, wz));
        break;
      }
      case 'library': {
        // Stack of books
        group.add(box(0.48, 0.16, 0.38, mat(0x3a1a08), wx, 0.13, wz));
        group.add(box(0.38, 0.14, 0.32, mat(0x1a2a10), wx+0.02, 0.26, wz-0.02));
        group.add(box(0.3, 0.12, 0.28, mat(0x1a1040), wx-0.03, 0.38, wz+0.02));
        break;
      }
      case 'workshop': {
        // Anvil shape
        group.add(box(0.42, 0.14, 0.28, mat(0x383838,0x101010), wx, 0.32, wz));
        group.add(box(0.3, 0.22, 0.22, mat(0x282828,0x101010), wx, 0.18, wz));
        break;
      }
      default: {
        // Stone pillar
        group.add(cyl(0.22, 0.26, 0.9, 6, mObs, wx, 0.5, wz));
        group.add(box(0.52, 0.1, 0.52, mWTop, wx, 0.96, wz));
      }
    }
  }

  function buildBorderWalls(size, theme) {
    const wallH = 3.0;
    const roomW = size * CELL;
    const mBW = mat(theme.wall, 0x030202);
    const mWTrim = mat(theme.wTop, 0x060504);

    [-1, 1].forEach(side => {
      const zw = box(roomW+0.2, wallH, 0.35, mBW, 0, wallH/2, side*(roomW/2-0.18));
      zw.userData.isWall = true; gridGroup.add(zw);
      gridGroup.add(box(roomW+0.2, 0.12, 0.4, mWTrim, 0, wallH+0.06, side*(roomW/2-0.18)));

      const xw = box(0.35, wallH, roomW+0.2, mBW, side*(roomW/2-0.18), wallH/2, 0);
      xw.userData.isWall = true; gridGroup.add(xw);
      gridGroup.add(box(0.4, 0.12, roomW+0.2, mWTrim, side*(roomW/2-0.18), wallH+0.06, 0));
    });
  }

  function buildProps(size, themeName, theme) {
    const half = size * CELL / 2;
    const R = half - 1.0;

    // Torches / light sources at corners and midpoints
    const torchPositions = [
      [-R, 0, -R], [R, 0, -R], [-R, 0, R], [R, 0, R],
      [0, 0, -R], [0, 0, R], [-R, 0, 0], [R, 0, 0],
    ];

    torchPositions.forEach(([x,y,z]) => {
      buildLightSource(x, y, z, themeName, theme);
    });

    // Theme-specific large props
    switch(themeName) {
      case 'dungeon':   buildDungeonProps(size, theme); break;
      case 'crypt':     buildCryptProps(size, theme); break;
      case 'forest':    buildForestProps(size, theme); break;
      case 'ice':       buildIceProps(size, theme); break;
      case 'lava':      buildLavaProps(size, theme); break;
      case 'library':   buildLibraryProps(size, theme); break;
      case 'throne':    buildThroneProps(size, theme); break;
      case 'sewer':     buildSewerProps(size, theme); break;
      case 'temple':    buildTempleProps(size, theme); break;
      case 'workshop':  buildWorkshopProps(size, theme); break;
    }
  }

  function buildLightSource(x, y, z, themeName, theme) {
    // Physical torch/lamp object
    const mWood = mat(0x5a3808);
    const mFire = mat(theme.torchColor, theme.torchColor, 0.9);
    const g = new THREE.Group();

    if (themeName === 'temple' || themeName === 'throne') {
      // Brazier on pedestal
      g.add(cyl(0.06, 0.1, 0.5, 6, mat(0x484030), 0, 0.3, 0));
      g.add(cyl(0.18, 0.08, 0.18, 8, mat(0x484030), 0, 0.62, 0));
      g.add(sph(0.16, 7, mat(theme.torchColor, theme.torchColor, 0.85), 0, 0.8, 0));
    } else if (themeName === 'workshop') {
      // Standing lantern
      g.add(cyl(0.04, 0.04, 0.7, 5, mat(0x303030), 0, 0.4, 0));
      g.add(box(0.2, 0.24, 0.2, mat(0x282828), 0, 0.82, 0));
      g.add(sph(0.1, 6, mat(theme.torchColor, theme.torchColor), 0, 0.82, 0));
    } else if (themeName === 'forest') {
      // Glowing mushroom cluster
      g.add(cyl(0.04, 0.08, 0.3, 6, mat(0x2a3818), 0, 0.2, 0));
      g.add(sph(0.14, 7, mat(theme.torchColor, theme.torchColor, 0.8), 0, 0.42, 0));
    } else {
      // Standard wall torch
      g.add(cyl(0.05, 0.07, 0.4, 6, mWood, 0, 0.22, 0));
      g.add(sph(0.11, 7, mFire, 0, 0.52, 0));
    }

    g.position.set(x, y, z);
    gridGroup.add(g);

    // Dynamic point light at this position
    const light = new THREE.PointLight(theme.torchColor, 1.62, 7);
    light.position.set(x, 0.6, z);
    lightGroup.add(light);
  }

  // ─── Theme prop builders ───────────────────────────────────────────────────
  function buildDungeonProps(size, theme) {
    const h = size * CELL / 2;
    // Barrels in corners
    [[-h+1.5, 0, -h+1.5], [h-1.5, 0, -h+1.5], [-h+1.5, 0, h-1.5]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.2, 0.22, 0.48, 10, mat(0x3a2510), x, 0.25, z));
      gridGroup.add(cyl(0.22, 0.22, 0.04, 10, mat(0x505050), x, 0.06, z));
      gridGroup.add(cyl(0.22, 0.22, 0.04, 10, mat(0x505050), x, 0.46, z));
    });
    // Iron bars on far wall
    for (let i = -3; i <= 3; i++) {
      gridGroup.add(box(0.06, 1.8, 0.06, mat(0x404040,0x101010), i*0.6, 0.9, -(h-0.4)));
    }
    // Chains hanging from ceiling
    for (let i = 0; i < 4; i++) {
      const cx = (Math.random()-0.5) * (size-4);
      const cz = (Math.random()-0.5) * (size-4);
      gridGroup.add(box(0.04, 0.8, 0.04, mat(0x484040), cx, 2.6, cz));
      gridGroup.add(sph(0.08, 6, mat(0x383030), cx, 2.15, cz));
    }
  }

  function buildCryptProps(size, theme) {
    const h = size * CELL / 2;
    // Wall sarcophagus
    gridGroup.add(box(0.9, 0.6, 0.3, mat(0x1a1420,0x060408), 0, 0.35, -(h-0.55)));
    gridGroup.add(box(0.8, 0.5, 0.08, mat(0x22202a,0x060408), 0, 0.35, -(h-0.36)));
    // Skull cluster
    [[-2,0,2],[2,0,-2],[0,0,3]].forEach(([x,y,z]) => {
      gridGroup.add(sph(0.14, 6, mat(0x9a9880), x, 0.15, z));
      gridGroup.add(box(0.16, 0.1, 0.12, mat(0x9a9880), x, 0.06, z+0.08));
    });
    // Candle clusters
    [[-h+1.8, 0, 0],[h-1.8, 0, 0]].forEach(([x,y,z]) => {
      for (let i = 0; i < 5; i++) {
        const off = (i-2)*0.15;
        const h2 = 0.08 + Math.random()*0.22;
        gridGroup.add(cyl(0.04, 0.04, h2, 5, mat(0xddddcc), x+off, h2/2, z+off*0.5));
        gridGroup.add(sph(0.05, 5, mat(0xff8800,0xcc4400,0.8), x+off, h2+0.05, z+off*0.5));
      }
    });
    // Purple mist PointLight
    const mistyLight = new THREE.PointLight(0x6600aa, 1.08, 10);
    mistyLight.position.set(0, 0.3, 0);
    lightGroup.add(mistyLight);
  }

  function buildForestProps(size, theme) {
    const h = size * CELL / 2;
    // Large tree trunks at corners
    [[-h+1.5,-h+1.5],[h-1.5,-h+1.5],[-h+1.5,h-1.5],[h-1.5,h-1.5]].forEach(([x,z]) => {
      gridGroup.add(cyl(0.3, 0.38, 2.8, 8, mat(0x3a2810), x, 1.5, z));
      // Foliage
      gridGroup.add(sph(0.7, 7, mat(0x1a3a0e,0x0a1808), x, 3.0, z));
      gridGroup.add(sph(0.5, 7, mat(0x224010,0x0a1808), x+0.2, 2.6, z-0.2));
    });
    // Mushrooms scattered
    [[1,2],[-2,1],[3,-3],[-1,-2]].forEach(([x,z]) => {
      const stem = cyl(0.06, 0.08, 0.28, 6, mat(0xccbbaa), x, 0.15, z);
      gridGroup.add(stem);
      gridGroup.add(cone(0.22, 0.2, 8, mat(0xcc2200,0x660000), x, 0.42, z));
    });
    // Mossy floor patches
    [[-1,0],[2,-1],[0,2]].forEach(([x,z]) => {
      gridGroup.add(box(0.8, 0.02, 0.6, mat(0x1a3a0e,0x0a1c06), x, 0.12, z));
    });
    // Firefly glow lights
    [[2,0,1],[-2,0,-1],[0,0,3]].forEach(([x,y,z]) => {
      const fl = new THREE.PointLight(0x88ff44, 0.72, 4);
      fl.position.set(x, 1.0, z);
      lightGroup.add(fl);
    });
  }

  function buildIceProps(size, theme) {
    const h = size * CELL / 2;
    // Large ice stalactites from ceiling
    [[-3,0,-3],[3,0,2],[-2,0,3],[2,0,-2]].forEach(([x,y,z]) => {
      gridGroup.add(cone(0.18, 1.4, 6, mat(0x88aacc,0x224488,0.85), x, 2.8-0.7, z));
      gridGroup.add(cone(0.12, 0.9, 6, mat(0x99bbdd,0x223355,0.8), x+0.3, 2.8-0.45, z-0.2));
    });
    // Ice formations on floor
    [[-2,0,0],[2,0,1],[0,0,-2]].forEach(([x,y,z]) => {
      gridGroup.add(cone(0.2, 0.7, 6, mat(0x88aacc,0x224466,0.9), x, 0.4, z));
      gridGroup.add(cone(0.13, 0.45, 6, mat(0x88aacc,0x224466,0.9), x+0.22, 0.25, z+0.18));
    });
    // Frozen figure
    gridGroup.add(box(0.36, 0.9, 0.3, mat(0x88aacc,0x224488,0.7), -h+2, 0.5, 0));
    gridGroup.add(sph(0.18, 7, mat(0x88aacc,0x224488,0.7), -h+2, 1.08, 0));
    // Blue ambient glow
    const iceGlow = new THREE.PointLight(0x44aaff, 1.44, 12);
    iceGlow.position.set(0, 0.5, 0);
    lightGroup.add(iceGlow);
  }

  function buildLavaProps(size, theme) {
    const h = size * CELL / 2;
    // Lava cracks glowing in floor (decorative only)
    [[-1,0,2],[2,0,-1],[0,0,0],[-2,0,-2]].forEach(([x,y,z]) => {
      gridGroup.add(box(0.6+Math.random()*0.4, 0.04, 0.12, mat(0xff4400,0xcc2200,0.85), x, 0.12, z));
      gridGroup.add(box(0.12, 0.04, 0.5+Math.random()*0.3, mat(0xff4400,0xcc2200,0.85), x+0.1, 0.12, z+0.1));
      // Glow light above crack
      const cL = new THREE.PointLight(0xff4400, 1.08, 4);
      cL.position.set(x, 0.3, z);
      lightGroup.add(cL);
    });
    // Lava vents (pillars with glow top)
    [[-h+2, 0, h-2],[h-2, 0, -h+2]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.25, 0.3, 0.5, 8, mat(0x1a0a04), x, 0.3, z));
      gridGroup.add(sph(0.2, 8, mat(0xff6600,0xff2200,0.9), x, 0.65, z));
      const vL = new THREE.PointLight(0xff4400, 1.8, 5);
      vL.position.set(x, 0.8, z);
      lightGroup.add(vL);
    });
    // Obsidian rocks
    [[-2,0,1],[3,0,-2]].forEach(([x,y,z]) => {
      gridGroup.add(box(0.4, 0.3, 0.35, mat(0x0e0808,0x100404), x, 0.17, z));
    });
  }

  function buildLibraryProps(size, theme) {
    const h = size * CELL / 2;
    // Bookshelves along walls
    [[-h+0.4, 0, -2], [-h+0.4, 0, 1], [h-0.4, 0, -2], [h-0.4, 0, 1]].forEach(([x,y,z]) => {
      // Shelf frame
      gridGroup.add(box(0.25, 1.8, 1.4, mat(0x4a2e08), x, 1.0, z));
      // Books - random colors
      for (let s = 0; s < 3; s++) {
        for (let b = 0; b < 5; b++) {
          const bColors = [0x3a1a08,0x1a3a08,0x1a1a50,0x501a1a,0x3a3a18];
          gridGroup.add(box(0.18, 0.22+Math.random()*0.14, 0.22, mat(bColors[b%5]),
            x+(b>2?0.02:-0.02), 0.2+s*0.35, z-0.42+b*0.22));
        }
      }
    });
    // Reading table centre
    gridGroup.add(box(1.4, 0.08, 0.8, mat(0x5a3810), 0, 0.52, 0));
    gridGroup.add(box(0.08, 0.5, 0.08, mat(0x4a2e08), -0.6, 0.27, -0.32));
    gridGroup.add(box(0.08, 0.5, 0.08, mat(0x4a2e08),  0.6, 0.27, -0.32));
    gridGroup.add(box(0.08, 0.5, 0.08, mat(0x4a2e08), -0.6, 0.27,  0.32));
    gridGroup.add(box(0.08, 0.5, 0.08, mat(0x4a2e08),  0.6, 0.27,  0.32));
    // Open book on table
    gridGroup.add(box(0.4, 0.03, 0.5, mat(0xd4c8a8), 0, 0.59, 0));
    // Candles on table
    [[-0.5,0,0.2],[0.5,0,0.2]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.04, 0.04, 0.22, 5, mat(0xddddcc), x, 0.62, z));
      gridGroup.add(sph(0.05, 5, mat(0xff8800,0xcc4400,0.8), x, 0.75, z));
    });
    // Warm light over table
    const tableLight = new THREE.PointLight(0xffcc66, 1.62, 6);
    tableLight.position.set(0, 1.5, 0);
    lightGroup.add(tableLight);
  }

  function buildThroneProps(size, theme) {
    const h = size * CELL / 2;
    // Red carpet runner
    gridGroup.add(box(1.4, 0.04, size*CELL-2, mat(0x5a0808), 0, 0.12, 0));
    // Throne at far end
    const tx = 0, tz = -h+1.8;
    gridGroup.add(box(1.1, 1.6, 0.6, mat(0x2a1808), tx, 0.9, tz));   // back
    gridGroup.add(box(1.1, 0.14, 0.8, mat(0x2a1808), tx, 0.42, tz+0.15)); // seat
    gridGroup.add(box(0.14, 1.0, 0.6, mat(0x2a1808), tx-0.48, 0.64, tz)); // arm L
    gridGroup.add(box(0.14, 1.0, 0.6, mat(0x2a1808), tx+0.48, 0.64, tz)); // arm R
    // Gold trim on throne
    gridGroup.add(box(1.12, 0.08, 0.62, mat(0xaa8800,0x664400), tx, 1.72, tz));
    // Columns
    [[-3.5, 0, -4], [-3.5, 0, 0], [-3.5, 0, 4],
     [ 3.5, 0, -4], [ 3.5, 0, 0], [ 3.5, 0, 4]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.2, 0.25, 2.5, 8, mat(0x1a1010), x, 1.3, z));
      gridGroup.add(box(0.58, 0.12, 0.58, mat(0x221818), x, 2.6, z));
      gridGroup.add(box(0.58, 0.12, 0.58, mat(0x221818), x, 0.06, z));
    });
    // Red spotlight on throne
    const throneLight = new THREE.PointLight(0xff2200, 1.44, 6);
    throneLight.position.set(tx, 2.0, tz);
    lightGroup.add(throneLight);
  }

  function buildSewerProps(size, theme) {
    const h = size * CELL / 2;
    // Sewer channel (decorative depression visual)
    gridGroup.add(box(size*CELL-2, 0.04, 0.7, mat(0x0a1208,0x040808), 0, 0.11, 0));
    // Pipes on walls
    [[-h+0.3, 0, -2],[-h+0.3, 0, 2],[h-0.3, 0, -2],[h-0.3, 0, 2]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.1, 0.1, 2.4, 8, mat(0x303830), x, 0.8, z));
      gridGroup.add(cyl(0.13, 0.13, 0.1, 8, mat(0x282e28), x, 0.3, z));
      gridGroup.add(cyl(0.13, 0.13, 0.1, 8, mat(0x282e28), x, 1.3, z));
    });
    // Slime puddles
    [[-2,0,2],[1,0,-1],[-1,0,-3],[3,0,1]].forEach(([x,y,z]) => {
      gridGroup.add(box(0.6+Math.random()*0.4, 0.03, 0.4+Math.random()*0.3,
        mat(0x1a4a1a,0x0a220a,0.6), x, 0.12, z));
      const sL = new THREE.PointLight(0x22aa22, 0.54, 3);
      sL.position.set(x, 0.2, z);
      lightGroup.add(sL);
    });
    // Grate covers
    [[-3,0,0],[3,0,0]].forEach(([x,y,z]) => {
      for (let i=-1; i<=1; i++) {
        gridGroup.add(box(0.8, 0.04, 0.08, mat(0x282a28), x, 0.13, z+i*0.22));
        gridGroup.add(box(0.08, 0.04, 0.55, mat(0x282a28), x+i*0.22, 0.13, z));
      }
    });
  }

  function buildTempleProps(size, theme) {
    const h = size * CELL / 2;
    // Central altar
    gridGroup.add(box(1.8, 0.4, 1.0, mat(0x2e2c22), 0, 0.22, 0));
    gridGroup.add(box(1.6, 0.08, 0.8, mat(0x383626), 0, 0.44, 0));
    // Altar relief carvings
    gridGroup.add(box(1.62, 0.3, 0.04, mat(0x2a2820,0x060604), 0, 0.23, 0.52));
    // Braziers flanking altar
    [[-1.4, 0, 0], [1.4, 0, 0]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.08, 0.12, 0.6, 6, mat(0x484030), x, 0.35, z));
      gridGroup.add(cyl(0.2, 0.1, 0.2, 8, mat(0x484030), x, 0.72, z));
      gridGroup.add(sph(0.16, 8, mat(0xffee88,0xddaa22,0.9), x, 0.88, z));
      const bL = new THREE.PointLight(0xffee88, 1.8, 5);
      bL.position.set(x, 1.0, z);
      lightGroup.add(bL);
    });
    // Stone columns with gold caps
    [[-4,0,-4],[-4,0,4],[4,0,-4],[4,0,4]].forEach(([x,y,z]) => {
      gridGroup.add(cyl(0.28, 0.32, 2.8, 10, mat(0x201e18), x, 1.5, z));
      gridGroup.add(box(0.72, 0.14, 0.72, mat(0x383424), x, 2.92, z));
      gridGroup.add(box(0.6, 0.14, 0.6, mat(0x484232,0x221e10), x, 0.06, z));
    });
    // Holy glow from altar
    const holyLight = new THREE.PointLight(0xffffff, 1.26, 8);
    holyLight.position.set(0, 1.5, 0);
    lightGroup.add(holyLight);
  }

  function buildWorkshopProps(size, theme) {
    const h = size * CELL / 2;
    // Forge at one end
    const fx = 0, fz = -h+1.8;
    gridGroup.add(box(1.4, 0.7, 1.0, mat(0x181418), fx, 0.4, fz));
    gridGroup.add(box(1.2, 0.08, 0.8, mat(0x282228), fx, 0.78, fz));
    // Forge fire
    gridGroup.add(sph(0.22, 8, mat(0xff6600,0xff3300,0.9), fx, 0.95, fz));
    gridGroup.add(sph(0.14, 7, mat(0xffcc00,0xff6600,0.85), fx, 1.08, fz));
    const forgeL = new THREE.PointLight(0xff6600, 2.52, 7);
    forgeL.position.set(fx, 1.2, fz);
    lightGroup.add(forgeL);
    // Anvils
    [[2,0,1],[-2,0,1]].forEach(([x,y,z]) => {
      gridGroup.add(box(0.55, 0.16, 0.3, mat(0x383838,0x101010), x, 0.38, z));
      gridGroup.add(box(0.38, 0.26, 0.24, mat(0x282828,0x101010), x, 0.22, z));
    });
    // Gear/cog decorations on wall
    [[-2, 0, -h+0.3],[2, 0, -h+0.3]].forEach(([x,y,z]) => {
      const gearGeo = new THREE.TorusGeometry(0.35, 0.08, 6, 10);
      const gear = new THREE.Mesh(gearGeo, mat(0x303838,0x101010));
      gear.position.set(x, 1.2, z);
      gridGroup.add(gear);
    });
    // Crates
    [[h-1.5,0,-1],[h-1.5,0,1]].forEach(([x,y,z]) => {
      gridGroup.add(box(0.55, 0.55, 0.55, mat(0x3a2810), x, 0.3, z));
      gridGroup.add(box(0.57, 0.04, 0.57, mat(0x4a3818), x, 0.58, z));
      gridGroup.add(box(0.04, 0.57, 0.57, mat(0x4a3818), x, 0.3, z));
    });
    // Metal sparks glow
    const sparkL = new THREE.PointLight(0xff8800, 0.9, 5);
    sparkL.position.set(fx, 0.5, fz+1.5);
    lightGroup.add(sparkL);
  }

  // ─── Highlight overlays ────────────────────────────────────────────────────
  function updateHighlights() {
    highlightGroup.clear();
    if (!_combatGrid) return;
    const size = _combatGrid.size;

    // Move range cells (blue)
    for (const key of reachableCells) {
      const [x, z] = key.split(',').map(Number);
      const wx = x * CELL - size * CELL / 2 + CELL / 2;
      const wz = z * CELL - size * CELL / 2 + CELL / 2;
      const h = box(CELL*0.88, 0.09, CELL*0.88, matB(C.moveBlue, 0.42), wx, 0.17, wz);
      h.userData = { cellX:x, cellZ:z, isHighlight:true };
      highlightGroup.add(h);
      const b = box(CELL*0.91, 0.04, CELL*0.91, matB(C.moveEdge, 0.65), wx, 0.18, wz);
      b.userData = { cellX:x, cellZ:z, isHighlight:true };
      highlightGroup.add(b);
    }

    // Ability AoE range cells (purple)
    for (const key of abilityRangeCells) {
      const [x, z] = key.split(',').map(Number);
      const wx = x * CELL - size * CELL / 2 + CELL / 2;
      const wz = z * CELL - size * CELL / 2 + CELL / 2;
      const h = box(CELL*0.88, 0.10, CELL*0.88, matB(C.abilRange, 0.32), wx, 0.19, wz);
      h.userData = { cellX:x, cellZ:z, isAbilityRange:true };
      highlightGroup.add(h);
      const b = box(CELL*0.92, 0.04, CELL*0.92, matB(C.abilRangeEdge, 0.55), wx, 0.20, wz);
      b.userData = { cellX:x, cellZ:z, isAbilityRange:true };
      highlightGroup.add(b);
    }
  }

  function updateAttackHighlights() {
    for (const [id, grp] of Object.entries(entityMeshes)) {
      // In ability aim mode, hide regular attack rings
      const atk = _abilityAimMode ? false : attackableIds.has(id);
      grp.traverse(m => { if (m.isMesh && m.userData.isIndicator) m.visible = atk; });
    }
  }

  function updateAbilityTargetHighlights() {
    for (const [id, grp] of Object.entries(entityMeshes)) {
      const targetable = abilityTargetableIds.has(id);
      grp.traverse(m => { if (m.isMesh && m.userData.isAbilityIndicator) m.visible = targetable; });
    }
  }

  function updateActiveIndicator() {
    for (const [id, grp] of Object.entries(entityMeshes)) {
      const active = id === _currentTurnEntityId;
      grp.traverse(m => { if (m.isMesh && m.userData.isTurnIndicator) m.visible = active; });
    }
  }

  // ─── Player model ──────────────────────────────────────────────────────────
  function buildPlayerModel(classId) {
    const g = new THREE.Group();
    const body = { warrior:C.playerWarrior, mage:C.playerMage, rogue:C.playerRogue, cleric:C.playerCleric }[classId] || C.playerWarrior;
    const mB = mat(body, 0x060606);
    const mS = mat(C.playerSkin, 0x080604);
    const mA = mat(C.playerArmor, 0x030306);
    const mW = mat(0x9090a0, 0x181820);

    // Body subgroup (animated during attack)
    const bodyGrp = new THREE.Group();
    bodyGrp.userData.isBodyGroup = true;

    bodyGrp.add(box(0.22,0.46,0.22, mB, -0.12,0.23,0));
    bodyGrp.add(box(0.22,0.46,0.22, mB,  0.12,0.23,0));
    bodyGrp.add(box(0.56,0.52,0.38, mB, 0,0.72,0));
    bodyGrp.add(box(0.2,0.46,0.2, mB, -0.38,0.66,0));
    bodyGrp.add(box(0.2,0.46,0.2, mB,  0.38,0.66,0));
    bodyGrp.add(sph(0.23,7, mS, 0,1.12,0));

    if (classId === 'warrior') {
      bodyGrp.add(box(0.3,0.3,0.09, mA, 0,1.12,0.2));
      bodyGrp.add(box(0.06,0.6,0.06, mW, 0.56,0.82,0));
      bodyGrp.add(box(0.22,0.06,0.06, mW, 0.56,1.06,0));
    } else if (classId === 'mage') {
      bodyGrp.add(box(0.28,0.15,0.28, mB, 0,1.28,0));
      bodyGrp.add(cyl(0.04,0.15,0.38,6,mB,0,1.54,0));
      bodyGrp.add(box(0.04,0.72,0.04, mW, 0.46,0.88,0));
      bodyGrp.add(sph(0.1,7,mat(0x4488ff,0x2255cc),0.46,1.28,0));
    } else if (classId === 'rogue') {
      bodyGrp.add(box(0.3,0.22,0.1,mat(0x181820),0,1.12,0.16));
      bodyGrp.add(box(0.03,0.32,0.03,mW,-0.52,0.66,0.1));
      bodyGrp.add(box(0.03,0.32,0.03,mW, 0.52,0.66,0.1));
    } else if (classId === 'cleric') {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28,0.022,6,18), mat(0xddaa00,0x886600));
      halo.position.set(0,1.48,0); halo.rotation.x = Math.PI/2;
      bodyGrp.add(halo);
      bodyGrp.add(cyl(0.04,0.04,0.58,6,mW,0.5,0.88,0));
      bodyGrp.add(sph(0.11,7,mat(0x888898,0x202030),0.5,1.22,0));
    }

    g.add(bodyGrp);

    // Turn ring
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4,0.032,6,22), mat(C.turnGold,0x886600));
    ring.rotation.x = Math.PI/2; ring.position.y = 0.07;
    ring.userData.isTurnIndicator = true; ring.visible = false;
    g.add(ring);

    // Attack indicator ring
    const atkR = new THREE.Mesh(new THREE.TorusGeometry(0.44,0.045,6,22), mat(C.atkRed,0x660000));
    atkR.rotation.x = Math.PI/2; atkR.position.y = 0.06;
    atkR.userData.isIndicator = true; atkR.visible = false;
    g.add(atkR);

    // Ability target indicator ring (teal)
    const abilR = new THREE.Mesh(new THREE.TorusGeometry(0.48,0.04,6,22), mat(C.abilTeal,0x004438));
    abilR.rotation.x = Math.PI/2; abilR.position.y = 0.055;
    abilR.userData.isAbilityIndicator = true; abilR.visible = false;
    g.add(abilR);

    return g;
  }

  // ─── Enemy model ───────────────────────────────────────────────────────────
  function buildEnemyModel(typeId, isBoss) {
    const g = new THREE.Group();
    const sc = isBoss ? 1.45 : 1.0;
    const mB = mat(C.enemyBase, 0x1e0303);
    const mH = mat(C.enemyHead, 0x260303);
    const mE = mat(C.enemyEye,  0x880000);
    const mD = mat(C.enemyDark, 0x0e0202);

    const bodyGrp = new THREE.Group();
    bodyGrp.userData.isBodyGroup = true;

    const isSp   = ['giant_spider','spider_queen'].includes(typeId);
    const isFly  = ['cave_bat','harpy'].includes(typeId);
    const isMag  = ['dark_mage','lich','shadow','chaos_lord','witch'].includes(typeId);
    const isLrg  = ['troll','frost_giant','golem','dragon_boss'].includes(typeId);
    const isSkel = ['skeleton','zombie'].includes(typeId);

    if (isSp) {
      bodyGrp.add(sph(0.27*sc,8,mB,0,0.24,0));
      bodyGrp.add(sph(0.19*sc,7,mH,0,0.45,0.12));
      bodyGrp.add(box(0.07,0.07,0.025,mE,-0.1,0.49,0.28));
      bodyGrp.add(box(0.07,0.07,0.025,mE, 0.1,0.49,0.28));
      for (let i=0;i<4;i++) {
        const s=i<2?-1:1, a=(i/4)*Math.PI-Math.PI/8;
        const leg=box(0.38*sc,0.045,0.045,mD,s*0.32,0.22,Math.cos(a)*0.32);
        leg.rotation.z=s*(Math.PI/6+i*0.1); bodyGrp.add(leg);
      }
    } else if (isFly) {
      bodyGrp.add(sph(0.22*sc,7,mB,0,0.42,0));
      bodyGrp.add(sph(0.15*sc,6,mH,0,0.65,0.08));
      bodyGrp.add(box(0.065,0.065,0.025,mE,-0.07,0.68,0.22));
      bodyGrp.add(box(0.065,0.065,0.025,mE, 0.07,0.68,0.22));
      const mWg=mat(C.enemyDark,0,0.75);
      bodyGrp.add(box(0.55*sc,0.045,0.32*sc,mWg,-0.38,0.48,0));
      bodyGrp.add(box(0.55*sc,0.045,0.32*sc,mWg, 0.38,0.48,0));
    } else if (isMag) {
      bodyGrp.add(cyl(0.24*sc,0.3*sc,0.72*sc,8,mB,0,0.38,0));
      bodyGrp.add(sph(0.24*sc,7,mH,0,0.86,0));
      bodyGrp.add(box(0.11,0.1,0.025,mE,-0.1,0.88,0.22));
      bodyGrp.add(box(0.11,0.1,0.025,mE, 0.1,0.88,0.22));
      bodyGrp.add(sph(0.11,8,mat(0x8822ff,0x5511cc),0.38,0.88,0));
      // Floating runes around body
      for (let i=0;i<3;i++) {
        const a=i*Math.PI*2/3;
        bodyGrp.add(box(0.1,0.06,0.02,mat(0x8822ff,0x5511cc,0.8),
          Math.cos(a)*0.45,0.55+i*0.1,Math.sin(a)*0.45));
      }
    } else if (isLrg) {
      bodyGrp.add(box(0.8*sc,0.68*sc,0.58*sc,mB,0,0.5,0));
      bodyGrp.add(sph(0.35*sc,7,mH,0,1.05,0));
      bodyGrp.add(box(0.13,0.11,0.025,mE,-0.14,1.1,0.3));
      bodyGrp.add(box(0.13,0.11,0.025,mE, 0.14,1.1,0.3));
      bodyGrp.add(box(0.3*sc,0.64*sc,0.28*sc,mD,-0.58,0.5,0));
      bodyGrp.add(box(0.3*sc,0.64*sc,0.28*sc,mD, 0.58,0.5,0));
      bodyGrp.add(box(0.38*sc,0.58*sc,0.35*sc,mD,-0.14,0.13,0));
      bodyGrp.add(box(0.38*sc,0.58*sc,0.35*sc,mD, 0.14,0.13,0));
    } else if (isSkel) {
      bodyGrp.add(box(0.4*sc,0.44,0.32,mB,0,0.58,0));
      bodyGrp.add(sph(0.21*sc,7,mat(0x9a9880),0,0.94,0));
      bodyGrp.add(box(0.11,0.09,0.025,mE,-0.09,0.97,0.19));
      bodyGrp.add(box(0.11,0.09,0.025,mE, 0.09,0.97,0.19));
      bodyGrp.add(box(0.17,0.52,0.17,mB,-0.14,0.22,0));
      bodyGrp.add(box(0.17,0.52,0.17,mB, 0.14,0.22,0));
    } else {
      bodyGrp.add(box(0.23,0.46,0.23,mD,-0.13,0.24,0));
      bodyGrp.add(box(0.23,0.46,0.23,mD, 0.13,0.24,0));
      bodyGrp.add(box(0.54,0.5,0.38,mB,0,0.72,0));
      bodyGrp.add(box(0.21,0.46,0.21,mD,-0.38,0.66,0));
      bodyGrp.add(box(0.21,0.46,0.21,mD, 0.38,0.66,0));
      bodyGrp.add(sph(0.22,7,mH,0,1.08,0));
      bodyGrp.add(box(0.1,0.09,0.025,mE,-0.09,1.11,0.2));
      bodyGrp.add(box(0.1,0.09,0.025,mE, 0.09,1.11,0.2));
    }

    g.add(bodyGrp);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42,0.033,6,22), mat(C.turnGold,0x886600));
    ring.rotation.x=Math.PI/2; ring.position.y=0.05;
    ring.userData.isTurnIndicator=true; ring.visible=false; g.add(ring);

    const atkR = new THREE.Mesh(new THREE.TorusGeometry(0.46,0.05,6,22), mat(C.atkRed,0x660000));
    atkR.rotation.x=Math.PI/2; atkR.position.y=0.04;
    atkR.userData.isIndicator=true; atkR.visible=false; g.add(atkR);

    // Ability target indicator ring (teal)
    const abilR = new THREE.Mesh(new THREE.TorusGeometry(0.50,0.04,6,22), mat(C.abilTeal,0x004438));
    abilR.rotation.x=Math.PI/2; abilR.position.y=0.035;
    abilR.userData.isAbilityIndicator=true; abilR.visible=false; g.add(abilR);

    return g;
  }

  // ─── Entity head height (for label placement) ──────────────────────────────
  function getHeadY(isEnemy, typeId, isBoss) {
    if (!isEnemy) return 1.38;
    const sc = isBoss ? 1.45 : 1.0;
    if (['cave_bat','harpy'].includes(typeId)) return 0.75*sc;
    if (['giant_spider','spider_queen'].includes(typeId)) return 0.55*sc;
    if (['troll','frost_giant','golem','dragon_boss'].includes(typeId)) return 1.2*sc;
    if (['dark_mage','lich','shadow','chaos_lord','witch'].includes(typeId)) return 1.0*sc;
    return 1.18*sc;
  }

  // ─── World conversion ──────────────────────────────────────────────────────
  function gridToWorld(x, z) {
    const sz = _combatGrid ? _combatGrid.size : GRID_SIZE;
    return { wx: x*CELL - sz*CELL/2 + CELL/2, wz: z*CELL - sz*CELL/2 + CELL/2 };
  }

  // ─── Animation system ──────────────────────────────────────────────────────
  function triggerAnim(id, type) {
    anims[id] = { type, t:0, dur: type==='hurt'?0.35 : type==='attack'?0.5 : 0.4 };
  }

  function tickAnims(dt) {
    for (const [id, anim] of Object.entries(anims)) {
      anim.t += dt;
      const grp = entityMeshes[id];
      if (!grp) { delete anims[id]; continue; }
      const prog = Math.min(1, anim.t / anim.dur);
      const bodyGrp = grp.children.find(c => c.userData.isBodyGroup) || grp;

      if (prog >= 1) {
        bodyGrp.rotation.set(0,0,0);
        bodyGrp.position.set(0,0,0);
        grp.position.y = grp.userData.baseY ?? 0;
        delete anims[id]; continue;
      }

      if (anim.type === 'attack') {
        // Lunge forward and snap back
        const wave = Math.sin(prog * Math.PI);
        bodyGrp.rotation.x = -wave * 0.45;
        grp.position.y = (grp.userData.baseY??0) + wave * 0.15;
      } else if (anim.type === 'hurt') {
        // Shake sideways + red flash already applied via material
        bodyGrp.position.x = Math.sin(prog * Math.PI * 5) * 0.07;
      } else if (anim.type === 'cast') {
        const wave = Math.sin(prog * Math.PI * 2);
        grp.position.y = (grp.userData.baseY??0) + Math.abs(wave) * 0.2;
      }
    }
  }

  // ─── Full state update ─────────────────────────────────────────────────────
  function updateState(state, mySocketId) {
    if (!scene) return;
    _mySocketId = mySocketId;
    const room = state.currentRoom;
    if (!room || (room.type !== 'combat' && room.type !== 'boss')) return;

    _combatGrid = room.combatGrid;
    _prevTurnEntityId = _currentTurnEntityId;
    _currentTurnEntityId = room.currentTurnEntityId;

    const me = state.players.find(p => p.socketId === mySocketId);
    _myCharacter = me?.character || null;
    _players = state.players.filter(p => p.character);
    _enemies = room.enemies || [];

    if (_combatGrid && gridGroup.children.length === 0) {
      buildGrid(_combatGrid);
    }

    syncEntities();
    computeHighlights();
    updateHighlights();
    updateAttackHighlights();
    updateAbilityTargetHighlights();
    updateActiveIndicator();

    // Trigger attack animation on enemy when it's their turn (they just got their turn)
    if (_currentTurnEntityId !== _prevTurnEntityId && _currentTurnEntityId) {
      const isEnemyTurn = _enemies.some(e => e.id === _currentTurnEntityId && e.isAlive);
      if (isEnemyTurn) {
        const isMagEnemy = _enemies.find(e => e.id === _currentTurnEntityId);
        const isMag = isMagEnemy && ['dark_mage','lich','shadow','chaos_lord','witch'].includes(isMagEnemy.typeId);
        triggerAnim(_currentTurnEntityId, isMag ? 'cast' : 'attack');
      }
    }
  }

  function syncEntities() {
    const alive = new Set();

    for (const p of _players) {
      const ch = p.character;
      if (!ch || ch.gridX === undefined) continue;
      const id = p.socketId;
      alive.add(id);
      const { wx, wz } = gridToWorld(ch.gridX, ch.gridZ);

      // Detect HP change for hurt animation
      if (entityHpCache[id] !== undefined && ch.hp < entityHpCache[id] && ch.isAlive) {
        triggerAnim(id, 'hurt');
      }
      entityHpCache[id] = ch.hp;

      if (!entityMeshes[id]) {
        const model = buildPlayerModel(ch.classId);
        model.position.set(wx, 0, wz);
        model.userData = { entityId:id, isPlayer:true };
        model.userData.baseY = 0;
        entityGroup.add(model);
        entityMeshes[id] = model;

        // Label
        const headY = getHeadY(false, null, false);
        const lbl = createLabel(id, p.name||'Player', ch.hp, ch.maxHp, false, ch.isAlive, headY);
        model.add(lbl);
      } else {
        entityMeshes[id].userData.targetPos = new THREE.Vector3(wx, entityMeshes[id].userData.baseY??0, wz);
        updateLabel(id, p.name||'Player', ch.hp, ch.maxHp, false, ch.isAlive);
      }

      // Opacity
      entityMeshes[id].traverse(m => {
        if (m.isMesh && !m.userData.isTurnIndicator && !m.userData.isIndicator && !m.isSprite) {
          m.material.opacity = ch.isAlive ? 1 : 0.3;
          m.material.transparent = !ch.isAlive;
        }
      });
    }

    for (const e of _enemies) {
      if (e.gridX === undefined) continue;
      const id = e.id;
      alive.add(id);
      const { wx, wz } = gridToWorld(e.gridX, e.gridZ);

      if (entityHpCache[id] !== undefined && e.hp < entityHpCache[id] && e.isAlive) {
        triggerAnim(id, 'hurt');
      }
      entityHpCache[id] = e.hp;

      if (!entityMeshes[id]) {
        const model = buildEnemyModel(e.typeId, e.isBoss);
        model.position.set(wx, 0, wz);
        model.userData = { entityId:id, isEnemy:true, typeId:e.typeId };
        model.userData.baseY = 0;
        entityGroup.add(model);
        entityMeshes[id] = model;

        const headY = getHeadY(true, e.typeId, e.isBoss);
        const lbl = createLabel(id, e.name||e.typeId, e.hp, e.maxHp, true, e.isAlive, headY);
        model.add(lbl);
      } else {
        entityMeshes[id].userData.targetPos = new THREE.Vector3(wx, entityMeshes[id].userData.baseY??0, wz);
        updateLabel(id, e.name||e.typeId, e.hp, e.maxHp, true, e.isAlive);
      }

      entityMeshes[id].traverse(m => {
        if (m.isMesh && !m.userData.isTurnIndicator && !m.userData.isIndicator && !m.isSprite) {
          m.material.opacity = e.isAlive ? 1 : 0.22;
          m.material.transparent = !e.isAlive;
        }
      });
    }

    // Remove stale
    for (const id of Object.keys(entityMeshes)) {
      if (!alive.has(id)) {
        entityGroup.remove(entityMeshes[id]);
        delete entityMeshes[id];
        delete entityLabels[id];
        delete entityHpCache[id];
      }
    }
  }

  // ─── BFS / highlight compute ───────────────────────────────────────────────
  function computeHighlights() {
    reachableCells.clear();
    attackableIds.clear();
    abilityRangeCells.clear();
    abilityTargetableIds.clear();

    if (!_myCharacter || !_combatGrid) return;
    if (_currentTurnEntityId !== _mySocketId) return;
    if (!_myCharacter.isAlive) return;
    const { gridX, gridZ, hasMoved, hasActed } = _myCharacter;
    if (gridX === undefined) return;

    // Movement range
    if (!hasMoved && !hasActed) {
      reachableCells = bfs(gridX, gridZ, getMoveRange(_myCharacter));
    }

    // Ability aim mode overrides attack highlights
    if (_abilityAimMode) {
      const { maxRange, rangeType } = _abilityAimMode;
      if (rangeType === 'ranged-aoe') {
        // Fill cells within maxRange for AoE targeting
        for (let x = 0; x < _combatGrid.size; x++) {
          for (let z = 0; z < _combatGrid.size; z++) {
            if (_combatGrid.grid[x][z] !== 'floor') continue;
            if (Math.hypot(x - gridX, z - gridZ) <= maxRange + 0.01) {
              abilityRangeCells.add(`${x},${z}`);
            }
          }
        }
      } else if (rangeType === 'ranged-single') {
        // Mark enemies within maxRange as targetable
        for (const e of _enemies) {
          if (!e.isAlive || e.gridX === undefined) continue;
          if (Math.hypot(e.gridX - gridX, e.gridZ - gridZ) <= maxRange + 0.01) {
            abilityTargetableIds.add(e.id);
          }
        }
      }
      return; // skip normal attack highlights in aim mode
    }

    // Normal attack range
    const atkR = getAttackRange(_myCharacter);
    for (const e of _enemies) {
      if (!e.isAlive || e.gridX === undefined) continue;
      if (Math.hypot(e.gridX-gridX, e.gridZ-gridZ) <= atkR+0.01) attackableIds.add(e.id);
    }
  }

  function getMoveRange(ch) {
    let r=3;
    if (ch.speed) r += Math.floor(ch.speed/4);
    if (ch.effects?.some(e=>e.type==='slow')) r=Math.max(1,r-1);
    return r;
  }
  function getAttackRange(ch) {
    if (ch.classId==='mage') return 5;
    if (ch.classId==='cleric') return 2;
    return 1.5;
  }

  function bfs(fx, fz, range) {
    const reach = new Set(), vis = new Map(), q = [[fx,fz,0]];
    const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    const sz = _combatGrid.size;
    while (q.length) {
      const [x,z,d] = q.shift();
      const k = `${x},${z}`;
      if (vis.has(k) && vis.get(k)<=d) continue;
      vis.set(k,d);
      if (d>0) reach.add(k);
      if (d>=range) continue;
      for (const [dx,dz] of DIRS) {
        const nx=x+dx, nz=z+dz;
        if (nx<0||nz<0||nx>=sz||nz>=sz) continue;
        if (_combatGrid.grid[nx][nz]!=='floor') continue;
        const occ = _players.some(p=>{ const c=p.character; return c&&c.gridX===nx&&c.gridZ===nz; }) ||
                    _enemies.some(e=>e.isAlive&&e.gridX===nx&&e.gridZ===nz);
        if (occ) continue;
        const nk=`${nx},${nz}`, nd=d+1;
        if (!vis.has(nk)||vis.get(nk)>nd) q.push([nx,nz,nd]);
      }
    }
    return reach;
  }

  // ─── Input handling ────────────────────────────────────────────────────────
  function onPointerDown(ev) {
    if (!renderer||!scene||!camera) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX-rect.left)/rect.width)*2-1;
    mouse.y = -((ev.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(mouse, camera);

    // ── Ranged AoE aim mode: click a cell in ability range ─────────────────
    if (_abilityAimMode?.rangeType === 'ranged-aoe') {
      const floors = [];
      gridGroup.traverse(m => { if (m.isMesh && m.userData.isFloor) floors.push(m); });
      highlightGroup.traverse(m => { if (m.isMesh && (m.userData.isHighlight || m.userData.isAbilityRange)) floors.push(m); });
      const fh = raycaster.intersectObjects(floors);
      if (fh.length) {
        const { cellX:cx, cellZ:cz } = fh[0].object.userData;
        if (cx !== undefined && abilityRangeCells.has(`${cx},${cz}`) && onCellClick) {
          onCellClick(cx, cz);
        }
      }
      return;
    }

    // ── Ranged single aim mode: click an in-range enemy ────────────────────
    if (_abilityAimMode?.rangeType === 'ranged-single') {
      const ents = [];
      entityGroup.traverse(m => {
        if (m.isMesh && !m.userData.isTurnIndicator && !m.userData.isIndicator &&
            !m.userData.isAbilityIndicator && !m.isSprite) ents.push(m);
      });
      const eh = raycaster.intersectObjects(ents);
      if (eh.length) {
        let o = eh[0].object;
        while (o && !o.userData.entityId) o = o.parent;
        if (o?.userData.entityId && o.userData.isEnemy &&
            abilityTargetableIds.has(o.userData.entityId) && onEntityClick) {
          onEntityClick(o.userData.entityId, true);
        }
      }
      return;
    }

    // ── Normal mode ─────────────────────────────────────────────────────────
    const ents = [];
    entityGroup.traverse(m => { if (m.isMesh&&!m.userData.isTurnIndicator&&!m.userData.isIndicator&&!m.userData.isAbilityIndicator&&!m.isSprite) ents.push(m); });
    const eh = raycaster.intersectObjects(ents);
    if (eh.length) {
      let o = eh[0].object;
      while (o && !o.userData.entityId) o = o.parent;
      if (o?.userData.entityId) {
        if (o.userData.isEnemy && attackableIds.has(o.userData.entityId) && onEntityClick) {
          onEntityClick(o.userData.entityId, true);
          return;
        }
      }
    }

    // Floor hit test
    const floors = [];
    gridGroup.traverse(m => { if (m.isMesh&&m.userData.isFloor) floors.push(m); });
    highlightGroup.traverse(m => { if (m.isMesh&&m.userData.isHighlight) floors.push(m); });
    const fh = raycaster.intersectObjects(floors);
    if (fh.length) {
      const { cellX:cx, cellZ:cz } = fh[0].object.userData;
      if (cx!==undefined && reachableCells.has(`${cx},${cz}`) && onCellClick) onCellClick(cx,cz);
    }
  }

  function onPointerMove(ev) {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    raycaster.setFromCamera({
      x: ((ev.clientX-rect.left)/rect.width)*2-1,
      y: -((ev.clientY-rect.top)/rect.height)*2+1
    }, camera);
    const fs = [];
    gridGroup.traverse(m => { if (m.isMesh&&m.userData.isFloor) fs.push(m); });
    const h = raycaster.intersectObjects(fs);
    hoveredCell = h.length ? { x:h[0].object.userData.cellX, z:h[0].object.userData.cellZ } : null;
  }

  // ─── Ability Visual Effects ───────────────────────────────────────────────
  function tickAbilityEffects(dt) {
    if (!effectGroup) return;
    for (let i = abilityEffects.length - 1; i >= 0; i--) {
      const fx = abilityEffects[i];
      fx.t += dt;
      fx.tick.call(fx, fx.t, dt);
      if (fx.done) {
        fx.objects.forEach(o => effectGroup.remove(o));
        abilityEffects.splice(i, 1);
      }
    }
  }

  function _spawnFx(objects, tickFn) {
    if (!effectGroup) return;
    objects.forEach(o => effectGroup.add(o));
    abilityEffects.push({ t: 0, done: false, objects, tick: tickFn });
  }

  function _fxPos(gx, gz, y = 0.45) {
    const { wx, wz } = gridToWorld(gx, gz);
    return new THREE.Vector3(wx, y, wz);
  }

  function _fxFireball(from, to) {
    const ballMat = new THREE.MeshBasicMaterial({ color: 0xff5500 });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), ballMat);
    ball.position.copy(from);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.45 });
    ball.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), glowMat));
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.07, 5, 14), ringMat);
    ring.rotation.x = Math.PI / 2; ring.visible = false;
    const FLY = 0.55, EXP = 0.45;
    let phase = 0; const sparks = [];
    _spawnFx([ball, ring], function(t, dt) {
      if (phase === 0) {
        const p = Math.min(1, t / FLY);
        ball.position.lerpVectors(from, to, p);
        ball.position.y = from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * 1.8;
        if (p >= 1) {
          phase = 1; this.t = 0;
          ball.visible = false;
          ring.position.set(to.x, 0.15, to.z); ring.visible = true;
          for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2;
            const sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 4, 4),
              new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true }));
            sp.position.set(to.x, 0.3, to.z);
            sp.userData = { vx: Math.cos(a) * 2.2, vy: 2.2, vz: Math.sin(a) * 2.2 };
            effectGroup.add(sp); this.objects.push(sp); sparks.push(sp);
          }
        }
      } else {
        const p = Math.min(1, t / EXP);
        ring.scale.setScalar(1 + p * 6); ringMat.opacity = (1 - p) * 0.85;
        for (const sp of sparks) {
          sp.userData.vy -= 5 * dt;
          sp.position.x += sp.userData.vx * dt;
          sp.position.y += sp.userData.vy * dt;
          sp.position.z += sp.userData.vz * dt;
          sp.material.opacity = 1 - p;
        }
        if (p >= 1) this.done = true;
      }
    });
  }

  function _fxIceLance(from, to) {
    const spikeMat = new THREE.MeshBasicMaterial({ color: 0x88ddff });
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.52, 6), spikeMat);
    spike.position.copy(from);
    // Orient cone tip toward target
    const dir = new THREE.Vector3().subVectors(to, from).normalize();
    spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xaaeeff, transparent: true, opacity: 0.4 });
    spike.add(new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 6), glowMat));
    const FLY = 0.32, SHAT = 0.38;
    let phase = 0; const shards = [];
    _spawnFx([spike], function(t, dt) {
      if (phase === 0) {
        const p = Math.min(1, t / FLY);
        spike.position.lerpVectors(from, to, p);
        spike.position.y = from.y + (to.y - from.y) * p;
        if (p >= 1) {
          phase = 1; this.t = 0; spike.visible = false;
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2;
            const sh = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.04),
              new THREE.MeshBasicMaterial({ color: 0x88ddff, transparent: true }));
            sh.position.set(to.x, 0.3, to.z);
            sh.userData = { vx: Math.cos(a) * 1.8, vy: 2 + Math.random(), vz: Math.sin(a) * 1.8 };
            effectGroup.add(sh); this.objects.push(sh); shards.push(sh);
          }
        }
      } else {
        const p = Math.min(1, t / SHAT);
        for (const sh of shards) {
          sh.userData.vy -= 5 * dt;
          sh.position.x += sh.userData.vx * dt;
          sh.position.y += sh.userData.vy * dt;
          sh.position.z += sh.userData.vz * dt;
          sh.rotation.x += dt * 5; sh.rotation.z += dt * 3;
          sh.material.opacity = 1 - p;
        }
        if (p >= 1) this.done = true;
      }
    });
  }

  function _fxChainLightning(from, to) {
    const groups = [];
    const DUR = 0.5;
    let active = 0, nextSwitch = 0.06;
    for (let b = 0; b < 3; b++) {
      const g = new THREE.Group();
      const SEGS = 7;
      for (let i = 0; i < SEGS; i++) {
        const t0 = i / SEGS, t1 = (i + 1) / SEGS;
        const p0 = new THREE.Vector3().lerpVectors(from, to, t0);
        const p1 = new THREE.Vector3().lerpVectors(from, to, t1);
        if (i > 0 && i < SEGS - 1) {
          p0.x += (Math.random() - 0.5) * 0.5;
          p0.y += (Math.random() - 0.5) * 0.35;
          p0.z += (Math.random() - 0.5) * 0.5;
        }
        const len = p0.distanceTo(p1);
        const mid = p0.clone().add(p1).multiplyScalar(0.5);
        const segDir = new THREE.Vector3().subVectors(p1, p0).normalize();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, len, 4),
          new THREE.MeshBasicMaterial({ color: 0xbbf0ff, transparent: true, opacity: b === 0 ? 0.9 : 0 }));
        seg.position.copy(mid);
        seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), segDir);
        g.add(seg);
      }
      groups.push(g);
    }
    _spawnFx(groups, function(t, dt) {
      const fade = t > DUR * 0.55 ? Math.max(0, 1 - (t - DUR * 0.55) / (DUR * 0.45)) : 1;
      groups.forEach((g, idx) => g.traverse(m => {
        if (m.isMesh) m.material.opacity = idx === active ? fade * 0.9 : 0;
      }));
      if (t >= nextSwitch) { active = (active + 1) % 3; nextSwitch += 0.06; }
      if (t >= DUR) this.done = true;
    });
  }

  function _fxSmokeBomb(from, to) {
    const bombMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const bomb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), bombMat);
    bomb.position.copy(from);
    const FLY = 0.45, CLOUD = 0.6;
    let phase = 0; const clouds = [];
    _spawnFx([bomb], function(t, dt) {
      if (phase === 0) {
        const p = Math.min(1, t / FLY);
        bomb.position.lerpVectors(from, to, p);
        bomb.position.y = from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * 1.4;
        if (p >= 1) {
          phase = 1; this.t = 0; bomb.visible = false;
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            const cl = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6),
              new THREE.MeshBasicMaterial({ color: 0x334433, transparent: true, opacity: 0.75 }));
            cl.position.set(to.x + Math.cos(a) * 0.3, 0.4, to.z + Math.sin(a) * 0.3);
            cl.userData = { ox: Math.cos(a), oz: Math.sin(a) };
            effectGroup.add(cl); this.objects.push(cl); clouds.push(cl);
          }
        }
      } else {
        const p = Math.min(1, t / CLOUD);
        for (const cl of clouds) {
          cl.scale.setScalar(1 + p * 4);
          cl.position.x = to.x + cl.userData.ox * (0.3 + p * 1.2);
          cl.position.z = to.z + cl.userData.oz * (0.3 + p * 1.2);
          cl.position.y = 0.4 + p * 0.5;
          cl.material.opacity = 0.75 * (1 - p * 0.9);
        }
        if (p >= 1) this.done = true;
      }
    });
  }

  function _fxHolySmite(from, to) {
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 4, 8), beamMat);
    beam.position.set(to.x, 2.3, to.z);
    const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    const flash = new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), flashMat);
    flash.rotation.x = -Math.PI / 2; flash.position.set(to.x, 0.18, to.z);
    const DUR = 0.55;
    _spawnFx([beam, flash], function(t, dt) {
      const p = Math.min(1, t / DUR);
      beamMat.opacity = p < 0.3 ? (p / 0.3) * 0.85 : (1 - (p - 0.3) / 0.7) * 0.85;
      beam.scale.y = 1 + Math.sin(p * Math.PI) * 0.3;
      flash.scale.setScalar(1 + p * 6); flashMat.opacity = (1 - p) * 0.9;
      if (p >= 1) this.done = true;
    });
  }

  function _fxCurse(from, to) {
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x8800cc });
    const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), orbMat);
    orb.position.copy(from);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xcc00ff, transparent: true, opacity: 0.4 });
    orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), glowMat));
    const swirlMat = new THREE.MeshBasicMaterial({ color: 0x8800cc, transparent: true, opacity: 0 });
    const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.04, 5, 14), swirlMat);
    swirl.position.set(to.x, 0.2, to.z);
    const FLY = 0.5, IMPACT = 0.45;
    let phase = 0;
    _spawnFx([orb, swirl], function(t, dt) {
      if (phase === 0) {
        const p = Math.min(1, t / FLY);
        orb.position.lerpVectors(from, to, p);
        orb.position.y = from.y + (to.y - from.y) * p + Math.sin(p * Math.PI) * 1.0;
        orb.rotation.y += dt * 5;
        if (p >= 1) { phase = 1; this.t = 0; orb.visible = false; swirlMat.opacity = 0.85; }
      } else {
        const p = Math.min(1, t / IMPACT);
        swirl.scale.setScalar(1 + p * 5); swirl.rotation.y += dt * 6;
        swirlMat.opacity = 0.85 * (1 - p);
        if (p >= 1) this.done = true;
      }
    });
  }

  function triggerAbilityEffect(abilityId, fromGX, fromGZ, toGX, toGZ) {
    if (!effectGroup || !_combatGrid) return;
    const from = _fxPos(fromGX, fromGZ, 0.6);
    const to   = _fxPos(toGX,   toGZ,   0.4);
    switch (abilityId) {
      case 'fireball':        _fxFireball(from, to);       break;
      case 'ice_lance':       _fxIceLance(from, to);       break;
      case 'chain_lightning': _fxChainLightning(from, to); break;
      case 'smoke_bomb':      _fxSmokeBomb(from, to);      break;
      case 'holy_smite':      _fxHolySmite(from, to);      break;
      case 'curse':           _fxCurse(from, to);          break;
    }
  }

  // ─── Mount / unmount ───────────────────────────────────────────────────────
  function mount(containerEl, callbacks = {}) {
    if (renderer) unmount();
    container = containerEl;
    onCellClick   = callbacks.onCellClick   || null;
    onEntityClick = callbacks.onEntityClick || null;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060408);
    scene.fog = new THREE.Fog(0x060408, 16, 30);

    const w = container.clientWidth  || 700;
    const h = container.clientHeight || 480;
    camera = new THREE.PerspectiveCamera(52, w/h, 0.1, 60);
    camera.position.set(0, 11, 10);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Base lights (overridden by theme)
    scene.add(new THREE.AmbientLight(0x201810, 1.98));
    const dl = new THREE.DirectionalLight(0xffeedd, 0.9);
    dl.position.set(5, 10, 8);
    scene.add(dl);

    gridGroup      = new THREE.Group();
    entityGroup    = new THREE.Group();
    highlightGroup = new THREE.Group();
    labelGroup     = new THREE.Group();
    lightGroup     = new THREE.Group();
    effectGroup    = new THREE.Group();
    scene.add(gridGroup, entityGroup, highlightGroup, labelGroup, lightGroup, effectGroup);

    raycaster = new THREE.Raycaster();
    mouse     = new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown',  onPointerDown);
    renderer.domElement.addEventListener('pointermove',  onPointerMove);

    const ro = new ResizeObserver(() => {
      if (!renderer) return;
      const nw = container.clientWidth, nh = container.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw/nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);
    renderer._ro = ro;

    let t = 0, last = performance.now();
    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt  = Math.min((now-last)/1000, 0.05);
      last = now;
      t += dt;

      // Lerp positions
      entityGroup.children.forEach(grp => {
        if (grp.userData.targetPos) {
          grp.position.lerp(grp.userData.targetPos, 0.14);
          if (grp.position.distanceTo(grp.userData.targetPos) < 0.008) {
            grp.position.copy(grp.userData.targetPos);
            delete grp.userData.targetPos;
          }
        }
      });

      // Animations
      tickAnims(dt);
      tickAbilityEffects(dt);

      // Pulse turn indicator rings
      entityGroup.children.forEach(grp => {
        grp.traverse(m => {
          if (m.userData.isTurnIndicator && m.visible) {
            m.material.emissiveIntensity = 0.5 + Math.sin(t*4.5)*0.35;
            m.rotation.y += dt * 1.2;
          }
        });
      });

      // Flicker torch lights
      lightGroup.children.forEach((l, i) => {
        if (l.isPointLight) {
          if (l.userData.baseIntensity === undefined) l.userData.baseIntensity = l.intensity;
          l.intensity = l.userData.baseIntensity * (0.88 + Math.abs(Math.sin(t*5.5+i*1.7))*0.25);
        }
      });

      renderer.render(scene, camera);
    }
    animate();
  }

  function unmount() {
    if (animId) cancelAnimationFrame(animId);
    if (renderer) {
      renderer._ro?.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.dispose();
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
    }
    renderer=scene=camera=gridGroup=entityGroup=highlightGroup=labelGroup=lightGroup=null;
    if (effectGroup) effectGroup.clear();
    effectGroup = null;
    abilityEffects.length = 0;
    Object.keys(entityMeshes).forEach(k=>delete entityMeshes[k]);
    Object.keys(entityLabels).forEach(k=>delete entityLabels[k]);
    Object.keys(entityHpCache).forEach(k=>delete entityHpCache[k]);
    Object.keys(anims).forEach(k=>delete anims[k]);
    _combatGrid=null; reachableCells.clear(); attackableIds.clear();
    abilityRangeCells.clear(); abilityTargetableIds.clear(); _abilityAimMode=null; animId=null;
  }

  function setAbilityAimMode(cfg) {
    _abilityAimMode = cfg;
    computeHighlights();
    updateHighlights();
    updateAttackHighlights();
    updateAbilityTargetHighlights();
  }

  function clearAbilityAimMode() {
    _abilityAimMode = null;
    abilityRangeCells.clear();
    abilityTargetableIds.clear();
    computeHighlights();
    updateHighlights();
    updateAttackHighlights();
    updateAbilityTargetHighlights();
  }

  function isActive() { return !!renderer; }

  return { mount, unmount, updateState, isActive, setAbilityAimMode, clearAbilityAimMode, triggerAbilityEffect };
})();
