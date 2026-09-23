import { baseApi } from "../../api/baseApi";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (userInfo) => ({
        url: "/user/auth/login",
        method: "POST",
        body: userInfo,
      }),
    }),
    signUp: builder.mutation({
      query: (userInfo) => ({
        url: "/user/create",
        method: "POST",
        body: userInfo,
      }),
    }),
    getOtp: builder.mutation({
      query: (userInfo) => ({
        url: "/user/auth/forget-password/send-otp",
        method: "POST",
        body:userInfo,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (userInfo) => ({
        url: "/user/auth/verify-otp",
        method: "POST",
        body:userInfo,
      }),
    }),
    loginWithGoogle: builder.query({
      query: () => ({
        url: "/user/auth/google",
        method: "GET",  
        // body: userInfo,
      }),
    }),
    loginWithFacebook: builder.query({
      query: () => ({
        url: "/user/auth/facebook",
        method: "GET",  
        // body: userInfo,
      }),
    }),
    getSpecefiqUser: builder.query({
      query: (id) => ({
        url: `/user/retrive/${id}`,
        method: "GET",  
        // body: userInfo,
      }),
    }),
    updateSpecefiqUser: builder.mutation({
      query: ({id,userInfo}) => ({
        url: `/user/update/${id}`,
        method: "PATCH",  
        body: userInfo,
      }),
        invalidatesTags: ['user'],
    }),
    changePass: builder.mutation({
      query: (info) => ({
        url: `user/auth/change-password`,
        method: "POST",  
        body: info,
      }),
        invalidatesTags: ['user'],
    }),


  }),
});   

export const { useLoginMutation,useSignUpMutation,useLazyLoginWithGoogleQuery,useLazyLoginWithFacebookQuery,useGetSpecefiqUserQuery,useUpdateSpecefiqUserMutation,useChangePassMutation,useGetOtpMutation,useVerifyOtpMutation} = authApi;
