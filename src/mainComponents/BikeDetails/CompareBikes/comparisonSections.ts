// Define sections for comparison
export const comparisonSections = [
  {
    id: "basicInfo",
    title: "Basic Information",
    specs: [
      { key: "category", label: "Category", type: "text" },
      { key: "year", label: "Year", type: "number" },
      { key: "price", label: "Price", type: "price", isHigherBetter: false },
    ],
  },
  {
    id: "engine",
    title: "Engine & Performance",
    specs: [
      {
        key: "engineSize",
        label: "Engine Size",
        type: "cc",
        isHigherBetter: true,
      },
      { key: "power", label: "Power", type: "hp", isHigherBetter: true },
      { key: "engine", label: "Engine Type", type: "text" },
      { key: "transmission", label: "Transmission", type: "text" },
    ],
  },
  {
    id: "dimensions",
    title: "Dimensions & Weight",
    specs: [
      { key: "weight", label: "Weight", type: "kg", isHigherBetter: false },
    ],
  },
  {
    id: "features",
    title: "Features & Colors",
    specs: [
      { key: "features", label: "Features", type: "features" },
      { key: "colors", label: "Available Colors", type: "features" },
    ],
  },
  {
    id: "availability",
    title: "Availability",
    specs: [
      { key: "inStock", label: "In Stock", type: "boolean" },
      { key: "quantity", label: "Quantity", type: "number" },
      { key: "branch", label: "Branch", type: "text" },
    ],
  },
];
