import { Search, Bell, GraduationCap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/announcements", label: "Announcements" },
    { path: "/groups", label: "Groups" },
    { path: "/events", label: "Events" },
    { path: "/resources", label: "Resources" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900">ArcherConnect</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    location === item.path
                      ? "text-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="relative"
            >
              <Link href="/notifications">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs notification-badge">
                  3
                </Badge>
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
