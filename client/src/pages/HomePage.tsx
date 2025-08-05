import { useState } from "react";
import { Search, MapPin, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { EventCard } from "@/components/EventCard";
import { CategoryCard } from "@/components/CategoryCard";
import { CreateEventModal } from "@/components/CreateEventModal";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [eventType, setEventType] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", searchQuery, selectedCategory, eventType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== "all") params.append('category', selectedCategory);
      if (eventType === "paid") params.append('isPaid', 'true');
      if (eventType === "free") params.append('isPaid', 'false');
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId);
  };

  const handleCalendarSync = async () => {
    try {
      const response = await fetch('/api/calendar/auth-url');
      const data = await response.json();
      if (data.authUrl) {
        window.open(data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Failed to get calendar auth URL:', error);
    }
  };

  const heroStyle = {
    backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.7), rgba(139, 92, 246, 0.7)), url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={heroStyle}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-4xl mx-auto px-4">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Discover Amazing Events
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Create, discover, and participate in local events and community gatherings
              </p>
              
              {/* Search Bar */}
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Location"
                    className="w-full md:w-48 pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 font-semibold">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 font-semibold"
            >
              <Plus className="h-5 w-5" />
              <span>Create Event</span>
            </Button>
            <Button 
              onClick={handleCalendarSync}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-semibold"
            >
              <Calendar className="h-5 w-5" />
              <span>Sync Calendar</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.isArray(categories) && categories.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                eventCount={42} // Mock count
                onClick={() => handleCategorySelect(category.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
              Upcoming Events
            </h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Cards Grid */}
          {eventsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-96 rounded-xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events?.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {events && events.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No events found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search criteria or create a new event.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {events && events.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" className="px-8 py-3 font-semibold">
                Load More Events
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg hover:shadow-xl float-animation z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
