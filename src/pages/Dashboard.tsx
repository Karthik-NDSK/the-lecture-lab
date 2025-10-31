import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, Plus, BookOpen, Calendar, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { NewLectureModal } from "@/components/NewLectureModal";
import { LectureCard } from "@/components/LectureCard";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showNewLectureModal, setShowNewLectureModal] = useState(false);

  const lectures = useQuery(api.lectures.list);
  const dueForReview = useQuery(api.lectures.getDueForReview);

  if (isLoading) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold tracking-tight">The Lecture Lab</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground hidden sm:block">
              Welcome back, <span className="font-semibold text-foreground">{user?.displayName || user?.name}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section with New Lecture Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 sm:mb-16"
        >
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Your Study Hub</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Transform your lecture notes into interactive study materials
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="h-12 px-8 text-base cursor-pointer bg-primary hover:bg-primary/90 shadow-sm"
                onClick={() => setShowNewLectureModal(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Lecture
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Due for Review Section */}
        {dueForReview && dueForReview.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 sm:mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Due for Review</h2>
                <p className="text-sm text-muted-foreground">Keep your knowledge fresh</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {dueForReview.map((lecture, index) => {
                const daysOverdue = Math.floor(
                  (Date.now() - (lecture.nextReviewDate || 0)) / (1000 * 60 * 60 * 24)
                );
                return (
                  <motion.div
                    key={lecture._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="cursor-pointer hover:shadow-lg transition-all border-2 border-orange-200 bg-orange-50/30">
                      <CardHeader>
                        <CardTitle className="text-lg line-clamp-2">{lecture.title}</CardTitle>
                        <div className="flex items-center gap-2">
                          {daysOverdue > 0 ? (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              {daysOverdue} {daysOverdue === 1 ? "day" : "days"} overdue
                            </span>
                          ) : (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                              Due today
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          className="w-full cursor-pointer"
                          onClick={() => navigate(`/lecture/${lecture._id}`)}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          Start Review
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {dueForReview && dueForReview.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 sm:mb-16"
          >
            <Card className="text-center py-8 border-2 border-dashed">
              <CardContent>
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-lg font-semibold mb-1">All Caught Up!</p>
                <p className="text-sm text-muted-foreground">No lectures due for review right now</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Lectures Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">All Lectures</h2>
              <p className="text-sm text-muted-foreground">Your complete study library</p>
            </div>
          </div>

          {!lectures ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : lectures.length === 0 ? (
            <Card className="text-center py-16 border-2 border-dashed">
              <CardContent>
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">Start Your Learning Journey</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first lecture to transform your notes into interactive study materials
                </p>
                <Button
                  onClick={() => setShowNewLectureModal(true)}
                  className="cursor-pointer"
                  size="lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Lecture
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lectures.map((lecture, index) => (
                <LectureCard key={lecture._id} lecture={lecture} index={index} />
              ))}
            </div>
          )}
        </motion.section>
      </div>

      <NewLectureModal
        open={showNewLectureModal}
        onOpenChange={setShowNewLectureModal}
      />
    </div>
  );
}