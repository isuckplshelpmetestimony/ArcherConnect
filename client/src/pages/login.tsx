import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogIn } from "lucide-react";

export default function Login() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Welcome to ArcherConnect
          </CardTitle>
          <CardDescription>
            Your campus engagement platform for announcements, events, and student life
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <LogIn className="w-4 h-4 mr-2" />
            {isLoading ? "Signing in..." : "Sign in to Continue"}
          </Button>
          <p className="text-sm text-gray-600 text-center">
            Connect with your campus community and stay updated with the latest announcements
          </p>
        </CardContent>
      </Card>
    </div>
  );
}