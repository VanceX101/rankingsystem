import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Evaluation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const columns: ColumnDef<Evaluation>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => format(new Date(row.getValue("date")), "dd MMM yyyy"),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.getValue("type") === "self" ? "outline" : "secondary"}>
        {row.getValue("type")}
      </Badge>
    ),
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
    accessorKey: "comments",
    header: "Comments",
  },
];

export default function EvaluationHistory() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "self" | "evaluator">("all");

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations"],
  });

  const filteredData = evaluations.filter((evaluation) => {
    const matchesSearch = evaluation.comments?.toLowerCase().includes(search.toLowerCase()) || 
                         format(new Date(evaluation.date), "dd MMM yyyy").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || evaluation.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search by date or comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filter} onValueChange={(value: "all" | "self" | "evaluator") => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Evaluations</SelectItem>
                <SelectItem value="self">Self Evaluations</SelectItem>
                <SelectItem value="evaluator">Evaluator Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </div>
  );
}
