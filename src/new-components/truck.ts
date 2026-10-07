import * as THREE from 'three';
import { M } from './materials';
import { box, rod, zcyl, sign } from './util';

// Truck-local frame: origin on the ground at the rear of the cargo box, +x forward.
// Cargo deck height 0.6 m, box 3.4 m long. The ramp folds down from the rear.
export const DECK = 0.6;
export const RAMP_LEN = 1.6;

export function buildTruck() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.55 });
  const cabMat = new THREE.MeshStandardMaterial({ color: 0xe9e7e2, roughness: 0.45 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x5f7280, roughness: 0.15, metalness: 0.4 });

  g.add(box(5.3, 0.16, 1.5, M.dark, 2.6, 0.52, 0));
  g.add(box(3.4, 0.05, 2.0, M.steel, 1.7, 0.585, 0));
  g.add(box(3.4, 2.05, 0.04, bodyMat, 1.7, 1.635, -1.0));
  g.add(box(0.04, 2.05, 2.0, bodyMat, 3.38, 1.635, 0));
  g.add(box(3.44, 0.06, 2.08, bodyMat, 1.7, 2.69, 0));
  [[0, -1], [0, 1], [3.4, -1], [3.4, 1]].forEach(([x, z]) => g.add(box(0.07, 2.12, 0.07, M.dark, x, 1.64, z)));
  g.add(box(3.4, 0.1, 0.045, M.red, 1.7, 1.0, -1.02));
  const farText = sign('MOTORCYCLE TRANSPORT', 2.6, 0.22, { fg: '#1E2023', bg: '#F1EFEA' });
  farText.rotation.y = Math.PI;
  farText.position.set(1.7, 2.3, -1.025);
  g.add(farText);
  const farCredit = sign('MADE BY ILIX WITH LOVE', 2.2, 0.2, { fg: '#1E2023', bg: '#F1EFEA' });
  farCredit.rotation.y = Math.PI;
  farCredit.position.set(1.7, 1.6, -1.025);
  g.add(farCredit);

  // near (camera-side) panel — fades to a cutaway so the bike stays visible
  const panelMat = new THREE.MeshStandardMaterial({ color: 0xf1efea, roughness: 0.55, transparent: true, opacity: 1 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xc8102e, roughness: 0.5, transparent: true, opacity: 1 });
  const near = new THREE.Group();
  near.add(box(3.4, 2.05, 0.04, panelMat, 1.7, 1.635, 1.0));
  near.add(box(3.4, 0.1, 0.045, stripeMat, 1.7, 1.0, 1.02));
  const nearText = sign('MOTORCYCLE TRANSPORT', 2.6, 0.22, { fg: '#1E2023', bg: '#F1EFEA' });
  nearText.material.transparent = true;
  nearText.position.set(1.7, 2.3, 1.025);
  near.add(nearText);
  const nearCredit = sign('MADE BY ILIX WITH LOVE', 2.2, 0.2, { fg: '#1E2023', bg: '#F1EFEA' });
  nearCredit.material.transparent = true;
  nearCredit.position.set(1.7, 1.6, 1.025);
  near.add(nearCredit);
  g.add(near);
  const fadeMats = [panelMat, stripeMat, nearText.material, nearCredit.material];

  // rear doors
  const doorMat = new THREE.MeshStandardMaterial({ color: 0xe3e0da, roughness: 0.55 });
  const doors = [1, -1].map((side) => {
    const hinge = new THREE.Group();
    hinge.position.set(0, 1.635, side * 1.0);
    const leaf = box(0.04, 2.0, 1.0, doorMat, 0, 0, -side * 0.5);
    leaf.add(box(0.03, 0.18, 0.04, M.dark, -0.03, -0.1, side * 0.42));
    hinge.add(leaf);
    hinge.userData.side = side;
    g.add(hinge);
    return hinge;
  });

  // ramp
  const ramp = new THREE.Group();
  ramp.position.set(0, DECK, 0);
  ramp.add(box(RAMP_LEN + 0.02, 0.04, 0.78, M.alloy, -RAMP_LEN / 2, 0, 0));
  for (let i = 1; i < 8; i++) ramp.add(box(0.03, 0.02, 0.78, M.steel, -i * 0.2, 0.03, 0));
  g.add(ramp);

  // straps (visible while secured)
  const straps = new THREE.Group();
  [1, -1].forEach((s) => {
    straps.add(rod([1.1, 0.62, s * 0.62], [1.32, 1.22, s * 0.08], 0.012, M.slate));
    straps.add(rod([1.95, 0.62, s * 0.62], [1.75, 1.25, s * 0.08], 0.012, M.slate));
  });
  g.add(straps);

  // cab
  g.add(box(1.7, 1.85, 2.0, cabMat, 4.35, 1.525, 0));
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.8), glass);
  ws.rotation.y = Math.PI / 2;
  ws.position.set(5.206, 1.95, 0);
  g.add(ws);
  [1, -1].forEach((s) => {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.62), glass);
    sw.position.set(4.7, 2.0, s * 1.006);
    if (s < 0) sw.rotation.y = Math.PI;
    g.add(sw);
    g.add(box(0.08, 0.1, 0.04, M.lens, 5.24, 0.85, s * 0.75));
  });
  g.add(box(1.2, 0.08, 2.02, M.red, 4.3, 1.15, 0));
  g.add(box(0.16, 0.22, 2.0, M.dark, 5.26, 0.55, 0));

  // wheels
  const wheels: THREE.Group[] = [];
  // Wheels sit just outside the body (z ±1.2): at ±0.86 their outer faces were
  // coplanar with the cargo side panel (z ≈ 1.0–1.02) and z-fought with it.
  const WHEEL_Z = 1.2;
  [0.6, 1.45, 4.5].forEach((x) => {
    g.add(rod([x, 0.45, -WHEEL_Z], [x, 0.45, WHEEL_Z], 0.05, M.dark, 12));
    [-WHEEL_Z, WHEEL_Z].forEach((z) => {
      const spin = new THREE.Group();
      spin.position.set(x, 0.45, z);
      spin.add(zcyl(0.45, 0.3, M.rubber, 0, 0, 0, 32));
      spin.add(zcyl(0.25, 0.32, M.alloy, 0, 0, 0, 20));
      spin.add(box(0.06, 0.4, 0.33, M.steel));
      g.add(spin);
      wheels.push(spin);
    });
  });

  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, doors, ramp, straps, fadeMats, wheels };
}
