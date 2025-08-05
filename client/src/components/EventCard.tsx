import { useState } from "react";
import { Heart, Clock, MapPin, Users, Calendar, Check, Music, Briefcase, Palette, Trophy, Coffee, GraduationCap, Gamepad2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { EventDetailsModal } from "./EventDetailsModal";
import { EditEventModal } from "./EditEventModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    location: string;
    dateTime: string;
    capacity: number;
    price: string;
    isPaid: boolean;
    imageUrl?: string;
    hostId?: string;
    category?: {
      name: string;
      icon: string;
      color: string;
    };
    attendingCount?: number;
  };
}

const categoryColorMap: Record<string, string> = {
  blue: "bg-blue-600",
  green: "bg-green-600", 
  purple: "bg-purple-600",
  red: "bg-red-600",
  yellow: "bg-yellow-600",
  indigo: "bg-indigo-600",
};

export function EventCard({ event }: EventCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Get current user's RSVP status
  const { data: userRsvp } = useQuery({
    queryKey: [`/api/events/${event.id}/user-rsvp`],
    enabled: isAuthenticated,
  });

  // Get favorite status
  const { data: favoriteData } = useQuery({
    queryKey: [`/api/events/${event.id}/favorite`],
    enabled: isAuthenticated,
  });

  const isLiked = favoriteData?.favorited || false;

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", `/api/events/${event.id}/rsvp`, {
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/user-rsvp`] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-rsvps"] });
      toast({
        title: "RSVP Updated",
        description: userRsvp ? "Your RSVP has been updated." : "You've successfully RSVP'd to this event!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      console.log('Toggling favorite for event:', event.id);
      return apiRequest("POST", `/api/events/${event.id}/favorite`, {});
    },
    onSuccess: (data) => {
      console.log('Favorite toggle success:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/events/${event.id}/favorite`] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: data.favorited ? "Added to Favorites" : "Removed from Favorites",
        description: data.message,
      });
    },
    onError: (error) => {
      console.error('Favorite toggle error:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRSVP = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to RSVP to events.",
        variant: "destructive",
      });
      return;
    }
    rsvpMutation.mutate("attending");
  };

  const isAttending = userRsvp && typeof userRsvp === 'object' && 'status' in userRsvp ? userRsvp.status === "attending" : false;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast({
        title: "Sign in Required",
        description: "Please sign in to favorite events.",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate();
  };

  const eventDate = new Date(event.dateTime);
  const categoryColor = event.category ? categoryColorMap[event.category.color] || "bg-gray-600" : "bg-gray-600";
  
  // Check if current user is the event host
  const isHost = user && event.hostId === user.id;
  
  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/events/${event.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-hosted-events"] });
      toast({
        title: "Event Deleted",
        description: "Your event has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete event error:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEventMutation.mutate();
    }
  };

  const [showEditModal, setShowEditModal] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditModal(true);
  };

  const handleEditOld = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Open edit modal
    toast({
      title: "Edit Event",
      description: "Edit functionality will be available soon.",
    });
  };
  
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

  return (
    <>
      <Card 
        className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden event-card-hover group cursor-pointer glow transition-all duration-300 hover:transform hover:scale-105"
        onClick={() => setShowDetails(true)}
      >
        <div 
          className="relative h-48 bg-cover bg-center"
          style={{
            backgroundImage: event.imageUrl 
              ? `url(${event.imageUrl})` 
              : "linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))",
          }}
        >
          {event.category && (
            <div className="absolute top-4 left-4">
              <Badge className={`${categoryColor} text-white px-3 py-1 text-sm font-medium flex items-center`}>
                {(() => {
                  const IconComponent = getCategoryIcon(event.category);
                  return <IconComponent className="h-4 w-4 mr-1" />;
                })()}
                {event.category.name}
              </Badge>
            </div>
          )}
          
          <div className="absolute top-4 right-4 flex gap-2">
            {isHost && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleEdit}
                  data-testid={`button-edit-${event.id}`}
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/90 hover:bg-white"
                  onClick={handleDelete}
                  data-testid={`button-delete-${event.id}`}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/90 hover:bg-white"
              onClick={handleLike}
              data-testid={`button-favorite-${event.id}`}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isLiked ? "fill-red-500 text-red-500" : "text-gray-600"
                }`} 
              />
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-4 bg-white/90 rounded-lg px-3 py-2">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                {format(eventDate, "dd")}
              </div>
              <div className="text-xs text-gray-600">
                {format(eventDate, "MMM").toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors duration-200">
            {event.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(eventDate, "MMM dd, yyyy • h:mm a")}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-white">
                    <AvatarImage 
                      src={`https://i.pravatar.cc/100?img=${i}`} 
                      alt={`Attendee ${i}`} 
                    />
                    <AvatarFallback>A{i}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                +{event.attendingCount || 0} going
              </span>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {event.isPaid ? `$${event.price}` : "Free"}
              </div>
              <Button
                onClick={handleRSVP}
                disabled={rsvpMutation.isPending}
                variant={isAttending ? "outline" : "default"}
                className={`mt-2 px-4 py-2 text-sm font-medium ${
                  isAttending 
                    ? "border-green-500 text-green-600 hover:bg-green-50" 
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {rsvpMutation.isPending ? (
                  "..."
                ) : isAttending ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    RSVP'd
                  </>
                ) : (
                  "RSVP"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDetails && (
        <EventDetailsModal
          eventId={event.id}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showEditModal && (
        <EditEventModal
          eventId={event.id}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
