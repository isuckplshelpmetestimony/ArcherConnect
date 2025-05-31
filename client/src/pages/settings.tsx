import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/useAuth";
import { NOTIFICATION_PREFERENCES } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  notificationPreferences: z.array(z.string()),
  keywords: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      notificationPreferences: user?.notificationPreferences || [],
      keywords: user?.keywords?.join(", ") || "",
      emailNotifications: user?.emailNotifications ?? true,
      pushNotifications: user?.pushNotifications ?? false,
    },
  });

  const onSubmit = async (data: SettingsForm) => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("auth_token");
      
      if (!userId || !token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-user-id": userId,
        },
        body: JSON.stringify({
          ...data,
          keywords: data.keywords.split(",").map(k => k.trim()).filter(k => k),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account preferences and notification settings.</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Notification Preferences */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  <FormField
                    control={form.control}
                    name="notificationPreferences"
                    render={() => (
                      <FormItem>
                        <div className="space-y-4">
                          {NOTIFICATION_PREFERENCES.map((preference) => (
                            <FormField
                              key={preference.value}
                              control={form.control}
                              name="notificationPreferences"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={preference.value}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(preference.value)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, preference.value])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== preference.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium cursor-pointer">
                                      {preference.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Keywords */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Keywords</h3>
                  <FormField
                    control={form.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Add keywords separated by commas"
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500 mt-2">
                          Add keywords to get personalized notifications about topics you're interested in.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="emailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="text-sm font-medium text-gray-700">Push Notifications</FormLabel>
                            <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
