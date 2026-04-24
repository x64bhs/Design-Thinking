import { Router } from 'express';
import { z } from 'zod';
import { blueprintSchema, createShareRequestSchema, expandIdeaRequestSchema, generateIdeasRequestSchema, generateOneIdeaRequestSchema, ideaSchema, refineIdeaRequestSchema, saveSessionRequestSchema, sessionParamsSchema, shareParamsSchema, } from '../contracts.js';
import { getDb } from '../db.js';
import { ApiError, asyncRoute, mustGetUserId } from '../http.js';
import { id } from '../ids.js';
import { stubExpandIdea, stubGenerateIdeas, stubGenerateOneIdea, stubRefineBlueprint } from '../stub.js';
import { generateJsonTextOrThrow } from '../llm.js';
export const ideasRouter = Router();
function shouldUseStubFallback() {
    const v = (process.env.STUB_FALLBACK ?? '').toLowerCase().trim();
    return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}
async function withStubFallback(run, fallback) {
    try {
        return await run();
    }
    catch (err) {
        if (shouldUseStubFallback()) {
            return await fallback();
        }
        throw err;
    }
}
function parseModelJson(raw, schema) {
    const trimmed = raw.trim();
    const sanitized = trimmed.startsWith('```')
        ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
        : trimmed;
    let parsed;
    try {
        parsed = JSON.parse(sanitized);
    }
    catch {
        throw new ApiError(502, 'Model returned non-JSON output');
    }
    const out = schema.safeParse(parsed);
    if (!out.success)
        throw new ApiError(502, 'Model JSON did not match schema');
    return out.data;
}
function geminiErrorMessage(error) {
    const message = error instanceof Error ? error.message : 'Unknown model error';
    return `Gemini request failed: ${message}`;
}
async function generateIdeasFromModel(input) {
    const exclude = (input.excludeTitles ?? []).slice(0, 50);
    const prompt = [
        'You are the core intelligence behind a project idea generation system.',
        'This is an interactive system: users will reject ideas and you must provide fresh, different directions.',
        '',
        'STAGE 1: IDEA LIST GENERATION',
        'Generate a list of project ideas as strict JSON.',
        'Return ONLY valid JSON. No markdown. No commentary.',
        'Each idea must be immediately understandable, concise, and clearly problem-driven.',
        'Ideas must feel different from each other (avoid repeating templates).',
        'Do NOT include unnecessary details like features or implementation in the problem statement.',
        'You must include `interactions` as 3–5 short, user-facing actions (not features/tech).',
        'JSON shape: {"ideas":[{"title":string,"problemStatement":string,"interactions":string[]}]}',
        `Count: ${input.count}`,
        `Difficulty: ${input.difficulty}`,
        input.domain ? `Domain: ${input.domain}` : null,
        input.techStack ? `Tech stack: ${input.techStack}` : null,
        input.freeText ? `User free text: ${input.freeText}` : null,
        exclude.length ? `Avoid reusing or closely mirroring these titles:\n- ${exclude.join('\n- ')}` : null,
        'Constraints: ideas should be distinct, practical, and implementable within a reasonable scope.',
    ].filter(Boolean).join('\n');
    try {
        const text = await generateJsonTextOrThrow(prompt);
        const parsed = parseModelJson(text, z.object({ ideas: z.array(ideaSchema.omit({ id: true })).min(1) }));
        return parsed.ideas.slice(0, input.count).map((idea) => ({ id: id('idea'), ...idea }));
    }
    catch (error) {
        throw new ApiError(502, geminiErrorMessage(error));
    }
}
async function generateOneIdeaFromModel(input) {
    const exclude = (input.excludeTitles ?? []).slice(0, 50);
    const prompt = [
        'You are the core intelligence behind a project idea generation system.',
        'The user just rejected an idea; generate a fresh direction that feels meaningfully different.',
        '',
        'STAGE 1: IDEA LIST GENERATION',
        'Generate ONE project idea as strict JSON.',
        'Return ONLY valid JSON.',
        'The idea must be immediately understandable, concise, and problem-driven.',
        'Do NOT include implementation details in the problem statement.',
        'You must include `interactions` as 3–5 short, user-facing actions (not features/tech).',
        'JSON shape: {"idea":{"title":string,"problemStatement":string,"interactions":string[]}}',
        `Difficulty: ${input.difficulty}`,
        input.domain ? `Domain: ${input.domain}` : null,
        input.techStack ? `Tech stack: ${input.techStack}` : null,
        input.freeText ? `User free text: ${input.freeText}` : null,
        exclude.length ? `Avoid reusing or closely mirroring these titles:\n- ${exclude.join('\n- ')}` : null,
    ].filter(Boolean).join('\n');
    try {
        const text = await generateJsonTextOrThrow(prompt);
        const parsed = parseModelJson(text, z.object({ idea: ideaSchema.omit({ id: true }) }));
        return { id: id('idea'), ...parsed.idea };
    }
    catch (error) {
        throw new ApiError(502, geminiErrorMessage(error));
    }
}
async function expandIdeaFromModel(input) {
    const prompt = [
        'You are the core intelligence behind a project idea generation system.',
        '',
        'STAGE 2: IDEA EXPANSION',
        'Expand the selected idea into a structured, buildable blueprint.',
        'Prioritize clarity over complexity. Avoid filler. Keep scope reasonable.',
        'Expand the selected project idea into strict JSON blueprint.',
        'Return ONLY valid JSON.',
        'JSON shape: {"blueprint":{"summary":string,"problemStatement":string,"targetAudience":string[],"coreFeatures":string[],"techStack":string[],"implementationSteps":string[]}}',
        `Title: ${input.idea.title}`,
        `Problem: ${input.idea.problemStatement}`,
        `Interactions: ${input.idea.interactions.join(' | ')}`,
        `Difficulty: ${input.difficulty}`,
        input.domain ? `Domain: ${input.domain}` : null,
        input.techStack ? `Preferred stack: ${input.techStack}` : null,
        input.freeText ? `User free text: ${input.freeText}` : null,
        '',
        'Requirements:',
        '- Summary: 1–2 lines.',
        '- Problem statement: restate and slightly expand the problem.',
        '- Target audience: realistic and specific.',
        '- Core features: meaningful capabilities; avoid vague items.',
        '- Tech stack: list of technologies (may include preferred stack if provided).',
        '- Implementation steps: actionable high-level steps for beginner/intermediate; logical sequence.',
    ].filter(Boolean).join('\n');
    try {
        const text = await generateJsonTextOrThrow(prompt);
        const parsed = parseModelJson(text, z.object({ blueprint: blueprintSchema }));
        return parsed.blueprint;
    }
    catch (error) {
        throw new ApiError(502, geminiErrorMessage(error));
    }
}
async function refineIdeaFromModel(input) {
    const prompt = [
        'You are the core intelligence behind a project idea generation system.',
        'REFINEMENT BEHAVIOR: Modify only relevant parts. Preserve the core idea unless explicitly changed.',
        'Keep the output structured and consistent with the existing blueprint schema.',
        'Refine this blueprint using feedback and return strict JSON.',
        'Return ONLY valid JSON.',
        'JSON shape: {"blueprint":{"summary":string,"problemStatement":string,"targetAudience":string[],"coreFeatures":string[],"techStack":string[],"implementationSteps":string[]}}',
        `Current blueprint JSON: ${JSON.stringify(input.blueprint)}`,
        `Feedback: ${input.feedback}`,
    ].join('\n');
    try {
        const text = await generateJsonTextOrThrow(prompt);
        const parsed = parseModelJson(text, z.object({ blueprint: blueprintSchema }));
        return parsed.blueprint;
    }
    catch (error) {
        throw new ApiError(502, geminiErrorMessage(error));
    }
}
ideasRouter.post('/generate', asyncRoute(async (req, res) => {
    const parsed = generateIdeasRequestSchema.safeParse(req.body);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const ideas = await withStubFallback(() => generateIdeasFromModel(parsed.data), () => stubGenerateIdeas(parsed.data, parsed.data.count));
    return res.json({ ideas });
}));
ideasRouter.post('/generate-one', asyncRoute(async (req, res) => {
    const parsed = generateOneIdeaRequestSchema.safeParse(req.body);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const idea = await withStubFallback(() => generateOneIdeaFromModel(parsed.data), () => stubGenerateOneIdea(parsed.data));
    return res.json({ idea });
}));
ideasRouter.post('/expand', asyncRoute(async (req, res) => {
    const parsed = expandIdeaRequestSchema.safeParse(req.body);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const blueprint = await withStubFallback(() => expandIdeaFromModel(parsed.data), () => stubExpandIdea(parsed.data));
    return res.json({ blueprint });
}));
ideasRouter.post('/refine', asyncRoute(async (req, res) => {
    const parsed = refineIdeaRequestSchema.safeParse(req.body);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const blueprint = await withStubFallback(() => refineIdeaFromModel(parsed.data), () => stubRefineBlueprint(parsed.data));
    return res.json({ blueprint });
}));
ideasRouter.post('/sessions', asyncRoute(async (req, res) => {
    const userId = mustGetUserId(req);
    const payload = saveSessionRequestSchema.safeParse(req.body);
    if (!payload.success)
        throw new ApiError(400, 'Invalid input');
    const now = new Date().toISOString();
    const sessionId = id('ses');
    const db = await getDb();
    await db.run(`INSERT INTO idea_sessions (id, user_id, input_json, ideas_json, selected_idea_json, blueprint_json, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?)`, sessionId, userId, JSON.stringify(payload.data.input), JSON.stringify(payload.data.ideas), payload.data.selectedIdea ? JSON.stringify(payload.data.selectedIdea) : null, payload.data.blueprint ? JSON.stringify(payload.data.blueprint) : null, now, now);
    return res.json({ sessionId });
}));
ideasRouter.get('/sessions', asyncRoute(async (req, res) => {
    const userId = mustGetUserId(req);
    const db = await getDb();
    const rows = await db.all('SELECT id, input_json, created_at, updated_at FROM idea_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50', userId);
    return res.json({
        sessions: rows.map((row) => ({
            id: row.id,
            input: JSON.parse(row.input_json),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        })),
    });
}));
ideasRouter.get('/sessions/:id', asyncRoute(async (req, res) => {
    const userId = mustGetUserId(req);
    const parsed = sessionParamsSchema.safeParse(req.params);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const db = await getDb();
    const row = await db.get(`SELECT input_json, ideas_json, selected_idea_json, blueprint_json, created_at, updated_at
     FROM idea_sessions
     WHERE id = ? AND user_id = ?`, parsed.data.id, userId);
    if (!row)
        throw new ApiError(404, 'Not found');
    return res.json({
        session: {
            id: parsed.data.id,
            input: JSON.parse(row.input_json),
            ideas: JSON.parse(row.ideas_json),
            selectedIdea: row.selected_idea_json ? JSON.parse(row.selected_idea_json) : null,
            blueprint: row.blueprint_json ? JSON.parse(row.blueprint_json) : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        },
    });
}));
ideasRouter.post('/share', asyncRoute(async (req, res) => {
    const userId = mustGetUserId(req);
    const parsed = createShareRequestSchema.safeParse(req.body);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const shareId = id('shr');
    const db = await getDb();
    await db.run('INSERT INTO share_links (id, user_id, blueprint_json, created_at) VALUES (?,?,?,?)', shareId, userId, JSON.stringify(parsed.data.blueprint), new Date().toISOString());
    return res.json({ shareId });
}));
ideasRouter.get('/share/:shareId', asyncRoute(async (req, res) => {
    const parsed = shareParamsSchema.safeParse(req.params);
    if (!parsed.success)
        throw new ApiError(400, 'Invalid input');
    const db = await getDb();
    const row = await db.get('SELECT blueprint_json FROM share_links WHERE id = ?', parsed.data.shareId);
    if (!row)
        throw new ApiError(404, 'Not found');
    return res.json({ blueprint: JSON.parse(row.blueprint_json) });
}));
