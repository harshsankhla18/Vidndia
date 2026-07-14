import axios from "axios"
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./token"

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/refresh-token")
    ) {
      originalRequest._retry = true

      try {
        const response = await api.post("/users/refresh-token")

        const newAccessToken =
          response.data?.data?.accessToken

        setAccessToken(newAccessToken)

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        clearAccessToken()

        window.location.href = "/"

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api