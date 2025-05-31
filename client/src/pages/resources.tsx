import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, GraduationCap, Heart, DollarSign, Briefcase, Laptop, ExternalLink } from "lucide-react";
import type { Resource } from "@shared/schema";

export default function Resources() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const getResourceIcon = (iconClass: string) => {
    if (iconClass.includes("book")) return <Book className="h-6 w-6" />;
    if (iconClass.includes("user-graduate")) return <GraduationCap className="h-6 w-6" />;
    if (iconClass.includes("heart")) return <Heart className="h-6 w-6" />;
    if (iconClass.includes("dollar")) return <DollarSign className="h-6 w-6" />;
    if (iconClass.includes("briefcase")) return <Briefcase className="h-6 w-6" />;
    if (iconClass.includes("laptop")) return <Laptop className="h-6 w-6" />;
    return <Book className="h-6 w-6" />;
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "academic": return "text-blue-600";
      case "wellness": return "text-purple-600";
      case "financial": return "text-yellow-600";
      case "career": return "text-red-600";
      case "technology": return "text-indigo-600";
      default: return "text-gray-600";
    }
  };

  const getBackgroundColor = (category: string) => {
    switch (category) {
      case "academic": return "bg-blue-100";
      case "wellness": return "bg-purple-100";
      case "financial": return "bg-yellow-100";
      case "career": return "bg-red-100";
      case "technology": return "bg-indigo-100";
      default: return "bg-gray-100";
    }
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
              <Skeleton key={i} className="h-48" />
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
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="mt-1 text-sm text-gray-600">Access academic resources, support services, and campus facilities.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources && resources.length > 0 ? (
            resources.map((resource) => (
              <Card key={resource.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-12 h-12 ${getBackgroundColor(resource.category)} rounded-lg flex items-center justify-center`}>
                      <div className={getIconColor(resource.category)}>
                        {getResourceIcon(resource.icon)}
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{resource.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                    asChild
                  >
                    <a href={resource.url || "#"} className="flex items-center space-x-1">
                      <span>Learn More</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No resources available at the moment.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
