import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:border-accent-blue", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-medium-gray">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-charcoal">{value}</h3>
            {description && (
              <p className="text-sm text-medium-gray mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend.positive ? "text-emerald-600" : "text-alert-red"
                  )}
                >
                  {trend.positive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-medium-gray ml-1">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-accent-blue/10">
              <Icon className="h-5 w-5 text-accent-blue" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
