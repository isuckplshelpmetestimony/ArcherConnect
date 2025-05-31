import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { useUser } from "@/hooks/use-user";

export default function Announcements() {
  const { user } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("recent");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements", categoryFilter, user?.interests],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
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
      return await apiRequest("/api/scrape-facebook", {
        method: "POST",
      });
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
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <p className="mt-1 text-sm text-gray-600">Stay updated with the latest news and opportunities.</p>
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

              {/* Filter Dropdowns */}
              <div className="flex gap-3">
                <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="relevant">Relevant</SelectItem>
                    <SelectItem value="irrelevant">Irrelevant</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
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
                    <Button
                      variant={isRelevant(announcement) ? "secondary" : "outline"}
                      size="sm"
                      className="ml-4"
                    >
                      {isRelevant(announcement) ? "Relevant" : "Mark as Relevant"}
                    </Button>
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
