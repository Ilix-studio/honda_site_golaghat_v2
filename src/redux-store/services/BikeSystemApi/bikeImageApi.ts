// src/redux-store/api/bikeImageApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../../lib/apiConfig";
import { BikeImage } from "../../slices/BikeSystemSlice/bikeImageSlice";

// Response interfaces
export interface GetBikeImagesResponse {
  success: boolean;
  data: {
    bikeId: string;
    bike: {
      modelName: string;
      mainCategory: string;
    };
    images: BikeImage[];
    count: number;
  };
}

export interface UploadImagesResponse {
  success: boolean;
  message: string;
  data: {
    bikeId: string;
    uploadedCount: number;
    images: BikeImage[];
  };
}

export interface UploadSingleImageResponse {
  success: boolean;
  message: string;
  data: {
    bikeId: string;
    image: BikeImage;
  };
}

export interface UpdateImageResponse {
  success: boolean;
  message: string;
  data: BikeImage;
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
}

export interface DeleteAllImagesResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

export interface SetPrimaryImageResponse {
  success: boolean;
  message: string;
  data: BikeImage;
}

export const bikeImageApi = createApi({
  reducerPath: "bikeImageApi",
  baseQuery,
  tagTypes: ["BikeImage", "BikeImageList"],
  endpoints: (builder) => ({
    // GET /api/bike-images/:bikeId - Get all images for a bike
    getBikeImages: builder.query<GetBikeImagesResponse, string>({
      query: (bikeId) => `bike-images/${bikeId}`,
      providesTags: (result, _error, bikeId) => {
        if (result) {
          return [
            { type: "BikeImageList", id: bikeId },
            ...result.data.images.map((image) => ({
              type: "BikeImage" as const,
              id: image._id,
            })),
          ];
        }
        return [{ type: "BikeImageList", id: bikeId }];
      },
    }),

    // POST /api/bike-images/:bikeId - Upload multiple images
    uploadBikeImages: builder.mutation<
      UploadImagesResponse,
      { bikeId: string; formData: FormData }
    >({
      query: ({ bikeId, formData }) => ({
        url: `bike-images/${bikeId}`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { bikeId }) => [
        { type: "BikeImageList", id: bikeId },
      ],
    }),

    // POST /api/bike-images/:bikeId/single - Upload single image
    uploadSingleBikeImage: builder.mutation<
      UploadSingleImageResponse,
      { bikeId: string; formData: FormData }
    >({
      query: ({ bikeId, formData }) => ({
        url: `bike-images/${bikeId}/single`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { bikeId }) => [
        { type: "BikeImageList", id: bikeId },
      ],
    }),

    // PUT /api/bike-images/image/:imageId - Update image details
    updateBikeImage: builder.mutation<
      UpdateImageResponse,
      { imageId: string; data: { alt?: string; isPrimary?: boolean } }
    >({
      query: ({ imageId, data }) => ({
        url: `bike-images/image/${imageId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { imageId }) => {
        const tags = [{ type: "BikeImage" as const, id: imageId }];

        return tags;
      },
    }),

    // DELETE /api/bike-images/image/:imageId - Delete specific image
    deleteBikeImage: builder.mutation<DeleteImageResponse, string>({
      query: (imageId) => ({
        url: `bike-images/image/${imageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, imageId) => [
        { type: "BikeImage", id: imageId },
        { type: "BikeImageList", id: "LIST" },
      ],
    }),

    // DELETE /api/bike-images/:bikeId - Delete all images for a bike
    deleteAllBikeImages: builder.mutation<DeleteAllImagesResponse, string>({
      query: (bikeId) => ({
        url: `bike-images/${bikeId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, bikeId) => [
        { type: "BikeImageList", id: bikeId },
      ],
    }),

    // PUT /api/bike-images/:bikeId/primary/:imageId - Set primary image
    setPrimaryImage: builder.mutation<
      SetPrimaryImageResponse,
      { bikeId: string; imageId: string }
    >({
      query: ({ bikeId, imageId }) => ({
        url: `bike-images/${bikeId}/primary/${imageId}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, { bikeId }) => [
        { type: "BikeImageList", id: bikeId },
      ],
    }),
  }),
});

// Helper functions to create FormData for uploads
export const createImageUploadFormData = (
  files: File[],
  altTexts?: string[]
): FormData => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("images", file);
  });

  if (altTexts && altTexts.length > 0) {
    formData.append("altTexts", JSON.stringify(altTexts));
  }

  return formData;
};

export const createSingleImageUploadFormData = (
  file: File,
  alt?: string
): FormData => {
  const formData = new FormData();
  formData.append("image", file);

  if (alt) {
    formData.append("alt", alt);
  }

  return formData;
};

// Export hooks for usage in functional components
export const {
  useGetBikeImagesQuery,
  useUploadBikeImagesMutation,
  useUploadSingleBikeImageMutation,
  useUpdateBikeImageMutation,
  useDeleteBikeImageMutation,
  useDeleteAllBikeImagesMutation,
  useSetPrimaryImageMutation,

  // Lazy queries for manual triggering
  useLazyGetBikeImagesQuery,
} = bikeImageApi;

// Export the reducer
export default bikeImageApi.reducer;
