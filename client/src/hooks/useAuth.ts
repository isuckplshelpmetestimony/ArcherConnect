import { useState, useEffect, createContext, useContext } from "react";

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_id");
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_id");
    setUser(null);
    window.location.href = "/";
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshAuth,
  };
}