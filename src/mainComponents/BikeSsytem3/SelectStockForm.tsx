// src/components/admin/forms/SelectStockForm.tsx

import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Database, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SelectStockForm = () => {
  const navigate = useNavigate();

  const stockOptions = [
    {
      id: "csv",
      title: "CSV Stock Import",
      description:
        "Import stock data from CSV files. Best for bulk uploads from dealer management systems or spreadsheets.",
      icon: FileSpreadsheet,
      route: "/admin/forms/stock-concept-csv",
      buttonText: "Upload CSV",
    },
    {
      id: "manual",
      title: "Manual Stock Entry",
      description:
        "Add stock items individually with full control over all fields. Best for single entries or corrections.",
      icon: Database,
      route: "/admin/forms/stock-concept",
      buttonText: "Add Manually",
    },
  ];

  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold mb-2'>Add Stock to Inventory</h1>
        <p className='text-muted-foreground'>
          Choose how you want to add stock items to the system
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {stockOptions.map((option) => (
          <Card
            key={option.id}
            className='hover:shadow-lg transition-shadow cursor-pointer group'
            onClick={() => navigate(option.route)}
          >
            <CardContent className='p-6 flex flex-col h-full'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-3 rounded-lg bg-primary/10 text-primary'>
                  <option.icon className='h-6 w-6' />
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
        ))}
      </div>
    </div>
  );
};

export default SelectStockForm;
