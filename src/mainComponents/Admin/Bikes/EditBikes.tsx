import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ArrowLeft, Plus, X, Loader2, AlertCircle, Info } from "lucide-react";

// Redux
import { useAppDispatch } from "../../../hooks/redux";
import {
  useGetBikeByIdQuery,
  useUpdateBikeMutation,
} from "../../../redux-store/services/bikeApi";
import { useGetBranchesQuery } from "../../../redux-store/services/branchApi";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import { bikeSchema } from "@/zod/zod.schema";
import { z } from "zod";

type BikeFormData = z.infer<typeof bikeSchema>;

const EditBikes = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");

  // Debug information
  useEffect(() => {
    console.log("EditBikes Debug Info:");
    console.log("- URL Parameter ID:", id);
    console.log("- Current pathname:", window.location.pathname);
    console.log("- Full URL:", window.location.href);
  }, [id]);

  // Use skipToken when id is undefined to prevent unnecessary API calls
  const {
    data: bikeResponse,
    isLoading: bikeLoading,
    error: bikeError,
    isError: isBikeError,
  } = useGetBikeByIdQuery(id ?? skipToken);

  const { data: branchesData } = useGetBranchesQuery();
  const [updateBike, { isLoading: updateLoading }] = useUpdateBikeMutation();

  const bike = bikeResponse?.data;

  // Debug bike data
  useEffect(() => {
    if (bike) {
      console.log("Bike data loaded:", bike);
    }
    if (bikeError) {
      console.error("Bike loading error:", bikeError);
    }
  }, [bike, bikeError]);

  const form = useForm<BikeFormData>({
    resolver: zodResolver(bikeSchema),
    defaultValues: {
      features: [],
      colors: [],
      images: [],
      inStock: true,
      quantity: 0,
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

  // Populate form when bike data is loaded
  useEffect(() => {
    if (bike) {
      console.log("Populating form with bike data:", bike);
      reset({
        modelName: bike.modelName,
        category: bike.category as any,
        year: bike.year,
        price: bike.price,
        engine: bike.engine,
        power: bike.power,
        transmission: bike.transmission,
        features: bike.features || [],
        colors: bike.colors || [],
        images: bike.images || [],
        inStock: bike.inStock,
        quantity: bike.quantity,
        branch: bike.branch,
      });
    }
  }, [bike, reset]);

  const addFeature = () => {
    if (currentFeature.trim()) {
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

  const addColor = () => {
    if (currentColor.trim()) {
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

    console.log("Submitting update for bike ID:", id);
    console.log("Form data:", data);

    try {
      const result = await updateBike({ id, data }).unwrap();
      console.log("Update successful:", result);
      dispatch(
        addNotification({
          type: "success",
          message: "Motorcycle updated successfully!",
        })
      );
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error("Update failed:", error);
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Failed to update motorcycle",
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
            <h1 className='text-3xl font-bold mb-4'>Invalid Motorcycle ID</h1>
            <p className='text-muted-foreground mb-6'>
              No motorcycle ID was provided in the URL.
            </p>
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
              <div className='flex items-start'>
                <Info className='h-5 w-5 text-yellow-600 mt-0.5 mr-2' />
                <div className='text-sm text-yellow-800'>
                  <p className='font-medium'>Expected URL format:</p>
                  <code className='text-xs bg-yellow-100 px-1 py-0.5 rounded'>
                    /admin/addbikes/edit/[BIKE_ID]
                  </code>
                  <p className='mt-2'>
                    Make sure you're clicking the edit button from the admin
                    dashboard or that the URL contains a valid bike ID.
                  </p>
                </div>
              </div>
            </div>
            <div className='flex gap-4 justify-center'>
              <Link to='/admin/dashboard'>
                <Button>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Dashboard
                </Button>
              </Link>
              <Button variant='outline' onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
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
          <h2 className='text-xl font-semibold mb-2'>
            Loading Motorcycle Data
          </h2>
          <p className='text-muted-foreground mb-4'>
            Fetching details for bike ID:{" "}
            <code className='bg-gray-100 px-1 py-0.5 rounded text-xs'>
              {id}
            </code>
          </p>
          <p className='text-sm text-muted-foreground'>
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
            <h1 className='text-3xl font-bold mb-4'>Motorcycle Not Found</h1>
            <p className='text-muted-foreground mb-6'>
              {isBikeError
                ? "There was an error loading the motorcycle data. Please try again."
                : "The motorcycle you're trying to edit doesn't exist or has been removed."}
            </p>

            {/* Debug Information */}
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left max-w-md mx-auto'>
              <h3 className='font-medium text-sm mb-2'>Debug Information:</h3>
              <div className='text-xs text-muted-foreground space-y-1'>
                <p>
                  Bike ID:{" "}
                  <code className='bg-gray-100 px-1 py-0.5 rounded'>{id}</code>
                </p>
                <p>Error: {isBikeError ? "API Error" : "Bike not found"}</p>
                <p>Response: {bikeResponse ? "Received" : "None"}</p>
              </div>
            </div>

            <div className='flex gap-4 justify-center'>
              <Link to='/admin/dashboard'>
                <Button>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container max-w-4xl px-4 py-8'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <Link to='/admin/dashboard'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold'>Edit Motorcycle</h1>
            <p className='text-muted-foreground'>
              Update the details for {bike.modelName}
            </p>
            {/* Debug info in development */}
            {process.env.NODE_ENV === "development" && (
              <p className='text-xs text-blue-600 mt-1'>
                Editing bike ID: {id}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Motorcycle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Basic Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='modelName'>Model Name</Label>
                  <Input
                    id='modelName'
                    {...register("modelName")}
                    placeholder='e.g., CBR1000RR'
                  />
                  {errors.modelName && (
                    <p className='text-sm text-red-500'>
                      {errors.modelName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Category</Label>
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
                      <SelectItem value='sport'>Sport</SelectItem>
                      <SelectItem value='adventure'>Adventure</SelectItem>
                      <SelectItem value='cruiser'>Cruiser</SelectItem>
                      <SelectItem value='touring'>Touring</SelectItem>
                      <SelectItem value='naked'>Naked</SelectItem>
                      <SelectItem value='electric'>Electric</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className='text-sm text-red-500'>
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='year'>Year</Label>
                  <Input
                    id='year'
                    type='number'
                    {...register("year", { valueAsNumber: true })}
                    placeholder='2024'
                  />
                  {errors.year && (
                    <p className='text-sm text-red-500'>
                      {errors.year.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='price'>Price (₹)</Label>
                  <Input
                    id='price'
                    type='number'
                    {...register("price", { valueAsNumber: true })}
                    placeholder='150000'
                  />
                  {errors.price && (
                    <p className='text-sm text-red-500'>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='engine'>Engine</Label>
                  <Input
                    id='engine'
                    {...register("engine")}
                    placeholder='e.g., 1000cc Liquid-cooled'
                  />
                  {errors.engine && (
                    <p className='text-sm text-red-500'>
                      {errors.engine.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='power'>Power (HP)</Label>
                  <Input
                    id='power'
                    type='number'
                    {...register("power", { valueAsNumber: true })}
                    placeholder='189'
                  />
                  {errors.power && (
                    <p className='text-sm text-red-500'>
                      {errors.power.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='transmission'>Transmission</Label>
                  <Input
                    id='transmission'
                    {...register("transmission")}
                    placeholder='e.g., 6-Speed Manual'
                  />
                  {errors.transmission && (
                    <p className='text-sm text-red-500'>
                      {errors.transmission.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='branch'>Branch</Label>
                  <Select
                    value={watch("branch")}
                    onValueChange={(value) => setValue("branch", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select branch' />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesData?.data?.map((branch: any) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name} - {branch.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branch && (
                    <p className='text-sm text-red-500'>
                      {errors.branch.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className='space-y-4'>
                <Label>Features</Label>
                <div className='flex gap-2'>
                  <Input
                    value={currentFeature}
                    onChange={(e) => setCurrentFeature(e.target.value)}
                    placeholder='Add a feature'
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type='button' onClick={addFeature} size='sm'>
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
                <Label>Available Colors</Label>
                <div className='flex gap-2'>
                  <Input
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    placeholder='Add a color'
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addColor();
                      }
                    }}
                  />
                  <Button type='button' onClick={addColor} size='sm'>
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
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='inStock'
                    checked={watch("inStock")}
                    onCheckedChange={(checked) =>
                      setValue("inStock", !!checked)
                    }
                  />
                  <Label htmlFor='inStock'>In Stock</Label>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='quantity'>Quantity</Label>
                  <Input
                    id='quantity'
                    type='number'
                    {...register("quantity", { valueAsNumber: true })}
                    placeholder='5'
                  />
                  {errors.quantity && (
                    <p className='text-sm text-red-500'>
                      {errors.quantity.message}
                    </p>
                  )}
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
                    "Update Motorcycle"
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
