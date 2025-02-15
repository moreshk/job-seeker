'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyEmail() {
  const [status, setStatus] = useState('Verifying...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('Invalid verification link');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/auth/signin?verified=true');
          }, 2000);
        } else {
          setStatus(data.error || 'Verification failed');
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setStatus('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Email Verification</h2>
          <div className="mt-4 text-center text-md text-gray-600">
            {status}
          </div>
        </div>
      </div>
    </div>
  );
} 