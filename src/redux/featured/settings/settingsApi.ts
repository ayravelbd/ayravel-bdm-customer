import { baseApi } from "@/redux/api/baseApi";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetSettingsQuery } = settingsApi;
