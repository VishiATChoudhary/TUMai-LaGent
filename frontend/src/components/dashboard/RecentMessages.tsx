import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  tenant: {
    name: string;
    avatar?: string;
    initials: string;
  };
  property: string;
  category: string;
  message: string;
  timestamp: string;
  status: "new" | "auto-replied" | "needs-review" | "done";
  priority: "low" | "medium" | "high";
}

const recentMessages: Message[] = [
  {
    id: "1",
    tenant: {
      name: "Sophie Chen",
      initials: "SC",
    },
    property: "Sunset Apartments, #302",
    category: "Maintenance",
    message: "The kitchen sink is clogged and water won't drain properly.",
    timestamp: "10 minutes ago",
    status: "new",
    priority: "medium",
  },
  {
    id: "2",
    tenant: {
      name: "James Wilson",
      avatar: "https://i.pravatar.cc/150?img=2",
      initials: "JW",
    },
    property: "Riverside Complex, #201",
    category: "Noise Complaint",
    message: "The upstairs neighbors are having a loud party after 11 PM again.",
    timestamp: "2 hours ago",
    status: "auto-replied",
    priority: "high",
  },
  {
    id: "3",
    tenant: {
      name: "Maria Rodriguez",
      avatar: "https://i.pravatar.cc/150?img=3",
      initials: "MR",
    },
    property: "Park View Residences, #105",
    category: "Rent",
    message: "I'll be making my rent payment by the end of this week.",
    timestamp: "5 hours ago",
    status: "needs-review",
    priority: "low",
  },
  {
    id: "4",
    tenant: {
      name: "Thomas Baker",
      initials: "TB",
    },
    property: "Woodland Heights, #417",
    category: "Maintenance",
    message: "The heating system doesn't seem to be working properly.",
    timestamp: "1 day ago",
    status: "done",
    priority: "medium",
  },
];

const statusConfig = {
  "new": { label: "New", variant: "default" },
  "auto-replied": { label: "Auto-replied", variant: "accent" },
  "needs-review": { label: "Needs Review", variant: "warning" },
  "done": { label: "Done", variant: "outline" },
};

const priorityConfig = {
  "low": { label: "Low", className: "bg-slate-200 text-slate-800" },
  "medium": { label: "Medium", className: "bg-blue-100 text-blue-800" },
  "high": { label: "High", className: "bg-alert-red/10 text-alert-red" },
};

export function RecentMessages() {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Recent Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMessages.map((message) => (
            <div 
              key={message.id} 
              className="p-4 rounded-lg border border-light-line bg-white hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer"
            >
              <div className="flex items-start">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={message.tenant.avatar} />
                  <AvatarFallback>{message.tenant.initials}</AvatarFallback>
                </Avatar>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <h4 className="font-medium text-charcoal">{message.tenant.name}</h4>
                      <span className="text-xs text-medium-gray">{message.property}</span>
                    </div>
                    <span className="text-xs text-medium-gray">{message.timestamp}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {message.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", priorityConfig[message.priority].className)}
                    >
                      {priorityConfig[message.priority].label}
                    </Badge>
                    <Badge 
                      variant={statusConfig[message.status].variant as any} 
                      className="text-xs"
                    >
                      {statusConfig[message.status].label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-charcoal line-clamp-2">{message.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
