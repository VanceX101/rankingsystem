import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, EvaluatorAssignment } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon, UserPlus, UserMinus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge variant={
          role === "admin" ? "default" :
          role === "evaluator" ? "secondary" :
          "outline"
        }>
          {role}
        </Badge>
      );
    },
  },
];

function AssignmentDialog({ evaluator }: { evaluator: User }) {
  const { toast } = useToast();

  const { data: employees = [] } = useQuery<User[]>({
    queryKey: ["/api/users/employee"],
  });

  const { data: assignments = [] } = useQuery<EvaluatorAssignment[]>({
    queryKey: ["/api/assignments"],
  });

  const assignMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await apiRequest("POST", "/api/assignments", {
        evaluatorId: evaluator.id,
        employeeId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unassignMutation = useMutation({
    mutationFn: async (employeeId: number) => {
      await apiRequest(
        "DELETE",
        `/api/assignments/${evaluator.id}/${employeeId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Success",
        description: "Assignment removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isAssigned = (employeeId: number) => {
    return assignments.some(
      a => a.evaluatorId === evaluator.id && a.employeeId === employeeId
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UsersIcon className="h-4 w-4 mr-2" />
          Manage Assignments
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Manage Assignments for {evaluator.fullName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Select employees to be evaluated by this evaluator
          </div>
          <div className="space-y-2">
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div>
                  <div className="font-medium">{employee.fullName}</div>
                  <div className="text-sm text-muted-foreground">
                    {employee.email}
                  </div>
                </div>
                {isAssigned(employee.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unassignMutation.mutate(employee.id)}
                    disabled={unassignMutation.isPending}
                  >
                    <UserMinus className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => assignMutation.mutate(employee.id)}
                    disabled={assignMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function UsersManagement() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const evaluatorColumns: ColumnDef<User>[] = [
    ...columns,
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        if (user.role === "evaluator") {
          return <AssignmentDialog evaluator={user} />;
        }
        return null;
      },
    },
  ];

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Users Management</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={evaluatorColumns} data={users} />
        </CardContent>
      </Card>
    </div>
  );
}