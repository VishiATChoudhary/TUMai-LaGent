import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  SlidersHorizontal,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
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

const messagesData: Message[] = [
  {
    id: "1",
    tenant: {
      name: "Sophie Chen",
      initials: "SC",
    },
    property: "Sunset Apartments, #302",
    category: "Maintenance",
    message: "The kitchen sink is clogged and water won't drain properly. I've tried using drain cleaner but it didn't help. Can someone come take a look?",
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
    message: "The upstairs neighbors are having a loud party after 11 PM again. This is the third time this week and I have to work early in the morning.",
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
    message: "I'll be making my rent payment by the end of this week. I got paid late this month but wanted to let you know in advance.",
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
    message: "The heating system doesn't seem to be working properly. The apartment gets very cold at night despite setting the thermostat to 72°F.",
    timestamp: "1 day ago",
    status: "done",
    priority: "medium",
  },
  {
    id: "5",
    tenant: {
      name: "Aisha Johnson",
      avatar: "https://i.pravatar.cc/150?img=5",
      initials: "AJ",
    },
    property: "Metro Lofts, #506",
    category: "General",
    message: "I'm planning to renew my lease that expires next month. Could you send me the new contract when it's ready?",
    timestamp: "1 day ago",
    status: "new",
    priority: "low",
  },
  {
    id: "6",
    tenant: {
      name: "David Kim",
      avatar: "https://i.pravatar.cc/150?img=7",
      initials: "DK",
    },
    property: "Lakeside Villas, #203",
    category: "Maintenance",
    message: "There's a water leak coming from the ceiling in the bathroom. It's dripping slowly but continuously.",
    timestamp: "2 days ago",
    status: "needs-review",
    priority: "high",
  },
];

const statusConfig = {
  "new": { 
    label: "New", 
    variant: "default",
    icon: MessageSquare,
  },
  "auto-replied": { 
    label: "Auto-replied", 
    variant: "accent",
    icon: CheckCircle2,
  },
  "needs-review": { 
    label: "Needs Review", 
    variant: "warning",
    icon: AlertTriangle,
  },
  "done": { 
    label: "Done", 
    variant: "outline",
    icon: CheckCircle2,
  },
};

const priorityConfig = {
  "low": { label: "Low", className: "bg-slate-100 text-slate-800" },
  "medium": { label: "Medium", className: "bg-blue-100 text-blue-800" },
  "high": { label: "High", className: "bg-alert-red/10 text-alert-red" },
};

export default function Messages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  const [activeTab, setActiveTab] = useState("all");
  
  const filteredMessages = messagesData.filter((message) => {
    const matchesSearch = 
      message.tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeTab === "all") return matchesSearch;
    return message.status === activeTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Messages</h1>
        <p className="text-medium-gray mt-1">Manage tenant communication</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-medium-gray" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filter</span>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 sm:grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="auto-replied">Auto-replied</TabsTrigger>
          <TabsTrigger value="needs-review">Needs Review</TabsTrigger>
          <TabsTrigger value="done" className="hidden sm:block">Done</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              {filteredMessages.length > 0 ? (
                <div className="h-[calc(3*200px)] overflow-y-auto pr-2 space-y-4">
                  {filteredMessages.map((message) => {
                    const StatusIcon = statusConfig[message.status].icon;
                    
                    return (
                      <Card 
                        key={message.id} 
                        className={cn(
                          "cursor-pointer transition-all hover:border-accent-blue hover:bg-accent-blue/5",
                          selectedMessage?.id === message.id && "border-accent-blue shadow-sm"
                        )}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.tenant.avatar} />
                                <AvatarFallback>{message.tenant.initials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-charcoal">{message.tenant.name}</h4>
                                <p className="text-xs text-medium-gray">{message.property}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-medium-gray">{message.timestamp}</span>
                              <StatusIcon className="h-4 w-4 mt-1 text-accent-blue" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {message.category}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", priorityConfig[message.priority].className)}
                            >
                              {priorityConfig[message.priority].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-medium-gray line-clamp-2">{message.message}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-white">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg mb-1">No messages found</h3>
                  <p className="text-sm text-medium-gray">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
            
            <div className="lg:col-span-7 xl:col-span-8">
              {selectedMessage ? (
                <Card className="h-full flex flex-col">
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedMessage.tenant.avatar} />
                          <AvatarFallback>{selectedMessage.tenant.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg text-charcoal">{selectedMessage.tenant.name}</h3>
                            <Badge 
                              variant={statusConfig[selectedMessage.status].variant as any} 
                              className="text-xs"
                            >
                              {statusConfig[selectedMessage.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-medium-gray">{selectedMessage.property}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {selectedMessage.category}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", priorityConfig[selectedMessage.priority].className)}
                            >
                              {priorityConfig[selectedMessage.priority].label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-medium-gray">{selectedMessage.timestamp}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 flex-grow">
                    <div className="mb-6 border-b border-light-line pb-6">
                      <p className="text-charcoal whitespace-pre-line">{selectedMessage.message}</p>
                    </div>
                    
                    {selectedMessage.status === "auto-replied" && (
                      <div className="bg-muted/50 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1.5 text-accent-blue" />
                            Auto-replied
                          </h4>
                          <span className="text-xs text-medium-gray">2 hours ago</span>
                        </div>
                        <p className="text-sm text-medium-gray">
                          Thank you for reporting the noise issue. We take noise complaints seriously and will contact your neighbors about this matter. Please let us know if the issue persists, and we'll take further action as needed per our community policies.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Button variant="outline" size="sm" className="h-8">
                            <span className="mr-1">👎</span> Not helpful
                          </Button>
                          <Button variant="outline" size="sm" className="h-8">
                            <span className="mr-1">👍</span> Helpful
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedMessage.status === "needs-review" && (
                      <div className="bg-muted/50 p-4 rounded-lg mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-500" />
                            Suggested Reply
                          </h4>
                        </div>
                        <p className="text-sm text-medium-gray">
                          Thank you for letting us know about your rent payment. We appreciate you communicating this in advance. Please ensure your payment is made by the end of the week as mentioned. Let us know if you need any further assistance.
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <Button variant="outline" size="sm" className="h-8">
                            Edit Reply
                          </Button>
                          <Button variant="default" size="sm" className="h-8">
                            Send as is
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Reply</h4>
                      <div className="border border-light-line rounded-md overflow-hidden">
                        <div className="bg-background px-4 py-2 border-b border-light-line">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              B
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              I
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              U
                            </Button>
                          </div>
                        </div>
                        <textarea
                          className="w-full p-3 min-h-[120px] focus:outline-none resize-none"
                          placeholder="Type your message here..."
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 border-t border-light-line flex flex-wrap gap-3">
                    <Button className="bg-accent-blue hover:bg-accent-blue/90">
                      Send Reply
                    </Button>
                    <Button variant="outline">
                      Schedule Maintenance
                    </Button>
                    <Button variant="outline">
                      Mark as Resolved
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 h-full text-center border rounded-lg bg-white">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-medium text-xl mb-2">No message selected</h3>
                  <p className="text-medium-gray">
                    Select a message from the list to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
