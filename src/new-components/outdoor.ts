import * as THREE from 'three';
import { M } from './materials';
import { box, plane, rng, stripeTexture } from './util';

// Illustrative Assam-inspired landscape along an imaginary road (x 17 … 240).
// Nothing here represents a real route.
export function buildOutdoor() {
  const g = new THREE.Group();
  const r = rng(7);

  g.add(plane(900, 700, M.grass, 110, -0.02, -60));
  g.add(plane(14, 22, M.concrete, 25.5, 0.003, -1));
  g.add(plane(223, 7, M.asphalt, 128.5, 0.006, 0));
  [-3.25, 3.25].forEach((z) => g.add(plane(205, 0.1, M.roadLine, 137, 0.008, z)));
  const dashGeo = new THREE.PlaneGeometry(2, 0.12);
  dashGeo.rotateX(-Math.PI / 2);
  const dashes = new THREE.InstancedMesh(dashGeo, M.roadLine, 34);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 34; i++) { m4.makeTranslation(36 + i * 3.6, 0.009, 0); dashes.setMatrixAt(i, m4); }
  dashes.receiveShadow = true;
  g.add(dashes);

  // distant hills (fog does the aerial perspective)
  const hillGeo = new THREE.SphereGeometry(1, 28, 16);
  const hillMats = [0xa8bea2, 0x9fb79a, 0xb4c7b0].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true }));
  for (let i = 0; i < 16; i++) {
    const h = new THREE.Mesh(hillGeo, hillMats[i % 3]);
    const rad = 28 + r() * 34;
    h.scale.set(rad * 1.5, rad * (0.28 + r() * 0.16), rad);
    h.position.set(-20 + i * 18 + r() * 8, -2, -95 - r() * 50);
    g.add(h);
  }
  for (let i = 0; i < 8; i++) {
    const h = new THREE.Mesh(hillGeo, hillMats[(i + 1) % 3]);
    const rad = 30 + r() * 30;
    h.scale.set(rad * 1.6, rad * 0.3, rad);
    h.position.set(i * 34, -2, 120 + r() * 30);
    g.add(h);
  }

  // river hint
  g.add(plane(190, 12, M.water, 115, 0.01, -46));

  // tea gardens: rows of clipped bushes + a few shade trees
  const bushGeo = new THREE.SphereGeometry(1, 10, 8);
  const teaSpots: Array<[number, number]> = [];
  [[36, 70], [112, 140]].forEach(([x0, x1]) => {
    for (let row = 0; row < 10; row++) {
      const z = -9.5 - row * 1.35;
      for (let x = x0; x < x1; x += 1.05) teaSpots.push([x + (r() - 0.5) * 0.15, z]);
    }
  });
  const tea = new THREE.InstancedMesh(bushGeo, M.tea, teaSpots.length);
  const q = new THREE.Quaternion();
  teaSpots.forEach(([x, z], i) => {
    const s = 0.5 + r() * 0.08;
    m4.compose(new THREE.Vector3(x, 0.28, z), q, new THREE.Vector3(s, 0.42, s * 0.9));
    tea.setMatrixAt(i, m4);
  });
  tea.receiveShadow = true;
  g.add(tea);
  const shadeTree = (x: number, z: number, s = 1) => {
    g.add(box(0.12 * s, 3.4 * s, 0.12 * s, M.trunk, x, 1.7 * s, z));
    const c = new THREE.Mesh(bushGeo, M.canopy);
    c.scale.set(1.8 * s, 0.45 * s, 1.8 * s);
    c.position.set(x, 3.5 * s, z);
    c.castShadow = true;
    g.add(c);
  };
  [[40, -12], [48, -16], [58, -11], [66, -17], [116, -13], [126, -18], [134, -12]].forEach(([x, z]) => shadeTree(x, z));

  // betel-nut palms
  const trunkGeo = new THREE.CylinderGeometry(0.08, 0.12, 1, 8);
  const frondGeo = new THREE.SphereGeometry(1, 10, 6);
  const palm = (x: number, z: number) => {
    const p = new THREE.Group();
    const h = 6.5 + r() * 2.5;
    const t = new THREE.Mesh(trunkGeo, M.trunk);
    t.scale.y = h;
    t.position.y = h / 2;
    t.castShadow = true;
    p.add(t);
    for (let i = 0; i < 7; i++) {
      const f = new THREE.Mesh(frondGeo, M.leaf);
      const a = (i / 7) * Math.PI * 2 + r();
      f.scale.set(1.1, 0.04, 0.17);
      f.position.set(Math.cos(a) * 0.9, h - 0.35, Math.sin(a) * 0.9);
      f.rotation.set(0, -a, -0.45);
      f.castShadow = true;
      p.add(f);
    }
    p.rotation.z = (r() - 0.5) * 0.06;
    p.position.set(x, 0, z);
    g.add(p);
  };
  [[30, -7], [31.4, -8.2], [47, -6.5], [54, -7.8], [55.2, -6.2], [82, -7], [83.5, -8.4], [97, 7.2], [99, 8.4], [110, -7.2], [129, -6.8], [130.6, -8], [146, -7], [44, 7.5], [72, 8], [121, 7.6]].forEach(([x, z]) => palm(x, z));

  // stilt houses (chang ghar style)
  const wallTex = stripeTexture('#CDB98F', '#B49E74', 14);
  wallTex.repeat.set(4, 1);
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9 });
  const postMat = new THREE.MeshStandardMaterial({ color: 0x6b5e4e, roughness: 0.9 });
  const house = (x: number, z: number, rot: number) => {
    const h = new THREE.Group();
    [-2.6, -0.9, 0.9, 2.6].forEach((px) => [-1.5, 1.5].forEach((pz) => h.add(box(0.14, 1.25, 0.14, postMat, px, 0.62, pz))));
    h.add(box(6, 0.15, 3.6, postMat, 0, 1.3, 0));
    h.add(box(5.2, 2.0, 3.0, wallMat, 0, 2.35, 0));
    h.add(box(0.8, 1.5, 0.04, postMat, -0.6, 2.1, 1.52));
    h.add(box(0.8, 0.5, 0.04, postMat, 1.4, 2.6, 1.52));
    const gable = new THREE.Shape();
    gable.moveTo(-1.5, 0); gable.lineTo(1.5, 0); gable.lineTo(0, 0.85); gable.lineTo(-1.5, 0);
    const gGeo = new THREE.ExtrudeGeometry(gable, { depth: 5.2, bevelEnabled: false });
    gGeo.translate(0, 0, -2.6);
    const gm = new THREE.Mesh(gGeo, wallMat);
    gm.rotation.y = Math.PI / 2;
    gm.position.y = 3.35;
    h.add(gm);
    [1, -1].forEach((s) => {
      const roof = box(6.6, 0.08, 2.15, M.tin, 0, 3.78, s * 0.95);
      roof.rotation.x = s * 0.41;
      h.add(roof);
    });
    const stair = box(0.7, 0.06, 1.6, postMat, -3.3, 0.65, 1.0);
    stair.rotation.z = 0.75;
    h.add(stair);
    h.position.set(x, 0, z);
    h.rotation.y = rot;
    h.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.add(h);
  };
  house(52, -11.5, 0.05);
  house(92, -11, -0.08);
  house(128, -24, 0.1);
  house(74, 12.5, Math.PI + 0.06);

  // bamboo clumps
  const caneGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 6);
  const bamboo = (x: number, z: number) => {
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Mesh(caneGeo, M.bamboo);
      const h = 6 + r() * 3;
      const lean = (r() - 0.5) * 0.5;
      const dir = r() * Math.PI * 2;
      c.scale.y = h;
      c.position.set(x + Math.cos(dir) * (h / 2) * Math.sin(lean), h / 2 * Math.cos(lean), z + Math.sin(dir) * (h / 2) * Math.sin(lean));
      c.rotation.set(Math.sin(dir) * lean, 0, -Math.cos(dir) * lean);
      c.castShadow = true;
      g.add(c);
    }
  };
  [[61, -8], [104, -8.5], [143, -9], [88, 8.6]].forEach(([x, z]) => bamboo(x, z));

  // roadside broadleaf trees
  [[35, 8], [64, -7.2], [78, 9], [118, -7], [138, 8.6], [150, -8]].forEach(([x, z]) => {
    g.add(box(0.22, 2.6, 0.22, M.trunk, x, 1.3, z));
    [[0, 3.4, 0, 1.6], [-0.9, 2.9, 0.3, 1.2], [0.9, 3.0, -0.2, 1.3]].forEach(([dx, y, dz, s]) => {
      const c = new THREE.Mesh(bushGeo, M.canopy);
      c.scale.setScalar(s);
      c.position.set(x + dx, y, z + dz);
      c.castShadow = true;
      g.add(c);
    });
  });

  // distant tree line
  const far = new THREE.InstancedMesh(bushGeo, M.canopy, 170);
  for (let i = 0; i < 170; i++) {
    const s = 1.8 + r() * 2.4;
    m4.compose(new THREE.Vector3(20 + r() * 200, s * 0.8, -30 - r() * 40), q, new THREE.Vector3(s, s * 1.1, s));
    far.setMatrixAt(i, m4);
  }
  g.add(far);

  // power poles + sagging wires
  const poleTops: number[] = [];
  for (let x = 24; x <= 152; x += 16) {
    g.add(box(0.16, 7.4, 0.16, M.steel, x, 3.7, 4.9));
    g.add(box(0.08, 0.08, 1.4, M.steel, x, 7.1, 4.9));
    poleTops.push(x);
  }
  const wireMat = new THREE.LineBasicMaterial({ color: 0x6b7077 });
  [4.35, 5.45].forEach((z) => {
    const pts = [];
    for (let i = 0; i < poleTops.length - 1; i++) {
      const a = poleTops[i];
      const b = poleTops[i + 1];
      for (let k = 0; k <= 12; k++) {
        const t = k / 12;
        pts.push(new THREE.Vector3(a + (b - a) * t, 7.12 - Math.sin(Math.PI * t) * 0.55, z));
      }
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), wireMat));
  });

  return { group: g };
}
