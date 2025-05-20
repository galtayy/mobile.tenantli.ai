import React from 'react';
import PublicLayout from '../../components/PublicLayout';
import Head from 'next/head';

export default function TermsOfService() {
  return (
    <PublicLayout>
      <Head>
        <title>Terms of Service - tenantli</title>
      </Head>
      <div className="min-h-screen bg-[#FBF5DA] font-['Nunito']">
        <div className="w-full max-w-[420px] mx-auto p-4">
          <div className="bg-white border border-[#F6FEF7] rounded-[16px] p-4 shadow-sm mt-8">
            <iframe 
              src="https://app.termly.io/policy-viewer/policy.html?policyUUID=5a062fb9-9dc3-4411-91d9-ca741286d1de"
              width="100%"
              height="600"
              frameBorder="0"
              style={{ 
                minHeight: '600px',
                borderRadius: '12px'
              }}
              title="Terms of Service"
              className="rounded-[12px]"
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}