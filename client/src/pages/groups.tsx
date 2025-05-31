import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Palette, Scale, Users, Heart, Music } from "lucide-react";
import type { Group } from "@shared/schema";
import { useUser } from "@/hooks/use-user";

export default function Groups() {
  const { user } = useUser();

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const getGroupIcon = (iconClass: string) => {
    if (iconClass.includes("code")) return <Code className="h-6 w-6" />;
    if (iconClass.includes("theater")) return <Palette className="h-6 w-6" />;
    if (iconClass.includes("balance")) return <Scale className="h-6 w-6" />;
    if (iconClass.includes("users")) return <Users className="h-6 w-6" />;
    if (iconClass.includes("heart")) return <Heart className="h-6 w-6" />;
    if (iconClass.includes("music")) return <Music className="h-6 w-6" />;
    return <Users className="h-6 w-6" />;
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "technology": return "text-primary";
      case "arts": return "text-green-600";
      case "academic": return "text-blue-600";
      case "sports": return "text-red-600";
      case "social": return "text-purple-600";
      default: return "text-gray-600";
    }
  };

  const getBackgroundColor = (category: string) => {
    switch (category) {
      case "technology": return "bg-primary/10";
      case "arts": return "bg-green-100";
      case "academic": return "bg-blue-100";
      case "sports": return "bg-red-100";
      case "social": return "bg-purple-100";
      default: return "bg-gray-100";
    }
  };

  const isJoined = (groupName: string) => {
    return user?.clubs?.some(club => 
      club.toLowerCase().includes(groupName.toLowerCase().split(" ")[0])
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
          <p className="mt-1 text-sm text-gray-600">Connect with student organizations and clubs on campus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups && groups.length > 0 ? (
            groups.map((group) => (
              <Card key={group.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 ${getBackgroundColor(group.category)} rounded-lg flex items-center justify-center`}>
                      <div className={getIconColor(group.category)}>
                        {getGroupIcon(group.icon)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.memberCount} members</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                  <Button
                    className="w-full"
                    variant={isJoined(group.name) ? "secondary" : "default"}
                    disabled={isJoined(group.name)}
                  >
                    {isJoined(group.name) ? "Joined" : "Join Group"}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No groups available at the moment.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
