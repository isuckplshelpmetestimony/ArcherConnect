import { 
  users, announcements, notifications, groups, events, resources, favoriteAnnouncements,
  type User, type InsertUser, type Announcement, type InsertAnnouncement,
  type Notification, type InsertNotification, type Group, type InsertGroup,
  type Event, type InsertEvent, type Resource, type InsertResource,
  type FavoriteAnnouncement, type InsertFavoriteAnnouncement
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Announcement operations
  getAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByFilter(category?: string, interests?: string[]): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // Notification operations
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;
  markAllNotificationsRead(userId: number): Promise<boolean>;

  // Group operations
  getGroups(): Promise<Group[]>;
  getGroupById(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Resource operations
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Favorite announcement operations
  getFavoriteAnnouncementsByUserId(userId: number): Promise<Announcement[]>;
  addFavoriteAnnouncement(favorite: InsertFavoriteAnnouncement): Promise<FavoriteAnnouncement>;
  removeFavoriteAnnouncement(userId: number, announcementId: number): Promise<boolean>;
  isFavoriteAnnouncement(userId: number, announcementId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        interests: insertUser.interests || [],
        notificationPreferences: insertUser.notificationPreferences || [],
        keywords: insertUser.keywords || [],
        emailNotifications: insertUser.emailNotifications ?? true,
        pushNotifications: insertUser.pushNotifications ?? false,
        onboardingCompleted: insertUser.onboardingCompleted ?? false,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    return await db.select().from(announcements).orderBy(announcements.date);
  }

  async getAnnouncementsByFilter(category?: string, interests?: string[]): Promise<Announcement[]> {
    let query = db.select().from(announcements);
    
    // Note: For simplicity, we'll get all announcements and filter in memory
    // In a production app, you'd want to use SQL WHERE clauses
    const allAnnouncements = await query.orderBy(announcements.date);
    
    let filteredAnnouncements = allAnnouncements;
    
    if (category && category !== 'all') {
      filteredAnnouncements = filteredAnnouncements.filter(a => a.category === category);
    }
    
    if (interests && interests.length > 0) {
      filteredAnnouncements = filteredAnnouncements.filter(a => 
        a.relevantInterests.some(interest => interests.includes(interest))
      );
    }
    
    return filteredAnnouncements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const [announcement] = await db
      .insert(announcements)
      .values({
        ...insertAnnouncement,
        relevantInterests: insertAnnouncement.relevantInterests || [],
        relevantMajors: insertAnnouncement.relevantMajors || [],
      })
      .returning();
    return announcement;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.date);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...insertNotification,
        read: insertNotification.read ?? false,
        deadline: insertNotification.deadline || null,
      })
      .returning();
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async markAllNotificationsRead(userId: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
    return true;
  }

  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups);
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group || undefined;
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const [group] = await db
      .insert(groups)
      .values({
        ...insertGroup,
        memberCount: insertGroup.memberCount || 0,
      })
      .returning();
    return group;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.date);
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values({
        ...insertEvent,
        registered: insertEvent.registered ?? false,
      })
      .returning();
    return event;
  }

  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.category, category));
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db
      .insert(resources)
      .values({
        ...insertResource,
        url: insertResource.url || null,
      })
      .returning();
    return resource;
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private announcements: Map<number, Announcement> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private groups: Map<number, Group> = new Map();
  private events: Map<number, Event> = new Map();
  private resources: Map<number, Resource> = new Map();
  
  private currentUserId = 1;
  private currentAnnouncementId = 1;
  private currentNotificationId = 1;
  private currentGroupId = 1;
  private currentEventId = 1;
  private currentResourceId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed announcements
    const sampleAnnouncements: InsertAnnouncement[] = [
      {
        title: "Career Fair 2024",
        content: "The university is hosting a career fair on October 26th, featuring top companies in various industries. Students can network with recruiters and explore internship and job opportunities.",
        category: "career",
        relevantInterests: ["business", "technology"],
        relevantMajors: ["computer-science", "business", "engineering"],
      },
      {
        title: "Spring 2025 Application Deadline",
        content: "The deadline for submitting applications for the Spring 2025 semester is November 15th. Ensure all required documents are submitted on time.",
        category: "academic",
        relevantInterests: [],
        relevantMajors: [],
      },
      {
        title: "Annual Charity Run",
        content: "The university's annual charity run will take place on November 5th. Register now to participate and support local charities.",
        category: "events",
        relevantInterests: ["sports", "social-events"],
        relevantMajors: [],
      },
      {
        title: "Library Closure",
        content: "The library will be closed for maintenance from October 28th to November 1st. Online resources will still be available.",
        category: "services",
        relevantInterests: [],
        relevantMajors: [],
      },
      {
        title: "Halloween Party",
        content: "The student union is organizing a Halloween party on October 31st. Join us for a night of fun, costumes, and music.",
        category: "events",
        relevantInterests: ["social-events"],
        relevantMajors: [],
      },
    ];

    sampleAnnouncements.forEach(announcement => {
      this.createAnnouncement(announcement);
    });

    // Seed groups
    const sampleGroups: InsertGroup[] = [
      {
        name: "Coding Club",
        description: "Learn programming, work on projects, and participate in coding competitions.",
        memberCount: 245,
        icon: "fas fa-code",
        category: "technology",
      },
      {
        name: "Drama Society",
        description: "Participate in theatrical productions and develop your acting skills.",
        memberCount: 180,
        icon: "fas fa-theater-masks",
        category: "arts",
      },
      {
        name: "Debate Club",
        description: "Engage in intellectual discussions and competitive debates.",
        memberCount: 95,
        icon: "fas fa-balance-scale",
        category: "academic",
      },
    ];

    sampleGroups.forEach(group => {
      this.createGroup(group);
    });

    // Seed events
    const sampleEvents: InsertEvent[] = [
      {
        title: "Career Fair 2024",
        description: "Meet with top employers, explore career opportunities, and network with industry professionals. Bring your resume and dress professionally.",
        date: new Date("2024-10-26T09:00:00"),
        location: "Student Union Building",
        category: "career",
        icon: "fas fa-briefcase",
        registered: false,
      },
      {
        title: "Halloween Party",
        description: "Join us for a spooky night of fun, costumes, music, and dancing. Prizes for best costumes!",
        date: new Date("2024-10-31T20:00:00"),
        location: "Campus Recreation Center",
        category: "social",
        icon: "fas fa-ghost",
        registered: false,
      },
      {
        title: "Annual Charity Run",
        description: "Run for a good cause! All proceeds benefit local charities. Multiple distance options available.",
        date: new Date("2024-11-05T07:00:00"),
        location: "Campus Quad",
        category: "sports",
        icon: "fas fa-running",
        registered: true,
      },
    ];

    sampleEvents.forEach(event => {
      this.createEvent(event);
    });

    // Seed resources
    const sampleResources: InsertResource[] = [
      {
        title: "Library Services",
        description: "Access digital resources, book reservations, and study spaces.",
        category: "academic",
        icon: "fas fa-book",
        url: "/library",
      },
      {
        title: "Academic Support",
        description: "Tutoring services, study groups, and academic advising.",
        category: "academic",
        icon: "fas fa-user-graduate",
        url: "/academic-support",
      },
      {
        title: "Wellness Center",
        description: "Mental health services, counseling, and wellness programs.",
        category: "wellness",
        icon: "fas fa-heart",
        url: "/wellness",
      },
      {
        title: "Financial Aid",
        description: "Scholarships, grants, and financial assistance programs.",
        category: "financial",
        icon: "fas fa-dollar-sign",
        url: "/financial-aid",
      },
      {
        title: "Career Services",
        description: "Resume building, interview prep, and job placement assistance.",
        category: "career",
        icon: "fas fa-briefcase",
        url: "/career-services",
      },
      {
        title: "IT Support",
        description: "Technical support, software access, and digital tools.",
        category: "technology",
        icon: "fas fa-laptop",
        url: "/it-support",
      },
    ];

    sampleResources.forEach(resource => {
      this.createResource(resource);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      interests: insertUser.interests || [],
      notificationPreferences: insertUser.notificationPreferences || [],
      keywords: insertUser.keywords || [],
      emailNotifications: insertUser.emailNotifications ?? true,
      pushNotifications: insertUser.pushNotifications ?? false,
      onboardingCompleted: insertUser.onboardingCompleted ?? false,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Announcement operations
  async getAnnouncements(): Promise<Announcement[]> {
    return Array.from(this.announcements.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getAnnouncementsByFilter(category?: string, interests?: string[]): Promise<Announcement[]> {
    let announcements = Array.from(this.announcements.values());
    
    if (category && category !== 'all') {
      announcements = announcements.filter(a => a.category === category);
    }
    
    if (interests && interests.length > 0) {
      announcements = announcements.filter(a => 
        a.relevantInterests.some(interest => interests.includes(interest))
      );
    }
    
    return announcements.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async createAnnouncement(insertAnnouncement: InsertAnnouncement): Promise<Announcement> {
    const id = this.currentAnnouncementId++;
    const announcement: Announcement = { 
      ...insertAnnouncement, 
      id, 
      date: new Date() 
    };
    this.announcements.set(id, announcement);
    return announcement;
  }

  // Notification operations
  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    // For demo purposes, create sample notifications for any user
    const sampleNotifications: InsertNotification[] = [
      {
        userId,
        title: "Scholarship Application Deadline",
        content: "Submit your application for the upcoming scholarship program. Ensure all required documents are included.",
        type: "deadline",
        read: false,
        deadline: new Date("2024-10-20"),
      },
      {
        userId,
        title: "Career Fair",
        content: "Join us for a career fair featuring top companies. Bring your resume and dress professionally.",
        type: "event",
        read: false,
      },
      {
        userId,
        title: "Research Proposal Submission",
        content: "Submit your research proposals for the upcoming conference. Follow the guidelines on the website.",
        type: "deadline",
        read: false,
        deadline: new Date("2024-11-15"),
      },
      {
        userId,
        title: "Student Exchange Program Application",
        content: "Apply for the student exchange program. Explore opportunities to study abroad and broaden your horizons.",
        type: "opportunity",
        read: false,
        deadline: new Date("2024-12-01"),
      },
    ];

    // Create notifications if they don't exist for this user
    const existingNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    if (existingNotifications.length === 0) {
      for (const notification of sampleNotifications) {
        await this.createNotification(notification);
      }
    }

    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      date: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }

  async markAllNotificationsRead(userId: number): Promise<boolean> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId);
    
    for (const notification of userNotifications) {
      notification.read = true;
      this.notifications.set(notification.id, notification);
    }
    
    return true;
  }

  // Group operations
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async getGroupById(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const id = this.currentGroupId++;
    const group: Group = { ...insertGroup, id };
    this.groups.set(id, group);
    return group;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getEventById(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  // Resource operations
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(r => r.category === category);
  }

  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }
}

export const storage = new DatabaseStorage();
