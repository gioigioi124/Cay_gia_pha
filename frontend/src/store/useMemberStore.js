import { create } from "zustand";
import {
  getMembers,
  addMember,
  updateMember,
  deleteMember,
  addRelationship,
} from "@/services/memberService";

const useMemberStore = create((set) => ({
  members: [],
  selectedMember: null,
  isLoading: false,
  error: null,

  // Fetch all members of a tree
  fetchMembers: async (treeId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await getMembers(treeId);
      set({ members: result.data, isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch members",
        isLoading: false,
      });
    }
  },

  // Add member
  createMember: async (treeId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await addMember(treeId, data);
      set((state) => ({
        members: [...state.members, result.data],
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add member",
        isLoading: false,
      });
      throw error;
    }
  },

  // Update member
  editMember: async (treeId, memberId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await updateMember(treeId, memberId, data);
      set((state) => ({
        members: state.members.map((m) =>
          m._id === memberId ? result.data : m,
        ),
        isLoading: false,
      }));
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to update member",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete member
  removeMember: async (treeId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteMember(treeId, memberId);
      set((state) => ({
        members: state.members.filter((m) => m._id !== memberId),
        selectedMember: null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to delete member",
        isLoading: false,
      });
      throw error;
    }
  },

  // Add relationship
  createRelationship: async (treeId, memberId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await addRelationship(treeId, memberId, data);
      // Refresh members to get updated relationships
      const membersResult = await getMembers(treeId);
      set({ members: membersResult.data, isLoading: false });
      return result;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add relationship",
        isLoading: false,
      });
      throw error;
    }
  },

  // Select a member
  selectMember: (member) => set({ selectedMember: member }),

  // Clear selection
  clearSelection: () => set({ selectedMember: null }),
}));

export default useMemberStore;
