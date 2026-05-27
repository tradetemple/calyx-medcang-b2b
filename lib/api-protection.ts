import { NextRequest } from 'next/server';

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const securityAuditLog: SecurityAuditEntry[] = [];

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

export function getCorsHeaders(origin?: string) {
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
  ].filter(Boolean) as string[];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
    'Access-Control-Max-Age': '86400',
  };
}

function logSecurityEvent(entry: Omit<SecurityAuditEntry, 'timestamp'>): void {
  const auditEntry: SecurityAuditEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };
  
  securityAuditLog.push(auditEntry);
  
  if (securityAuditLog.length > 1000) {
    securityAuditLog.shift();
  }
  
  if (entry.severity === 'HIGH' || entry.severity === 'CRITICAL') {
    console.warn('SECURITY AUDIT:', JSON.stringify(auditEntry, null, 2));
  }
  
  if (process.env.NODE_ENV === 'production') {
    sendToSecurityMonitoring(auditEntry);
  }
}

function sendToSecurityMonitoring(entry: SecurityAuditEntry): void {
  // Implement integration with security monitoring service
}

