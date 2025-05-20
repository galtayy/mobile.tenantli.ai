import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiService } from '../../lib/api';

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
    <div style={{ padding: '20px', backgroundColor: '#FBF5DA', minHeight: '100vh' }}>
      <h1>Test Verify Page</h1>
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
  );
}