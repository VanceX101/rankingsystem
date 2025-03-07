import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import ChartView from "@/components/dashboard/chart-view";
import StatisticCard from "@/components/dashboard/statistic-card";
import EvaluationHistory from "@/components/dashboard/evaluation-history";
import { useAuth } from "@/hooks/use-auth";
import type { Evaluation } from "@shared/schema";
import { 
  TrendingUp, 
  Award, 
  Users, 
  MessageSquare,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations", user?.id],
    enabled: !!user,
  });

  const calculateMetrics = (metric: keyof Pick<Evaluation, "productivity" | "quality" | "teamwork" | "communication">) => {
    if (!evaluations.length) return { average: "N/A", trend: 0 };

    const values = evaluations.map(e => e[metric]);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    // Calculate trend (compare last 2 evaluations)
    const lastTwo = values.slice(-2);
    const trend = lastTwo.length > 1 ? lastTwo[1] - lastTwo[0] : 0;

    return {
      average: average.toFixed(1),
      trend
    };
  };

  const metrics = [
    {
      title: "Productivity",
      icon: TrendingUp,
      ...calculateMetrics("productivity"),
      color: "text-blue-500"
    },
    {
      title: "Quality",
      icon: Award,
      ...calculateMetrics("quality"),
      color: "text-green-500"
    },
    {
      title: "Teamwork",
      icon: Users,
      ...calculateMetrics("teamwork"),
      color: "text-orange-500"
    },
    {
      title: "Communication",
      icon: MessageSquare,
      ...calculateMetrics("communication"),
      color: "text-purple-500"
    }
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <StatisticCard
            key={metric.title}
            title={metric.title}
            value={metric.average}
            icon={metric.icon}
            trend={metric.trend}
            iconColor={metric.color}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ChartView data={evaluations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
          </CardHeader>
          <CardContent>
            <EvaluationHistory evaluations={evaluations.slice(-5)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}