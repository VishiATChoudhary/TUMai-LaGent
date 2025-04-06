import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DateRangeFilterProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateRangeChange: (dateRange: { startDate: string; endDate: string }) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

const filterOptions = [
  { label: "Last Week", value: "lastWeek" },
  { label: "Last Month", value: "lastMonth" },
  { label: "Last 3 Months", value: "last3Months" },
  { label: "Custom", value: "custom" },
];

export function DateRangeFilter({
  open,
  onOpenChange,
  dateRange,
  onDateRangeChange,
  selectedFilter,
  onFilterChange,
}: DateRangeFilterProps) {
  const [selectedOption, setSelectedOption] = useState(selectedFilter);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const handleApply = () => {
    let newDateRange = { ...dateRange };
    
    if (selectedOption === "custom") {
      newDateRange = {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    } else {
      const today = new Date();
      const endDate = today.toLocaleDateString();
      let startDate = new Date();
      
      switch (selectedOption) {
        case "lastWeek":
          startDate.setDate(today.getDate() - 7);
          break;
        case "lastMonth":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "last3Months":
          startDate.setMonth(today.getMonth() - 3);
          break;
      }
      
      newDateRange = {
        startDate: startDate.toLocaleDateString(),
        endDate,
      };
    }
    
    onDateRangeChange(newDateRange);
    onFilterChange(selectedOption);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Dashboard Data</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <RadioGroup 
            defaultValue={selectedFilter} 
            onValueChange={setSelectedOption}
            className="grid gap-2"
          >
            {filterOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
          
          {selectedOption === "custom" && (
            <div className="grid gap-4 pt-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 