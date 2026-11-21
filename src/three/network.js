/* Ambient AI background — a slow neural network (Three.js).
   Soft nodes drifting in 3D, faint links between neighbours; a green pulse travels a random link
   about once a second. GSAP drives the clock (~30 fps) and eases the camera with pointer + scroll.
   Still frame under prefers-reduced-motion; paused when the tab is hidden. */
import * as THREE from 'three';
import { gsap } from '../lib/gsap.js';
import { reduced } from '../lib/env.js';

export function createNetwork(canvas) {
  const small = innerWidth < 900;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); }
  catch (e) { return null; }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  /* ── nodes ── */
  const N = small ? 70 : 150, LINK = small ? 3.6 : 3.3, MAXL = N * 6;
  const nodes = [];
  const nPos = new Float32Array(N * 3), nSize = new Float32Array(N), nHot = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    nodes.push({
      p: new THREE.Vector3((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 20, -Math.random() * 9),
      v: new THREE.Vector3((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.04),
    });
    nSize[i] = 0.6 + Math.random() * 0.9;
    nHot[i] = Math.random() < 0.08 ? 1 : 0; // a few "active" nodes in soft green
  }
  const nGeo = new THREE.BufferGeometry();
  nGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  nGeo.setAttribute('aSize', new THREE.BufferAttribute(nSize, 1));
  nGeo.setAttribute('aHot', new THREE.BufferAttribute(nHot, 1));
  const uniforms = { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } };
  const nMat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `
      attribute float aSize; attribute float aHot; uniform float uTime, uPR; varying float vA; varying float vH;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.);
        gl_Position = projectionMatrix * mv;
        float tw = aHot > .5 ? .75 + .25 * sin(uTime * 1.6 + position.x) : 1.;
        gl_PointSize = aSize * (aHot > .5 ? 7. : 5.) * uPR * (14. / -mv.z) * tw;
        vA = smoothstep(30., 13., -mv.z); vH = aHot;
      }`,
    fragmentShader: `
      varying float vA; varying float vH;
      void main(){
        float d = length(gl_PointCoord - .5); if (d > .5) discard;
        float core = smoothstep(.5, .15, d);
        vec3 c = mix(vec3(.78, .83, .88), vec3(.36, .88, .64), vH);
        gl_FragColor = vec4(c, core * vA * mix(.48, .8, vH));
      }`,
  });
  scene.add(new THREE.Points(nGeo, nMat));

  /* ── links (rebuilt each frame between near neighbours) ── */
  const lPos = new Float32Array(MAXL * 6), lA = new Float32Array(MAXL * 2);
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
  lGeo.setAttribute('aA', new THREE.BufferAttribute(lA, 1));
  const lMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    vertexShader: 'attribute float aA; varying float vA; void main(){ vA = aA; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'varying float vA; void main(){ gl_FragColor = vec4(.74, .8, .86, vA); }',
  });
  scene.add(new THREE.LineSegments(lGeo, lMat));
  let links = []; // [i, j] pairs currently linked

  /* ── signal pulses (pooled) ── */
  const P = 8, pPos = new Float32Array(P * 3).fill(999), pA = new Float32Array(P);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('aA', new THREE.BufferAttribute(pA, 1));
  const pMat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'attribute float aA; uniform float uPR; varying float vA; void main(){ vA = aA; vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv; gl_PointSize = 34. * uPR * (14. / -mv.z); }',
    fragmentShader: 'varying float vA; void main(){ float d = length(gl_PointCoord-.5); if (d>.5) discard; float a = smoothstep(.5,.0,d); gl_FragColor = vec4(.36,.88,.64, a*a*vA*.55); }',
  });
  scene.add(new THREE.Points(pGeo, pMat));
  const pulses = Array.from({ length: P }, () => ({ a: 0, b: 0, t: 0, alpha: 0, busy: false }));

  function updateGraph(dt) {
    // drift, wrap softly at the edges
    nodes.forEach((n, i) => {
      if (!reduced) n.p.addScaledVector(n.v, dt);
      if (n.p.x > 17) n.p.x = -17; if (n.p.x < -17) n.p.x = 17;
      if (n.p.y > 10) n.p.y = -10; if (n.p.y < -10) n.p.y = 10;
      if (n.p.z > 0) n.v.z = -Math.abs(n.v.z); if (n.p.z < -9) n.v.z = Math.abs(n.v.z);
      nPos[i * 3] = n.p.x; nPos[i * 3 + 1] = n.p.y; nPos[i * 3 + 2] = n.p.z;
    });
    nGeo.attributes.position.needsUpdate = true;
    // links
    links = [];
    let k = 0;
    for (let i = 0; i < N && k < MAXL; i++) for (let j = i + 1; j < N && k < MAXL; j++) {
      const d = nodes[i].p.distanceTo(nodes[j].p);
      if (d < LINK) {
        const a = Math.pow(1 - d / LINK, 1.4) * 0.2;
        lPos.set([nodes[i].p.x, nodes[i].p.y, nodes[i].p.z, nodes[j].p.x, nodes[j].p.y, nodes[j].p.z], k * 6);
        lA[k * 2] = lA[k * 2 + 1] = a;
        links.push([i, j]); k++;
      }
    }
    lGeo.setDrawRange(0, k * 2);
    lGeo.attributes.position.needsUpdate = true; lGeo.attributes.aA.needsUpdate = true;
    // pulses ride their link
    pulses.forEach((q, i) => {
      if (!q.busy) { pPos[i * 3] = 999; pA[i] = 0; return; }
      const A = nodes[q.a].p, B = nodes[q.b].p;
      pPos[i * 3] = A.x + (B.x - A.x) * q.t; pPos[i * 3 + 1] = A.y + (B.y - A.y) * q.t; pPos[i * 3 + 2] = A.z + (B.z - A.z) * q.t;
      pA[i] = q.alpha;
    });
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.aA.needsUpdate = true;
  }

  function size() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  const draw = () => renderer.render(scene, camera);
  const onResize = () => { size(); draw(); };
  size(); updateGraph(0); draw();
  addEventListener('resize', onResize);

  const cleanups = [];
  if (!reduced) {
    // a soft signal travels along a random link about once a second
    let fireCall;
    const fire = () => {
      const q = pulses.find((x) => !x.busy);
      if (q && links.length) {
        const [a, b] = links[(Math.random() * links.length) | 0];
        Object.assign(q, { a, b, t: 0, alpha: 0, busy: true });
        gsap.timeline({ onComplete: () => (q.busy = false) })
          .to(q, { alpha: 1, duration: 0.35, ease: 'power2.out' }, 0)
          .to(q, { t: 1, duration: 1.6, ease: 'power1.inOut' }, 0)
          .to(q, { alpha: 0, duration: 0.45, ease: 'power2.in' }, 1.15);
      }
      fireCall = gsap.delayedCall(0.7 + Math.random() * 0.8, fire);
    };
    fire();

    // camera eases with pointer and scroll (subtle parallax)
    const cx = gsap.quickTo(camera.position, 'x', { duration: 2.2, ease: 'power3.out' });
    const cy = gsap.quickTo(camera.position, 'y', { duration: 2.2, ease: 'power3.out' });
    let px = 0, sy = 0;
    const onMove = (e) => { px = (e.clientX / innerWidth - 0.5) * 1.2; cx(px); cy(-sy + (0.5 - e.clientY / innerHeight) * 0.8); };
    const onScroll = () => {
      sy = Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)) * 3;
      cy(-sy);
    };
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('scroll', onScroll, { passive: true });

    // GSAP ticker: ~30 fps clock
    let acc = 0;
    const tick = (time, delta) => {
      if (document.hidden) return;
      acc += delta;
      if (acc < 33) return;
      const dt = Math.min(acc, 100) / 1000; acc = 0;
      uniforms.uTime.value += dt;
      updateGraph(dt);
      camera.lookAt(camera.position.x * 0.4, camera.position.y * 0.4, 0);
      draw();
    };
    gsap.ticker.add(tick);

    cleanups.push(() => {
      fireCall && fireCall.kill();
      pulses.forEach((q) => gsap.killTweensOf(q));
      gsap.killTweensOf(camera.position);
      gsap.ticker.remove(tick);
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
    });
  }

  return {
    dispose() {
      cleanups.forEach((fn) => fn());
      removeEventListener('resize', onResize);
      [nGeo, lGeo, pGeo, nMat, lMat, pMat].forEach((o) => o.dispose());
      renderer.dispose();
    },
  };
}