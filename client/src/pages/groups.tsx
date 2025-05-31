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
import { Code, Palette, Scale, Users, Heart, Music, Plus, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Group, InsertGroup } from "@shared/schema";
import { useUser } from "@/hooks/use-user";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  icon: z.string().min(1, "Icon is required"),
});

type GroupForm = z.infer<typeof groupSchema>;

export default function Groups() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: groups, isLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
  });

  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      icon: "fas fa-users",
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: GroupForm) => {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create group");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Group created successfully",
        description: "Your new group has been created!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create group",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id || 1 }),
      });
      if (!response.ok) throw new Error("Failed to join group");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Joined group successfully",
        description: "You have joined the group!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to join group",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroupForm) => {
    createGroupMutation.mutate(data);
  };

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
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Groups</h1>
            <p className="mt-1 text-sm text-gray-600">Connect with student organizations and clubs on campus.</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter group name" {...field} />
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
                            placeholder="Describe your group" 
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
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="social">Social</SelectItem>
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
                      disabled={createGroupMutation.isPending}
                    >
                      {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                    onClick={() => joinGroupMutation.mutate(group.id)}
                    disabled={joinGroupMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
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
