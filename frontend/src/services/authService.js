import api from "./api";

// Register
export const registerUser = async (data) => {
  const response = await api.post("/auth/register", data);
  return response.data;
};

// Login
export const loginUser = async (data) => {
  const response = await api.post("/auth/login", data);
  return response.data;
};

// Logout
export const logoutUser = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// Change password
export const changePassword = async (data) => {
  const response = await api.put("/auth/change-password", data);
  return response.data;
};
