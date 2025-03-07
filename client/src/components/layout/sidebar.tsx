import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  ClipboardList, 
  LogOut,
  Users,
  Settings
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Evaluation", href: "/evaluation", icon: ClipboardList },
  ];

  if (user.role === "admin") {
    navigation.push(
      { name: "Users", href: "/users", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings }
    );
  }

  return (
    <div className="w-64 bg-sidebar border-r border-border p-4 flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-8">
        <div className="font-bold text-xl">Daily Evaluation</div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location === item.href 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                      : "hover:bg-sidebar-accent/50"
                  }`}>
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="px-4 py-2 mb-2">
          <div className="font-medium">{user.fullName}</div>
          <div className="text-sm text-muted-foreground capitalize">{user.role}</div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
