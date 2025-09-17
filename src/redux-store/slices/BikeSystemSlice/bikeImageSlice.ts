// src/redux-store/slices/bikeImageSlice.ts
import { RootState } from "@/redux-store/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Bike image interface matching backend model
export interface BikeImage {
  _id: string;
  bikeId: string;
  src: string;
  alt: string;
  cloudinaryPublicId: string;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Upload progress interface
export interface UploadProgress {
  imageId: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

// Form data for image uploads
export interface ImageUploadData {
  files: File[];
  altTexts?: string[];
  bikeId: string;
}

// Single image upload data
export interface SingleImageUploadData {
  file: File;
  alt?: string;
  bikeId: string;
}

// Update image data
export interface UpdateImageData {
  imageId: string;
  alt?: string;
  isPrimary?: boolean;
}

// Bike image state interface
export interface BikeImageState {
  // Data
  images: BikeImage[];
  imagesByBike: Record<string, BikeImage[]>;
  currentBikeImages: BikeImage[];

  // Loading states
  loading: boolean;
  uploadLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;

  // Error states
  error: string | null;
  uploadError: string | null;
  updateError: string | null;
  deleteError: string | null;

  // Success states
  uploadSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;

  // Upload progress
  uploadProgress: UploadProgress[];
  isUploading: boolean;

  // UI states
  selectedImages: string[];
  viewMode: "grid" | "list";
  sortBy: "createdAt" | "isPrimary" | "alt";
  sortOrder: "asc" | "desc";

  // Modal states
  showUploadModal: boolean;
  showImageViewer: boolean;
  currentImageIndex: number;

  // Filters
  showOnlyPrimary: boolean;
  selectedBikeId: string | null;
}

const initialState: BikeImageState = {
  images: [],
  imagesByBike: {},
  currentBikeImages: [],
  loading: false,
  uploadLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  uploadError: null,
  updateError: null,
  deleteError: null,
  uploadSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  uploadProgress: [],
  isUploading: false,
  selectedImages: [],
  viewMode: "grid",
  sortBy: "createdAt",
  sortOrder: "desc",
  showUploadModal: false,
  showImageViewer: false,
  currentImageIndex: 0,
  showOnlyPrimary: false,
  selectedBikeId: null,
};

const bikeImageSlice = createSlice({
  name: "bikeImages",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUploadLoading: (state, action: PayloadAction<boolean>) => {
      state.uploadLoading = action.payload;
    },
    setUpdateLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },
    setDeleteLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUploadError: (state, action: PayloadAction<string | null>) => {
      state.uploadError = action.payload;
    },
    setUpdateError: (state, action: PayloadAction<string | null>) => {
      state.updateError = action.payload;
    },
    setDeleteError: (state, action: PayloadAction<string | null>) => {
      state.deleteError = action.payload;
    },

    // Success states
    setUploadSuccess: (state, action: PayloadAction<boolean>) => {
      state.uploadSuccess = action.payload;
    },
    setUpdateSuccess: (state, action: PayloadAction<boolean>) => {
      state.updateSuccess = action.payload;
    },
    setDeleteSuccess: (state, action: PayloadAction<boolean>) => {
      state.deleteSuccess = action.payload;
    },

    // Data management
    setImages: (state, action: PayloadAction<BikeImage[]>) => {
      state.images = action.payload;
    },
    setBikeImages: (
      state,
      action: PayloadAction<{ bikeId: string; images: BikeImage[] }>
    ) => {
      const { bikeId, images } = action.payload;
      state.imagesByBike[bikeId] = images;
      if (state.selectedBikeId === bikeId) {
        state.currentBikeImages = images;
      }
    },
    setCurrentBikeImages: (state, action: PayloadAction<BikeImage[]>) => {
      state.currentBikeImages = action.payload;
    },
    addImages: (state, action: PayloadAction<BikeImage[]>) => {
      const newImages = action.payload;
      state.images.push(...newImages);

      // Group by bike
      newImages.forEach((image) => {
        if (!state.imagesByBike[image.bikeId]) {
          state.imagesByBike[image.bikeId] = [];
        }
        state.imagesByBike[image.bikeId].push(image);
      });

      // Update current bike images if applicable
      const currentBikeImages = newImages.filter(
        (img) => img.bikeId === state.selectedBikeId
      );
      if (currentBikeImages.length > 0) {
        state.currentBikeImages.push(...currentBikeImages);
      }
    },
    updateImageInList: (state, action: PayloadAction<BikeImage>) => {
      const updatedImage = action.payload;

      // Update in main list
      const index = state.images.findIndex(
        (img) => img._id === updatedImage._id
      );
      if (index !== -1) {
        state.images[index] = updatedImage;
      }

      // Update in bike-specific list
      const bikeImages = state.imagesByBike[updatedImage.bikeId];
      if (bikeImages) {
        const bikeIndex = bikeImages.findIndex(
          (img) => img._id === updatedImage._id
        );
        if (bikeIndex !== -1) {
          bikeImages[bikeIndex] = updatedImage;
        }
      }

      // Update in current bike images
      const currentIndex = state.currentBikeImages.findIndex(
        (img) => img._id === updatedImage._id
      );
      if (currentIndex !== -1) {
        state.currentBikeImages[currentIndex] = updatedImage;
      }
    },
    removeImageFromList: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;

      // Find the image to get bikeId before removal
      const image = state.images.find((img) => img._id === imageId);

      // Remove from main list
      state.images = state.images.filter((img) => img._id !== imageId);

      // Remove from bike-specific list
      if (image && state.imagesByBike[image.bikeId]) {
        state.imagesByBike[image.bikeId] = state.imagesByBike[
          image.bikeId
        ].filter((img) => img._id !== imageId);
      }

      // Remove from current bike images
      state.currentBikeImages = state.currentBikeImages.filter(
        (img) => img._id !== imageId
      );

      // Remove from selected images
      state.selectedImages = state.selectedImages.filter(
        (id) => id !== imageId
      );
    },
    removeAllBikeImages: (state, action: PayloadAction<string>) => {
      const bikeId = action.payload;

      // Remove from main list
      state.images = state.images.filter((img) => img.bikeId !== bikeId);

      // Remove from bike-specific list
      delete state.imagesByBike[bikeId];

      // Clear current bike images if it's the selected bike
      if (state.selectedBikeId === bikeId) {
        state.currentBikeImages = [];
      }

      // Remove any selected images for this bike
      const imagesToRemove = state.images
        .filter((img) => img.bikeId === bikeId)
        .map((img) => img._id);
      state.selectedImages = state.selectedImages.filter(
        (id) => !imagesToRemove.includes(id)
      );
    },

