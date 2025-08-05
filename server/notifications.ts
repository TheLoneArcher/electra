import { storage } from "./storage";

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'event_reminder' | 'event_update' | 'event_cancelled' | 'new_rsvp' | 'calendar_sync';
  eventId?: string;
  isRead: boolean;
  createdAt: Date;
}

export class NotificationManager {
  private notifications: Map<string, NotificationData[]> = new Map();

  async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>) {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationData = {
      ...notification,
      id,
      isRead: false,
      createdAt: new Date(),
    };

    const userNotifications = this.notifications.get(notification.userId) || [];
    userNotifications.unshift(newNotification);
    this.notifications.set(notification.userId, userNotifications);

    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<NotificationData[]> {
    return this.notifications.get(userId) || [];
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    userNotifications.forEach(notification => {
      notification.isRead = true;
    });
    return true;
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const userNotifications = this.notifications.get(userId);
    if (!userNotifications) return false;

    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      userNotifications.splice(index, 1);
      return true;
    }
    return false;
  }

  // Notification generators for specific events
  async notifyEventUpdate(eventId: string, message: string) {
    try {
      const rsvps = await storage.getRsvpsByEvent(eventId);
      const event = await storage.getEvent(eventId);
      
      if (!event) return;

      for (const rsvp of rsvps) {
        if (rsvp.status === 'attending') {
          await this.createNotification({
            userId: rsvp.userId,
            title: 'Event Update',
            message: `${event.title}: ${message}`,
            type: 'event_update',
            eventId,
          });
        }
      }
    } catch (error) {
      console.error('Error sending event update notifications:', error);
    }
  }

  async notifyNewRSVP(eventId: string, userName: string) {
    try {
      const event = await storage.getEvent(eventId);
      if (!event) return;

      await this.createNotification({
        userId: event.hostId,
        title: 'New RSVP',
        message: `${userName} has RSVP'd to your event "${event.title}"`,
        type: 'new_rsvp',
        eventId,
      });
    } catch (error) {
      console.error('Error sending new RSVP notification:', error);
    }
  }

  async notifyEventReminder(eventId: string) {
    try {
      const rsvps = await storage.getRsvpsByEvent(eventId);
      const event = await storage.getEvent(eventId);
      
      if (!event) return;

      const eventDate = new Date(event.dateTime);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Only send reminders for events happening tomorrow
      if (eventDate.toDateString() === tomorrow.toDateString()) {
        for (const rsvp of rsvps) {
          if (rsvp.status === 'attending') {
            await this.createNotification({
              userId: rsvp.userId,
              title: 'Event Reminder',
              message: `Don't forget: "${event.title}" is tomorrow at ${eventDate.toLocaleTimeString()}`,
              type: 'event_reminder',
              eventId,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending event reminders:', error);
    }
  }

  async notifyCalendarSync(userId: string, success: boolean, eventTitle: string) {
    await this.createNotification({
      userId,
      title: success ? 'Calendar Synced' : 'Calendar Sync Failed',
      message: success 
        ? `"${eventTitle}" has been added to your Google Calendar`
        : `Failed to sync "${eventTitle}" to your Google Calendar. Please try again.`,
      type: 'calendar_sync',
    });
  }
}

export const notificationManager = new NotificationManager();

// Background job to send daily reminders (in a real app, you'd use a cron job)
setInterval(async () => {
  try {
    const events = await storage.getEvents({});
    for (const event of events) {
      await notificationManager.notifyEventReminder(event.id);
    }
  } catch (error) {
    console.error('Error in daily reminder job:', error);
  }
}, 24 * 60 * 60 * 1000); // Run daily