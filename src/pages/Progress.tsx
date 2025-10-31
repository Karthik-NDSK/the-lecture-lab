import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, TrendingUp, Award, BookOpen, Clock, Target, Flame } from "lucide-react";
import { useNavigate } from "react-router";

export default function Progress() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const masteryData = useQuery(api.analytics.getMasteryData);
  const streakData = useQuery(api.analytics.getStudyStreak);
  const overallStats = useQuery(api.analytics.getOverallStats);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/auth");
    return null;
  }

  if (!user?.hasCompletedOnboarding) {
    navigate("/onboarding");
    return null;
  }

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 80) return "bg-green-500";
    if (mastery >= 60) return "bg-yellow-500";
    if (mastery >= 40) return "bg-orange-500";
    if (mastery > 0) return "bg-red-500";
    return "bg-muted";
  };

  const getActivityColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count === 3) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold tracking-tight">The Lecture Lab</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Your Learning Progress 📈
          </h1>
          <p className="text-lg text-muted-foreground">Track your mastery and study habits</p>
        </motion.div>

        {/* Overall Statistics */}
        {overallStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12"
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">{overallStats.totalQuizzes}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Quizzes Taken</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">{overallStats.averageScore}%</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Average Score</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">{overallStats.totalLectures}</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Lectures Created</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">{overallStats.hoursStudied}h</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Hours Studied</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}

        {/* Study Streak */}
        {streakData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 sm:mb-12"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                      <Flame className="h-6 w-6 text-orange-500" />
                      Study Streak: Your Consistency
                    </CardTitle>
                    <CardDescription className="mt-2">Keep the momentum going!</CardDescription>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-orange-500">
                        {streakData.currentStreak}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {streakData.longestStreak}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Longest Streak</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto pb-4">
                  <div className="inline-grid grid-cols-[repeat(30,1fr)] gap-2 min-w-max">
                    {streakData.dailyActivity.slice(-180).map((day, idx) => (
                      <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.002 }}
                        whileHover={{ scale: 1.2 }}
                        className={`h-4 w-4 rounded-sm ${getActivityColor(day.count)} cursor-pointer transition-all`}
                        title={`${day.date}: ${day.count} quiz${day.count !== 1 ? "zes" : ""}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="h-3 w-3 rounded-sm bg-muted/30" />
                      <div className="h-3 w-3 rounded-sm bg-primary/30" />
                      <div className="h-3 w-3 rounded-sm bg-primary/50" />
                      <div className="h-3 w-3 rounded-sm bg-primary/70" />
                      <div className="h-3 w-3 rounded-sm bg-primary" />
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Mastery Heatmap */}
        {masteryData && masteryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <TrendingUp className="h-6 w-6" />
                  Mastery Heatmap: Your Knowledge Overview
                </CardTitle>
                <CardDescription>Visual representation of your concept mastery</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {masteryData.map((item, idx) => (
                    <motion.div
                      key={item.concept}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + idx * 0.02 }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="group relative"
                    >
                      <div
                        className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl ${getMasteryColor(
                          item.mastery
                        )} flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-md`}
                      >
                        <span className="text-white font-bold text-sm sm:text-base">
                          {item.mastery}%
                        </span>
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        <div className="font-semibold">{item.concept}</div>
                        <div className="text-xs opacity-90">
                          {item.correct}/{item.total} correct ({item.mastery}%)
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-6 text-xs text-muted-foreground flex-wrap">
                  <span className="font-medium">Mastery Level:</span>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-red-500" />
                    <span>&lt;40%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-orange-500" />
                    <span>40-59%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-yellow-500" />
                    <span>60-79%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500" />
                    <span>80-100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(!masteryData || masteryData.length === 0) && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Progress Data Yet</h3>
              <p className="text-muted-foreground mb-6">
                Complete some quizzes to see your learning analytics!
              </p>
              <Button onClick={() => navigate("/dashboard")} className="cursor-pointer">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
