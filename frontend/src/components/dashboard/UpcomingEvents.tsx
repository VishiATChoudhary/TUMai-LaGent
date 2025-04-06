import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "maintenance" | "inspection" | "meeting";
  property: string;
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Plumbing Fix - Unit 302",
    date: "Today",
    time: "14:00 - 16:00",
    type: "maintenance",
    property: "Sunset Apartments",
  },
  {
    id: "2",
    title: "Annual Property Inspection",
    date: "Tomorrow",
    time: "10:00 - 12:00",
    type: "inspection",
    property: "Riverside Complex",
  },
  {
    id: "3",
    title: "Meeting with Contractor",
    date: "Apr 8, 2025",
    time: "13:30 - 14:30",
    type: "meeting",
    property: "Main Office",
  },
  {
    id: "4",
    title: "HVAC Repair - Unit 105",
    date: "Apr 9, 2025",
    time: "09:00 - 11:00",
    type: "maintenance",
    property: "Park View Residences",
  },
];

const eventTypeStyles = {
  maintenance: "bg-blue-100 text-blue-800",
  inspection: "bg-amber-100 text-amber-800",
  meeting: "bg-purple-100 text-purple-800",
};

export function UpcomingEvents() {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[calc(3*120px)] overflow-y-auto pr-2 space-y-4">
          {upcomingEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-4 rounded-lg border border-light-line bg-white hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <h4 className="font-medium text-charcoal">{event.title}</h4>
                <span 
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full inline-flex items-center justify-center mt-1 sm:mt-0",
                    eventTypeStyles[event.type]
                  )}
                >
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              </div>
              <p className="text-xs text-medium-gray mb-3">{event.property}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-xs text-medium-gray">
                  <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-charcoal" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-xs text-medium-gray">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-charcoal" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
