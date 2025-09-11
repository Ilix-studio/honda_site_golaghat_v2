import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

// Form data interface
interface BikeFormData {
  modelName: string;
  category:
    | "sport"
    | "adventure"
    | "cruiser"
    | "touring"
    | "naked"
    | "electric";
  year: number;
  price: number;
  engineSize: string;
  power: number;
  transmission: string;
  features?: string[];
  colors?: string[];
  images?: string[];
  inStock?: boolean;
  quantity?: number;
  branch: string;
}

interface ImageFile {
  file: File;
  preview: string;
}

// Form validation function
const validateForm = (data: BikeFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!data.modelName?.trim()) {
    errors.modelName = "Model name is required";
  }

  if (!data.category) {
    errors.category = "Category is required";
  }

  if (
    !data.year ||
    data.year < 2000 ||
    data.year > new Date().getFullYear() + 1
  ) {
    errors.year = `Year must be between 2000 and ${
      new Date().getFullYear() + 1
    }`;
  }

  if (!data.price || data.price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (!data.engineSize?.trim()) {
    errors.engineSize = "Engine details are required";
  }

  if (!data.power || data.power <= 0) {
    errors.power = "Power is required";
  }

  if (!data.transmission?.trim()) {
    errors.transmission = "Transmission details are required";
  }

  if (!data.branch?.trim()) {
    errors.branch = "Branch is required";
  }

  if (data.quantity !== undefined && data.quantity < 0) {
    errors.quantity = "Quantity cannot be negative";
  }

  return errors;
};

const AddBikes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: branchesData } = useGetBranchesQuery();
  const [createBike, { isLoading }] = useCreateBikeMutation();

  const form = useForm<BikeFormData>({
    defaultValues: {
      features: [],
      colors: [],
      images: [],
      inStock: true,
      quantity: 0,
    },
  });

  const { register, handleSubmit, watch, setValue } = form;

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
    // Clear previous errors
    setFormErrors({});

    // Validate form
    const errors = validateForm(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
                    className={formErrors.modelName ? "border-red-500" : ""}
                  />
                  {formErrors.modelName && (
                    <p className='text-red-500 text-sm'>
                      {formErrors.modelName}
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
                      className={formErrors.category ? "border-red-500" : ""}
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
                  {formErrors.category && (
                    <p className='text-red-500 text-sm'>
                      {formErrors.category}
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
                    className={formErrors.year ? "border-red-500" : ""}
                  />
                  {formErrors.year && (
                    <p className='text-red-500 text-sm'>{formErrors.year}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='price'>Price (₹)</Label>
                  <Input
                    id='price'
                    type='number'
                    {...register("price", { valueAsNumber: true })}
                    className={formErrors.price ? "border-red-500" : ""}
                  />
                  {formErrors.price && (
                    <p className='text-red-500 text-sm'>{formErrors.price}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='power'>Power (HP)</Label>
                  <Input
                    id='power'
                    type='number'
                    {...register("power", { valueAsNumber: true })}
                    className={formErrors.power ? "border-red-500" : ""}
                  />
                  {formErrors.power && (
                    <p className='text-red-500 text-sm'>{formErrors.power}</p>
                  )}
                </div>
              </div>

              {/* Technical Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='engine'>Engine</Label>
                  <Input
                    id='engine'
                    {...register("engineSize")}
                    placeholder='e.g., 150cc Single Cylinder'
                    className={formErrors.engine ? "border-red-500" : ""}
                  />
                  {formErrors.engine && (
                    <p className='text-red-500 text-sm'>{formErrors.engine}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='transmission'>Transmission</Label>
                  <Input
                    id='transmission'
                    {...register("transmission")}
                    placeholder='e.g., 5-Speed Manual'
                    className={formErrors.transmission ? "border-red-500" : ""}
                  />
                  {formErrors.transmission && (
                    <p className='text-red-500 text-sm'>
                      {formErrors.transmission}
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
                    className={formErrors.quantity ? "border-red-500" : ""}
                  />
                  {formErrors.quantity && (
                    <p className='text-red-500 text-sm'>
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='branch'>Branch</Label>
                  <Select onValueChange={(value) => setValue("branch", value)}>
                    <SelectTrigger
                      className={formErrors.branch ? "border-red-500" : ""}
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
                  {formErrors.branch && (
                    <p className='text-red-500 text-sm'>{formErrors.branch}</p>
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
