import * as THREE from 'three';
import { clamp, sm, seg, lerp, kf, win } from './util';
import { solveRobot } from './robot';
import { DECK, RAMP_LEN } from './truck';
import { TURNTABLE } from './dealer';
import type { World, View, FrameOut, LabelItem, ChipItem } from './types';
import type { Robot } from './robot';
import type { PartId } from './bike';

// ==========================================================================
// One scroll value p ∈ [0, 1] drives everything. Stage boundaries:
//   01 frame 0–.10 · 02 handover .10–.18 · 03 assembly .18–.42 · 04 ready .42–.50
//   05 quality .50–.60 · 06 transport .60–.80 · 07 dealer .80–.90 · 08 ride .90–1
// ==========================================================================
export const BOUNDS = [0, 0.10, 0.18, 0.42, 0.50, 0.60, 0.80, 0.90];
export const HOLDS = [0.06, 0.165, 0.405, 0.48, 0.59, 0.74, 0.87, 0.975];
export const STAGES = ['FRAME', 'HANDOVER', 'ASSEMBLY', 'READY', 'QUALITY', 'TRANSPORT', 'DEALER', 'READY TO RIDE'];
export const stageOf = (p: number) => { let s = 0; for (let i = 0; i < 8; i++) if (p >= BOUNDS[i]) s = i; return s; };

const CELL_X = 6;
const WHEEL_R = 0.31;

// Illustrative install order; trays are on the cell racks (z −2.7).
interface Comp {
  id: PartId
  n: string
  robot: 'L' | 'R'
  a: number
  b: number
  tray: [number, number, number]
  grip: number
}

export const COMP: Comp[] = [
  { id: 'engine', n: 'POWERTRAIN', robot: 'L', a: 0.00, b: 0.12, tray: [4.1, 0.78, -2.7], grip: 0.25 },
  { id: 'susp', n: 'SUSPENSION', robot: 'R', a: 0.11, b: 0.23, tray: [6.9, 0.8, -2.7], grip: 0.3 },
  { id: 'rwheel', n: 'REAR WHEEL', robot: 'L', a: 0.24, b: 0.35, tray: [5.1, 0.83, -2.7], grip: 0.36 },
  { id: 'fwheel', n: 'FRONT WHEEL', robot: 'R', a: 0.28, b: 0.39, tray: [7.9, 0.83, -2.7], grip: 0.36 },
  { id: 'bar', n: 'HANDLEBAR', robot: 'R', a: 0.44, b: 0.53, tray: [6.9, 1.12, -2.7], grip: 0.12 },
  { id: 'elec', n: 'ELECTRICAL', robot: 'L', a: 0.48, b: 0.60, tray: [4.1, 1.15, -2.7], grip: 0.15 },
  { id: 'body', n: 'BODY PANELS', robot: 'R', a: 0.59, b: 0.71, tray: [7.9, 1.25, -2.7], grip: 0.16 },
  { id: 'seat', n: 'SEAT', robot: 'L', a: 0.70, b: 0.82, tray: [5.1, 1.2, -2.7], grip: 0.12 },
  { id: 'final', n: 'EXHAUST · LIGHTS · MIRRORS', robot: 'R', a: 0.81, b: 0.92, tray: [7.4, 1.72, -2.7], grip: 0.4 }
];

// QC marker points (bike-local)
const QC_POINTS: Array<[number, number, number]> = [[0.64, 0.79, 0.06], [-0.64, 0.31, 0.14], [0.64, 0.31, 0.14], [0.36, 0.98, 0.2], [0.15, 0.9, 0.16], [-0.3, 0.62, 0.12]];
export const QC_NAMES = ['LIGHTS', 'WHEELS', 'BRAKES', 'HANDLEBAR ALIGNMENT', 'BODY PANELS', 'ELECTRICAL'];

