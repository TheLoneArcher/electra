interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  timeZone?: string;
}

interface GoogleCalendarResponse {
  success: boolean;
  eventId?: string;
  error?: string;
}

class CalendarService {
  private isGapiLoaded = false;
  private isGapiInitialized = false;

  async loadGoogleCalendarAPI(): Promise<void> {
    if (this.isGapiLoaded) return;

    return new Promise((resolve, reject) => {
      if (window.gapi) {
        this.isGapiLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.isGapiLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Google Calendar API'));
      document.head.appendChild(script);
    });
  }

  async initializeGoogleCalendar(): Promise<void> {
    if (this.isGapiInitialized) return;

    await this.loadGoogleCalendarAPI();

    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || "",
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "",
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
            scope: 'https://www.googleapis.com/auth/calendar.events'
          });
          
          this.isGapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async addEventToCalendar(event: CalendarEvent): Promise<GoogleCalendarResponse> {
    try {
      await this.initializeGoogleCalendar();

      // Check if user is signed in
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      // Calculate end time (default to 2 hours after start)
      const startDate = new Date(event.startDateTime);
      const endDate = new Date(event.endDateTime || new Date(startDate.getTime() + 2 * 60 * 60 * 1000));

      const calendarEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      };

      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: calendarEvent,
      });

      return {
        success: true,
        eventId: response.result.id,
      };
    } catch (error) {
      console.error('Failed to add event to calendar:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async updateCalendarEvent(eventId: string, event: CalendarEvent): Promise<GoogleCalendarResponse> {
    try {
      await this.initializeGoogleCalendar();

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const startDate = new Date(event.startDateTime);
      const endDate = new Date(event.endDateTime || new Date(startDate.getTime() + 2 * 60 * 60 * 1000));

      const calendarEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: calendarEvent,
      });

      return {
        success: true,
        eventId: response.result.id,
      };
    } catch (error) {
      console.error('Failed to update calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async removeCalendarEvent(eventId: string): Promise<GoogleCalendarResponse> {
    try {
      await this.initializeGoogleCalendar();

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to remove calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getCalendarEvents(startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    try {
      await this.initializeGoogleCalendar();

      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const timeMin = startDate ? startDate.toISOString() : new Date().toISOString();
      const timeMax = endDate ? endDate.toISOString() : undefined;

      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.result.items.map((item: any) => ({
        id: item.id,
        title: item.summary,
        description: item.description || '',
        location: item.location || '',
        startDateTime: item.start.dateTime || item.start.date,
        endDateTime: item.end.dateTime || item.end.date,
        timeZone: item.start.timeZone,
      }));
    } catch (error) {
      console.error('Failed to get calendar events:', error);
      return [];
    }
  }

  // Helper method to create Google Calendar quick add link
  createQuickAddLink(event: CalendarEvent): string {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.formatDateForGoogle(event.startDateTime)}/${this.formatDateForGoogle(event.endDateTime || event.startDateTime)}`,
      details: event.description,
      location: event.location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private formatDateForGoogle(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  // Create calendar download file (.ics)
  createICSFile(event: CalendarEvent): string {
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime || new Date(startDate.getTime() + 2 * 60 * 60 * 1000));
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventHub//EventHub Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@eventhub.com`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Event Reminder',
      'TRIGGER:-PT1H',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    return icsContent;
  }

  downloadICSFile(event: CalendarEvent): void {
    const icsContent = this.createICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const calendarService = new CalendarService();

import { useState } from "react";

// React hook for calendar operations
export function useCalendar() {
  const [isLoading, setIsLoading] = useState(false);

  const addToCalendar = async (event: CalendarEvent): Promise<GoogleCalendarResponse> => {
    setIsLoading(true);
    try {
      const result = await calendarService.addEventToCalendar(event);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvent = async (eventId: string, event: CalendarEvent): Promise<GoogleCalendarResponse> => {
    setIsLoading(true);
    try {
      const result = await calendarService.updateCalendarEvent(eventId, event);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvent = async (eventId: string): Promise<GoogleCalendarResponse> => {
    setIsLoading(true);
    try {
      const result = await calendarService.removeCalendarEvent(eventId);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const downloadEvent = (event: CalendarEvent): void => {
    calendarService.downloadICSFile(event);
  };

  const getQuickAddLink = (event: CalendarEvent): string => {
    return calendarService.createQuickAddLink(event);
  };

  return {
    isLoading,
    addToCalendar,
    updateEvent,
    removeEvent,
    downloadEvent,
    getQuickAddLink,
  };
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}
