import activa6G from "../assets/scooty/activa6G.webp";

export const motorcycles = [
  {
    id: 1,
    name: "Honda SP125",
    image: "/motorcycle1.jpg", // Replace with actual image path
    specs: {
      engine: "123.94 cc",
      power: "8kW @ 7500 rpm",
      transmission: "5 GEARS",
    },
    price: "₹ from X",
  },
  {
    id: 2,
    name: "Honda CB Shine",
    image: "/motorcycle2.jpg", // Replace with actual image path
    specs: {
      engine: "125.00 cc",
      power: "7.9kW @ 7500 rpm",
      transmission: "5 GEARS",
    },
    price: "₹ from Y",
  },
  {
    id: 3,
    name: "Honda Dream",
    image: "/motorcycle3.jpg", // Replace with actual image path
    specs: {
      engine: "109.51 cc",
      power: "6.5kW @ 7500 rpm",
      transmission: "4 GEARS",
    },
    price: "₹ from Z",
  },
  // Add more motorcycles as needed
];

// Sample bike models
export const bikeModels = [
  { id: "cbr1000rr", name: "CBR1000RR Fireblade", category: "Sport" },
  { id: "cbr600rr", name: "CBR600RR", category: "Sport" },
  { id: "cbr500r", name: "CBR500R", category: "Sport" },
  { id: "africatwin", name: "Africa Twin", category: "Adventure" },
  { id: "nc750x", name: "NC750X", category: "Adventure" },
  { id: "cb500x", name: "CB500X", category: "Adventure" },
  { id: "rebel1100", name: "Rebel 1100", category: "Cruiser" },
  { id: "rebel500", name: "Rebel 500", category: "Cruiser" },
  { id: "rebel300", name: "Rebel 300", category: "Cruiser" },
  { id: "goldwing", name: "Gold Wing Tour", category: "Touring" },
  { id: "nt1100", name: "NT1100", category: "Touring" },
  { id: "cb1000r", name: "CB1000R", category: "Naked" },
  { id: "cb650r", name: "CB650R", category: "Naked" },
  { id: "cb300r", name: "CB300R", category: "Naked" },
];

// Available dealerships/service centers
export const serviceLocations = [
  {
    id: "service1",
    name: "Honda Service Center Downtown",
    address: "123 Main St, New York, NY 10001",
  },
  {
    id: "service2",
    name: "Honda Motorcycle Service",
    address: "456 Park Ave, Los Angeles, CA 90001",
  },
  {
    id: "service3",
    name: "City Honda Service",
    address: "789 Market St, Chicago, IL 60007",
  },
  {
    id: "service4",
    name: "Metro Honda Service Center",
    address: "321 Oak Rd, Houston, TX 77001",
  },
  {
    id: "service5",
    name: "Capital Honda Service",
    address: "555 Pine Blvd, Miami, FL 33101",
  },
];

// Available time slots
export const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
];

// Service types
export const serviceTypes = [
  {
    id: "regular",
    name: "Regular Maintenance",
    description: "Oil change, filter replacement, and basic inspection",
    estimatedTime: "1-2 hours",
    price: "$150-$250",
  },
  {
    id: "major",
    name: "Major Service",
    description:
      "Comprehensive service including valve clearance check, cooling system flush, and more",
    estimatedTime: "3-5 hours",
    price: "$350-$600",
  },
  {
    id: "tires",
    name: "Tire Replacement",
    description: "Removal and installation of new tires, including balancing",
    estimatedTime: "1-2 hours",
    price: "$250-$450 (plus tire cost)",
  },
  {
    id: "diagnostic",
    name: "Diagnostic Check",
    description:
      "Computer diagnostic to identify issues with electronic systems",
    estimatedTime: "1 hour",
    price: "$100-$150",
  },
  {
    id: "repair",
    name: "Repair Service",
    description: "General repairs for specific issues with your motorcycle",
    estimatedTime: "Varies",
    price: "Varies based on issue",
  },
];

// Additional services
export const additionalServices = [
  { id: "wash", name: "Motorcycle Wash & Detail", price: "50" },
  { id: "brake", name: "Brake Fluid Change", price: "80" },
  { id: "chain", name: "Chain Adjustment & Lubrication", price: "45" },
  {
    id: "battery",
    name: "Battery Check & Replacement",
    price: "25 (check) / 120+ (replacement)",
  },
  { id: "suspension", name: "Suspension Check & Adjustment", price: "75" },
];

// Form data interface
export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bikeModel: string;
  dealership: string;
  date: Date | undefined;
  time: string;
  licenseType: string;
  ridingExperience: string;
  additionalInfo: string;
  termsAccepted: boolean;
}

// Shared data for motorcycle models
export interface MotorcycleData {
  id: string;
  name: string;
  category: string;
}

// Shared data for dealerships
export interface DealershipData {
  id: string;
  name: string;
  address: string;
}

