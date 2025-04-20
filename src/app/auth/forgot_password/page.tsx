'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const supabase = createClientComponentClient();

  const handleSendResetLink = async () => {
    if (!email) return toast.error('Please enter your email');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/auth/reset-password',
    });

    if (error) {
      console.error(error);
      toast.error('Failed to send reset link');
    } else {
      toast.success('Reset link sent! Check your email.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Toaster />
      <h1 className="text-xl font-bold mb-4">Forgot Password</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
      <button
        onClick={handleSendResetLink}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Send Reset Link
      </button>
    </div>
  );
}
