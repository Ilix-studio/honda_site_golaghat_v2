import { customerBaseQuery } from "@/lib/customerApiConfigs";

import { createApi } from "@reduxjs/toolkit/query/react";

export const vehicleInfoApi = createApi({
  reducerPath: "VehicleInfoApi",
  baseQuery: customerBaseQuery,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    // Create customer profile
    createProfile: builder.mutation({
      query: (data) => ({
        url: "/customer-profile/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});
