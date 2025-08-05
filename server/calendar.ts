import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REPLIT_DOMAIN ? `https://${process.env.REPLIT_DOMAIN}/api/calendar/callback` : 'http://localhost:5000/api/calendar/callback'
);

export async function createCalendarEvent(accessToken: string, event: any) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const calendarEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.dateTime,
        timeZone: 'America/New_York', // You can make this dynamic
      },
      end: {
        dateTime: new Date(new Date(event.dateTime).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Add 2 hours
        timeZone: 'America/New_York',
      },
      attendees: event.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function getCalendarAuthUrl(userId: string) {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId, // Pass user ID to identify after callback
  });

  return authUrl;
}

export async function exchangeCodeForTokens(code: string) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}