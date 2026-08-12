import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom"; // <-- Changed import
import {
  useGetVASByIdQuery,
  useUpdateVASMutation,
} from "@/redux-store/services/BikeSystemApi2/VASApi";
import { formatCurrency } from "@/lib/formatters";

export interface EditVasProps {
  vasId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

interface FormData {
  serviceName: string;
  description: string;
  coverageYears: number;
  basePrice: number;
  benefits: string[];
  isActive: boolean;
}

interface FormErrors {
  serviceName?: string;
  coverageYears?: string;
  basePrice?: string;
  benefits?: string;
}

const EditVas = ({ vasId: propVasId, onClose, onSuccess }: EditVasProps) => {
  const { id } = useParams<{ id: string }>(); // <-- Read from URL params
  const navigate = useNavigate();

  // Use prop if provided, otherwise fallback to URL param
  const vasId = propVasId || id || "";

  const [formData, setFormData] = useState<FormData>({
    serviceName: "",
    description: "",
    coverageYears: 1,
    basePrice: 0,
    benefits: [],
    isActive: true,
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  const {
    data: vasData,
    isLoading,
    isError,
  } = useGetVASByIdQuery(vasId, {
    skip: !vasId,
  });

  const [updateVAS, { isLoading: isUpdating }] = useUpdateVASMutation();

  // Default close behavior: if no onClose prop is given, navigate back in history
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (vasData?.data) {
      const vas = vasData.data;
      setFormData({
        serviceName: vas.serviceName || "",
        description: vas.description || "",
        coverageYears: vas.coverageYears || 1,
        basePrice: vas.priceStructure?.basePrice || 0,
        benefits: vas.benefits || [],
        isActive: vas.isActive ?? true,
      });
      setIsDirty(false);
    }
  }, [vasData]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.serviceName.trim()) {
      newErrors.serviceName = "Service name is required";
    } else if (formData.serviceName.trim().length < 3) {
      newErrors.serviceName = "Service name must be at least 3 characters";
    }

    if (!formData.coverageYears || formData.coverageYears < 1) {
      newErrors.coverageYears = "Coverage must be at least 1 year";
    } else if (formData.coverageYears > 10) {
      newErrors.coverageYears = "Coverage cannot exceed 10 years";
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = "Price cannot be negative";
    }

    if (formData.benefits.length === 0) {
      newErrors.benefits = "At least one benefit is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addBenefit = () => {
    const trimmed = newBenefit.trim();
    if (!trimmed) return;

    if (formData.benefits.includes(trimmed)) {
      toast.error("This benefit already exists");
      return;
    }

    handleInputChange("benefits", [...formData.benefits, trimmed]);
    setNewBenefit("");
  };

  const removeBenefit = (index: number) => {
    handleInputChange(
      "benefits",
      formData.benefits.filter((_, i) => i !== index),
    );
  };

  const handleBenefitKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addBenefit();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await updateVAS({
        id: vasId,
        data: {
          serviceName: formData.serviceName.trim(),
          description: formData.description.trim(),
          coverageYears: formData.coverageYears,
          priceStructure: {
            basePrice: formData.basePrice,
          },
          benefits: formData.benefits,
          isActive: formData.isActive,
        },
      }).unwrap();

      toast.success("Service updated successfully");
      setIsDirty(false);
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      const message =
        error?.data?.message || "Failed to update service. Please try again.";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        )
      ) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center p-12'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6 bg-red-50 border border-red-200 rounded-lg'>
        <div className='flex items-start gap-3'>
          <svg
            className='w-6 h-6 text-red-500 flex-shrink-0 mt-0.5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <div>
            <h3 className='text-red-800 font-semibold'>
              Error Loading Service
            </h3>
            <p className='text-red-600 mt-1'>
              Failed to load service details. The service may have been deleted
              or you may not have permission to view it.
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className='mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
      {/* Header */}
      <div className='p-6 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              Edit Value Added Service
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              Update the service details below
            </p>
          </div>
          {isDirty && (
            <span className='px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full'>
              Unsaved changes
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className='p-6 space-y-6'>
        {/* Service Name */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Service Name <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            value={formData.serviceName}
            onChange={(e) => handleInputChange("serviceName", e.target.value)}
            className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              errors.serviceName
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder='e.g., Extended Warranty, Roadside Assistance'
          />
          {errors.serviceName && (
            <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.serviceName}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={3}
            className='w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none'
            placeholder='Describe what this service offers...'
          />
          <p className='mt-1 text-xs text-gray-500'>
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Price and Coverage Row */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Base Price */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Base Price <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium'>
                ₹
              </span>
              <input
                type='number'
                value={formData.basePrice}
                onChange={(e) =>
                  handleInputChange("basePrice", Number(e.target.value))
                }
                min={0}
                step={0.01}
                className={`w-full pl-8 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.basePrice
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder='0.00'
              />
            </div>
            {errors.basePrice && (
              <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {errors.basePrice}
              </p>
            )}
            <p className='mt-1.5 text-xs text-gray-500'>
              Formatted: {formatCurrency(formData.basePrice)}
            </p>
          </div>

          {/* Coverage Years */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Coverage Period <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <input
                type='number'
                value={formData.coverageYears}
                onChange={(e) =>
                  handleInputChange("coverageYears", Number(e.target.value))
                }
                min={1}
                max={10}
                className={`w-full px-3 pr-16 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.coverageYears
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              <span className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm'>
                {formData.coverageYears === 1 ? "year" : "years"}
              </span>
            </div>
            {errors.coverageYears && (
              <p className='mt-1.5 text-sm text-red-600 flex items-center gap-1'>
                <svg
                  className='w-4 h-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
                {errors.coverageYears}
              </p>
            )}
            <div className='flex gap-2 mt-2'>
              {[1, 2, 3, 5].map((years) => (
                <button
                  key={years}
                  type='button'
                  onClick={() => handleInputChange("coverageYears", years)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.coverageYears === years
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {years}Y
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1.5'>
            Benefits <span className='text-red-500'>*</span>
          </label>
          <div className='flex gap-2 mb-2'>
            <input
              type='text'
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={handleBenefitKeyDown}
              className='flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'
              placeholder='Type a benefit and press Enter or click Add'
            />
            <button
              type='button'
              onClick={addBenefit}
              disabled={!newBenefit.trim()}
              className='px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Add
            </button>
          </div>
          {errors.benefits && (
            <p className='mb-2 text-sm text-red-600 flex items-center gap-1'>
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              {errors.benefits}
            </p>
          )}
          <div className='space-y-2'>
            {formData.benefits.map((benefit, index) => (
              <div
                key={index}
                className='flex items-center justify-between bg-green-50 border border-green-100 px-3 py-2.5 rounded-lg group'
              >
                <div className='flex items-center gap-2'>
                  <svg
                    className='w-4 h-4 text-green-600 flex-shrink-0'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                  <span className='text-sm text-gray-800'>{benefit}</span>
                </div>
                <button
                  type='button'
                  onClick={() => removeBenefit(index)}
                  className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all'
                  title='Remove benefit'
                >
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            ))}
            {formData.benefits.length === 0 && (
              <div className='text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
                <p className='text-gray-500 text-sm'>No benefits added yet</p>
              </div>
            )}
          </div>
          <p className='mt-1.5 text-xs text-gray-500'>
            {formData.benefits.length} benefit
            {formData.benefits.length !== 1 ? "s" : ""} added
          </p>
        </div>

        {/* Active Status Toggle */}
        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
          <div>
            <label className='text-sm font-medium text-gray-700'>
              Service Status
            </label>
            <p className='text-xs text-gray-500 mt-0.5'>
              {formData.isActive
                ? "Service is active and available for purchase"
                : "Service is inactive and hidden from customers"}
            </p>
          </div>
          <button
            type='button'
            onClick={() => handleInputChange("isActive", !formData.isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              formData.isActive ? "bg-blue-600" : "bg-gray-300"
            }`}
            role='switch'
            aria-checked={formData.isActive}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                formData.isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Form Actions */}
        <div className='flex justify-end gap-3 pt-6 border-t border-gray-200'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={isUpdating || !isDirty}
            className='px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm'
          >
            {isUpdating && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
            )}
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVas;
