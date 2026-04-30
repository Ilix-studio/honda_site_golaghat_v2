import React from "react";
import { Construction, AlertTriangle } from "lucide-react";

const UnderDevelopment: React.FC = () => {
  return (
    <div className='bg-amber-50 border-l-4 border-amber-400 p-4 mb-6'>
      <div className='flex items-center'>
        <div className='flex-shrink-0'>
          <Construction className='h-5 w-5 text-amber-600' />
        </div>
        <div className='ml-3 flex-1'>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='h-4 w-4 text-amber-600' />
            <h3 className='text-sm font-medium text-amber-800'>
              🚧 Site Under Construction
            </h3>
          </div>
          <p className='mt-1 text-sm text-amber-700'>
            We're working hard to bring you new features. Some functionality may
            be limited during development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;
