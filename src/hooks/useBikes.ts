import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./redux";

import {
  setBikes,
  setLoading,
  setError,
  selectBikes,
  selectBikesLoading,
  selectBikesError,
  selectBikesFilters,
  selectBikesSortBy,
  selectBikesPagination,
} from "../redux-store/slices/BikeSystemSlice/bikesSlice";
import { useGetBikesQuery } from "@/redux-store/services/BikeSystemApi/bikeApi";

export const useBikes = () => {
  const dispatch = useAppDispatch();
  const bikes = useAppSelector(selectBikes);
  const loading = useAppSelector(selectBikesLoading);
  const error = useAppSelector(selectBikesError);
  const filters = useAppSelector(selectBikesFilters);
  const sortBy = useAppSelector(selectBikesSortBy);
  const pagination = useAppSelector(selectBikesPagination);

  // Build query parameters from Redux state
  const queryParams = {
    ...filters,
    sortBy,
    ...pagination,
  };

  const {
    data: bikesResponse,
    error: apiError,
    isLoading,
    refetch,
  } = useGetBikesQuery(queryParams);

  useEffect(() => {
    dispatch(setLoading(isLoading));
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (bikesResponse?.success) {
      dispatch(setBikes(bikesResponse.data));
      dispatch(setError(null));
    }
  }, [bikesResponse, dispatch]);

  useEffect(() => {
    if (apiError) {
      dispatch(setError("Failed to fetch bikes"));
    }
  }, [apiError, dispatch]);

  return {
    bikes,
    loading,
    error,
    filters,
    sortBy,
    pagination,
    refetch,
  };
};
