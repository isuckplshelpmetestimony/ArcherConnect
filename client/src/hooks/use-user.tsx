import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserProfile } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface UserContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user exists in localStorage
    const savedUser = localStorage.getItem("archerconnect_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem("archerconnect_user");
      }
    }
    setIsLoading(false);
  }, []);

  const updateUser = async (userData: Partial<UserProfile>) => {
    if (!user?.id) {
      // Create new user if no ID exists
      try {
        const response = await apiRequest("POST", "/api/user", userData);
        const newUser = await response.json();
        setUser(newUser);
        localStorage.setItem("archerconnect_user", JSON.stringify(newUser));
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    } else {
      // Update existing user
      try {
        const response = await apiRequest("PATCH", `/api/user/${user.id}`, userData);
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem("campusconnect_user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
