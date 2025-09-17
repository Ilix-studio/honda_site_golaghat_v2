import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate, Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, X, Loader2, AlertCircle, Images } from "lucide-react";

// Redux
import { useAppDispatch } from "../../../hooks/redux";
import {
  useGetBikeByIdQuery,
  useUpdateBikeMutation,
} from "../../../redux-store/services/BikeSystemApi/bikeApi";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import {
  BikeVariant,
  PriceBreakdown,
} from "@/redux-store/slices/BikeSystemSlice/bikesSlice";

// Enhanced form data interface matching backend model
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
  isActive: boolean;
}

const EditBikes = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [currentVariant, setCurrentVariant] = useState<BikeVariant>({
    name: "",
    features: [],
    priceAdjustment: 0,
    isAvailable: true,
  });

  // Use skipToken when id is undefined to prevent unnecessary API calls
  const {
    data: bikeResponse,
    isLoading: bikeLoading,
    isError: isBikeError,
  } = useGetBikeByIdQuery(id ?? skipToken);

  const [updateBike, { isLoading: updateLoading }] = useUpdateBikeMutation();

  const bike = bikeResponse?.data;

  const form = useForm<BikeFormData>({
    defaultValues: {
      features: [],
      colors: [],
      variants: [],
      priceBreakdown: {
        exShowroomPrice: 0,
        rtoCharges: 0,
        insuranceComprehensive: 0,
      },
      stockAvailable: 0,
      isNewModel: false,
      isE20Efficiency: false,
      isActive: true,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = form;

  const watchedFeatures = watch("features") || [];
  const watchedColors = watch("colors") || [];
  const watchedVariants = watch("variants") || [];
  const watchedMainCategory = watch("mainCategory");
  const watchedPriceBreakdown = watch("priceBreakdown");

  // Populate form when bike data is loaded
  useEffect(() => {
    if (bike) {
      reset({
        modelName: bike.modelName,
        mainCategory: bike.mainCategory,
        category: bike.category,
        year: bike.year,
        variants: bike.variants || [
          {
            name: "Standard",
            features: [],
            priceAdjustment: 0,
            isAvailable: true,
          },
        ],
        priceBreakdown: bike.priceBreakdown,
        engineSize: bike.engineSize,
        power: bike.power,
        transmission: bike.transmission,
        fuelNorms: bike.fuelNorms,
        isE20Efficiency: bike.isE20Efficiency,
        features: bike.features || [],
        colors: bike.colors || [],
        stockAvailable: bike.stockAvailable,
        isNewModel: bike.isNewModel || false,
        isActive: bike.isActive,
      });
    }
  }, [bike, reset]);

  // Category options based on main category
  const getCategoryOptions = (mainCategory: string) => {
    if (mainCategory === "bike") {
      return [
        "sport",
        "adventure",
        "cruiser",
        "touring",
        "naked",
        "electric",
        "commuter",
      ];
    } else if (mainCategory === "scooter") {
      return ["automatic", "gearless", "electric"];
    }
    return [];
  };

  // Feature management
  const addFeature = () => {
    if (
      currentFeature.trim() &&
      !watchedFeatures.includes(currentFeature.trim())
    ) {
      setValue("features", [...watchedFeatures, currentFeature.trim()]);
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setValue(
      "features",
      watchedFeatures.filter((_, i) => i !== index)
    );
  };

  // Color management
  const addColor = () => {
    if (currentColor.trim() && !watchedColors.includes(currentColor.trim())) {
      setValue("colors", [...watchedColors, currentColor.trim()]);
      setCurrentColor("");
    }
  };

  const removeColor = (index: number) => {
    setValue(
      "colors",
      watchedColors.filter((_, i) => i !== index)
    );
  };

  // Variant management
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
    if (watchedVariants.length > 1) {
      setValue(
        "variants",
        watchedVariants.filter((_, i) => i !== index)
      );
    }
  };

  const addVariantFeature = (feature: string) => {
    if (feature.trim()) {
      setCurrentVariant((prev) => ({
        ...prev,
        features: [...prev.features, feature.trim()],
      }));
    }
  };

  const removeVariantFeature = (index: number) => {
    setCurrentVariant((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Form submission
  const onSubmit = async (data: BikeFormData) => {
    if (!id) {
      dispatch(
        addNotification({
          type: "error",
          message: "No bike ID provided",
        })
      );
      return;
    }

    try {
      const result = await updateBike({ id, data }).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Vehicle updated successfully!",
        })
      );
      navigate("/admin/dashboard");
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to update vehicle",
        })
      );
    }
  };

  // Handle case when no ID is provided
  if (!id) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container max-w-4xl px-4 py-8'>
          <div className='text-center'>
            <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
            <h1 className='text-3xl font-bold mb-4'>Invalid Vehicle ID</h1>
            <p className='text-muted-foreground mb-6'>
              No vehicle ID was provided in the URL.
            </p>
            <Link to='/admin/dashboard'>
              <Button>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (bikeLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-12 w-12 animate-spin mx-auto mb-4 text-blue-600' />
          <h2 className='text-xl font-semibold mb-2'>Loading Vehicle Data</h2>
          <p className='text-muted-foreground'>
            Please wait while we retrieve the information...
          </p>
        </div>
      </div>
    );
  }

  // Error state or bike not found
  if (isBikeError || !bike) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='container max-w-4xl px-4 py-8'>
          <div className='text-center'>
            <AlertCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
            <h1 className='text-3xl font-bold mb-4'>Vehicle Not Found</h1>
            <p className='text-muted-foreground mb-6'>
              The vehicle you're trying to edit doesn't exist or has been
              removed.
            </p>
            <Link to='/admin/dashboard'>
              <Button>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container max-w-6xl px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <Link to='/admin/dashboard'>
              <Button variant='outline' size='sm'>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className='text-2xl font-semibold'>Edit Vehicle</h1>
              <p className='text-muted-foreground'>
                Update details for {bike.modelName}
              </p>
            </div>
          </div>

          {/* Manage Images Button */}
          <Link to={`/admin/bikes/${bike._id}/images/edit`}>
            <Button variant='outline'>
              <Images className='h-4 w-4 mr-2' />
              Manage Images
            </Button>
          </Link>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
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
                      {...register("modelName", {
                        required: "Model name is required",
                      })}
                    />
                    {errors.modelName && (
                      <p className='text-sm text-red-500'>
                        {errors.modelName.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='mainCategory'>Main Category *</Label>
                    <Select
                      value={watchedMainCategory}
                      onValueChange={(value) =>
                        setValue("mainCategory", value as "bike" | "scooter")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select main category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='bike'>Bike</SelectItem>
                        <SelectItem value='scooter'>Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category *</Label>
                    <Select
                      value={watch("category")}
                      onValueChange={(value) =>
                        setValue("category", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {getCategoryOptions(watchedMainCategory).map(
                          (option) => (
                            <SelectItem key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='year'>Year *</Label>
                    <Input
                      id='year'
                      type='number'
                      {...register("year", {
                        required: "Year is required",
                        valueAsNumber: true,
                      })}
                    />
                    {errors.year && (
                      <p className='text-sm text-red-500'>
                        {errors.year.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='fuelNorms'>Fuel Norms *</Label>
                    <Select
                      value={watch("fuelNorms")}
                      onValueChange={(value) =>
                        setValue("fuelNorms", value as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select fuel norms' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='BS4'>BS4</SelectItem>
                        <SelectItem value='BS6'>BS6</SelectItem>
                        <SelectItem value='BS6 Phase 2'>BS6 Phase 2</SelectItem>
                        <SelectItem value='Electric'>Electric</SelectItem>
                      </SelectContent>
                    </Select>
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue(
                          "priceBreakdown.exShowroomPrice",
                          value === "" ? 0 : parseFloat(value)
                        );
                      }}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='rtoCharges'>RTO Charges (₹) *</Label>
                    <Input
                      id='rtoCharges'
                      type='number'
                      step='0.01'
                      value={watchedPriceBreakdown?.rtoCharges || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue(
                          "priceBreakdown.rtoCharges",
                          value === "" ? 0 : parseFloat(value)
                        );
                      }}
                    />
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
                      onChange={(e) => {
                        const value = e.target.value;
                        setValue(
                          "priceBreakdown.insuranceComprehensive",
                          value === "" ? 0 : parseFloat(value)
                        );
                      }}
                    />
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
                      {...register("engineSize", {
                        required: "Engine size is required",
                      })}
                      placeholder='e.g., 150cc'
                    />
                    {errors.engineSize && (
                      <p className='text-sm text-red-500'>
                        {errors.engineSize.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='power'>Power (HP) *</Label>
                    <Input
                      id='power'
                      type='number'
                      step='0.1'
                      {...register("power", {
                        required: "Power is required",
                        valueAsNumber: true,
                      })}
                    />
                    {errors.power && (
                      <p className='text-sm text-red-500'>
                        {errors.power.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='transmission'>Transmission *</Label>
                    <Input
                      id='transmission'
                      {...register("transmission", {
                        required: "Transmission is required",
                      })}
                      placeholder='e.g., 5-Speed Manual'
                    />
                    {errors.transmission && (
                      <p className='text-sm text-red-500'>
                        {errors.transmission.message}
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
                            <X className='h-4 w-4' />
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

                {/* Add New Variant */}
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

                  {currentVariant.features.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {currentVariant.features.map((feature, index) => (
                        <div
                          key={index}
                          className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                        >
                          <span className='text-sm'>{feature}</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeVariantFeature(index)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className='flex gap-2'>
                    <Input
                      placeholder='Add variant feature'
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVariantFeature(e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>

                  <Button
                    type='button'
                    onClick={addVariant}
                    disabled={!currentVariant.name.trim()}
                  >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Variant
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Features</h3>

                <div className='flex gap-2'>
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder='Add a feature'
                    onKeyPress={(e) =>
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
                      className='flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm'
                    >
                      {feature}
                      <button
                        type='button'
                        onClick={() => removeFeature(index)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Available Colors</h3>

                <div className='flex gap-2'>
                  <Input
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    placeholder='Add a color'
                    onKeyPress={(e) =>
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
                      className='flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm'
                    >
                      {color}
                      <button
                        type='button'
                        onClick={() => removeColor(index)}
                        className='text-green-600 hover:text-green-800'
                      >
                        <X className='h-3 w-3' />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock Information */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>Inventory & Status</h3>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='stockAvailable'>Stock Available</Label>
                    <Input
                      id='stockAvailable'
                      type='number'
                      {...register("stockAvailable", { valueAsNumber: true })}
                    />
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

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='isActive'
                        checked={watch("isActive")}
                        onCheckedChange={(checked) =>
                          setValue("isActive", !!checked)
                        }
                      />
                      <Label htmlFor='isActive'>Active</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className='flex gap-4 pt-4'>
                <Button type='submit' disabled={updateLoading}>
                  {updateLoading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Updating...
                    </>
                  ) : (
                    "Update Vehicle"
                  )}
                </Button>
                <Link to='/admin/dashboard'>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditBikes;
