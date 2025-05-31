import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Briefcase, Ghost, Users, Calendar, MapPin, Clock, Plus, Heart } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Event, InsertEvent } from "@shared/schema";
import { useUser } from "@/hooks/use-user";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
});

type EventForm = z.infer<typeof eventSchema>;

export default function Events() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      category: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const eventData = {
        ...data,
        date: new Date(data.date).toISOString(),
        icon: "fas fa-calendar",
      };
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Event created successfully",
        description: "Your new event has been created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const interestedMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}/interested`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id || 1 }),
      });
      if (!response.ok) throw new Error("Failed to mark as interested");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Marked as interested",
        description: "You've shown interest in this event!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to mark interest",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EventForm) => {
    createEventMutation.mutate(data);
  };

  const getEventIcon = (iconClass: string) => {
    if (iconClass.includes("briefcase")) return <Briefcase className="h-6 w-6" />;
    if (iconClass.includes("ghost")) return <Ghost className="h-6 w-6" />;
    if (iconClass.includes("running")) return <Users className="h-6 w-6" />;
    return <Calendar className="h-6 w-6" />;
  };

  const getIconColor = (category: string) => {
    switch (category) {
      case "career": return "text-primary";
      case "social": return "text-orange-600";
      case "sports": return "text-red-600";
      case "academic": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const getBackgroundColor = (category: string) => {
    switch (category) {
      case "career": return "bg-primary/10";
      case "social": return "bg-orange-100";
      case "sports": return "bg-red-100";
      case "academic": return "bg-blue-100";
      default: return "bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-6">
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
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-600">Discover upcoming campus events and activities.</p>
        </div>

        <div className="space-y-6">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Card key={event.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-12 h-12 ${getBackgroundColor(event.category)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <div className={getIconColor(event.category)}>
                            {getEventIcon(event.icon)}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatTime(event.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mt-3">{event.description}</p>
                    </div>
                    <Button
                      className="ml-6"
                      variant={event.registered ? "secondary" : "default"}
                      disabled={event.registered}
                    >
                      {event.registered ? "Registered" : "Register"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No events scheduled at the moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
