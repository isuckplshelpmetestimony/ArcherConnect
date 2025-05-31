import { Link } from "wouter";
import { GraduationCap, Users, Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <GraduationCap className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">ArcherConnect</h1>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Connect with Your Campus Community
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with personalized announcements, discover events, join study groups, 
            and access academic resources tailored to your interests at De La Salle University.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Smart Announcements</h3>
              <p className="text-sm text-gray-600">
                Get personalized campus announcements based on your major and interests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Campus Events</h3>
              <p className="text-sm text-gray-600">
                Discover and register for events, workshops, and activities on campus
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Study Groups</h3>
              <p className="text-sm text-gray-600">
                Find and join study groups for your courses and academic interests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Academic Resources</h3>
              <p className="text-sm text-gray-600">
                Access study materials, academic tools, and department-specific resources
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Get Started
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Already have an account? 
            <Link href="/login" className="text-green-600 hover:text-green-700 ml-1">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}