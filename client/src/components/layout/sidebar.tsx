import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ClipboardList, 
  LogOut,
  Users,
  Settings,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const navigation: NavItem[] = [
    { 
      name: "Dashboard", 
      href: "/", 
      icon: LayoutDashboard 
    },
    { 
      name: "Evaluation", 
      href: "/evaluation", 
      icon: ClipboardList,
      roles: ["employee", "evaluator"]
    },
    { 
      name: "Users", 
      href: "/users", 
      icon: Users,
      roles: ["admin"]
    },
    { 
      name: "Settings", 
      href: "/settings", 
      icon: Settings,
      roles: ["admin"]
    }
  ];

  const filteredNavigation = navigation.filter(
    item => !item.roles || item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col h-screen">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Evaluation</span>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
                    "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}>
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="mb-4">
          <div className="font-medium">{user.fullName}</div>
          <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2" 
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}