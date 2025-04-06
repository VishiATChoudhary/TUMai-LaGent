import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PropertyStats {
  name: string;
  address: string;
  occupancyRate: number;
  totalUnits: number;
  openIssues: number;
}

const propertiesData: PropertyStats[] = [
  {
    name: "Sunset Apartments",
    address: "123 Main St, City Name",
    occupancyRate: 90,
    totalUnits: 24,
    openIssues: 5,
  },
  {
    name: "Riverside Complex",
    address: "456 River Rd, City Name",
    occupancyRate: 85,
    totalUnits: 36,
    openIssues: 8,
  },
  {
    name: "Park View Residences",
    address: "789 Park Ave, City Name",
    occupancyRate: 95,
    totalUnits: 18,
    openIssues: 2,
  },
];

export function PropertiesOverview() {
  return (
    <Card className="col-span-full xl:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Properties Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {propertiesData.map((property) => (
            <div 
              key={property.name} 
              className="p-4 rounded-lg border border-light-line hover:border-accent-blue hover:bg-accent-blue/5 transition-all cursor-pointer bg-white"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h4 className="font-medium text-charcoal">{property.name}</h4>
                  <p className="text-xs text-medium-gray">{property.address}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <span className="text-xs text-medium-gray">
                    {Math.round(property.occupancyRate * property.totalUnits / 100)}/{property.totalUnits} units
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                    {property.openIssues} issues
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>Occupancy</span>
                  <span>{property.occupancyRate}%</span>
                </div>
                <Progress value={property.occupancyRate} className="h-2 bg-light-ash" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
