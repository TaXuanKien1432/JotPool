import axios, { type AxiosResponse } from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || error.message || "Unknown API error";
        return Promise.reject(new Error(message));
    }
);

export interface ApiFetchOtions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
}

export async function apiFetch<T>(path: string, options: ApiFetchOtions): Promise<T> {
    const {method, body} = options;
    const response: AxiosResponse<T> = await api.request<T>({
        url: path,
        method,
        data: body,
    });
    return response.data;
}