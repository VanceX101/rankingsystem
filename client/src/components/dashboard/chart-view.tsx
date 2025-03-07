import { Line } from "recharts";
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { Evaluation } from "@shared/schema";

interface ChartViewProps {
  data: Evaluation[];
}

interface ChartData {
  date: string;
  productivity: number;
  quality: number;
  teamwork: number;
  communication: number;
}

export default function ChartView({ data }: ChartViewProps) {
  const chartData: ChartData[] = data.map(evaluation => ({
    date: new Date(evaluation.date).toLocaleDateString(),
    productivity: evaluation.productivity,
    quality: evaluation.quality,
    teamwork: evaluation.teamwork,
    communication: evaluation.communication
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="productivity" 
            stroke="#0ea5e9" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#10b981" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey="teamwork" 
            stroke="#f59e0b" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey="communication" 
            stroke="#8b5cf6" 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}