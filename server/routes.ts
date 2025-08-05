import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import { storage } from "./storage";
import { setupAuth, requireAuth, getCurrentUser } from "./auth";
import { insertEventSchema, insertRsvpSchema, insertEventReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Google OAuth routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Legacy auth routes (keeping for compatibility)
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token, user: googleUser } = req.body;
      
      // In a real app, verify the Google token here
      // For now, we'll just create/find the user
      let user = await storage.getUserByEmail(googleUser.email);
      
      if (!user) {
        user = await storage.createUser({
          email: googleUser.email,
          name: googleUser.name,
          avatar: googleUser.picture,
          googleId: googleUser.sub,
        });
      }
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Event categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getEventCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Events
  app.get("/api/events", async (req, res) => {
    try {
      const { category, isPaid, status, hostId, search } = req.query;
      
      const filters: any = {};
      if (category) filters.category = category as string;
      if (isPaid !== undefined) filters.isPaid = isPaid === "true";
      if (status) filters.status = status as string;
      if (hostId) filters.hostId = hostId as string;
      if (search) filters.search = search as string;

      const events = await storage.getEvents(filters);
      
      // Enrich events with category info and RSVP counts
      const enrichedEvents = await Promise.all(
        events.map(async (event) => {
          const category = await storage.getEventCategory(event.categoryId);
          const rsvps = await storage.getRsvpsByEvent(event.id);
          const attendingCount = rsvps.filter(rsvp => rsvp.status === "attending").length;
          
          return {
            ...event,
            category,
            attendingCount,
          };
        })
      );
      
      res.json(enrichedEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const category = await storage.getEventCategory(event.categoryId);
      const rsvps = await storage.getRsvpsByEvent(event.id);
      const reviews = await storage.getEventReviews(event.id);
      const photos = await storage.getEventPhotos(event.id);
      const host = await storage.getUser(event.hostId);
      
      const attendingCount = rsvps.filter(rsvp => rsvp.status === "attending").length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;
      
      res.json({
        ...event,
        category,
        host,
        attendingCount,
        reviews,
        photos,
        averageRating,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertEventSchema.parse({
        ...req.body,
        organizerId: req.user.id, // Set organizer to current user
      });
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const success = await storage.deleteEvent(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // RSVPs
  app.get("/api/events/:eventId/rsvps", async (req, res) => {
    try {
      const rsvps = await storage.getRsvpsByEvent(req.params.eventId);
      res.json(rsvps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch RSVPs" });
    }
  });

  app.post("/api/events/:eventId/rsvp", requireAuth, async (req: any, res) => {
    try {
      const { status } = req.body;
      
      // Check if RSVP already exists
      const existingRsvp = await storage.getRsvp(req.params.eventId, req.user.id);
      
      if (existingRsvp) {
        const updatedRsvp = await storage.updateRsvp(req.params.eventId, req.user.id, status);
        res.json(updatedRsvp);
      } else {
        const validatedData = insertRsvpSchema.parse({
          eventId: req.params.eventId,
          userId: req.user.id,
          status,
        });
        const rsvp = await storage.createRsvp(validatedData);
        res.status(201).json(rsvp);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid RSVP data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create/update RSVP" });
    }
  });

  app.delete("/api/events/:eventId/rsvp/:userId", async (req, res) => {
    try {
      const success = await storage.deleteRsvp(req.params.eventId, req.params.userId);
      if (!success) {
        return res.status(404).json({ message: "RSVP not found" });
      }
      res.json({ message: "RSVP deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete RSVP" });
    }
  });

  // Get current user's RSVP for specific event
  app.get("/api/events/:eventId/user-rsvp", async (req: any, res) => {
    // Allow checking RSVP status even when not authenticated
    const user = getCurrentUser(req);
    if (!user) {
      return res.json(null);
    }
    try {
      const rsvp = await storage.getRsvp(req.params.eventId, user.id);
      res.json(rsvp);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user RSVP" });
    }
  });

  // Current user's RSVPs
  app.get("/api/my-rsvps", requireAuth, async (req: any, res) => {
    try {
      const rsvps = await storage.getRsvpsByUser(req.user.id);
      
      // Enrich with event data
      const enrichedRsvps = await Promise.all(
        rsvps.map(async (rsvp) => {
          const event = await storage.getEvent(rsvp.eventId);
          const category = event ? await storage.getEventCategory(event.categoryId) : null;
          return {
            ...rsvp,
            event: event ? { ...event, category } : null,
          };
        })
      );
      
      res.json(enrichedRsvps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user RSVPs" });
    }
  });

  // User RSVPs (legacy)
  app.get("/api/users/:userId/rsvps", async (req, res) => {
    try {
      const rsvps = await storage.getRsvpsByUser(req.params.userId);
      
      // Enrich with event data
      const enrichedRsvps = await Promise.all(
        rsvps.map(async (rsvp) => {
          const event = await storage.getEvent(rsvp.eventId);
          const category = event ? await storage.getEventCategory(event.categoryId) : null;
          return {
            ...rsvp,
            event: event ? { ...event, category } : null,
          };
        })
      );
      
      res.json(enrichedRsvps);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user RSVPs" });
    }
  });

  // Reviews
  app.post("/api/events/:eventId/reviews", async (req, res) => {
    try {
      const validatedData = insertEventReviewSchema.parse({
        eventId: req.params.eventId,
        ...req.body,
      });
      const review = await storage.createEventReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Photos
  app.post("/api/events/:eventId/photos", async (req, res) => {
    try {
      const { userId, url, caption } = req.body;
      const photo = await storage.createEventPhoto({
        eventId: req.params.eventId,
        userId,
        url,
        caption,
      });
      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Notifications
  app.get("/api/users/:userId/notifications", async (req, res) => {
    try {
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Calendar sync endpoint
  app.post("/api/calendar/add-event", async (req, res) => {
    try {
      const { eventId, userId } = req.body;
      
      // In a real app, this would integrate with Google Calendar API
      // For now, we'll just return success
      res.json({ message: "Event added to calendar successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add event to calendar" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
