import * as THREE from 'three';

// ---------- easing / timeline helpers ----------
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const sm = (t: number) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
export const seg = (x: number, a: number, b: number) => clamp((x - a) / (b - a), 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** in-out window: rises over [a,b], falls over [c,d] */
export const win = (x: number, a: number, b: number, c: number, d: number) => seg(x, a, b) * (1 - seg(x, c, d));
/** smoothstep keyframes: [[p, value], ...] */
export function kf(x: number, keys: Array<[number, number]>): number {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [p0, v0] = keys[i];
    const [p1, v1] = keys[i + 1];
    if (x <= p1) return lerp(v0, v1, sm((x - p0) / (p1 - p0)));
  }
  return keys[keys.length - 1][1];
}

/** deterministic random so the scenery is identical on every load */
export function rng(seed = 1): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- geometry helpers ----------
const UP = new THREE.Vector3(0, 1, 0);

export function shade<T extends THREE.Object3D>(obj: T, cast = true, receive = true): T {
  obj.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) { o.castShadow = cast; o.receiveShadow = receive; }
  });
  return obj;
}

/** cylinder spanning two points */
export function rod(a: ArrayLike<number>, b: ArrayLike<number>, r: number, mat: THREE.Material, radial = 12) {
  const A = new THREE.Vector3(a[0], a[1], a[2] || 0);
  const B = new THREE.Vector3(b[0], b[1], b[2] || 0);
  const len = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, radial), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, B.clone().sub(A).normalize());
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function box(w: number, h: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** cylinder whose axis runs along Z (wheels, hubs, joints) */
export function zcyl(r: number, len: number, mat: THREE.Material, x = 0, y = 0, z = 0, radial = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, radial), mat);
  m.rotation.x = Math.PI / 2;
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

export function plane(w: number, d: number, mat: THREE.Material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  m.receiveShadow = true;
  return m;
}

// Side-profile drawing units → metres (the 2D design used 1 unit ≈ 5 mm, y down).
export const S = 0.005;

/** build a THREE.Shape from SVG-like commands in drawing units */
export type PathCmd = [string, ...number[]]

export function shapeFrom(cmds: PathCmd[]) {
  const s = new THREE.Shape();
  for (const [t, ...a] of cmds) {
    const p = a.map((v, i) => (i % 2 === 0 ? v * S : -v * S));
    if (t === 'M') s.moveTo(p[0], p[1]);
    else if (t === 'L') s.lineTo(p[0], p[1]);
    else if (t === 'C') s.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
  }
  return s;
}

/** extrude a side-profile shape symmetrically about z = 0 */
export function extrude(cmds: PathCmd[], depth: number, mat: THREE.Material, bevel = 0.01) {
  const geo = new THREE.ExtrudeGeometry(shapeFrom(cmds), {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24
  });
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// ---------- text on canvas (signage) ----------
export interface TextTextureOpts {
  w?: number
  h?: number
  fg?: string
  bg?: string
  font?: string
  spacing?: number
  align?: 'center' | 'left'
}

/** 2D context of a canvas we just created — never null in a browser */
function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  return c.getContext('2d') as CanvasRenderingContext2D;
}

export function textTexture(text: string, {
  w = 1024, h = 128, fg = '#F4F2EE', bg = '#1E2023',
  font = '500 56px "IBM Plex Mono", monospace', spacing = 8, align = 'center'
}: TextTextureOpts = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = ctx2d(c);
  if (bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.fillStyle = fg;
  ctx.font = font;
  if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  ctx.textBaseline = 'middle';
  ctx.textAlign = align;
  ctx.fillText(text, align === 'center' ? w / 2 : 24, h / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** flat sign facing +z */
export function sign(text: string, w: number, h: number, opts: TextTextureOpts = {}) {
  const ratio = w / h;
  const tw = 1024;
  const th = Math.max(32, Math.round(tw / ratio));
  const tex = textTexture(text, { w: tw, h: th, ...opts });
  const mat = new THREE.MeshBasicMaterial({
    map: tex, transparent: opts.bg === 'transparent', toneMapped: false
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
}

/** canvas pattern texture */
export function stripeTexture(base: string, line: string, every = 16, w = 256, h = 64, vertical = true) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = ctx2d(c);
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = line; ctx.lineWidth = 3;
  for (let i = 0; i < (vertical ? w : h); i += every) {
    ctx.beginPath();
    if (vertical) { ctx.moveTo(i, 0); ctx.lineTo(i, h); } else { ctx.moveTo(0, i); ctx.lineTo(w, i); }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function meshTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = ctx2d(c);
  ctx.clearRect(0, 0, 64, 64);
  ctx.strokeStyle = 'rgba(120,126,133,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(64, 64); ctx.moveTo(64, 0); ctx.lineTo(0, 64); ctx.stroke();
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
