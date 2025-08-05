import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Megaphone, Camera, TrendingUp, Users, DollarSign } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { CreateEventModal } from "@/components/CreateEventModal";

// Mock data for charts
const rsvpData = [
  { name: "Week 1", rsvps: 12 },
  { name: "Week 2", rsvps: 19 },
  { name: "Week 3", rsvps: 25 },
  { name: "Week 4", rsvps: 31 },
];

const eventPerformanceData = [
  { name: "Jan", events: 4, attendance: 85 },
  { name: "Feb", events: 6, attendance: 92 },
  { name: "Mar", events: 5, attendance: 78 },
  { name: "Apr", events: 8, attendance: 88 },
  { name: "May", events: 7, attendance: 96 },
];

const recentRsvps = [
  {
    id: 1,
    name: "Sarah K.",
    avatar: "https://i.pravatar.cc/100?img=1",
    status: "RSVP'd",
    time: "2 mins ago"
  },
  {
    id: 2,
    name: "Mike R.",
    avatar: "https://i.pravatar.cc/100?img=2",
    status: "RSVP'd",
    time: "5 mins ago"
  },
  {
    id: 3,
    name: "Emma L.",
    avatar: "https://i.pravatar.cc/100?img=3",
    status: "Cancelled",
    time: "10 mins ago"
  },
  {
    id: 4,
    name: "Alex M.",
    avatar: "https://i.pravatar.cc/100?img=4",
    status: "RSVP'd",
    time: "15 mins ago"
  },
];

export default function HostDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [timeRange, setTimeRange] = useState("30");

  const { user } = useAuth();
  const { data: hostedEvents = [] } = useQuery({
    queryKey: ["/api/my-hosted-events"],
    enabled: !!user,
  });

  const totalAttendees = Array.isArray(hostedEvents) ? hostedEvents.reduce((total: number, event: any) => total + (event.attendingCount || 0), 0) : 0;
  const totalRevenue = Array.isArray(hostedEvents) ? hostedEvents.reduce((total: number, event: any) => total + (parseFloat(event.price || "0") * (event.attendingCount || 0)), 0) : 0;

  const metrics = [
    {
      title: "Attendance Rate",
      value: "68%",
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      title: "Avg Rating",
      value: "4.8",
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
                    className="w-full p-3 font-semibold flex items-center justify-center"
                  >
                    <Megaphone className="h-5 w-5 mr-2" />
                    Send Announcement
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full p-3 font-semibold flex items-center justify-center"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Upload Photos
                  </Button>
                </div>

                {/* Recent RSVPs */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Recent RSVPs
                  </h4>
                  <div className="space-y-3">
                    {recentRsvps.map((rsvp) => (
                      <div key={rsvp.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rsvp.avatar} alt={rsvp.name} />
                            <AvatarFallback>
                              {rsvp.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {rsvp.name}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {rsvp.time}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          rsvp.status === "RSVP'd" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}>
                          {rsvp.status}
                        </span>
                      </div>
                    ))}
                  </div>
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
    </div>
  );
}
