import * as THREE from 'three';
import { M } from './materials';
import { box, plane, sign } from './util';
import { ghostBike } from './bike';
import { person } from './people';

// Tsangpool Honda dealership: service bay x 156–161, showroom x 161–174,
// front (glass) at z = −4. The hero bike ends on the turntable at (166, −8.5).
export const TURNTABLE = new THREE.Vector3(166, 0, -8.5);

export function buildDealer() {
  const g = new THREE.Group();
  g.add(plane(34, 22, M.paving, 166, 0.004, -5.5));
  const showFloor = new THREE.MeshStandardMaterial({ color: 0xece7df, roughness: 0.12, metalness: 0.05 });
  g.add(plane(13, 9, showFloor, 167.5, 0.012, -8.5));

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf3efe8, roughness: 0.9 });
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xe3e0da, roughness: 0.9 });

  // service bay
  g.add(box(5, 4.6, 0.2, sideMat, 158.5, 2.3, -4.1));
  const door = box(3.2, 3.1, 0.05, new THREE.MeshStandardMaterial({ color: 0x34373b, roughness: 0.8 }), 158.5, 1.55, -3.98);
  g.add(door);
  g.add(box(3.2, 0.7, 0.07, new THREE.MeshStandardMaterial({ color: 0xc9c5be }), 158.5, 2.75, -3.95));
  g.add(box(5, 4.6, 9, sideMat, 158.5, 2.3, -8.6));
  const svc = sign('SERVICE', 1.6, 0.26, { fg: '#4F5459', bg: '#E3E0DA' });
  svc.position.set(158.5, 3.7, -3.98);
  g.add(svc);

  // showroom shell
  g.add(box(13, 4.6, 0.2, wallMat, 167.5, 2.3, -13.1));
  g.add(box(0.2, 4.6, 9.2, wallMat, 174.1, 2.3, -8.5));
  g.add(box(13.4, 0.2, 9.4, wallMat, 167.5, 4.7, -8.5));
  g.add(box(13, 0.06, 0.04, new THREE.MeshStandardMaterial({ color: 0xe2dcd2 }), 167.5, 1.2, -12.98));
  const tag = sign('BUILT · CHECKED · DELIVERED', 4.2, 0.28, { fg: '#7A7F85', bg: '#F3EFE8' });
  tag.position.set(167.5, 3.4, -12.98);
  g.add(tag);
  g.add(box(2.2, 1.0, 0.8, new THREE.MeshStandardMaterial({ color: 0xe2dcd2, roughness: 0.7 }), 172, 0.5, -11.6));

  // turntable
  const turntable = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.4, 0.06, 64), M.charcoal);
  turntable.position.set(TURNTABLE.x, 0.03, TURNTABLE.z);
  turntable.receiveShadow = true;
  g.add(turntable);

  // glass front with a door gap where the bike rolls in
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xc7d3d8, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.5, depthWrite: false });
  [[161, 162.6], [165.1, 174]].forEach(([a, b]) => {
    const gp = new THREE.Mesh(new THREE.PlaneGeometry(b - a, 4.4), glassMat);
    gp.position.set((a + b) / 2, 2.3, -4);
    g.add(gp);
  });
  for (let x = 161; x <= 174.01; x += 1.3) {
    if (x > 162.7 && x < 165) continue;
    g.add(box(0.05, 4.4, 0.06, M.steel, x, 2.3, -4));
  }
  [160.95, 174.1].forEach((x) => g.add(box(0.2, 4.6, 0.2, M.dark, x, 2.3, -4)));

  // fascia + roof
  g.add(box(18.4, 0.15, 9.8, M.dark, 165, 4.85, -8.6));
  g.add(box(18.4, 0.8, 0.22, M.charcoal, 165, 5.3, -3.9));
  const fascia = sign('TSANGPOOL HONDA GOLAGHAT', 5.6, 0.3, { fg: '#F4F2EE', bg: '#1E2023', font: '600 36px "IBM Plex Sans", sans-serif', spacing: 7 });
  fascia.position.set(160.2, 5.3, -3.785);
  g.add(fascia);
  g.add(box(0.5, 0.12, 0.05, M.red, 156.6, 5.3, -3.77));

  // pylon
  g.add(box(0.24, 5, 0.24, M.dark, 176.5, 2.5, -1.8));
  const pyl = box(1.8, 1.6, 0.25, new THREE.MeshStandardMaterial({ color: 0xf4f2ee }), 176.5, 5.6, -1.8);
  g.add(pyl);
  g.add(box(1.8, 0.12, 0.26, M.red, 176.5, 6.36, -1.8));
  [1, -1].forEach((s) => {
    const h = sign('HONDA', 1.5, 0.42, { fg: '#C8102E', bg: '#F4F2EE', font: '700 120px "IBM Plex Sans", sans-serif', spacing: 10 });
    h.position.set(176.5, 5.8, -1.8 + s * 0.13);
    if (s < 0) h.rotation.y = Math.PI;
    g.add(h);
    const t = sign('TSANGPOOL', 1.4, 0.2, { fg: '#1E2023', bg: '#F4F2EE' });
    t.position.set(176.5, 5.2, -1.8 + s * 0.13);
    if (s < 0) t.rotation.y = Math.PI;
    g.add(t);
  });

  // secondary display bikes (grey on purpose — the red one is the hero)
  [[163, -11.2, 0.5], [171, -10.6, -0.5], [176.8, -5.6, 0.3], [179.2, -6.0, 0.3]].forEach(([x, z, ry]) => {
    const b = ghostBike();
    b.position.set(x, 0, z);
    b.rotation.y = ry;
    b.scale.setScalar(0.96);
    g.add(b);
  });

  // people
  const staffA = person(M.staff); staffA.position.set(156.4, 0, 1.7); staffA.rotation.y = -0.4; g.add(staffA);
  const staffB = person(M.staff); staffB.position.set(159.6, 0, -2.6); staffB.rotation.y = 0.5; g.add(staffB);

  // showroom lighting
  const spots = [[166, -8.5], [163, -10.5], [170.5, -10]].map(([x, z]) => {
    const s = new THREE.SpotLight(0xfff1dc, 0, 9, 0.55, 0.55, 1.2);
    s.position.set(x, 4.5, z + 0.6);
    s.target.position.set(x, 0, z);
    g.add(s, s.target);
    const fix = box(0.3, 0.12, 0.3, M.dark, x, 4.55, z + 0.6);
    g.add(fix);
    return s;
  });

  g.traverse((o) => { if ((o as THREE.Mesh).isMesh && !((o as THREE.Mesh).material as THREE.Material).transparent) { o.castShadow = o.castShadow || false; o.receiveShadow = true; } });
  return { group: g, glassMat, spots, turntable };
}
