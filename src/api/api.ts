import axios from "axios";
import { useAuthStore } from "../lib/stores/authStore";
import { useUserStore } from "../lib/stores/userStore";
import { useOrganizationStore } from "../lib/stores/organizationsStore";

const api = axios.create({
  baseURL: "https://api.smartrack.zeluk.net",
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      // Check if we are already on the login page to prevent loops
      if (window.location.pathname !== "/login") {
        originalRequest._retry = true; // Mark to prevent infinite retry loops if somehow this logic fails

        const { logoutUser } = useAuthStore.getState();
        const { clearCurrentUser } = useUserStore.getState();
        const { clearSelectedOrganization } = useOrganizationStore.getState();

        await logoutUser();
        clearCurrentUser();
        clearSelectedOrganization();

        // Force redirect to login page
        // Using window.location.href for a hard redirect outside of React Router's context
        window.location.href = "/login";
        
        // Optionally, return a resolved promise to prevent the original call from throwing an error
        // This might be useful if the caller doesn't expect an error after this handler.
        return Promise.resolve({ data: null }); 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
