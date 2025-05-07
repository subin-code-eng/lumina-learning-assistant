
import React from 'react';
import Header from '@/components/Header';
import DashboardSummary from '@/components/DashboardSummary';
import TodaysTasks from '@/components/TodaysTasks';
import StudyPlanCreator from '@/components/StudyPlanCreator';
import VoiceToTextNotes from '@/components/VoiceToTextNotes';
import ProgressChart from '@/components/ProgressChart';
import UpcomingExams from '@/components/UpcomingExams';
import AIInsights from '@/components/AIInsights';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Student</h1>
          <p className="text-muted-foreground mt-1">
            Let's make today's study session productive. Here's your personalized dashboard.
          </p>
        </div>
        
        {/* Dashboard Summary */}
        <section className="mb-8">
          <DashboardSummary />
        </section>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Today's Tasks */}
            <TodaysTasks />
            
            {/* AI Study Plan Creator */}
            <StudyPlanCreator />
          </div>
          
          <div className="space-y-6">
            {/* Voice to Text Notes */}
            <VoiceToTextNotes />
            
            {/* Progress Chart */}
            <ProgressChart />
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <UpcomingExams />
          <AIInsights />
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6 text-center text-muted-foreground text-sm">
        <p>AI Study Planner &copy; 2025 | Powered by Advanced AI Technologies</p>
      </footer>
    </div>
  );
};

export default Index;
