"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const gradeShortAnswer = action({
  args: {
    question: v.string(),
    correctAnswer: v.string(),
    userAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not configured");
    }

    const prompt = `You are an educational AI grading assistant. Grade the following short answer question.

Question: ${args.question}
Expected Answer: ${args.correctAnswer}
Student's Answer: ${args.userAnswer}

Provide a JSON response with:
1. "score": A number from 0-100 representing how well the answer matches the expected answer
2. "feedback": Constructive feedback explaining the grade (2-3 sentences)
3. "isCorrect": Boolean - true if score >= 70, false otherwise

Consider partial credit for answers that demonstrate understanding even if not perfectly worded.

Respond ONLY with valid JSON, no other text.`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CONVEX_SITE_URL || "https://lecturelabai.com",
          "X-Title": "The Lecture Lab",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No response from AI");
      }

      // Parse the JSON response
      const result = JSON.parse(content);

      return {
        score: result.score || 0,
        feedback: result.feedback || "Unable to generate feedback.",
        isCorrect: result.isCorrect || false,
      };
    } catch (error) {
      console.error("AI grading error:", error);
      // Fallback to simple string matching
      const isCorrect = args.userAnswer.toLowerCase().trim() === args.correctAnswer.toLowerCase().trim();
      return {
        score: isCorrect ? 100 : 0,
        feedback: isCorrect 
          ? "Your answer matches the expected response." 
          : "Your answer doesn't match the expected response. Please review the material.",
        isCorrect,
      };
    }
  },
});
