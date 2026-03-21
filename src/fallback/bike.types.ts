// ─── Types ────────────────────────────────────────────────────────────────────

export interface BikeVariant {
  variantName: string;
  price: number;
  onRoadPrice?: number;
}

export interface PriceBreakdown {
  exShowroom: number;
  rto?: number;
  insurance?: number;
  onRoad: number;
}

export interface KeySpecifications {
  mileage?: string;
  topSpeed?: string;
  weight?: string;
  seatHeight?: string;
  fuelCapacity?: string;
  [key: string]: string | undefined;
}

export interface BikeImage {
  url: string;
  alt?: string;
  colorName?: string;
  isPrimary?: boolean;
}

export interface Bike {
  _id: string;
  modelName: string;
  mainCategory: "bike" | "scooter";
  category:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric"
    | "commuter"
    | "automatic"
    | "gearless";
  year: number;
  variants: BikeVariant[];
  priceBreakdown: PriceBreakdown;
  engineSize: string;
  power: number;
  transmission: string;
  fuelNorms: "BS4" | "BS6" | "BS6 Phase 2" | "Electric";
  isE20Efficiency: boolean;
  features: string[];
  colors: string[];
  stockAvailable: number;
  isNewModel?: boolean;
  isActive: boolean;
  keySpecifications: KeySpecifications;
  images?: BikeImage[];
  createdAt: string;
  updatedAt: string;
}