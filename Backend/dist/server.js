import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { ApiError } from './http.js';
import { authRouter } from './routes/auth.js';
import { ideasRouter } from './routes/ideas.js';
const app = express();
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api/ideas', ideasRouter);
app.use('/api', (_req, _res, next) => {
    next(new ApiError(404, 'Not found'));
});
app.use((err, _req, res, _next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    if (err instanceof SyntaxError) {
        return res.status(400).json({ error: 'Invalid JSON body' });
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ error: message || 'Internal server error' });
});
const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
});
