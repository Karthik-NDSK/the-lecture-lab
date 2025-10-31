import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Loader2, Plus, BookOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { NewLectureModal } from "@/components/NewLectureModal";
import { LectureCard } from "@/components/LectureCard";
import { formatDistanceToNow } from "date-fns";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-2xl">📚</span>
            <h1 className="text-xl font-bold tracking-tight">The Lecture Lab</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome back, <span className="font-semibold text-foreground">{user?.displayName || user?.name}</span>!
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg h-auto cursor-pointer"
            onClick={() => setShowNewLectureModal(true)}
          >
            <Plus className="mr-2 h-5 w-5" />
            New Lecture
          </Button>
          <p className="text-muted-foreground mt-4">Paste your lecture notes to get started</p>
        </motion.div>

        {/* Due for Review Section */}
        {dueForReview && dueForReview.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Due for Review</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {dueForReview.map((lecture) => {
                const daysOverdue = Math.floor(
                  (Date.now() - (lecture.nextReviewDate || 0)) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Card
                    key={lecture._id}
                    className="min-w-[300px] cursor-pointer hover:shadow-lg transition-shadow border-2 border-orange-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{lecture.title}</CardTitle>
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
                        Start Review
                      </Button>
                    </CardContent>
                  </Card>
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
            className="mb-16 text-center py-8"
          >
            <p className="text-lg text-muted-foreground">You're all caught up! 🎉</p>
          </motion.div>
        )}

        {/* Recent Lectures Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Your Lectures</h2>
          </div>

          {!lectures ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : lectures.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-semibold mb-2">Create your first lecture to get started!</h3>
                <p className="text-muted-foreground mb-6">
                  Transform your notes into interactive study materials
                </p>
                <Button
                  onClick={() => setShowNewLectureModal(true)}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Lecture
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
