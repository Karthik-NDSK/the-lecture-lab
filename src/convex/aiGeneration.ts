"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const generateStudyMaterials = action({
  args: {
    lectureId: v.id("lectures"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Simulate AI processing with realistic delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate summary
      const summary = generateSummary(args.content);

      // Extract key concepts
      const keyConcepts = extractKeyConcepts(args.content);

      // Generate questions
      const questions = generateQuestions(args.content, keyConcepts);

      // Update lecture with generated materials
      await ctx.runMutation(internal.lectures.updateStatus, {
        lectureId: args.lectureId,
        status: "ready",
        summary,
        keyConcepts,
        questions,
      });
    } catch (error) {
      await ctx.runMutation(internal.lectures.updateStatus, {
        lectureId: args.lectureId,
        status: "error",
      });
    }
  },
});

function generateSummary(content: string): string {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const keyPoints = sentences.slice(0, Math.min(5, sentences.length));
  return keyPoints.join(". ") + ".";
}

function extractKeyConcepts(content: string): string[] {
  const words = content.toLowerCase().split(/\s+/);
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
  ]);

  const wordFreq = new Map<string, number>();
  words.forEach((word) => {
    const cleaned = word.replace(/[^a-z]/g, "");
    if (cleaned.length > 4 && !commonWords.has(cleaned)) {
      wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
    }
  });

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

function generateQuestions(
  content: string,
  concepts: string[]
): Array<{
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}> {
  const questions = [];
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);

  // Generate 10 MCQ questions
  for (let i = 0; i < Math.min(10, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const concept = concepts[i % concepts.length];

    questions.push({
      type: "mcq",
      question: `What is the main idea of: "${sentence.substring(0, 80)}..."?`,
      options: [
        `Related to ${concept}`,
        `About ${concepts[(i + 1) % concepts.length]}`,
        `Concerning ${concepts[(i + 2) % concepts.length]}`,
        `Regarding ${concepts[(i + 3) % concepts.length]}`,
      ],
      correctAnswer: `Related to ${concept}`,
      explanation: `This statement directly relates to the concept of ${concept}, which is a key topic in this lecture.`,
      concept,
    });
  }

  // Add 3 fill-in-blank questions
  for (let i = 0; i < Math.min(3, concepts.length); i++) {
    const concept = concepts[i];
    questions.push({
      type: "fill-blank",
      question: `The key concept of _____ is central to understanding this topic.`,
      correctAnswer: concept.toLowerCase(),
      explanation: `${concept} is one of the fundamental concepts covered in this lecture.`,
      concept,
    });
  }

  // Add 2 short answer questions
  for (let i = 0; i < Math.min(2, concepts.length); i++) {
    const concept = concepts[i];
    questions.push({
      type: "short-answer",
      question: `Explain the significance of ${concept} in your own words.`,
      correctAnswer: `${concept} is important because it represents a core principle discussed in the lecture.`,
      explanation: `A good answer should demonstrate understanding of ${concept} and its relevance to the overall topic.`,
      concept,
    });
  }

  return questions;
}
