import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import type { Express } from 'express';
import { storage } from './storage';

export function setupAuth(app: Express) {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Google OAuth Strategy - Fix redirect URI
  const domain = process.env.REPLIT_DOMAINS || process.env.REPL_SLUG + '.' + process.env.REPL_OWNER + '.repl.co';
  const callbackURL = `https://${domain}/api/auth/google/callback`;
    
  // Only set up Google strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL
    },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists
      let user = await storage.getUserByGoogleId(profile.id);
      
      if (user) {
        return done(null, user);
      }

      // Create new user
      user = await storage.createUser({
        name: profile.displayName || '',
        email: profile.emails?.[0]?.value || '',
        avatar: profile.photos?.[0]?.value || null,
        googleId: profile.id
      });

      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
  } else {
    console.warn('Google OAuth credentials not found. Google authentication will be disabled.');
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to get current user (optional auth)
export function getCurrentUser(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    req.currentUser = req.user;
  } else {
    req.currentUser = null;
  }
  next();
}