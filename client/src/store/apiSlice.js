import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials, setCredentials } from "./authSlice.js";

const API_URL = import.meta.env.VITE_API_URL || "";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.accessToken;
        if (token) headers.set("authorization", `Bearer ${token}`);
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401 && args.url !== "/api/auth/refresh") {
        const refreshResult = await rawBaseQuery({ url: "/api/auth/refresh", method: "POST" }, api, extraOptions);

        if (refreshResult.data) {
            api.dispatch(setCredentials(refreshResult.data));
            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(clearCredentials());
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["DiaryEntry", "ShortUrl"],
    endpoints: (builder) => ({
        register: builder.mutation({
            query: (body) => ({ url: "/api/auth/register", method: "POST", body }),
        }),
        login: builder.mutation({
            query: (body) => ({ url: "/api/auth/login", method: "POST", body }),
        }),
        refresh: builder.mutation({
            query: () => ({ url: "/api/auth/refresh", method: "POST" }),
        }),
        logout: builder.mutation({
            query: () => ({ url: "/api/auth/logout", method: "POST" }),
        }),
        getProfile: builder.query({
            query: () => "/api/auth/profile",
        }),
        updateProfile: builder.mutation({
            query: (body) => ({ url: "/api/auth/profile", method: "PATCH", body }),
        }),
        getEntries: builder.query({
            query: () => "/api/diary",
            providesTags: ["DiaryEntry"],
        }),
        addEntry: builder.mutation({
            query: (body) => ({ url: "/api/diary", method: "POST", body }),
            invalidatesTags: ["DiaryEntry"],
        }),
        updateEntry: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/api/diary/${id}`, method: "PATCH", body }),
            invalidatesTags: ["DiaryEntry"],
        }),
        deleteEntry: builder.mutation({
            query: (id) => ({ url: `/api/diary/${id}`, method: "DELETE" }),
            invalidatesTags: ["DiaryEntry"],
        }),
        getShortUrls: builder.query({
            query: () => "/api/shortener",
            providesTags: ["ShortUrl"],
        }),
        createShortUrl: builder.mutation({
            query: (body) => ({ url: "/api/shortener", method: "POST", body }),
            invalidatesTags: ["ShortUrl"],
        }),
        deleteShortUrl: builder.mutation({
            query: (id) => ({ url: `/api/shortener/${id}`, method: "DELETE" }),
            invalidatesTags: ["ShortUrl"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useRefreshMutation,
    useLogoutMutation,
    useGetProfileQuery,
    useUpdateProfileMutation,
    useGetEntriesQuery,
    useAddEntryMutation,
    useUpdateEntryMutation,
    useDeleteEntryMutation,
    useGetShortUrlsQuery,
    useCreateShortUrlMutation,
    useDeleteShortUrlMutation,
} = apiSlice;