import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaintenanceResult } from "@/hooks/useMaintenanceResults";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceOptions: MaintenanceResult[];
  onSelect: (option: MaintenanceResult) => void;
  onDismiss: () => void;
  issueDetails?: {
    description: string;
    urgency: string;
    location: string;
    tenantName: string;
  };
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  maintenanceOptions,
  onSelect,
  onDismiss,
  issueDetails,
}: MaintenanceDialogProps) {
  const handleWorkerSelect = async (option: MaintenanceResult) => {
    // Call the email drafter API
    try {
      const response = await fetch('http://localhost:8000/email-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_worker: option,
          issue_details: issueDetails,
        }),
      });

      const data = await response.json();
      
      if (data.email_draft) {
        // Pass the email draft to the parent component
        onSelect({ ...option, email_draft: data.email_draft });
      } else {
        onSelect(option);
      }
    } catch (error) {
      console.error('Error generating email draft:', error);
      onSelect(option);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send someone?</DialogTitle>
          <DialogDescription>
            Choose a maintenance worker to handle this issue
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {maintenanceOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="w-full justify-between h-auto py-3"
              onClick={() => handleWorkerSelect(option)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{option.name}</span>
                <span className="text-sm text-muted-foreground">{option.type}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{option.rating}</span>
              </div>
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onDismiss} className="w-full">
            Dismiss all
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 