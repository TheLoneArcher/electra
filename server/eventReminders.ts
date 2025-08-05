import { storage } from "./storage";

// Event reminder system that sends notifications at scheduled intervals
export class EventReminderSystem {
  private reminderInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor() {
    this.startReminderSystem();
  }

  startReminderSystem() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("🔔 Event reminder system started");

    // Check for reminders every 15 minutes
    this.reminderInterval = setInterval(async () => {
      await this.processEventReminders();
    }, 15 * 60 * 1000); // 15 minutes

    // Run immediately on startup
    this.processEventReminders();
  }

  stopReminderSystem() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
    this.isRunning = false;
    console.log("Event reminder system stopped");
  }

  async processEventReminders() {
    try {
      const now = new Date();
      
      // Get all upcoming events
      const events = await storage.getEvents({ status: "upcoming" });
      
      for (const event of events) {
        const eventDate = new Date(event.dateTime);
        const timeDiff = eventDate.getTime() - now.getTime();
        
        // Convert to hours for easier calculation
        const hoursUntilEvent = timeDiff / (1000 * 60 * 60);
        
        // Send 1-day reminder (24 hours ± 15 minutes window)
        if (hoursUntilEvent <= 24.25 && hoursUntilEvent >= 23.75) {
          await this.send24HourReminder(event);
        }
        
        // Send 1-hour reminder (1 hour ± 15 minutes window)
        if (hoursUntilEvent <= 1.25 && hoursUntilEvent >= 0.75) {
          await this.send1HourReminder(event);
        }
      }
    } catch (error) {
      console.error("Error processing event reminders:", error);
    }
  }

  private async send24HourReminder(event: any) {
    try {
      // Get all attendees for this event
      const rsvps = await storage.getRsvpsByEvent(event.id);
      const attendees = rsvps.filter(rsvp => rsvp.status === 'attending');
      
      console.log(`📅 Sending 24-hour reminders for event: ${event.title} to ${attendees.length} attendees`);
      
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

      for (const attendee of attendees) {
        try {
          // Check if we already sent a 24-hour reminder for this event to this user
          const existingNotifications = await storage.getNotifications(attendee.userId);
          const alreadySent = existingNotifications.some(
            notif => notif.eventId === event.id && 
                     notif.type === 'event_reminder_24h' &&
                     notif.createdAt && new Date(notif.createdAt).getTime() > (Date.now() - 25 * 60 * 60 * 1000) // Within last 25 hours
          );
          
          if (!alreadySent) {
            await storage.createNotification({
              userId: attendee.userId,
              type: "event_reminder_24h",
              title: "🔔 Event Tomorrow!",
              message: `Don't forget about "${event.title}" tomorrow (${formattedDate}) at ${formattedTime}. Location: ${event.location}`,
              eventId: event.id,
            });
            console.log(`✅ 24-hour reminder sent to user: ${attendee.userId}`);
          }
        } catch (error) {
          console.error(`❌ Failed to send 24-hour reminder to user ${attendee.userId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error sending 24-hour reminder:", error);
    }
  }

  private async send1HourReminder(event: any) {
    try {
      // Get all attendees for this event
      const rsvps = await storage.getRsvpsByEvent(event.id);
      const attendees = rsvps.filter(rsvp => rsvp.status === 'attending');
      
      console.log(`⏰ Sending 1-hour reminders for event: ${event.title} to ${attendees.length} attendees`);
      
      const eventDate = new Date(event.dateTime);
      const formattedTime = eventDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });

      for (const attendee of attendees) {
        try {
          // Check if we already sent a 1-hour reminder for this event to this user
          const existingNotifications = await storage.getNotifications(attendee.userId);
          const alreadySent = existingNotifications.some(
            notif => notif.eventId === event.id && 
                     notif.type === 'event_reminder_1h' &&
                     notif.createdAt && new Date(notif.createdAt).getTime() > (Date.now() - 2 * 60 * 60 * 1000) // Within last 2 hours
          );
          
          if (!alreadySent) {
            await storage.createNotification({
              userId: attendee.userId,
              type: "event_reminder_1h",
              title: "⚡ Event Starting Soon!",
              message: `"${event.title}" starts in about 1 hour at ${formattedTime}. Get ready! Location: ${event.location}`,
              eventId: event.id,
            });
            console.log(`✅ 1-hour reminder sent to user: ${attendee.userId}`);
          }
        } catch (error) {
          console.error(`❌ Failed to send 1-hour reminder to user ${attendee.userId}:`, error);
        }
      }
    } catch (error) {
      console.error("Error sending 1-hour reminder:", error);
    }
  }
}

// Export singleton instance
export const eventReminderSystem = new EventReminderSystem();