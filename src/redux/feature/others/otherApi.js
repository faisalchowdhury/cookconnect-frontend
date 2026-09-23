import { baseApi } from "../../api/baseApi";

const othersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveBanner: builder.query({
      query: () => ({
        url: "/banner/active",
        method: "GET",
      }),
    }),

 


  }),
});

export const {
  useGetActiveBannerQuery,

} = othersApi;
