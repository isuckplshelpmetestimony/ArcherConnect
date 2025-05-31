import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Briefcase, FlaskConical, Plane } from "lucide-react";
import type { Notification } from "@shared/schema";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Notifications() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: [`/api/notifications/${user?.id || 1}`],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest("PATCH", `/api/notifications/${notificationId}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${user?.id || 1}`] });
      toast({
        title: "Notification marked as read",
      });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", `/api/notifications/user/${user?.id || 1}/read-all`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/notifications/${user?.id || 1}`] });
      toast({
        title: "All notifications cleared",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "deadline": return <GraduationCap className="h-5 w-5 text-primary" />;
      case "event": return <Briefcase className="h-5 w-5 text-green-600" />;
      case "research": return <FlaskConical className="h-5 w-5 text-blue-600" />;
      case "opportunity": return <Plane className="h-5 w-5 text-purple-600" />;
      default: return <GraduationCap className="h-5 w-5 text-primary" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-3">
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
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-600">Stay on top of important updates and deadlines.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => clearAllMutation.mutate()}
            disabled={clearAllMutation.isPending}
          >
            {clearAllMutation.isPending ? "Clearing..." : "Clear All"}
          </Button>
        </div>

        <div className="space-y-3">
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card key={notification.id} className={`card-hover ${notification.read ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <p className="text-xs text-gray-400">
                            {new Date(notification.date).toLocaleDateString()}
                          </p>
                          {notification.deadline && (
                            <p className="text-xs text-gray-400">
                              Deadline: {new Date(notification.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No notifications to display.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
