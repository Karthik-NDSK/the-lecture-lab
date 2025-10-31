import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, BookOpen, Brain, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import { toast } from "sonner";
import type { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LectureDetail() {
  const { lectureId } = useParams<{ lectureId: Id<"lectures"> }>();
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const lecture = useQuery(api.lectures.get, lectureId ? { lectureId: lectureId as Id<"lectures"> } : "skip");
  const stats = useQuery(api.quizResults.getStats, lectureId ? { lectureId: lectureId as Id<"lectures"> } : "skip");
  const saveResult = useMutation(api.quizResults.saveResult);

  const [quizMode, setQuizMode] = useState<"overview" | "mcq" | "fill-blank" | "short-answer" | "results">("overview");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [quizResults, setQuizResults] = useState<Array<{ questionIndex: number; userAnswer: string; isCorrect: boolean; concept: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  if (!lectureId || !lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mcqQuestions = lecture.questions?.filter(q => q.type === "mcq") || [];
  const fillBlankQuestions = lecture.questions?.filter(q => q.type === "fill-blank") || [];
  const shortAnswerQuestions = lecture.questions?.filter(q => q.type === "short-answer") || [];

  const startQuiz = (mode: "mcq" | "fill-blank" | "short-answer") => {
    setQuizMode(mode);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResults([]);
  };

  const getCurrentQuestions = () => {
    if (quizMode === "mcq") return mcqQuestions;
    if (quizMode === "fill-blank") return fillBlankQuestions;
    if (quizMode === "short-answer") return shortAnswerQuestions;
    return [];
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    const questions = getCurrentQuestions();
    const results = questions.map((q, idx) => {
      const userAnswer = userAnswers[idx] || "";
      const isCorrect = userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      return {
        questionIndex: idx,
        userAnswer,
        isCorrect,
        concept: q.concept,
      };
    });

    setQuizResults(results);
    
    const score = results.filter(r => r.isCorrect).length;
    
    try {
      await saveResult({
        lectureId: lectureId as Id<"lectures">,
        quizType: quizMode,
        score,
        totalQuestions: questions.length,
        answers: results,
      });
      
      toast.success(`Quiz completed! Score: ${score}/${questions.length}`);
      setQuizMode("results");
    } catch (error) {
      toast.error("Failed to save quiz results");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = getCurrentQuestions();
  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {quizMode === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-4">{lecture.title}</h1>
                {stats && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📊 {stats.totalQuizzes} quizzes taken</span>
                    <span>⭐ {stats.averageScore}% average score</span>
                  </div>
                )}
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{lecture.summary}</p>
                </CardContent>
              </Card>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Key Concepts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lecture.keyConcepts?.map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startQuiz("mcq")}>
                  <CardHeader>
                    <CardTitle className="text-lg">Multiple Choice</CardTitle>
                    <CardDescription>{mcqQuestions.length} questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startQuiz("fill-blank")}>
                  <CardHeader>
                    <CardTitle className="text-lg">Fill in the Blank</CardTitle>
                    <CardDescription>{fillBlankQuestions.length} questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startQuiz("short-answer")}>
                  <CardHeader>
                    <CardTitle className="text-lg">Short Answer</CardTitle>
                    <CardDescription>{shortAnswerQuestions.length} questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full cursor-pointer">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {(quizMode === "mcq" || quizMode === "fill-blank" || quizMode === "short-answer") && currentQuestion && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quizMode === "mcq" && currentQuestion.options && (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <Button
                          key={idx}
                          variant={userAnswers[currentQuestionIndex] === option ? "default" : "outline"}
                          className="w-full justify-start text-left h-auto py-4 cursor-pointer"
                          onClick={() => handleAnswer(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {quizMode === "fill-blank" && (
                    <Input
                      placeholder="Type your answer..."
                      value={userAnswers[currentQuestionIndex] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                    />
                  )}

                  {quizMode === "short-answer" && (
                    <Textarea
                      placeholder="Type your answer..."
                      value={userAnswers[currentQuestionIndex] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      className="min-h-[150px]"
                    />
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} className="cursor-pointer">
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || Object.keys(userAnswers).length < questions.length}
                      className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Quiz"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {quizMode === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
                  <CardDescription className="text-xl">
                    Score: {quizResults.filter(r => r.isCorrect).length} / {quizResults.length}
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="space-y-4 mb-8">
                {questions.map((q, idx) => {
                  const result = quizResults[idx];
                  return (
                    <Card key={idx} className={result?.isCorrect ? "border-green-200" : "border-red-200"}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg flex-1">{q.question}</CardTitle>
                          {result?.isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div>
                          <span className="font-medium">Your answer: </span>
                          <span className={result?.isCorrect ? "text-green-600" : "text-red-600"}>
                            {result?.userAnswer || "No answer"}
                          </span>
                        </div>
                        {!result?.isCorrect && (
                          <div>
                            <span className="font-medium">Correct answer: </span>
                            <span className="text-green-600">{q.correctAnswer}</span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground pt-2 border-t">
                          {q.explanation}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setQuizMode("overview")} variant="outline" className="flex-1 cursor-pointer">
                  Back to Overview
                </Button>
                <Button onClick={() => startQuiz(quizMode as any)} className="flex-1 cursor-pointer">
                  Retake Quiz
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
