CREATE TABLE "userAnswer" (
	"id" serial PRIMARY KEY NOT NULL,
	"mockId" varchar NOT NULL,
	"question" varchar NOT NULL,
	"correctAns" text NOT NULL,
	"UserAns" text NOT NULL,
	"feedback" text NOT NULL,
	"rating" varchar,
	"clarityRating" varchar,
	"relevanceRating" varchar,
	"depthRating" varchar,
	"attentionScore" varchar,
	"confidenceScore" varchar,
	"userEmail" varchar,
	"createdAt" varchar(255)
);
