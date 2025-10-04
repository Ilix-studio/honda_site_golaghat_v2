import {
  CreateVASRequest,
  IBadge,
  // useCreateVASMutation,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import React, { useState } from "react";

import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const VASForm: React.FC = () => {
  const navigate = useNavigate();
  // const [createVAS, { isLoading }] = useCreateVASMutation();

  const [formData, setFormData] = useState<CreateVASRequest>({
    serviceName: "",
    serviceType: "Extended Warranty",
    description: "",
    coverageYears: 1,
    maxEnrollmentPeriod: 12,
    vehicleEligibility: {
      maxEngineCapacity: 250,
      categories: [],
    },
    priceStructure: {
      basePrice: 0,
      pricePerYear: 0,
      engineCapacityMultiplier: 1,
    },
    benefits: [""],
    coverage: {
      partsAndLabor: true,
      unlimitedKilometers: false,
      transferable: false,
      panIndiaService: true,
    },
    terms: [""],
    exclusions: [""],
    badges: [],
    applicableBranches: [],
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  });

  const [newBadge, setNewBadge] = useState<Omit<IBadge, "id">>({
    name: "",
    description: "",
    icon: "",
    color: "#3B82F6",
    isActive: true,
  });

  const serviceTypes = [
    "Extended Warranty",
    "Extended Warranty Plus",
    "Annual Maintenance Contract",
    "Engine Health Assurance",
    "Roadside Assistance",
  ] as const;

  const vehicleCategories = [
    "scooter",
    "motorcycle",
    "commuter",
    "sports",
    "cruiser",
  ];

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
          //   ...prev[parent as keyof CreateVASRequest],
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

  const handleCheckboxChange = (name: string, checked: boolean) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          //   ...prev[parent as keyof CreateVASRequest],
          [child]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      vehicleEligibility: {
        ...prev.vehicleEligibility,
        categories: checked
          ? [...prev.vehicleEligibility.categories, category]
          : prev.vehicleEligibility.categories.filter((c) => c !== category),
      },
    }));
  };

  const handleArrayFieldChange = (
    field: "benefits" | "terms" | "exclusions",
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayField = (field: "benefits" | "terms" | "exclusions") => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeArrayField = (
    field: "benefits" | "terms" | "exclusions",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleBadgeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setNewBadge((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addBadge = () => {
    if (newBadge.name && newBadge.description && newBadge.icon) {
      setFormData((prev) => ({
        ...prev,
        badges: [...prev.badges, newBadge],
      }));
      setNewBadge({
        name: "",
        description: "",
        icon: "",
        color: "#3B82F6",
        isActive: true,
      });
    }
  };

  const removeBadge = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      badges: prev.badges.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.serviceName.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (formData.vehicleEligibility.categories.length === 0) {
      toast.error("At least one vehicle category must be selected");
      return;
    }

    if (formData.benefits.some((benefit) => !benefit.trim())) {
      toast.error("All benefits must be filled or removed");
      return;
    }

    try {
      // const response = await createVAS(formData).unwrap();
      toast.success("VAS created successfully!");
      navigate("/admin/vas"); // Adjust route as needed
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
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Service Type *
                  </label>
                  <select
                    name='serviceType'
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Description *
                  </label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
              </div>
            </section>

            {/* Coverage & Enrollment */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Coverage & Enrollment
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Max Enrollment Period (months) *
                  </label>
                  <input
                    type='number'
                    name='maxEnrollmentPeriod'
                    value={formData.maxEnrollmentPeriod}
                    onChange={handleInputChange}
                    min='1'
                    max='108'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>
              </div>
            </section>

            {/* Vehicle Eligibility */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Vehicle Eligibility
              </h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Max Engine Capacity (cc) *
                  </label>
                  <input
                    type='number'
                    name='vehicleEligibility.maxEngineCapacity'
                    value={formData.vehicleEligibility.maxEngineCapacity}
                    onChange={handleInputChange}
                    className='w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Vehicle Categories *
                  </label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                    {vehicleCategories.map((category) => (
                      <label
                        key={category}
                        className='flex items-center space-x-2'
                      >
                        <input
                          type='checkbox'
                          checked={formData.vehicleEligibility.categories.includes(
                            category
                          )}
                          onChange={(e) =>
                            handleCategoryChange(category, e.target.checked)
                          }
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='text-sm text-gray-700 capitalize'>
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Price Structure */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Price Structure
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
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
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Price per Year (₹) *
                  </label>
                  <input
                    type='number'
                    name='priceStructure.pricePerYear'
                    value={formData.priceStructure.pricePerYear}
                    onChange={handleInputChange}
                    min='0'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Engine Capacity Multiplier
                  </label>
                  <input
                    type='number'
                    name='priceStructure.engineCapacityMultiplier'
                    value={formData.priceStructure.engineCapacityMultiplier}
                    onChange={handleInputChange}
                    min='0.5'
                    step='0.1'
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                </div>
              </div>
            </section>

            {/* Coverage Details */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Coverage Details
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {Object.entries(formData.coverage).map(([key, value]) => (
                  <label key={key} className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      checked={value}
                      onChange={(e) =>
                        handleCheckboxChange(
                          `coverage.${key}`,
                          e.target.checked
                        )
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-sm text-gray-700 capitalize'>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </label>
                ))}
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
                      className='px-3 py-2 text-red-600 hover:text-red-800'
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => addArrayField("benefits")}
                  className='px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md'
                >
                  Add Benefit
                </button>
              </div>
            </section>

            {/* Terms */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Terms & Conditions
              </h2>
              <div className='space-y-3'>
                {formData.terms.map((term, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={term}
                      onChange={(e) =>
                        handleArrayFieldChange("terms", index, e.target.value)
                      }
                      placeholder='Enter term'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={() => removeArrayField("terms", index)}
                      className='px-3 py-2 text-red-600 hover:text-red-800'
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => addArrayField("terms")}
                  className='px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md'
                >
                  Add Term
                </button>
              </div>
            </section>

            {/* Exclusions */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Exclusions
              </h2>
              <div className='space-y-3'>
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={exclusion}
                      onChange={(e) =>
                        handleArrayFieldChange(
                          "exclusions",
                          index,
                          e.target.value
                        )
                      }
                      placeholder='Enter exclusion'
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      type='button'
                      onClick={() => removeArrayField("exclusions", index)}
                      className='px-3 py-2 text-red-600 hover:text-red-800'
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => addArrayField("exclusions")}
                  className='px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md'
                >
                  Add Exclusion
                </button>
              </div>
            </section>

            {/* Badges */}
            <section>
              <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Badges
              </h2>

              {/* Add Badge Form */}
              <div className='bg-gray-50 p-4 rounded-md mb-4'>
                <h3 className='text-md font-medium text-gray-800 mb-3'>
                  Add New Badge
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <input
                    type='text'
                    name='name'
                    placeholder='Badge name'
                    value={newBadge.name}
                    onChange={handleBadgeInputChange}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <input
                    type='text'
                    name='description'
                    placeholder='Description'
                    value={newBadge.description}
                    onChange={handleBadgeInputChange}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <input
                    type='text'
                    name='icon'
                    placeholder='Icon class'
                    value={newBadge.icon}
                    onChange={handleBadgeInputChange}
                    className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  />
                  <div className='flex items-center space-x-2'>
                    <input
                      type='color'
                      name='color'
                      value={newBadge.color}
                      onChange={handleBadgeInputChange}
                      className='w-12 h-10 border border-gray-300 rounded'
                    />
                    <button
                      type='button'
                      onClick={addBadge}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Display Added Badges */}
              {formData.badges.length > 0 && (
                <div className='space-y-2'>
                  <h3 className='text-md font-medium text-gray-800'>
                    Added Badges
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {formData.badges.map((badge, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between p-3 border border-gray-200 rounded-md'
                      >
                        <div className='flex items-center space-x-3'>
                          <div
                            className='w-6 h-6 rounded'
                            style={{ backgroundColor: badge.color }}
                          ></div>
                          <div>
                            <span className='font-medium'>{badge.name}</span>
                            <p className='text-sm text-gray-600'>
                              {badge.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeBadge(index)}
                          className='text-red-600 hover:text-red-800'
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

            {/* Submit Buttons */}
            <div className='flex items-center justify-end space-x-4 pt-6 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => navigate(-1)}
                className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                // disabled={isLoading}
                className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {/* {isLoading ? "Creating..." : "Create VAS"} */}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VASForm;
