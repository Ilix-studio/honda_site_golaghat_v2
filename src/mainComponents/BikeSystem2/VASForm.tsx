import {
  CreateVASRequest,
  useCreateVASMutation,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import { useGetBranchesQuery } from "@/redux-store/services/branchApi";
import React, { useState } from "react";

import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VASForm: React.FC = () => {
  const navigate = useNavigate();
  const [createVAS, { isLoading }] = useCreateVASMutation();

  // Fetch branches data
  const { data: branchesData, isLoading: branchesLoading } =
    useGetBranchesQuery();

  const [formData, setFormData] = useState<CreateVASRequest>({
    serviceName: "",
    coverageYears: 1,
    priceStructure: {
      basePrice: 0,
    },
    benefits: [""],
    applicableBranches: [],
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

  const handleBranchSelection = (branchId: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableBranches: prev.applicableBranches.includes(branchId)
        ? prev.applicableBranches.filter((id) => id !== branchId)
        : [...prev.applicableBranches, branchId],
    }));
  };

  const selectAllBranches = () => {
    if (branchesData?.data) {
      const allBranchIds = branchesData.data.map((branch) => branch._id);
      setFormData((prev) => ({
        ...prev,
        applicableBranches: allBranchIds,
      }));
    }
  };

  const clearAllBranches = () => {
    setFormData((prev) => ({
      ...prev,
      applicableBranches: [],
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

    if (formData.applicableBranches.length === 0) {
      toast.error("Please select at least one applicable branch");
      return;
    }

    try {
      await createVAS(formData).unwrap();
      toast.success("VAS created successfully!");
      navigate("/admin/view/vas");
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

            {/* Applicable Branches */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Applicable Branches *
              </h2>
              <div className='space-y-4'>
                <div className='flex items-center space-x-4'>
                  <button
                    type='button'
                    onClick={selectAllBranches}
                    className='px-4 py-2 text-green-600 hover:text-green-800 border border-green-300 rounded-md hover:bg-green-50'
                    disabled={branchesLoading}
                  >
                    Select All
                  </button>
                  <button
                    type='button'
                    onClick={clearAllBranches}
                    className='px-4 py-2 text-orange-600 hover:text-orange-800 border border-orange-300 rounded-md hover:bg-orange-50'
                  >
                    Clear All
                  </button>
                  <span className='text-sm text-gray-600'>
                    {formData.applicableBranches.length} branch(es) selected
                  </span>
                </div>

                {branchesLoading ? (
                  <div className='flex items-center justify-center py-8'>
                    <div className='text-gray-500'>Loading branches...</div>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4'>
                    {branchesData?.data?.map((branch) => (
                      <label
                        key={branch._id}
                        className='flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded'
                      >
                        <input
                          type='checkbox'
                          checked={formData.applicableBranches.includes(
                            branch._id
                          )}
                          onChange={() => handleBranchSelection(branch._id)}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <div className='flex-1'>
                          <div className='text-sm font-medium text-gray-900'>
                            {branch.branchName}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {branch.address}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {!branchesLoading &&
                  (!branchesData?.data || branchesData.data.length === 0) && (
                    <div className='text-center py-8 text-gray-500'>
                      No branches available. Please contact administrator.
                    </div>
                  )}
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
