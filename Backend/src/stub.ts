import { id } from './ids.js'

type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type StubIdeaInput = {
  domain?: string | null
  techStack?: string | null
  difficulty: Difficulty
  freeText?: string | null
  excludeTitles?: string[] | undefined
}

function normalizeTokens(input: StubIdeaInput) {
  const domain = (input.domain ?? '').trim()
  const free = (input.freeText ?? '').trim()
  const focus = free.length ? free : domain
  const tokens = focus
    .split(/[^a-zA-Z0-9]+/g)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3)
  const unique = Array.from(new Set(tokens.map((t) => t.toLowerCase())))
  return { domain, free, tokens: unique.slice(0, 6) }
}

function pick<T>(arr: T[], idx: number) {
  return arr[idx % arr.length]
}

function makeIdea(i: number, input: StubIdeaInput) {
  const { domain, tokens } = normalizeTokens(input)
  const seed = `${domain}|${tokens.join(',')}|${input.difficulty}|${i}`.length

  const angles = [
    'time-saving',
    'accountability',
    'feedback loop',
    'organization',
    'habit-building',
    'accessibility',
    'decision-making',
    'motivation',
    'quality-checking',
    'progress tracking',
  ]

  const nouns = [
    'coach',
    'planner',
    'buddy',
    'tracker',
    'assistant',
    'dashboard',
    'notebook',
    'analyzer',
    'scheduler',
    'reviewer',
  ]

  const subject = tokens[0] ?? (domain || 'student')
  const angle = pick(angles, seed)
  const noun = pick(nouns, seed + 3)

  const title = `${capitalize(subject)} ${capitalize(noun)}`
  const problemStatement =
    angle === 'accessibility'
      ? `People interested in ${subject} struggle to access materials and guidance that match their pace and context.`
      : angle === 'feedback loop'
        ? `People working on ${subject} often don’t get fast, specific feedback, so they repeat mistakes and lose time.`
        : angle === 'accountability'
          ? `People trying to improve at ${subject} struggle to stay consistent without lightweight accountability.`
          : angle === 'progress tracking'
            ? `People improving at ${subject} can’t see what’s working, so they overwork the wrong areas.`
            : `People working on ${subject} waste time because planning and execution aren’t connected in one clear flow.`

  const interactions = [
    `Set a goal for ${subject}`,
    'Add a quick check-in',
    'Review progress snapshots',
    'Get a next-step suggestion',
  ]

  // Ensure 3–5 interactions.
  const trimmedInteractions = interactions.slice(0, 3 + ((seed % 3) === 0 ? 1 : 0))

  return {
    id: id('idea'),
    title: avoidTitles(title, input.excludeTitles),
    problemStatement,
    interactions: trimmedInteractions,
  }
}

function avoidTitles(title: string, exclude?: string[]) {
  if (!exclude?.length) return title
  const taken = new Set(exclude.map((t) => t.trim().toLowerCase()).filter(Boolean))
  if (!taken.has(title.trim().toLowerCase())) return title
  let k = 2
  while (taken.has(`${title} ${k}`.toLowerCase()) && k < 99) k++
  return `${title} ${k}`
}

function capitalize(s: string) {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function stubGenerateIdeas(input: StubIdeaInput, count: number) {
  const ideas = Array.from({ length: Math.max(1, count) }, (_, i) => makeIdea(i, input))
  return ideas
}

export function stubGenerateOneIdea(input: StubIdeaInput) {
  return makeIdea(0, input)
}

export function stubExpandIdea(input: {
  idea: { title: string; problemStatement: string; interactions: string[] }
  difficulty: Difficulty
  domain?: string | null
  techStack?: string | null
  freeText?: string | null
}) {
  const preferred = (input.techStack ?? '').trim()
  const techStack = preferred
    ? preferred.split(',').map((s) => s.trim()).filter(Boolean)
    : ['React', 'Node.js', 'SQLite']

  return {
    summary: `${input.idea.title} helps users move from intention to action with a lightweight loop of planning, doing, and reviewing.`,
    problemStatement: `${input.idea.problemStatement} The project focuses on making the next step obvious and easy to follow.`,
    targetAudience: [
      input.domain?.trim() ? `${input.domain.trim()} learners` : 'Students and self-learners',
      'Busy people who want quick structure',
    ],
    coreFeatures: [
      'Goal setup with a simple success definition',
      'Daily check-in with minimal input',
      'Progress timeline with highlights and blockers',
      'Next-step suggestions based on recent activity',
    ],
    techStack,
    implementationSteps: [
      'Define the main user flow: goal → check-in → review → next step.',
      'Design the data model for goals, check-ins, and progress summaries.',
      'Build the UI for creating a goal and logging quick check-ins.',
      'Implement a progress view that summarizes trends and highlights.',
      'Add next-step suggestions based on simple rules, then iterate.',
      'Polish UX, handle empty states, and add basic validation.',
    ],
  }
}

export function stubRefineBlueprint(input: {
  blueprint: {
    summary: string
    problemStatement: string
    targetAudience: string[]
    coreFeatures: string[]
    techStack: string[]
    implementationSteps: string[]
  }
  feedback: string
}) {
  const fb = input.feedback.trim()
  const extra =
    fb.length > 0
      ? ` Update requested: ${fb.slice(0, 140)}${fb.length > 140 ? '…' : ''}`
      : ''

  return {
    ...input.blueprint,
    summary: input.blueprint.summary + extra,
  }
}

