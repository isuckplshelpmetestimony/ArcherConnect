import { Home, Megaphone, Users, Calendar, Book, Bell } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const sidebarItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/announcements", label: "Announcements", icon: Megaphone },
    { path: "/groups", label: "Groups", icon: Users },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/resources", label: "Resources", icon: Book },
    { path: "/notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <aside className="fixed top-16 left-0 z-20 w-64 h-screen bg-white shadow-sm border-r border-gray-200 hidden lg:block">
      <div className="p-6">
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <Icon className="mr-3 h-5 w-5 text-gray-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
