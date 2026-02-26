import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/store/useAuthStore";

// Hook to protect routes - redirects to login if not authenticated
export const useAuth = () => {
  const { user, token, isLoading, fetchUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!user && token) {
      fetchUser();
    }
  }, [token, user, navigate, fetchUser]);

  return { user, isLoading, isAuthenticated: !!token, fetchUser };
};
