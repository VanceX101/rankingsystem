import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { Evaluation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface EvaluationHistoryProps {
  evaluations: Evaluation[];
}

export default function EvaluationHistory({ evaluations }: EvaluationHistoryProps) {
  if (!evaluations.length) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No evaluations found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Average Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {evaluations.map((evaluation) => {
          const avgScore = (
            evaluation.productivity +
            evaluation.quality +
            evaluation.teamwork +
            evaluation.communication
          ) / 4;

          return (
            <TableRow key={evaluation.id}>
              <TableCell>
                {format(new Date(evaluation.date), 'dd MMM yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={evaluation.type === 'self' ? 'outline' : 'secondary'}>
                  {evaluation.type}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={
                  avgScore >= 8 ? "text-green-500" :
                  avgScore >= 6 ? "text-yellow-500" :
                  "text-red-500"
                }>
                  {avgScore.toFixed(1)}
                </span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
