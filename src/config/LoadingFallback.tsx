import React from "react";

const LoadingFallback: React.FC = () => (
  <div className='min-h-screen flex items-center justify-center bg-gray-50'>
    <div className='text-center'>
      <div className='animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4'></div>
      <h2 className='text-lg font-semibold text-gray-700 mb-2'>Loading...</h2>
      <p className='text-gray-500'>Please wait while we load the page</p>
    </div>
  </div>
);

export default LoadingFallback;
