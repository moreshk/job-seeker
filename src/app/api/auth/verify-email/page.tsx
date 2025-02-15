'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VerifyEmail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');

  const resendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await response.json();
      setMessage(data.message);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please check your email for a verification link. If you didn&apos;t receive an email, you can request a new one.
        </p>
        {message && <p className="mt-2 text-center text-sm text-red-600">{message}</p>}
        <button
          onClick={resendVerification}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
}