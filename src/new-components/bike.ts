import * as THREE from 'three';
import { M } from './materials';
import { rod, box, zcyl, extrude, sign, S } from './util';

// Local frame: origin on the ground midway between the wheels, +x forward, +y up,
// z = lateral. Wheelbase 1.28 m, wheel radius 0.31 m.
// d(x, y) converts the side-profile drawing units used in the 2D design.
const d = (x: number, y: number, z = 0): [number, number, number] => [x * S, -y * S, z];

export type PartId = 'engine' | 'susp' | 'rwheel' | 'fwheel' | 'bar' | 'elec' | 'body' | 'seat' | 'final';

/** Anchors (bike-local, metres) — each component group is centred here so the
 *  choreography can fly it from its rack to the frame by offsetting position. */
export const ANCHORS: Record<PartId, [number, number, number]> = {
  engine: [0.025, 0.425, 0],
  susp: [0.2, 0.5, 0],
  rwheel: [-0.64, 0.31, 0],
  fwheel: [0.64, 0.31, 0],
  bar: [0.36, 0.89, 0],
  elec: [-0.1, 0.675, 0],
  body: [0.125, 0.75, 0],
  seat: [-0.4, 0.76, 0],
  final: [-0.05, 0.6, 0]
};

function part(root: THREE.Group, id: PartId) {
  const outer = new THREE.Group();
  outer.name = id;
  const a = ANCHORS[id];
  outer.position.set(a[0], a[1], a[2]);
  outer.userData.anchor = new THREE.Vector3(a[0], a[1], a[2]);
  const inner = new THREE.Group();
  inner.position.set(-a[0], -a[1], -a[2]);
  outer.add(inner);
  root.add(outer);
  return { outer, inner };
}

function wheel(discR: number) {
  const spin = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.262, 0.052, 18, 56), M.rubber);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.212, 0.014, 10, 56), M.alloy);
  spin.add(tire, rim);
  const spokeGeo = new THREE.BoxGeometry(0.19, 0.026, 0.02);
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(spokeGeo, M.alloy);
      const a = i * (Math.PI * 2 / 5) + (side > 0 ? 0 : 0.18);
      s.position.set(Math.cos(a) * 0.11, Math.sin(a) * 0.11, side * 0.02);
      s.rotation.z = a;
      spin.add(s);
    }
  }
  spin.add(zcyl(0.05, 0.15, M.alloy));
  spin.add(zcyl(discR, 0.006, M.chrome, 0, 0, 0.075, 40));
  spin.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return spin;
}

