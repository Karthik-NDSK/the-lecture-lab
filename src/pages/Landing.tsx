import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Brain, Sparkles, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl">📚</span>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">The Lecture Lab</h1>
          </div>
          <Button
            onClick={() => navigate(isAuthenticated && user?.hasCompletedOnboarding ? "/dashboard" : "/auth")}
            variant="ghost"
            size="sm"
            className="cursor-pointer"
          >
            {isAuthenticated && user?.hasCompletedOnboarding ? "Dashboard" : "Sign In"}
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </header>

      {/* Hero Section - Minimal */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 sm:space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Transform Lectures into
              <br />
              Interactive Learning
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Paste your lecture notes and let AI create personalized quizzes, summaries, and study materials in seconds.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="cursor-pointer h-11 px-8"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Features Section - Minimal Grid */}
      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
              Everything You Need
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight">AI-Powered Generation</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Advanced AI analyzes your notes and creates comprehensive study materials automatically
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight">Interactive Quizzes</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Multiple choice, fill-in-the-blank, and short answer questions to test your knowledge
                </p>
              </div>

              <div className="space-y-3 p-6 rounded-lg border bg-card sm:col-span-2 lg:col-span-1">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold tracking-tight">Spaced Repetition</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Smart scheduling ensures you review material at optimal intervals for long-term retention
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Minimal Steps */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
              <div className="space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto">
                  1
                </div>
                <h3 className="font-semibold">Paste Your Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Copy and paste your lecture notes or study materials
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto">
                  2
                </div>
                <h3 className="font-semibold">AI Generates Content</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI creates summaries, key concepts, and interactive quizzes
                </p>
              </div>

              <div className="space-y-3 text-center">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mx-auto">
                  3
                </div>
                <h3 className="font-semibold">Study & Master</h3>
                <p className="text-sm text-muted-foreground">
                  Take quizzes, track progress, and review at optimal intervals
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                Ready to Transform Your Study Routine?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Join students who are learning smarter, not harder
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="cursor-pointer h-11 px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 The Lecture Lab. Built with ❤️ for students everywhere.</p>
        </div>
      </footer>
    </div>
  );
}