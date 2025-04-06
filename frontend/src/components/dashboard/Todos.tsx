import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Calendar,
  FileText,
  Building
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  category: "pricing" | "maintenance" | "legal" | "marketing" | "financial" | "other";
  status: "pending" | "in-progress" | "completed";
}

const landlordTasks: Task[] = [
  {
    id: "1",
    title: "Update Seasonal Pricing",
    description: "Adjust rental rates for the summer season based on market analysis",
    dueDate: "May 15, 2025",
    priority: "high",
    category: "pricing",
    status: "pending",
  },
  {
    id: "2",
    title: "Review Property Insurance",
    description: "Compare insurance policies and renew coverage for all properties",
    dueDate: "June 1, 2025",
    priority: "high",
    category: "financial",
    status: "pending",
  },
  {
    id: "3",
    title: "Prepare Tax Documents",
    description: "Gather all necessary documents for quarterly tax filing",
    dueDate: "May 30, 2025",
    priority: "medium",
    category: "financial",
    status: "in-progress",
  },
  {
    id: "4",
    title: "Update Lease Templates",
    description: "Revise lease agreements to include new policies and regulations",
    dueDate: "July 1, 2025",
    priority: "medium",
    category: "legal",
    status: "pending",
  },
  {
    id: "5",
    title: "Schedule Property Inspections",
    description: "Plan quarterly inspections for all rental units",
    dueDate: "June 15, 2025",
    priority: "low",
    category: "maintenance",
    status: "pending",
  },
];

const priorityConfig = {
  "high": { label: "High", className: "bg-alert-red/10 text-alert-red", icon: AlertTriangle },
  "medium": { label: "Medium", className: "bg-amber-100 text-amber-800", icon: Clock },
  "low": { label: "Low", className: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
};

const categoryConfig = {
  "pricing": { label: "Pricing", icon: DollarSign, className: "bg-blue-100 text-blue-800" },
  "maintenance": { label: "Maintenance", icon: Building, className: "bg-purple-100 text-purple-800" },
  "legal": { label: "Legal", icon: FileText, className: "bg-slate-100 text-slate-800" },
  "marketing": { label: "Marketing", icon: TrendingUp, className: "bg-pink-100 text-pink-800" },
  "financial": { label: "Financial", icon: DollarSign, className: "bg-green-100 text-green-800" },
  "other": { label: "Other", icon: AlertTriangle, className: "bg-gray-100 text-gray-800" },
};

const statusConfig = {
  "pending": { label: "Pending", className: "bg-slate-100 text-slate-800" },
  "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-800" },
  "completed": { label: "Completed", className: "bg-emerald-100 text-emerald-800" },
};

export function Todos() {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Todos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[calc(3*120px)] overflow-y-auto pr-2 space-y-4">
          {landlordTasks.map((task) => {
            const PriorityIcon = priorityConfig[task.priority].icon;
            const CategoryIcon = categoryConfig[task.category].icon;
            
            return (
              <div 
                key={task.id} 
                className="p-4 rounded-lg border border-light-line bg-white hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h4 className="font-medium text-charcoal">{task.title}</h4>
                  <span 
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full inline-flex items-center justify-center mt-1 sm:mt-0",
                      priorityConfig[task.priority].className
                    )}
                  >
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {priorityConfig[task.priority].label}
                  </span>
                </div>
                <p className="text-xs text-medium-gray mb-3">{task.description}</p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-xs text-medium-gray">
                    <CategoryIcon className="mr-1.5 h-3.5 w-3.5 text-charcoal" />
                    <span>{categoryConfig[task.category].label}</span>
                  </div>
                  <div className="flex items-center text-xs text-medium-gray">
                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-charcoal" />
                    <span>Due: {task.dueDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 