import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getMasteryData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Get all quiz results for the user
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Aggregate mastery by concept
    const conceptStats = new Map<string, { correct: number; total: number }>();

    results.forEach((result) => {
      result.answers.forEach((answer) => {
        const concept = answer.concept;
        const stats = conceptStats.get(concept) || { correct: 0, total: 0 };
        stats.total += 1;
        if (answer.isCorrect) stats.correct += 1;
        conceptStats.set(concept, stats);
      });
    });

    // Convert to array with mastery percentage
    const masteryData = Array.from(conceptStats.entries()).map(([concept, stats]) => ({
      concept,
      mastery: Math.round((stats.correct / stats.total) * 100),
      correct: stats.correct,
      total: stats.total,
    }));

    return masteryData.sort((a, b) => a.concept.localeCompare(b.concept));
  },
});

export const getStudyStreak = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    if (results.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        dailyActivity: [],
      };
    }

    // Create a map of dates to quiz counts
    const dailyQuizzes = new Map<string, number>();
    results.forEach((result) => {
      const date = new Date(result.completedAt).toISOString().split("T")[0];
      dailyQuizzes.set(date, (dailyQuizzes.get(date) || 0) + 1);
    });

    // Calculate streaks
    const sortedDates = Array.from(dailyQuizzes.keys()).sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date(today);

    // Calculate current streak
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (dailyQuizzes.has(dateStr)) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak
    let prevDate: Date | null = null;
    sortedDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const dayDiff = Math.floor(
          (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      prevDate = currentDate;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Generate daily activity for last 180 days
    const dailyActivity = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 179);

    for (let i = 0; i < 180; i++) {
      const dateStr = startDate.toISOString().split("T")[0];
      dailyActivity.push({
        date: dateStr,
        count: dailyQuizzes.get(dateStr) || 0,
      });
      startDate.setDate(startDate.getDate() + 1);
    }

    return {
      currentStreak,
      longestStreak,
      dailyActivity,
    };
  },
});

export const getOverallStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (results.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        totalLectures: lectures.length,
        hoursStudied: 0,
        totalQuestions: 0,
      };
    }

    const totalQuizzes = results.length;
    const totalScore = results.reduce(
      (sum, r) => sum + (r.score / r.totalQuestions) * 100,
      0
    );
    const averageScore = Math.round(totalScore / totalQuizzes);

    // Estimate hours studied (assume 2 minutes per question)
    const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
    const hoursStudied = Math.round((totalQuestions * 2) / 60 * 10) / 10;

    return {
      totalQuizzes,
      averageScore,
      totalLectures: lectures.length,
      hoursStudied,
      totalQuestions,
    };
  },
});
