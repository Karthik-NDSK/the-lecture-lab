import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const lectureId = await ctx.db.insert("lectures", {
      userId: user._id,
      title: args.title,
      content: args.content,
      status: "processing",
      createdAt: Date.now(),
    });

    return lectureId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return lectures;
  },
});

export const get = query({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || lecture.userId !== user._id) return null;

    return lecture;
  },
});

export const updateStatus = internalMutation({
  args: {
    lectureId: v.id("lectures"),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    summary: v.optional(v.string()),
    keyConcepts: v.optional(v.array(v.string())),
    questions: v.optional(
      v.array(
        v.object({
          type: v.string(),
          question: v.string(),
          options: v.optional(v.array(v.string())),
          correctAnswer: v.string(),
          explanation: v.string(),
          concept: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture) {
      throw new Error("Lecture not found");
    }

    await ctx.db.patch(args.lectureId, {
      status: args.status,
      summary: args.summary,
      keyConcepts: args.keyConcepts,
      questions: args.questions,
    });
  },
});

export const deleteLecture = mutation({
  args: { lectureId: v.id("lectures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const lecture = await ctx.db.get(args.lectureId);
    if (!lecture || lecture.userId !== user._id) {
      throw new Error("Lecture not found");
    }

    await ctx.db.delete(args.lectureId);
  },
});

export const getDueForReview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const now = Date.now();
    const lectures = await ctx.db
      .query("lectures")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "ready"))
      .collect();

    return lectures.filter((lecture) => {
      if (!lecture.nextReviewDate) return false;
      return lecture.nextReviewDate <= now;
    });
  },
});