    // Upload progress management
    setUploadProgress: (state, action: PayloadAction<UploadProgress[]>) => {
      state.uploadProgress = action.payload;
    },
    updateUploadProgress: (state, action: PayloadAction<UploadProgress>) => {
      const progress = action.payload;
      const index = state.uploadProgress.findIndex(
        (p) => p.imageId === progress.imageId
      );
      if (index !== -1) {
        state.uploadProgress[index] = progress;
      } else {
        state.uploadProgress.push(progress);
      }
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = [];
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },

    // Selection management
    setSelectedImages: (state, action: PayloadAction<string[]>) => {
      state.selectedImages = action.payload;
    },
    toggleImageSelection: (state, action: PayloadAction<string>) => {
      const imageId = action.payload;
      if (state.selectedImages.includes(imageId)) {
        state.selectedImages = state.selectedImages.filter(
          (id) => id !== imageId
        );
      } else {
        state.selectedImages.push(imageId);
      }
    },
    selectAllImages: (state) => {
      state.selectedImages = state.currentBikeImages.map((img) => img._id);
    },
    clearSelection: (state) => {
      state.selectedImages = [];
    },

    // UI states
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<"createdAt" | "isPrimary" | "alt">
    ) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<"asc" | "desc">) => {
      state.sortOrder = action.payload;
    },
    setSelectedBikeId: (state, action: PayloadAction<string | null>) => {
      state.selectedBikeId = action.payload;
      if (action.payload && state.imagesByBike[action.payload]) {
        state.currentBikeImages = state.imagesByBike[action.payload];
      } else {
        state.currentBikeImages = [];
      }
    },

    // Modal states
    setShowUploadModal: (state, action: PayloadAction<boolean>) => {
      state.showUploadModal = action.payload;
    },
    setShowImageViewer: (state, action: PayloadAction<boolean>) => {
      state.showImageViewer = action.payload;
    },
    setCurrentImageIndex: (state, action: PayloadAction<number>) => {
      state.currentImageIndex = action.payload;
    },

    // Filters
    setShowOnlyPrimary: (state, action: PayloadAction<boolean>) => {
      state.showOnlyPrimary = action.payload;
    },

    // Primary image management
    setPrimaryImage: (
      state,
      action: PayloadAction<{ bikeId: string; imageId: string }>
    ) => {
      const { bikeId, imageId } = action.payload;

      // Update in main list
      state.images.forEach((img) => {
        if (img.bikeId === bikeId) {
          img.isPrimary = img._id === imageId;
        }
      });

      // Update in bike-specific list
      if (state.imagesByBike[bikeId]) {
        state.imagesByBike[bikeId].forEach((img) => {
          img.isPrimary = img._id === imageId;
        });
      }

      // Update in current bike images
      state.currentBikeImages.forEach((img) => {
        img.isPrimary = img._id === imageId;
      });
    },

    // Reset states
    resetUploadState: (state) => {
      state.uploadLoading = false;
      state.uploadError = null;
      state.uploadSuccess = false;
      state.uploadProgress = [];
      state.isUploading = false;
    },
    resetUpdateState: (state) => {
      state.updateLoading = false;
      state.updateError = null;
      state.updateSuccess = false;
    },
    resetDeleteState: (state) => {
      state.deleteLoading = false;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    resetAllStates: (state) => {
      state.loading = false;
      state.uploadLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
      state.error = null;
      state.uploadError = null;
      state.updateError = null;
      state.deleteError = null;
      state.uploadSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.uploadProgress = [];
      state.isUploading = false;
    },
  },
});

