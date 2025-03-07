import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import MyEvaluations from "@/pages/my-evaluations";
import EmployeeEvaluations from "@/pages/employee-evaluations";
import EvaluationHistory from "@/pages/evaluation-history";
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
            path="/my-evaluations" 
            component={MyEvaluations}
            allowedRoles={["employee", "evaluator"]} 
          />
          <ProtectedRoute 
            path="/employee-evaluations" 
            component={EmployeeEvaluations}
            allowedRoles={["evaluator"]} 
          />
          <ProtectedRoute 
            path="/evaluation-history" 
            component={EvaluationHistory}
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}