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
import { useAuth } from "@/hooks/useAuth";

const eventSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Category is required"),
});

type EventForm = z.infer<typeof eventSchema>;

export default function Events() {
  const { user } = useAuth();
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
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
            <p className="mt-1 text-sm text-gray-600">Discover upcoming campus events and activities.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your event" 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="career">Career</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                      onClick={() => interestedMutation.mutate(event.id)}
                      disabled={interestedMutation.isPending}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {interestedMutation.isPending ? "Loading..." : "Interested!"}
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
