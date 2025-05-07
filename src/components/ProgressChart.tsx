
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const ProgressChart: React.FC = () => {
  // Sample data for the progress chart
  const data = [
    { day: 'Mon', studyHours: 2.5, focusScore: 75 },
    { day: 'Tue', studyHours: 3.5, focusScore: 82 },
    { day: 'Wed', studyHours: 2, focusScore: 70 },
    { day: 'Thu', studyHours: 4, focusScore: 90 },
    { day: 'Fri', studyHours: 3, focusScore: 85 },
    { day: 'Sat', studyHours: 1.5, focusScore: 65 },
    { day: 'Sun', studyHours: 3, focusScore: 80 },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="day" />
              <YAxis yAxisId="hours" domain={[0, 5]} />
              <YAxis yAxisId="score" domain={[0, 100]} orientation="right" />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '8px', 
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Line 
                yAxisId="hours"
                type="monotone" 
                dataKey="studyHours" 
                name="Study Hours"
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="score"
                type="monotone" 
                dataKey="focusScore" 
                name="Focus Score"
                stroke="hsl(var(--secondary))" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
