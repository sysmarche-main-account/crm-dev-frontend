import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import leadReducer from "@/lib/slices/leadSlice";
import userReducer from "@/lib/slices/userSlice";
import followupReducer from "@/lib/slices/followupSlice";
import columnReducer from "@/lib/slices/columnSlice";
import dashboardReducer from "@/lib/slices/dashboardSlice";
// import bearerReducer from "@/lib/slices/bearerSlice";
import storage from "./customStorage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "dashboard"], // only 'persisted' will be persisted
};

const rootReducer = combineReducers({
  lead: leadReducer,
  user: userReducer,
  followup: followupReducer,
  column: columnReducer,
  dashboard: dashboardReducer,
  // bearer: bearerReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
const isDev = process.env.NODE_ENV === "development";

export const store = configureStore({
  reducer: persistedReducer, // The root reducer, enhanced with Redux Persist
  devTools: isDev, // Enable DevTools only in development
  // devTools: process.env.NODE_ENV !== "production", // Enable DevTools only in development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Redux Persist actions as they may include non-serializable data
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
