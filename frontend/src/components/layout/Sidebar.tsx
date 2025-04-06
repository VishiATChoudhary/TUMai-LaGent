
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  MessageSquare,
  BarChart4,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type SidebarItem = {
  icon: React.ElementType;
  label: string;
  path: string;
};

const mainNavItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Home,
    label: "Properties",
    path: "/properties",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/messages",
  },
  {
    icon: CalendarDays,
    label: "Calendar",
    path: "/calendar",
  },
  {
    icon: BarChart4,
    label: "Reports",
    path: "/reports",
  },
];

const bottomNavItems: SidebarItem[] = [
  {
    icon: Users,
    label: "Team",
    path: "/team",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={cn(
        "h-screen bg-light-ash flex flex-col shadow-sm sidebar-shadow transition-all duration-300 ease-in-out sticky top-0 z-10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-light-line">
        <div className={cn("flex items-center", collapsed ? "justify-center w-full" : "")}>
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-accent-blue rounded-md flex items-center justify-center">
                <span className="text-white font-semibold text-lg">TC</span>
              </div>
              <span className="font-bold text-lg text-charcoal">TenantCompass</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-accent-blue rounded-md flex items-center justify-center">
              <span className="text-white font-semibold text-lg">TC</span>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-16 -right-3 h-6 w-6 rounded-full bg-background border border-light-line shadow-sm z-10",
          collapsed ? "-right-3" : "-right-3"
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>

      <div className="flex flex-col flex-grow py-4 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {mainNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center py-2 px-3 rounded-md transition-colors",
                  isActive
                    ? "bg-accent-blue text-white font-medium"
                    : "text-charcoal hover:bg-white/50"
                )
              }
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-2">
          <Separator className="my-4" />
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md transition-colors",
                    isActive
                      ? "bg-accent-blue text-white font-medium"
                      : "text-charcoal hover:bg-white/50"
                  )
                }
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-4 border-t border-light-line">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "")}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-charcoal">John Doe</span>
                <span className="text-xs text-medium-gray">Admin</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </aside>
  );
}
