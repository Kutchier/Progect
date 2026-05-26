'use strict';
/* ====================================================================
   Dark Fantasy Atmosphere Engine
   Replaces old PS1 effects — gold particle ambience, SVG filter defs
   ==================================================================== */
(function () {
  /* Inject reusable SVG filter defs */
  var ns  = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('xmlns', ns);
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;z-index:-1;';
  svg.innerHTML =
    '<defs>' +
      /* Stone noise — used for panel texture overlays */
      '<filter id="df-stone" x="0%" y="0%" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.85 0.9" numOctaves="4" seed="7" stitchTiles="stitch" result="noise"/>' +
        '<feColorMatrix type="saturate" values="0" in="noise" result="grey"/>' +
        '<feBlend in="SourceGraphic" in2="grey" mode="multiply"/>' +
      '</filter>' +
      /* Gold glow — used on hero title / key headings */
      '<filter id="df-glow" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feGaussianBlur stdDeviation="4" result="blur"/>' +
        '<feComposite in="SourceGraphic" in2="blur" operator="over"/>' +
      '</filter>' +
    '</defs>';
  document.body.appendChild(svg);

  /* Mark body — keep .ps1 so existing CSS stubs remain valid */
  document.body.classList.add('ps1');
  document.body.classList.add('dark-fantasy');

  /* ── Floating gold mote particles on the menu screen ── */
  function spawnMenuParticles() {
    var menu = document.getElementById('screen-menu');
    if (!menu) return;

    var canvas = document.createElement('canvas');
    canvas.style.cssText = [
      'position:absolute', 'inset:0',
      'width:100%', 'height:100%',
      'pointer-events:none',
      'z-index:0', 'opacity:0.28'
    ].join(';');
    menu.style.position = 'relative';
    menu.insertBefore(canvas, menu.firstChild);

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0;
    var N = 55;
    var pts = [];

    function resize() {
      W = canvas.width  = menu.offsetWidth;
      H = canvas.height = menu.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < N; i++) {
      pts.push({
        x:  Math.random() * 1200,
        y:  Math.random() * 700,
        r:  Math.random() * 1.1 + 0.25,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.22 + 0.04),
        a:  Math.random(),
        da: (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1)
      });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (var j = 0; j < pts.length; j++) {
        var p = pts[j];
        p.x += p.vx;  p.y += p.vy;
        p.a += p.da;
        if (p.a > 1)   p.da = -Math.abs(p.da);
        if (p.a < 0)   p.da =  Math.abs(p.da);
        if (p.y < -4)  { p.y = H + 4; p.x = Math.random() * W; }
        if (p.x < -4)  p.x = W + 4;
        if (p.x > W+4) p.x = -4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212,175,55,' + p.a.toFixed(2) + ')';
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', spawnMenuParticles);
  } else {
    spawnMenuParticles();
  }
})();
