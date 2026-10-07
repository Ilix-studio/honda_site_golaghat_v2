import * as THREE from 'three';

const legGeo = new THREE.CapsuleGeometry(0.075, 0.72, 6, 12);
const torsoGeo = new THREE.CapsuleGeometry(0.17, 0.4, 6, 16);
const armGeo = new THREE.CapsuleGeometry(0.052, 0.52, 6, 10);
const headGeo = new THREE.SphereGeometry(0.11, 20, 14);

/** quiet, non-cartoon human silhouette (~1.72 m), facing +z */
export function person(mat: THREE.Material, { tablet = false }: { tablet?: boolean } = {}) {
  const g = new THREE.Group();
  [-0.09, 0.09].forEach((x) => {
    const l = new THREE.Mesh(legGeo, mat);
    l.position.set(x, 0.44, 0);
    g.add(l);
  });
  const t = new THREE.Mesh(torsoGeo, mat);
  t.position.y = 1.17;
  t.scale.z = 0.68;
  g.add(t);
  [-0.25, 0.25].forEach((x) => {
    const a = new THREE.Mesh(armGeo, mat);
    a.position.set(x, 1.1, tablet ? 0.08 : 0);
    a.rotation.x = tablet ? -0.5 : 0;
    g.add(a);
  });
  const h = new THREE.Mesh(headGeo, mat);
  h.position.y = 1.6;
  g.add(h);
  if (tablet) {
    const tab = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.015), new THREE.MeshStandardMaterial({ color: 0x2b2e33 }));
    tab.position.set(0, 1.02, 0.3);
    tab.rotation.x = -0.9;
    g.add(tab);
  }
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
