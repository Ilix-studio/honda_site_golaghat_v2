import * as THREE from 'three';
import { M } from './materials';
import { box, zcyl, clamp } from './util';

const SHOULDER_Y = 0.78;

/** Six-axis-style industrial arm: base yaw, shoulder + elbow pitch, wrist keeps the
 *  gripper pointing down. Solved analytically every frame with 2-link IK. */
export type Robot = ReturnType<typeof buildRobot>

export function buildRobot() {
  const L1 = 1.05;
  const L2 = 0.95;
  const root = new THREE.Group();
  root.add(box(0.72, 0.1, 0.72, M.robotDark, 0, 0.05, 0));
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.21, 0.55, 28), M.robot);
  col.position.y = 0.375;
  root.add(col);

  const lightMat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, emissive: 0x000000 });
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), lightMat);
  light.position.set(0, 0.5, 0.2);
  root.add(light);

  const yaw = new THREE.Group();
  yaw.position.y = 0.65;
  root.add(yaw);
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.16, 28), M.robot);
  yaw.add(turret);
  yaw.add(zcyl(0.13, 0.36, M.robotDark, 0, 0.13, 0));

  const sh = new THREE.Group();
  sh.position.y = SHOULDER_Y - 0.65;
  yaw.add(sh);
  const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.095, L1, 8, 20), M.robot);
  upper.rotation.z = -Math.PI / 2;
  upper.position.x = L1 / 2;
  sh.add(upper);

  const el = new THREE.Group();
  el.position.x = L1;
  sh.add(el);
  el.add(zcyl(0.1, 0.28, M.robotDark));
  const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.072, L2, 8, 20), M.robot);
  fore.rotation.z = -Math.PI / 2;
  fore.position.x = L2 / 2;
  el.add(fore);

  const wr = new THREE.Group();
  wr.position.x = L2;
  el.add(wr);
  wr.add(zcyl(0.065, 0.2, M.robotDark));
  wr.add(box(0.06, 0.16, 0.18, M.robotDark, 0.06, 0, 0));
  wr.add(box(0.14, 0.03, 0.03, M.steel, 0.16, 0, 0.06));
  wr.add(box(0.14, 0.03, 0.03, M.steel, 0.16, 0, -0.06));

  root.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { root, yaw, sh, el, wr, light, lightMat, L1, L2 };
}

const _t = new THREE.Vector3();
/** point the arm's wrist at a world-space target (gripper ends ~0.2 m below) */
export function solveRobot(r: Robot, target: THREE.Vector3) {
  const b = r.root.position;
  _t.copy(target);
  const dx = _t.x - b.x;
  const dz = _t.z - b.z;
  r.yaw.rotation.y = Math.atan2(-dz, dx);
  const h = Math.hypot(dx, dz);
  const v = _t.y - (b.y + SHOULDER_Y);
  const dist = Math.max(1e-4, Math.hypot(h, v));
  const dd = clamp(dist, 0.2, r.L1 + r.L2 - 0.01);
  const a = Math.atan2(v, h);
  const cb = clamp((r.L1 * r.L1 + dd * dd - r.L2 * r.L2) / (2 * r.L1 * dd), -1, 1);
  const t1 = a + Math.acos(cb); // elbow up
  const ex = r.L1 * Math.cos(t1);
  const ey = r.L1 * Math.sin(t1);
  const t2 = Math.atan2(dd * Math.sin(a) - ey, dd * Math.cos(a) - ex);
  r.sh.rotation.z = t1;
  r.el.rotation.z = t2 - t1;
  r.wr.rotation.z = -Math.PI / 2 - t2;
}
