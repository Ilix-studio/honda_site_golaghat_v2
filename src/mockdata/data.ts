import { MotorcycleData } from "@/types/moto.types";
import { useState } from "react";

export const [motorcycles, setMotorcycles] = useState<MotorcycleData[]>([
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
]);
