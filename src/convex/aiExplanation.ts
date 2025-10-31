"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const generateExplanation = action({
  args: {
    question: v.string(),
    userAnswer: v.string(),
    correctAnswer: v.string(),
    concept: v.string(),
  },
  handler: async (ctx, args) => {
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `Your answer "${args.userAnswer}" is incorrect because it doesn't align with the key concept of ${args.concept}. The correct answer is "${args.correctAnswer}" because it accurately reflects the main principle discussed in the lecture. ${args.concept} is fundamental to understanding this topic, and recognizing this distinction will help you master the material.`;
  },
});
