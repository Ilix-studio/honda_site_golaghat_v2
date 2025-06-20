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

// Time slots for service booking (static options)
export const timeSlots = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export const serviceLocations = [
  {
    id: "golaghat",
    name: "Honda Service Center - Golaghat",
    address: "Golaghat Town, Assam 785621",
    phone: "883920-2092122",
    hours: "9:00 AM - 7:00 PM",
  },
  {
    id: "sarupathar",
    name: "Honda Service Center - Sarupathar",
    address: "Sarupathar, Assam 785601",
    phone: "8181881818",
    hours: "9:00 AM - 6:00 PM",
  },
];

// Additional services (static form options)
export const additionalServices = [
  { id: "wash", name: "Bike Wash", price: "₹200" },
  { id: "chain", name: "Chain Lubrication", price: "₹150" },
  { id: "battery", name: "Battery Check", price: "₹100" },
  { id: "tires", name: "Tire Pressure Check", price: "₹50" },
  { id: "brake", name: "Brake Adjustment", price: "₹300" },
  { id: "oil-change", name: "Engine Oil Change", price: "₹800" },
  { id: "filter", name: "Air Filter Cleaning", price: "₹200" },
  { id: "suspension", name: "Suspension Check", price: "₹400" },
];

// Service types (static form options)
export const serviceTypes = [
  {
    id: "regular",
    name: "Regular Service",
    description:
      "Basic maintenance including oil change, filter replacement, and general inspection",
    price: "₹2,500 - ₹4,000",
    estimatedTime: "2-3 hours",
  },
  {
    id: "major",
    name: "Major Service",
    description:
      "Comprehensive service including engine tuning, brake adjustment, and detailed inspection",
    price: "₹5,000 - ₹8,000",
    estimatedTime: "4-6 hours",
  },
  {
    id: "repair",
    name: "Repair Service",
    description: "Diagnostic and repair service for specific issues",
    price: "Varies",
    estimatedTime: "1-8 hours",
  },
  {
    id: "warranty",
    name: "Warranty Service",
    description: "Service covered under manufacturer warranty",
    price: "Free*",
    estimatedTime: "2-4 hours",
  },
  {
    id: "inspection",
    name: "Pre-purchase Inspection",
    description: "Comprehensive inspection for used motorcycles",
    price: "₹1,500",
    estimatedTime: "1-2 hours",
  },
];

// Available features for filtering (static options)
export const availableFeatures = [
  "ABS",
  "LED Headlight",
  "Digital Display",
  "Bluetooth Connectivity",
  "USB Charging",
  "Kick Start",
  "Electric Start",
  "Tubeless Tyres",
  "Disc Brake",
  "Alloy Wheels",
  "Fuel Injection",
  "Smart Key",
  "Traction Control",
  "Quick Shifter",
  "Cruise Control",
  "Wind Protection",
  "Comfortable Seating",
  "Large Fuel Tank",
  "Under Seat Storage",
  "Mobile Holder",
  "Side Stand Indicator",
  "Pass Light",
];

// Categories for filtering (static options)
export const categories = [
  { id: "all", name: "All" },
  { id: "sport", name: "Sport" },
  { id: "adventure", name: "Adventure" },
  { id: "cruiser", name: "Cruiser" },
  { id: "touring", name: "Touring" },
  { id: "naked", name: "Naked" },
  { id: "electric", name: "Electric" },
  { id: "scooter", name: "Scooter" },
];
