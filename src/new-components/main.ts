import * as THREE from 'three';
import { COLORS } from './materials';
import { buildBike } from './bike';
import { buildRobot } from './robot';
import { buildFactory } from './factory';
import { buildTruck } from './truck';
import { buildOutdoor } from './outdoor';
import { buildDealer } from './dealer';
import { createChoreography, HOLDS, stageOf } from './choreography';
import { createUI } from './ui';
import { clamp } from './util';
import type { World, View } from './types';

const SHOW_LABELS = true;

/** soft studio environment for reflections (no addons needed) */
function studioEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0xd9dde0);
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: 0xcfd3d6, side: THREE.BackSide }));
  env.add(room);
  const panel = (w: number, h: number, x: number, y: number, z: number, ry: number, rx: number, c = 0xffffff) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    env.add(m);
  };
  panel(14, 6, 0, 6.9, 0, 0, Math.PI / 2);
  panel(8, 4, -14.9, 4, 0, Math.PI / 2, 0, 0xf4efe6);
  panel(8, 4, 14.9, 4, 0, -Math.PI / 2, 0, 0xeef2f6);
  panel(10, 3, 0, 3, -14.9, 0, 0, 0xffffff);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(env, 0.03).texture;
  pmrem.dispose();
  return tex;
}

/**
 * Boots the scroll-driven 3D journey against the markup rendered by
 * <JourneyStory />. Returns a disposer that undoes everything (listeners, rAF
 * loop, GPU resources) so the component can unmount cleanly.
 */
export function startJourney(): () => void {
  let disposed = false;
  let teardown: (() => void) | null = null;

  boot(() => disposed).then((t) => {
    if (disposed) t?.();
    else teardown = t;
  }).catch((err) => {
    console.error(err);
    const f = document.getElementById('fallback');
    if (f) f.hidden = false;
  });

  return () => {
    disposed = true;
    teardown?.();
  };
}

async function boot(isDisposed: () => boolean): Promise<(() => void) | null> {
  try { await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]); } catch { /* fonts optional */ }

  const stage = document.getElementById('stage');
  const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
  const track = document.getElementById('journey');
  // unmounted while fonts were loading
  if (isDisposed() || !stage || !canvas || !track) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.sky);
  scene.fog = new THREE.Fog(COLORS.sky, 45, 320);
  scene.environment = studioEnvironment(renderer);

  scene.add(new THREE.HemisphereLight(0xf2f4f5, 0xcfc8bd, 0.9));
  const sun = new THREE.DirectionalLight(0xfff6ea, 2.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 60 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 900);

  const world: World = {
    bike: buildBike(),
    robotL: buildRobot(),
    robotR: buildRobot(),
    factory: buildFactory(),
    truck: buildTruck(),
    outdoor: buildOutdoor(),
    dealer: buildDealer()
  };
  scene.add(world.outdoor.group, world.factory.group, world.dealer.group, world.truck.group, world.robotL.root, world.robotR.root, world.bike.group);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const update = createChoreography(world, camera, sun);

  const totalScroll = () => Math.max(1, track.offsetHeight - stage.clientHeight);
  const trackTop = () => track.getBoundingClientRect().top + window.scrollY;
  const ui = createUI({
    onJump: (i) => window.scrollTo({ top: trackTop() + HOLDS[i] * totalScroll(), behavior: reduced ? 'auto' : 'smooth' })
  });

  let W = 1;
  let H = 1;
  let target = 0;
  let cur = 0;
  let dirty = true;
  const view: View = { rMul: 1, reduced };
  function resize() {
    W = stage!.clientWidth;
    H = stage!.clientHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.fov = W / H < 0.85 ? 40 : 35;
    const A = W / H;
    view.rMul = A < 1 ? clamp(1.05 / A, 1, 2.6) : 1;
    // shift the subject away from the text panel: right on desktop, up on phones
    if (A >= 0.85) camera.setViewOffset(W, H, -W * 0.12, 0, W, H);
    else camera.setViewOffset(W, H, 0, H * 0.14, W, H);
    camera.updateProjectionMatrix();
    dirty = true;
  }

  const readScroll = () => {
    const rect = track.getBoundingClientRect();
    target = clamp(-rect.top / totalScroll(), 0, 1);
  };
  const onScroll = () => { readScroll(); dirty = true; };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);
  resize();
  readScroll();
  cur = target;

  let raf = 0;
  function frame() {
    const moving = Math.abs(target - cur) > 0.00005;
    if (moving) cur = reduced ? target : cur + (target - cur) * 0.12;
    else cur = target;
    if (moving || dirty) {
      const p = reduced ? HOLDS[stageOf(cur)] : cur;
      const out = update(p, view);
      renderer.render(scene, camera);
      ui(p, cur, out, camera, W, H, SHOW_LABELS);
      dirty = false;
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', resize);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.geometry?.dispose();
      [m.material].flat().forEach((mat) => mat?.dispose());
    });
    renderer.dispose();
  };
}
