import type * as THREE from 'three';
import type { buildBike } from './bike';
import type { buildRobot } from './robot';
import type { buildFactory } from './factory';
import type { buildTruck } from './truck';
import type { buildOutdoor } from './outdoor';
import type { buildDealer } from './dealer';

export interface World {
  bike: ReturnType<typeof buildBike>
  robotL: ReturnType<typeof buildRobot>
  robotR: ReturnType<typeof buildRobot>
  factory: ReturnType<typeof buildFactory>
  truck: ReturnType<typeof buildTruck>
  outdoor: ReturnType<typeof buildOutdoor>
  dealer: ReturnType<typeof buildDealer>
}

/** viewport-dependent camera inputs computed in main.ts */
export interface View {
  rMul: number
  reduced: boolean
}

export interface LabelItem { text: string; pos: THREE.Vector3; o: number }
export interface ChipItem extends LabelItem { dark: boolean }
export interface QcItem { pos: THREE.Vector3; o: number }

/** per-frame result of the choreography, consumed by the overlay UI */
export interface FrameOut {
  labels: LabelItem[]
  chips: ChipItem[]
  qc: QcItem[]
  q: number
  stage: number
  tintCool: number
  tintWarm: number
}