export const {
  setLoading,
  setUploadLoading,
  setUpdateLoading,
  setDeleteLoading,
  setError,
  setUploadError,
  setUpdateError,
  setDeleteError,
  setUploadSuccess,
  setUpdateSuccess,
  setDeleteSuccess,
  setImages,
  setBikeImages,
  setCurrentBikeImages,
  addImages,
  updateImageInList,
  removeImageFromList,
  removeAllBikeImages,
  setUploadProgress,
  updateUploadProgress,
  clearUploadProgress,
  setIsUploading,
  setSelectedImages,
  toggleImageSelection,
  selectAllImages,
  clearSelection,
  setViewMode,
  setSortBy,
  setSortOrder,
  setSelectedBikeId,
  setShowUploadModal,
  setShowImageViewer,
  setCurrentImageIndex,
  setShowOnlyPrimary,
  setPrimaryImage,
  resetUploadState,
  resetUpdateState,
  resetDeleteState,
  resetAllStates,
} = bikeImageSlice.actions;

// Selectors
export const selectBikeImages = (state: RootState) => state.bikeImages.images;
export const selectCurrentBikeImages = (state: RootState) =>
  state.bikeImages.currentBikeImages;
export const selectBikeImagesLoading = (state: RootState) =>
  state.bikeImages.loading;
export const selectBikeImagesError = (state: RootState) =>
  state.bikeImages.error;
export const selectSelectedImages = (state: RootState) =>
  state.bikeImages.selectedImages;
export const selectUploadProgress = (state: RootState) =>
  state.bikeImages.uploadProgress;
export const selectIsUploading = (state: RootState) =>
  state.bikeImages.isUploading;
export const selectImageViewMode = (state: RootState) =>
  state.bikeImages.viewMode;

// Computed selectors
export const selectImagesByBikeId = (state: RootState, bikeId: string) =>
  state.bikeImages.imagesByBike[bikeId] || [];

export const selectPrimaryImageByBikeId = (
  state: RootState,
  bikeId: string
) => {
  const images = state.bikeImages.imagesByBike[bikeId] || [];
  return images.find((img) => img.isPrimary);
};

export const selectSortedCurrentBikeImages = (state: RootState) => {
  const { currentBikeImages, sortBy, sortOrder, showOnlyPrimary } =
    state.bikeImages;

  let filtered = showOnlyPrimary
    ? currentBikeImages.filter((img) => img.isPrimary)
    : currentBikeImages;

  return [...filtered].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    if (sortBy === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortBy === "isPrimary") {
      aValue = a.isPrimary ? 1 : 0;
      bValue = b.isPrimary ? 1 : 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const selectImageById = (state: RootState, imageId: string) =>
  state.bikeImages.images.find((img) => img._id === imageId);

export default bikeImageSlice.reducer;
