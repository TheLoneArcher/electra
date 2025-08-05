import { useState } from "react";
import { Calendar, CheckCircle, Crown, Users, ExternalLink, Clock, Music, Gamepad2, Coffee, Briefcase, Heart, GraduationCap, MapPin, Palette, Trophy, Plus, MoreHorizontal, Edit, Megaphone, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { EventDetailsModal } from "@/components/EventDetailsModal";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { data: userRsvps = [] } = useQuery({
    queryKey: ["/api/my-rsvps"],
    enabled: !!user,
  });

  const { data: hostedEvents = [] } = useQuery({
    queryKey: ["/api/my-hosted-events"],
    enabled: !!user,
  });

  const { data: favoriteEvents = [] } = useQuery({
    queryKey: ["/api/users", user?.id, "favorites"],
    enabled: !!user?.id,
  });

  const upcomingEvents = Array.isArray(userRsvps) ? userRsvps.filter((rsvp: any) => 
    rsvp.event && new Date(rsvp.event.dateTime) > new Date() && rsvp.status === "attending"
  ) : [];

  const pastEvents = Array.isArray(userRsvps) ? userRsvps.filter((rsvp: any) => 
    rsvp.event && new Date(rsvp.event.dateTime) < new Date() && rsvp.status === "attending"
  ) : [];

  const stats = [
    {
      title: "Upcoming Events",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Past Events", 
      value: pastEvents.length,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Events Hosted",
      value: Array.isArray(hostedEvents) ? hostedEvents.length : 0,
      icon: Crown,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Total Attendees",
      value: Array.isArray(hostedEvents) ? hostedEvents.reduce((total: number, event: any) => total + (event.attendingCount || 0), 0) : 0,
      icon: Users,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  const tabButtons = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past Events" },
    { id: "hosting", label: "Host Dashboard" },
    { id: "favorites", label: "Favorites" },
  ];

  const getCategoryIcon = (category: any) => {
    if (!category) return Calendar;
    
    const iconMap: Record<string, any> = {
      music: Music,
      technology: Briefcase,
      art: Palette,
      sports: Trophy,
      food: Coffee,
      education: GraduationCap,
      networking: Users,
      health: Heart,
      gaming: Gamepad2,
      travel: MapPin,
    };
    
    return iconMap[category.name?.toLowerCase()] || Calendar;
  };

  const getCategoryColor = (category: any) => {
    if (!category) return "bg-gray-600";
    const colorMap: Record<string, string> = {
      blue: "bg-blue-600",
      green: "bg-green-600",
      purple: "bg-purple-600",
      red: "bg-red-600",
      yellow: "bg-yellow-600",
      indigo: "bg-indigo-600",
    };
    return colorMap[category.color] || "bg-gray-600";
  };

  // Calendar sync mutation
  const calendarSyncMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return apiRequest("POST", `/api/events/${eventId}/sync-calendar`, {});
    },
    onSuccess: (data) => {
      if (data.needsAuth && data.authUrl) {
        // Open authorization window
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        toast({
          title: "Calendar Authorization",
          description: "Please authorize calendar access in the new window to sync this event.",
        });
      } else {
        toast({
          title: "Calendar Sync",
          description: "Event has been added to your Google Calendar!",
        });
      }
    },
    onError: () => {
      toast({
        title: "Calendar Sync Failed",
        description: "Failed to add event to calendar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCalendarSync = (eventId: string) => {
    calendarSyncMutation.mutate(eventId);
  };

  // Event management handlers
  const handleEditEvent = (eventId: string) => {
    // Navigate to edit event page or open edit modal
    toast({
      title: "Edit Event",
      description: "Edit functionality coming soon!",
    });
  };

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [selectedEventForAnnouncement, setSelectedEventForAnnouncement] = useState<string | null>(null);
  const [announcementSubject, setAnnouncementSubject] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  const announcementMutation = useMutation({
    mutationFn: (data: { eventId: string; subject: string; message: string }) =>
      apiRequest("POST", `/api/events/${data.eventId}/announcements`, {
        subject: data.subject,
        message: data.message,
      }),
    onSuccess: (data) => {
      toast({
        title: "Announcement Sent",
        description: `Announcement sent to ${data.recipientCount} attendees`,
      });
      setShowAnnouncementModal(false);
      setAnnouncementSubject("");
      setAnnouncementMessage("");
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Failed to send announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendAnnouncement = (eventId: string) => {
    setSelectedEventForAnnouncement(eventId);
    setShowAnnouncementModal(true);
  };

  const submitAnnouncement = () => {
    if (!selectedEventForAnnouncement || !announcementSubject.trim() || !announcementMessage.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message.",
        variant: "destructive",
      });
      return;
    }

    announcementMutation.mutate({
      eventId: selectedEventForAnnouncement,
      subject: announcementSubject,
      message: announcementMessage,
    });
  };

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => apiRequest("DELETE", `/api/events/${eventId}`),
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
      // Refresh the hosted events list
      window.location.reload();
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Favorites handler
  const favoriteMutation = useMutation({
    mutationFn: (eventId: string) => apiRequest("POST", `/api/events/${eventId}/favorite`, {}),
    onSuccess: (data) => {
      toast({
        title: data.favorited ? "Added to Favorites" : "Removed from Favorites",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteToggle = (eventId: string) => {
    favoriteMutation.mutate(eventId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          My Events Dashboard
        </h1>
        
        {/* Dashboard Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {tabButtons.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold ${activeTab === tab.id ? 'glow' : ''}`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const glowClass = index === 0 ? 'glow' : index === 1 ? 'glow-green' : index === 2 ? 'glow-purple' : 'glow-orange';
            return (
              <Card key={index} className={`bg-white dark:bg-gray-800 ${glowClass} transition-all duration-300 hover:scale-105`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} rounded-full p-3`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* My Upcoming Events */}
        {activeTab === "upcoming" && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                My Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No upcoming events. Browse events to RSVP!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((rsvp: any) => (
                    <div 
                      key={rsvp.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${getCategoryColor(rsvp.event.category)} rounded-lg p-3`}>
                          {(() => {
                            const IconComponent = getCategoryIcon(rsvp.event.category);
                            return <IconComponent className="h-5 w-5 text-white" />;
                          })()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {rsvp.event.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {format(new Date(rsvp.event.dateTime), "MMM dd, yyyy • h:mm a")}
                            </span>
                            {rsvp.event.category && (
                              <Badge variant="secondary">
                                {rsvp.event.category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Add to Calendar"
                          onClick={() => handleCalendarSync(rsvp.event.id)}
                          disabled={calendarSyncMutation.isPending}
                          data-testid={`button-calendar-sync-${rsvp.event.id}`}
                        >
                          <Calendar className="h-4 w-4 text-primary" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View Details"
                          onClick={() => setSelectedEventId(rsvp.event.id)}
                          data-testid={`button-view-details-${rsvp.event.id}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Past Events */}
        {activeTab === "past" && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Past Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No past events yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pastEvents.map((rsvp: any) => (
                    <div 
                      key={rsvp.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`${getCategoryColor(rsvp.event.category)} rounded-lg p-3`}>
                          {(() => {
                            const IconComponent = getCategoryIcon(rsvp.event.category);
                            return <IconComponent className="h-5 w-5 text-white" />;
                          })()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {rsvp.event.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(rsvp.event.dateTime), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Attended
                        </Badge>
                        <div className="mt-2 flex space-x-2">
                          <Button variant="outline" size="sm">
                            Rate & Review
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleFavoriteToggle(rsvp.event.id)}
                            title="Add to Favorites"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Host Dashboard */}
        {activeTab === "hosting" && (
          <div className="space-y-6">
            {/* Created Events Section */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    My Created Events ({Array.isArray(hostedEvents) ? hostedEvents.length : 0})
                  </CardTitle>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => window.location.href = '/create'}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Array.isArray(hostedEvents) && hostedEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You haven't created any events yet.
                    </p>
                    <Button 
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => window.location.href = '/create'}
                    >
                      Create Your First Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(hostedEvents) && hostedEvents.map((event: any) => (
                      <div 
                        key={event.id} 
                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className={`${getCategoryColor(event.category)} rounded-lg p-3`}>
                              {(() => {
                                const IconComponent = getCategoryIcon(event.category);
                                return <IconComponent className="h-5 w-5 text-white" />;
                              })()}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                                {event.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                                {event.description}
                              </p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {format(new Date(event.dateTime), "MMM dd, yyyy")}
                                </span>
                                <span className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {event.location}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.attendingCount || 0}/{event.capacity} attending
                                </span>
                                <span className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {event.isPaid ? `$${event.price}` : "Free"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedEventId(event.id)}
                              data-testid={`button-view-details-${event.id}`}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full">
                                  <MoreHorizontal className="h-4 w-4 mr-1" />
                                  Manage
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Event
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleSendAnnouncement(event.id)}>
                                  <Megaphone className="h-4 w-4 mr-2" />
                                  Send Announcement
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCalendarSync(event.id)}>
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Add to Calendar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Event
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Favorite Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(favoriteEvents) && favoriteEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No favorite events yet. Heart some events to see them here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(favoriteEvents) && favoriteEvents.map((favorite: any) => {
                    // Get the event data from the favorite
                    const event = favorite.event;
                    if (!event) return null;
                    
                    return (
                      <div 
                        key={favorite.id} 
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`${getCategoryColor(event.category)} rounded-lg p-3`}>
                            {(() => {
                              const IconComponent = getCategoryIcon(event.category);
                              return <IconComponent className="h-5 w-5 text-white" />;
                            })()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {format(new Date(event.dateTime), "MMM dd, yyyy • h:mm a")}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEventId(event.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEventId && (
        <EventDetailsModal
          eventId={selectedEventId}
          isOpen={!!selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
      )}

      {/* Announcement Modal */}
      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={announcementSubject}
                onChange={(e) => setAnnouncementSubject(e.target.value)}
                placeholder="Enter announcement subject..."
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={announcementMessage}
                onChange={(e) => setAnnouncementMessage(e.target.value)}
                placeholder="Enter announcement message..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAnnouncementModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAnnouncement}
              disabled={announcementMutation.isPending}
            >
              {announcementMutation.isPending ? "Sending..." : "Send Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
