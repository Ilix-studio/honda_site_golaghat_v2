import { apiSlice } from "../apiSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BikePriceRow {
  _id: string;
  modelName: string;
  year: number;
  exShowroomPrice: number;
  onRoadPrice: number;
  variants: { name: string; priceAdjustment: number }[];
  updatedAt?: string;
}

export type PriceAdjustMode = "percent" | "amount";

export interface BikePricesResponse {
  success: boolean;
  count: number;
  data: BikePriceRow[];
}

export interface UpdateBikePriceResponse {
  success: boolean;
  message: string;
  data: BikePriceRow;
}

export interface BulkAdjustBikePricesResponse {
  success: boolean;
  message: string;
  data: {
    mode: PriceAdjustMode;
    value: number;
    modified: number;
    changes: { _id: string; modelName: string; year: number; from: number; to: number }[];
  };
}

/**
 * New price after a bulk adjustment, rounded to whole rupees. Mirrors
 * adjustedPrice in server3's bikePrices.controller.ts so the preview shows
 * exactly what the server will write.
 */
export const adjustedPrice = (
  price: number,
  mode: PriceAdjustMode,
  value: number,
): number =>
  Math.round(mode === "percent" ? price * (1 + value / 100) : price + value);

// ─── Endpoints ───────────────────────────────────────────────────────────────

// A price change shows up everywhere a bike is listed, so writes invalidate
// every Bike / BikeList tag rather than just this page's list.
export const bikePriceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/bike-prices
    getBikePrices: builder.query<BikePricesResponse, void>({
      query: () => "/bike-prices",
      providesTags: [{ type: "BikeList", id: "PRICES" }],
    }),

    // PATCH /api/bike-prices/:id
    updateBikePrice: builder.mutation<
      UpdateBikePriceResponse,
      { id: string; exShowroomPrice: number }
    >({
      query: ({ id, exShowroomPrice }) => ({
        url: `/bike-prices/${id}`,
        method: "PATCH",
        body: { exShowroomPrice },
      }),
      invalidatesTags: ["Bike", "BikeList"],
    }),

    // POST /api/bike-prices/bulk-adjust
    bulkAdjustBikePrices: builder.mutation<
      BulkAdjustBikePricesResponse,
      { mode: PriceAdjustMode; value: number }
    >({
      query: (body) => ({
        url: "/bike-prices/bulk-adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bike", "BikeList"],
    }),
  }),
});

export const {
  useGetBikePricesQuery,
  useUpdateBikePriceMutation,
  useBulkAdjustBikePricesMutation,
} = bikePriceApi;
