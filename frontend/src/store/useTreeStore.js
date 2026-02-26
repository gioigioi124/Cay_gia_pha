import { create } from "zustand";
import {
  getTrees,
  createTree,
  getTree,
  updateTree,
  deleteTree,
} from "@/services/treeService";

const useTreeStore = create((set) => ({
  trees: [],
  currentTree: null,
  isLoading: false,
  error: null,

  // Fetch all trees
  fetchTrees: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await getTrees();
      set({ trees: result.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch trees",
        isLoading: false,
      });
    }
  },

  // Fetch single tree
  fetchTree: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getTree(id);
      set({ currentTree: result.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch tree",
        isLoading: false,
      });
    }
  },

  // Create tree
  addTree: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await createTree(data);
      set((state) => ({
        trees: [...state.trees, result.data],
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to create tree",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update tree
  editTree: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateTree(id, data);
      set((state) => ({
        trees: state.trees.map((t) => (t._id === id ? result.data : t)),
        currentTree: result.data,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update tree",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete tree
  removeTree: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTree(id);
      set((state) => ({
        trees: state.trees.filter((t) => t._id !== id),
        currentTree: null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete tree",
        isLoading: false,
      });
      throw error;
    }
  },

  // Clear current tree
  clearCurrentTree: () => set({ currentTree: null }),

  // Alias: updateTree = editTree (for compatibility)
  updateTree: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateTree(id, data);
      set((state) => ({
        trees: state.trees.map((t) => (t._id === id ? result.data : t)),
        currentTree: result.data,
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update tree",
        isLoading: false,
      });
      throw error;
    }
  },
}));

export default useTreeStore;
