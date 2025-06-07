import { useAppDispatch, useAppSelector } from "./redux";
import {
  addBikeToComparison,
  removeBikeFromComparison,
  replaceBikeInComparison,
  clearComparison,
  selectComparisonBikes,
  selectMaxBikes,
  selectViewport,
} from "../redux-store/slices/comparisonSlice";

export const useComparison = () => {
  const dispatch = useAppDispatch();
  const selectedBikeIds = useAppSelector(selectComparisonBikes);
  const maxBikes = useAppSelector(selectMaxBikes);
  const viewport = useAppSelector(selectViewport);

  const addBike = (bikeId: string) => {
    if (
      selectedBikeIds.length < maxBikes &&
      !selectedBikeIds.includes(bikeId)
    ) {
      dispatch(addBikeToComparison(bikeId));
    }
  };

  const removeBike = (bikeId: string) => {
    dispatch(removeBikeFromComparison(bikeId));
  };

  const replaceBike = (oldId: string, newId: string) => {
    dispatch(replaceBikeInComparison({ oldId, newId }));
  };

  const clearAll = () => {
    dispatch(clearComparison());
  };

  const canAddMore = selectedBikeIds.length < maxBikes;
  const isEmpty = selectedBikeIds.length === 0;

  return {
    selectedBikeIds,
    maxBikes,
    viewport,
    addBike,
    removeBike,
    replaceBike,
    clearAll,
    canAddMore,
    isEmpty,
  };
};
