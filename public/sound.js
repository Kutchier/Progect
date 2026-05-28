'use strict';
/* ============================================================
   Dark Fantasy Sound Engine — Web Audio API, no audio files
   Usage:
     SFX.play('click')      — UI click
     SFX.play('hover')      — slot hover
     SFX.play('equip')      — equip item
     SFX.play('transition') — screen transition
     SFX.play('combat_hit') — taking damage
     SFX.play('kill')       — enemy defeated
     SFX.play('level_up')   — level up fanfare
     SFX.play('victory')    — win jingle
     SFX.play('defeat')     — lose sting
     SFX.play('door_open')  — door unlocked
     SFX.play('door_fail')  — door minigame fail
     SFX.play('bonus')      — new global bonus
     SFX.setVolume(0..1)    — master volume
     SFX.mute() / SFX.unmute()
   ============================================================ */
const SFX = (() => {
  let ctx = null;
  let masterGain = null;
  let _muted = false;
  let _volume = 0.35;

  function _init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = _muted ? 0 : _volume;
      masterGain.connect(ctx.destination);
    } catch (e) { /* AudioContext not available */ }
  }

  // ── Low-level oscillator helpers ──────────────────────────────────────────

  function _osc(type, freq, startTime, dur, gainVal, dest) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    osc.connect(g);
    g.connect(dest || masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur);
  }

  function _oscSlide(type, freqFrom, freqTo, startTime, dur, gainVal) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqFrom, startTime);
    osc.frequency.linearRampToValueAtTime(freqTo, startTime + dur);
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + dur);
  }

  function _noise(startTime, dur, gainVal) {
    if (!ctx) return;
    const bufLen  = Math.ceil(ctx.sampleRate * dur);
    const buffer  = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const data    = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;
    const src   = ctx.createBufferSource();
    const filt  = ctx.createBiquadFilter();
    const g     = ctx.createGain();
    src.buffer  = buffer;
    filt.type   = 'bandpass';
    filt.frequency.value = 400;
    filt.Q.value = 0.8;
    g.gain.setValueAtTime(gainVal, startTime);
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);
    src.connect(filt);
    filt.connect(g);
    g.connect(masterGain);
    src.start(startTime);
    src.stop(startTime + dur);
  }

  // ── Sound definitions ─────────────────────────────────────────────────────

  const SOUNDS = {
    click() {
      const t = ctx.currentTime;
      _osc('sine',   800, t,       0.04, 0.15);
      _osc('square', 400, t+0.02,  0.03, 0.06);
    },
    hover() {
      const t = ctx.currentTime;
      _osc('sine', 600, t, 0.05, 0.06);
    },
    equip() {
      const t = ctx.currentTime;
      _oscSlide('sawtooth', 300, 900, t,        0.08, 0.20);
      _osc('sine',          1200,      t + 0.07, 0.10, 0.15);
    },
    transition() {
      const t = ctx.currentTime;
      _oscSlide('sine', 150, 600, t,       0.3, 0.18);
      _osc('sine', 800,           t + 0.2, 0.2, 0.10);
    },
    combat_hit() {
      const t = ctx.currentTime;
      _noise(t,       0.05, 0.30);
      _oscSlide('sawtooth', 200, 80, t, 0.12, 0.25);
    },
    kill() {
      const t = ctx.currentTime;
      _oscSlide('square', 400, 800, t,       0.07, 0.20);
      _osc('sine',        600,      t + 0.05, 0.12, 0.15);
      _osc('sine',        900,      t + 0.12, 0.10, 0.10);
    },
    level_up() {
      const t = ctx.currentTime;
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => _osc('sine', f, t + i * 0.12, 0.20, 0.22));
      _osc('triangle', 1047, t + 0.48, 0.35, 0.18);
    },
    victory() {
      const t = ctx.currentTime;
      const melody = [523, 659, 784, 659, 784, 1047];
      melody.forEach((f, i) => _osc('sine', f, t + i * 0.14, 0.20, 0.20));
      _osc('triangle', 1047, t + 0.84, 0.5, 0.15);
    },
    defeat() {
      const t = ctx.currentTime;
      _oscSlide('sawtooth', 440, 100, t,       0.7, 0.22);
      _oscSlide('sine',     220, 60,  t + 0.3, 0.5, 0.18);
      _noise(t + 0.1, 0.4, 0.12);
    },
    door_open() {
      const t = ctx.currentTime;
      _noise(t,       0.06, 0.20);
      _oscSlide('sine', 200, 700, t + 0.05, 0.25, 0.18);
    },
    door_fail() {
      const t = ctx.currentTime;
      _oscSlide('sawtooth', 300, 150, t,       0.15, 0.25);
      _osc('square',        180,      t + 0.12, 0.20, 0.18);
    },
    bonus() {
      const t = ctx.currentTime;
      const chime = [784, 988, 1175, 988, 1175, 1568];
      chime.forEach((f, i) => _osc('sine', f, t + i * 0.09, 0.18, 0.16));
    }
  };

  // ── Public API ─────────────────────────────────────────────────────────────

  function play(name) {
    if (_muted) return;
    _init();
    if (!ctx) return;
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    const fn = SOUNDS[name];
    if (fn) try { fn(); } catch (e) { /* ignore synthesis errors */ }
  }

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    if (masterGain) masterGain.gain.setTargetAtTime(_muted ? 0 : _volume, ctx.currentTime, 0.02);
  }

  function mute()   { _muted = true;  if (masterGain) masterGain.gain.setTargetAtTime(0,       ctx.currentTime, 0.02); }
  function unmute() { _muted = false; if (masterGain) masterGain.gain.setTargetAtTime(_volume, ctx.currentTime, 0.02); }
  function toggle() { _muted ? unmute() : mute(); return _muted; }

  return { play, setVolume, mute, unmute, toggle };
})();

// ── Auto-hook: attach hover/click sounds to key UI elements ──────────────────
(function attachSFXHooks() {
  function hook() {
    // Hover on interactive slots
    document.querySelectorAll(
      '.equip-slot, .skill-slot, .unit-slot, .reward-slot, .rune-pip, .nav-arrow, .skill-tab, .chevron-btn'
    ).forEach(el => {
      if (el.dataset.sfxHooked) return;
      el.dataset.sfxHooked = '1';
      el.addEventListener('mouseenter', () => SFX.play('hover'));
      el.addEventListener('click',      () => SFX.play('click'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hook);
  } else {
    hook();
  }

  // Re-hook after dynamic skill grid re-renders
  const observer = new MutationObserver(hook);
  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.skills-grid');
    if (grid) observer.observe(grid, { childList: true });
  });
})();
