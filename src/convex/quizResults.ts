import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const saveResult = mutation({
  args: {
    lectureId: v.id("lectures"),
    quizType: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        userAnswer: v.string(),
        isCorrect: v.boolean(),
        concept: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const resultId = await ctx.db.insert("quizResults", {
      userId: user._id,
      lectureId: args.lectureId,
      quizType: args.quizType,
      score: args.score,
      totalQuestions: args.totalQuestions,
      answers: args.answers,
      completedAt: Date.now(),
    });

    // Calculate next review date based on score
    const scorePercentage = (args.score / args.totalQuestions) * 100;
    let daysUntilReview = 1;
    if (scorePercentage >= 90) daysUntilReview = 7;
    else if (scorePercentage >= 80) daysUntilReview = 3;
    else if (scorePercentage >= 60) daysUntilReview = 1;

    const nextReviewDate = Date.now() + daysUntilReview * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.lectureId, {
      nextReviewDate,
      lastStudied: Date.now(),
    });

    return resultId;
  },
});

export const getByLecture = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .order("desc")
      .collect();

    return results;
  },
});

export const getStats = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_lecture", (q) => q.eq("lectureId", args.lectureId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    if (results.length === 0) return null;

    const totalQuizzes = results.length;
    const averageScore =
      results.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
      totalQuizzes;
    const lastStudied = Math.max(...results.map((r) => r.completedAt));

    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      lastStudied,
    };
  },
});
