import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/hooks/use-user";
import { DEPARTMENTS, INTERESTS } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const onboardingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  major: z.string().min(1, "Please select your department"),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { updateUser } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: "",
      email: "",
      major: "",
      interests: [],
    },
  });

  const onSubmit = async (data: OnboardingForm) => {
    setIsLoading(true);
    try {
      await updateUser({
        ...data,
        notificationPreferences: ["academics", "campus-events", "career-services", "student-life", "general-announcements"],
        keywords: [],
        emailNotifications: true,
        pushNotifications: false,
        onboardingCompleted: true,
      });

      toast({
        title: "Welcome to ArcherConnect!",
        description: "Your profile has been set up successfully.",
      });

      setLocation("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set up your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">ArcherConnect</h1>
          </div>
        </div>

        {/* Welcome Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome to ArcherConnect</h2>
          <p className="text-gray-600 leading-relaxed">
            Let's personalize your experience. Tell us about your academic major, interests, and any clubs you're involved in to filter announcements effectively.
          </p>
        </div>

        {/* Onboarding Form */}
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <input
                          {...field}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          placeholder="Enter your email address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Major Selection */}
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENTS.map((department) => (
                            <SelectItem key={department.value} value={department.value}>
                              {department.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Interests Selection */}
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <div className="grid grid-cols-2 gap-3">
                        {INTERESTS.map((interest) => (
                          <FormField
                            key={interest.value}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest.value}
                                  className="flex flex-row items-start space-x-3 space-y-0 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, interest.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== interest.value
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-medium cursor-pointer">
                                    {interest.label}
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



                {/* Continue Button */}
                <Button
                  type="submit"
                  className="w-full py-3"
                  disabled={isLoading}
                >
                  {isLoading ? "Setting up..." : "Continue"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
