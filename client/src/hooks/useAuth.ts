import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const userId = localStorage.getItem("user_id");
      
      if (token && userId) {
        try {
          const response = await fetch("/api/auth/user", {
            headers: {
              'Authorization': `Bearer ${token}`,
              'x-user-id': userId,
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_id");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_id");
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
  };
}