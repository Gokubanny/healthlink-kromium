import { Link, useLocation } from "react-router-dom";
import { Calendar, Users, Home, Settings, Clock, Heart, LogOut } from "lucide-react";
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
  { title: "Dashboard", url: "/dashboard/doctor", icon: Home },
  { title: "Appointments", url: "/dashboard/doctor/appointments", icon: Calendar },
  { title: "My Patients", url: "/dashboard/doctor/patients", icon: Users },
  { title: "Schedule", url: "/dashboard/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/dashboard/doctor/settings", icon: Settings },
];

export function DoctorSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar 
      className={`${collapsed ? "w-14" : "w-60"} bg-background/95 backdrop-blur-sm border-r border-border/50`} 
      collapsible="icon"
    >
      <div className="p-4 border-b border-border/50 flex items-center gap-2 bg-background/80">
        <div className="bg-primary rounded-lg p-2">
          <Heart className="h-5 w-5 text-primary-foreground" fill="currentColor" />
        </div>
        {!collapsed && <span className="font-heading text-lg font-bold text-foreground">Doctor Portal</span>}
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/80">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="text-foreground hover:bg-accent hover:text-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-foreground">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t border-border/50 bg-background/80">
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