import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Bell, Calendar, Moon, Sun, User, Menu, LogOut, Settings, Plus } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { CreateEventModal } from "@/components/CreateEventModal";

const navigation = [
  { name: "Browse Events", href: "/" },
  { name: "My Events", href: "/dashboard" },
  { name: "Host Dashboard", href: "/host" },
  { name: "Past Events", href: "/past-events" },
  { name: "Calendar", href: "/calendar" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user, signOut, isAuthenticated, signInWithGoogle } = useAuth();

  // Show different navbar for authenticated vs non-authenticated users
  if (!isAuthenticated) {
    return (
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Link href="/">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                    EventHub
                  </span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                {theme === "light" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              <Button onClick={signInWithGoogle} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Sign In with Google
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 transition-all duration-300 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <Link href="/">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer">
                  EventHub
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span
                    className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                      location === item.href
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Create Event Button */}
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowCreateModal(true)}
              className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                <div className="flex items-center space-x-3 p-2 mb-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex items-center space-x-3 p-4 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  </div>
                </div>
                
                <nav className="flex flex-col space-y-2 p-4">
                  <Button 
                    className="justify-start mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    onClick={() => {
                      setShowCreateModal(true);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                  
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <span
                        className={`flex items-center px-3 py-3 text-base font-medium cursor-pointer transition-colors rounded-lg ${
                          location === item.href
                            ? "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.name}
                      </span>
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <button 
                      className="flex items-center w-full px-3 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                      onClick={signOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      {/* Create Event Modal */}
      <CreateEventModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </nav>
  );
}