export function createChoreography(world: World, camera: THREE.PerspectiveCamera, sun: THREE.DirectionalLight) {
  const { bike, robotL, robotR, factory, truck, dealer } = world;
  robotL.root.position.set(5.0, 0, -1.35);
  robotR.root.position.set(7.0, 0, -1.35);

  const showCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(157.2, 0, 0), new THREE.Vector3(160.6, 0, -0.9),
    new THREE.Vector3(163.6, 0, -3.8), new THREE.Vector3(165.3, 0, -6.8),
    new THREE.Vector3(TURNTABLE.x, 0, TURNTABLE.z)
  ]);
  const showLen = showCurve.getLength();

  const v = new THREE.Vector3();
  const tgt = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const partWorld = {} as Record<PartId, THREE.Vector3>;
  COMP.forEach((c) => { partWorld[c.id] = new THREE.Vector3(); });

  const rampY = (x: number, x0: number) => DECK * clamp((x - x0) / RAMP_LEN, 0, 1);

  return function update(p: number, view: View): FrameOut {
    const labels: LabelItem[] = [];
    const chips: ChipItem[] = [];
    const qcMarks: FrameOut['qc'] = [];

    // ---------------- truck ----------------
    const tr = kf(p, [[0.555, 34], [0.60, 19.6], [0.68, 19.6], [0.80, 160], [0.865, 160], [0.90, 215]]);

    // ---------------- motorcycle pose ----------------
    let bx: number; let by = 0; let bz = 0; let pitch = 0; let yaw = 0; let dist: number; let onTruck = false;
    const ramp = (x0: number) => {
      const yr = rampY(bx - 0.64, x0);
      const yf = rampY(bx + 0.64, x0);
      by = (yr + yf) / 2;
      pitch = Math.atan2(yf - yr, 1.28);
    };
    // showroom turntable: one full revolution, linear in scroll, once the bike has parked
    const spin = seg(p, 0.935, 1) * Math.PI * 2;
    if (p < 0.645) {
      bx = kf(p, [[0.075, 0], [0.165, CELL_X], [0.425, CELL_X], [0.48, 10], [0.505, 10], [0.53, 14], [0.60, 14], [0.625, 17.2], [0.645, tr + 1.5]]);
      if (p > 0.6) ramp(tr - RAMP_LEN);
      dist = bx;
    } else if (p < 0.84) {
      onTruck = true; bx = tr + 1.5; by = DECK; dist = 21.1;
    } else if (p < 0.885) {
      bx = kf(p, [[0.84, 161.5], [0.865, 157.2]]);
      if (p < 0.866) ramp(160 - RAMP_LEN);
      dist = bx;
    } else {
      const t = sm(seg(p, 0.885, 0.935));
      showCurve.getPointAt(t, v);
      bx = v.x; bz = v.z;
      const tan = showCurve.getTangentAt(Math.min(t, 0.999));
      yaw = Math.atan2(-tan.z, tan.x) + spin;
      dist = 157.2 + t * showLen;
    }
    bike.group.position.set(bx, by, bz);
    bike.group.rotation.set(0, yaw, pitch);
    bike.wheels.r.rotation.z = bike.wheels.f.rotation.z = -dist / WHEEL_R;
    dealer.turntable.rotation.y = spin;
    bike.group.updateMatrixWorld(true);

    // structural highlight rings
    ((bike.rings.children[0] as THREE.Mesh).material as THREE.Material).opacity = win(p, 0.025, 0.04, 0.09, 0.105) * 0.95;

    // ---------------- assembly ----------------
    const q = seg(p, 0.18, 0.42);
    COMP.forEach((c) => {
      const part = bike.parts[c.id];
      const anchor = part.userData.anchor;
      const t = seg(q, c.a, c.b);
      const travel = sm(seg(t, 0.2, 0.85));
      let ox = 0; let oy = 0; let oz = 0;
      if (q < c.b) {
        const ax = bx + anchor.x; const ay = by + anchor.y; const az = bz + anchor.z;
        ox = (c.tray[0] - ax) * (1 - travel);
        oy = (c.tray[1] - ay) * (1 - travel) + Math.sin(Math.PI * travel) * 0.55;
        oz = (c.tray[2] - az) * (1 - travel);
      }
      part.position.set(anchor.x + ox, anchor.y + oy, anchor.z + oz);
      partWorld[c.id].set(bx + anchor.x + ox, by + anchor.y + oy, bz + anchor.z + oz);
      if (q >= c.a && q <= c.b && p >= 0.18 && p <= 0.42) {
        labels.push({ text: String(COMP.indexOf(c) + 2).padStart(2, '0') + ' · ' + c.n, pos: partWorld[c.id].clone(), o: seg(t, 0, 0.08) * (1 - seg(t, 0.9, 1)) });
      }
    });

    // carrier + fixture post
    const carrierX = p < 0.425 ? bx : CELL_X;
    const fh = 1 - sm(seg(q, 0.40, 0.46));
    factory.carrier.position.x = carrierX;
    const postH = Math.max(0.001, 0.13 * fh);
    factory.post.scale.y = postH;
    factory.post.position.y = 0.19 + postH / 2;
    factory.cradle.position.y = 0.19 + postH;
    factory.cradle.visible = fh > 0.05;

    // ---------------- robots ----------------
    const robotPose = (r: Robot, side: 'L' | 'R', wake: number) => {
      const dir = side === 'L' ? 1 : -1;
      const base = r.root.position;
      const rest = tmp.set(base.x + dir * lerp(0.25, 0.35, wake), lerp(0.55, 1.75, wake), lerp(-1.0, -0.85, wake)).clone();
      let target = rest;
      for (const c of COMP) {
        if (c.robot !== side) continue;
        const pos = partWorld[c.id].clone().add(new THREE.Vector3(0, c.grip, 0));
        if (q >= c.a && q <= c.b && q > 0) {
          const t = seg(q, c.a, c.b);
          target = t < 0.2 ? rest.clone().lerp(pos, sm(t / 0.2)) : pos;
          break;
        }
        if (q > c.b && q < c.b + 0.05) { target = pos.clone().lerp(rest, sm(seg(q, c.b, c.b + 0.05))); break; }
      }
      solveRobot(r, target);
      r.lightMat.emissive.setHex(wake > 0.5 ? 0xc8102e : 0x000000);
      r.lightMat.color.setHex(wake > 0.5 ? 0xc8102e : 0x9aa0a6);
    };
    robotPose(robotL, 'L', sm(seg(p, 0.115, 0.15)));
    robotPose(robotR, 'R', sm(seg(p, 0.135, 0.17)));

    // ---------------- truck ----------------
    truck.group.position.set(tr, 0, 0);
    truck.wheels.forEach((w) => { w.rotation.z = -tr / 0.45; });
    const doorO = Math.max(sm(seg(p, 0.595, 0.605)) * (1 - sm(seg(p, 0.655, 0.668))), sm(seg(p, 0.82, 0.835)) * (1 - sm(seg(p, 0.862, 0.872))));
    truck.doors.forEach((d) => { d.rotation.y = d.userData.side * 2.6 * doorO; });
    const rampO = Math.max(sm(seg(p, 0.60, 0.612)) * (1 - sm(seg(p, 0.648, 0.658))), sm(seg(p, 0.835, 0.842)) * (1 - sm(seg(p, 0.862, 0.869))));
    truck.ramp.visible = rampO > 0.01;
    truck.ramp.rotation.z = lerp(-1.25, Math.asin(DECK / RAMP_LEN), rampO);
    const cut = Math.max(sm(seg(p, 0.598, 0.61)) * (1 - sm(seg(p, 0.664, 0.68))), sm(seg(p, 0.826, 0.836)) * (1 - sm(seg(p, 0.868, 0.88))));
    truck.fadeMats.forEach((m) => { m.opacity = 1 - 0.86 * cut; m.depthWrite = cut < 0.05; });
    truck.straps.visible = p > 0.645 && p < 0.84;

    // ---------------- inspection ----------------
    const qcOn = seg(p, 0.525, 0.535) * (1 - seg(p, 0.60, 0.62));
    factory.sweep.position.x = lerp(12.7, 15.3, sm(seg(p, 0.535, 0.59)));
    factory.sweepMat.opacity = win(p, 0.53, 0.54, 0.585, 0.595) * 0.38;
    factory.qcSpot.intensity = qcOn * 28;
    factory.qcBarMat.color.setHex(qcOn > 0.5 ? 0xffffff : 0x9aa0a6);
    QC_POINTS.forEach((pt, i) => {
      const o = sm(seg(p, 0.538 + i * 0.0085, 0.544 + i * 0.0085)) * (1 - seg(p, 0.60, 0.615));
      if (o > 0.01) qcMarks.push({ pos: bike.group.localToWorld(new THREE.Vector3(...pt)), o });
    });

    // ---------------- showroom ----------------
    const showO = sm(seg(p, 0.885, 0.93));
    dealer.glassMat.opacity = 0.5 - 0.42 * showO;
    dealer.spots.forEach((s, i) => { s.intensity = (i === 0 ? 40 : 18) * (0.2 + 0.8 * showO); });

    // ---------------- camera ----------------
    tgt.set(bx, by + 0.55, bz);
    tgt.lerp(v.set(tr + 2.6, 1.3, 0), seg(p, 0.645, 0.67) * (1 - seg(p, 0.80, 0.825)));
    tgt.lerp(v.set(163, 2.0, -5), seg(p, 0.80, 0.82) * (1 - seg(p, 0.835, 0.855)));
    const wide = v.set(4, 1.2, -1);
    tgt.copy(wide.lerp(tgt, sm(seg(p, 0, 0.07))));
    const r = kf(p, [[0, 12], [0.07, 3.8], [0.10, 4.4], [0.165, 5.6], [0.20, 4.6], [0.30, 4.2], [0.40, 4.4], [0.445, 6], [0.49, 5.2], [0.53, 4.6], [0.585, 4.0], [0.615, 7.5], [0.65, 9], [0.68, 10], [0.72, 13], [0.76, 11], [0.79, 14], [0.83, 19], [0.86, 6.5], [0.90, 9], [0.95, 3.8], [1, 4.2]]) * view.rMul;
    const az = kf(p, [[0, -30], [0.07, 28], [0.10, -8], [0.165, 18], [0.20, 35], [0.30, -32], [0.40, 14], [0.445, 48], [0.49, -18], [0.53, 28], [0.585, -22], [0.615, -35], [0.65, 12], [0.68, 28], [0.72, -25], [0.76, 42], [0.79, 8], [0.83, 22], [0.86, -30], [0.90, 10], [0.95, 40], [1, 55]]) * Math.PI / 180 * (view.reduced ? 0.6 : 1);
    const el = kf(p, [[0, 30], [0.07, 12], [0.10, 14], [0.165, 20], [0.20, 16], [0.30, 13], [0.40, 20], [0.445, 10], [0.49, 9], [0.53, 14], [0.585, 11], [0.615, 14], [0.65, 12], [0.68, 10], [0.72, 8], [0.76, 14], [0.79, 20], [0.83, 14], [0.86, 12], [0.90, 16], [0.95, 10], [1, 12]]) * Math.PI / 180;
    camera.position.set(
      tgt.x + r * Math.sin(az) * Math.cos(el),
      tgt.y + r * Math.sin(el),
      tgt.z + r * Math.cos(az) * Math.cos(el)
    );
    camera.lookAt(tgt);
    camera.updateMatrixWorld();

    sun.position.set(tgt.x + 7, tgt.y + 14, tgt.z + 9);
    sun.target.position.copy(tgt);
    sun.target.updateMatrixWorld();

    // ---------------- labels + chips ----------------
    const L = (text: string, pos: THREE.Vector3, o: number) => { if (o > 0.02) labels.push({ text, pos, o }); };
    const local = (x: number, y: number, z: number) => bike.group.localToWorld(new THREE.Vector3(x, y, z));
    L('FRAME', local(0.25, 0.73, 0.08), win(p, 0.028, 0.042, 0.085, 0.1));
    L('STRUCTURAL CORE', local(-0.21, 0.44, 0.1), win(p, 0.036, 0.05, 0.085, 0.1));
    L('ASSEMBLY FIXTURE', new THREE.Vector3(carrierX - 0.05, 0.22, 0.12), win(p, 0.044, 0.058, 0.085, 0.1));
    L('ROBOTIC ASSEMBLY', robotL.el.getWorldPosition(new THREE.Vector3()), win(p, 0.13, 0.145, 0.175, 0.19));
    L('PRECISION POSITIONING', new THREE.Vector3(carrierX + 0.7, 0.18, 0.35), win(p, 0.15, 0.162, 0.178, 0.19));
    L('COMPONENT INSTALLATION', new THREE.Vector3(7.4, 1.6, -2.7), win(p, 0.155, 0.167, 0.178, 0.19));

    const top = local(0, 1.4, 0);
    const C = (text: string, pos: THREE.Vector3, o: number, dark = true) => { if (o > 0.02) chips.push({ text, pos, o, dark }); };
    C('ASSEMBLY COMPLETE', top, win(p, 0.412, 0.422, 0.462, 0.472));
    C('FINAL CHECK', top, win(p, 0.468, 0.478, 0.522, 0.532));
    C('READY FOR TRANSPORT', top, win(p, 0.583, 0.589, 0.632, 0.642));
    C('YOUR MOTORCYCLE · SECURED INSIDE', new THREE.Vector3(tr + 1.7, 3.1, 0), win(p, 0.664, 0.678, 0.818, 0.832));
    C('THIS MOTORCYCLE', top, clamp((r / view.rMul - 7) / 2, 0, 1) * (onTruck ? 0 : 1) * (1 - seg(p, 0.86, 0.88)) * (p > 0.64 && p < 0.66 ? 0 : 1), false);

    return { labels, chips, qc: qcMarks, q, stage: stageOf(p), tintCool: qcOn * 0.22, tintWarm: showO * 0.22 };
  };
}
