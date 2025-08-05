import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Star, ArrowRight, Music, Code, Palette, Trophy, GraduationCap, Utensils, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { signInWithGoogle } = useAuth();
  
  const handleSignIn = () => {
    signInWithGoogle();
  };
  
  const handleBrowseAsGuest = () => {
    // Navigate to the main app without authentication
    window.location.href = '/browse';
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
    { icon: Music, name: "Music", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { icon: Code, name: "Technology", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { icon: Palette, name: "Art", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { icon: Trophy, name: "Sports", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
    { icon: GraduationCap, name: "Education", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
    { icon: Utensils, name: "Food", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-tech-grid opacity-20 animate-pulse-slow"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="particle-1 absolute w-2 h-2 bg-blue-400 rounded-full animate-float-1"></div>
          <div className="particle-2 absolute w-1 h-1 bg-purple-400 rounded-full animate-float-2"></div>
          <div className="particle-3 absolute w-3 h-3 bg-cyan-400 rounded-full animate-float-3"></div>
          <div className="particle-4 absolute w-1.5 h-1.5 bg-green-400 rounded-full animate-float-4"></div>
          <div className="particle-5 absolute w-2.5 h-2.5 bg-pink-400 rounded-full animate-float-5"></div>
        </div>
        
        {/* Circuit Lines */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <path
              d="M0 200 L300 200 L400 100 L800 100 L900 300 L1200 300"
              stroke="url(#circuit-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-circuit-flow"
            />
            <path
              d="M0 600 L200 600 L300 500 L600 500 L700 700 L1200 700"
              stroke="url(#circuit-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-circuit-flow-reverse"
            />
            <defs>
              <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              <span className="inline-block">Discover</span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-blue-400 dark:via-purple-500 dark:to-cyan-400 bg-clip-text text-transparent block">
                Amazing Events
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Connect with your community through exciting events, workshops, and gatherings. Create memories, learn new skills, and meet amazing people.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleSignIn}
                size="lg" 
                className="group text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In with Google
                <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={handleBrowseAsGuest}
                variant="outline" 
                size="lg" 
                className="text-lg px-10 py-6 border-2 border-gray-400 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300"
              >
                <Eye className="mr-3 h-5 w-5" />
                Browse as Guest
              </Button>
            </div>
            
            {/* Tech Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-gray-900/30 backdrop-blur-sm border border-gray-700/50">
                <div className="text-2xl font-bold text-blue-400 mb-1">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-900/30 backdrop-blur-sm border border-gray-700/50">
                <div className="text-2xl font-bold text-purple-400 mb-1">&lt;50ms</div>
                <div className="text-gray-400 text-sm">Response Time</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-900/30 backdrop-blur-sm border border-gray-700/50">
                <div className="text-2xl font-bold text-cyan-400 mb-1">10K+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 bg-white dark:bg-gray-950 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-cyan-950/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Advanced Features
              </span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Cutting-edge technology stack powering the next generation of event management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="text-center border border-gray-700/50 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20 group"
                >
                  <CardHeader className="pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-blue-500/30">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 leading-relaxed">
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
      <div className="py-32 bg-gray-100 dark:bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 dark:from-blue-900/30 to-black dark:to-purple-900/20"></div>
        
        {/* Additional tech elements for dark mode */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border border-cyan-500/20 rounded-full animate-spin-slow"></div>
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-purple-500/20 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full animate-bounce-slow"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                Event Categories
              </span>
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              Discover events across diverse categories that match your interests
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              const colors = [
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500', 
                'from-purple-500 to-pink-500',
                'from-red-500 to-orange-500',
                'from-indigo-500 to-blue-500',
                'from-yellow-500 to-orange-500'
              ];
              return (
                <div key={index} className="text-center group">
                  <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${colors[index % colors.length]} rounded-2xl flex items-center justify-center mb-4 hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-pointer shadow-lg shadow-blue-500/20 group-hover:shadow-2xl group-hover:shadow-blue-500/40`}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {category.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Ready to Launch?
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the next generation of event creators and participants. Experience the future today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handleSignIn}
              size="lg" 
              className="group text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border border-blue-500/30 shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Initialize Platform
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={handleBrowseAsGuest}
              variant="outline" 
              size="lg" 
              className="text-lg px-10 py-6 border-2 border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:border-gray-500 transition-all duration-300 backdrop-blur-sm"
            >
              <Eye className="mr-3 h-5 w-5" />
              Explore Demo
            </Button>
          </div>
          
          <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Secure • Fast • Future-Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}