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

// Import API services
import { adminAuthApi } from "./services/adminApi";
import { bikeApi } from "./services/BikeSystemApi/bikeApi";
import { bikeImageApi } from "./services/BikeSystemApi/bikeImageApi";
//
import { branchApi } from "./services/branchApi";
import { branchManagerApi } from "./services/branchManagerApi";

//
import { visitorApi } from "./services/visitorApi";
//
import { customerApi } from "./services/customer/customerApi";
import { customerLoginApi } from "./services/customer/customerLoginApi";
import { customerVehicleApi } from "./services/customer/customerVehicleApi";

import { getApprovedApi } from "./services/customer/getApprovedApi";
//New
import { adminVehicleApi } from "./services/BikeSystemApi2/AdminVehicleApi";
import { stockConceptApi } from "./services/BikeSystemApi2/StockConceptApi";
import { vasApi } from "./services/BikeSystemApi2/VASApi";
//New
import { stockCustomerVehicleApi } from "./services/customer/stockCustomerVehicleApi";
import { phoneValidationApi } from "./services/customer/phoneValidateApi";
//
import { serviceBookingAdminApi } from "./services/BikeSystemApi2/ServiceBookAdminApi";
import { serviceBookingCustomerApi } from "./services/customer/ServiceBookCustomerApi";

// Create IndexedDB storage for redux-persist
const idbStorage = createIdbStorage("honda-golaghat-app-madebyilix");

// Configure persist options for our root reducer
const persistConfig = {
  key: "root",
  version: 1,
  storage: idbStorage,
  whitelist: [
    "auth",
    "customerAuth",
    "comparison",
    "ui",
    "getApproved",
    "serviceBooking",
  ],
  blacklist: [
    "adminAuthApi",
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
  setupProgress: persistedSetupProgressReducer,
  //
  serviceBooking: serviceBookingReducer,
  // API services
  [adminAuthApi.reducerPath]: adminAuthApi.reducer,
  //New
  [bikeApi.reducerPath]: bikeApi.reducer,
  [bikeImageApi.reducerPath]: bikeImageApi.reducer,
  // Need a fix
  [branchApi.reducerPath]: branchApi.reducer,
  [branchManagerApi.reducerPath]: branchManagerApi.reducer,
  [getApprovedApi.reducerPath]: getApprovedApi.reducer,
  //
  [visitorApi.reducerPath]: visitorApi.reducer,
  //new
  [customerApi.reducerPath]: customerApi.reducer,
  [customerLoginApi.reducerPath]: customerLoginApi.reducer,
  [customerVehicleApi.reducerPath]: customerVehicleApi.reducer,
  //New
  [adminVehicleApi.reducerPath]: adminVehicleApi.reducer,
  [stockConceptApi.reducerPath]: stockConceptApi.reducer,
  [vasApi.reducerPath]: vasApi.reducer,
  [stockCustomerVehicleApi.reducerPath]: stockCustomerVehicleApi.reducer,
  [phoneValidationApi.reducerPath]: phoneValidationApi.reducer,
  //New
  [serviceBookingAdminApi.reducerPath]: serviceBookingAdminApi.reducer,
  [serviceBookingCustomerApi.reducerPath]: serviceBookingCustomerApi.reducer,
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
      branchManagerApi.middleware,
      getApprovedApi.middleware,
      customerApi.middleware,
      customerLoginApi.middleware,
      customerVehicleApi.middleware,
      visitorApi.middleware,
      adminVehicleApi.middleware,
      stockConceptApi.middleware,
      vasApi.middleware,
      stockCustomerVehicleApi.middleware,
      phoneValidationApi.middleware,
      serviceBookingAdminApi.middleware,
      serviceBookingCustomerApi.middleware
    ),
});

// Create persistor for use with PersistGate
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
