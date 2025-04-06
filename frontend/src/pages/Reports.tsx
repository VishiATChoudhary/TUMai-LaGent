import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Download } from "lucide-react";

const messageActivityData = [
  { month: "Jan", total: 65, autoReplied: 28 },
  { month: "Feb", total: 78, autoReplied: 34 },
  { month: "Mar", total: 92, autoReplied: 42 },
  { month: "Apr", total: 105, autoReplied: 52 },
  { month: "May", total: 114, autoReplied: 62 },
  { month: "Jun", total: 120, autoReplied: 70 },
  { month: "Jul", total: 118, autoReplied: 71 },
  { month: "Aug", total: 109, autoReplied: 63 },
  { month: "Sep", total: 100, autoReplied: 55 },
  { month: "Oct", total: 86, autoReplied: 44 },
  { month: "Nov", total: 74, autoReplied: 35 },
  { month: "Dec", total: 68, autoReplied: 30 },
];

const categoryData = [
  { name: "Maintenance", value: 45 },
  { name: "Rent", value: 20 },
  { name: "Noise", value: 15 },
  { name: "General", value: 12 },
  { name: "Other", value: 8 },
];

const COLORS = ['#286AFF', '#6BA3FF', '#A4C8FF', '#CDE2FF', '#E8F2FF'];

const responseTimeData = [
  { property: "Sunset Apartments", time: 2.4 },
  { property: "Riverside Complex", time: 1.8 },
  { property: "Park View", time: 3.2 },
  { property: "Woodland Heights", time: 1.3 },
  { property: "Metro Lofts", time: 2.1 },
  { property: "Lakeside Villas", time: 1.6 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Reports</h1>
        <p className="text-medium-gray mt-1">Analytics and performance metrics</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select defaultValue="last30">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select property" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              <SelectItem value="sunset">Sunset Apartments</SelectItem>
              <SelectItem value="riverside">Riverside Complex</SelectItem>
              <SelectItem value="parkview">Park View Residences</SelectItem>
              <SelectItem value="woodland">Woodland Heights</SelectItem>
              <SelectItem value="metro">Metro Lofts</SelectItem>
              <SelectItem value="lakeside">Lakeside Villas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="response">Response Time</TabsTrigger>
          <TabsTrigger value="auto-reply">Auto-Reply</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Message Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={messageActivityData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#286AFF"
                      activeDot={{ r: 6 }}
                      strokeWidth={2}
                      name="Total Messages"
                    />
                    <Line
                      type="monotone"
                      dataKey="autoReplied"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Auto-replied"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Message Categories</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="response" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Average Response Time by Property</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={responseTimeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                    <XAxis
                      dataKey="property"
                      tickLine={false}
                      axisLine={false}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      stroke="#9CA3AF"
                      fontSize={12}
                      unit="h"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="time" name="Average Response Time (hours)" fill="#286AFF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="auto-reply" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Auto-Reply Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-medium-gray">Auto-reply performance metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="properties" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Property Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-medium-gray">Property performance metrics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
