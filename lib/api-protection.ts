/* eslint-disable */
import { NextRequest } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// CSRF token store (in production, use Redis or similar)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

// Security audit log store (in production, use persistent storage)
const securityAuditLog: SecurityAuditEntry[] = [];

interface AuthResult {
  user: any;
  isAdmin: boolean;
  supabase: any;
}

interface SecurityAuditEntry {
  timestamp: string;
  event: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime?: number;
}

interface CSRFValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Enhanced rate limiting middleware with security logging
 */
export function rateLimit(maxRequests: number = 10, windowMs: number = 60000) {
  return (request: NextRequest): RateLimitResult => {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const now = Date.now();
    const key = `rate_limit:${ip}`;

    const current = rateLimitStore.get(key);

    if (!current || now > current.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
    }

    if (current.count >= maxRequests) {
      // Log rate limit violation
      logSecurityEvent({
        event: 'RATE_LIMIT_EXCEEDED',
        ipAddress: ip,
        userAgent: request.headers.get('user-agent') || undefined,
        details: {
          maxRequests,
          windowMs,
          currentCount: current.count,
          endpoint: request.nextUrl.pathname
        },
        severity: 'MEDIUM'
      });

      return { allowed: false, remaining: 0, resetTime: current.resetTime };
    }

    current.count++;
    return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime };
  };
}

/**
 * CORS headers for API routes
 */
export function getCorsHeaders(origin?: string) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL!,
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
  ].filter(Boolean);

  const isAllowed = !origin || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Create service role client for system operations
 */
export function createServiceRoleClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Log security events for audit trail
 */
function logSecurityEvent(entry: Omit<SecurityAuditEntry, 'timestamp'>): void {
  const auditEntry: SecurityAuditEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };
  
  // Add to in-memory store (in production, send to persistent storage)
  securityAuditLog.push(auditEntry);
  
  // Keep only last 1000 entries in memory
  if (securityAuditLog.length > 1000) {
    securityAuditLog.shift();
  }
  
  // Log to console for development/debugging
  if (entry.severity === 'HIGH' || entry.severity === 'CRITICAL') {
    console.warn('SECURITY AUDIT:', JSON.stringify(auditEntry, null, 2));
  }
  
  // In production, send to external security monitoring service
  if (process.env.NODE_ENV === 'production') {
    sendToSecurityMonitoring(auditEntry);
  }
}

/**
 * Send security events to external monitoring service (placeholder)
 */
function sendToSecurityMonitoring(entry: SecurityAuditEntry): void {
  // Implement integration with security monitoring service
  // For now, just log to console
}

