import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      displayName: v.optional(v.string()), // user's preferred display name
      hasCompletedOnboarding: v.optional(v.boolean()),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    lectures: defineTable({
      userId: v.id("users"),
      title: v.string(),
      content: v.string(),
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
      createdAt: v.number(),
      nextReviewDate: v.optional(v.number()),
      lastStudied: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_user_and_status", ["userId", "status"]),

    quizResults: defineTable({
      userId: v.id("users"),
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
      completedAt: v.number(),
    })
      .index("by_lecture", ["lectureId"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  }
);

export default schema;