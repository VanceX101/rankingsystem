import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import EvaluationForm from "@/pages/evaluation-form";
import UsersManagement from "@/pages/users-management";
import Settings from "@/pages/settings";
import { ProtectedRoute } from "./lib/protected-route";
import Sidebar from "./components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-background">
        <Switch>
          <ProtectedRoute path="/" component={Dashboard} />
          <ProtectedRoute 
            path="/evaluation" 
            component={EvaluationForm} 
            allowedRoles={["employee", "evaluator"]} 
          />
          <ProtectedRoute 
            path="/users" 
            component={UsersManagement} 
            allowedRoles={["admin"]} 
          />
          <ProtectedRoute 
            path="/settings" 
            component={Settings} 
            allowedRoles={["admin"]} 
          />
          <Route path="/auth" component={AuthPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;