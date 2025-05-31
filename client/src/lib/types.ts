export interface UserProfile {
  id?: number;
  name: string;
  email: string;
  major: string;
  interests: string[];
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

export const DEPARTMENTS = [
  { value: "rvrcob", label: "Ramon V. del Rosario College of Business (RVRCOB)" },
  { value: "gcoe", label: "Gokongwei College of Engineering (GCOE)" },
  { value: "cla", label: "College of Liberal Arts (CLA)" },
  { value: "ccs", label: "College of Computer Studies (CCS)" },
  { value: "cos", label: "College of Science (COS)" },
  { value: "bagced", label: "Br. Andrew Gonzalez College of Education (BAGCED)" },
  { value: "soe", label: "School of Economics (SOE)" },
  { value: "tdsol", label: "Tañada-Diokno School of Law (TDSOL)" },
];

export const INTERESTS = [
  { value: "technology", label: "Technology" },
  { value: "arts", label: "Arts" },
  { value: "sports", label: "Sports" },
  { value: "science", label: "Science" },
  { value: "business", label: "Business" },
  { value: "social-events", label: "Social Events" },
];



export const NOTIFICATION_PREFERENCES = [
  { value: "academics", label: "Academics" },
  { value: "campus-events", label: "Campus Events" },
  { value: "career-services", label: "Career Services" },
  { value: "student-life", label: "Student Life" },
  { value: "general-announcements", label: "General Announcements" },
];
