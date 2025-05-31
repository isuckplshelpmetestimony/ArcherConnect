import { Switch, Route, Redirect } from "wouter";
import { useAuth0 } from "@auth0/auth0-react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/hooks/use-user";
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
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { user, isLoading } = useUser();
  
  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (!user || !user.onboardingCompleted) {
    return <Redirect to="/onboarding" />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <UserProvider>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
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
    </UserProvider>
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
