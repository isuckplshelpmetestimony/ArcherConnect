import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  major: text("major").notNull(),
  interests: text("interests").array().notNull().default([]),
  notificationPreferences: text("notification_preferences").array().notNull().default([]),
  keywords: text("keywords").array().notNull().default([]),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(false),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  relevantInterests: text("relevant_interests").array().notNull().default([]),
  relevantMajors: text("relevant_majors").array().notNull().default([]),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  date: timestamp("date").notNull().defaultNow(),
  deadline: timestamp("deadline"),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  memberCount: integer("member_count").notNull().default(0),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  registered: boolean("registered").notNull().default(false),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  url: text("url"),
});

export const favoriteAnnouncements = pgTable("favorite_announcements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  announcementId: integer("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  date: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  date: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
});

export const insertFavoriteAnnouncementSchema = createInsertSchema(favoriteAnnouncements).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type FavoriteAnnouncement = typeof favoriteAnnouncements.$inferSelect;
export type InsertFavoriteAnnouncement = z.infer<typeof insertFavoriteAnnouncementSchema>;
