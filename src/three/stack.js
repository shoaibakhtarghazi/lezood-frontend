/* Stack — the Lezood 3D object (Three.js / WebGL).
   A software stack, literally:  Interface ▸ AI agents ▸ Data & integrations.
   Data packets travel between layers along vertical pipes.
   build 0..3 tells the story: 0 an idea (glowing point) · 1 blueprint (wireframe) ·
   2 solid layers (bottom-up) · 3 screens light up, data flows.
   Renders only while on screen. */
import * as THREE from 'three';
import { reduced } from '../lib/env.js';

const ACCENT = new THREE.Color('#3ddc97');
const BLUEPRINT = new THREE.Color(0x9fb3c8);
const W = 3.2, D = 2.1, H = 0.16; // slab size
const FONT = '"Instrument Sans", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (v) => { v = clamp01(v); return v * v * (3 - 2 * v); };

/* ───────── geometry ───────── */
function slabGeometry() {
  const r = 0.16, x = -W / 2, y = -D / 2, s = new THREE.Shape();
  s.moveTo(x + r, y); s.lineTo(x + W - r, y); s.quadraticCurveTo(x + W, y, x + W, y + r);
  s.lineTo(x + W, y + D - r); s.quadraticCurveTo(x + W, y + D, x + W - r, y + D);
  s.lineTo(x + r, y + D); s.quadraticCurveTo(x, y + D, x, y + D - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: H, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 8 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -H / 2, 0);
  return g;
}

/* ───────── screen textures (2D canvas → texture) ───────── */
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }

const PAINT = {
  // Interface: a live operations dashboard
  ui(ctx, w, h, t, live) {
    ctx.clearRect(0, 0, w, h);
    rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.fillStyle = '#10141a'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.04)'; rr(ctx, 26, 26, 150, h - 52, 16); ctx.fill();
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i === 1 ? 'rgba(61,220,151,.9)' : 'rgba(255,255,255,.16)'; rr(ctx, 46, 70 + i * 52, i === 1 ? 96 : 80, 12, 6); ctx.fill(); }
    const k = [['Revenue', '€48.2k'], ['Tasks automated', '1,284'], ['Uptime', '99.98%']];
    k.forEach(([l, v], i) => {
      const x = 200 + i * 268;
      rr(ctx, x, 26, 248, 120, 16); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
      ctx.fillStyle = 'rgba(236,238,241,.55)'; ctx.font = `500 22px ${FONT}`; ctx.fillText(l, x + 20, 64);
      ctx.fillStyle = '#eceef1'; ctx.font = `600 40px ${FONT}`; ctx.fillText(v, x + 20, 118);
    });
    rr(ctx, 200, 166, 516, h - 192, 16); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
    for (let i = 0; i < 12; i++) {
      const v = 0.35 + 0.5 * Math.abs(Math.sin(i * 1.7 + (live ? t * 1.3 : 0) * (0.4 + (i % 3) * 0.2)));
      const bh = v * (h - 260);
      ctx.fillStyle = i === 9 ? '#3ddc97' : 'rgba(255,255,255,.22)';
      rr(ctx, 226 + i * 40, h - 46 - bh, 24, bh, 6); ctx.fill();
    }
    rr(ctx, 736, 166, 248, h - 192, 16); ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fill();
    for (let i = 0; i < 5; i++) {
      const y = 200 + i * 62, on = live && (Math.floor(t * 1.2) % 5) === i;
      ctx.fillStyle = on ? '#3ddc97' : 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(760, y, 7, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, 780, y - 7, 160 - (i % 3) * 30, 14, 7); ctx.fill();
    }
  },
  // AI agents: a core coordinating six agents
  ai(ctx, w, h, t, live) {
    ctx.clearRect(0, 0, w, h);
    rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.fillStyle = '#0f1316'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
    const cx = w / 2, cy = h / 2;
    ctx.strokeStyle = 'rgba(61,220,151,.22)'; ctx.lineWidth = 3;
    const nodes = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6, rx = 330, ry = 200;
      const x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; nodes.push([x, y]);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, cy); ctx.lineTo(x, y); ctx.stroke();
    }
    if (live) nodes.forEach(([x, y], i) => {
      const p = (t * 0.5 + i / 6) % 1, d1 = Math.abs(x - cx), d2 = Math.abs(y - cy), L = d1 + d2;
      const s = p * L, px = s < d1 ? cx + Math.sign(x - cx) * s : x, py = s < d1 ? cy : cy + Math.sign(y - cy) * (s - d1);
      ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
    });
    const names = ['Inbox', 'Sales', 'Finance', 'Support', 'Ops', 'Reports'];
    nodes.forEach(([x, y], i) => {
      rr(ctx, x - 70, y - 26, 140, 52, 14); ctx.fillStyle = '#161b20'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.12)'; ctx.stroke();
      ctx.fillStyle = '#3ddc97'; ctx.beginPath(); ctx.arc(x - 46, y, 6, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(236,238,241,.85)'; ctx.font = `500 22px ${MONO}`; ctx.fillText(names[i], x - 30, y + 8);
    });
    const pulse = live ? 1 + 0.08 * Math.sin(t * 3) : 1;
    const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120 * pulse);
    g.addColorStop(0, 'rgba(61,220,151,.55)'); g.addColorStop(1, 'rgba(61,220,151,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 120 * pulse, 0, 7); ctx.fill();
    rr(ctx, cx - 64, cy - 64, 128, 128, 26); ctx.fillStyle = '#3ddc97'; ctx.fill();
    ctx.fillStyle = '#04150d'; ctx.font = `700 46px ${FONT}`; ctx.textAlign = 'center'; ctx.fillText('AI', cx, cy + 16); ctx.textAlign = 'left';
  },
  // Data & integrations: the systems a business already runs on (static)
  data(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    rr(ctx, 6, 6, w - 12, h - 12, 26); ctx.fillStyle = '#0f1215'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 2; ctx.stroke();
    const items = ['CRM', 'ERP', 'Email', 'Docs', 'Payments', 'Analytics', 'Database', 'APIs'];
    items.forEach((l, i) => {
      const col = i % 4, row = Math.floor(i / 4), x = 40 + col * 240, y = 60 + row * 300;
      rr(ctx, x, y, 210, 240, 18); ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.stroke();
      ctx.strokeStyle = 'rgba(61,220,151,.75)'; ctx.lineWidth = 4;
      const gx = x + 105, gy = y + 92;
      ctx.beginPath(); ctx.ellipse(gx, gy - 34, 46, 14, 0, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(gx - 46, gy - 34); ctx.lineTo(gx - 46, gy + 30); ctx.ellipse(gx, gy + 30, 46, 14, 0, Math.PI, 0, true); ctx.lineTo(gx + 46, gy - 34); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(gx, gy, 46, 14, 0, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = 'rgba(236,238,241,.85)'; ctx.font = `500 26px ${MONO}`; ctx.textAlign = 'center'; ctx.fillText(l, gx, y + 196); ctx.textAlign = 'left';
    });
  },
};

function screen(kind) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * (D - 0.14) / (W - 0.14));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { c, ctx: c.getContext('2d'), tex, kind, done: false, draw(t, live) { PAINT[kind](this.ctx, c.width, c.height, t, live); tex.needsUpdate = true; } };
}

