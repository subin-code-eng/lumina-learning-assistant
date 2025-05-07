
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar } from 'lucide-react';

interface Exam {
  id: string;
  subject: string;
  date: string;
  daysLeft: number;
  readiness: number;
}

const UpcomingExams: React.FC = () => {
  const exams: Exam[] = [
    {
      id: '1',
      subject: 'Advanced Mathematics',
      date: 'May 15, 2025',
      daysLeft: 8,
      readiness: 75
    },
    {
      id: '2',
      subject: 'Organic Chemistry',
      date: 'May 20, 2025',
      daysLeft: 13,
      readiness: 45
    },
    {
      id: '3',
      subject: 'World Literature',
      date: 'May 25, 2025',
      daysLeft: 18,
      readiness: 60
    }
  ];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upcoming Exams</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">{exam.subject}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {exam.date} ({exam.daysLeft} days left)
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getReadinessColor(exam.readiness)}`}>
                  {exam.readiness}% Ready
                </span>
              </div>
              <Progress value={exam.readiness} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get color based on readiness percentage
function getReadinessColor(readiness: number): string {
  if (readiness < 50) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  } else if (readiness < 75) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  } else {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

export default UpcomingExams;
