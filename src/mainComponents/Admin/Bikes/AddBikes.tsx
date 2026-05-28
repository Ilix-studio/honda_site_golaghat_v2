import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/redux";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import { useCreateBikeMutation } from "@/redux-store/services/BikeSystemApi/bikeApi";
import {
  BikeVariant,
  PriceBreakdown,
} from "@/redux-store/slices/BikeSystemSlice/bikesSlice";

interface BikeFormData {
  modelName: string;
  mainCategory: "bike" | "scooter";
  category:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric"
    | "commuter"
    | "automatic"
    | "gearless";
  year: number;
  variants: BikeVariant[];
  priceBreakdown: PriceBreakdown;
  engineSize: string;
  power: number;
  transmission: string;
  fuelNorms: "BS4" | "BS6" | "BS6 Phase 2" | "Electric";
  isE20Efficiency: boolean;
  features: string[];
  colors: string[];
  stockAvailable: number;
  isNewModel: boolean;
}

const validateForm = (data: BikeFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!data.modelName?.trim()) errors.modelName = "Model name is required";
  if (!data.mainCategory) errors.mainCategory = "Main category is required";
  if (!data.category) errors.category = "Category is required";
  if (
    !data.year ||
    data.year < 2000 ||
    data.year > new Date().getFullYear() + 2
  )
    errors.year = `Year must be between 2000 and ${new Date().getFullYear() + 2}`;
  if (
    !data.priceBreakdown?.exShowroomPrice ||
    data.priceBreakdown.exShowroomPrice <= 0
  )
    errors.exShowroomPrice = "Ex-showroom price must be greater than 0";
  if (!data.priceBreakdown?.rtoCharges || data.priceBreakdown.rtoCharges < 0)
    errors.rtoCharges = "RTO charges cannot be negative";
  if (
    !data.priceBreakdown?.insuranceComprehensive ||
    data.priceBreakdown.insuranceComprehensive < 0
  )
    errors.insuranceComprehensive = "Insurance amount cannot be negative";
  if (!data.engineSize?.trim())
    errors.engineSize = "Engine details are required";
  if (!data.power || data.power <= 0) errors.power = "Power is required";
  if (!data.transmission?.trim())
    errors.transmission = "Transmission details are required";
  if (!data.fuelNorms) errors.fuelNorms = "Fuel norms are required";
  if (data.stockAvailable < 0)
    errors.stockAvailable = "Stock cannot be negative";
  if (!data.colors || data.colors.length === 0)
    errors.colors = "At least one color is required";
  if (!data.variants || data.variants.length === 0)
    errors.variants = "At least one variant is required";
  return errors;
};

const SELECT_CLS =
  "w-full h-9 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const getCategoryOptions = (mainCategory: string) => {
  if (mainCategory === "bike")
    return [
      "sport",
      "adventure",
      "cruiser",
      "touring",
      "naked",
      "electric",
      "commuter",
    ];
  if (mainCategory === "scooter") return ["automatic", "gearless", "electric"];
  return [];
};

