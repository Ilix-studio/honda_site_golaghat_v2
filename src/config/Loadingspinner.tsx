import React from "react";

const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  message?: string;
}> = ({ size = "md", message = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[200px] space-y-4'>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      <p className='text-gray-600 text-sm'>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