/* ───────── glow sprite for packets / idea point ───────── */
function glowMaterial(size) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uA: { value: 1 }, uPR: { value: 1 }, uSize: { value: size }, uC: { value: ACCENT } },
    vertexShader: 'uniform float uPR, uSize; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * uPR / -mv.z; }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard; float a = smoothstep(.5,.0,d); a = a*a; gl_FragColor = vec4(uC*(.6+a), a*uA); }',
  });
}

/* ════════════════ create ════════════════
   opts: { labels: HTMLElement[], onHover(i) }
   returns { state, set(key, value), render(), dispose() } or null without WebGL */
export function createStack(canvas, opts = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const root = new THREE.Group(); scene.add(root);

  scene.add(new THREE.HemisphereLight(0xdfe7ee, 0x0a0b0d, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(4, 7, 5); scene.add(key);
  const rim = new THREE.PointLight(0x3ddc97, 0, 12, 1.6); rim.position.set(-2.5, 0.5, 2.5); scene.add(rim);

  // floor glow
  const glowC = document.createElement('canvas'); glowC.width = glowC.height = 256;
  const gx = glowC.getContext('2d'), gg = gx.createRadialGradient(128, 128, 0, 128, 128, 128);
  gg.addColorStop(0, 'rgba(61,220,151,.35)'); gg.addColorStop(1, 'rgba(61,220,151,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 256, 256);
  const glowTex = new THREE.CanvasTexture(glowC);
  const floorGeo = new THREE.PlaneGeometry(6.5, 6.5);
  const floorGlow = new THREE.Mesh(floorGeo, new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0 }));
  floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = -1.9; root.add(floorGlow);

  // layers
  const geo = slabGeometry(), edgesGeo = new THREE.EdgesGeometry(geo, 25), faceGeo = new THREE.PlaneGeometry(W - 0.14, D - 0.14);
  const kinds = ['data', 'ai', 'ui'];
  const layers = kinds.map((kind, i) => {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: i === 2 ? 0x1b2128 : 0x161a1f, roughness: 0.38, metalness: 0.25, transparent: true, opacity: 1, emissive: ACCENT, emissiveIntensity: 0 });
    const body = new THREE.Mesh(geo, mat); g.add(body);
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 });
    g.add(new THREE.LineSegments(edgesGeo, edgeMat));
    const scr = screen(kind);
    const face = new THREE.Mesh(faceGeo, new THREE.MeshBasicMaterial({ map: scr.tex, transparent: true, opacity: 1, depthWrite: false, toneMapped: false }));
    face.rotation.x = -Math.PI / 2; face.position.y = H / 2 + 0.03; g.add(face);
    root.add(g);
    return { g, body, mat, edgeMat, face, scr, lift: 0, hover: 0, i };
  });

  // pipes + packets
  const PIPES = [[-1.15, -0.62], [1.15, -0.62], [-1.15, 0.62], [1.15, 0.62], [0, -0.75], [0, 0.75]];
  const pipeMat = new THREE.LineBasicMaterial({ color: 0x3ddc97, transparent: true, opacity: 0 });
  const pipeGeo = new THREE.BufferGeometry(); const pipeArr = new Float32Array(PIPES.length * 6);
  pipeGeo.setAttribute('position', new THREE.BufferAttribute(pipeArr, 3));
  root.add(new THREE.LineSegments(pipeGeo, pipeMat));
  const NP = 14, pk = new Float32Array(NP * 3), pkGeo = new THREE.BufferGeometry();
  pkGeo.setAttribute('position', new THREE.BufferAttribute(pk, 3));
  const pkMat = glowMaterial(90); root.add(new THREE.Points(pkGeo, pkMat));
  const ideaGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.1, 0]), 3));
  const idea = new THREE.Points(ideaGeo, glowMaterial(520));
  root.add(idea);

  const state = { build: 3, explode: 1, t: 0, tiltX: 0, tiltY: 0, mx: 0, my: 0, hovered: -1 };
  let dead = false, running = false, visible = false, last = 0, lastPaint = -1, raf = 0;
  let w = 1, h = 1;

  /* ── layout / fit ── */
  function resize() {
    w = canvas.clientWidth || 1; h = canvas.clientHeight || 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const dist = camera.aspect < 1 ? 11.5 / Math.max(camera.aspect, 0.6) * 0.75 : 11.2;
    camera.position.set(0, 0.68, 1).normalize().multiplyScalar(dist);
    camera.lookAt(0, -0.1, 0);
    root.position.x = camera.aspect < 1.25 && opts.labels ? -0.55 : 0.05; // leave room for labels on narrow screens
    camera.updateProjectionMatrix();
    [pkMat, idea.material].forEach((m) => (m.uniforms.uPR.value = renderer.getPixelRatio()));
    if (!running) draw();
  }

  /* ── pointer: tilt + hover a layer ── */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    state.mx = ndc.x; state.my = ndc.y;
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(layers.map((l) => l.body))[0];
    const idx = hit ? layers.findIndex((l) => l.body === hit.object) : -1;
    if (idx !== state.hovered) { state.hovered = idx; opts.onHover && opts.onHover(idx); canvas.style.cursor = idx >= 0 ? 'pointer' : ''; }
  };
  const onLeave = () => { state.mx = state.my = 0; if (state.hovered !== -1) { state.hovered = -1; opts.onHover && opts.onHover(-1); } };
  const hoverable = !reduced && window.matchMedia('(pointer: fine)').matches;
  if (hoverable) { canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave); }

  /* ── apply build/explode to the scene ── */
  const v = new THREE.Vector3();
  function apply(dt) {
    const b = state.build, t = state.t;
    const gap = 0.42 + 0.78 * state.explode;
    const live = ease(b - 2); // 0..1 during Launch
    layers.forEach((L, i) => {
      const wire = ease((b - i * 0.28) * 1.6);       // blueprint edges, bottom-up
      const solid = ease((b - 1 - i * 0.28) * 1.6);  // solid build, bottom-up
      L.hover += ((state.hovered === i ? 1 : 0) - L.hover) * Math.min(1, dt * 10);
      const drop = (1 - solid) * 0.55 * (b > 1 ? 1 : 0);
      L.g.position.set(0, (i - 1) * gap + drop + L.hover * 0.22 + (live > 0 && !reduced ? Math.sin(t * 1.1 + i) * 0.025 * live : 0), 0);
      L.mat.opacity = solid;
      L.mat.depthWrite = solid > 0.98;
      L.body.visible = solid > 0.01;
      L.edgeMat.opacity = Math.max(wire * (1 - solid) * 0.75, solid * (0.14 + L.hover * 0.5));
      L.edgeMat.color.lerpColors(BLUEPRINT, ACCENT, Math.max(live, L.hover));
      L.face.material.opacity = solid * (0.35 + 0.65 * live);
      L.mat.emissiveIntensity = L.hover * 0.18;
    });
    idea.material.uniforms.uA.value = (1 - ease(b * 1.4)) * (0.75 + 0.25 * Math.sin(t * 2.4));
    idea.position.y = Math.sin(t * 1.3) * 0.08;
    rim.intensity = 14 * live; floorGlow.material.opacity = 0.9 * live;
    pipeMat.opacity = 0.28 * live; pkMat.uniforms.uA.value = live;

    // pipes span bottom→top layer
    const y0 = layers[0].g.position.y + H, y1 = layers[2].g.position.y - H;
    PIPES.forEach(([x, z], i) => pipeArr.set([x, y0, z, x, y1, z], i * 6));
    pipeGeo.attributes.position.needsUpdate = true;
    for (let i = 0; i < NP; i++) {
      const [x, z] = PIPES[i % PIPES.length], up = i % 2 === 0;
      const p = (t * (0.32 + (i % 4) * 0.05) + i * 0.173) % 1, f = up ? p : 1 - p;
      pk.set([x, y0 + (y1 - y0) * f, z], i * 3);
    }
    pkGeo.attributes.position.needsUpdate = true;

    // screens repaint ~12 fps while live (the static "data" screen is painted once)
    if (t - lastPaint > 0.08 || lastPaint < 0) {
      layers.forEach((L) => {
        if (L.scr.kind === 'data' && L.scr.done) return;
        L.scr.draw(t, live > 0.05 && !reduced); L.scr.done = true;
      });
      lastPaint = t;
    }

    // gentle presentation turn + pointer tilt
    state.tiltY += ((reduced ? 0 : state.mx * 0.22) - state.tiltY) * Math.min(1, dt * 4);
    state.tiltX += ((reduced ? 0 : -state.my * 0.08) - state.tiltX) * Math.min(1, dt * 4);
    root.rotation.y = (reduced ? 0 : Math.sin(t * 0.25) * 0.05) + state.tiltY * 0.5;
    root.rotation.x = state.tiltX * 0.6;

    // HTML labels follow their layer's right edge
    if (opts.labels) {
      root.updateMatrixWorld();
      opts.labels.forEach((el, i) => {
        if (!el) return;
        const L = layers[i];
        v.set(W / 2 + 0.05, 0, 0.2).applyMatrix4(L.g.matrixWorld).project(camera);
        el.style.transform = `translate3d(${((v.x * 0.5 + 0.5) * w).toFixed(1)}px, ${((-v.y * 0.5 + 0.5) * h).toFixed(1)}px, 0)`;
        el.style.opacity = L.mat.opacity.toFixed(2);
      });
    }
  }

  function draw(dt = 0.016) { if (dead) return; apply(dt); renderer.render(scene, camera); }
  function frame(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    state.t += dt;
    draw(dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduced || !visible || document.hidden || dead) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; cancelAnimationFrame(raf); }

  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); if (visible && reduced) draw(); }, { rootMargin: '100px' });
  io.observe(canvas);
  const onVis = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVis);
  const ro = new ResizeObserver(resize); ro.observe(canvas);
  if (document.fonts) document.fonts.ready.then(() => { lastPaint = -1; layers.forEach((L) => (L.scr.done = false)); if (!running) draw(); });

  resize();
  return {
    state,
    set(k, val) { state[k] = val; if (!running) draw(); },
    render: () => { if (!running) draw(); },
    dispose() {
      dead = true; stop();
      io.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave);
      canvas.style.cursor = '';
      [geo, edgesGeo, faceGeo, floorGeo, pipeGeo, pkGeo, ideaGeo, glowTex, pipeMat, pkMat, idea.material, floorGlow.material].forEach((o) => o.dispose());
      layers.forEach((L) => { L.mat.dispose(); L.edgeMat.dispose(); L.face.material.dispose(); L.scr.tex.dispose(); });
      renderer.dispose();
    },
  };
}