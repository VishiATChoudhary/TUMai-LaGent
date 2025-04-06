import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface MessageStatsProps {
  selectedFilter: string;
}

const MessageStats: React.FC<MessageStatsProps> = ({ selectedFilter }) => {
  // Generate daily data for the last 90 days
  const generateDailyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 89; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate random but realistic daily message counts
      const total = Math.floor(Math.random() * 30) + 10; // 10-40 messages per day
      const autoReplied = Math.floor(total * (Math.random() * 0.3 + 0.4)); // 40-70% auto-reply rate
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total,
        autoReplied
      });
    }
    
    return data;
  };

  const data = generateDailyData();

  const getFilteredData = () => {
    switch (selectedFilter) {
      case 'lastWeek':
        return data.slice(-7);
      case 'lastMonth':
        return data.slice(-30);
      case 'last3Months':
        return data.slice(-90);
      default:
        return data.slice(-30); // Default to last month
    }
  };

  // Format date for tooltip
  const formatDate = (dateStr: string) => {
    return dateStr;
  };

  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Message Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={getFilteredData()}
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
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#9CA3AF"
              fontSize={12}
            />
            <Tooltip 
              labelFormatter={formatDate}
            />
            <Legend />
            <Line
              type="natural"
              dataKey="total"
              stroke="#286AFF"
              activeDot={{ r: 6 }}
              strokeWidth={2}
              name="Total Messages"
              dot={false}
            />
            <Line
              type="natural"
              dataKey="autoReplied"
              stroke="#10B981"
              strokeWidth={2}
              name="Auto-replied"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MessageStats;
