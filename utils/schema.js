import { pgTable, serial, varchar, text } from "drizzle-orm/pg-core";

export const MockInterview = pgTable('mockInterview', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition', { length: 255 }).notNull(),
  jobDesc: varchar('jobDesc', { length: 255 }).notNull(),
  jobExperience: varchar('jobExperience', { length: 255 }).notNull(),
  companyName: varchar('companyName', { length: 255 }),
  interviewRound: varchar('interviewRound', { length: 255 }),
  createdBy: varchar('createdBy', { length: 255 }).notNull(),
  createdAt: varchar('createdAt', { length: 255 }), // or use timestamp type
  mockId: varchar('mockId', { length: 255 }).notNull(),
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns').notNull(),
  userAns: text('UserAns').notNull(),
  feedback: text('feedback').notNull(),
  rating: varchar('rating'),
  clarityRating: varchar('clarityRating'),
  relevanceRating: varchar('relevanceRating'),
  depthRating: varchar('depthRating'),
  attentionScore: varchar('attentionScore'),
  confidenceScore: varchar('confidenceScore'),
  fillerWordCount: varchar('fillerWordCount'),
  duration: varchar('duration'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt', { length: 255 }), // or use timestamp type
});

export const InterviewDebrief = pgTable('interviewDebrief', {
  id: serial('id').primaryKey(),
  userEmail: varchar('userEmail').notNull(),
  companyName: varchar('companyName', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  questionsAsked: text('questionsAsked').notNull(),
  groqAnalysis: text('groqAnalysis').notNull(),
  createdAt: varchar('createdAt', { length: 255 })
});

export const StarStory = pgTable('starStory', {
  id: serial('id').primaryKey(),
  userEmail: varchar('userEmail').notNull(),
  storyTitle: varchar('storyTitle', { length: 255 }).notNull(),
  rawStory: text('rawStory').notNull(),
  starFormatted: text('starFormatted').notNull(),
  createdAt: varchar('createdAt', { length: 255 })
});

export const TopCompany = pgTable('topCompany', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 100 }).notNull(),
  logoUrl: varchar('logoUrl', { length: 255 }),
  // Cache Groq-generated insights so we don't query 25 times globally
  processJson: text('processJson') 
});
