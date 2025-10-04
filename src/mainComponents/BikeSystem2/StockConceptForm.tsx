import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StockConceptFormData {
  vehicleName: string;
  engineNo: string;
  chassisNo: string;
  branchId: string;
}

export default function StockConceptForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<StockConceptFormData>({
    vehicleName: "",
    engineNo: "",
    chassisNo: "",
    branchId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Add your API call here
      console.log("Form data:", formData);
      // navigate('/admin/stock-concept/list');
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Stock Concept Form</h1>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label
            htmlFor='vehicleName'
            className='block text-sm font-medium mb-1'
          >
            Vehicle Name
          </label>
          <input
            type='text'
            id='vehicleName'
            name='vehicleName'
            value={formData.vehicleName}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label htmlFor='engineNo' className='block text-sm font-medium mb-1'>
            Engine No.
          </label>
          <input
            type='text'
            id='engineNo'
            name='engineNo'
            value={formData.engineNo}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label htmlFor='chassisNo' className='block text-sm font-medium mb-1'>
            Chassis No.
          </label>
          <input
            type='text'
            id='chassisNo'
            name='chassisNo'
            value={formData.chassisNo}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div>
          <label htmlFor='branchId' className='block text-sm font-medium mb-1'>
            Branch ID
          </label>
          <input
            type='text'
            id='branchId'
            name='branchId'
            value={formData.branchId}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='flex gap-3 pt-4'>
          <button
            type='submit'
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            Submit
          </button>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400'
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
