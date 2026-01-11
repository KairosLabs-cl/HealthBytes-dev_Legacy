import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

// Clerk middleware - adds auth info to all requests
export const clerkAuth = clerkMiddleware();

// Protect routes - returns 401 if not authenticated
export const requireAuthentication = requireAuth();

// Get user ID from Clerk session
export function getUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth?.userId || null;
}

// Get user role from Clerk session metadata
export function getUserRole(req: Request): string | null {
  const auth = getAuth(req);
  // Clerk stores custom claims in sessionClaims
  // You can set roles using Clerk's dashboard or API
  return (auth?.sessionClaims?.role as string) || null;
}

// Middleware to verify user has seller role
export function verifySeller(req: Request, res: Response, next: NextFunction) {
  const role = getUserRole(req);
  if (role !== 'seller') {
    res.status(403).json({ error: 'Access denied - seller role required' });
    return;
  }
  next();
}

// Middleware that sets userId on request object for backwards compatibility
export function attachUserId(req: Request, res: Response, next: NextFunction) {
  const userId = getUserId(req);
  if (userId) {
    req.userId = userId;
  }
  next();
}

// Legacy middleware for gradual migration - verifies either Clerk token or old JWT
// Remove this after full migration to Clerk
import jwt from 'jsonwebtoken';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  // First try Clerk auth
  const clerkAuth = getAuth(req);
  if (clerkAuth?.userId) {
    req.userId = clerkAuth.userId;
    req.role = (clerkAuth.sessionClaims?.role as string) || undefined;
    next();
    return;
  }

  // Fallback to legacy JWT for backwards compatibility
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    res.status(401).json({ error: 'Access denied' });
    return;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret');
    if (typeof decoded !== 'object' || !decoded?.userId) {
      res.status(401).json({ error: 'Access denied' });
      return;
    }
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Access denied' });
  }
}
