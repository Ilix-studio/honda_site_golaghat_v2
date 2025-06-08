import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { ArrowLeft, Plus, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Redux
import { useAppDispatch } from "../../../hooks/redux";

import { useGetBranchesQuery } from "../../../redux-store/services/branchApi";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import { useCreateBikeMutation } from "@/redux-store/services/bikeApi";

// Form schema
const bikeSchema = z.object({
  modelName: z.string().min(1, "Model name is required"),
  category: z.enum([
    "sport",
    "adventure",
    "cruiser",
    "touring",
    "naked",
    "electric",
  ]),
  year: z
    .number()
    .min(2000)
    .max(new Date().getFullYear() + 1),
  price: z.number().min(1, "Price must be greater than 0"),
  engine: z.string().min(1, "Engine details are required"),
  power: z.number().min(1, "Power is required"),
  transmission: z.string().min(1, "Transmission details are required"),
  features: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  inStock: z.boolean().optional(),
  quantity: z.number().min(0).optional(),
  branch: z.string().min(1, "Branch is required"),
});

type BikeFormData = z.infer<typeof bikeSchema>;

const AddBikes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");

  const { data: branchesData } = useGetBranchesQuery();
  const [createBike, { isLoading }] = useCreateBikeMutation();

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
  } = form;
  const watchedFeatures = watch("features") || [];
  const watchedColors = watch("colors") || [];

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
    try {
      await createBike(data).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Motorcycle added successfully!",
        })
      );
      navigate("/admin/dashboard");
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.message || "Failed to add motorcycle",
        })
      );
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container max-w-4xl px-4 py-8'>
        <div className='mb-6'>
          <Link to='/admin/dashboard'>
            <Button variant='ghost' className='pl-0'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Motorcycle</CardTitle>
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
                    className={errors.modelName ? "border-red-500" : ""}
                  />
                  {errors.modelName && (
                    <p className='text-red-500 text-sm'>
                      {errors.modelName.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='category'>Category</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("category", value as any)
                    }
                  >
                    <SelectTrigger
                      className={errors.category ? "border-red-500" : ""}
                    >
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
                    <p className='text-red-500 text-sm'>
                      {errors.category.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='year'>Year</Label>
                  <Input
                    id='year'
                    type='number'
                    {...register("year", { valueAsNumber: true })}
                    className={errors.year ? "border-red-500" : ""}
                  />
                  {errors.year && (
                    <p className='text-red-500 text-sm'>
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
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className='text-red-500 text-sm'>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='power'>Power (HP)</Label>
                  <Input
                    id='power'
                    type='number'
                    {...register("power", { valueAsNumber: true })}
                    className={errors.power ? "border-red-500" : ""}
                  />
                  {errors.power && (
                    <p className='text-red-500 text-sm'>
                      {errors.power.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='engine'>Engine</Label>
                  <Input
                    id='engine'
                    {...register("engine")}
                    placeholder='e.g., 150cc Single Cylinder'
                    className={errors.engine ? "border-red-500" : ""}
                  />
                  {errors.engine && (
                    <p className='text-red-500 text-sm'>
                      {errors.engine.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='transmission'>Transmission</Label>
                  <Input
                    id='transmission'
                    {...register("transmission")}
                    placeholder='e.g., 5-Speed Manual'
                    className={errors.transmission ? "border-red-500" : ""}
                  />
                  {errors.transmission && (
                    <p className='text-red-500 text-sm'>
                      {errors.transmission.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className='space-y-2'>
                <Label>Features</Label>
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
                <div className='flex flex-wrap gap-2 mt-2'>
                  {watchedFeatures.map((feature, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                    >
                      <span className='text-sm'>{feature}</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeFeature(index)}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className='space-y-2'>
                <Label>Available Colors</Label>
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
                <div className='flex flex-wrap gap-2 mt-2'>
                  {watchedColors.map((color, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-1 bg-gray-100 px-2 py-1 rounded'
                    >
                      <span className='text-sm'>{color}</span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => removeColor(index)}
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='quantity'>Quantity</Label>
                  <Input
                    id='quantity'
                    type='number'
                    {...register("quantity", { valueAsNumber: true })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='branch'>Branch</Label>
                  <Select onValueChange={(value) => setValue("branch", value)}>
                    <SelectTrigger
                      className={errors.branch ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder='Select branch' />
                    </SelectTrigger>
                    <SelectContent>
                      {branchesData?.data.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.branch && (
                    <p className='text-red-500 text-sm'>
                      {errors.branch.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Checkbox id='inStock' {...register("inStock")} />
                <Label htmlFor='inStock'>In Stock</Label>
              </div>

              <div className='flex justify-end space-x-2'>
                <Link to='/admin/dashboard'>
                  <Button variant='outline'>Cancel</Button>
                </Link>
                <Button type='submit' disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Motorcycle"}
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
