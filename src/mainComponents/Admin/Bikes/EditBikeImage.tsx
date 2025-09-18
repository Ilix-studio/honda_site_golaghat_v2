import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Upload,
  Camera,
  Star,
  StarOff,
  Edit,
  Trash2,
  Plus,
  Save,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Eye,
  CheckCircle,
} from "lucide-react";

// Redux
import { useAppDispatch } from "../../../hooks/redux";
import { addNotification } from "../../../redux-store/slices/uiSlice";
import { useGetBikeByIdQuery } from "../../../redux-store/services/BikeSystemApi/bikeApi";
import {
  useGetBikeImagesQuery,
  useUploadSingleBikeImageMutation,
  useUpdateBikeImageMutation,
  useDeleteBikeImageMutation,
  useSetPrimaryImageMutation,
  createSingleImageUploadFormData,
} from "../../../redux-store/services/BikeSystemApi/bikeImageApi";
import { BikeImage } from "../../../redux-store/slices/BikeSystemSlice/bikeImageSlice";

interface EditImageData {
  imageId: string;
  alt: string;
  isPrimary: boolean;
}

const EditBikeImage = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const dispatch = useAppDispatch();

  // State management
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [newImageAlt, setNewImageAlt] = useState("");
  const [editingImage, setEditingImage] = useState<EditImageData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  // API hooks
  const {
    data: bikeResponse,
    isLoading: bikeLoading,
    isError: bikeError,
  } = useGetBikeByIdQuery(bikeId ?? skipToken);

  const {
    data: imagesResponse,
    isLoading: imagesLoading,
    refetch: refetchImages,
  } = useGetBikeImagesQuery(bikeId ?? skipToken);

  const [uploadSingleImage, { isLoading: uploadLoading }] =
    useUploadSingleBikeImageMutation();
  const [updateImage, { isLoading: updateLoading }] =
    useUpdateBikeImageMutation();
  const [deleteImage, { isLoading: deleteLoading }] =
    useDeleteBikeImageMutation();
  const [setPrimaryImage, { isLoading: primaryLoading }] =
    useSetPrimaryImageMutation();

  const bike = bikeResponse?.data;
  const images = imagesResponse?.data?.images || [];

  // Handle new image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      dispatch(
        addNotification({
          type: "error",
          message: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        })
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      dispatch(
        addNotification({
          type: "error",
          message: "File size too large. Maximum size is 10MB.",
        })
      );
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setPreviewUrl(e.target.result);
        setNewImageAlt(
          `${bike?.modelName || "Vehicle"} - Image ${images.length + 1}`
        );
      }
    };
    reader.readAsDataURL(file);

    event.target.value = "";
  };

  // Upload new image
  const handleUploadImage = async () => {
    if (!selectedImage || !bikeId) return;

    try {
      const formData = createSingleImageUploadFormData(
        selectedImage,
        newImageAlt
      );

      await uploadSingleImage({
        bikeId,
        formData,
      }).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Image uploaded successfully!",
        })
      );

      // Clear form
      setSelectedImage(null);
      setPreviewUrl("");
      setNewImageAlt("");

      refetchImages();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to upload image",
        })
      );
    }
  };

  // Start editing image
  const startEditingImage = (image: BikeImage) => {
    setEditingImage({
      imageId: image._id,
      alt: image.alt,
      isPrimary: image.isPrimary,
    });
  };

  // Save image changes
  const handleSaveImageChanges = async () => {
    if (!editingImage) return;

    try {
      await updateImage({
        imageId: editingImage.imageId,
        data: {
          alt: editingImage.alt,
          isPrimary: editingImage.isPrimary,
        },
      }).unwrap();

      dispatch(
        addNotification({
          type: "success",
          message: "Image updated successfully!",
        })
      );

      setEditingImage(null);
      refetchImages();
    } catch (error: any) {
      dispatch(
        addNotification({
          type: "error",
          message: error?.data?.error || "Failed to update image",
        })
      );
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

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId).unwrap();
      dispatch(
        addNotification({
          type: "success",
          message: "Image deleted successfully!",
        })
      );
      setDeleteConfirmId(null);
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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle case when no bike ID is provided
  if (!bikeId) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <Card className='w-full max-w-md'>
          <CardContent className='p-6 text-center'>
            <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
            <h2 className='text-xl font-semibold mb-2'>Invalid Vehicle ID</h2>
            <p className='text-muted-foreground mb-4'>
              No vehicle ID was provided in the URL.
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
              The vehicle you're trying to edit images for doesn't exist.
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
              <h1 className='text-2xl font-semibold'>Manage Images</h1>
              <p className='text-muted-foreground'>
                Edit images for {bike.modelName} ({bike.year})
              </p>
            </div>
          </div>

          {/* Edit Vehicle Button */}
          <Link to={`/admin/addbikes/edit/${bike._id}`}>
            <Button variant='outline'>
              <Edit className='h-4 w-4 mr-2' />
              Edit Vehicle
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Add New Image */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Plus className='h-5 w-5' />
                Add New Image
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Upload Area */}
              <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
                <div className='text-center'>
                  <Camera className='mx-auto h-12 w-12 text-gray-400' />
                  <div className='mt-4'>
                    <span className='mt-2 block text-sm font-medium text-gray-900'>
                      Upload new image
                    </span>
                    <span className='mt-2 block text-sm text-gray-500'>
                      PNG, JPG, WebP up to 10MB
                    </span>
                    <Input
                      id='newImageUpload'
                      type='file'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      className='mt-3'
                      onClick={() =>
                        document.getElementById("newImageUpload")?.click()
                      }
                      disabled={uploadLoading}
                    >
                      <Upload className='h-4 w-4 mr-2' />
                      Choose Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview and Upload */}
              {selectedImage && previewUrl && (
                <div className='space-y-4'>
                  <div className='border rounded-lg p-4'>
                    <img
                      src={previewUrl}
                      alt='Preview'
                      className='w-full h-48 object-cover rounded-lg mb-4'
                    />
                    <div className='space-y-3'>
                      <div>
                        <Label htmlFor='newImageAlt'>Image Description</Label>
                        <Textarea
                          id='newImageAlt'
                          value={newImageAlt}
                          onChange={(e) => setNewImageAlt(e.target.value)}
                          placeholder='Describe this image...'
                          className='mt-1'
                        />
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          onClick={handleUploadImage}
                          disabled={!newImageAlt.trim() || uploadLoading}
                          className='flex-1'
                        >
                          {uploadLoading ? (
                            <>
                              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className='h-4 w-4 mr-2' />
                              Upload Image
                            </>
                          )}
                        </Button>
                        <Button
                          variant='outline'
                          onClick={() => {
                            setSelectedImage(null);
                            setPreviewUrl("");
                            setNewImageAlt("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
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
                Existing Images ({images.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className='text-center py-8'>
                  <ImageIcon className='mx-auto h-12 w-12 text-gray-400' />
                  <p className='mt-2 text-muted-foreground'>
                    No images found. Add some images to get started.
                  </p>
                </div>
              ) : (
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {images.map((image) => (
                    <div key={image._id} className='border rounded-lg p-4'>
                      <div className='flex gap-4'>
                        <img
                          src={image.src}
                          alt={image.alt}
                          className='w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer'
                          onClick={() => setViewImageUrl(image.src)}
                        />
                        <div className='flex-1 space-y-2'>
                          {editingImage?.imageId === image._id ? (
                            // Edit mode
                            <div className='space-y-3'>
                              <Textarea
                                value={editingImage.alt}
                                onChange={(e) =>
                                  setEditingImage((prev) =>
                                    prev
                                      ? { ...prev, alt: e.target.value }
                                      : null
                                  )
                                }
                                className='text-sm'
                                rows={2}
                              />
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  onClick={handleSaveImageChanges}
                                  disabled={updateLoading}
                                >
                                  {updateLoading ? (
                                    <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                  ) : (
                                    <Save className='h-3 w-3 mr-1' />
                                  )}
                                  Save
                                </Button>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => setEditingImage(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div className='space-y-2'>
                              <div className='flex items-center gap-2'>
                                <p className='text-sm font-medium truncate flex-1'>
                                  {image.alt}
                                </p>
                                {image.isPrimary && (
                                  <div className='flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
                                    <Star className='w-3 h-3 fill-current' />
                                    Primary
                                  </div>
                                )}
                              </div>

                              <div className='flex flex-wrap gap-1'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => setViewImageUrl(image.src)}
                                >
                                  <Eye className='h-3 w-3 mr-1' />
                                  View
                                </Button>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => startEditingImage(image)}
                                >
                                  <Edit className='h-3 w-3 mr-1' />
                                  Edit
                                </Button>
                                {!image.isPrimary && (
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                      handleSetPrimaryImage(image._id)
                                    }
                                    disabled={primaryLoading}
                                  >
                                    <StarOff className='h-3 w-3 mr-1' />
                                    Set Primary
                                  </Button>
                                )}
                                <Button
                                  size='sm'
                                  variant='destructive'
                                  onClick={() => setDeleteConfirmId(image._id)}
                                >
                                  <Trash2 className='h-3 w-3 mr-1' />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        {images.length > 0 && (
          <Card className='mt-6'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-500' />
                    <span className='font-medium'>Images Status</span>
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Total: {images.length} | Primary:{" "}
                    {images.filter((img) => img.isPrimary).length}
                  </div>
                </div>
                <Link to='/admin/dashboard'>
                  <Button className='bg-green-600 hover:bg-green-700'>
                    Complete & Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {viewImageUrl && (
            <img
              src={viewImageUrl}
              alt='Full size preview'
              className='w-full h-auto max-h-[70vh] object-contain rounded-lg'
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
              {images.find((img) => img._id === deleteConfirmId)?.isPrimary &&
                " This is currently the primary image."}
            </DialogDescription>
          </DialogHeader>
          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={() =>
                deleteConfirmId && handleDeleteImage(deleteConfirmId)
              }
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4 mr-2' />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditBikeImage;
