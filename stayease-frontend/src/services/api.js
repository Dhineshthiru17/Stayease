import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

const API = axios.create({
  baseURL: normalizedBaseUrl
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;
