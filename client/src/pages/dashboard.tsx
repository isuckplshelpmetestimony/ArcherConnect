import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MainLayout } from "@/components/layout/main-layout";
import { Megaphone, Calendar, Users, Book, Clock, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Announcement, Event, Notification } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${user?.id || 1}`],
    enabled: !!user,
  });

  const { data: favoriteAnnouncements, isLoading: favoritesLoading } = useQuery<Announcement[]>({
    queryKey: [`/api/user/${user?.id || 1}/favorites`],
    enabled: !!user,
  });

  const stats = {
    announcements: announcements?.length || 0,
    events: events?.filter(e => new Date(e.date) > new Date()).length || 0,
    groups: 0,
    resources: 23,
  };

  const recentAnnouncements = announcements?.slice(0, 3) || [];
  const upcomingDeadlines = notifications?.filter(n => n.deadline && new Date(n.deadline) > new Date()).slice(0, 2) || [];

  if (announcementsLoading || eventsLoading) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Welcome back! Here's what's happening on campus.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Megaphone className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Announcements</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.announcements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.events}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">My Groups</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.groups}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Book className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resources</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.resources}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Favorite Announcements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {favoritesLoading ? (
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : favoriteAnnouncements && favoriteAnnouncements.length > 0 ? (
                  favoriteAnnouncements.slice(0, 5).map((announcement) => (
                    <div key={announcement.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
                      <Megaphone className="h-5 w-5 text-primary mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{announcement.content.substring(0, 100)}...</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(announcement.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No favorite announcements yet. Star announcements to see them here!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
