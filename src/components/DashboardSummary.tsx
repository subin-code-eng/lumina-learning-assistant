
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const DashboardSummary: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45%</div>
          <Progress value={45} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">2 of 4 tasks completed</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Focus Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2h 15m</div>
          <Progress value={65} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">Goal: 3h 30m</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5 days</div>
          <div className="flex gap-1 mt-2">
            {[100, 100, 80, 100, 60, 0, 0].map((day, i) => (
              <div 
                key={i} 
                className="h-2 flex-1 rounded-full" 
                style={{
                  background: day ? `linear-gradient(90deg, hsl(var(--primary)) ${day}%, hsl(var(--muted)))` : 'hsl(var(--muted))'
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Keep it up!</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
