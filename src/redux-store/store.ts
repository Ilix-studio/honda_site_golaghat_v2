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

import authReducer from "./slices/authSlice";
import bikesReducer from "./slices/bikesSlice";
import scootyReducer from "./slices/scootySlice";
import branchReducer from "./slices/branchSlice";
import comparisonReducer from "./slices/comparisonSlice";
import uiReducer from "./slices/uiSlice";

// Create IndexedDB storage for redux-persist
const idbStorage = createIdbStorage("honda-golaghat-app-madebyilix");

// Configure persist options for our root reducer
const persistConfig = {
  key: "root",
  version: 1,
  storage: idbStorage,
  whitelist: ["auth"], // Only persist auth state to avoid persisting API cache
};

const rootReducer = combineReducers({
  auth: authReducer,
  bikes: bikesReducer,
  scooty: scootyReducer,
  branch: branchReducer,
  comparison: comparisonReducer,
  ui: uiReducer,
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
    }).concat(),
});

// Create persistor for use with PersistGate
export const persistor = persistStore(store);

// Setup listeners for automatic refetching
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
