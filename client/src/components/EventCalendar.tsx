import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  dateTime: string;
  category?: {
    name: string;
    color: string;
  };
}

export function EventCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { user } = useAuth();

  // Get user's RSVP'd events
  const { data: userRsvps = [] } = useQuery({
    queryKey: ["/api/my-rsvps"],
    enabled: !!user,
  });

  // Filter for events user is attending
  const attendingEvents = userRsvps.filter((rsvp: any) => 
    rsvp.event && rsvp.status === "attending"
  ).map((rsvp: any) => rsvp.event);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDay = (day: Date) => {
    return attendingEvents.filter((event: CalendarEvent) => 
      isSameDay(new Date(event.dateTime), day)
    );
  };

  const categoryColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          My Event Calendar
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[80px] p-1 border rounded-lg transition-colors ${
                  isCurrentMonth 
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" 
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400"
                } ${isDayToday ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950" : ""}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isDayToday 
                    ? "text-blue-600 dark:text-blue-400" 
                    : isCurrentMonth 
                      ? "text-gray-900 dark:text-white" 
                      : "text-gray-400"
                }`}>
                  {format(day, "d")}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event: CalendarEvent, index: number) => {
                    const eventTime = format(new Date(event.dateTime), "h:mm a");
                    const bgColor = event.category 
                      ? categoryColorMap[event.category.color] || "bg-gray-500"
                      : "bg-gray-500";
                    
                    return (
                      <div
                        key={`${event.id}-${index}`}
                        className={`text-xs px-1 py-0.5 rounded text-white truncate ${bgColor}`}
                        title={`${event.title} at ${eventTime}`}
                      >
                        {event.title}
                      </div>
                    );
                  })}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        {attendingEvents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(attendingEvents.map((event: CalendarEvent) => event.category?.name).filter(Boolean)))
                .map((categoryName) => {
                  const category = attendingEvents.find((event: CalendarEvent) => event.category?.name === categoryName)?.category;
                  const bgColor = category ? categoryColorMap[category.color] || "bg-gray-500" : "bg-gray-500";
                  
                  return (
                    <Badge key={categoryName} variant="secondary" className={`${bgColor} text-white`}>
                      {categoryName}
                    </Badge>
                  );
                })}
            </div>
          </div>
        )}

        {attendingEvents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No events scheduled</p>
            <p className="text-xs">RSVP to events to see them here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}