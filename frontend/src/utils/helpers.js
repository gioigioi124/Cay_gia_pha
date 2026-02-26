import dayjs from "dayjs";

// Format date for display
export const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

// Format date for input fields
export const formatDateForInput = (date) => {
  if (!date) return "";
  return dayjs(date).format("YYYY-MM-DD");
};

// Calculate age
export const calculateAge = (dateOfBirth, dateOfDeath = null) => {
  if (!dateOfBirth) return null;
  const endDate = dateOfDeath ? dayjs(dateOfDeath) : dayjs();
  return endDate.diff(dayjs(dateOfBirth), "year");
};

// Get gender label in Vietnamese
export const getGenderLabel = (gender) => {
  const labels = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  return labels[gender] || gender;
};

// Get relationship label in Vietnamese
export const getRelationshipLabel = (type) => {
  const labels = {
    parent: "Cha/Mẹ",
    child: "Con",
    spouse: "Vợ/Chồng",
  };
  return labels[type] || type;
};
