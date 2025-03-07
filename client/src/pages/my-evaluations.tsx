import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DailyForm from "@/components/evaluation/daily-form";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { Evaluation } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<Evaluation>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
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

export default function MyEvaluations() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations", user?.id],
    enabled: !!user,
  });

  const selfEvaluations = evaluations.filter(e => e.type === "self");

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>My Self Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          {showForm ? (
            <DailyForm 
              type="self" 
              onSuccess={() => setShowForm(false)}
            />
          ) : (
            <DataTable columns={columns} data={selfEvaluations} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
