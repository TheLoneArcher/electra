import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventCategories = pgTable("event_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: varchar("category_id").notNull(),
  hostId: varchar("host_id").notNull(),
  location: text("location").notNull(),
  dateTime: timestamp("date_time").notNull(),
  capacity: integer("capacity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  isPaid: boolean("is_paid").default(false),
  tags: jsonb("tags").$type<string[]>().default([]),
  imageUrl: text("image_url"),
  status: text("status").default("upcoming"), // upcoming, ongoing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const rsvps = pgTable("rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  status: text("status").notNull(), // attending, maybe, not_attending
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventReviews = pgTable("event_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventPhotos = pgTable("event_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull(),
  userId: varchar("user_id").notNull(),
  url: text("url").notNull(),
  caption: text("caption"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // rsvp_update, event_reminder, event_update
  eventId: varchar("event_id"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertRsvpSchema = createInsertSchema(rsvps).omit({
  id: true,
  createdAt: true,
});

export const insertEventReviewSchema = createInsertSchema(eventReviews).omit({
  id: true,
  createdAt: true,
});

export const insertEventPhotoSchema = createInsertSchema(eventPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type EventCategory = typeof eventCategories.$inferSelect;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Rsvp = typeof rsvps.$inferSelect;
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;

export type EventReview = typeof eventReviews.$inferSelect;
export type InsertEventReview = z.infer<typeof insertEventReviewSchema>;

export type EventPhoto = typeof eventPhotos.$inferSelect;
export type InsertEventPhoto = z.infer<typeof insertEventPhotoSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
