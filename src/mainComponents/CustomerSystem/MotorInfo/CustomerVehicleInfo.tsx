import { CustomerDashHeader } from "@/mainComponents/Home/Header/CustomerDashHeader";
import { useGetBikesQuery } from "@/redux-store/services/bikeApi";
import { useGetScootiesQuery } from "@/redux-store/services/scootyApi";
import React, { useState } from "react";

interface VehicleFormData {
  category: "bike" | "scooty" | "";
  modelName: string;
  year: number;
  registrationDate: string;
  engineNumber: string;
  chassisNumber: string;
  fitnessUpto: number;
  insurance: boolean;
  fuelNorms: "BSIV" | "BSVI" | "";
  isPaid: boolean;
  isFinance: boolean;
  engineCapacity: string;
  uniqueBookRecord: string;
  color: string;
  purchaseDate: string;
}

const CustomerVehicleInfo = () => {
  const [formData, setFormData] = useState<VehicleFormData>({
    category: "",
    modelName: "",
    year: new Date().getFullYear(),
    registrationDate: "",
    engineNumber: "",
    chassisNumber: "",
    fitnessUpto: new Date().getFullYear() + 15,
    insurance: false,
    fuelNorms: "",
    isPaid: false,
    isFinance: false,
    engineCapacity: "",
    uniqueBookRecord: "",
    color: "",
    purchaseDate: "",
  });

  // API calls based on category selection
  const {
    data: bikesData,
    isLoading: bikesLoading,
    error: bikesError,
  } = useGetBikesQuery(
    { inStock: true },
    { skip: formData.category !== "bike" }
  );

  const {
    data: scootiesData,
    isLoading: scootiesLoading,
    error: scootiesError,
  } = useGetScootiesQuery(
    { inStock: true },
    { skip: formData.category !== "scooty" }
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as "bike" | "scooty" | "";
    setFormData((prev) => ({
      ...prev,
      category,
      modelName: "", // Reset model when category changes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Vehicle Info:", formData);
    // Add your submission logic here
  };

  // Get models based on selected category
  const getAvailableModels = () => {
    if (formData.category === "bike" && bikesData?.data) {
      return bikesData.data.map((bike) => ({
        id: bike._id || bike.id,
        name: bike.modelName,
        details: bike,
      }));
    }
    if (formData.category === "scooty" && scootiesData?.data) {
      return scootiesData.data.map((scooty) => ({
        id: scooty.id || scooty.id,
        name: scooty.modelName,
        details: scooty,
      }));
    }
    return [];
  };

  const availableModels = getAvailableModels();
  const isLoadingModels =
    (formData.category === "bike" && bikesLoading) ||
    (formData.category === "scooty" && scootiesLoading);

  return (
    <>
      <CustomerDashHeader />

      <div className='max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>
          Add Vehicle Information
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Vehicle Category */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Vehicle Category *
              </label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleCategoryChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select Category</option>
                <option value='bike'>Bike</option>
                <option value='scooty'>Scooty</option>
              </select>
            </div>

            {/* Model Name */}
            <div>
              <label
                htmlFor='modelName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Model Name *
              </label>
              <select
                id='modelName'
                name='modelName'
                value={formData.modelName}
                onChange={handleInputChange}
                required
                disabled={!formData.category || isLoadingModels}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100'
              >
                <option value=''>
                  {!formData.category
                    ? "Select category first"
                    : isLoadingModels
                    ? "Loading models..."
                    : "Select Model"}
                </option>
                {availableModels.map((model) => (
                  <option key={model.id} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
              {formData.category &&
                !isLoadingModels &&
                availableModels.length === 0 && (
                  <p className='text-sm text-red-600 mt-1'>
                    No models available for selected category
                  </p>
                )}
            </div>
          </div>

          {/* Year and Registration Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='year'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Year *
              </label>
              <input
                type='number'
                id='year'
                name='year'
                value={formData.year}
                onChange={handleInputChange}
                min='2000'
                max={new Date().getFullYear() + 1}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='registrationDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Registration Date
              </label>
              <input
                type='date'
                id='registrationDate'
                name='registrationDate'
                value={formData.registrationDate}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Engine Number and Chassis Number */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='engineNumber'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Engine Number *
              </label>
              <input
                type='text'
                id='engineNumber'
                name='engineNumber'
                value={formData.engineNumber}
                onChange={handleInputChange}
                required
                placeholder='e.g., ME4PA2032234'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='chassisNumber'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Chassis Number *
              </label>
              <input
                type='text'
                id='chassisNumber'
                name='chassisNumber'
                value={formData.chassisNumber}
                onChange={handleInputChange}
                required
                placeholder='e.g., ME4PA203223400001'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Fitness Upto and Insurance */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='fitnessUpto'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Fitness Upto *
              </label>
              <input
                type='number'
                id='fitnessUpto'
                name='fitnessUpto'
                value={formData.fitnessUpto}
                onChange={handleInputChange}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 20}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='insurance'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Insurance *
              </label>
              <select
                id='insurance'
                name='insurance'
                value={formData.insurance ? "yes" : "no"}
                onChange={(e) =>
                  handleInputChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "insurance",
                      type: "checkbox",
                      checked: e.target.value === "yes",
                    },
                  } as any)
                }
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='no'>No</option>
                <option value='yes'>Yes</option>
              </select>
            </div>
          </div>

          {/* Fuel Norms and Engine Capacity */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='fuelNorms'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Fuel Norms *
              </label>
              <select
                id='fuelNorms'
                name='fuelNorms'
                value={formData.fuelNorms}
                onChange={handleInputChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value=''>Select Fuel Norms</option>
                <option value='BSIV'>BS IV</option>
                <option value='BSVI'>BS VI</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='engineCapacity'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Engine Capacity
              </label>
              <input
                type='text'
                id='engineCapacity'
                name='engineCapacity'
                value={formData.engineCapacity}
                onChange={handleInputChange}
                placeholder='e.g., 150cc'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Color and Purchase Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='color'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Color
              </label>
              <input
                type='text'
                id='color'
                name='color'
                value={formData.color}
                onChange={handleInputChange}
                placeholder='e.g., Red, Black'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='purchaseDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Purchase Date
              </label>
              <input
                type='date'
                id='purchaseDate'
                name='purchaseDate'
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
          {/* Unique Book Record */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label
                htmlFor='color'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Unique Book Record
              </label>
              <input
                type='text'
                id='color'
                name='color'
                value={formData.uniqueBookRecord}
                onChange={handleInputChange}
                placeholder='e.g., XXXX-XXXX'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label
                htmlFor='purchaseDate'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Purchase Date
              </label>
              <input
                type='date'
                id='purchaseDate'
                name='purchaseDate'
                value={formData.purchaseDate}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Payment Status */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-800'>
              Payment Status *
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id='isPaid'
                  name='isPaid'
                  checked={formData.isPaid}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='isPaid'
                  className='text-sm font-medium text-gray-700'
                >
                  Fully Paid
                </label>
              </div>

              <div className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  id='isFinance'
                  name='isFinance'
                  checked={formData.isFinance}
                  onChange={handleInputChange}
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
                <label
                  htmlFor='isFinance'
                  className='text-sm font-medium text-gray-700'
                >
                  Financed
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              className='px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Save Vehicle Info
            </button>
          </div>
        </form>

        {/* Error Display */}
        {(bikesError || scootiesError) && (
          <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-red-600 text-sm'>
              Error loading models. Please try again.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerVehicleInfo;
