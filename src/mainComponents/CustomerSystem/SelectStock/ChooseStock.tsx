// src/components/admin/forms/ChooseStock.tsx

import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Database, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StockOption {
  id: "manual" | "csv";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  buttonText: string;
}

const stockOptions: StockOption[] = [
  {
    id: "manual",
    title: "Manual Stock Entries",
    description:
      "Assign vehicles from manually entered stock. Best for individual entries with complete details.",
    icon: Database,
    route: "/customer/vehicle/info",
    buttonText: "Choose Manual Stock",
  },
  {
    id: "csv",
    title: "CSV Stock Entries",
    description:
      "Assign vehicles from CSV imported stock. Best for bulk-imported inventory from dealer systems.",
    icon: FileSpreadsheet,
    route: "/customer/assign/csv-stock",
    buttonText: "Choose CSV Stock",
  },
];

const ChooseStock = () => {
  const navigate = useNavigate();

  const handleSelect = (route: string) => {
    navigate(route);
  };

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold mb-2'>Assign Vehicle to Customer</h1>
        <p className='text-muted-foreground'>
          Select the stock source to assign a vehicle
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {stockOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card
              key={option.id}
              className='hover:shadow-lg transition-shadow cursor-pointer group'
              onClick={() => handleSelect(option.route)}
            >
              <CardContent className='p-6 flex flex-col h-full'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='p-3 rounded-lg bg-primary/10 text-primary'>
                    <IconComponent className='h-6 w-6' />
                  </div>
                  <h2 className='text-xl font-semibold'>{option.title}</h2>
                </div>

                <p className='text-muted-foreground flex-1 mb-6'>
                  {option.description}
                </p>

                <Button className='w-full group-hover:bg-primary/90'>
                  {option.buttonText}
                  <ArrowRight className='h-4 w-4 ml-2 transition-transform group-hover:translate-x-1' />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ChooseStock;
