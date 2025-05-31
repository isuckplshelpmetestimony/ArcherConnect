import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, RefreshCw, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";

export default function Announcements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState("all");

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", user?.interests],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (user?.interests && user.interests.length > 0) {
        params.append("interests", user.interests.join(","));
      }
      
      const response = await fetch(`/api/announcements?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch announcements");
      return response.json();
    },
  });

  const scrapeFacebookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/scrape-facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to scrape Facebook posts");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Facebook posts scraped successfully",
        description: `Added ${data.count} new announcements from Facebook pages`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to scrape Facebook posts",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const createSampleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Sample University Announcement",
          content: "This is a test announcement to demonstrate the system functionality. Once Facebook integration is set up, real announcements will appear here.",
          category: "academic",
          relevantInterests: ["Technology", "Academic"],
          relevantMajors: ["Computer Science", "Information Technology"]
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create announcement");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sample announcement created",
        description: "A test announcement has been added to demonstrate the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create announcement",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ announcementId, isFavorited }: { announcementId: number; isFavorited: boolean }) => {
      const userId = user?.id || 1;
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/user/${userId}/favorites/${announcementId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove favorite");
        return response.json();
      } else {
        // Add to favorites
        const response = await fetch(`/api/user/${userId}/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ announcementId }),
        });
        if (!response.ok) throw new Error("Failed to add favorite");
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user?.id || 1}/favorites`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update favorite",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Query to get user's favorite announcements for checking if announcement is favorited
  const { data: favoriteAnnouncements } = useQuery({
    queryKey: [`/api/user/${user?.id || 1}/favorites`],
    enabled: !!user,
  });

  const filteredAnnouncements = announcements?.filter(announcement => {
    if (searchQuery) {
      return announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }) || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "career": return "💼";
      case "academic": return "🎓";
      case "events": return "🎉";
      case "services": return "📚";
      default: return "📢";
    }
  };

  const isRelevant = (announcement: Announcement) => {
    if (!user) return false;
    return announcement.relevantInterests.some(interest => user.interests?.includes(interest)) ||
           announcement.relevantMajors.includes(user.major);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-32" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
            <p className="mt-1 text-sm text-gray-600">Stay updated with the latest news and opportunities.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => scrapeFacebookMutation.mutate()}
              disabled={scrapeFacebookMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${scrapeFacebookMutation.isPending ? 'animate-spin' : ''}`} />
              {scrapeFacebookMutation.isPending ? 'Updating...' : 'Refresh Announcements'}
            </Button>
            <Button
              onClick={() => createSampleMutation.mutate()}
              disabled={createSampleMutation.isPending}
              variant="default"
              className="flex items-center gap-2"
            >
              {createSampleMutation.isPending ? 'Creating...' : 'Create Test Announcement'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search announcements"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="flex gap-3">
                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="relevant">Relevant</SelectItem>
                    <SelectItem value="irrelevant">Irrelevant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{getCategoryIcon(announcement.category)}</span>
                        <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                        {isRelevant(announcement) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Relevant
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(announcement.date).toLocaleDateString()} • {announcement.category}
                      </p>
                      <p className="text-gray-700 mb-4">{announcement.content}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const isFavorited = favoriteAnnouncements?.some(fav => fav.id === announcement.id) || false;
                          toggleFavoriteMutation.mutate({ announcementId: announcement.id, isFavorited });
                        }}
                        disabled={toggleFavoriteMutation.isPending}
                        className="flex-shrink-0"
                      >
                        <Star 
                          className={`h-5 w-5 ${
                            favoriteAnnouncements?.some(fav => fav.id === announcement.id) 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-400 hover:text-yellow-400'
                          }`} 
                        />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No announcements found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
