import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, Brain, Sparkles, TrendingUp, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl">📚</span>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight">The Lecture Lab</h1>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => navigate(isAuthenticated && user?.hasCompletedOnboarding ? "/dashboard" : "/auth")}
              variant="ghost"
              size="sm"
              className="cursor-pointer"
            >
              {isAuthenticated && user?.hasCompletedOnboarding ? "Dashboard" : "Sign In"}
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section - Enhanced */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-6 sm:space-y-8"
        >
          <motion.div 
            className="space-y-4 sm:space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Transform Lectures into
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                Interactive Learning
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
              Paste your lecture notes and let AI create personalized quizzes, summaries, and study materials in seconds.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="cursor-pointer h-12 px-10 text-base shadow-lg hover:shadow-xl transition-all"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section - Enhanced Grid */}
      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12 sm:space-y-16"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Everything You Need
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful AI-driven tools to help you master any subject
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: Brain,
                  title: "AI-Powered Generation",
                  description: "Advanced AI analyzes your notes and creates comprehensive study materials automatically",
                  delay: 0.1
                },
                {
                  icon: Zap,
                  title: "Interactive Quizzes",
                  description: "Multiple choice, fill-in-the-blank, and short answer questions to test your knowledge",
                  delay: 0.2
                },
                {
                  icon: TrendingUp,
                  title: "Spaced Repetition",
                  description: "Smart scheduling ensures you review material at optimal intervals for long-term retention",
                  delay: 0.3
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""}
                >
                  <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardHeader className="space-y-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Enhanced Steps */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-12 sm:space-y-16"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                How It Works
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Three simple steps to transform your learning
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
              {[
                {
                  step: "1",
                  title: "Paste Your Notes",
                  description: "Copy and paste your lecture notes or study materials",
                  delay: 0.1
                },
                {
                  step: "2",
                  title: "AI Generates Content",
                  description: "Our AI creates summaries, key concepts, and interactive quizzes",
                  delay: 0.2
                },
                {
                  step: "3",
                  title: "Study & Master",
                  description: "Take quizzes, track progress, and review at optimal intervals",
                  delay: 0.3
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay, duration: 0.5 }}
                  className="space-y-4 text-center"
                >
                  <motion.div 
                    className="h-14 w-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      <section className="border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to Transform Your Study Routine?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground">
                Join students who are learning smarter, not harder
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="cursor-pointer h-12 px-10 text-base shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
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