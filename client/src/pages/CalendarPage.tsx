import Navbar from "@/components/Navbar";
import { EventCalendar } from "@/components/EventCalendar";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Event Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View all your RSVP'd events in calendar format
          </p>
        </div>
        
        <EventCalendar />
      </div>
    </div>
  );
}