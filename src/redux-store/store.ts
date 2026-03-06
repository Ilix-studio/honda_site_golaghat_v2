import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import createIdbStorage from "redux-persist-indexeddb-storage";

// Import reducers
import authReducer from "./slices/authSlice";
//New
import bikesReducer from "./slices/BikeSystemSlice/bikesSlice";
import bikeImageReducer from "./slices/BikeSystemSlice/bikeImageSlice";

import branchReducer from "./slices/branchSlice";
import comparisonReducer from "./slices/comparisonSlice";
import uiReducer from "./slices/uiSlice";
import formReducer from "./slices/formSlice";
import getApprovedReducer from "./slices/getApprovedSlice";
//
import serviceBookingReducer from "./slices/bookingServiceSlice";
//new
import customerAuthReducer from "./slices/customer/customerAuthSlice";
//
import { persistedSetupProgressReducer } from "./slices/setupProgressSlice";

import { apiSlice } from "./services/apiSlice";

// Create IndexedDB storage for redux-persist
const idbStorage = createIdbStorage("honda-golaghat-app-madebyilix");

// Configure persist options for our root reducer
const persistConfig = {
  key: "root",
  version: 1,
  storage: idbStorage,
  whitelist: ["auth", "customerAuth", "comparison", "ui"],
  blacklist: ["api"], // Don't persist API cache
};

const rootReducer = combineReducers({
  auth: authReducer,
  bikes: bikesReducer,
  bikeImages: bikeImageReducer,
  branch: branchReducer,
  comparison: comparisonReducer,
  ui: uiReducer,
  form: formReducer,
  getApproved: getApprovedReducer,
  customerAuth: customerAuthReducer,
  setupProgress: persistedSetupProgressReducer,
  serviceBooking: serviceBookingReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Redux Persist middleware needs these actions to be ignored
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});

// Create persistor for use with PersistGate
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
