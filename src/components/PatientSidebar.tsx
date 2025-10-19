import { Link, useLocation } from "react-router-dom";
import { Calendar, FileText, Home, Stethoscope, User, Heart, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/dashboard/patient", icon: Home },
  { title: "Find Doctors", url: "/doctors", icon: Stethoscope },
  { title: "My Appointments", url: "/dashboard/patient/appointments", icon: Calendar },
  { title: "Medical Records", url: "/dashboard/patient/records", icon: FileText },
  { title: "My Profile", url: "/dashboard/patient/profile", icon: User },
];

export function PatientSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <div className="bg-primary rounded-lg p-2">
          <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
        </div>
        {!collapsed && <span className="font-heading text-lg font-bold">Patient Portal</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t border-border">
        <Button 
          onClick={logout} 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </Sidebar>
  );
}
