import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api/v1",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Accept", "application/json");

    // ✅ Get token from Redux store
    const token = getState().auth?.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  // credentials: "include", // Optional, if you want to send cookies
});

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQuery,
  tagTypes: ["user"],
  endpoints: () => ({}),
});
