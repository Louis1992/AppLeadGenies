import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Users, Building2, CalendarDays, GitBranch, FileText, GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Wocheneingabe",
    url: createPageUrl("WeeklyEntry"),
    icon: CalendarDays,
  },
  {
    title: "Kunden",
    url: createPageUrl("Customers"),
    icon: Building2,
  },
  {
    title: "Mitarbeiter",
    url: createPageUrl("Employees"),
    icon: Users,
  },
  {
    title: "Zuordnungen",
    url: createPageUrl("Assignments"),
    icon: GitBranch,
  },
  {
    title: "Reports",
    url: createPageUrl("Wochenreporting"),
    icon: FileText,
  },
  {
    title: "Schulungen",
    url: createPageUrl("Courses"),
    icon: GraduationCap,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --clay-bg: #F5F3FF;
          --clay-mint: #D4F4DD;
          --clay-lavender: #E5DEFF;
          --clay-peach: #FFE5D9;
          --clay-blue: #D4E4FF;
          --clay-pink: #FFD9E5;
        }
        
        .clay-card {
          background: white;
          border-radius: 20px;
          box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.25),
            -8px -8px 16px rgba(255, 255, 255, 0.9),
            inset 2px 2px 4px rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        
        .clay-card:hover {
          box-shadow: 
            12px 12px 24px rgba(163, 177, 198, 0.3),
            -12px -12px 24px rgba(255, 255, 255, 1),
            inset 2px 2px 4px rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
        
        /* Disable hover effect in dialogs and nested cards */
        [role="dialog"] .clay-card,
        [role="dialog"] .clay-card:hover,
        .clay-card .clay-card,
        .clay-card .clay-card:hover {
          transform: none !important;
          box-shadow: 
            8px 8px 16px rgba(163, 177, 198, 0.25),
            -8px -8px 16px rgba(255, 255, 255, 0.9),
            inset 2px 2px 4px rgba(255, 255, 255, 0.5) !important;
        }
        
        .clay-button {
          border-radius: 16px;
          box-shadow: 
            4px 4px 8px rgba(163, 177, 198, 0.25),
            -4px -4px 8px rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
        }
        
        .clay-button:active {
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.25),
            inset -4px -4px 8px rgba(255, 255, 255, 0.9);
          transform: scale(0.98);
        }
        
        .clay-input {
          border-radius: 16px;
          box-shadow: 
            inset 4px 4px 8px rgba(163, 177, 198, 0.15),
            inset -2px -2px 6px rgba(255, 255, 255, 0.8);
          border: none;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ background: 'var(--clay-bg)' }}>
        <Sidebar className="border-r-0 clay-card rounded-none">
          <SidebarHeader className="border-b-0 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 clay-card flex items-center justify-center">
                <div className="w-6 h-6 rounded-full" style={{ background: 'linear-gradient(135deg, var(--clay-lavender), var(--clay-mint))' }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Callcenter</h2>
                <p className="text-xs text-gray-500">Ressourcen Manager</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={cn(
                            "mb-2 rounded-2xl transition-all duration-200",
                            isActive 
                              ? "clay-card text-indigo-600 font-semibold" 
                              : "hover:bg-white/50"
                          )}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/30 backdrop-blur-sm border-b-0 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="clay-button hover:bg-white/50 p-2 rounded-2xl" />
              <h1 className="text-xl font-bold text-gray-900">Callcenter Manager</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}