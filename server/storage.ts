import { 
  type User, 
  type InsertUser, 
  type Event, 
  type InsertEvent,
  type EventCategory,
  type Rsvp,
  type InsertRsvp,
  type EventReview,
  type InsertEventReview,
  type EventPhoto,
  type InsertEventPhoto,
  type Notification,
  type InsertNotification
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Event Categories
  getEventCategories(): Promise<EventCategory[]>;
  getEventCategory(id: string): Promise<EventCategory | undefined>;
  
  // Additional user operations
  getUserByEmail(email: string): Promise<User | undefined>;
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;

  // Events
  getEvents(filters?: { 
    category?: string; 
    isPaid?: boolean; 
    status?: string; 
    hostId?: string;
    search?: string;
  }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // RSVPs
  getRsvpsByEvent(eventId: string): Promise<Rsvp[]>;
  getRsvpsByUser(userId: string): Promise<Rsvp[]>;
  getRsvp(eventId: string, userId: string): Promise<Rsvp | undefined>;
  createRsvp(rsvp: InsertRsvp): Promise<Rsvp>;
  updateRsvp(eventId: string, userId: string, status: string): Promise<Rsvp | undefined>;
  deleteRsvp(eventId: string, userId: string): Promise<boolean>;

  // Reviews
  getEventReviews(eventId: string): Promise<EventReview[]>;
  createEventReview(review: InsertEventReview): Promise<EventReview>;

  // Photos
  getEventPhotos(eventId: string): Promise<EventPhoto[]>;
  createEventPhoto(photo: InsertEventPhoto): Promise<EventPhoto>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private eventCategories: Map<string, EventCategory> = new Map();
  private events: Map<string, Event> = new Map();
  private rsvps: Map<string, Rsvp> = new Map();
  private eventReviews: Map<string, EventReview> = new Map();
  private eventPhotos: Map<string, EventPhoto> = new Map();
  private notifications: Map<string, Notification> = new Map();

  constructor() {
    this.initializeCategories();
    this.initializeSampleData();
  }

  private initializeCategories() {
    const categories: EventCategory[] = [
      { id: "1", name: "Music", icon: "fas fa-music", color: "blue" },
      { id: "2", name: "Tech", icon: "fas fa-laptop-code", color: "green" },
      { id: "3", name: "Art", icon: "fas fa-palette", color: "purple" },
      { id: "4", name: "Sports", icon: "fas fa-running", color: "red" },
      { id: "5", name: "Food", icon: "fas fa-utensils", color: "yellow" },
      { id: "6", name: "Education", icon: "fas fa-graduation-cap", color: "indigo" },
    ];

    categories.forEach(category => {
      this.eventCategories.set(category.id, category);
    });
  }

  private initializeSampleData() {
    // Sample user
    const sampleUser: User = {
      id: "sample-user-1",
      email: "john@example.com",
      name: "John Doe",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      googleId: null,
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);

    // Sample events
    const sampleEvents: Event[] = [
      {
        id: "event-1",
        title: "Web Development Bootcamp 2024",
        description: "Join us for an intensive 3-day bootcamp covering modern web development technologies including React, Node.js, and cloud deployment.",
        categoryId: "2",
        organizerId: "sample-user-1",
        location: "Tech Hub, Downtown Campus",
        dateTime: new Date("2024-12-15T09:00:00Z"),
        capacity: 50,
        price: "49.00",
        isPaid: true,
        tags: ["react", "nodejs", "programming"],
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "upcoming",
        createdAt: new Date(),
      },
      {
        id: "event-2",
        title: "Contemporary Art Exhibition",
        description: "Explore the latest works from emerging local artists in this curated exhibition featuring contemporary paintings and digital art.",
        categoryId: "3",
        organizerId: "sample-user-1",
        location: "City Art Gallery, Arts District",
        dateTime: new Date("2024-12-18T18:00:00Z"),
        capacity: 100,
        price: "0.00",
        isPaid: false,
        tags: ["art", "exhibition", "local"],
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "upcoming",
        createdAt: new Date(),
      },
      {
        id: "event-3",
        title: "Indie Music Festival 2024",
        description: "A night of amazing indie music featuring local bands and special guest performers. Food trucks and craft beverages available.",
        categoryId: "1",
        organizerId: "sample-user-1",
        location: "Riverside Park Amphitheater",
        dateTime: new Date("2024-12-22T19:00:00Z"),
        capacity: 200,
        price: "25.00",
        isPaid: true,
        tags: ["music", "festival", "indie"],
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        status: "upcoming",
        createdAt: new Date(),
      },
    ];

    sampleEvents.forEach(event => {
      this.events.set(event.id, event);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.googleId === googleId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      avatar: insertUser.avatar || null,
      googleId: insertUser.googleId || null,
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.organizerId === organizerId);
  }

  // Event Categories
  async getEventCategories(): Promise<EventCategory[]> {
    return Array.from(this.eventCategories.values());
  }

  async getEventCategory(id: string): Promise<EventCategory | undefined> {
    return this.eventCategories.get(id);
  }

  // Events
  async getEvents(filters?: { 
    category?: string; 
    isPaid?: boolean; 
    status?: string; 
    hostId?: string;
    search?: string;
  }): Promise<Event[]> {
    let events = Array.from(this.events.values());

    if (filters?.category) {
      events = events.filter(event => event.categoryId === filters.category);
    }
    if (filters?.isPaid !== undefined) {
      events = events.filter(event => event.isPaid === filters.isPaid);
    }
    if (filters?.status) {
      events = events.filter(event => event.status === filters.status);
    }
    if (filters?.hostId) {
      events = events.filter(event => event.organizerId === filters.hostId);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      );
    }

    return events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      status: insertEvent.status || "upcoming",
      imageUrl: insertEvent.imageUrl || null,
      id, 
      createdAt: new Date() 
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updates };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  async getEventsByHost(hostId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.organizerId === hostId);
  }

  // RSVPs
  async getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.eventId === eventId);
  }

  async getRsvpsByUser(userId: string): Promise<Rsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.userId === userId);
  }

  async getRsvp(eventId: string, userId: string): Promise<Rsvp | undefined> {
    return Array.from(this.rsvps.values()).find(
      rsvp => rsvp.eventId === eventId && rsvp.userId === userId
    );
  }

  async createRsvp(insertRsvp: InsertRsvp): Promise<Rsvp> {
    const id = randomUUID();
    const rsvp: Rsvp = { 
      ...insertRsvp, 
      id, 
      createdAt: new Date() 
    };
    this.rsvps.set(id, rsvp);
    return rsvp;
  }

  async updateRsvp(eventId: string, userId: string, status: string): Promise<Rsvp | undefined> {
    const rsvp = await this.getRsvp(eventId, userId);
    if (!rsvp) return undefined;
    
    const updatedRsvp = { ...rsvp, status };
    this.rsvps.set(rsvp.id, updatedRsvp);
    return updatedRsvp;
  }

  async deleteRsvp(eventId: string, userId: string): Promise<boolean> {
    const rsvp = await this.getRsvp(eventId, userId);
    if (!rsvp) return false;
    
    return this.rsvps.delete(rsvp.id);
  }

  // Reviews
  async getEventReviews(eventId: string): Promise<EventReview[]> {
    return Array.from(this.eventReviews.values()).filter(review => review.eventId === eventId);
  }

  async createEventReview(insertReview: InsertEventReview): Promise<EventReview> {
    const id = randomUUID();
    const review: EventReview = { 
      ...insertReview, 
      id, 
      createdAt: new Date() 
    };
    this.eventReviews.set(id, review);
    return review;
  }

  // Photos
  async getEventPhotos(eventId: string): Promise<EventPhoto[]> {
    return Array.from(this.eventPhotos.values()).filter(photo => photo.eventId === eventId);
  }

  async createEventPhoto(insertPhoto: InsertEventPhoto): Promise<EventPhoto> {
    const id = randomUUID();
    const photo: EventPhoto = { 
      ...insertPhoto, 
      id, 
      createdAt: new Date() 
    };
    this.eventPhotos.set(id, photo);
    return photo;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      isRead: insertNotification.isRead || false,
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }
}

export const storage = new MemStorage();

// Categories are initialized in the constructor
