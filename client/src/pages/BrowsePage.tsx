import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Search, Filter, Eye, Clock, Star } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  capacity: number;
  isPaid: boolean;
  price: number | null;
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  attendingCount: number;
  averageRating?: number;
}

export default function BrowsePage() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [eventType, setEventType] = useState("all");

  // Fetch events (will work without authentication for browsing)
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events", { search: searchQuery, category: selectedCategory === "all" ? undefined : selectedCategory }],
    enabled: true,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    enabled: true,
  });

  const filteredEvents = (events as Event[]).filter((event: Event) => {
    if (eventType === "free" && event.isPaid) return false;
    if (eventType === "paid" && !event.isPaid) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 animate-pulse-slow"></div>
      
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Browse Events
                </span>
              </h1>
              <p className="text-gray-300">Discover amazing events happening around you</p>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleTheme} 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {theme === "light" ? "🌙" : "☀️"}
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              >
                <Eye className="mr-2 h-4 w-4" />
                Sign In to Join
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {(categories as any[]).map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="free">Free Events</SelectItem>
                <SelectItem value="paid">Paid Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event: Event) => (
              <Card 
                key={event.id} 
                className="bg-gray-900/30 border-gray-700 hover:bg-gray-800/50 transition-all duration-300 backdrop-blur-sm group hover:border-blue-500/50"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                    >
                      {event.category.name}
                    </Badge>
                    {event.isPaid ? (
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        ${event.price}
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        Free
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white group-hover:text-blue-300 transition-colors">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-gray-300">
                    {event.description}
                  </CardDescription>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(event.startDateTime)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{event.attendingCount}/{event.capacity}</span>
                      </div>
                      
                      {event.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{event.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300"
                    onClick={() => window.location.href = '/'}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Sign In to RSVP
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}