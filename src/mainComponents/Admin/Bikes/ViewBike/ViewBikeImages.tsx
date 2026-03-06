import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, ImageIcon, RefreshCw, Edit, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  useGetBikeImagesQuery,
  useSetPrimaryImageMutation,
  useDeleteBikeImageMutation,
} from "@/redux-store/services/BikeSystemApi/bikeImageApi";
import { useGetBikeByIdQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";
import { ImageCard, Lightbox } from "./LightBox";

const ViewBikeImages = () => {
  const { bikeId } = useParams<{ bikeId: string }>();
  const navigate = useNavigate();

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: imagesResponse,
    isLoading: imagesLoading,
    isError: imagesError,
    refetch,
  } = useGetBikeImagesQuery(bikeId ?? skipToken);

  const { data: bikeResponse, isLoading: bikeLoading } = useGetBikeByIdQuery(
    bikeId ?? skipToken
  );

  const [setPrimary] = useSetPrimaryImageMutation();
  const [deleteImage] = useDeleteBikeImageMutation();

  const images = imagesResponse?.data?.images ?? [];
  const bike = bikeResponse?.data;

  const handleSetPrimary = async (imageId: string) => {
    if (!bikeId) return;
    setSettingPrimaryId(imageId);
    try {
      await setPrimary({ bikeId, imageId }).unwrap();
      toast.success("Primary image updated");
    } catch {
      toast.error("Failed to set primary image");
    } finally {
      setSettingPrimaryId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeletingId(deleteTargetId);
    setDeleteTargetId(null);
    try {
      await deleteImage(deleteTargetId).unwrap();
      toast.success("Image deleted");
      // If lightbox is open on deleted image, close it
      setLightboxIndex(null);
    } catch {
      toast.error("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  };

  const prevImage = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null
    );
  const nextImage = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  // ── Render states ──────────────────────────────────────────────────────────

  if (imagesLoading || bikeLoading) {
    return (
      <div className='p-6 space-y-4'>
        <div className='h-8 w-48 bg-gray-100 animate-pulse rounded' />
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className='aspect-video bg-gray-100 animate-pulse rounded-xl'
            />
          ))}
        </div>
      </div>
    );
  }

  if (imagesError) {
    return (
      <div className='p-6 flex flex-col items-center gap-4 text-center'>
        <ImageIcon className='h-12 w-12 text-gray-300' />
        <p className='text-gray-500'>Failed to load images</p>
        <Button variant='outline' onClick={refetch}>
          <RefreshCw className='h-4 w-4 mr-2' />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && images.length > 0 && (
          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteTargetId}
        onOpenChange={() => setDeleteTargetId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              This will permanently delete the image from Cloudinary and the
              database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className='flex justify-end gap-3 pt-2'>
            <Button variant='outline' onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Page */}
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => navigate(-1)}
              className='shrink-0'
            >
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>
                {bike?.modelName ?? "Bike"} — Images
              </h2>
              <p className='text-sm text-gray-500 capitalize'>
                {bike?.mainCategory} • {images.length} image
                {images.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className='flex gap-2 shrink-0'>
            <Button variant='outline' size='sm' onClick={refetch}>
              <RefreshCw className='h-4 w-4' />
            </Button>
            <Link to={`/admin/bikes/${bikeId}/images/edit`}>
              <Button variant='outline' size='sm' className='gap-1'>
                <Edit className='h-4 w-4' />
                Edit
              </Button>
            </Link>
            <Link to={`/admin/bikes/${bikeId}/images/add`}>
              <Button
                size='sm'
                className='gap-1 bg-red-600 hover:bg-red-700 text-white'
              >
                <Plus className='h-4 w-4' />
                Add Images
              </Button>
            </Link>
          </div>
        </div>

        {/* Bike Summary Card */}
        {bike && (
          <Card className='border-gray-100'>
            <CardContent className='p-4'>
              <div className='flex flex-wrap gap-6 text-sm'>
                <div>
                  <span className='text-gray-400'>Model</span>
                  <p className='font-medium'>{bike.modelName}</p>
                </div>
                <div>
                  <span className='text-gray-400'>Category</span>
                  <p className='font-medium capitalize'>{bike.category}</p>
                </div>
                <div>
                  <span className='text-gray-400'>Year</span>
                  <p className='font-medium'>{bike.year}</p>
                </div>
                <div>
                  <span className='text-gray-400'>Engine</span>
                  <p className='font-medium'>{bike.engineSize}</p>
                </div>
                <div>
                  <span className='text-gray-400'>Fuel Norms</span>
                  <p className='font-medium'>{bike.fuelNorms}</p>
                </div>
                <div>
                  <span className='text-gray-400'>Stock</span>
                  <p className='font-medium'>{bike.stockAvailable} units</p>
                </div>
                <div>
                  <span className='text-gray-400'>Status</span>
                  <Badge
                    className={
                      bike.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {bike.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images Grid */}
        {images.length === 0 ? (
          <Card className='border-dashed border-gray-200'>
            <CardContent className='flex flex-col items-center justify-center py-16 gap-4'>
              <ImageIcon className='h-12 w-12 text-gray-200' />
              <div className='text-center'>
                <p className='text-gray-500 font-medium'>No images uploaded</p>
                <p className='text-sm text-gray-400 mt-1'>
                  Add images to showcase this bike
                </p>
              </div>
              <Link to={`/admin/bikes/${bikeId}/images/add`}>
                <Button
                  size='sm'
                  className='gap-1 bg-red-600 hover:bg-red-700 text-white'
                >
                  <Plus className='h-4 w-4' />
                  Add First Image
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {images.map((image, i) => (
              <ImageCard
                key={image._id}
                image={image}
                bikeId={bikeId!}
                index={i}
                onView={(idx) => setLightboxIndex(idx)}
                onSetPrimary={handleSetPrimary}
                onDelete={(id) => setDeleteTargetId(id)}
                settingPrimaryId={settingPrimaryId}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ViewBikeImages;
