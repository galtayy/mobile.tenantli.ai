import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function TestMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Test Menu</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Menu Test Page</h1>
        
        <div className="space-y-4">
          {/* Test 1: Basic Button */}
          <div className="bg-white p-4 rounded">
            <h2 className="font-bold mb-2">Test 1: Basic Button Click</h2>
            <button 
              onClick={() => {
                setClickCount(prev => prev + 1);
                console.log('Button clicked!', clickCount + 1);
                alert('Button clicked! Count: ' + (clickCount + 1));
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Click Me ({clickCount})
            </button>
          </div>

          {/* Test 2: Menu Toggle */}
          <div className="bg-white p-4 rounded">
            <h2 className="font-bold mb-2">Test 2: Menu Toggle</h2>
            <button 
              onClick={() => {
                console.log('Menu toggle clicked, current state:', showMenu);
                setShowMenu(!showMenu);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              Toggle Menu ({showMenu ? 'ON' : 'OFF'})
            </button>
            
            {showMenu && (
              <div className="mt-4 p-4 bg-gray-200 rounded">
                <p>Menu is visible!</p>
                <button 
                  onClick={() => setShowMenu(false)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                >
                  Close Menu
                </button>
              </div>
            )}
          </div>

          {/* Test 3: Touch Events */}
          <div className="bg-white p-4 rounded">
            <h2 className="font-bold mb-2">Test 3: Touch Events</h2>
            <button 
              onTouchStart={() => console.log('Touch start')}
              onTouchEnd={() => console.log('Touch end')}
              onClick={() => console.log('Click event')}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Touch/Click Test
            </button>
          </div>

          {/* Navigation back to home */}
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    </>
  );
}