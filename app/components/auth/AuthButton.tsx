"use client";
import { useState } from 'react';
import { AuthPopup } from './AuthPopup';

interface AuthButtonProps {
  mode?: 'login' | 'register';
  className?: string;
  children: React.ReactNode;
}

export function AuthButton({ mode = 'login', className, children }: AuthButtonProps) {
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuthPopup(true)}
        className={className}
      >
        {children}
      </button>

      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        initialMode={mode}
      />
    </>
  );
}