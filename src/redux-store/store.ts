// src/redux-store/store.ts
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
import bikesReducer from "./slices/bikesSlice";
import scootyReducer from "./slices/scootySlice";
import branchReducer from "./slices/branchSlice";
import comparisonReducer from "./slices/comparisonSlice";
import uiReducer from "./slices/uiSlice";
import formReducer from "./slices/formSlice";
import getApprovedReducer from "./slices/getApprovedSlice";
//new
import customerAuthReducer from "./slices/customer/customerAuthSlice";

// Import API services
import { adminAuthApi } from "./services/adminApi";
import { bikesApi } from "./services/bikeApi";
import { scootyApi } from "./services/scootyApi";
import { branchApi } from "./services/branchApi";
import { staffApi } from "./services/staffApi";
import { branchManagerApi } from "./services/branchManagerApi";
import { getApprovedApi } from "./services/getApprovedApi";
//
import { customerApi } from "./services/customer/customerApi";
import { customerDashboardApi } from "./services/customer/customerDashApi";

// Create IndexedDB storage for redux-persist
const idbStorage = createIdbStorage("honda-golaghat-app-madebyilix");

// Configure persist options for our root reducer
const persistConfig = {
  key: "root",
  version: 1,
  storage: idbStorage,
  whitelist: ["auth", "customerAuth", "comparison", "ui", "getApproved"],
  blacklist: [
    "adminAuthApi",
    "bikesApi",
    "scootyApi",
    "branchApi",
    "staffApi",
    "branchManagerApi",
    "getApprovedApi",
  ], // Don't persist API cache
};

const rootReducer = combineReducers({
  auth: authReducer,
  bikes: bikesReducer,
  scooty: scootyReducer,
  branch: branchReducer,
  comparison: comparisonReducer,
  ui: uiReducer,
  form: formReducer,
  getApproved: getApprovedReducer,
  //update
  customerAuth: customerAuthReducer,
  // API services
  [adminAuthApi.reducerPath]: adminAuthApi.reducer,
  [bikesApi.reducerPath]: bikesApi.reducer,
  [scootyApi.reducerPath]: scootyApi.reducer,
  [branchApi.reducerPath]: branchApi.reducer,
  [staffApi.reducerPath]: staffApi.reducer,
  [branchManagerApi.reducerPath]: branchManagerApi.reducer,
  [getApprovedApi.reducerPath]: getApprovedApi.reducer,
  //new
  [customerApi.reducerPath]: customerApi.reducer,
  [customerDashboardApi.reducerPath]: customerDashboardApi.reducer,
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
    }).concat(
      // Add API middleware
      adminAuthApi.middleware,
      bikesApi.middleware,
      scootyApi.middleware,
      branchApi.middleware,
      staffApi.middleware,
      branchManagerApi.middleware,
      getApprovedApi.middleware,
      customerApi.middleware,
      customerDashboardApi.middleware
    ),
});

// Create persistor for use with PersistGate
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
