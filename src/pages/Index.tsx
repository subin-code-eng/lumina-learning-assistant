
import React, { useState } from 'react';
import Header from '@/components/Header';
import DashboardSummary from '@/components/DashboardSummary';
import TodaysTasks from '@/components/TodaysTasks';
import StudyPlanCreator from '@/components/StudyPlanCreator';
import VoiceToTextNotes from '@/components/VoiceToTextNotes';
import ProgressChart from '@/components/ProgressChart';
import UpcomingExams from '@/components/UpcomingExams';
import AIInsights from '@/components/AIInsights';
import AITutor from '@/components/AITutor';
import Gamification from '@/components/Gamification';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Student'}</h1>
          <p className="text-muted-foreground mt-1">
            Let's make today's study session productive. Here's your personalized dashboard.
          </p>
        </div>
        
        {/* Main Tabs Navigation */}
        <div className="mb-8">
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:w-auto lg:inline-grid">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="study">Study Planner</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="ai">AI Tutor</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
              {/* Dashboard Summary */}
              <section className="mb-8">
                <DashboardSummary />
              </section>
              
              {/* Main Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Today's Tasks */}
                  <TodaysTasks />
                </div>
                
                <div className="space-y-6">
                  {/* Voice to Text Notes */}
                  <VoiceToTextNotes />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="study" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* AI Study Plan Creator */}
                <StudyPlanCreator />
                
                {/* Upcoming Exams */}
                <UpcomingExams />
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Progress Chart */}
                <ProgressChart />
                
                {/* AI Insights */}
                <AIInsights />
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* AI Tutor */}
                  <AITutor />
                </div>
                <div>
                  {/* AI Insights */}
                  <AIInsights />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              {/* Gamification */}
              <Gamification />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t mt-12 py-6 text-center text-muted-foreground text-sm">
        <p>AI Study Planner &copy; 2025 | Powered by Advanced AI Technologies</p>
      </footer>
    </div>
  );
};

export default Index;
