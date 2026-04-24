import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;
export function signToken(payload) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.verify(token, JWT_SECRET);
}
export function getBearerToken(req) {
    const raw = (req.headers['authorization'] ?? '');
    const match = raw.match(/^Bearer\s+(.+)$/i);
    return match?.[1] ?? null;
}
