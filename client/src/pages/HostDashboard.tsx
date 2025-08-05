import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Megaphone, Camera, TrendingUp, Users, DollarSign, MoreHorizontal, Edit, Trash2, Clock, Crown, Lightbulb, Music, Gamepad2, Coffee, Briefcase, Heart, GraduationCap, MapPin, Palette, Trophy } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import { CreateEventModal } from "@/components/CreateEventModal";
import { format } from "date-fns";

// Helper function to generate chart data from real events
const generateChartData = (events: any[]) => {
  if (!events || events.length === 0) {
    return {
      rsvpData: [],
      eventPerformanceData: [],
      recentRsvps: []
    };
  }

  // Generate RSVP data based on real events
  const rsvpData = events.slice(0, 4).map((event, index) => ({
    name: `Week ${index + 1}`,
    rsvps: event.attendingCount || 0
  }));

  // Generate performance data based on real events  
  const eventPerformanceData = events.slice(0, 5).map((event, index) => ({
    name: new Date(event.dateTime).toLocaleDateString('en', { month: 'short' }) || `Month ${index + 1}`,
    events: 1,
    attendance: Math.round((event.attendingCount / event.capacity) * 100) || 0
  }));

  return { rsvpData, eventPerformanceData, recentRsvps: [] };
};

// Category icon mapping
const getCategoryIcon = (category: any) => {
  const categoryIconMap: { [key: string]: any } = {
    'music': Music,
    'gaming': Gamepad2,
    'social': Coffee,
    'professional': Briefcase,
    'lifestyle': Heart,
    'education': GraduationCap,
    'travel': MapPin,
    'art': Palette,
    'sports': Trophy,
  };
  return categoryIconMap[category?.name?.toLowerCase()] || Heart;
};

// Category color mapping
const getCategoryColor = (category: any) => {
  const categoryColorMap: { [key: string]: string } = {
    'music': 'bg-purple-500',
    'gaming': 'bg-green-500',
    'social': 'bg-blue-500',
    'professional': 'bg-gray-600',
    'lifestyle': 'bg-pink-500',
    'education': 'bg-indigo-500',
    'travel': 'bg-orange-500',
    'art': 'bg-yellow-500',
    'sports': 'bg-red-500',
  };
  return categoryColorMap[category?.name?.toLowerCase()] || 'bg-blue-500';
};

