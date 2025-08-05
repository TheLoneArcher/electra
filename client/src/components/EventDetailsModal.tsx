import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Users, Star, Calendar, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface EventDetailsModalProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailsModal({ eventId, isOpen, onClose }: EventDetailsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", eventId],
    enabled: isOpen && !!eventId,
  });

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("POST", `/api/events/${eventId}/rsvp`, {
        userId: "sample-user-1",
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId] });
      toast({
        title: "RSVP Updated",
        description: "Your RSVP has been updated successfully.",
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

  const syncToCalendarMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/calendar/add-event", {
        eventId,
        userId: "sample-user-1",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to Calendar",
        description: "Event has been synced to your Google Calendar.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to sync to calendar. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !event) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="p-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  const eventDate = new Date(event.dateTime);
  const categoryColor = event.category?.color || "blue";
  const categoryColorMap: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    indigo: "bg-indigo-600",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Hero Image */}
        <div 
          className="relative h-64 bg-cover bg-center rounded-lg -m-6 mb-6"
          style={{
            backgroundImage: event.imageUrl 
              ? `url(${event.imageUrl})` 
              : "linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))",
          }}
        >
          {event.category && (
            <div className="absolute top-4 left-4">
              <Badge className={`${categoryColorMap[categoryColor]} text-white px-3 py-1`}>
                <i className={`${event.category.icon} mr-1`}></i>
                {event.category.name}
              </Badge>
            </div>
          )}
          
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

        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {event.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                <span>{event.averageRating?.toFixed(1) || "No rating"}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{event.attendingCount || 0} attending</span>
              </div>
              {event.host && (
                <div className="flex items-center">
                  <span>Hosted by {event.host.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {format(eventDate, "EEEE, MMMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(eventDate, "h:mm a")}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">{event.location}</div>
                </div>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {event.isPaid ? `$${event.price}` : "Free"}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">
                    {event.capacity} spots available
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.attendingCount || 0} people going
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => rsvpMutation.mutate("attending")}
                disabled={rsvpMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {rsvpMutation.isPending ? "Updating..." : "RSVP to Event"}
              </Button>

              <Button
                variant="outline"
                onClick={() => syncToCalendarMutation.mutate()}
                disabled={syncToCalendarMutation.isPending}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {syncToCalendarMutation.isPending ? "Syncing..." : "Add to Calendar"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About this event</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Attendees */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Who's going</h3>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Avatar key={i} className="h-10 w-10 border-2 border-white">
                  <AvatarImage 
                    src={`https://i.pravatar.cc/100?img=${i}`} 
                    alt={`Attendee ${i}`} 
                  />
                  <AvatarFallback>A{i}</AvatarFallback>
                </Avatar>
              ))}
              {(event.attendingCount || 0) > 5 && (
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white flex items-center justify-center text-sm font-medium">
                  +{(event.attendingCount || 0) - 5}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {event.reviews && event.reviews.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Reviews</h3>
              <div className="space-y-4">
                {event.reviews.slice(0, 3).map((review: any) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
