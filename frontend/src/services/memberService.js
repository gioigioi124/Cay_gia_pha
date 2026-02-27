import api from "./api";

// Get all members of a tree
export const getMembers = async (treeId) => {
  const response = await api.get(`/trees/${treeId}/members`);
  return response.data;
};

// Add a member
export const addMember = async (treeId, data) => {
  const response = await api.post(`/trees/${treeId}/members`, data);
  return response.data;
};

// Get single member
export const getMember = async (treeId, memberId) => {
  const response = await api.get(`/trees/${treeId}/members/${memberId}`);
  return response.data;
};

// Update member
export const updateMember = async (treeId, memberId, data) => {
  const response = await api.put(`/trees/${treeId}/members/${memberId}`, data);
  return response.data;
};

// Delete member
export const deleteMember = async (treeId, memberId) => {
  const response = await api.delete(`/trees/${treeId}/members/${memberId}`);
  return response.data;
};

// Add relationship
export const addRelationship = async (treeId, memberId, data) => {
  const response = await api.post(
    `/trees/${treeId}/members/${memberId}/relationship`,
    data,
  );
  return response.data;
};

// Remove relationship
export const removeRelationship = async (treeId, memberId, relatedMemberId) => {
  const response = await api.delete(
    `/trees/${treeId}/members/${memberId}/relationship/${relatedMemberId}`,
  );
  return response.data;
};
