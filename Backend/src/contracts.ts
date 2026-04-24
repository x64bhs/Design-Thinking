import { z } from 'zod'

export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const ideaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  problemStatement: z.string().min(1),
  interactions: z.array(z.string().min(1)).min(1).max(6),
})

export const blueprintSchema = z.object({
  summary: z.string().min(1),
  problemStatement: z.string().min(1),
  targetAudience: z.array(z.string().min(1)).min(1),
  coreFeatures: z.array(z.string().min(1)).min(1),
  techStack: z.array(z.string().min(1)).min(1),
  implementationSteps: z.array(z.string().min(1)).min(2),
})

export const generateIdeasRequestSchema = z.object({
  domain: z.string().trim().min(1).nullable().optional(),
  techStack: z.string().trim().min(1).nullable().optional(),
  difficulty: difficultySchema,
  freeText: z.string().trim().min(1).nullable().optional(),
  count: z.number().int().min(3).max(12).default(7),
  excludeTitles: z.array(z.string().trim().min(1)).max(50).optional(),
})

export const generateOneIdeaRequestSchema = generateIdeasRequestSchema.omit({ count: true })

export const expandIdeaRequestSchema = z.object({
  idea: ideaSchema,
  difficulty: difficultySchema,
  domain: z.string().trim().min(1).nullable().optional(),
  techStack: z.string().trim().min(1).nullable().optional(),
  freeText: z.string().trim().min(1).nullable().optional(),
})

export const refineIdeaRequestSchema = z.object({
  blueprint: blueprintSchema,
  feedback: z.string().trim().min(3),
})

export const authCredentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
})

export const saveSessionRequestSchema = z.object({
  input: generateOneIdeaRequestSchema,
  ideas: z.array(ideaSchema),
  selectedIdea: ideaSchema.nullable().optional(),
  blueprint: blueprintSchema.nullable().optional(),
})

export const createShareRequestSchema = z.object({
  blueprint: blueprintSchema,
})

export const shareParamsSchema = z.object({
  shareId: z.string().min(1),
})

export const sessionParamsSchema = z.object({
  id: z.string().min(1),
})

