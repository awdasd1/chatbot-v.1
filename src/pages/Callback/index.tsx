import React from 'react';
import { useHandleSignInCallback } from '@logto/react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
  const navigate = useNavigate();
  
  const { isLoading } = useHandleSignInCallback(() => {
    // Navigate to root path when finished
    navigate('/');
  });

  // When it's working in progress
  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 glass-effect animate-pulse">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">جاري تسجيل الدخول...</h2>
          <p className="text-white/70">يرجى الانتظار قليلاً</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Callback;
