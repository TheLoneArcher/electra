import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, ArrowRight, Music, Code, Palette, Trophy, GraduationCap, Utensils } from "lucide-react";

export default function LandingPage() {
  const handleSignIn = () => {
    window.location.href = '/api/auth/google';
  };

  const features = [
    {
      icon: Calendar,
      title: "Easy Event Creation",
      description: "Create and manage events with our intuitive interface"
    },
    {
      icon: Users,
      title: "RSVP Management",
      description: "Track attendees and manage capacity effortlessly"
    },
    {
      icon: MapPin,
      title: "Location Discovery",
      description: "Find events happening near you"
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Rate events and read reviews from other attendees"
    }
  ];

  const categories = [
    { icon: Music, name: "Music", color: "bg-blue-100 text-blue-700" },
    { icon: Code, name: "Technology", color: "bg-green-100 text-green-700" },
    { icon: Palette, name: "Art", color: "bg-purple-100 text-purple-700" },
    { icon: Trophy, name: "Sports", color: "bg-red-100 text-red-700" },
    { icon: GraduationCap, name: "Education", color: "bg-indigo-100 text-indigo-700" },
    { icon: Utensils, name: "Food", color: "bg-yellow-100 text-yellow-700" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Amazing
              <span className="text-blue-600 block">Local Events</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the community of event organizers and attendees. Create, discover, and participate in events that matter to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleSignIn}
                size="lg" 
                className="text-lg px-8 py-4 bg-blue-600 hover:bg-blue-700"
              >
                Sign in with Google
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600">
              Powerful features to make event organizing and attending seamless
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Event Categories
            </h2>
            <p className="text-lg text-gray-600">
              Explore events across different interests and communities
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`mx-auto w-16 h-16 ${category.color} rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform cursor-pointer`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <p className="font-medium text-gray-900">{category.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of event organizers and attendees today
          </p>
          <Button 
            onClick={handleSignIn}
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100"
          >
            Sign in with Google
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}