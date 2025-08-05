# Event Organizing Platform

## Overview

The Event Organizing Platform is a full-stack web application that enables users to create, discover, and participate in local and college-level events. The platform features a modern React frontend with Express.js backend, PostgreSQL database with Drizzle ORM, and integrates Google authentication and calendar synchronization. Users can browse events by categories, RSVP to events, leave reviews, and receive notifications. The application supports both light and dark themes with a responsive design using Tailwind CSS and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for client-side routing with declarative route definitions
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form schemas
- **Styling**: Tailwind CSS with CSS variables for theming, PostCSS for processing

The frontend follows a component-based architecture with reusable UI components, custom hooks for business logic, and centralized query management. The application supports both light and dark themes through a context-based theme provider.

### Backend Architecture
- **Framework**: Express.js with TypeScript for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Session Management**: In-memory storage abstraction (prepared for database-backed sessions)
- **Error Handling**: Centralized error middleware with structured error responses

The backend implements a layered architecture with route handlers, storage abstraction layer, and clear separation of concerns. The storage interface provides a clean API for data operations while abstracting the underlying database implementation.

### Database Schema Design
- **Users Table**: Stores user profiles with Google OAuth integration (email, name, avatar, googleId)
- **Event Categories**: Predefined categories with icons and colors for event classification
- **Events Table**: Core event data including title, description, location, datetime, capacity, pricing
- **RSVPs Table**: Many-to-many relationship between users and events with status tracking
- **Event Reviews**: User feedback system with ratings and comments for completed events
- **Event Photos**: Support for multiple images per event
- **Notifications**: User notification system for event updates and reminders

The schema uses UUID primary keys, proper foreign key relationships, and JSON fields for flexible data like tags and metadata.

### Authentication & Authorization
- **OAuth Provider**: Google Sign-In integration for user authentication
- **Session Management**: Prepared infrastructure for session-based authentication
- **Authorization**: Role-based access control for different user types (attendees, hosts, admins)

### External Service Integrations
- **Google Calendar API**: Automatic event synchronization to user calendars upon RSVP
- **Google Maps API**: Location services for event venues and mapping
- **Image Storage**: Support for event image uploads and management
- **Email Service**: Notification delivery system for event updates and reminders

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **express**: Web application framework for the REST API server
- **react**: Frontend framework with TypeScript support
- **@tanstack/react-query**: Server state management and caching library

### UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialog, dropdown, form controls)
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe utility for conditional CSS classes
- **lucide-react**: Modern icon library with React components

### Development and Build Tools
- **vite**: Fast build tool and development server with React plugin
- **typescript**: Type checking and development tooling
- **drizzle-kit**: Database migration and schema management CLI
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay for Replit environment

### Form and Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Integration adapters for validation libraries
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Automatic Zod schema generation from Drizzle tables

### Additional Libraries
- **wouter**: Lightweight client-side routing library
- **date-fns**: Modern date utility library for formatting and manipulation
- **recharts**: Composable charting library for analytics dashboards
- **embla-carousel-react**: Touch-friendly carousel component for image galleries