import { useState } from "react";

export default function SafetyFeature() {
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    bloodGroup: "",
    familyBackupNumber: "",
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    // Add your submission logic here
    alert("Safety information saved successfully!");
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8 px-4'>
      <div className='max-w-2xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-8'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Safety Feature
          </h1>
          <p className='text-gray-600 mb-6'>
            Enter your emergency contact information
          </p>

          <div className='space-y-6'>
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Name *
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                placeholder='Enter your full name'
              />
            </div>

            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Phone Number *
              </label>
              <input
                type='tel'
                id='phoneNumber'
                name='phoneNumber'
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                placeholder='Enter your phone number'
              />
            </div>

            <div>
              <label
                htmlFor='bloodGroup'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Blood Group *
              </label>
              <select
                id='bloodGroup'
                name='bloodGroup'
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white'
              >
                <option value=''>Select blood group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='familyBackupNumber'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Family Backup Number *
              </label>
              <input
                type='tel'
                id='familyBackupNumber'
                name='familyBackupNumber'
                value={formData.familyBackupNumber}
                onChange={handleChange}
                required
                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                placeholder='Enter family emergency contact'
              />
            </div>

            <button
              onClick={handleSubmit}
              className='w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none'
            >
              Save Safety Information
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
