import { useCreateProfileMutation } from "@/redux-store/services/customer/customerApi";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomerDashHeader } from "../Home/Header/CustomerDashHeader";

// Blood group enum - should match backend
export enum BloodGroup {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

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
  bloodGroup: BloodGroup;
  familyNumber1: number;
  familyNumber2: number;
}

interface RootState {
  customerAuth: {
    customer: {
      id: string;
      phoneNumber: string;
      firebaseUid: string;
      isVerified: boolean;
    } | null;
    firebaseToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: any;
  };
}

const CustomerCreateProfile: React.FC = () => {
  const navigate = useNavigate();
  const customerAuth = useSelector((state: RootState) => state.customerAuth);
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
    bloodGroup: "" as BloodGroup,
    familyNumber1: 0,
    familyNumber2: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "familyNumber1" || name === "familyNumber2") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? 0 : parseInt(value, 10) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    const requiredFields = [
      "firstName",
      "lastName",
      "village",
      "postOffice",
      "policeStation",
      "district",
      "state",
      "bloodGroup",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof CreateProfileRequest]) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
      }
    });

    // Email validation (optional)
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone number validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.familyNumber1 || formData.familyNumber1 === 0) {
      newErrors.familyNumber1 = "Family contact number 1 is required";
    } else if (!phoneRegex.test(formData.familyNumber1.toString())) {
      newErrors.familyNumber1 = "Enter valid 10-digit number starting with 6-9";
    }

    if (!formData.familyNumber2 || formData.familyNumber2 === 0) {
      newErrors.familyNumber2 = "Family contact number 2 is required";
    } else if (!phoneRegex.test(formData.familyNumber2.toString())) {
      newErrors.familyNumber2 = "Enter valid 10-digit number starting with 6-9";
    }

    // Ensure different phone numbers
    if (
      formData.familyNumber1 &&
      formData.familyNumber2 &&
      formData.familyNumber1 === formData.familyNumber2
    ) {
      newErrors.familyNumber2 = "Family contact numbers must be different";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !validateForm() ||
      !customerAuth.isAuthenticated ||
      !customerAuth.firebaseToken
    ) {
      return;
    }

    try {
      const profileData = {
        ...formData,
        middleName: formData.middleName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
      };

      await createProfile(profileData).unwrap();
      navigate("/customer-initialize", { state: { profileCompleted: true } });
    } catch (err) {
      console.error("Failed to create profile:", err);
    }
  };

  // Loading states
  if (customerAuth.isLoading) {
    return (
      <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          <span className='ml-2'>Loading...</span>
        </div>
      </div>
    );
  }

  if (!customerAuth.isAuthenticated) {
    return (
      <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
        <div className='text-center text-red-600'>
          Please login to create your profile.
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomerDashHeader />
      <div className='max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md'>
        <h2 className='text-2xl font-bold text-gray-800 mb-6'>
          Create Your Profile
        </h2>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Personal Information */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
              Personal Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  First Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder='Enter your first name'
                />
                {errors.firstName && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Middle Name
                </label>
                <input
                  type='text'
                  name='middleName'
                  value={formData.middleName}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter your middle name'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Last Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
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
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Email
                </label>
                <input
                  type='email'
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

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Blood Group <span className='text-red-500'>*</span>
                </label>
                <select
                  name='bloodGroup'
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bloodGroup ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value=''>Select Blood Group</option>
                  {Object.values(BloodGroup).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.bloodGroup}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Family Contact 1 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='familyNumber1'
                  value={
                    formData.familyNumber1 === 0
                      ? ""
                      : formData.familyNumber1.toString()
                  }
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.familyNumber1 ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder='10-digit number'
                  maxLength={10}
                />
                {errors.familyNumber1 && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.familyNumber1}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Family Contact 2 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='familyNumber2'
                  value={
                    formData.familyNumber2 === 0
                      ? ""
                      : formData.familyNumber2.toString()
                  }
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.familyNumber2 ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder='10-digit number'
                  maxLength={10}
                />
                {errors.familyNumber2 && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.familyNumber2}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4'>
              Address Information
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Village <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
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
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Post Office <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='postOffice'
                  value={formData.postOffice}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.postOffice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder='Enter post office'
                />
                {errors.postOffice && (
                  <p className='mt-1 text-sm text-red-600'>
                    {errors.postOffice}
                  </p>
                )}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Police Station <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
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
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  District <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
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

            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                State <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
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
              disabled={isLoading || !customerAuth.isAuthenticated}
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
