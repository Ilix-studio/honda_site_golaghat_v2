import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface Scooty {
  id: string;
  modelName: string;
  category: string;
  price: number;
  engine: string;
  power: string;
  features: string[];
  colors: string[];
  images: string[];
  year: number;
  inStock: boolean;
  quantity: number;
  branch: string;
}

export interface ScootyState {
  scooties: Scooty[];
  loading: boolean;
  error: string | null;
}

const initialState: ScootyState = {
  scooties: [],
  loading: false,
  error: null,
};

const scootySlice = createSlice({
  name: "scooty",
  initialState,
  reducers: {
    setScooties: (state, action: PayloadAction<Scooty[]>) => {
      state.scooties = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setScooties, setLoading, setError } = scootySlice.actions;

export const selectScooties = (state: RootState) => state.scooty.scooties;
export const selectScootiesLoading = (state: RootState) => state.scooty.loading;
export const selectScootiesError = (state: RootState) => state.scooty.error;

export default scootySlice.reducer;
