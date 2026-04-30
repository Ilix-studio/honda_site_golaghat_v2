// Define sections for Honda vehicle comparison
export const comparisonSections = [
  {
    id: "basicInfo",
    title: "Basic Information",
    specs: [
      { key: "mainCategory", label: "Vehicle Type", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "year", label: "Year", type: "number" },
      {
        key: "priceBreakdown.onRoadPrice",
        label: "On-Road Price",
        type: "price",
        isHigherBetter: false,
      },
      {
        key: "priceBreakdown.exShowroomPrice",
        label: "Ex-Showroom Price",
        type: "price",
        isHigherBetter: false,
      },
      { key: "isNewModel", label: "New Model", type: "boolean" },
      {
        key: "stockAvailable",
        label: "Stock Available",
        type: "number",
        isHigherBetter: true,
      },
    ],
  },
  {
    id: "engine",
    title: "Engine & Performance",
    specs: [
      { key: "engineSize", label: "Engine Size", type: "text" },
      { key: "power", label: "Power (HP)", type: "hp", isHigherBetter: true },
      { key: "transmission", label: "Transmission", type: "text" },
      { key: "fuelNorms", label: "Fuel Norms", type: "text" },
      { key: "isE20Efficiency", label: "E20 Compatible", type: "boolean" },
    ],
  },
  {
    id: "pricing",
    title: "Price Breakdown",
    specs: [
      {
        key: "priceBreakdown.exShowroomPrice",
        label: "Ex-Showroom Price",
        type: "price",
        isHigherBetter: false,
      },
      {
        key: "priceBreakdown.rtoCharges",
        label: "RTO Charges",
        type: "price",
        isHigherBetter: false,
      },
      {
        key: "priceBreakdown.insuranceComprehensive",
        label: "Insurance",
        type: "price",
        isHigherBetter: false,
      },
      {
        key: "priceBreakdown.onRoadPrice",
        label: "Total On-Road Price",
        type: "price",
        isHigherBetter: false,
      },
    ],
  },
  {
    id: "variants",
    title: "Variants & Options",
    specs: [
      {
        key: "variants.length",
        label: "Number of Variants",
        type: "number",
        isHigherBetter: true,
      },
      {
        key: "colors.length",
        label: "Color Options",
        type: "number",
        isHigherBetter: true,
      },
    ],
  },
  {
    id: "features",
    title: "Features & Specifications",
    specs: [
      { key: "features", label: "Key Features", type: "features" },
      { key: "colors", label: "Available Colors", type: "features" },
      {
        key: "keySpecifications.engine",
        label: "Engine Details",
        type: "text",
      },
      { key: "keySpecifications.power", label: "Power Output", type: "text" },
      {
        key: "keySpecifications.transmission",
        label: "Transmission Type",
        type: "text",
      },
    ],
  },
  {
    id: "availability",
    title: "Availability & Status",
    specs: [
      {
        key: "stockAvailable",
        label: "Units in Stock",
        type: "number",
        isHigherBetter: true,
      },
      { key: "isActive", label: "Currently Available", type: "boolean" },
    ],
  },
];