export default function HostDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [announcementSubject, setAnnouncementSubject] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoCaption, setPhotoCaption] = useState("");
  const [selectedEventForAnnouncement, setSelectedEventForAnnouncement] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: hostedEvents = [] } = useQuery({
    queryKey: ["/api/my-hosted-events"],
    enabled: !!user,
  });

  const totalAttendees = Array.isArray(hostedEvents) ? hostedEvents.reduce((total: number, event: any) => total + (event.attendingCount || 0), 0) : 0;
  const totalRevenue = Array.isArray(hostedEvents) ? hostedEvents.reduce((total: number, event: any) => total + (parseFloat(event.price || "0") * (event.attendingCount || 0)), 0) : 0;
  const avgAttendanceRate = hostedEvents.length > 0 ? Math.round(hostedEvents.reduce((total: number, event: any) => total + ((event.attendingCount || 0) / (event.capacity || 1) * 100), 0) / hostedEvents.length) : 0;

  // Generate chart data from real events
  const { rsvpData, eventPerformanceData, recentRsvps } = generateChartData(hostedEvents);

  // Event management handlers
  const handleEditEvent = (eventId: string) => {
    toast({
      title: "Edit Event",
      description: "Edit functionality coming soon!",
    });
  };

  const handleSendAnnouncement = (eventId: string) => {
    setSelectedEventForAnnouncement(eventId);
    setShowAnnouncementModal(true);
  };

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => apiRequest("DELETE", `/api/events/${eventId}`),
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "Your event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-hosted-events"] });
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
      setSelectedEventForAnnouncement(null);
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Failed to send announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitSelectedEventAnnouncement = () => {
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

  const metrics = [
    {
      title: "Attendance Rate",
      value: hostedEvents.length > 0 ? `${avgAttendanceRate}%` : "0%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Total Events",
      value: hostedEvents.length.toString(),
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
          Host Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Analytics */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                    Event Analytics
                  </CardTitle>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* RSVP Trends Chart */}
                <Card className="bg-white dark:bg-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle className="font-semibold text-gray-900 dark:text-white">
                      RSVP Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {rsvpData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={rsvpData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="rsvps" 
                            stroke="hsl(207, 90%, 54%)" 
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No RSVP data yet</p>
                          <p className="text-sm">Create your first event to see analytics</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Event Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {metrics.map((metric, index) => (
                    <Card key={index} className="bg-white dark:bg-gray-800 text-center">
                      <CardContent className="p-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 ${metric.bgColor} rounded-full mb-2`}>
                          <metric.icon className={`h-6 w-6 ${metric.color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${metric.color}`}>
                          {metric.value}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {metric.title}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Event Performance Chart */}
            <Card className="bg-white dark:bg-gray-800 mt-6">
              <CardHeader>
                <CardTitle className="font-semibold text-gray-900 dark:text-white">
                  Monthly Event Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventPerformanceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="events" fill="hsl(207, 90%, 54%)" />
                      <Bar dataKey="attendance" fill="hsl(151, 55%, 42%)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No performance data</p>
                      <p className="text-sm">Host events to view monthly performance analytics</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-white p-3 font-semibold flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Event
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowAnnouncementModal(true)}
                    disabled={hostedEvents.length === 0}
                    className="w-full p-3 font-semibold flex items-center justify-center"
                  >
                    <Megaphone className="h-5 w-5 mr-2" />
                    Send Announcement
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowPhotoModal(true)}
                    disabled={hostedEvents.length === 0}
                    className="w-full p-3 font-semibold flex items-center justify-center"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Upload Photos
                  </Button>
                </div>

                {/* My Created Events */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    My Created Events ({hostedEvents.length})
                  </h4>
                  {hostedEvents.length > 0 ? (
                    <div className="space-y-3">
                      {hostedEvents.slice(0, 4).map((event: any) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center space-x-3">
                            <div className={`${getCategoryColor(event.category)} rounded-lg p-2`}>
                              {(() => {
                                const IconComponent = getCategoryIcon(event.category);
                                return <IconComponent className="h-4 w-4 text-white" />;
                              })()}
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {event.title}
                              </span>
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                                <span className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {format(new Date(event.dateTime), "MMM dd")}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {event.attendeeCount || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditEvent(event.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleSendAnnouncement(event.id)}>
                                <Megaphone className="mr-2 h-4 w-4" />
                                Announce
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Crown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No events created yet</p>
                    </div>
                  )}
                </div>

                {/* Host Tips */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    💡 Host Tip
                  </h5>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Send event reminders 24 hours before to improve attendance rates!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Announcement Modal - Updated for direct event selection */}
      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEventForAnnouncement && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Sending to: <span className="font-semibold">
                    {hostedEvents.find(e => e.id === selectedEventForAnnouncement)?.title}
                  </span>
                </p>
              </div>
            )}
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
                rows={4}
                placeholder="Enter your announcement message..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnouncementModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitSelectedEventAnnouncement}
              disabled={!announcementSubject.trim() || !announcementMessage.trim() || announcementMutation.isPending}
            >
              {announcementMutation.isPending ? "Sending..." : "Send Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Modal */}
      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Event Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="photo-event-select">Select Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {hostedEvents.map((event: any) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="photo-url">Photo URL</Label>
              <Input
                id="photo-url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
              <div className="text-sm text-gray-500 mt-1">
                Upload your photo to a service like ImgBB or Imgur first
              </div>
            </div>
            
            <div>
              <Label htmlFor="photo-caption">Caption (optional)</Label>
              <Input
                id="photo-caption"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Photo caption..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPhotoModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={async () => {
                  if (!selectedEvent || !photoUrl) {
                    toast({
                      title: "Error",
                      description: "Please select an event and provide a photo URL",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  try {
                    await apiRequest("POST", `/api/events/${selectedEvent}/photos`, {
                      url: photoUrl,
                      caption: photoCaption
                    });
                    
                    toast({
                      title: "Success",
                      description: "Photo uploaded successfully"
                    });
                    
                    setShowPhotoModal(false);
                    setSelectedEvent("");
                    setPhotoUrl("");
                    setPhotoCaption("");
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to upload photo",
                      variant: "destructive"
                    });
                  }
                }}
                className="flex-1"
              >
                Upload Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
