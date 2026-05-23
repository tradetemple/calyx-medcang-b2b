import { NextResponse, type NextRequest } from 'next/server';
import { UserRole } from '@/stores/userRoleStore';

/**
 * Role-based access control utility
 * Intercepts requests and renders a terminal-style 403 error for unauthorized access
 */

interface RoleAccessOptions {
  allowedRoles: UserRole[];
  redirectPath?: string;
  errorMessage?: string;
}

/**
 * Check if user has required role and return appropriate response
 */
export function checkRoleAccess(
  request: NextRequest,
  options: RoleAccessOptions
): NextResponse | null {
  const { allowedRoles, redirectPath = '/' } = options;

  // Get user role from cookie or session
  const userRole = getUserRoleFromRequest(request);

  // If user has required role, allow request to proceed
  if (allowedRoles.includes(userRole)) {
    return null; // null means allow request to continue
  }

  // If user is guest and trying to access protected route, show terminal error
  if (userRole === 'guest') {
    return renderTerminalError(request);
  }

  // For other roles, redirect to home
  return NextResponse.redirect(new URL(redirectPath, request.url));
}

/**
 * Get user role from request cookies
 */
function getUserRoleFromRequest(request: NextRequest): UserRole {
  // Use request.cookies instead of cookies() headers to avoid the crash
  const userRoleCookie = request.cookies.get('user_role');
  
  // Default to guest if no role found
  const role = userRoleCookie?.value || 'guest';
  
  // Validate role
  if (['guest', 'verified_pharmacy', 'medical_doctor'].includes(role)) {
    return role as UserRole;
  }
  
  return 'guest';
}

/**
 * Render terminal-style 403 error page
 */
function renderTerminalError(request: NextRequest): NextResponse {
  const errorHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>403 - Row Level Security Violation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background-color: #000;
          color: #22c55e;
          font-family: 'Courier New', monospace;
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .terminal-header {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .red { background-color: #ef4444; }
        .yellow { background-color: #eab308; }
        .green { background-color: #22c55e; }
        .terminal-window {
          background-color: #000;
          border: 2px solid rgba(239, 68, 68, 0.5);
          border-radius: 0.5rem;
          padding: 1.5rem;
          max-width: 4xl;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.1);
        }
        .error-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .error-icon {
          width: 32px;
          height: 32px;
          background-color: rgba(239, 68, 68, 0.2);
          border-radius: 0.375rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ef4444;
        }
        .error-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ef4444;
          letter-spacing: 0.05em;
        }
        .error-subtitle {
          font-size: 0.875rem;
          color: rgba(239, 68, 68, 0.7);
          margin-top: 0.25rem;
        }
        .error-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .detail-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .detail-label {
          color: #eab308;
          font-weight: 700;
          min-width: 100px;
        }
        .detail-value {
          color: #22c55e;
          font-family: monospace;
        }
        .detail-value.guest { color: #ef4444; font-weight: 700; }
        .detail-value.pharmacy { color: #22c55e; }
        .code-block {
          background-color: rgba(17, 24, 39, 0.5);
          border-radius: 0.375rem;
          padding: 1rem;
          border: 1px solid #4b5563;
          margin-bottom: 1.5rem;
        }
        .code-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .code-dot { width: 8px; height: 8px; border-radius: 50%; background-color: #3b82f6; }
        .code-label { font-size: 0.75rem; color: #9ca3af; }
        .code-content {
          font-size: 0.875rem;
          color: #60a5fa;
          white-space: pre-wrap;
          font-family: monospace;
          overflow-x: auto;
        }
        .solution-box {
          background-color: rgba(5, 150, 105, 0.1);
          border-radius: 0.375rem;
          padding: 1rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
        }
        .solution-title {
          color: #22c55e;
          font-weight: 700;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .solution-list {
          list-style-type: disc;
          margin-left: 1.5rem;
          font-size: 0.875rem;
          color: rgba(34, 197, 94, 0.8);
        }
        .footer {
          margin-top: 2rem;
          text-align: center;
        }
        .footer-text {
          color: #4b5563;
          font-size: 0.875rem;
        }
        .footer-subtext {
          color: #1f2937;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
      </style>
    </head>
    <body>
      <div class="terminal-window">
        <div class="terminal-header">
          <div class="dot red"></div>
          <div class="dot yellow"></div>
          <div class="dot green"></div>
          <span style="margin-left: 0.5rem; font-size: 0.875rem; color: rgba(34, 197, 94, 0.7);">
            supabase-postgrest:443
          </span>
        </div>

        <div class="error-header">
          <div class="error-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h1 class="error-title">ERROR 403: Row Level Security Violation</h1>
            <p class="error-subtitle">PostgREST has rejected this request at the database layer</p>
          </div>
        </div>

        <div class="error-details">
          <div class="detail-row">
            <span class="detail-label">Active Policy:</span>
            <span class="detail-value" style="background-color: rgba(34, 197, 94, 0.2); padding: 0.25rem 0.5rem; border-radius: 0.25rem; border: 1px solid rgba(34, 197, 94, 0.3);">
              CREATE POLICY "Pharmacies only" ON batches FOR SELECT USING (auth.jwt() ->> 'role' = 'verified_pharmacy')
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Request Role:</span>
            <span class="detail-value guest">guest</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Required Role:</span>
            <span class="detail-value pharmacy">verified_pharmacy</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Timestamp:</span>
            <span class="detail-value">${new Date().toISOString()}</span>
          </div>
        </div>

        <div class="code-block">
          <div class="code-header">
            <div class="code-dot"></div>
            <span class="code-label">Database Security in Action</span>
          </div>
          <pre class="code-content">-- This is how your Row Level Security policy works:
-- Only users with role = 'verified_pharmacy' can SELECT from batches

CREATE POLICY "Pharmacies only" ON batches 
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'verified_pharmacy');

-- Your JWT payload currently has:
-- { "role": "guest" }
-- 
-- The policy evaluates: "guest" = "verified_pharmacy" → FALSE
-- Result: Request rejected at database layer</pre>
        </div>

        <div class="solution-box">
          <h3 class="solution-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How to Fix This
          </h3>
          <ul class="solution-list">
            <li>Sign in with verified pharmacy credentials</li>
            <li>Use a JWT with role = 'verified_pharmacy'</li>
            <li>Implement proper authentication flow</li>
          </ul>
        </div>
      </div>

      <div class="footer">
        <p class="footer-text">This is an offline UI demonstration of your online database security</p>
        <p class="footer-subtext">Row Level Security (RLS) is enforced at the PostgreSQL level</p>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(errorHtml, {
    status: 403,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

/**
 * Check if user has required role (client-side)
 */
function checkRoleAccessClient(allowedRoles: UserRole[]): boolean {
  if (typeof window === 'undefined') return false;
  
  // Get role from localStorage
  const storedRole = localStorage.getItem('user-role-storage');
  if (!storedRole) return false;
  
  try {
    const state = JSON.parse(storedRole);
    return allowedRoles.includes(state.userRole);
  } catch {
    return false;
  }
}

/**
 * Set user role in cookie (for server-side)
 * @deprecated Use setUserRoleAction from @/lib/actions/auth instead
 */
async function setUserRoleInCookie(role: UserRole): Promise<void> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.set('user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

/**
 * Clear user role from cookie
 * @deprecated Use clearUserRoleAction from @/lib/actions/auth instead
 */
async function clearUserRoleCookie(): Promise<void> {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('user_role');
}
