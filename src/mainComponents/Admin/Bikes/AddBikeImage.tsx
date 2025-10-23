import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Upload,
  Camera,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  StarOff,
  Image as ImageIcon,
} from "lucide-react";

// Redux
import { useAppDispatch } from "../../../hooks/redux";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import { useGetBikeByIdQuery } from "../../../redux-store/services/BikeSystemApi/bikeApi";
import {
  useUploadBikeImagesMutation,
  useUploadSingleBikeImageMutation,
  useGetBikeImagesQuery,
  useSetPrimaryImageMutation,
  useDeleteBikeImageMutation,
  createImageUploadFormData,
  createSingleImageUploadFormData,
} from "../../../redux-store/services/BikeSystemApi/bikeImageApi";

interface ImageFile {
  file: File;
  preview: string;
  alt: string;
  id: string;
}

interface UploadStatus {
  id: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

const AddBikeImage = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // State management
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"multiple" | "single">(
    "multiple"
  );

  // API hooks
  const {
    data: bikeResponse,
    isLoading: bikeLoading,
    isError: bikeError,
  } = useGetBikeByIdQuery(bikeId ?? skipToken);

  const {
    data: existingImagesResponse,
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useGetBikeImagesQuery(bikeId ?? skipToken);

  const [uploadBikeImages] = useUploadBikeImagesMutation();
  const [uploadSingleBikeImage] = useUploadSingleBikeImageMutation();
  const [setPrimaryImage] = useSetPrimaryImageMutation();
  const [deleteImage] = useDeleteBikeImageMutation();

  const bike = bikeResponse?.data;
  const existingImages = existingImagesResponse?.data?.images || [];

  // Validate image file
  const validateImageFile = (file: File): string | null => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Only JPEG, PNG, and WebP are allowed.";
    }

    if (file.size > 10 * 1024 * 1024) {
      return "File size too large. Maximum size is 10MB.";
    }

