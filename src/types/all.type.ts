export interface Bike {
  id: string;
  modelName: string;
  category: string;
  price: number;
  engine: string;
  power: string;
  weight: number;
  transmission: string;
  features: string[];
  colors: string[];
  image: string[];
  year: number;
  isNew?: boolean;
  branch?: string;
  // Add index signature to allow string indexing
  [key: string]: string | number | boolean | string[] | undefined;
}

// Shared data for dealerships
export interface DealershipData {
  id: string;
  name: string;
  address: string;
}

// Shared Props Interface for Steps
export interface StepProps {
  formData: FormData;
  updateFormData?: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  fadeInUp: {
    hidden: { opacity: number; y: number };
    visible: { opacity: number; y: number; transition: { duration: number } };
  };
}
