import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  iconColor?: string;
}

export default function StatisticCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor
}: StatisticCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {typeof trend === 'number' && trend !== 0 && (
          <p className={cn(
            "text-xs font-medium mt-1",
            trend > 0 ? "text-green-500" : "text-red-500"
          )}>
            {trend > 0 ? "+" : ""}{trend.toFixed(1)}
            {trend > 0 ? " ↑" : " ↓"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
