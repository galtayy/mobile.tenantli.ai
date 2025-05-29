import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '../../lib/api';
import Head from 'next/head';

export default function VerifyTest() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { email } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Sending request with:', { email, verificationCode: code });
      const response = await apiService.auth.verifyResetCode({ 
        email, 
        verificationCode: code 
      });
      
      if (response.data.success) {
        console.log('Success!');
        router.push('/password-reset/new-password');
      }
    } catch (err) {
      console.error('API Error caught:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.response?.data?.message);
      
      const errorMessage = err.response?.data?.message || 'Invalid code';
      console.log('Setting error to:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debug error state
  useEffect(() => {
    console.log('Error state is:', error);
  }, [error]);

  return (
    <>
      <Head>
        <title>Verify Code - tenantli</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#FBF5DA" />
      </Head>
      
      <div style={{ backgroundColor: '#FBF5DA', minHeight: '100vh' }}>
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#FBF5DA] z-20">
          <div className="w-full max-w-[390px] mx-auto">
            <div className="flex flex-row items-center px-[20px] h-[65px] gap-[10px]" style={{ paddingTop: 'env(safe-area-inset-top, 20px)' }}>
              <button 
                className="relative z-50 w-10 h-10 flex items-center justify-center -ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push('/password-reset');
                }}
                aria-label="Go back"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 19L8 12L15 5" stroke="#2E3642" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-semibold text-[18px] leading-[25px] text-center text-[#0B1420] absolute left-0 right-0 mx-auto">
                Test Verify Page
              </h1>
            </div>
          </div>
        </div>
        
        <div style={{ paddingTop: '85px', padding: '20px' }}>
          <p>Email: {email}</p>
      
      {/* Simple error display */}
      {error && (
        <div style={{
          backgroundColor: '#fff',
          border: '2px solid red',
          color: 'red',
          padding: '20px',
          margin: '20px 0',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          ERROR: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 4-digit code"
          style={{ 
            padding: '10px', 
            fontSize: '16px',
            margin: '10px 0',
            display: 'block'
          }}
        />
        <button 
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#2E3642',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Verify'}
        </button>
      </form>

          <pre style={{ marginTop: '20px', backgroundColor: '#eee', padding: '10px' }}>
            Error State: {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    </>
  );
}