import React, { useState } from 'react';
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenuePerProperty } from "@/components/dashboard/RevenuePerProperty";
import { Todos } from "@/components/dashboard/Todos";
import { PropertiesOverview } from "@/components/dashboard/PropertiesOverview";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import MessageStats from '@/components/dashboard/MessageStats';
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Home, 
  Clock, 
  CheckCircle2,
  DollarSign,
  CreditCard,
  Building,
  Calendar,
  SlidersHorizontal
} from "lucide-react";

// Sample data for different time periods
const dashboardData = {
  lastWeek: {
    totalRevenue: "$125,800",
    totalCosts: "$82,800",
    expectedPayments: "$135,200",
    monthlyMortgages: "$52,000",
    totalMessages: "48",
    openIssues: "5",
    responseTime: "45m",
    autoResponseRate: "58%"
  },
  lastMonth: {
    totalRevenue: "$538,800",
    totalCosts: "$352,800",
    expectedPayments: "$595,200",
    monthlyMortgages: "$222,000",
    totalMessages: "248",
    openIssues: "15",
    responseTime: "1h 24m",
    autoResponseRate: "62%"
  },
  last3Months: {
    totalRevenue: "$1,538,800",
    totalCosts: "$952,800",
    expectedPayments: "$1,695,200",
    monthlyMortgages: "$622,000",
    totalMessages: "748",
    openIssues: "35",
    responseTime: "1h 45m",
    autoResponseRate: "65%"
  }
};

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString(),
    endDate: new Date().toLocaleDateString()
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("lastMonth");
  
  // Get the current dashboard data based on the selected filter
  const getCurrentData = () => {
    return dashboardData[selectedFilter as keyof typeof dashboardData] || dashboardData.lastMonth;
  };
  
  const currentData = getCurrentData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-medium-gray mt-1">Welcome back, John Doe</p>
        </div>
        <Button 
          className="bg-accent-blue hover:bg-accent-blue/90"
          onClick={() => setFilterDialogOpen(true)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter: {selectedFilter === "lastWeek" ? "Last Week" : 
                  selectedFilter === "lastMonth" ? "Last Month" : 
                  selectedFilter === "last3Months" ? "Last 3 Months" : 
                  "Custom"}
        </Button>
      </div>

      <DateRangeFilter
        open={filterDialogOpen}
        onOpenChange={setFilterDialogOpen}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue"
          value={currentData.totalRevenue}
          icon={DollarSign}
        />
        <StatCard 
          title="Total Costs"
          value={currentData.totalCosts}
          icon={CreditCard}
          description="Across all properties"
        />
        <StatCard 
          title="Expected Payments"
          value={currentData.expectedPayments}
          icon={DollarSign}
          description="Average"
        />
        <StatCard 
          title="Monthly Mortgages"
          value={currentData.monthlyMortgages}
          icon={Building}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <RevenuePerProperty selectedFilter={selectedFilter} />
        <Todos />
        <MessageStats selectedFilter={selectedFilter} />
        <PropertiesOverview />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Messages"
          value={currentData.totalMessages}
          icon={MessageSquare}
        />
        <StatCard 
          title="Open Issues"
          value={currentData.openIssues}
          icon={Home}
          description="Across all properties"
        />
        <StatCard 
          title="Response Time"
          value={currentData.responseTime}
          icon={Clock}
          description="Average"
        />
        <StatCard 
          title="Auto-Response Rate"
          value={currentData.autoResponseRate}
          icon={CheckCircle2}
        />
      </div>
    </div>
  );
}
