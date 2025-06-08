import { useEffect, useState } from "react";
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
import { ArrowLeft, Plus, X, Upload, Camera } from "lucide-react";
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

interface ImageFile {
  file: File;
  preview: string;
}

const AddBikes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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

  // Handle image selection with proper error handling
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate each file
    fileArray.forEach((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        dispatch(
          addNotification({
            type: "error",
            message: `${file.name} is not a valid image file`,
          })
        );
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        dispatch(
          addNotification({
            type: "error",
            message: `${file.name} is too large. Maximum size is 5MB`,
          })
        );
        return;
      }

      validFiles.push(file);
    });

    // Process valid files
    if (validFiles.length > 0) {
      const newImageFiles: ImageFile[] = [];
      let processedCount = 0;

      validFiles.forEach((file) => {
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
          // Fixed: Proper null checking for e.target
          if (
            e.target &&
            e.target.result &&
            typeof e.target.result === "string"
          ) {
            newImageFiles.push({
              file,
              preview: e.target.result,
            });
          }

          processedCount++;

          // Update state when all files are processed
          if (processedCount === validFiles.length) {
            setSelectedImages((prev) => [...prev, ...newImageFiles]);
          }
        };

        reader.onerror = () => {
          dispatch(
            addNotification({
              type: "error",
              message: `Failed to read ${file.name}`,
            })
          );
          processedCount++;
        };

        reader.readAsDataURL(file);
      });
    }

    // Reset the input
    event.target.value = "";
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // Revoke the object URL to prevent memory leaks
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      return newImages;
    });
  };

  // Upload images to your service (mock implementation)
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const imageFile of selectedImages) {
        // This is a mock upload - replace with your actual upload logic
        const formData = new FormData();
        formData.append("file", imageFile.file);
        formData.append("upload_preset", "your_upload_preset"); // For Cloudinary

        // Mock response - replace with actual upload
        // For now, we'll use the preview URL (in production, upload to your service)
        uploadedUrls.push(imageFile.preview);

        // Actual Cloudinary upload would look like:
        /*
        const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload ${imageFile.file.name}`);
        }
        
        const data = await response.json();
        uploadedUrls.push(data.secure_url);
        */
      }

      return uploadedUrls;
    } catch (error) {
      console.error("Error uploading images:", error);
      dispatch(
        addNotification({
          type: "error",
          message: "Failed to upload images",
        })
      );
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const onSubmit = async (data: BikeFormData) => {
    try {
      // Upload images first
      const imageUrls = await uploadImages();

      // Add image URLs to form data
      const finalData = {
        ...data,
        images: imageUrls,
      };

      await createBike(finalData).unwrap();

      // Clean up preview URLs
      selectedImages.forEach((imageFile) => {
        if (imageFile.preview.startsWith("blob:")) {
          URL.revokeObjectURL(imageFile.preview);
        }
      });

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

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((imageFile) => {
        if (imageFile.preview.startsWith("blob:")) {
          URL.revokeObjectURL(imageFile.preview);
        }
      });
    };
  }, [selectedImages]);

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

              {/* Image Upload Section */}
              <div className='space-y-4'>
                <Label htmlFor='picture'>Motorcycle Images</Label>
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
                  <div className='text-center'>
                    <Camera className='mx-auto h-12 w-12 text-gray-400' />
                    <div className='mt-4'>
                      <div className='cursor-pointer'>
                        <span className='mt-2 block text-sm font-medium text-gray-900'>
                          Upload motorcycle images
                        </span>
                        <span className='mt-2 block text-sm text-gray-500'>
                          PNG, JPG, GIF up to 5MB each
                        </span>
                      </div>
                      <Input
                        id='picture'
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleImageChange}
                        className='hidden'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        className='mt-3'
                        onClick={() =>
                          document.getElementById("picture")?.click()
                        }
                      >
                        <Upload className='h-4 w-4 mr-2' />
                        Choose Images
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className='space-y-2'>
                    <Label>Selected Images ({selectedImages.length})</Label>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {selectedImages.map((imageFile, index) => (
                        <div key={index} className='relative group'>
                          <img
                            src={imageFile.preview}
                            alt={`Preview ${index + 1}`}
                            className='w-full h-24 object-cover rounded-lg border'
                          />
                          <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            className='absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={() => removeImage(index)}
                          >
                            <X className='h-3 w-3' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                <Button
                  type='submit'
                  disabled={isLoading || uploadingImages}
                  className='bg-red-600 hover:bg-red-700'
                >
                  {isLoading
                    ? "Adding..."
                    : uploadingImages
                    ? "Uploading Images..."
                    : "Add Motorcycle"}
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
