import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice.js";
import authReducer from "./authSlice.js";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});