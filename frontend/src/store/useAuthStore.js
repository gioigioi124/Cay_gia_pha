import { create } from "zustand";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
} from "@/services/authService";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
  error: null,

  // Register
  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await registerUser(data);
      const { user, token } = result.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isLoading: false });
      return result;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Login
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await loginUser(data);
      const { user, token } = result.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      set({ user, token, isLoading: false });
      return result;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await logoutUser();
    } catch {
      // ignore errors
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null });
  },

  // Get current user
  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const result = await getCurrentUser();
      set({ user: result.data, isLoading: false });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, token: null, isLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
