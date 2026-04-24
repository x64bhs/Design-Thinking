import { getBearerToken, verifyToken } from './auth.js';
export class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
// Ensures thrown/rejected errors from async routes reach Express error middleware
// even in setups where promise rejections aren't automatically forwarded.
export function asyncRoute(handler) {
    return function wrapped(req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}
export function mustGetUserId(req) {
    const token = getBearerToken(req);
    if (!token) {
        throw new ApiError(401, 'Unauthorized');
    }
    try {
        return verifyToken(token).sub;
    }
    catch {
        throw new ApiError(401, 'Unauthorized');
    }
}
