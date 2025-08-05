import { db } from "./db";
import { users, events, eventCategories, rsvps } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await db.delete(rsvps);
    await db.delete(events);
    await db.delete(users);
    await db.delete(eventCategories);

    // Insert categories
    const categories = [
      { id: "cat-1", name: "Music", icon: "Music", color: "blue" },
      { id: "cat-2", name: "Tech", icon: "Laptop", color: "green" },
      { id: "cat-3", name: "Art", icon: "Palette", color: "purple" },
      { id: "cat-4", name: "Sports", icon: "Trophy", color: "red" },
      { id: "cat-5", name: "Food", icon: "Utensils", color: "yellow" },
      { id: "cat-6", name: "Education", icon: "GraduationCap", color: "indigo" },
    ];

    await db.insert(eventCategories).values(categories);
    console.log("✅ Categories seeded");

    // Insert sample users
    const sampleUsers = [
      {
        id: "user-1",
        email: "john@example.com",
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        googleId: null,
      },
      {
        id: "user-2", 
        email: "sarah@example.com",
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
        googleId: null,
      },
      {
        id: "user-3",
        email: "mike@example.com", 
        name: "Mike Rodriguez",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        googleId: null,
      }
    ];

    await db.insert(users).values(sampleUsers);
    console.log("✅ Users seeded");

    // Insert sample events
    const sampleEvents = [
      {
        id: "event-1",
        title: "React Workshop 2024",
        description: "Learn modern React development with hooks, context, and best practices. Perfect for developers looking to level up their skills.",
        categoryId: "cat-2",
        hostId: "user-1", 
        location: "Tech Hub Downtown, Room 301",
        dateTime: new Date("2024-12-20T14:00:00Z"),
        capacity: 50,
        price: "49.99",
        isPaid: true,
        tags: ["react", "javascript", "frontend"],
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
        status: "upcoming",
      },
      {
        id: "event-2",
        title: "Local Art Exhibition",
        description: "Discover amazing works from emerging local artists. A celebration of creativity and community expression.",
        categoryId: "cat-3",
        hostId: "user-2",
        location: "City Art Gallery, Main Hall",
        dateTime: new Date("2024-12-22T18:00:00Z"),
        capacity: 100,
        price: "0.00", 
        isPaid: false,
        tags: ["art", "community", "exhibition"],
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
        status: "upcoming",
      },
      {
        id: "event-3",
        title: "Indie Music Night",
        description: "An evening of live indie music featuring local bands and special guest performers. Food and drinks available.",
        categoryId: "cat-1",
        hostId: "user-3",
        location: "Riverside Park Amphitheater",
        dateTime: new Date("2024-12-25T19:30:00Z"),
        capacity: 200,
        price: "25.00",
        isPaid: true,
        tags: ["music", "live", "indie"],
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop",
        status: "upcoming",
      },
      {
        id: "event-4",
        title: "Basketball Tournament",
        description: "Join us for an exciting 3v3 basketball tournament. All skill levels welcome. Prizes for winners!",
        categoryId: "cat-4",
        hostId: "user-1",
        location: "Community Sports Center",
        dateTime: new Date("2024-12-28T10:00:00Z"),
        capacity: 24,
        price: "15.00",
        isPaid: true,
        tags: ["basketball", "tournament", "sports"],
        imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=400&fit=crop",
        status: "upcoming",
      },
      {
        id: "event-5",
        title: "Food Truck Festival",
        description: "Sample delicious food from local food trucks. Live music, family activities, and great eats!",
        categoryId: "cat-5",
        hostId: "user-2",
        location: "Central Park",
        dateTime: new Date("2024-12-30T12:00:00Z"),
        capacity: 500,
        price: "0.00",
        isPaid: false,
        tags: ["food", "festival", "family"],
        imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop",
        status: "upcoming",
      },
      {
        id: "event-6",
        title: "Python for Beginners",
        description: "Learn Python programming from scratch. No prior experience required. Laptops provided.",
        categoryId: "cat-6",
        hostId: "user-3",
        location: "Library Learning Center",
        dateTime: new Date("2025-01-05T09:00:00Z"),
        capacity: 30,
        price: "39.99",
        isPaid: true,
        tags: ["python", "programming", "beginners"],
        imageUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop",
        status: "upcoming",
      }
    ];

    await db.insert(events).values(sampleEvents);
    console.log("✅ Events seeded");

    // Insert sample RSVPs
    const sampleRsvps = [
      { id: "rsvp-1", eventId: "event-1", userId: "user-2", status: "attending" },
      { id: "rsvp-2", eventId: "event-1", userId: "user-3", status: "attending" },
      { id: "rsvp-3", eventId: "event-2", userId: "user-1", status: "attending" },
      { id: "rsvp-4", eventId: "event-2", userId: "user-3", status: "maybe" },
      { id: "rsvp-5", eventId: "event-3", userId: "user-1", status: "attending" },
      { id: "rsvp-6", eventId: "event-3", userId: "user-2", status: "attending" },
      { id: "rsvp-7", eventId: "event-4", userId: "user-2", status: "attending" },
      { id: "rsvp-8", eventId: "event-5", userId: "user-1", status: "attending" },
      { id: "rsvp-9", eventId: "event-5", userId: "user-3", status: "attending" },
      { id: "rsvp-10", eventId: "event-6", userId: "user-2", status: "maybe" },
    ];

    await db.insert(rsvps).values(sampleRsvps);
    console.log("✅ RSVPs seeded");

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (process.argv[1] === __filename) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedDatabase };