import api from "./api";

/**
 * Upload avatar cho thành viên
 * @param {string} memberId
 * @param {File} file
 * @returns {Promise<{avatarUrl: string}>}
 */
export const uploadMemberAvatar = async (memberId, file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post(
    `/upload/member-avatar/${memberId}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

/**
 * Upload avatar cho user (profile)
 * @param {File} file
 */
export const uploadUserAvatar = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);
  const response = await api.post("/upload/user-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
