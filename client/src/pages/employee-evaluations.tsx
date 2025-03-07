import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DailyForm from "@/components/evaluation/daily-form";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Evaluation, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserPlus } from "lucide-react";

const columns: ColumnDef<Evaluation>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
  },
  {
    accessorKey: "employeeId",
    header: "Employee",
    cell: ({ row, table }) => {
      const employees = (table.options.meta as any)?.employees || [];
      const employee = employees.find((e: User) => e.id === row.getValue("employeeId"));
      return employee?.fullName || "Unknown";
    },
  },
  {
    accessorKey: "productivity",
    header: "Productivity",
  },
  {
    accessorKey: "quality",
    header: "Quality",
  },
  {
    accessorKey: "teamwork",
    header: "Teamwork",
  },
  {
    accessorKey: "communication",
    header: "Communication",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "submitted" ? "default" : "secondary"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
];

export default function EmployeeEvaluations() {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<number>();
  const [showForm, setShowForm] = useState(false);

  const { data: assignedEmployees = [] } = useQuery<User[]>({
    queryKey: ["/api/assignments/employees"],
    enabled: !!user && user.role === "evaluator",
  });

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations", user?.id],
    enabled: !!user,
  });

  const evaluatorEvaluations = evaluations.filter(e => e.type === "evaluator");

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Employee Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <DailyForm 
              type="evaluator"
              defaultEmployeeId={selectedEmployee}
              onSuccess={() => {
                setShowForm(false);
                setSelectedEmployee(undefined);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select 
                  value={selectedEmployee?.toString()} 
                  onValueChange={(value) => setSelectedEmployee(parseInt(value))}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setShowForm(true)}
                  disabled={!selectedEmployee}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  New Evaluation
                </Button>
              </div>
              <DataTable 
                columns={columns} 
                data={evaluatorEvaluations}
                meta={{ employees: assignedEmployees }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
