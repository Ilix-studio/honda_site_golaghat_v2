import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Star,
  Trash2,
  Edit,
  Eye,
  Grid,
  List,
  MoreVertical,
  X,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Redux
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";

import {
  setViewMode,
  toggleImageSelection,
  clearSelection,
  setShowImageViewer,
  setCurrentImageIndex,
  selectImageViewMode,
  selectSelectedImages,
} from "../../../redux-store/slices/BikeSystemSlice/bikeImageSlice";

// Types
import { BikeImage } from "../../../redux-store/slices/BikeSystemSlice/bikeImageSlice";
import toast from "react-hot-toast";
import {
  createImageUploadFormData,
  useDeleteBikeImageMutation,
  useGetBikeImagesQuery,
  useSetPrimaryImageMutation,
  useUpdateBikeImageMutation,
  useUploadBikeImagesMutation,
} from "@/redux-store/services/BikeSystemApi/bikeImageApi";
import { useGetBikeByIdQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

interface UploadModalProps {
  bikeId: string;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadModal = ({
  bikeId,
  onClose,
  onUploadSuccess,
}: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [uploadImages, { isLoading: uploading }] =
    useUploadBikeImagesMutation();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles((prev) => [...prev, ...droppedFiles]);
    setAltTexts((prev) => [...prev, ...droppedFiles.map(() => "")]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      setAltTexts((prev) => [...prev, ...selectedFiles.map(() => "")]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setAltTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const updateAltText = (index: number, value: string) => {
    setAltTexts((prev) => prev.map((text, i) => (i === index ? value : text)));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      const formData = createImageUploadFormData(files, altTexts);
      await uploadImages({ bikeId, formData }).unwrap();

      toast.success(`Successfully uploaded ${files.length} image(s)`);
      onUploadSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to upload images");
    }
  };

  return (
    <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
      <DialogHeader>
        <DialogTitle>Upload Images</DialogTitle>
      </DialogHeader>

      <div className='space-y-4'>
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-lg font-medium mb-2'>
            Drop images here or click to select
          </p>
          <p className='text-sm text-gray-500 mb-4'>
            Supports: JPG, PNG, WebP (Max 10 images)
          </p>
          <input
            type='file'
            multiple
            accept='image/*'
            onChange={handleFileSelect}
            className='hidden'
            id='file-input'
          />
          <Button asChild variant='outline'>
            <label htmlFor='file-input' className='cursor-pointer'>
              Select Images
            </label>
          </Button>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className='space-y-4'>
            <h3 className='font-medium'>Selected Images ({files.length})</h3>
            <div className='space-y-3 max-h-60 overflow-y-auto'>
              {files.map((file, index) => (
                <div
                  key={index}
                  className='flex items-start gap-3 p-3 border rounded'
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className='w-16 h-16 object-cover rounded'
                  />
                  <div className='flex-1 space-y-2'>
                    <p className='text-sm font-medium'>{file.name}</p>
                    <Input
                      placeholder='Alt text (optional)'
                      value={altTexts[index] || ""}
                      onChange={(e) => updateAltText(index, e.target.value)}
                    />
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => removeFile(index)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? "Uploading..." : `Upload ${files.length} Image(s)`}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

interface ImageViewerProps {
  images: BikeImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSetPrimary: (imageId: string) => void;
  onDelete: (imageId: string) => void;
}

const ImageViewer = ({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onSetPrimary,
  onDelete,
}: ImageViewerProps) => {
  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center'>
      <div className='relative max-w-screen-lg max-h-screen p-4'>
        {/* Close Button */}
        <Button
          variant='ghost'
          size='sm'
          onClick={onClose}
          className='absolute top-2 right-2 z-10 text-white hover:bg-white/20'
        >
          <X className='h-6 w-6' />
        </Button>

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <Button
              variant='ghost'
              size='sm'
              onClick={onPrevious}
              className='absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20'
            >
              ←
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={onNext}
              className='absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20'
            >
              →
            </Button>
          </>
        )}

        {/* Image */}
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className='max-w-full max-h-full object-contain'
        />

        {/* Image Info */}
        <div className='absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='font-medium'>{currentImage.alt || "No alt text"}</p>
              <p className='text-sm opacity-75'>
                {currentIndex + 1} of {images.length}
                {currentImage.isPrimary && " • Primary Image"}
              </p>
            </div>
            <div className='flex gap-2'>
              {!currentImage.isPrimary && (
                <Button
                  size='sm'
                  onClick={() => onSetPrimary(currentImage._id)}
                  className='bg-yellow-600 hover:bg-yellow-700'
                >
                  <Star className='h-4 w-4' />
                </Button>
              )}
              <Button
                size='sm'
                variant='destructive'
                onClick={() => onDelete(currentImage._id)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function ViewBikeImage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingImage, setEditingImage] = useState<BikeImage | null>(null);
  const [editAltText, setEditAltText] = useState("");

  // Redux selectors
  const viewMode = useAppSelector(selectImageViewMode);
  const selectedImages = useAppSelector(selectSelectedImages);
  const showImageViewer = useAppSelector(
    (state) => state.bikeImages.showImageViewer
  );
  const currentImageIndex = useAppSelector(
    (state) => state.bikeImages.currentImageIndex
  );

  // API calls
  const { data: bikeData, isLoading: bikeLoading } = useGetBikeByIdQuery(id!);
  const {
    data: imagesData,
    isLoading: imagesLoading,
    refetch,
  } = useGetBikeImagesQuery(id!);
  const [updateImage] = useUpdateBikeImageMutation();
  const [deleteImage] = useDeleteBikeImageMutation();
  const [setPrimary] = useSetPrimaryImageMutation();

  const bike = bikeData?.data;
  const images = imagesData?.data.images || [];

  useEffect(() => {
    if (editingImage) {
      setEditAltText(editingImage.alt || "");
    }
  }, [editingImage]);

  const handleSetPrimary = async (imageId: string) => {
    try {
      await setPrimary({ bikeId: id!, imageId }).unwrap();
      toast.success("Primary image updated");
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to set primary image");
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage(imageId).unwrap();
      toast.success("Image deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to delete image");
    }
  };

  const handleUpdateImage = async () => {
    if (!editingImage) return;

    try {
      await updateImage({
        imageId: editingImage._id,
        data: { alt: editAltText },
      }).unwrap();
      toast.success("Image updated successfully");
      setEditingImage(null);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update image");
    }
  };

  const openImageViewer = (index: number) => {
    dispatch(setCurrentImageIndex(index));
    dispatch(setShowImageViewer(true));
  };

  const closeImageViewer = () => {
    dispatch(setShowImageViewer(false));
  };

  const nextImage = () => {
    dispatch(setCurrentImageIndex((currentImageIndex + 1) % images.length));
  };

  const previousImage = () => {
    dispatch(
      setCurrentImageIndex(
        currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1
      )
    );
  };

  if (bikeLoading || imagesLoading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/4'></div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[...Array(6)].map((_, i) => (
              <div key={i} className='aspect-video bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{bike?.modelName} Images</h1>
            <p className='text-gray-600'>
              Manage images for {bike?.year} {bike?.modelName}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size='sm'
              onClick={() => dispatch(setViewMode("grid"))}
            >
              <Grid className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size='sm'
              onClick={() => dispatch(setViewMode("list"))}
            >
              <List className='h-4 w-4' />
            </Button>
          </div>

          <Button onClick={() => setShowUploadModal(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Upload Images
          </Button>
        </div>
      </div>

      {/* Bike Info Card */}
      {bike && (
        <Card className='mb-6'>
          <CardContent className='flex items-center gap-4 p-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center'>
              <span className='text-2xl font-bold text-red-600'>
                {bike.modelName.charAt(0)}
              </span>
            </div>
            <div className='flex-1'>
              <h3 className='font-semibold'>{bike.modelName}</h3>
              <div className='flex items-center gap-3 text-sm text-gray-600'>
                <span className='capitalize'>{bike.category}</span>
                <span>•</span>
                <span>{bike.year}</span>
                <span>•</span>
                <span>{bike.engineSize}</span>
              </div>
            </div>
            <div className='text-right'>
              <Badge variant={images.length > 0 ? "default" : "secondary"}>
                {images.length} Image{images.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Actions */}
      {selectedImages.length > 0 && (
        <Card className='mb-6'>
          <CardContent className='flex items-center justify-between p-4'>
            <span className='text-sm'>
              {selectedImages.length} image
              {selectedImages.length !== 1 ? "s" : ""} selected
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => dispatch(clearSelection())}
              >
                Clear Selection
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={() => {
                  // Handle bulk delete
                  selectedImages.forEach((imageId) =>
                    handleDeleteImage(imageId)
                  );
                  dispatch(clearSelection());
                }}
              >
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Grid/List */}
      {images.length === 0 ? (
        <Card>
          <CardContent className='text-center py-12'>
            <Upload className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium mb-2'>No images uploaded</h3>
            <p className='text-gray-600 mb-6'>
              Upload the first image for this {bike?.mainCategory}
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Upload First Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          }
        >
          <AnimatePresence>
            {images.map((image, index) => (
              <motion.div
                key={image._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={viewMode === "list" ? "flex items-center gap-4" : ""}
              >
                <Card className='group hover:shadow-lg transition-shadow'>
                  <CardContent className='p-0'>
                    <div className='relative'>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className={`w-full object-cover rounded-t cursor-pointer ${
                          viewMode === "grid"
                            ? "aspect-video"
                            : "w-32 h-24 rounded"
                        }`}
                        onClick={() => openImageViewer(index)}
                      />

                      {/* Primary Badge */}
                      {image.isPrimary && (
                        <Badge className='absolute top-2 left-2 bg-yellow-500'>
                          <Star className='h-3 w-3 mr-1' />
                          Primary
                        </Badge>
                      )}

                      {/* Selection Checkbox */}
                      <div className='absolute top-2 right-2'>
                        <input
                          type='checkbox'
                          checked={selectedImages.includes(image._id)}
                          onChange={() =>
                            dispatch(toggleImageSelection(image._id))
                          }
                          className='w-5 h-5 rounded'
                        />
                      </div>

                      {/* Hover Actions */}
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          onClick={() => openImageViewer(index)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size='sm' variant='secondary'>
                              <MoreVertical className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {!image.isPrimary && (
                              <DropdownMenuItem
                                onClick={() => handleSetPrimary(image._id)}
                              >
                                <Star className='h-4 w-4 mr-2' />
                                Set as Primary
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setEditingImage(image)}
                            >
                              <Edit className='h-4 w-4 mr-2' />
                              Edit Alt Text
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteImage(image._id)}
                              className='text-red-600'
                            >
                              <Trash2 className='h-4 w-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className='p-4'>
                      <p className='text-sm font-medium truncate'>
                        {image.alt || "No alt text"}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Uploaded{" "}
                        {new Date(image.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <UploadModal
          bikeId={id!}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => refetch()}
        />
      </Dialog>

      {/* Edit Image Modal */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            {editingImage && (
              <img
                src={editingImage.src}
                alt={editingImage.alt}
                className='w-full h-48 object-cover rounded'
              />
            )}
            <div>
              <Label htmlFor='alt-text'>Alt Text</Label>
              <Textarea
                id='alt-text'
                value={editAltText}
                onChange={(e) => setEditAltText(e.target.value)}
                placeholder='Describe this image...'
                rows={3}
              />
            </div>
            <div className='flex justify-end gap-3'>
              <Button variant='outline' onClick={() => setEditingImage(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateImage}>Update Image</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer */}
      {showImageViewer && images.length > 0 && (
        <ImageViewer
          images={images}
          currentIndex={currentImageIndex}
          onClose={closeImageViewer}
          onNext={nextImage}
          onPrevious={previousImage}
          onSetPrimary={handleSetPrimary}
          onDelete={handleDeleteImage}
        />
      )}
    </div>
  );
}
