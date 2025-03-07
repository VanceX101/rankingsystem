import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEvaluationSchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { InsertEvaluation } from "@shared/schema";

interface DailyFormProps {
  type: "self" | "evaluator";
  defaultEmployeeId?: number;
  onSuccess?: () => void;
}

export default function DailyForm({ type, defaultEmployeeId, onSuccess }: DailyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch employees if evaluator type
  const { data: employees } = useQuery({
    queryKey: ["/api/users/employee"],
    enabled: type === "evaluator",
  });

  const form = useForm<InsertEvaluation>({
    resolver: zodResolver(insertEvaluationSchema),
    defaultValues: {
      employeeId: type === "self" ? user?.id : defaultEmployeeId,
      evaluatorId: type === "evaluator" ? user?.id : undefined,
      productivity: 5,
      quality: 5,
      teamwork: 5,
      communication: 5,
      comments: "",
      type,
      date: new Date(),
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertEvaluation) => {
      const res = await apiRequest("POST", "/api/evaluations", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
      toast({
        title: "Success",
        description: "Evaluation submitted successfully",
      });
      form.reset();
      onSuccess?.();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(data => submitMutation.mutate(data))} className="space-y-6">
        {type === "evaluator" && (
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Employee</FormLabel>
                <Select 
                  onValueChange={value => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees?.map(employee => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="productivity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Productivity (1-10)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{field.value}</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quality of Work (1-10)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{field.value}</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teamwork"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teamwork (1-10)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{field.value}</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="communication"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication (1-10)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{field.value}</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder="Enter any additional feedback or comments"
                  className="h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={submitMutation.isPending}
        >
          Submit Evaluation
        </Button>
      </form>
    </Form>
  );
}
