// src/redux-store/services/configApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";

export interface BikeModel {
  id: string;
  modelName: string;
  category: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  price: string;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: string;
}

export interface ServiceLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface ConfigResponse<T> {
  success: boolean;
  data: T;
}

export const configApi = createApi({
  reducerPath: "configApi",
  baseQuery,
  tagTypes: ["Config"],
  endpoints: (builder) => ({
    // GET /api/config/bike-models
    getBikeModels: builder.query<ConfigResponse<BikeModel[]>, void>({
      query: () => "/api/config/bike-models",
      providesTags: ["Config"],
    }),

    // GET /api/config/categories
    getCategories: builder.query<ConfigResponse<Category[]>, void>({
      query: () => "/api/config/categories",
      providesTags: ["Config"],
    }),

    // GET /api/config/service-types
    getServiceTypes: builder.query<ConfigResponse<ServiceType[]>, void>({
      query: () => "/api/config/service-types",
      providesTags: ["Config"],
    }),

    // GET /api/config/additional-services
    getAdditionalServices: builder.query<
      ConfigResponse<AdditionalService[]>,
      void
    >({
      query: () => "/api/config/additional-services",
      providesTags: ["Config"],
    }),

    // GET /api/config/service-locations
    getServiceLocations: builder.query<ConfigResponse<ServiceLocation[]>, void>(
      {
        query: () => "/api/config/service-locations",
        providesTags: ["Config"],
      }
    ),

    // GET /api/config/time-slots
    getTimeSlots: builder.query<ConfigResponse<string[]>, void>({
      query: () => "/api/config/time-slots",
      providesTags: ["Config"],
    }),

    // GET /api/config/features
    getAvailableFeatures: builder.query<ConfigResponse<string[]>, void>({
      query: () => "/api/config/features",
      providesTags: ["Config"],
    }),
  }),
});

export const {
  useGetBikeModelsQuery,
  useGetCategoriesQuery,
  useGetServiceTypesQuery,
  useGetAdditionalServicesQuery,
  useGetServiceLocationsQuery,
  useGetTimeSlotsQuery,
  useGetAvailableFeaturesQuery,
} = configApi;
