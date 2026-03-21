import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Star,
  Trash2,
  Edit3,
  Eye,
  X,
  Plus,
  CheckCircle2,
  ImageIcon,
  Bike,
  Zap,
  Calendar,
  Gauge,
  Tag,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

import { useGetBikeByIdQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import {
  useGetBikeImagesQuery,
  useUploadBikeImagesMutation,
  useDeleteBikeImageMutation,
  useSetPrimaryImageMutation,
  useUpdateBikeImageMutation,
  createImageUploadFormData,
} from "@/redux-store/services/BikeSystemApi/bikeImageApi";

import type { BikeImage } from "@/redux-store/slices/BikeSystemSlice/bikeImageSlice";

// ─── helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (priceBreakdown: any): string => {
  if (priceBreakdown?.onRoadPrice)
    return `₹${priceBreakdown.onRoadPrice.toLocaleString()}`;
  if (priceBreakdown?.exShowroomPrice)
    return `₹${priceBreakdown.exShowroomPrice.toLocaleString()}`;
  return "Price on request";
};

const getStockStatus = (stock: number) => {
  if (stock === 0)
    return {
      text: "Out of Stock",
      color: "bg-red-100 text-red-700 border-red-200",
    };
  if (stock <= 5)
    return {
      text: "Low Stock",
      color: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    text: "In Stock",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
};

// ─── upload drop zone ─────────────────────────────────────────────────────────

interface UploadZoneProps {
  bikeId: string;
  onSuccess: () => void;
}

const UploadZone = ({ bikeId, onSuccess }: UploadZoneProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [altTexts, setAltTexts] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadImages, { isLoading: uploading }] =
    useUploadBikeImagesMutation();

  const addFiles = (incoming: File[]) => {
    const images = incoming.filter((f) => f.type.startsWith("image/"));
    setFiles((p) => [...p, ...images]);
    setAltTexts((p) => [...p, ...images.map(() => "")]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (index: number) => {
    setFiles((p) => p.filter((_, i) => i !== index));
    setAltTexts((p) => p.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    try {
      const formData = createImageUploadFormData(files, altTexts);
      await uploadImages({ bikeId, formData }).unwrap();
      toast.success(
        `${files.length} image${files.length > 1 ? "s" : ""} uploaded`
      );
      setFiles([]);
      setAltTexts([]);
      onSuccess();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Upload failed");
    }
  };

  return (
    <div className='space-y-4'>
      {/* Drop zone */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-red-400 bg-red-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type='file'
          multiple
          accept='image/*'
          className='hidden'
          onChange={handleFileSelect}
        />
        <div className='w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3'>
          <Upload className='h-6 w-6 text-red-500' />
        </div>
        <p className='font-semibold text-gray-800 text-sm mb-1'>
          Drop images here or click to browse
        </p>
        <p className='text-xs text-gray-400'>
          JPG, PNG, WebP — up to 10 images
        </p>
      </div>

      {/* Staged files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className='space-y-3'
          >
            <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>
              {files.length} file{files.length > 1 ? "s" : ""} staged
            </p>
            <div className='space-y-2 max-h-64 overflow-y-auto pr-1'>
              {files.map((file, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100'
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt=''
                    className='w-12 h-12 object-cover rounded-lg shrink-0'
                  />
                  <div className='flex-1 min-w-0 space-y-1'>
                    <p className='text-xs font-medium text-gray-700 truncate'>
                      {file.name}
                    </p>
                    <input
                      className='w-full text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-red-300'
                      placeholder='Alt text (optional)'
                      value={altTexts[i] ?? ""}
                      onChange={(e) =>
                        setAltTexts((p) =>
                          p.map((t, idx) => (idx === i ? e.target.value : t))
                        )
                      }
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className='p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              ))}
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={uploading}
              className='w-full bg-red-600 hover:bg-red-700 rounded-xl h-9 text-sm'
            >
              {uploading ? (
                <span className='flex items-center gap-2'>
                  <div className='h-3.5 w-3.5 animate-spin border-2 border-white border-t-transparent rounded-full' />
                  Uploading…
                </span>
              ) : (
                <span className='flex items-center gap-1.5'>
                  <Upload className='h-3.5 w-3.5' />
                  Upload {files.length} Image{files.length > 1 ? "s" : ""}
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── image card ───────────────────────────────────────────────────────────────

interface ImageCardProps {
  image: BikeImage;
  index: number;
  bikeId: string;
  selected: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onSetPrimary: () => void;
  onDelete: () => void;
  onEditAlt: () => void;
}

const ImageCard = ({
  image,
  index,
  selected,
  onToggleSelect,
  onPreview,
  onSetPrimary,
  onDelete,
  onEditAlt,
}: ImageCardProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ delay: index * 0.04, duration: 0.25 }}
    className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
      selected
        ? "border-red-400 shadow-md shadow-red-100"
        : "border-gray-100 hover:border-gray-200"
    }`}
  >
    {/* Image */}
    <div
      className='relative aspect-video bg-gray-100 cursor-pointer'
      onClick={onPreview}
    >
      <img
        src={image.src}
        alt={image.alt}
        className='w-full h-full object-cover'
      />

      {/* Primary badge */}
      {image.isPrimary && (
        <div className='absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold'>
          <Star className='h-2.5 w-2.5 fill-yellow-900' />
          Primary
        </div>
      )}

      {/* Checkbox */}
      <div className='absolute top-2 right-2'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected
              ? "bg-red-500 border-red-500"
              : "bg-white/80 border-gray-300 hover:border-red-400"
          }`}
        >
          {selected && (
            <CheckCircle2 className='h-3 w-3 text-white fill-white' />
          )}
        </button>
      </div>

      {/* Hover overlay */}
      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
          className='p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors'
        >
          <Eye className='h-4 w-4' />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditAlt();
          }}
          className='p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors'
        >
          <Edit3 className='h-4 w-4' />
        </button>
        {!image.isPrimary && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetPrimary();
            }}
            className='p-2 rounded-lg bg-white/20 hover:bg-yellow-400/50 text-white transition-colors'
          >
            <Star className='h-4 w-4' />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className='p-2 rounded-lg bg-white/20 hover:bg-red-500/50 text-white transition-colors'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      </div>
    </div>

    {/* Footer */}
    <div className='px-3 py-2 bg-white'>
      <p className='text-xs text-gray-500 truncate'>
        {image.alt || "No alt text"}
      </p>
    </div>
  </motion.div>
);

// ─── main component ───────────────────────────────────────────────────────────

export default function BikeImageManager() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<BikeImage | null>(null);
  const [editingImage, setEditingImage] = useState<BikeImage | null>(null);
  const [editAltText, setEditAltText] = useState("");

  const { data: bikeData, isLoading: bikeLoading } = useGetBikeByIdQuery(id!, {
    skip: !id,
  });
  const {
    data: imagesData,
    isLoading: imagesLoading,
    refetch,
  } = useGetBikeImagesQuery(id!, { skip: !id });

  const [deleteBikeImage] = useDeleteBikeImageMutation();
  const [setPrimaryImage] = useSetPrimaryImageMutation();
  const [updateBikeImage, { isLoading: updating }] =
    useUpdateBikeImageMutation();

  const bike = bikeData?.data;
  const images: BikeImage[] = imagesData?.data?.images ?? [];

  const handleDelete = async (imageId: string) => {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    try {
      await deleteBikeImage(imageId).unwrap();
      setSelectedImages((prev) => {
        const s = new Set(prev);
        s.delete(imageId);
        return s;
      });
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    if (!id) return;
    try {
      await setPrimaryImage({ bikeId: id, imageId }).unwrap();
      toast.success("Primary image updated");
    } catch {
      toast.error("Failed to set primary image");
    }
  };

  const openEditAlt = (image: BikeImage) => {
    setEditingImage(image);
    setEditAltText(image.alt ?? "");
  };

  const handleUpdateAlt = async () => {
    if (!editingImage) return;
    try {
      await updateBikeImage({
        imageId: editingImage._id,
        data: { alt: editAltText },
      }).unwrap();
      toast.success("Alt text updated");
      setEditingImage(null);
    } catch {
      toast.error("Failed to update alt text");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedImages.size) return;
    if (
      !window.confirm(
        `Delete ${selectedImages.size} image${
          selectedImages.size > 1 ? "s" : ""
        }?`
      )
    )
      return;
    await Promise.all(
      [...selectedImages].map((id) =>
        deleteBikeImage(id)
          .unwrap()
          .catch(() => null)
      )
    );
    setSelectedImages(new Set());
    toast.success("Images deleted");
  };

  const toggleSelect = (imageId: string) => {
    setSelectedImages((prev) => {
      const s = new Set(prev);
      s.has(imageId) ? s.delete(imageId) : s.add(imageId);
      return s;
    });
  };

  const stock = bike ? getStockStatus(bike.stockAvailable) : null;
  const VehicleIcon = bike?.mainCategory === "scooter" ? Zap : Bike;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto px-4 py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm'
          >
            <ArrowLeft className='h-4 w-4 text-gray-600' />
          </button>
          <div>
            <h1 className='text-lg font-bold text-gray-900'>
              {bikeLoading ? "Loading…" : bike?.modelName ?? "Vehicle Images"}
            </h1>
            <p className='text-xs text-gray-400'>
              Manage images for this vehicle
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* ── Left column: bike info + upload ── */}
          <div className='space-y-4'>
            {/* Bike info card */}
            {bikeLoading ? (
              <div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse'>
                <div className='h-4 bg-gray-200 rounded w-2/3' />
                <div className='h-3 bg-gray-200 rounded w-1/2' />
                <div className='h-3 bg-gray-200 rounded w-1/3' />
              </div>
            ) : bike ? (
              <div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-5'>
                {/* Icon + name */}
                <div className='flex items-start gap-3 mb-4'>
                  <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center shrink-0'>
                    <VehicleIcon className='h-6 w-6 text-red-500' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h2 className='font-bold text-gray-900 text-sm leading-tight'>
                      {bike.modelName}
                    </h2>
                    <p className='text-xs text-gray-400 capitalize mt-0.5'>
                      {bike.mainCategory} · {bike.category}
                    </p>
                  </div>
                  {bike.isNewModel && (
                    <span className='inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 shrink-0'>
                      <Star className='w-2.5 h-2.5' />
                      New
                    </span>
                  )}
                </div>

                {/* Specs grid */}
                <div className='grid grid-cols-2 gap-2 mb-4'>
                  {[
                    { icon: Calendar, label: "Year", value: bike.year },
                    { icon: Gauge, label: "Engine", value: bike.engineSize },
                    { icon: Tag, label: "Norms", value: bike.fuelNorms },
                    {
                      icon: Package,
                      label: "Stock",
                      value: bike.stockAvailable,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className='flex items-center gap-2 p-2 rounded-xl bg-gray-50'
                    >
                      <Icon className='h-3.5 w-3.5 text-gray-400 shrink-0' />
                      <div className='min-w-0'>
                        <p className='text-[10px] text-gray-400'>{label}</p>
                        <p className='text-xs font-semibold text-gray-700 truncate'>
                          {String(value ?? "—")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price + stock */}
                <div className='flex items-center justify-between'>
                  <span className='text-base font-black text-red-600'>
                    {formatPrice(bike.priceBreakdown)}
                  </span>
                  {stock && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${stock.color}`}
                    >
                      {stock.text}
                    </span>
                  )}
                </div>
              </div>
            ) : null}

            {/* Upload card */}
            <div className='rounded-2xl bg-white border border-gray-100 shadow-sm p-5'>
              <div className='flex items-center gap-2 mb-4'>
                <div className='w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center'>
                  <Plus className='h-4 w-4 text-red-600' />
                </div>
                <h3 className='text-sm font-bold text-gray-900'>Add Images</h3>
              </div>
              <UploadZone bikeId={id!} onSuccess={refetch} />
            </div>

            {/* Quick actions */}
          </div>

          {/* ── Right column: image gallery ── */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Gallery header */}
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center'>
                  <ImageIcon className='h-4 w-4 text-gray-500' />
                </div>
                <span className='text-sm font-bold text-gray-900'>
                  Gallery
                  {images.length > 0 && (
                    <span className='ml-2 text-xs font-normal text-gray-400'>
                      {images.length} image{images.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </span>
              </div>

              {/* Bulk selection actions */}
              <AnimatePresence>
                {selectedImages.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className='flex items-center gap-2'
                  >
                    <span className='text-xs text-gray-500'>
                      {selectedImages.size} selected
                    </span>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setSelectedImages(new Set())}
                      className='h-7 px-2 rounded-lg text-xs'
                    >
                      Clear
                    </Button>
                    <Button
                      size='sm'
                      onClick={handleBulkDelete}
                      className='h-7 px-2 rounded-lg text-xs bg-red-600 hover:bg-red-700'
                    >
                      <Trash2 className='h-3 w-3 mr-1' />
                      Delete
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Gallery content */}
            {imagesLoading ? (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='aspect-video rounded-2xl bg-gray-200 animate-pulse'
                  />
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className='rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center'>
                <div className='w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4'>
                  <ImageIcon className='h-7 w-7 text-gray-400' />
                </div>
                <p className='text-sm font-semibold text-gray-700 mb-1'>
                  No images yet
                </p>
                <p className='text-xs text-gray-400'>
                  Use the upload panel to add the first image
                </p>
              </div>
            ) : (
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                <AnimatePresence>
                  {images.map((image, index) => (
                    <ImageCard
                      key={image._id}
                      image={image}
                      index={index}
                      bikeId={id!}
                      selected={selectedImages.has(image._id)}
                      onToggleSelect={() => toggleSelect(image._id)}
                      onPreview={() => setPreviewImage(image)}
                      onSetPrimary={() => handleSetPrimary(image._id)}
                      onDelete={() => handleDelete(image._id)}
                      onEditAlt={() => openEditAlt(image)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Image preview dialog ── */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className='max-w-3xl p-0 overflow-hidden rounded-2xl'>
          {previewImage && (
            <div className='relative'>
              <img
                src={previewImage.src}
                alt={previewImage.alt}
                className='w-full max-h-[70vh] object-contain bg-black'
              />
              {previewImage.isPrimary && (
                <div className='absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 text-[10px] font-bold'>
                  <Star className='h-2.5 w-2.5 fill-yellow-900' />
                  Primary
                </div>
              )}
              <div className='p-4 bg-white border-t border-gray-100 flex items-center justify-between'>
                <p className='text-sm text-gray-600'>
                  {previewImage.alt || "No alt text"}
                </p>
                <div className='flex gap-2'>
                  {!previewImage.isPrimary && (
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => {
                        handleSetPrimary(previewImage._id);
                        setPreviewImage(null);
                      }}
                      className='h-8 text-xs rounded-lg'
                    >
                      <Star className='h-3.5 w-3.5 mr-1 text-yellow-500' />
                      Set Primary
                    </Button>
                  )}
                  <Button
                    size='sm'
                    variant='destructive'
                    onClick={() => {
                      handleDelete(previewImage._id);
                      setPreviewImage(null);
                    }}
                    className='h-8 text-xs rounded-lg'
                  >
                    <Trash2 className='h-3.5 w-3.5 mr-1' />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit alt text dialog ── */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className='max-w-md rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='text-sm font-bold'>
              Edit Alt Text
            </DialogTitle>
          </DialogHeader>
          {editingImage && (
            <div className='space-y-4'>
              <img
                src={editingImage.src}
                alt={editingImage.alt}
                className='w-full h-40 object-cover rounded-xl'
              />
              <div className='space-y-1.5'>
                <Label
                  htmlFor='alt-input'
                  className='text-xs font-medium text-gray-600'
                >
                  Alt Text
                </Label>
                <Textarea
                  id='alt-input'
                  value={editAltText}
                  onChange={(e) => setEditAltText(e.target.value)}
                  placeholder='Describe this image…'
                  rows={3}
                  className='text-sm rounded-xl resize-none'
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setEditingImage(null)}
                  className='rounded-xl'
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  onClick={handleUpdateAlt}
                  disabled={updating}
                  className='rounded-xl bg-red-600 hover:bg-red-700'
                >
                  {updating ? "Saving…" : "Save"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
