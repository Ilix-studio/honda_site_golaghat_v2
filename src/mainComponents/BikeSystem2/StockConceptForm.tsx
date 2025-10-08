import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "react-hot-toast";
import { useCreateStockItemMutation } from "@/redux-store/services/BikeSystemApi2/StockConceptApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";

interface StockConceptFormData {
  modelName: string;
  category: "Bike" | "Scooty";
  engineCC: number;
  engineNumber: string;
  chassisNumber: string;
  color: string;
  variant: string;
  yearOfManufacture: number;
  exShowroomPrice: number;
  roadTax: number;
  branchId: string;
  location: "Showroom" | "Warehouse" | "Service Center" | "Customer";
  uniqueBookRecord?: string;
}

export default function StockConceptForm() {
  const navigate = useNavigate();
  const [createStockItem, { isLoading }] = useCreateStockItemMutation();
  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();

  const [formData, setFormData] = useState<StockConceptFormData>({
    modelName: "",
    category: "Bike",
    engineCC: 0,
    engineNumber: "",
    chassisNumber: "",
    color: "",
    variant: "",
    yearOfManufacture: new Date().getFullYear(),
    exShowroomPrice: 0,
    roadTax: 0,
    branchId: "",
    location: "Warehouse",
    uniqueBookRecord: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createStockItem(formData).unwrap();
      toast.success(result.message || "Stock item created successfully!");
      navigate("/admin/stock-concept/list");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create stock item");
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Add Stock Item</h1>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Vehicle Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='modelName'
              className='block text-sm font-medium mb-1'
            >
              Model Name *
            </label>
            <input
              type='text'
              id='modelName'
              name='modelName'
              value={formData.modelName}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='category'
              className='block text-sm font-medium mb-1'
            >
              Category *
            </label>
            <select
              id='category'
              name='category'
              value={formData.category}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Bike'>Bike</option>
              <option value='Scooty'>Scooty</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='engineNumber'
              className='block text-sm font-medium mb-1'
            >
              Engine Number *
            </label>
            <input
              type='text'
              id='engineNumber'
              name='engineNumber'
              value={formData.engineNumber}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase'
            />
          </div>

          <div>
            <label
              htmlFor='chassisNumber'
              className='block text-sm font-medium mb-1'
            >
              Chassis Number *
            </label>
            <input
              type='text'
              id='chassisNumber'
              name='chassisNumber'
              value={formData.chassisNumber}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase'
            />
          </div>

          <div>
            <label
              htmlFor='engineCC'
              className='block text-sm font-medium mb-1'
            >
              Engine CC *
            </label>
            <input
              type='number'
              id='engineCC'
              name='engineCC'
              value={formData.engineCC}
              onChange={handleChange}
              required
              min='0'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='color' className='block text-sm font-medium mb-1'>
              Color *
            </label>
            <input
              type='text'
              id='color'
              name='color'
              value={formData.color}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='variant' className='block text-sm font-medium mb-1'>
              Variant *
            </label>
            <input
              type='text'
              id='variant'
              name='variant'
              value={formData.variant}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label
              htmlFor='yearOfManufacture'
              className='block text-sm font-medium mb-1'
            >
              Year of Manufacture *
            </label>
            <input
              type='number'
              id='yearOfManufacture'
              name='yearOfManufacture'
              value={formData.yearOfManufacture}
              onChange={handleChange}
              required
              min='2000'
              max={new Date().getFullYear() + 1}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='exShowroomPrice'
              className='block text-sm font-medium mb-1'
            >
              Ex-Showroom Price *
            </label>
            <input
              type='number'
              id='exShowroomPrice'
              name='exShowroomPrice'
              value={formData.exShowroomPrice}
              onChange={handleChange}
              required
              min='0'
              step='0.01'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label htmlFor='roadTax' className='block text-sm font-medium mb-1'>
              Road Tax
            </label>
            <input
              type='number'
              id='roadTax'
              name='roadTax'
              value={formData.roadTax}
              onChange={handleChange}
              min='0'
              step='0.01'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Location Information */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='branchId'
              className='block text-sm font-medium mb-1'
            >
              Branch *
            </label>
            <select
              id='branchId'
              name='branchId'
              value={formData.branchId}
              onChange={handleChange}
              required
              disabled={branchesLoading}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
            >
              <option value=''>
                {branchesLoading ? "Loading branches..." : "Select a branch"}
              </option>
              {branchesData?.data?.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.branchName} - {branch.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor='location'
              className='block text-sm font-medium mb-1'
            >
              Location *
            </label>
            <select
              id='location'
              name='location'
              value={formData.location}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Showroom'>Showroom</option>
              <option value='Warehouse'>Warehouse</option>
              <option value='Service Center'>Service Center</option>
              <option value='Customer'>Customer</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='uniqueBookRecord'
              className='block text-sm font-medium mb-1'
            >
              Unique Book Record
            </label>
            <input
              type='text'
              id='uniqueBookRecord'
              name='uniqueBookRecord'
              value={formData.uniqueBookRecord}
              onChange={handleChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            disabled={isLoading}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed'
          >
            {isLoading ? "Creating..." : "Submit"}
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            disabled={isLoading}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