    return null;
  };

  // Handle file selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const error = validateImageFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) => {
        dispatch(
          addNotification({
            type: "error",
            message: error,
          })
        );
      });
    }

    if (validFiles.length > 0) {
      const newImageFiles: ImageFile[] = [];
      let processedCount = 0;

      validFiles.forEach((file) => {
        const reader = new FileReader();
        const imageId = `temp_${Date.now()}_${Math.random()}`;

        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result && typeof e.target.result === "string") {
            newImageFiles.push({
              file,
              preview: e.target.result,
              alt: `${bike?.modelName || "Vehicle"} - Image ${
                selectedImages.length +
                existingImages.length +
                newImageFiles.length +
                1
              }`,
              id: imageId,
            });
          }

          processedCount++;
          if (processedCount === validFiles.length) {
            setSelectedImages((prev) => [...prev, ...newImageFiles]);

            // Initialize upload statuses
            const newStatuses = newImageFiles.map((img) => ({
              id: img.id,
              status: "pending" as const,
              progress: 0,
            }));
            setUploadStatuses((prev) => [...prev, ...newStatuses]);
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

    event.target.value = "";
  };

  // Remove image from selection
  const removeImage = (imageId: string) => {
    setSelectedImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId);
      if (imageToRemove?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter((img) => img.id !== imageId);
    });

    setUploadStatuses((prev) => prev.filter((status) => status.id !== imageId));
  };

  // Update image alt text
  const updateImageAlt = (imageId: string, alt: string) => {
    setSelectedImages((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, alt } : img))
    );
  };

  // Upload single image
  const uploadSingleImage = async (imageFile: ImageFile) => {
    if (!bikeId) return;

    try {
      setUploadStatuses((prev) =>
        prev.map((status) =>
          status.id === imageFile.id
            ? { ...status, status: "uploading", progress: 50 }
            : status
        )
      );

      const formData = createSingleImageUploadFormData(
        imageFile.file,
        imageFile.alt
      );

      await uploadSingleBikeImage({
        bikeId,
        formData,
      }).unwrap();

      setUploadStatuses((prev) =>
        prev.map((status) =>
          status.id === imageFile.id
            ? { ...status, status: "completed", progress: 100 }
            : status
        )
      );

      // Remove from selection after successful upload
      setTimeout(() => {
        removeImage(imageFile.id);
      }, 1000);

      refetchImages();
    } catch (error: any) {
      setUploadStatuses((prev) =>
        prev.map((status) =>
          status.id === imageFile.id
            ? {
                ...status,
                status: "error",
                progress: 0,
                error: error?.data?.error || "Upload failed",
              }
            : status
        )
      );
    }
  };

  // Upload multiple images
  const uploadMultipleImages = async () => {
    if (!bikeId || selectedImages.length === 0) return;

    setIsUploading(true);

    try {
      const files = selectedImages.map((img) => img.file);
      const altTexts = selectedImages.map((img) => img.alt);

      // Update all statuses to uploading
      setUploadStatuses((prev) =>
        prev.map((status) => ({ ...status, status: "uploading", progress: 50 }))
      );

      const formData = createImageUploadFormData(files, altTexts);

      await uploadBikeImages({
        bikeId,
        formData,
      }).unwrap();

      // Update all statuses to completed
      setUploadStatuses((prev) =>
        prev.map((status) => ({
          ...status,
          status: "completed",
          progress: 100,
        }))
      );

      dispatch(
        addNotification({
          type: "success",
          message: `${selectedImages.length} image(s) uploaded successfully!`,
        })
      );

      // Clear selections after successful upload
      setTimeout(() => {
        setSelectedImages([]);
        setUploadStatuses([]);
      }, 1500);

      refetchImages();
    } catch (error: any) {
      setUploadStatuses((prev) =>
        prev.map((status) => ({
          ...status,
          status: "error",
          progress: 0,
          error: error?.data?.error || "Upload failed",
        }))
      );

      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to upload images",
        })
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Set primary image
  const handleSetPrimaryImage = async (imageId: string) => {
    if (!bikeId) return;

    try {
      await setPrimaryImage({ bikeId, imageId }).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Primary image updated successfully!",
        })
      );
      refetchImages();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to set primary image",
        })
      );
    }
  };

  // Delete existing image
  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Image deleted successfully!",
        })
      );
      refetchImages();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to delete image",
        })
      );
    }
  };

  // Continue to next step
  const handleContinue = () => {
    navigate("/admin/dashboard");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      selectedImages.forEach((imageFile) => {
        if (imageFile.preview.startsWith("blob:")) {
          URL.revokeObjectURL(imageFile.preview);
        }
      });
    };
  }, [selectedImages]);

  // Handle case when no bike ID is provided
  if (!bikeId) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Invalid Bike ID</h2>
            <p className='text-muted-foreground mb-4'>
              No bike ID was provided in the URL.
            </p>
            <Link to='/admin/dashboard'>
              <Button>
                <ArrowLeft className='h-4 w-4 mr-2' />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (bikeLoading || imagesLoading) {
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

  // Error state
  if (bikeError || !bike) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Vehicle Not Found</h2>
            <p className='text-muted-foreground mb-4'>
              The vehicle you're trying to add images for doesn't exist.
            </p>
            <div className='flex gap-2 justify-center'>
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
          </CardContent>
        </Card>
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
              <h1 className='text-2xl font-semibold'>Add Images</h1>
              <p className='text-muted-foreground'>
                Upload images for {bike.modelName} ({bike.year})
              </p>
            </div>
          </div>
          {existingImages.length > 0 && (
            <Button
              onClick={handleContinue}
              className='bg-green-600 hover:bg-green-700'
            >
              Complete & Continue
            </Button>
          )}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Upload New Images</CardTitle>
                <div className='flex gap-2'>
                  <Button
                    variant={uploadMode === "multiple" ? "default" : "outline"}
                    size='sm'
                    onClick={() => setUploadMode("multiple")}
                  >
                    Multiple
                  </Button>
                  <Button
                    variant={uploadMode === "single" ? "default" : "outline"}
                    size='sm'
                    onClick={() => setUploadMode("single")}
                  >
                    Single
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Upload Area */}
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
                <div className='text-center'>
                  <Camera className='mx-auto h-12 w-12 text-gray-400' />
                  <div className='mt-4'>
                    <span className='mt-2 block text-sm font-medium text-gray-900'>
                      Upload vehicle images
                    </span>
                    <span className='mt-2 block text-sm text-gray-500'>
                      PNG, JPG, WebP up to 10MB each
                    </span>
                    <Input
                      id='imageUpload'
                      type='file'
                      multiple={uploadMode === "multiple"}
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='mt-3'
                      onClick={() =>
                        document.getElementById("imageUpload")?.click()
                      }
                      disabled={isUploading}
                    >
                      <Upload className='h-4 w-4 mr-2' />
                      Choose Images
                    </Button>
                  </div>
                </div>
              </div>

              {/* Selected Images */}
              {selectedImages.length > 0 && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <Label>Selected Images ({selectedImages.length})</Label>
                    {uploadMode === "multiple" && (
                      <Button
                        onClick={uploadMultipleImages}
                        disabled={isUploading}
                        className='bg-blue-600 hover:bg-blue-700'
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                            Uploading...
                          </>
                        ) : (
                          `Upload All (${selectedImages.length})`
                        )}
                      </Button>
                    )}
                  </div>

                  <div className='grid grid-cols-1 gap-4'>
                    {selectedImages.map((imageFile) => {
                      const status = uploadStatuses.find(
                        (s) => s.id === imageFile.id
                      );
                      return (
                        <div
                          key={imageFile.id}
                          className='border rounded-lg p-3'
                        >
                          <div className='flex gap-3'>
                            <img
                              src={imageFile.preview}
                              alt={imageFile.alt}
                              className='w-20 h-20 object-cover rounded-lg flex-shrink-0'
                            />
                            <div className='flex-1 space-y-2'>
                              <Input
                                placeholder='Image description'
                                value={imageFile.alt}
                                onChange={(e) =>
                                  updateImageAlt(imageFile.id, e.target.value)
                                }
                                className='text-sm'
                                disabled={status?.status === "uploading"}
                              />

                              {status && (
                                <div className='space-y-1'>
                                  {status.status === "uploading" && (
                                    <Progress
                                      value={status.progress}
                                      className='w-full'
                                    />
                                  )}

                                  <div className='flex items-center justify-between text-sm'>
                                    <div className='flex items-center gap-2'>
                                      {status.status === "pending" && (
                                        <div className='w-2 h-2 bg-gray-400 rounded-full' />
                                      )}
                                      {status.status === "uploading" && (
                                        <Loader2 className='w-4 h-4 animate-spin text-blue-500' />
                                      )}
                                      {status.status === "completed" && (
                                        <CheckCircle className='w-4 h-4 text-green-500' />
                                      )}
                                      {status.status === "error" && (
                                        <AlertCircle className='w-4 h-4 text-red-500' />
                                      )}
                                      <span className='capitalize text-muted-foreground'>
                                        {status.status}
                                      </span>
                                    </div>

                                    <div className='flex gap-1'>
                                      {uploadMode === "single" &&
                                        status.status === "pending" && (
                                          <Button
                                            size='sm'
                                            variant='outline'
                                            onClick={() =>
                                              uploadSingleImage(imageFile)
                                            }
                                          >
                                            Upload
                                          </Button>
                                        )}
                                      <Button
                                        size='sm'
                                        variant='ghost'
                                        onClick={() =>
                                          removeImage(imageFile.id)
                                        }
                                        disabled={status.status === "uploading"}
                                      >
                                        <X className='h-3 w-3' />
                                      </Button>
                                    </div>
                                  </div>

                                  {status.error && (
                                    <p className='text-red-500 text-xs'>
                                      {status.error}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Images */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <ImageIcon className='h-5 w-5' />
                Existing Images ({existingImages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingImages.length === 0 ? (
                <div className='text-center py-8'>
                  <ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-muted-foreground'>
                    No images uploaded yet. Add some images to get started.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4'>
                  {existingImages.map((image) => (
                    <div key={image._id} className='border rounded-lg p-3'>
                      <div className='flex gap-3'>
                        <img
                          src={image.src}
                          alt={image.alt}
                          className='w-20 h-20 object-cover rounded-lg flex-shrink-0'
                        />
                        <div className='flex-1 space-y-2'>
                          <div className='flex items-center gap-2'>
                            <p className='text-sm font-medium truncate'>
                              {image.alt}
                            </p>
                            {image.isPrimary && (
                              <div className='flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
                                <Star className='w-3 h-3 fill-current' />
                                Primary
                              </div>
                            )}
                          </div>

                          <div className='flex gap-2'>
                            {!image.isPrimary && (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => handleSetPrimaryImage(image._id)}
                              >
                                <StarOff className='h-3 w-3 mr-1' />
                                Set Primary
                              </Button>
                            )}
                            <Button
                              size='sm'
                              variant='destructive'
                              onClick={() => handleDeleteImage(image._id)}
                            >
                              <X className='h-3 w-3 mr-1' />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-between items-center mt-8 pt-6 border-t'>
          <Link to={`/admin/bikes/add`}>
            <Button variant='outline'>Add Another Vehicle</Button>
          </Link>

          <div className='flex gap-3'>
            {existingImages.length === 0 && selectedImages.length === 0 && (
              <p className='text-sm text-muted-foreground flex items-center'>
                <AlertCircle className='h-4 w-4 mr-2' />
                Please upload at least one image before continuing
              </p>
            )}
            <Button
              onClick={handleContinue}
              disabled={
                existingImages.length === 0 && selectedImages.length === 0
              }
              className='bg-green-600 hover:bg-green-700'
            >
              Complete & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBikeImage;
