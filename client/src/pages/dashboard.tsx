import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import ChartView from "@/components/dashboard/chart-view";
import { useAuth } from "@/hooks/use-auth";
import type { Evaluation } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations", user?.id],
    enabled: !!user,
  });

  const calculateAverage = (metric: keyof Pick<Evaluation, "productivity" | "quality" | "teamwork" | "communication">) => {
    if (!evaluations.length) return "N/A";
    const sum = evaluations.reduce((acc, evaluation) => acc + evaluation[metric], 0);
    return (sum / evaluations.length).toFixed(1);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Productivity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAverage("productivity")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAverage("quality")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teamwork</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAverage("teamwork")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateAverage("communication")}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartView data={evaluations} />
        </CardContent>
      </Card>
    </div>
  );
}