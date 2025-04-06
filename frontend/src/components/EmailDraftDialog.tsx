import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EmailDraftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maintenanceWorker: {
    name: string;
    rating: number;
  };
  message: {
    content: string;
    tenantName: string;
    property: string;
  };
  onSend: () => void;
}

export function EmailDraftDialog({
  open,
  onOpenChange,
  maintenanceWorker,
  message,
  onSend,
}: EmailDraftDialogProps) {
  const [emailDraft, setEmailDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateEmailDraft = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('http://localhost:8000/draft-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worker_info: {
            name: maintenanceWorker.name,
            rating: maintenanceWorker.rating
          },
          issue_details: {
            description: message.content,
            tenant_name: message.tenantName,
            location: message.property
          }
        }),
      });

      const data = await response.json();
      if (data.email_draft) {
        setEmailDraft(data.email_draft);
      } else {
        throw new Error('No email draft received');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Failed to generate email draft');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    await generateEmailDraft();
  };

  const handleSend = () => {
    onSend();
    onOpenChange(false);
  };

  // Generate initial email draft when dialog opens
  useEffect(() => {
    if (open && !emailDraft) {
      generateEmailDraft();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Email Draft</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isGenerating ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-accent-blue" />
              <span className="ml-2">Generating email draft...</span>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm">{emailDraft}</pre>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleRegenerate} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={handleSend} className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 