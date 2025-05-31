export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  major: string;
  interests: string[];
  clubs: string[];
  notificationPreferences: string[];
  keywords: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  onboardingCompleted: boolean;
}

export interface DashboardStats {
  announcements: number;
  events: number;
  groups: number;
  resources: number;
}

export const MAJORS = [
  { value: "computer-science", label: "Computer Science" },
  { value: "business", label: "Business Administration" },
  { value: "engineering", label: "Engineering" },
  { value: "arts", label: "Liberal Arts" },
  { value: "sciences", label: "Life Sciences" },
];

export const INTERESTS = [
  { value: "technology", label: "Technology" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "business", label: "Business" },
  { value: "social-events", label: "Social Events" },
];

export const CLUBS = [
  { value: "debate-club", label: "Debate Club" },
  { value: "coding-club", label: "Coding Club" },
  { value: "drama-society", label: "Drama Society" },
  { value: "sports-club", label: "Sports Club" },
  { value: "volunteer-group", label: "Volunteer Group" },
];

export const NOTIFICATION_PREFERENCES = [
  { value: "academics", label: "Academics" },
  { value: "campus-events", label: "Campus Events" },
  { value: "career-services", label: "Career Services" },
  { value: "student-life", label: "Student Life" },
  { value: "general-announcements", label: "General Announcements" },
];
