import {
  CreateVASRequest,
  useCreateVASMutation,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import React, { useState } from "react";

import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VASForm: React.FC = () => {
  const navigate = useNavigate();
  const [createVAS, { isLoading }] = useCreateVASMutation();

  const [formData, setFormData] = useState<CreateVASRequest>({
    serviceName: "",
    coverageYears: 1,
    priceStructure: {
      basePrice: 0,
    },
    benefits: [""],
    applicableBranches: [],
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CreateVASRequest] as Record<string, any>),
          [child]: type === "number" ? Number(value) : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "number"
            ? Number(value)
            : type === "date"
            ? new Date(value)
            : value,
      }));
    }
  };

  const handleArrayFieldChange = (
    field: "benefits",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "benefits") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (field: "benefits", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (formData.coverageYears < 1 || formData.coverageYears > 10) {
      toast.error("Coverage years must be between 1 and 10");
      return;
    }

    if (formData.priceStructure.basePrice <= 0) {
      toast.error("Base price must be greater than 0");
      return;
    }

    if (formData.benefits.some((benefit) => !benefit.trim())) {
      toast.error("All benefits must be filled or removed");
      return;
    }

    if (formData.validUntil <= formData.validFrom) {
      toast.error("Valid until date must be after valid from date");
      return;
    }

    try {
      await createVAS(formData).unwrap();
      toast.success("VAS created successfully!");
      navigate("/admin/view/vas"); // Adjust route as needed
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create VAS");
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white shadow-lg rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Create Value Added Service
            </h1>
            <p className='text-gray-600'>
              Fill in the details to create a new VAS offering
            </p>
          </div>

          <form onSubmit={handleSubmit} className='p-6 space-y-8'>
            {/* Basic Information */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Basic Information
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Service Name *
                  </label>
                  <input
                    type='text'
                    name='serviceName'
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter service name'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Coverage Years *
                  </label>
                  <input
                    type='number'
                    name='coverageYears'
                    value={formData.coverageYears}
                    onChange={handleInputChange}
                    min='1'
                    max='10'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    Minimum 1 year, Maximum 10 years
                  </p>
                </div>
              </div>
            </section>

            {/* Price Structure */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Price Structure
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Base Price (₹) *
                  </label>
                  <input
                    type='number'
                    name='priceStructure.basePrice'
                    value={formData.priceStructure.basePrice}
                    onChange={handleInputChange}
                    min='0'
                    step='0.01'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    placeholder='Enter base price'
                    required
                  />
                </div>
              </div>
            </section>

            {/* Benefits */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Benefits
              </h2>
              <div className='space-y-3'>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={benefit}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "benefits",
                          index,
                          e.target.value
                        )
                      }
                      placeholder='Enter benefit'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={() => removeArrayField("benefits", index)}
                      className='px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50'
                      disabled={formData.benefits.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => addArrayField("benefits")}
                  className='px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50'
                >
                  Add Benefit
                </button>
              </div>
            </section>

            {/* Validity Period */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Validity Period
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Valid From *
                  </label>
                  <input
                    type='date'
                    name='validFrom'
                    value={formData.validFrom.toISOString().split("T")[0]}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Valid Until *
                  </label>
                  <input
                    type='date'
                    name='validUntil'
                    value={formData.validUntil.toISOString().split("T")[0]}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
              </div>
            </section>

            {/* Applicable Branches (Optional - will be handled by admin selection) */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Service Configuration
              </h2>
              <div className='bg-blue-50 p-4 rounded-md'>
                <p className='text-sm text-blue-700'>
                  <strong>Note:</strong> Applicable branches will be configured
                  by the system admin after service creation. The service will
                  be available for all branches by default and can be restricted
                  later if needed.
                </p>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={isLoading}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {isLoading ? "Creating..." : "Create VAS"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VASForm;
