
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Clock, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const quickScheduleSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  duration: z.string().min(1, { message: "Duration is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  type: z.string().min(1, { message: "Session type is required" }),
});

interface QuickScheduleDialogProps {
  selectedDate: Date | undefined;
  onScheduleSuccess: () => void;
}

const QuickScheduleDialog: React.FC<QuickScheduleDialogProps> = ({ selectedDate, onScheduleSuccess }) => {
  const [open, setOpen] = useState(false);
  
  const form = useForm<z.infer<typeof quickScheduleSchema>>({
    resolver: zodResolver(quickScheduleSchema),
    defaultValues: {
      subject: '',
      duration: '1h',
      time: '',
      type: 'Study',
    },
  });

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History',
    'Computer Science',
    'Economics',
    'Psychology',
    'Philosophy'
  ];

  const durations = [
    { value: '30min', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '1.5h', label: '1.5 hours' },
    { value: '2h', label: '2 hours' },
    { value: '2.5h', label: '2.5 hours' },
    { value: '3h', label: '3 hours' },
  ];

  const sessionTypes = [
    'Study',
    'Review',
    'Practice',
    'Quiz',
    'Research',
    'Reading',
    'Assignment',
    'Project'
  ];

  const onSubmit = (data: z.infer<typeof quickScheduleSchema>) => {
    // In a real app, this would save to the database
    console.log('Scheduling session:', {
      ...data,
      date: selectedDate?.toLocaleDateString(),
    });

    toast.success('Study session scheduled!', {
      description: `${data.subject} ${data.type.toLowerCase()} session scheduled for ${data.time} (${data.duration})`,
      duration: 4000,
    });

    form.reset();
    setOpen(false);
    onScheduleSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Quick Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule Study Session
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            For {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Subject
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset();
                  setOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                Schedule Session
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickScheduleDialog;
