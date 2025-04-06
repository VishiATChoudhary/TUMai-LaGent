import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Users, 
  CalendarDays,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  type: "maintenance" | "inspection" | "meeting" | "other";
  attendees?: string[];
}

const INITIAL_EVENTS: Event[] = [
  {
    id: "1",
    title: "Plumbing Fix - Unit 302",
    date: new Date(2025, 3, 5), // April 5, 2025
    startTime: "14:00",
    endTime: "16:00",
    location: "Sunset Apartments, #302",
    type: "maintenance",
    attendees: ["Plumber - John Smith", "Tenant - Sophie Chen"],
  },
  {
    id: "2",
    title: "Annual Property Inspection",
    date: new Date(2025, 3, 6), // April 6, 2025
    startTime: "10:00",
    endTime: "12:00",
    location: "Riverside Complex",
    type: "inspection",
    attendees: ["Inspector - Mike Johnson", "Property Manager - Sarah Lee"],
  },
  {
    id: "3",
    title: "Meeting with Contractor",
    date: new Date(2025, 3, 8), // April 8, 2025
    startTime: "13:30",
    endTime: "14:30",
    location: "Main Office",
    type: "meeting",
    attendees: ["Contractor - BuildRight Inc.", "Property Manager - Sarah Lee"],
  },
  {
    id: "4",
    title: "HVAC Repair - Unit 105",
    date: new Date(2025, 3, 9), // April 9, 2025
    startTime: "09:00",
    endTime: "11:00",
    location: "Park View Residences, #105",
    type: "maintenance",
    attendees: ["Technician - Alex Brown", "Tenant - Maria Rodriguez"],
  },
  {
    id: "5",
    title: "Tenant Welcome Meeting",
    date: new Date(2025, 3, 12), // April 12, 2025
    startTime: "15:00",
    endTime: "16:00",
    location: "Metro Lofts, Community Room",
    type: "meeting",
    attendees: ["Property Manager - Sarah Lee", "New Tenants (5)"],
  },
  {
    id: "6",
    title: "Pool Maintenance",
    date: new Date(2025, 3, 15), // April 15, 2025
    startTime: "08:00",
    endTime: "10:00",
    location: "Lakeside Villas",
    type: "maintenance",
  },
];

const eventTypeStyles = {
  maintenance: "bg-blue-100 text-blue-800",
  inspection: "bg-amber-100 text-amber-800",
  meeting: "bg-purple-100 text-purple-800",
  other: "bg-slate-100 text-slate-800",
};

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 3, 5)); // April 5, 2025
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);

  // Filter events for the selected date
  const selectedDateEvents = events.filter(
    (event) => date && event.date.toDateString() === date.toDateString()
  );

  // Function to determine which dates have events
  const hasEventOnDay = (day: Date) => {
    return events.some(
      (event) => event.date.toDateString() === day.toDateString()
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Calendar</h1>
          <p className="text-medium-gray mt-1">Schedule and manage appointments</p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 xl:col-span-3 p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="border-none"
            modifiers={{
              hasEvent: (date) => hasEventOnDay(date),
            }}
            modifiersClassNames={{
              hasEvent: "bg-accent-blue/10 font-medium text-accent-blue",
            }}
          />
        </Card>

        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {date && (
            <div className="bg-white border border-light-line rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <CalendarDays className="h-6 w-6 text-accent-blue" />
                <h2 className="text-xl font-semibold">
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
              </div>

              {selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 border border-light-line rounded-lg hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg text-charcoal">{event.title}</h3>
                        </div>
                        <Badge 
                          className={cn(
                            "text-xs whitespace-nowrap",
                            eventTypeStyles[event.type]
                          )}
                        >
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <Clock className="h-4 w-4 text-accent-blue mt-0.5 mr-2" />
                          <div>
                            <p className="text-xs text-medium-gray">Time</p>
                            <p className="text-sm">{event.startTime} - {event.endTime}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-accent-blue mt-0.5 mr-2" />
                          <div>
                            <p className="text-xs text-medium-gray">Location</p>
                            <p className="text-sm">{event.location}</p>
                          </div>
                        </div>
                      </div>

                      {event.attendees && (
                        <div className="mt-4">
                          <div className="flex items-start">
                            <Users className="h-4 w-4 text-accent-blue mt-0.5 mr-2" />
                            <div>
                              <p className="text-xs text-medium-gray">Attendees</p>
                              <div className="mt-1 space-y-1">
                                {event.attendees.map((attendee, index) => (
                                  <p key={index} className="text-sm">{attendee}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-light-line flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" className="text-alert-red hover:text-alert-red">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium text-lg mb-1">No events scheduled</h3>
                  <p className="text-sm text-medium-gray mb-4">
                    There are no events scheduled for this day
                  </p>
                  <Button className="bg-accent-blue hover:bg-accent-blue/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
