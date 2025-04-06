import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface DailyData {
  date: string;
  revenue: number;
  costs: number;
}

// Generate sample daily data for the past year
const generateDailyData = () => {
  const data: DailyData[] = [];
  const today = new Date();
  
  // Base values and growth rates
  const baseRevenue = 1200;
  const baseCosts = 800;
  const revenueGrowthRate = 0.0005; // 0.05% daily growth
  const costsGrowthRate = 0.0003; // 0.03% daily growth
  
  for (let i = 365; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    
    // Calculate days from start for growth
    const daysFromStart = 365 - i;
    
    // Apply different seasonal patterns
    // Revenue has stronger summer peak and winter dip
    const revenueSeasonalFactor = 1 + 
      0.15 * Math.sin((i / 365) * 2 * Math.PI) + // Annual cycle
      0.08 * Math.sin((i / 30) * 2 * Math.PI);   // Monthly cycle
    
    // Costs have less seasonal variation but more monthly fluctuation
    const costsSeasonalFactor = 1 + 
      0.08 * Math.sin((i / 365) * 2 * Math.PI) + // Annual cycle
      0.12 * Math.sin((i / 30) * 2 * Math.PI);   // Monthly cycle
    
    // Apply growth over time
    const revenueGrowth = baseRevenue * (1 + revenueGrowthRate * daysFromStart);
    const costsGrowth = baseCosts * (1 + costsGrowthRate * daysFromStart);
    
    // Add some random noise
    const revenueNoise = (Math.random() * 100 - 50);
    const costsNoise = (Math.random() * 80 - 40);
    
    // Calculate final values
    const revenue = Math.round(revenueGrowth * revenueSeasonalFactor + revenueNoise);
    const costs = Math.round(costsGrowth * costsSeasonalFactor + costsNoise);
    
    data.push({ date: dateStr, revenue, costs });
  }
  
  return data;
};

const dailyData = generateDailyData();

const periods = [
  { label: "Last Week", value: 7 },
  { label: "Last Month", value: 30 },
  { label: "Last 3 Months", value: 90 },
  { label: "Last 6 Months", value: 180 },
  { label: "Last Year", value: 365 },
];

interface RevenuePerPropertyProps {
  selectedFilter?: string;
}

export function RevenuePerProperty({ selectedFilter = "lastMonth" }: RevenuePerPropertyProps) {
  // Determine the number of days to show based on the selected filter
  const getDaysToShow = () => {
    switch (selectedFilter) {
      case "lastWeek":
        return 7;
      case "lastMonth":
        return 30;
      case "last3Months":
        return 90;
      default:
        return 30; // Default to last month
    }
  };
  
  const daysToShow = getDaysToShow();
  const filteredData = dailyData.slice(-daysToShow);
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };
  
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Revenue & Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatDate}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(Number(value)), '']}
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#286AFF"
              strokeWidth={2}
              name="Revenue"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="costs"
              stroke="#10B981"
              strokeWidth={2}
              name="Costs"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 