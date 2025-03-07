import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  
  const sendRemindersMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/send-reminders");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminders sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => sendRemindersMutation.mutate()}
              disabled={sendRemindersMutation.isPending}
              className="flex items-center gap-2"
            >
              {sendRemindersMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send Evaluation Reminders
            </Button>
            <p className="text-sm text-muted-foreground">
              Send email reminders to all employees to complete their daily evaluations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