const AddBikes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<BikeVariant>({
    name: "",
    features: [],
    priceAdjustment: 0,
    isAvailable: true,
  });

  const [createBike, { isLoading }] = useCreateBikeMutation();

  const form = useForm<BikeFormData>({
    defaultValues: {
      features: [],
      colors: [],
      variants: [
        {
          name: "Standard",
          features: [],
          priceAdjustment: 0,
          isAvailable: true,
        },
      ],
      priceBreakdown: {
        exShowroomPrice: 0,
        rtoCharges: 0,
        insuranceComprehensive: 0,
      },
      stockAvailable: 0,
      isNewModel: false,
      isE20Efficiency: false,
      mainCategory: "bike",
      fuelNorms: "BS6",
    },
  });

  const { register, handleSubmit, watch, setValue } = form;

  const watchedFeatures = watch("features") || [];
  const watchedColors = watch("colors") || [];
  const watchedVariants = watch("variants") || [];
  const watchedMainCategory = watch("mainCategory");
  const watchedPriceBreakdown = watch("priceBreakdown");

  const addFeature = () => {
    if (
      currentFeature.trim() &&
      !watchedFeatures.includes(currentFeature.trim())
    ) {
      setValue("features", [...watchedFeatures, currentFeature.trim()]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) =>
    setValue(
      "features",
      watchedFeatures.filter((_, i) => i !== index),
    );

  const addColor = () => {
    if (currentColor.trim() && !watchedColors.includes(currentColor.trim())) {
      setValue("colors", [...watchedColors, currentColor.trim()]);
      setCurrentColor("");
    }
  };

  const removeColor = (index: number) =>
    setValue(
      "colors",
      watchedColors.filter((_, i) => i !== index),
    );

  const addVariant = () => {
    if (currentVariant.name.trim()) {
      setValue("variants", [...watchedVariants, { ...currentVariant }]);
      setCurrentVariant({
        name: "",
        features: [],
        priceAdjustment: 0,
        isAvailable: true,
      });
    }
  };

  const removeVariant = (index: number) => {
    if (watchedVariants.length > 1)
      setValue(
        "variants",
        watchedVariants.filter((_, i) => i !== index),
      );
  };

  const addVariantFeature = (feature: string) => {
    if (feature.trim())
      setCurrentVariant((prev) => ({
        ...prev,
        features: [...prev.features, feature.trim()],
      }));
  };

  const removeVariantFeature = (index: number) =>
    setCurrentVariant((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));

  const onSubmit = async (data: BikeFormData) => {
    setFormErrors({});
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      const result = await createBike(data).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: `${data.mainCategory === "bike" ? "Bike" : "Scooter"} created successfully!`,
        }),
      );
      navigate(`/bikes/add/${result.data.bikeId}/images`);
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message:
            error?.data?.error ||
            error?.message ||
            `Failed to create ${data.mainCategory}`,
        }),
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container max-w-6xl px-4 py-8'>
        <Card>
          <CardHeader>
            <CardTitle>Add New Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
              {/* Basic Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Basic Information</h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='modelName'>Model Name *</Label>
                    <Input
                      id='modelName'
                      {...register("modelName")}
                      className={formErrors.modelName ? "border-red-500" : ""}
                    />
                    {formErrors.modelName && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.modelName}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='mainCategory'>Main Category *</Label>
                    <select
                      id='mainCategory'
                      value={watchedMainCategory}
                      onChange={(e) => {
                        setValue(
                          "mainCategory",
                          e.target.value as "bike" | "scooter",
                        );
                        // reset category when main category changes
                        setValue("category", "" as any);
                      }}
                      className={`${SELECT_CLS} ${formErrors.mainCategory ? "border-red-500" : ""}`}
                    >
                      <option value='bike'>Bike</option>
                      <option value='scooter'>Scooter</option>
                    </select>
                    {formErrors.mainCategory && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.mainCategory}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category *</Label>
                    <select
                      id='category'
                      value={watch("category") ?? ""}
                      onChange={(e) =>
                        setValue("category", e.target.value as any)
                      }
                      disabled={!watchedMainCategory}
                      className={`${SELECT_CLS} ${formErrors.category ? "border-red-500" : ""}`}
                    >
                      <option value='' disabled>
                        Select category
                      </option>
                      {getCategoryOptions(watchedMainCategory).map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='year'>Year *</Label>
                    <Input
                      id='year'
                      type='number'
                      {...register("year", { valueAsNumber: true })}
                      className={formErrors.year ? "border-red-500" : ""}
                    />
                    {formErrors.year && (
                      <p className='text-red-500 text-sm'>{formErrors.year}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='fuelNorms'>Fuel Norms *</Label>
                    <select
                      id='fuelNorms'
                      value={watch("fuelNorms")}
                      onChange={(e) =>
                        setValue(
                          "fuelNorms",
                          e.target.value as BikeFormData["fuelNorms"],
                        )
                      }
                      className={`${SELECT_CLS} ${formErrors.fuelNorms ? "border-red-500" : ""}`}
                    >
                      <option value='BS4'>BS4</option>
                      <option value='BS6'>BS6</option>
                      <option value='BS6 Phase 2'>BS6 Phase 2</option>
                      <option value='Electric'>Electric</option>
                    </select>
                    {formErrors.fuelNorms && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.fuelNorms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Pricing Details</h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='exShowroomPrice'>
                      Ex-Showroom Price (₹) *
                    </Label>
                    <Input
                      id='exShowroomPrice'
                      type='number'
                      step='0.01'
                      value={watchedPriceBreakdown?.exShowroomPrice || ""}
                      onChange={(e) =>
                        setValue(
                          "priceBreakdown.exShowroomPrice",
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value),
                        )
                      }
                      className={
                        formErrors.exShowroomPrice ? "border-red-500" : ""
                      }
                    />
                    {formErrors.exShowroomPrice && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.exShowroomPrice}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='rtoCharges'>RTO Charges (₹) *</Label>
                    <Input
                      id='rtoCharges'
                      type='number'
                      step='0.01'
                      value={watchedPriceBreakdown?.rtoCharges || ""}
                      onChange={(e) =>
                        setValue(
                          "priceBreakdown.rtoCharges",
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value),
                        )
                      }
                      className={formErrors.rtoCharges ? "border-red-500" : ""}
                    />
                    {formErrors.rtoCharges && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.rtoCharges}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='insuranceComprehensive'>
                      Insurance (₹) *
                    </Label>
                    <Input
                      id='insuranceComprehensive'
                      type='number'
                      step='0.01'
                      value={
                        watchedPriceBreakdown?.insuranceComprehensive || ""
                      }
                      onChange={(e) =>
                        setValue(
                          "priceBreakdown.insuranceComprehensive",
                          e.target.value === ""
                            ? 0
                            : parseFloat(e.target.value),
                        )
                      }
                      className={
                        formErrors.insuranceComprehensive
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {formErrors.insuranceComprehensive && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.insuranceComprehensive}
                      </p>
                    )}
                  </div>
                </div>

                {watchedPriceBreakdown && (
                  <div className='p-4 bg-gray-50 rounded-lg'>
                    <p className='text-lg font-semibold'>
                      On-Road Price: ₹
                      {(
                        (watchedPriceBreakdown.exShowroomPrice || 0) +
                        (watchedPriceBreakdown.rtoCharges || 0) +
                        (watchedPriceBreakdown.insuranceComprehensive || 0)
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>
                  Technical Specifications
                </h3>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='engineSize'>Engine Size *</Label>
                    <Input
                      id='engineSize'
                      {...register("engineSize")}
                      placeholder='e.g., 150cc'
                      className={formErrors.engineSize ? "border-red-500" : ""}
                    />
                    {formErrors.engineSize && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.engineSize}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='power'>Power (HP) *</Label>
                    <Input
                      id='power'
                      type='number'
                      step='0.1'
                      {...register("power", { valueAsNumber: true })}
                      className={formErrors.power ? "border-red-500" : ""}
                    />
                    {formErrors.power && (
                      <p className='text-red-500 text-sm'>{formErrors.power}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='transmission'>Transmission *</Label>
                    <Input
                      id='transmission'
                      {...register("transmission")}
                      placeholder='e.g., 5-Speed Manual'
                      className={
                        formErrors.transmission ? "border-red-500" : ""
                      }
                    />
                    {formErrors.transmission && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.transmission}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='isE20Efficiency'
                    checked={watch("isE20Efficiency")}
                    onCheckedChange={(checked) =>
                      setValue("isE20Efficiency", !!checked)
                    }
                  />
                  <Label htmlFor='isE20Efficiency'>
                    E20 Fuel Efficiency Compatible
                  </Label>
                </div>
              </div>

              {/* Variants */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Variants</h3>

                <div className='space-y-4'>
                  {watchedVariants.map((variant, index) => (
                    <div key={index} className='p-4 border rounded-lg'>
                      <div className='flex justify-between items-start mb-2'>
                        <h4 className='font-medium'>{variant.name}</h4>
                        {watchedVariants.length > 1 && (
                          <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                      <p className='text-sm text-gray-600'>
                        Price Adjustment: ₹{variant.priceAdjustment}
                      </p>
                      <p className='text-sm text-gray-600'>
                        Features: {variant.features.join(", ") || "None"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className='space-y-4 p-4 border-2 border-dashed rounded-lg'>
                  <h4 className='font-medium'>Add New Variant</h4>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <Input
                      placeholder='Variant name'
                      value={currentVariant.name}
                      onChange={(e) =>
                        setCurrentVariant((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type='number'
                      placeholder='Price adjustment (₹)'
                      value={currentVariant.priceAdjustment}
                      onChange={(e) =>
                        setCurrentVariant((prev) => ({
                          ...prev,
                          priceAdjustment: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Input
                      placeholder='Add variant feature'
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVariantFeature(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>

                  {currentVariant.features.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {currentVariant.features.map((feature, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                        >
                          <span className='text-sm'>{feature}</span>
                          <button
                            type='button'
                            onClick={() => removeVariantFeature(index)}
                            className='text-gray-400 hover:text-gray-700 transition-colors'
                          >
                            <X className='h-3 w-3' />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    type='button'
                    onClick={addVariant}
                    disabled={!currentVariant.name.trim()}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Variant
                  </Button>
                </div>

                {formErrors.variants && (
                  <p className='text-red-500 text-sm'>{formErrors.variants}</p>
                )}
              </div>

              {/* Features */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Features</h3>

                <div className='flex gap-2'>
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder='Add a feature'
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addFeature())
                    }
                  />
                  <Button type='button' onClick={addFeature}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {watchedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-1 bg-blue-100 px-2 py-1 rounded'
                    >
                      <span className='text-sm'>{feature}</span>
                      <button
                        type='button'
                        onClick={() => removeFeature(index)}
                        className='text-gray-400 hover:text-gray-700 transition-colors'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Available Colors *</h3>

                <div className='flex gap-2'>
                  <Input
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    placeholder='Add a color'
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addColor())
                    }
                  />
                  <Button type='button' onClick={addColor}>
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {watchedColors.map((color, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-1 bg-green-100 px-2 py-1 rounded'
                    >
                      <span className='text-sm'>{color}</span>
                      <button
                        type='button'
                        onClick={() => removeColor(index)}
                        className='text-gray-400 hover:text-gray-700 transition-colors'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                </div>

                {formErrors.colors && (
                  <p className='text-red-500 text-sm'>{formErrors.colors}</p>
                )}
              </div>

              {/* Inventory */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Inventory & Status</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='stockAvailable'>Stock Available</Label>
                    <Input
                      id='stockAvailable'
                      type='number'
                      {...register("stockAvailable", { valueAsNumber: true })}
                      className={
                        formErrors.stockAvailable ? "border-red-500" : ""
                      }
                    />
                    {formErrors.stockAvailable && (
                      <p className='text-red-500 text-sm'>
                        {formErrors.stockAvailable}
                      </p>
                    )}
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='isNewModel'
                        checked={watch("isNewModel")}
                        onCheckedChange={(checked) =>
                          setValue("isNewModel", !!checked)
                        }
                      />
                      <Label htmlFor='isNewModel'>Mark as New Model</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className='flex justify-end space-x-2 pt-6 border-t'>
                <Link to='/admin/dashboard'>
                  <Button variant='outline'>Cancel</Button>
                </Link>
                <Button
                  type='submit'
                  disabled={isLoading}
                  className='bg-red-500 hover:bg-red-700'
                >
                  {isLoading
                    ? "Creating..."
                    : `Create ${watch("mainCategory") === "bike" ? "Bike" : "Scooter"}`}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddBikes;
