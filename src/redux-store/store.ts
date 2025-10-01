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
//new
import customerAuthReducer from "./slices/customer/customerAuthSlice";

// Import API services
import { adminAuthApi } from "./services/adminApi";
import { bikeApi } from "./services/BikeSystemApi/bikeApi";
import { bikeImageApi } from "./services/BikeSystemApi/bikeImageApi";

import { branchApi } from "./services/branchApi";
import { staffApi } from "./services/staffApi";
import { branchManagerApi } from "./services/branchManagerApi";

//
import { visitorApi } from "./services/visitorApi";
//
import { customerApi } from "./services/customer/customerApi";
import { customerLoginApi } from "./services/customer/customerLoginApi";

import { getApprovedApi } from "./services/customer/getApprovedApi";

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
  //
  bikes: bikesReducer,
  bikeImages: bikeImageReducer,

  branch: branchReducer,
  comparison: comparisonReducer,
  ui: uiReducer,
  form: formReducer,
  getApproved: getApprovedReducer,
  //update
  customerAuth: customerAuthReducer,
  // API services
  [adminAuthApi.reducerPath]: adminAuthApi.reducer,
  //New
  [bikeApi.reducerPath]: bikeApi.reducer,
  [bikeImageApi.reducerPath]: bikeImageApi.reducer,
  // Need a fix
  [branchApi.reducerPath]: branchApi.reducer,
  [staffApi.reducerPath]: staffApi.reducer,
  [branchManagerApi.reducerPath]: branchManagerApi.reducer,
  [getApprovedApi.reducerPath]: getApprovedApi.reducer,
  //
  [visitorApi.reducerPath]: visitorApi.reducer,
  //new
  [customerApi.reducerPath]: customerApi.reducer,
  [customerLoginApi.reducerPath]: customerLoginApi.reducer,
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
      bikeApi.middleware,
      bikeImageApi.middleware,
      branchApi.middleware,
      staffApi.middleware,
      branchManagerApi.middleware,
      getApprovedApi.middleware,
      customerApi.middleware,
      customerLoginApi.middleware,
      visitorApi.middleware
    ),
});

// Create persistor for use with PersistGate
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