export function buildBike() {
  const group = new THREE.Group();
  group.name = 'hero-bike';
  group.rotation.order = 'YXZ';
  const parts = {} as Record<PartId, THREE.Group>;

  // ---------- frame (always present) ----------
  const frame = new THREE.Group();
  const twin = (a: number[], b: number[], r: number, z: number) => { frame.add(rod(d(a[0], a[1], z), d(b[0], b[1], z), r, M.frame)); frame.add(rod(d(a[0], a[1], -z), d(b[0], b[1], -z), r, M.frame)); };
  twin([90, -146], [-8, -136], 0.024, 0.065);
  twin([-8, -136], [-42, -92], 0.024, 0.07);
  twin([92, -130], [44, -72], 0.02, 0.06);
  twin([44, -72], [-18, -58], 0.02, 0.07);
  twin([-18, -58], [-42, -86], 0.02, 0.07);
  twin([60, -142], [20, -96], 0.012, 0.068);
  twin([20, -96], [-8, -136], 0.012, 0.068);
  twin([20, -96], [44, -72], 0.012, 0.066);
  twin([-8, -136], [-128, -150], 0.014, 0.07);
  twin([-40, -100], [-120, -146], 0.012, 0.07);
  frame.add(rod(d(-128, -150, -0.07), d(-128, -150, 0.07), 0.012, M.frame));
  frame.add(rod(d(-42, -88, -0.08), d(-42, -88, 0.08), 0.045, M.frame));
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 20), M.frame);
  head.position.set(...d(90, -141));
  head.rotation.z = 0.37;
  head.castShadow = true;
  frame.add(head);
  group.add(frame);

  // structural highlight rings (scene 01)
  const rings = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(0.075, 0.006, 8, 40);
  [[0.45, 0.705], [-0.21, 0.44], [0.22, 0.36], [-0.04, 0.68]].forEach(([x, y]) => {
    const r = new THREE.Mesh(ringGeo, M.highlight);
    r.position.set(x, y, 0.1);
    r.renderOrder = 10;
    rings.add(r);
  });
  group.add(rings);

  // ---------- wheels ----------
  const rw = part(group, 'rwheel');
  const rSpin = wheel(0.1);
  rSpin.position.set(-0.64, 0.31, 0);
  rw.inner.add(rSpin);
  parts.rwheel = rw.outer;

  const fw = part(group, 'fwheel');
  const fSpin = wheel(0.14);
  fSpin.position.set(0.64, 0.31, 0);
  fw.inner.add(fSpin);
  parts.fwheel = fw.outer;

  // ---------- powertrain ----------
  const en = part(group, 'engine');
  en.inner.add(box(0.44, 0.28, 0.26, M.engine, 0.02, 0.36, 0));
  const block = new THREE.Group();
  block.position.set(0.16, 0.53, 0);
  block.rotation.z = -0.35;
  block.add(box(0.2, 0.2, 0.2, M.engineLight));
  for (let i = -2; i <= 2; i++) block.add(box(0.26, 0.012, 0.24, M.fins, 0, i * 0.03, 0));
  block.add(box(0.22, 0.06, 0.22, M.engine, 0, 0.13, 0));
  en.inner.add(block);
  en.inner.add(zcyl(0.085, 0.04, M.engineLight, -0.02, 0.36, 0.145));
  en.inner.add(zcyl(0.07, 0.04, M.engineLight, 0.08, 0.33, -0.145));
  en.inner.add(zcyl(0.03, 0.03, M.dark, -0.15, 0.34, 0.11));
  parts.engine = en.outer;

  // ---------- suspension: fork, swingarm, shock ----------
  const su = part(group, 'susp');
  [-0.085, 0.085].forEach((z) => su.inner.add(rod(d(-42, -88, z), d(-128, -62, z), 0.026, M.engine)));
  su.inner.add(rod([-0.15, 0.37, 0.1], [-0.64, 0.36, 0.1], 0.006, M.steel));
  su.inner.add(rod([-0.15, 0.31, 0.1], [-0.64, 0.26, 0.1], 0.006, M.steel));
  const s0 = d(-26, -132), s1 = d(-66, -82);
  su.inner.add(rod(s0, s1, 0.018, M.chrome));
  const sDir = new THREE.Vector3(s1[0] - s0[0], s1[1] - s0[1], 0).normalize();
  const ringQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), sDir);
  const coilGeo = new THREE.TorusGeometry(0.034, 0.008, 8, 24);
  for (let i = 1; i <= 7; i++) {
    const c = new THREE.Mesh(coilGeo, M.red);
    const t = 0.12 + i * 0.1;
    c.position.set(s0[0] + (s1[0] - s0[0]) * t, s0[1] + (s1[1] - s0[1]) * t, 0);
    c.quaternion.copy(ringQ);
    su.inner.add(c);
  }
  [-0.09, 0.09].forEach((z) => {
    su.inner.add(rod([0.47, 0.76, z], [0.585, 0.47, z], 0.022, M.chrome));
    su.inner.add(rod([0.57, 0.51, z], [0.64, 0.31, z], 0.03, M.engine));
  });
  const clampTop = box(0.1, 0.03, 0.26, M.dark, 0.465, 0.775, 0);
  clampTop.rotation.z = 0.37;
  const clampLow = box(0.09, 0.03, 0.24, M.dark, 0.5, 0.69, 0);
  clampLow.rotation.z = 0.37;
  su.inner.add(clampTop, clampLow);
  parts.susp = su.outer;

  // ---------- handlebar ----------
  const hb = part(group, 'bar');
  hb.inner.add(rod([0.455, 0.79, 0], [0.42, 0.89, 0], 0.02, M.dark));
  hb.inner.add(rod([0.4, 0.9, -0.33], [0.4, 0.9, 0.33], 0.014, M.frame));
  [-1, 1].forEach((s) => {
    hb.inner.add(rod([0.4, 0.9, s * 0.24], [0.4, 0.9, s * 0.35], 0.02, M.rubber));
    hb.inner.add(rod([0.41, 0.9, s * 0.18], [0.33, 0.885, s * 0.3], 0.006, M.alloy));
  });
  const clocks = zcyl(0.055, 0.04, M.dark, 0.47, 0.93, 0);
  clocks.rotation.set(Math.PI / 2, 0, 0.5);
  hb.inner.add(clocks);
  parts.bar = hb.outer;

  // ---------- electrical ----------
  const el = part(group, 'elec');
  [0.05, -0.05].forEach((z) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.43, 0.69, z), new THREE.Vector3(0.2, 0.64, z * 1.2),
      new THREE.Vector3(-0.05, 0.64, z * 1.4), new THREE.Vector3(-0.35, 0.67, z * 1.2),
      new THREE.Vector3(-0.55, 0.7, z)
    ]);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.009, 8), M.slate);
    el.inner.add(m);
  });
  el.inner.add(box(0.14, 0.11, 0.12, M.slate, -0.3, 0.6, 0));
  el.inner.add(box(0.08, 0.05, 0.06, M.dark, -0.47, 0.7, 0));
  const connGeo = new THREE.SphereGeometry(0.014, 12, 8);
  [[0.43, 0.69, 0.05], [-0.05, 0.64, 0.07], [-0.55, 0.7, 0.05]].forEach((p) => {
    const c = new THREE.Mesh(connGeo, M.red);
    c.position.set(p[0], p[1], p[2]);
    el.inner.add(c);
  });
  parts.elec = el.outer;

  // ---------- body panels ----------
  const bd = part(group, 'body');
  bd.inner.add(extrude([['M', -12, -140], ['C', -10, -168, 28, -182, 74, -170], ['L', 88, -152], ['C', 62, -140, 22, -136, -12, -140]], 0.26, M.paint, 0.03));
  [-0.163, 0.163].forEach((z) => {
    const c = new THREE.CatmullRomCurve3([d(0, -150, z), d(20, -161, z), d(50, -166, z), d(80, -160, z)].map((p) => new THREE.Vector3(...p)));
    bd.inner.add(new THREE.Mesh(new THREE.TubeGeometry(c, 30, 0.007, 6), M.pearl));
  });
  [-1, 1].forEach((s) => {
    const shroud = extrude([['M', 56, -150], ['L', 86, -150], ['L', 72, -112], ['L', 46, -118], ['L', 56, -150]], 0.02, M.pearl, 0.006);
    shroud.position.z = s * 0.15;
    const cover = extrude([['M', -24, -138], ['L', -84, -142], ['L', -90, -126], ['L', -40, -116], ['L', -24, -138]], 0.02, M.pearl, 0.006);
    cover.position.z = s * 0.135;
    bd.inner.add(shroud, cover);
  });
  bd.inner.add(extrude([['M', -70, -150], ['L', -150, -162], ['L', -162, -154], ['L', -140, -146], ['L', -80, -138], ['L', -70, -150]], 0.17, M.paint, 0.02));
  bd.inner.add(extrude([['M', 104, -110], ['C', 118, -128, 150, -128, 168, -104], ['L', 161, -101], ['C', 146, -118, 122, -118, 110, -105], ['L', 104, -110]], 0.1, M.pearl, 0.01));
  parts.body = bd.outer;

  // ---------- seat ----------
  const se = part(group, 'seat');
  se.inner.add(extrude([['M', -14, -146], ['C', -40, -161, -100, -163, -146, -160], ['L', -148, -150], ['C', -100, -150, -50, -146, -16, -138], ['L', -14, -146]], 0.22, M.seat, 0.03));
  parts.seat = se.outer;

  // ---------- exhaust, lights, mirrors ----------
  const fi = part(group, 'final');
  const exCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 0.27, 0.1), new THREE.Vector3(0.0, 0.2, 0.15),
    new THREE.Vector3(-0.2, 0.22, 0.17), new THREE.Vector3(-0.42, 0.32, 0.17)
  ]);
  fi.inner.add(new THREE.Mesh(new THREE.TubeGeometry(exCurve, 30, 0.028, 10), M.chrome));
  fi.inner.add(rod([-0.42, 0.33, 0.17], [-0.84, 0.43, 0.17], 0.062, M.alloy, 20));
  fi.inner.add(rod([-0.84, 0.43, 0.17], [-0.86, 0.435, 0.17], 0.045, M.dark, 20));
  const cowl = box(0.12, 0.16, 0.18, M.dark, 0.555, 0.8, 0);
  cowl.rotation.z = -0.2;
  fi.inner.add(cowl);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.03, 28), M.lens);
  lens.rotation.z = Math.PI / 2;
  lens.position.set(0.62, 0.79, 0);
  fi.inner.add(lens);
  fi.inner.add(box(0.03, 0.03, 0.1, M.tail, -0.84, 0.79, 0));
  fi.inner.add(box(0.005, 0.1, 0.16, M.pearl, -0.86, 0.66, 0));
  const headGeo = new THREE.SphereGeometry(0.05, 16, 10);
  [-1, 1].forEach((s) => {
    fi.inner.add(rod([0.4, 0.9, s * 0.27], [0.44, 1.04, s * 0.3], 0.006, M.dark));
    const mh = new THREE.Mesh(headGeo, M.dark);
    mh.scale.set(1, 0.55, 1.25);
    mh.position.set(0.45, 1.06, s * 0.31);
    fi.inner.add(mh);
    fi.inner.add(box(0.05, 0.02, 0.02, M.amber, 0.6, 0.71, s * 0.08));
    fi.inner.add(box(0.04, 0.02, 0.02, M.amber, -0.82, 0.74, s * 0.09));
  });
  parts.final = fi.outer;

  group.traverse((o) => { if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material !== M.highlight) { o.castShadow = true; o.receiveShadow = true; } });

  // plain-text "HONDA" lettering on both sides of the tank (side faces sit at z = ±0.16).
  // Added after the shadow pass so the transparent quads don't cast square shadows.
  [1, -1].forEach((side) => {
    const decal = sign('HONDA', 0.24, 0.065, { fg: '#F4F2EE', bg: 'transparent', font: '700 150px "IBM Plex Sans", sans-serif', spacing: 14 });
    decal.name = 'tank-decal';
    decal.position.set(0.2, 0.775, side * 0.163);
    if (side < 0) decal.rotation.y = Math.PI;
    bd.inner.add(decal);
  });

  return { group, parts, rings, wheels: { r: rSpin, f: fSpin } };
}

/** grey, fully-assembled copy used for secondary display bikes */
export function ghostBike() {
  const b = buildBike();
  b.rings.visible = false;
  b.group.traverse((o) => {
    if (o.name === 'tank-decal') o.visible = false;
    else if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = M.ghost;
  });
  return b.group;
}
