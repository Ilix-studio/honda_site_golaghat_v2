import {
  createApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../lib/apiConfig";
import { customerBaseQuery } from "../../lib/customerApiConfigs";

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if ((extraOptions as any)?.isCustomer) {
    return customerBaseQuery(args, api, extraOptions);
  }
  return baseQuery(args, api, extraOptions);
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: dynamicBaseQuery,
  tagTypes: [
    "Bike",
    "BikeList",
    "Branch",
    "BranchManager",
    "VisitorCount",
    "VisitorStats",
    "User",
    "Admin",
    "Customer",
    "Vehicle",
    "Stock",
    "ServiceBooking",
    "SetupProgress",
    "Comparison",
    "BikeImage",
    "BikeImageList",
    "StockConcept",
    "AdminBooking",
    "AdminStats",
    "UpcomingAppointments",
    "CustomerVehicle",
    "VehicleStats",
    "ServiceHistory",
    "CustomerStockVehicle",
    "CSVStock",
    "CSVStockList",
    "CSVBatch",
    "GetApproved",
    "GetApprovedStats",
    "ScanFleetProfile",
    "VAS",
    "CustomerActiveService",
    "BookingStats",
    "Availability",
    "ScanFleetActivation",
  ],
  endpoints: () => ({}),
});
