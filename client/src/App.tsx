import { useState, useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Announcements from "@/pages/announcements";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import Groups from "@/pages/groups";
import Events from "@/pages/events";
import Resources from "@/pages/resources";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  if (user && !user.onboardingCompleted) {
    return <Onboarding />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/announcements">
        <ProtectedRoute>
          <Announcements />
        </ProtectedRoute>
      </Route>
      <Route path="/notifications">
        <ProtectedRoute>
          <Notifications />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      </Route>
      <Route path="/groups">
        <ProtectedRoute>
          <Groups />
        </ProtectedRoute>
      </Route>
      <Route path="/events">
        <ProtectedRoute>
          <Events />
        </ProtectedRoute>
      </Route>
      <Route path="/resources">
        <ProtectedRoute>
          <Resources />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
