import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Search,
  MapPin,
  Users,
  PlusCircle,
  SlidersHorizontal,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  units: number;
  occupiedUnits: number;
  openIssues: number;
  image: string;
  status: "active" | "maintenance";
}

const propertiesData: Property[] = [
  {
    id: "1",
    name: "Sunset Apartments",
    address: "123 Main St, City Name",
    units: 24,
    occupiedUnits: 22,
    openIssues: 5,
    image: "https://images.unsplash.com/photo-1460317442991-0ec209397118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "2",
    name: "Riverside Complex",
    address: "456 River Rd, City Name",
    units: 36,
    occupiedUnits: 30,
    openIssues: 8,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "3",
    name: "Park View Residences",
    address: "789 Park Ave, City Name",
    units: 18,
    occupiedUnits: 17,
    openIssues: 2,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "maintenance",
  },
  {
    id: "4",
    name: "Woodland Heights",
    address: "101 Forest Blvd, City Name",
    units: 42,
    occupiedUnits: 38,
    openIssues: 7,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "5",
    name: "Metro Lofts",
    address: "222 Downtown Ave, City Name",
    units: 20,
    occupiedUnits: 18,
    openIssues: 3,
    image: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "active",
  },
  {
    id: "6",
    name: "Lakeside Villas",
    address: "333 Lake Dr, City Name",
    units: 12,
    occupiedUnits: 10,
    openIssues: 1,
    image: "https://images.unsplash.com/photo-1464082354059-27db6ce50048?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    status: "maintenance",
  },
];

export default function Properties() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredProperties = propertiesData.filter((property) => 
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Properties</h1>
          <p className="text-medium-gray mt-1">Manage your property portfolio</p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-medium-gray" />
          <Input
            placeholder="Search properties..."
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="property-card overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg text-charcoal">{property.name}</h3>
                <Badge 
                  variant={property.status === "active" ? "default" : "outline"} 
                  className={property.status === "maintenance" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}
                >
                  {property.status === "active" ? "Active" : "Maintenance"}
                </Badge>
              </div>
              
              <div className="flex items-center text-medium-gray text-sm mb-3">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{property.address}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <Home className="h-4 w-4 text-accent-blue mr-2" />
                  <div>
                    <p className="text-xs text-medium-gray">Units</p>
                    <p className="font-medium text-charcoal">{property.units}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-accent-blue mr-2" />
                  <div>
                    <p className="text-xs text-medium-gray">Occupancy</p>
                    <p className="font-medium text-charcoal">
                      {Math.round((property.occupiedUnits / property.units) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                {property.openIssues > 0 ? (
                  <span className="text-xs px-2 py-1 bg-alert-red/10 text-alert-red rounded-full">
                    {property.openIssues} open issues
                  </span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    No issues
                  </span>
                )}
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
