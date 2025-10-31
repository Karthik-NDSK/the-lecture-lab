import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowLeft, BookOpen, Brain, CheckCircle, XCircle, Sparkles, Share2 } from "lucide-react";
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

  const handleShareResults = () => {
    if (!lecture) return;
    
    const score = quizResults.filter(r => r.isCorrect).length;
    const total = quizResults.length;
    const percentage = Math.round((score / total) * 100);
    
    const shareText = `🎓 I just scored ${percentage}% (${score}/${total}) on "${lecture.title}" in The Lecture Lab! 📚`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Quiz Results',
        text: shareText,
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(shareText);
        toast.success("Results copied to clipboard!");
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareText);
      toast.success("Results copied to clipboard!");
    }
  };

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {quizMode === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">{lecture.title}</h1>
                {stats && (
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                    <span>📊 {stats.totalQuizzes} quizzes taken</span>
                    <span>⭐ {stats.averageScore}% average score</span>
                  </div>
                )}
              </div>

              <Card className="mb-6 sm:mb-8">
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

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Card className="mb-4 sm:mb-6">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl leading-snug">{currentQuestion.question}</CardTitle>
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

              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="cursor-pointer"
                >
                  Previous
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} className="cursor-pointer flex-1 sm:flex-initial">
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || Object.keys(userAnswers).length < questions.length}
                      className="cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 sm:flex-initial"
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
              {/* Score Summary Card */}
              <Card className="mb-6 sm:mb-8 overflow-hidden">
                <div className={`p-4 sm:p-6 text-center ${
                  (quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.8 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50' 
                    : (quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.6
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50'
                    : 'bg-gradient-to-br from-red-50 to-rose-50'
                }`}>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="text-5xl sm:text-6xl mb-3 sm:mb-4"
                  >
                    {(quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.8 ? '🎉' : 
                     (quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.6 ? '👍' : '📚'}
                  </motion.div>
                  <CardTitle className="text-2xl sm:text-3xl mb-2">
                    {(quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.8 ? 'Excellent Work!' : 
                     (quizResults.filter(r => r.isCorrect).length / quizResults.length) >= 0.6 ? 'Good Job!' : 'Keep Practicing!'}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-3 sm:gap-4 mt-3 sm:mt-4">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-green-600">
                        {quizResults.filter(r => r.isCorrect).length}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-xl sm:text-2xl text-muted-foreground">/</div>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold">
                        {quizResults.length}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4">
                    <div className="text-base sm:text-lg font-semibold">
                      {Math.round((quizResults.filter(r => r.isCorrect).length / quizResults.length) * 100)}% Score
                    </div>
                  </div>
                </div>
              </Card>

              {/* Mistakes Summary */}
              {quizResults.filter(r => !r.isCorrect).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="mb-6 sm:mb-8 border-orange-200 bg-orange-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <XCircle className="h-5 w-5" />
                        Areas to Review ({quizResults.filter(r => !r.isCorrect).length} mistakes)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(quizResults.filter(r => !r.isCorrect).map(r => r.concept))).map((concept, idx) => (
                          <Badge key={idx} variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Detailed Results */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {questions.map((q, idx) => {
                  const result = quizResults[idx];
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <Card className={`overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                        result?.isCorrect 
                          ? "border-green-200 bg-green-50/30 hover:border-green-300" 
                          : "border-red-200 bg-red-50/30 hover:border-red-300"
                      }`}>
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-2 sm:gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  Question {idx + 1}
                                </Badge>
                                <Badge 
                                  variant="secondary" 
                                  className={result?.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                                >
                                  {result?.concept}
                                </Badge>
                              </div>
                              <CardTitle className="text-sm sm:text-base md:text-lg leading-snug">{q.question}</CardTitle>
                            </div>
                            <motion.div
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.5 + idx * 0.05, type: "spring", stiffness: 200 }}
                              whileHover={{ scale: 1.2, rotate: 360 }}
                            >
                              {result?.isCorrect ? (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center transition-colors hover:bg-green-200 flex-shrink-0">
                                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-100 flex items-center justify-center transition-colors hover:bg-red-200 flex-shrink-0">
                                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                          {/* Your Answer */}
                          <div className={`p-2 sm:p-3 rounded-lg border-2 ${
                            result?.isCorrect 
                              ? "bg-green-50 border-green-200" 
                              : "bg-red-50 border-red-300"
                          }`}>
                            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                              <span className="font-semibold text-xs sm:text-sm flex-shrink-0">Your answer:</span>
                              <span className={`flex-1 font-medium text-xs sm:text-sm ${
                                result?.isCorrect ? "text-green-700" : "text-red-700 line-through"
                              }`}>
                                {result?.userAnswer || "No answer provided"}
                              </span>
                            </div>
                          </div>

                          {/* Correct Answer (only show if wrong) */}
                          {!result?.isCorrect && (
                            <div className="p-2 sm:p-3 rounded-lg bg-green-50 border-2 border-green-300">
                              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                                <span className="font-semibold text-xs sm:text-sm text-green-800 flex-shrink-0">Correct answer:</span>
                                <span className="flex-1 text-green-800 font-bold text-xs sm:text-sm">
                                  {q.correctAnswer}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          <div className="pt-2 sm:pt-3 border-t">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-xs sm:text-sm mb-1">Explanation:</div>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {q.explanation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => setQuizMode("overview")} 
                    variant="outline" 
                    className="w-full cursor-pointer h-12"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Overview
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleShareResults}
                    variant="outline"
                    className="w-full cursor-pointer h-12"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Results
                  </Button>
                </motion.div>
                <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={() => startQuiz(quizMode as any)} 
                    className="w-full cursor-pointer h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Retake Quiz
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
