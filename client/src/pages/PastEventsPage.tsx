import { useState } from "react";
import { Star, Calendar, MapPin, Users, Camera, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PastEventCardProps {
  event: any;
  userRsvp: any;
}

function PastEventCard({ event, userRsvp }: PastEventCardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventDetails } = useQuery({
    queryKey: ["/api/events", event.id],
    enabled: !!event.id,
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      return apiRequest("POST", `/api/events/${event.id}/reviews`, {
        userId: "sample-user-1",
        ...reviewData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", event.id] });
      setShowReviewModal(false);
      setRating(0);
      setComment("");
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categoryColor = event.category?.color || "blue";
  const categoryColorMap: Record<string, string> = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    red: "bg-red-600",
    yellow: "bg-yellow-600",
    indigo: "bg-indigo-600",
  };

  const eventDate = new Date(event.dateTime);
  const bgColor = categoryColorMap[categoryColor] || "bg-gray-600";

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate({ rating, comment });
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {/* Event Image */}
      <div 
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: event.imageUrl 
            ? `url(${event.imageUrl})` 
            : "linear-gradient(135deg, rgb(99, 102, 241), rgb(139, 92, 246))",
        }}
      >
        <div className="h-full bg-black bg-opacity-40 flex items-end">
          <div className="p-6 text-white">
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-sm opacity-90">
              Completed • {format(eventDate, "MMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            {eventDetails?.averageRating ? (
              <>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(eventDetails.averageRating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  {eventDetails.averageRating.toFixed(1)} ({eventDetails.reviews?.length || 0} reviews)
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">No ratings yet</span>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {eventDetails?.attendingCount || 0} attended
          </span>
        </div>
        
        {/* Event Photos */}
        {eventDetails?.photos && eventDetails.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {eventDetails.photos.slice(0, 3).map((photo: any, index: number) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.caption || `Event photo ${index + 1}`}
                className="h-20 w-full object-cover rounded"
              />
            ))}
          </div>
        )}
        
        {/* Sample Event Review */}
        {eventDetails?.reviews && eventDetails.reviews.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= eventDetails.reviews[0].rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 italic">
              "{eventDetails.reviews[0].comment || "Great event!"}"
            </p>
            <div className="flex items-center mt-2">
              <Avatar className="h-5 w-5 mr-2">
                <AvatarImage src="https://i.pravatar.cc/100?img=1" alt="Reviewer" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500 dark:text-gray-400">Anonymous</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Star className="h-4 w-4 mr-2" />
                Rate & Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate & Review Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Your Rating</Label>
                  <div className="flex items-center space-x-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 cursor-pointer transition-colors ${
                          star <= rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300 dark:text-gray-600 hover:text-yellow-300"
                        }`}
                        onClick={() => setRating(star)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="comment">Your Review (Optional)</Label>
                  <Textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                    className="flex-1"
                  >
                    {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Camera className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PastEventsPage() {
  const { data: userRsvps = [] } = useQuery({
    queryKey: ["/api/users/sample-user-1/rsvps"],
  });

  const pastEvents = userRsvps?.filter((rsvp: any) => 
    rsvp.event && new Date(rsvp.event.dateTime) < new Date() && rsvp.status === "attending"
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Past Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rate and review the events you've attended
          </p>
        </div>
        
        {pastEvents.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Past Events
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                You haven't attended any events yet. Start exploring events to build your history!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {pastEvents.map((rsvp: any) => (
              <PastEventCard
                key={rsvp.id}
                event={rsvp.event}
                userRsvp={rsvp}
              />
            ))}
          </div>
        )}

        {/* Event Statistics */}
        {pastEvents.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white dark:bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  {pastEvents.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Events Attended
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {pastEvents.filter((rsvp: any) => rsvp.event.category?.name === "Tech").length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Tech Events
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {pastEvents.filter((rsvp: any) => !rsvp.event.isPaid).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Free Events
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
