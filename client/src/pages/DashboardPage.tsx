import { useState } from "react";
import { Calendar, CheckCircle, Crown, Users, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const { user } = useAuth();
  const { data: userRsvps = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/rsvps`],
    enabled: !!user,
  });

  const rsvpArray = Array.isArray(userRsvps) ? userRsvps : [];
  
  const upcomingEvents = rsvpArray.filter((rsvp: any) => 
    rsvp.event && new Date(rsvp.event.dateTime) > new Date() && rsvp.status === "attending"
  );

  const pastEvents = rsvpArray.filter((rsvp: any) => 
    rsvp.event && new Date(rsvp.event.dateTime) < new Date() && rsvp.status === "attending"
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please sign in to view your dashboard</h1>
          <p className="text-gray-700 dark:text-gray-300">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

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
      value: 5,
      icon: Crown,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
    {
      title: "Total Attendees",
      value: 342,
      icon: Users,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
  ];

  const tabButtons = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past Events" },
    { id: "hosting", label: "Hosting" },
    { id: "favorites", label: "Favorites" },
  ];

  const getCategoryIcon = (category: any) => {
    if (!category) return "fas fa-calendar";
    return category.icon;
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
              className="px-6 py-3 font-semibold"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white dark:bg-gray-800">
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
          ))}
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
                          <i className={`${getCategoryIcon(rsvp.event.category)} text-white`}></i>
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
                        <Button variant="ghost" size="icon" title="Add to Calendar">
                          <i className="fab fa-google text-primary"></i>
                        </Button>
                        <Button variant="ghost" size="icon" title="View Details">
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
                          <i className={`${getCategoryIcon(rsvp.event.category)} text-white`}></i>
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
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            Rate & Review
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

        {/* Hosting Tab */}
        {activeTab === "hosting" && (
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Events I'm Hosting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  You haven't created any events yet.
                </p>
                <Button className="bg-primary hover:bg-primary/90">
                  Create Your First Event
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No favorite events yet. Heart some events to see them here!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
