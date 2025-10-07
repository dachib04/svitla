import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:5000"
      : "http://dataroom-env.eba-2maibhrb.eu-north-1.elasticbeanstalk.com"),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;
