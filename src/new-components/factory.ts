import * as THREE from 'three';
import { M } from './materials';
import { box, plane, sign, meshTexture } from './util';
import { person } from './people';

// Factory occupies x −8 … 18.5, z −9 … 9. The front (+z) is left open as a
// cutaway so the camera can orbit freely. Stations sit on the z = 0 line:
//   x 0 frame prep · x 6 robotic cell · x 10 outfeed · x 14 final inspection
//   loading opening on the +x wall, truck docks outside at x 19.6.
export function buildFactory() {
  const g = new THREE.Group();

  // floor + markings
  g.add(plane(26.5, 18, M.floor, 5.25, 0.002, 0));
  [-1.9, 1.9].forEach((z) => g.add(plane(26, 0.07, M.lane, 5.25, 0.004, z)));
  // outfeed box (red, restrained)
  [[10, -0.75, 1.6, 0.05], [10, 0.75, 1.6, 0.05], [9.2, 0, 0.05, 1.5], [10.8, 0, 0.05, 1.5]].forEach(([x, z, w, d]) => g.add(plane(w, d, M.redLine, x, 0.005, z)));
  g.add(plane(2.8, 3.2, M.carrier, 14, 0.004, 0));

  // walls
  g.add(box(26.5, 8, 0.25, M.wall, 5.25, 4, -9.12));
  g.add(box(26.5, 1.2, 0.03, M.wainscot, 5.25, 0.6, -8.98));
  for (let x = -7; x <= 18; x += 1.6) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.6), M.window);
    w.position.set(x, 4.3, -8.98);
    g.add(w);
  }
  g.add(box(0.25, 8, 18, M.wall, -8.12, 4, 0));
  g.add(box(0.25, 8, 6.6, M.wall, 18.62, 4, -5.7));
  g.add(box(0.25, 2.6, 11.4, M.wall, 18.62, 6.7, 3.3));
  for (let x = -8; x <= 18; x += 4) g.add(box(0.3, 8, 0.3, M.wainscot, x, 4, -8.8));
  for (let x = -6; x <= 18; x += 4) g.add(box(0.16, 0.3, 18, M.steel, x, 7.75, 0));
  [-4, 0, 4].forEach((z) => g.add(box(26.5, 0.16, 0.16, M.steel, 5.25, 7.55, z)));
  g.add(box(26.8, 0.15, 18.4, M.wall, 5.25, 8.1, 0));

  // pendant lamps
  const shadeGeo = new THREE.CylinderGeometry(0.12, 0.36, 0.24, 24, 1, true);
  const discGeo = new THREE.CircleGeometry(0.33, 24);
  for (let x = -1.5; x <= 16.5; x += 3) {
    [0.6, -4.5].forEach((z) => {
      g.add(box(0.015, 2.2, 0.015, M.steel, x, 6.7, z));
      const s = new THREE.Mesh(shadeGeo, M.dark);
      s.position.set(x, 5.5, z);
      g.add(s);
      const d = new THREE.Mesh(discGeo, M.lamp);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, 5.39, z);
      g.add(d);
    });
  }

  // ---------- station 01: frame prep ----------
  const bench = (x: number, z: number) => {
    g.add(box(1.5, 0.06, 0.7, M.steel, x, 0.9, z));
    [[-0.68, -0.3], [0.68, -0.3], [-0.68, 0.3], [0.68, 0.3]].forEach(([dx, dz]) => g.add(box(0.05, 0.88, 0.05, M.steel, x + dx, 0.44, z + dz)));
    g.add(box(1.4, 1.0, 0.04, M.wainscot, x, 1.65, z - 0.4));
    for (let i = 0; i < 5; i++) g.add(box(0.04, 0.22 + (i % 3) * 0.08, 0.03, M.dark, x - 0.5 + i * 0.22, 1.7, z - 0.36));
  };
  bench(-1.8, -1.9);
  bench(2.0, -2.0);
  g.add(box(0.4, 0.14, 0.3, M.alloy, 2.2, 1.0, -2.0));
  g.add(box(0.3, 0.1, 0.25, M.carrier, 1.6, 0.98, -1.9));
  const w1 = person(M.worker); w1.position.set(-1.5, 0, -2.85); g.add(w1);
  const w2 = person(M.worker); w2.position.set(2.5, 0, -2.95); w2.rotation.y = -0.4; g.add(w2);
  const sg = (text: string, x: number) => {
    const s = sign(text, 3.4, 0.34, { fg: '#F4F2EE', bg: '#1E2023' });
    s.position.set(x, 3.4, -3.3);
    g.add(s);
    g.add(box(0.012, 4.4, 0.012, M.steel, x - 1.4, 5.8, -3.3));
    g.add(box(0.012, 4.4, 0.012, M.steel, x + 1.4, 5.8, -3.3));
  };
  sg('STATION 01 · FRAME PREP', 0);

  // conveyor + carrier
  g.add(box(9.6, 0.08, 0.9, M.dark, 3.5, 0.04, 0));
  const rollerGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.86, 10);
  const rollers = new THREE.InstancedMesh(rollerGeo, M.steel, 38);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
  for (let i = 0; i < 38; i++) {
    m4.compose(new THREE.Vector3(-1.2 + i * 0.25, 0.1, 0), q, new THREE.Vector3(1, 1, 1));
    rollers.setMatrixAt(i, m4);
  }
  g.add(rollers);

  const carrier = new THREE.Group();
  carrier.add(box(1.5, 0.07, 0.7, M.carrier, 0, 0.155, 0));
  const post = box(0.1, 1, 0.12, M.dark, -0.05, 0, 0);
  const cradle = box(0.42, 0.04, 0.22, M.dark, -0.05, 0, 0);
  carrier.add(post, cradle);
  g.add(carrier);

  // ---------- robotic assembly cell ----------
  const fenceTex = meshTexture();
  const fenceMat = (w: number, h: number) => {
    const t = fenceTex.clone();
    t.needsUpdate = true;
    t.repeat.set(w / 0.22, h / 0.22);
    return new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.25, side: THREE.DoubleSide, roughness: 0.6 });
  };
  const back = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.2), fenceMat(5.6, 2.2));
  back.position.set(6, 1.1, -3.4);
  g.add(back);
  [3.2, 8.8].forEach((x) => {
    const f = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.2), fenceMat(2.8, 2.2));
    f.rotation.y = Math.PI / 2;
    f.position.set(x, 1.1, -2.0);
    g.add(f);
    g.add(box(0.06, 2.3, 0.06, M.dark, x, 1.15, -3.4));
    g.add(box(0.06, 2.3, 0.06, M.dark, x, 1.15, -0.6));
  });
  g.add(box(5.6, 0.05, 0.05, M.dark, 6, 2.22, -3.4));
  const cellSign = sign('ASSEMBLY CELL 03', 2.4, 0.3, { fg: '#F4F2EE', bg: '#1E2023' });
  cellSign.position.set(6, 2.5, -3.38);
  g.add(cellSign);

  const rack = (cx: number) => {
    [[-1.0, -0.33], [1.0, -0.33], [-1.0, 0.33], [1.0, 0.33]].forEach(([dx, dz]) => g.add(box(0.05, 1.8, 0.05, M.steel, cx + dx, 0.9, -2.7 + dz)));
    [0.5, 1.0, 1.5].forEach((y) => g.add(box(2.04, 0.04, 0.72, M.steel, cx, y, -2.7)));
  };
  rack(4.6);
  rack(7.4);

  // ---------- station 04: outfeed ----------
  sg('STATION 04 · OUTFEED', 10);
  const w3 = person(M.worker); w3.position.set(11.9, 0, -2.4); w3.rotation.y = -0.6; g.add(w3);

  // ---------- station 05: final inspection ----------
  [-1.6, 1.6].forEach((z) => g.add(box(0.16, 3, 0.16, M.dark, 14, 1.5, z)));
  g.add(box(0.22, 0.2, 3.4, M.dark, 14, 3.05, 0));
  const qcBarMat = new THREE.MeshBasicMaterial({ color: 0x9aa0a6, toneMapped: false });
  g.add(box(0.12, 0.05, 3.0, qcBarMat, 14, 2.92, 0));
  const sweepMat = new THREE.MeshBasicMaterial({ color: 0xcfe3f2, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const sweep = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.85), sweepMat);
  sweep.rotation.y = Math.PI / 2;
  sweep.position.set(14, 1.45, 0);
  g.add(sweep);
  const qcSpot = new THREE.SpotLight(0xeef4f8, 0, 9, 0.75, 0.6, 1.4);
  qcSpot.position.set(14, 2.85, 0.2);
  qcSpot.target.position.set(14, 0, 0);
  g.add(qcSpot, qcSpot.target);
  const tech = person(M.staff, { tablet: true }); tech.position.set(15.7, 0, -2.0); tech.rotation.y = -0.5; g.add(tech);
  sg('STATION 05 · FINAL INSPECTION', 14);

  // ---------- loading bay (outside, +x wall) ----------
  g.add(box(7.6, 0.15, 7.2, M.dark, 22.4, 5.2, 0.4));
  [-3.0, 3.8].forEach((z) => g.add(box(0.14, 5.2, 0.14, M.dark, 26.1, 2.6, z)));
  const bay = sign('LOADING BAY 02', 2.6, 0.32, { fg: '#F4F2EE', bg: '#1E2023' });
  bay.rotation.y = Math.PI / 2;
  bay.position.set(18.77, 5.9, 3.2);
  g.add(bay);

  g.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.receiveShadow === false && !((o as THREE.Mesh).material as THREE.Material).transparent) o.receiveShadow = true; });
  return { group: g, carrier, post, cradle, sweep, sweepMat, qcSpot, qcBarMat };
}
