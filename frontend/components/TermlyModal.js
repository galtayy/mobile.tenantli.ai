import React, { useState, useEffect } from 'react';

const TermlyModal = ({ isOpen, onClose, title, policyUUID }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" />
        
        <div
          className="relative w-full max-w-sm mx-auto bg-white shadow-xl animate-slideUp overflow-hidden rounded-[16px] my-8 sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 rounded-full bg-white/90 backdrop-blur text-gray-700 hover:text-gray-900 focus:outline-none p-2 shadow-lg transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {isLoading && (
            <div className="absolute inset-0 flex justify-center items-center bg-white z-10">
              <div className="text-gray-500">Loading...</div>
            </div>
          )}
          
          <iframe
            src={`https://app.termly.io/policy-viewer/policy.html?policyUUID=${policyUUID}`}
            width="100%"
            className="w-full h-[65vh] sm:h-[75vh] md:h-[80vh]"
            frameBorder="0"
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default TermlyModal;