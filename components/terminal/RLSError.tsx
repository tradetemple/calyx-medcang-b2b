'use client';

import React from 'react';

interface RLSErrorProps {
  title?: string;
  message?: string;
  policyName?: string;
  requiredRole?: string;
  dict: any;
}

/**
 * Terminal-style 403 error component that demonstrates Row Level Security (RLS) violations.
 * This component is designed to teach CTOs and developers about database-level security.
 */
export default function RLSError({ 
  title, 
  message,
  policyName: customPolicyName,
  requiredRole: customRequiredRole,
  dict
}: RLSErrorProps) {
  // Simulated PostgREST error details
  const policyName = customPolicyName || '"Pharmacies only"';
  const tableName = 'batches';
  const policyType = 'SELECT';

  const t = dict;
  
  // Client-side only timestamp to avoid hydration mismatch
  const [timestamp, setTimestamp] = React.useState<string>('');
  
  React.useEffect(() => {
    setTimestamp(new Date().toISOString());
  }, []);

  // Show placeholder during initial render to prevent hydration mismatch
  if (!timestamp) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="animate-pulse text-green-500">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-3 md:p-8 flex flex-col items-center justify-center">
      {/* Terminal Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-sm text-green-400 opacity-75">
            supabase-postgrest:443
          </span>
        </div>

        {/* Error Header */}
        <div className="bg-black border-2 border-red-500/50 rounded-lg p-3 md:p-6 shadow-2xl shadow-red-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1 hidden md:block bg-red-500/20 rounded-md flex items-center justify-center border border-red-500">
              <svg 
                className="w-8 h-8 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base md:text-2xl font-bold text-red-500 tracking-wider uppercase">
                {t.error403} {title || 'Row Level Security Violation'}
              </h1>
              <p className="text-xs md:text-sm text-red-400/70">
                {message || t.message}
              </p>
            </div>
          </div>

          {/* Error Details */}
          <div className="space-y-3">
            <div className="flex items-start md:gap-3 text-xs md:text-sm">
              <span className="text-yellow-500 font-bold mr-2 md:min-w-[100px]">{t.details.activePolicy}</span>
              <code className="text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/30">
                CREATE POLICY {policyName} ON {tableName} FOR {policyType} USING (
                auth.jwt() -&gt;&gt; 'role' = 'verified_pharmacy')
              </code>
            </div>

            <div className="flex items-start gap-3 text-xs md:text-sm">
              <span className="text-yellow-500 font-bold min-w-[100px]">{t.details.requestRole}</span>
              <span className="text-red-400 font-bold">{t.details.guest}</span>
            </div>

            <div className="flex items-start gap-3 text-xs md:text-sm">
              <span className="text-yellow-500 font-bold min-w-[100px]">{t.details.requiredRole}</span>
              <span className="text-green-400">{customRequiredRole || 'verified_pharmacy'}</span>
            </div>

            <div className="flex items-start gap-3 text-xs md:text-sm">
              <span className="text-yellow-500 font-bold min-w-[100px]">{t.details.timestamp}</span>
              <span className="text-gray-400">{timestamp}</span>
            </div>
          </div>

          {/* Code Example */}
          <div className="mt-6 bg-gray-900/50 rounded-lg p-2 md:p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-400">{t.exampleTitle}</span>
            </div>
            <pre className="text-[10px] md:text-sm text-blue-300 overflow-x-auto">
              {`-- This is how the Row Level Security policy works:
-- Only users with role = 'verified_pharmacy' can SELECT from batches

CREATE POLICY "Pharmacies only" ON batches 
  FOR SELECT 
  USING (auth.jwt() -&gt;&gt; 'role' = 'verified_pharmacy');

-- Your JWT payload currently has:
-- { "role": "guest" }
-- 
-- The policy evaluates: "guest" = "verified_pharmacy" → FALSE
-- Result: Request rejected at database layer`}
            </pre>
          </div>

          {/* Solution Section */}
          <div className="mt-6 bg-green-900/10 rounded-lg p-3 md:p-4 border border-green-500/30">
            <h3 className="text-green-400 font-bold mb-2 flex items-center gap-2 text-sm md:text-base">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t.solution.title}
            </h3>
            <ul className="text-xs md:text-sm text-green-300/80 space-y-1 list-disc list-inside">
              <li>{t.solution.solution}</li>
              <li>{t.solution.explanation}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="my-8 text-center">
        <p className="text-gray-500 text-xs md:text-sm">
          {t.footer.notice}
        </p>
        <p className="text-gray-600 text-[10px] md:text-xs mt-1">
          {t.footer.disclaimer}
        </p>
      </div>
    </div>
  );
}
