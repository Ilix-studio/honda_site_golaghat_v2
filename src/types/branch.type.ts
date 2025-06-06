// Define Types
export interface StaffMember {
  name: string;
  position: string;
}

export interface InventoryType {
  sport: number;
  adventure: number;
  cruiser: number;
  touring: number;
  naked: number;
}

export interface BranchType {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  staff: StaffMember[];
  rating: number;
  reviews: number;
  image: string;
  mapUrl: string;
  featured: boolean;
  inventory: InventoryType;
}

export interface BranchesProps {
  defaultBranch?: string;
}
