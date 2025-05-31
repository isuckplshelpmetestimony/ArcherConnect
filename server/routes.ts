import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { FacebookScraper } from "./facebook-scraper";
import { insertUserSchema, insertFavoriteAnnouncementSchema, insertGroupSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const user = await storage.updateUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Announcement routes
  app.get("/api/announcements", async (req, res) => {
    try {
      const { category, interests } = req.query;
      const interestsArray = interests ? String(interests).split(',') : undefined;
      
      const announcements = await storage.getAnnouncementsByFilter(
        category as string,
        interestsArray
      );
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notification routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUserId(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationRead(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/user/:userId/read-all", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const success = await storage.markAllNotificationsRead(userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Group routes
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resource routes
  app.get("/api/resources", async (req, res) => {
    try {
      const { category } = req.query;
      let resources;
      if (category) {
        resources = await storage.getResourcesByCategory(category as string);
      } else {
        resources = await storage.getResources();
      }
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Favorite announcements routes
  app.get("/api/user/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const favorites = await storage.getFavoriteAnnouncementsByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/:userId/favorites", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { announcementId } = insertFavoriteAnnouncementSchema.parse({
        ...req.body,
        userId
      });
      
      const favorite = await storage.addFavoriteAnnouncement({ userId, announcementId });
      res.json(favorite);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.delete("/api/user/:userId/favorites/:announcementId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const announcementId = parseInt(req.params.announcementId);
      
      const success = await storage.removeFavoriteAnnouncement(userId, announcementId);
      if (success) {
        res.json({ message: "Favorite removed successfully" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Groups endpoints
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const result = insertGroupSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid group data", errors: result.error.errors });
      }
      const group = await storage.createGroup(result.data);
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.post("/api/groups/:id/join", async (req, res) => {
    try {
      // For now, just return success - in a real app you'd track memberships
      res.json({ message: "Joined group successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid event data", errors: result.error.errors });
      }
      const event = await storage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post("/api/events/:id/interested", async (req, res) => {
    try {
      // For now, just return success - in a real app you'd track interests
      res.json({ message: "Marked as interested successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark interest" });
    }
  });

  // Facebook scraping endpoint
  app.post("/api/scrape-facebook", async (req, res) => {
    try {
      const scraper = new FacebookScraper();
      const count = await scraper.scrapeAndStoreAnnouncements();
      res.json({ 
        message: `Successfully scraped and stored ${count} announcements from Facebook`,
        count 
      });
    } catch (error) {
      console.error("Facebook scraping error:", error);
      res.status(500).json({ 
        message: "Failed to scrape Facebook posts", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
