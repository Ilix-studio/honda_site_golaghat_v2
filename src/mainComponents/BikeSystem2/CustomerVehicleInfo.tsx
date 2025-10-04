import { useState } from "react";
import { Search } from "lucide-react";

export default function CustomerVehicleInfo() {
  const [formData, setFormData] = useState({
    engineNo: "",
    vehicleName: "",
    rto: "",
    registrationNo: "",
    chassisNo: "",
    model: "",
    color: "",
    fuelType: "",
    purchaseDate: "",
  });

  const [searchResult, setSearchResult] = useState(null);

  const handleChange = () => {
    // const { name, value } = e.target;
    // setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    if (formData.engineNo) {
      //   setSearchResult({
      //     // found: true,
      //     // message: `Searching for Engine No: ${formData.engineNo}`
      //   });
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Vehicle information saved!");
  };

  const handleClear = () => {
    setFormData({
      engineNo: "",
      vehicleName: "",
      rto: "",
      registrationNo: "",
      chassisNo: "",
      model: "",
      color: "",
      fuelType: "",
      purchaseDate: "",
    });
    setSearchResult(null);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-6'>
            Customer Vehicle Information
          </h1>

          {/* Search Section */}
          <div className='mb-8 p-4 bg-blue-50 rounded-lg'>
            <h2 className='text-lg font-semibold text-gray-700 mb-4'>
              Search Vehicle
            </h2>
            <div className='flex gap-3'>
              <div className='flex-1'>
                <input
                  type='text'
                  name='engineNo'
                  value={formData.engineNo}
                  onChange={handleChange}
                  placeholder='Enter Engine Number'
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <button
                onClick={handleSearch}
                className='flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                <Search size={20} />
                Search
              </button>
            </div>
            {/* {searchResult && 
            // (
            //   <p className="mt-3 text-sm text-blue-700">{searchResult.message}</p>
            )
            } */}
          </div>

          {/* Vehicle Information Form */}
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Engine Number *
                </label>
                <input
                  type='text'
                  name='engineNo'
                  value={formData.engineNo}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Vehicle Name *
                </label>
                <input
                  type='text'
                  name='vehicleName'
                  value={formData.vehicleName}
                  onChange={handleChange}
                  placeholder='e.g., Honda City'
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  RTO Code *
                </label>
                <input
                  type='text'
                  name='rto'
                  value={formData.rto}
                  onChange={handleChange}
                  placeholder='e.g., MH01'
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Registration Number
                </label>
                <input
                  type='text'
                  name='registrationNo'
                  value={formData.registrationNo}
                  onChange={handleChange}
                  placeholder='e.g., MH01AB1234'
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Chassis Number
                </label>
                <input
                  type='text'
                  name='chassisNo'
                  value={formData.chassisNo}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Model/Variant
                </label>
                <input
                  type='text'
                  name='model'
                  value={formData.model}
                  onChange={handleChange}
                  placeholder='e.g., VX CVT'
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Color
                </label>
                <input
                  type='text'
                  name='color'
                  value={formData.color}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Fuel Type
                </label>
                <select
                  name='fuelType'
                  value={formData.fuelType}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Select Fuel Type</option>
                  <option value='petrol'>Petrol</option>
                  <option value='diesel'>Diesel</option>
                  <option value='cng'>CNG</option>
                  <option value='electric'>Electric</option>
                  <option value='hybrid'>Hybrid</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Purchase Date
                </label>
                <input
                  type='date'
                  name='purchaseDate'
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex gap-4 pt-4'>
              <button
                onClick={handleSubmit}
                className='px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium'
              >
                Save Information
              </button>
              <button
                onClick={handleClear}
                className='px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium'
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
