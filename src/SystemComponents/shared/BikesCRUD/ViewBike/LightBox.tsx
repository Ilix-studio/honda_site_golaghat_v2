import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Star, Trash2, Eye, ChevronLeft, ChevronRight, X } from "lucide-react";

import { BikeImage } from "@/redux-store/slices/BikeSystemSlice/bikeImageSlice";

export interface LightboxProps {
  images: BikeImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox = ({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) => {
  const img = images[index];
  if (!img) return null;

  return (
    <div
      className='fixed inset-0 z-50 bg-black/90 flex items-center justify-center'
      onClick={onClose}
    >
      <div
        className='relative max-w-5xl w-full mx-4 flex flex-col items-center gap-3'
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant='ghost'
          size='icon'
          onClick={onClose}
          className='absolute -top-10 right-0 text-white hover:bg-white/20'
        >
          <X className='h-5 w-5' />
        </Button>

        <div className='relative w-full flex items-center justify-center'>
          {images.length > 1 && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onPrev}
              className='absolute left-0 text-white hover:bg-white/20 z-10'
            >
              <ChevronLeft className='h-6 w-6' />
            </Button>
          )}

          <img
            src={img.src}
            alt={img.alt}
            className='max-h-[75vh] max-w-full object-contain rounded-lg'
          />

          {images.length > 1 && (
            <Button
              variant='ghost'
              size='icon'
              onClick={onNext}
              className='absolute right-0 text-white hover:bg-white/20 z-10'
            >
              <ChevronRight className='h-6 w-6' />
            </Button>
          )}
        </div>

        <div className='bg-black/60 text-white px-4 py-2 rounded-lg text-sm text-center'>
          <span>{img.alt || "No alt text"}</span>
          <span className='mx-2 opacity-50'>•</span>
          <span className='opacity-75'>
            {index + 1} / {images.length}
          </span>
          {img.isPrimary && (
            <>
              <span className='mx-2 opacity-50'>•</span>
              <span className='text-yellow-400'>Primary</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Image Card ─────────────────────────────────────────────────────────────────

export interface ImageCardProps {
  image: BikeImage;
  bikeId: string;
  index: number;
  onView: (index: number) => void;
  onSetPrimary: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  settingPrimaryId: string | null;
  deletingId: string | null;
}

export const ImageCard = ({
  image,

  index,
  onView,
  onSetPrimary,
  onDelete,
  settingPrimaryId,
  deletingId,
}: ImageCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className='group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow'
  >
    {image.isPrimary && (
      <div className='absolute top-2 left-2 z-10'>
        <Badge className='bg-yellow-500 text-white text-xs gap-1'>
          <Star className='h-3 w-3 fill-white' />
          Primary
        </Badge>
      </div>
    )}

    {/* Image */}
    <div
      className='relative aspect-video overflow-hidden cursor-pointer bg-gray-50'
      onClick={() => onView(index)}
    >
      <img
        src={image.src}
        alt={image.alt}
        className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
        loading='lazy'
      />
      <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center'>
        <Eye className='h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity' />
      </div>
    </div>

    {/* Details */}
    <div className='p-3 space-y-2'>
      <p className='text-sm text-gray-700 truncate' title={image.alt}>
        {image.alt || <span className='text-gray-400 italic'>No alt text</span>}
      </p>
      <p className='text-xs text-gray-400'>
        {new Date(image.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </p>

      <div className='flex gap-2 pt-1'>
        {!image.isPrimary && (
          <Button
            variant='outline'
            size='sm'
            className='flex-1 h-8 text-xs gap-1'
            disabled={settingPrimaryId === image._id}
            onClick={() => onSetPrimary(image._id)}
          >
            <Star className='h-3 w-3' />
            {settingPrimaryId === image._id ? "Setting..." : "Set Primary"}
          </Button>
        )}
        <Button
          variant='outline'
          size='sm'
          className='h-8 text-xs text-red-500 hover:text-red-700 hover:border-red-300'
          disabled={deletingId === image._id}
          onClick={() => onDelete(image._id)}
        >
          <Trash2 className='h-3 w-3' />
        </Button>
      </div>
    </div>
  </motion.div>
);
