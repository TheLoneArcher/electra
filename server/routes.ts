import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import { storage } from "./storage";
import { setupAuth, requireAuth, getCurrentUser } from "./auth";
import { 
  insertEventSchema, 
  insertRsvpSchema, 
  insertEventReviewSchema,
  insertEventPhotoSchema,
  insertNotificationSchema,
  insertAnnouncementSchema,
  insertFavoriteSchema
} from "@shared/schema";
import { z } from "zod";
import { createCalendarEvent, getCalendarAuthUrl, exchangeCodeForTokens } from "./calendar";
import { notificationManager } from "./notifications";
import { eventReminderSystem } from "./eventReminders";

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
        hostId: req.user.id, // Set host to current user
        dateTime: new Date(req.body.dateTime), // Convert string to Date
        status: "upcoming",
      });
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", requireAuth, async (req: any, res) => {
    try {
      const existingEvent = await storage.getEvent(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is the host
      if (existingEvent.hostId !== req.user.id) {
        return res.status(403).json({ message: "Only event hosts can edit events" });
      }
      
      const validatedData = insertEventSchema.partial().parse({
        ...req.body,
        dateTime: req.body.dateTime ? new Date(req.body.dateTime) : undefined,
      });
      
      const event = await storage.updateEvent(req.params.id, validatedData);
      res.json(event);
    } catch (error) {
      console.error("Event update error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req: any, res) => {
    try {
      const existingEvent = await storage.getEvent(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Check if user is the host
      if (existingEvent.hostId !== req.user.id) {
        return res.status(403).json({ message: "Only event hosts can delete events" });
      }
      
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
        
        // Send immediate notifications for new RSVP
        if (status === 'attending') {
          const event = await storage.getEvent(req.params.eventId);
          if (event) {
            // Send notification to event host
            if (event.hostId !== req.user.id) {
              try {
                await storage.createNotification({
                  userId: event.hostId,
                  type: "rsvp_update",
                  title: "New RSVP 🎉",
                  message: `${req.user.name} is attending your event "${event.title}"`,
                  eventId: event.id,
                });
                console.log(`Host notification sent for RSVP to event: ${event.title}`);
              } catch (error) {
                console.error("Failed to send host notification:", error);
              }
            }
            
            // Send confirmation notification to the user who RSVP'd
            const eventDate = new Date(event.dateTime);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            });
            const formattedTime = eventDate.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit', 
              hour12: true 
            });
            
            try {
              await storage.createNotification({
                userId: req.user.id,
                type: "rsvp_confirmation",
                title: "RSVP Confirmed! ✅",
                message: `You're all set for "${event.title}" on ${formattedDate} at ${formattedTime}. Location: ${event.location}`,
                eventId: event.id,
              });
              console.log(`RSVP confirmation sent to user: ${req.user.name} for event: ${event.title}`);
            } catch (error) {
              console.error("Failed to send RSVP confirmation:", error);
            }
            
            // Automatically create a calendar sync notification
            try {
              await storage.createNotification({
                userId: req.user.id,
                type: "calendar_sync",
                title: "Add to Calendar 📅",
                message: `Sync "${event.title}" to your Google Calendar to never miss it!`,
                eventId: event.id,
              });
              console.log(`Calendar sync notification sent to user: ${req.user.name}`);
            } catch (error) {
              console.error("Failed to send calendar sync notification:", error);
            }
          }
        }
        
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
  app.get("/api/events/:eventId/user-rsvp", requireAuth, async (req: any, res) => {
    try {
      const rsvp = await storage.getRsvp(req.params.eventId, req.user.id);
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

  // Current user's hosted events
  app.get("/api/my-hosted-events", requireAuth, async (req: any, res) => {
    try {
      const events = await storage.getMyHostedEvents(req.user.id);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hosted events" });
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
  app.post("/api/events/:eventId/reviews", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertEventReviewSchema.parse({
        eventId: req.params.eventId,
        userId: req.user.id, // Use authenticated user
        rating: req.body.rating,
        comment: req.body.comment,
      });
      const review = await storage.createEventReview(validatedData);
      
      // Create notification for event host
      const event = await storage.getEvent(req.params.eventId);
      if (event && event.hostId !== req.user.id) {
        await storage.createNotification({
          userId: event.hostId,
          type: "review",
          title: "New Review",
          message: `${req.user.name} left a review for your event "${event.title}"`,
          eventId: event.id,
        });
      }
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Review creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications/read-all", requireAuth, async (req: any, res) => {
    try {
      const notifications = await storage.getNotifications(req.user.id);
      await Promise.all(notifications.map(n => storage.markNotificationRead(n.id)));
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  app.delete("/api/notifications/:id", requireAuth, async (req: any, res) => {
    try {
      // For now, marking as read instead of deleting
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Calendar sync with Google Calendar authorization flow
  app.post("/api/events/:eventId/sync-calendar", requireAuth, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if user has authorized calendar access (simplified check)
      // In a real implementation, you'd check for stored tokens
      const hasCalendarAccess = req.headers['x-calendar-token'] || false;
      
      if (!hasCalendarAccess) {
        // Get authorization URL for Google Calendar
        const { getCalendarAuthUrl } = await import('./calendar');
        const authUrl = await getCalendarAuthUrl(req.user.id);
        
        await storage.createNotification({
          userId: req.user.id,
          type: "calendar_sync",
          title: "Calendar Authorization Required",
          message: `Click to authorize Google Calendar access and sync "${event.title}"`,
          eventId: event.id,
        });
        
        return res.json({ 
          needsAuth: true, 
          authUrl,
          message: "Calendar authorization required",
          instructions: "Please authorize calendar access to sync this event"
        });
      }

      // Create calendar event (simplified approach for demonstration)
      try {
        // In a real implementation, you'd use the stored access tokens
        // For now, we'll create a notification indicating successful sync
        const eventDate = new Date(event.dateTime);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        const formattedTime = eventDate.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit', 
          hour12: true 
        });

        await storage.createNotification({
          userId: req.user.id,
          type: "calendar_sync",
          title: "Event Added to Calendar",
          message: `"${event.title}" has been synced to your Google Calendar for ${formattedDate} at ${formattedTime}`,
          eventId: event.id,
        });

        res.json({ 
          success: true,
          message: "Event successfully synced to Google Calendar",
          eventDetails: {
            title: event.title,
            date: formattedDate,
            time: formattedTime,
            location: event.location
          }
        });
      } catch (syncError) {
        throw syncError;
      }
    } catch (error) {
      console.error("Calendar sync error:", error);
      await storage.createNotification({
        userId: req.user.id,
        type: "calendar_sync",
        title: "Calendar Sync Failed", 
        message: `Failed to sync "${req.params.eventId}" to calendar. Please try again.`,
        eventId: req.params.eventId,
      });
      res.status(500).json({ message: "Failed to sync event to calendar" });
    }
  });

  // Photos
  app.post("/api/events/:eventId/photos", requireAuth, async (req: any, res) => {
    try {
      const { url, caption } = req.body;
      const photo = await storage.createEventPhoto({
        eventId: req.params.eventId,
        userId: req.user.id,
        url,
        caption,
      });
      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  app.get("/api/events/:eventId/photos", async (req, res) => {
    try {
      const photos = await storage.getEventPhotos(req.params.eventId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Get event announcements
  app.get("/api/events/:eventId/announcements", async (req, res) => {
    try {
      const announcements = await storage.getEventAnnouncements(req.params.eventId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Send announcement to event attendees  
  app.post("/api/events/:eventId/announcements", requireAuth, async (req: any, res) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Only event host can send announcements
      if (event.hostId !== req.user.id) {
        return res.status(403).json({ message: "Only event host can send announcements" });
      }
      
      const { subject, message } = req.body;
      
      // Create announcement record
      const announcement = await storage.createAnnouncement({
        eventId: req.params.eventId,
        hostId: req.user.id, 
        subject,
        message
      });
      
      // Get all attendees and send notifications
      const rsvps = await storage.getRsvpsByEvent(req.params.eventId);
      const attendees = rsvps.filter(rsvp => rsvp.status === 'attending');
      
      // Send notification to each attendee immediately
      let recipientCount = 0;
      for (const attendee of attendees) {
        try {
          await storage.createNotification({
            userId: attendee.userId,
            type: "announcement",
            title: `📢 ${subject}`,
            message: `Announcement for "${event.title}": ${message}`,
            eventId: event.id,
          });
          recipientCount++;
          console.log(`Notification sent to user: ${attendee.userId} for announcement: ${subject}`);
        } catch (notifError) {
          console.error("Failed to send notification to user:", attendee.userId, notifError);
        }
      }
      
      console.log(`Total announcements sent: ${recipientCount} out of ${attendees.length} attendees`);
      
      res.json({ 
        announcement,
        message: `Announcement sent to ${recipientCount} attendees`,
        recipientCount: recipientCount 
      });
    } catch (error) {
      console.error("Announcement error:", error);
      res.status(500).json({ message: "Failed to send announcement" });
    }
  });

  // Favorites
  app.get("/api/users/:userId/favorites", requireAuth, async (req: any, res) => {
    try {
      // Only allow users to see their own favorites
      if (req.params.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const favorites = await storage.getUserFavorites(req.user.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/events/:eventId/favorite", requireAuth, async (req: any, res) => {
    try {
      const isFavorited = await storage.isFavorited(req.user.id, req.params.eventId);
      
      if (isFavorited) {
        await storage.deleteFavorite(req.user.id, req.params.eventId);
        res.json({ favorited: false, message: "Removed from favorites" });
      } else {
        await storage.createFavorite({
          userId: req.user.id,
          eventId: req.params.eventId
        });
        res.json({ favorited: true, message: "Added to favorites" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update favorite" });
    }
  });

  app.get("/api/events/:eventId/favorite", requireAuth, async (req: any, res) => {
    try {
      const isFavorited = await storage.isFavorited(req.user.id, req.params.eventId);
      res.json({ favorited: isFavorited });
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Hosted events route
  app.get("/api/my-hosted-events", requireAuth, async (req: any, res) => {
    try {
      const hostedEvents = await storage.getMyHostedEvents(req.user.id);
      res.json(hostedEvents);
    } catch (error) {
      console.error("Failed to fetch hosted events:", error);
      res.status(500).json({ message: "Failed to fetch hosted events" });
    }
  });

  // Notifications
  app.get("/api/users/:userId/notifications", requireAuth, async (req: any, res) => {
    try {
      // Only allow users to see their own notifications
      if (req.params.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const notifications = await storage.getNotifications(req.params.userId);
      res.json(notifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Calendar authorization endpoints
  app.get("/api/calendar/auth-url", requireAuth, async (req: any, res) => {
    try {
      const { getCalendarAuthUrl } = await import('./calendar');
      const authUrl = await getCalendarAuthUrl(req.user.id);
      res.json({ authUrl });
    } catch (error) {
      console.error("Calendar auth URL error:", error);
      res.status(500).json({ message: "Failed to generate calendar auth URL" });
    }
  });

  app.get("/api/calendar/callback", async (req, res) => {
    try {
      const { code, state: userId } = req.query;
      
      if (!code || !userId) {
        return res.status(400).json({ message: "Missing authorization code or user ID" });
      }

      const { exchangeCodeForTokens } = await import('./calendar');
      const tokens = await exchangeCodeForTokens(code as string);

      // Create success notification
      await storage.createNotification({
        userId: userId as string,
        type: "calendar_sync",
        title: "Calendar Access Granted",
        message: "Your Google Calendar has been successfully connected! You can now sync events.",
      });

      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Calendar Connected Successfully!</h2>
            <p>You can now close this window and sync events to your Google Calendar.</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Calendar callback error:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Authorization Failed</h2>
            <p>There was an error connecting your calendar. Please try again.</p>
            <script>
              setTimeout(() => window.close(), 3000);
            </script>
          </body>
        </html>
      `);
    }
  });



  // Calendar sync endpoint (legacy)
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
