import { useCreateProfileMutation } from "@/redux-store/services/customer/customerApi";

import React, { useState } from "react";

interface CreateProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  village: string;
  postOffice: string;
  policeStation: string;
  district: string;
  state: string;
}

const CustomerCreateProfile: React.FC = () => {
  const [createProfile, { isLoading, error }] = useCreateProfileMutation();

  const [formData, setFormData] = useState<CreateProfileRequest>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    village: "",
    postOffice: "",
    policeStation: "",
    district: "",
    state: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.village.trim()) {
      newErrors.village = "Village is required";
    }
    if (!formData.postOffice.trim()) {
      newErrors.postOffice = "Post office is required";
    }
    if (!formData.policeStation.trim()) {
      newErrors.policeStation = "Police station is required";
    }
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Filter out empty optional fields
      const profileData = {
        ...formData,
        middleName: formData.middleName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
      };

      await createProfile(profileData).unwrap();
      // Handle success (redirect, show success message, etc.)
      console.log("Profile created successfully");
    } catch (err) {
      console.error("Failed to create profile:", err);
    }
  };

  return (
    <>
      <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>
          Create Your Profile
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Personal Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='firstName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                First Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='firstName'
                name='firstName'
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter your first name'
              />
              {errors.firstName && (
                <p className='mt-1 text-sm text-red-600'>{errors.firstName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='middleName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Middle Name
              </label>
              <input
                type='text'
                id='middleName'
                name='middleName'
                value={formData.middleName}
                onChange={handleChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter your middle name'
              />
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='lastName'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Last Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='lastName'
                name='lastName'
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter your last name'
              />
              {errors.lastName && (
                <p className='mt-1 text-sm text-red-600'>{errors.lastName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter your email address'
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-600'>{errors.email}</p>
              )}
            </div>
          </div>

          {/* Address Information */}
          <h3 className='text-lg font-semibold text-gray-800 mt-6 mb-4'>
            Address Information
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='village'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Village <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='village'
                name='village'
                value={formData.village}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.village ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter your village'
              />
              {errors.village && (
                <p className='mt-1 text-sm text-red-600'>{errors.village}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='postOffice'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Post Office <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='postOffice'
                name='postOffice'
                value={formData.postOffice}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postOffice ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter post office'
              />
              {errors.postOffice && (
                <p className='mt-1 text-sm text-red-600'>{errors.postOffice}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='policeStation'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Police Station <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='policeStation'
                name='policeStation'
                value={formData.policeStation}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.policeStation ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter police station'
              />
              {errors.policeStation && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.policeStation}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor='district'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                District <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='district'
                name='district'
                value={formData.district}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.district ? "border-red-500" : "border-gray-300"
                }`}
                placeholder='Enter district'
              />
              {errors.district && (
                <p className='mt-1 text-sm text-red-600'>{errors.district}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor='state'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              State <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              id='state'
              name='state'
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
              placeholder='Enter state'
            />
            {errors.state && (
              <p className='mt-1 text-sm text-red-600'>{errors.state}</p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className='p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-sm text-red-600'>
                {"data" in error
                  ? (error.data as any)?.message || "Failed to create profile"
                  : "An error occurred while creating profile"}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className='pt-4'>
            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200'
            >
              {isLoading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Creating Profile...
                </div>
              ) : (
                "Create Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CustomerCreateProfile;
