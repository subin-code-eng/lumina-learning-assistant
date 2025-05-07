
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'productivity' | 'improvement' | 'achievement';
}

const AIInsights: React.FC = () => {
  const insights: Insight[] = [
    {
      id: '1',
      title: 'Optimal Study Times Detected',
      description: 'Based on your study patterns, your peak productivity hours are between 9-11 AM and 4-6 PM.',
      type: 'productivity'
    },
    {
      id: '2',
      title: 'Subject Needs Attention',
      description: 'We noticed you\'re spending less time on Organic Chemistry. Consider allocating more study sessions to this subject before your exam.',
      type: 'improvement'
    },
    {
      id: '3',
      title: 'Great Progress!',
      description: 'You\'ve increased your study consistency by 27% this week compared to last week. Keep it up!',
      type: 'achievement'
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'productivity':
        return (
          <div className="p-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
        );
      case 'improvement':
        return (
          <div className="p-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9V13M12 16V16.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case 'achievement':
        return (
          <div className="p-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start space-x-4 p-3 border rounded-lg">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h3 className="font-medium text-sm">{insight.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full mt-2 border-dashed"
          >
            Request More AI Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;