export const dealerships: DealershipData[] = [
  {
    id: "dealer1",
    name: "Tsangpool Honda Golaghat",
    address: "Golaghat Town",
  },
  {
    id: "dealer2",
    name: "Honda Sarupathar",
    address: "Sarupath",
  },
];

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

// models/bikes.ts
export interface Bike {
  id: string;
  name: string;
  category: string;
  price: number;
  engineSize: number;
  power: number;
  weight: number;
  features: string[];
  image: string;
  year: number;
  isNew?: boolean;
}

export const categories = [
  { id: "all", name: "All Bikes" },
  { id: "sport", name: "Sport" },
  { id: "adventure", name: "Adventure" },
  { id: "cruiser", name: "Cruiser" },
  { id: "touring", name: "Touring" },
  { id: "naked", name: "Naked" },
];

// Available features for filtering
export const availableFeatures = [
  "Quick Shifter",
  "Riding Modes",
  "Traction Control",
  "ABS",
  "LED Lights",
  "DCT",
  "Cruise Control",
  "Tubeless Tires",
  "Storage Compartment",
  "Navigation",
  "Apple CarPlay",
  "Heated Seats",
  "Heated Grips",
];

// Sample bike data
export const allBikes: Bike[] = [
  // Sport Bikes
  {
    id: "cbr1000rr",
    name: "CBR1000RR Fireblade",
    category: "sport",
    price: 16499,
    engineSize: 1000,
    power: 214,
    weight: 201,
    features: ["Quick Shifter", "Riding Modes", "Traction Control"],
    image: activa6G,
    year: 2023,
    isNew: true,
  },
  {
    id: "cbr600rr",
    name: "CBR600RR",
    category: "sport",
    price: 11999,
    engineSize: 600,
    power: 118,
    weight: 186,
    features: ["Riding Modes", "Traction Control"],
    image: activa6G,
    year: 2023,
  },
  {
    id: "cbr500r",
    name: "CBR500R",
    category: "sport",
    price: 6999,
    engineSize: 500,
    power: 49,
    weight: 192,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2023,
  },

  // Adventure Bikes
  {
    id: "africatwin",
    name: "Africa Twin",
    category: "adventure",
    price: 14399,
    engineSize: 1100,
    power: 101,
    weight: 238,
    features: ["DCT", "Cruise Control", "Tubeless Tires"],
    image: activa6G,
    year: 2023,
    isNew: true,
  },
  {
    id: "nc750x",
    name: "NC750X",
    category: "adventure",
    price: 8499,
    engineSize: 750,
    power: 58,
    weight: 214,
    features: ["DCT Option", "Storage Compartment"],
    image: activa6G,
    year: 2022,
  },
  {
    id: "cb500x",
    name: "CB500X",
    category: "adventure",
    price: 6999,
    engineSize: 500,
    power: 49,
    weight: 199,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2023,
  },

  // Cruiser Bikes
  {
    id: "rebel1100",
    name: "Rebel 1100",
    category: "cruiser",
    price: 9299,
    engineSize: 1100,
    power: 86,
    weight: 232,
    features: ["DCT Option", "Cruise Control", "Riding Modes"],
    image: activa6G,
    year: 2023,
    isNew: true,
  },
  {
    id: "rebel500",
    name: "Rebel 500",
    category: "cruiser",
    price: 6299,
    engineSize: 500,
    power: 45,
    weight: 191,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2023,
  },
  {
    id: "rebel300",
    name: "Rebel 300",
    category: "cruiser",
    price: 4599,
    engineSize: 300,
    power: 30,
    weight: 168,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2022,
  },

  // Touring Bikes
  {
    id: "goldwing",
    name: "Gold Wing Tour",
    category: "touring",
    price: 29300,
    engineSize: 1800,
    power: 126,
    weight: 390,
    features: ["DCT", "Navigation", "Apple CarPlay", "Heated Seats"],
    image: activa6G,
    year: 2023,
  },
  {
    id: "nt1100",
    name: "NT1100",
    category: "touring",
    price: 13499,
    engineSize: 1100,
    power: 101,
    weight: 238,
    features: ["DCT Option", "Cruise Control", "Heated Grips"],
    image: activa6G,
    year: 2023,
    isNew: true,
  },

  // Naked Bikes
  {
    id: "cb1000r",
    name: "CB1000R",
    category: "naked",
    price: 12999,
    engineSize: 1000,
    power: 143,
    weight: 212,
    features: ["Riding Modes", "Traction Control", "Quick Shifter"],
    image: activa6G,
    year: 2023,
  },
  {
    id: "cb650r",
    name: "CB650R",
    category: "naked",
    price: 9299,
    engineSize: 650,
    power: 94,
    weight: 202,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2023,
  },
  {
    id: "cb300r",
    name: "CB300R",
    category: "naked",
    price: 4999,
    engineSize: 300,
    power: 30,
    weight: 144,
    features: ["ABS", "LED Lights"],
    image: activa6G,
    year: 2022,
  },
];
