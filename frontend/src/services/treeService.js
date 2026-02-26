import api from "./api";

// Get all trees for current user
export const getTrees = async () => {
  const response = await api.get("/trees");
  return response.data;
};

// Create a new tree
export const createTree = async (data) => {
  const response = await api.post("/trees", data);
  return response.data;
};

// Get single tree by ID
export const getTree = async (id) => {
  const response = await api.get(`/trees/${id}`);
  return response.data;
};

// Update tree
export const updateTree = async (id, data) => {
  const response = await api.put(`/trees/${id}`, data);
  return response.data;
};

// Delete tree
export const deleteTree = async (id) => {
  const response = await api.delete(`/trees/${id}`);
  return response.data;
};

// Share tree
export const shareTree = async (id, data) => {
  const response = await api.post(`/trees/${id}/share`, data);
  return response.data;
};
