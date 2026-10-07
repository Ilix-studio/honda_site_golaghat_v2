import * as THREE from 'three';

// Palette: warm white, deep charcoal, metallic grey, industrial blue-grey,
// restrained Honda-inspired red used only as an accent (and on the hero bike).
export const COLORS = {
  red: 0xc8102e,
  charcoal: 0x1e2023,
  warmWhite: 0xf4f2ee,
  sky: 0xdfe7ea
};

const std = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...o });

export const M = {
  // motorcycle
  frame: std(0x2c2f33, { metalness: 0.55, roughness: 0.38 }),
  paint: new THREE.MeshPhysicalMaterial({ color: COLORS.red, roughness: 0.28, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.06 }),
  pearl: new THREE.MeshPhysicalMaterial({ color: 0xece9e3, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.1 }),
  engine: std(0x474b51, { metalness: 0.6, roughness: 0.42 }),
  engineLight: std(0x5a5f66, { metalness: 0.6, roughness: 0.35 }),
  fins: std(0x7a8088, { metalness: 0.7, roughness: 0.3 }),
  chrome: std(0xc4c9ce, { metalness: 1, roughness: 0.16 }),
  alloy: std(0x8c9299, { metalness: 0.8, roughness: 0.3 }),
  rubber: std(0x1a1c1f, { roughness: 0.92 }),
  seat: std(0x1f2124, { roughness: 0.8 }),
  slate: std(0x5f7280, { roughness: 0.55 }),
  red: std(COLORS.red, { roughness: 0.4 }),
  tail: std(COLORS.red, { emissive: 0x8a0a1f, emissiveIntensity: 0.9 }),
  lens: std(0xf4f8fb, { emissive: 0xf4f8fb, emissiveIntensity: 0.9, roughness: 0.1 }),
  amber: std(0xd9963a, { emissive: 0x8a5a1a, emissiveIntensity: 0.4 }),
  ghost: std(0xb7bcc1, { roughness: 0.55, metalness: 0.2 }),
  highlight: new THREE.MeshBasicMaterial({ color: COLORS.red, transparent: true, opacity: 0, depthTest: false, toneMapped: false }),

  // robots + equipment
  robot: std(0xefede8, { roughness: 0.42 }),
  robotDark: std(0x2b2e33, { roughness: 0.5, metalness: 0.3 }),
  steel: std(0x6b7077, { metalness: 0.5, roughness: 0.45 }),
  dark: std(0x2b2e33, { roughness: 0.6, metalness: 0.2 }),
  charcoal: std(COLORS.charcoal, { roughness: 0.6 }),
  carrier: std(0x5f7280, { roughness: 0.5, metalness: 0.2 }),

  // architecture
  floor: std(0xe2ded7, { roughness: 0.88 }),
  wall: std(0xebe8e2, { roughness: 0.95 }),
  wainscot: std(0xdcd8d1, { roughness: 0.95 }),
  window: new THREE.MeshBasicMaterial({ color: 0xf8f7f3, toneMapped: false }),
  lamp: new THREE.MeshBasicMaterial({ color: 0xfffaf0, toneMapped: false }),
  lane: std(0xccc8c0, { roughness: 0.9 }),
  redLine: std(COLORS.red, { roughness: 0.7 }),

  // outdoors
  asphalt: std(0x4a4d51, { roughness: 0.95 }),
  roadLine: std(0xedebe6, { roughness: 0.8 }),
  grass: std(0xa3b28b, { roughness: 1 }),
  concrete: std(0xd6d2ca, { roughness: 0.9 }),
  paving: std(0xdcd7cf, { roughness: 0.85 }),
  leaf: std(0x5e7f4e, { roughness: 0.9, side: THREE.DoubleSide }),
  tea: std(0x6f9160, { roughness: 0.95 }),
  canopy: std(0x7e9b6b, { roughness: 0.95 }),
  trunk: std(0x7a6e5c, { roughness: 0.95 }),
  bamboo: std(0x7c9a5c, { roughness: 0.8 }),
  tin: std(0x7f8b90, { roughness: 0.5, metalness: 0.5 }),
  water: std(0xc9d9de, { roughness: 0.2 }),

  // people
  worker: std(0xb8bcc1, { roughness: 0.85 }),
  staff: std(0x5f6369, { roughness: 0.85 })
};
