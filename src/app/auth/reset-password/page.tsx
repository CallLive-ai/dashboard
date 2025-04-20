'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      toast.error('Missing code in URL');
      setLoading(false);
      return;
    }

    const exchangeCode = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('Code exchange error:', error.message);
        toast.error('Reset link is invalid or expired');
      }
      setLoading(false);
    };

    exchangeCode();
  }, [searchParams, supabase]);

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      console.error('Password update error:', error.message);
      toast.error('Failed to update password');
    } else {
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/login'), 1500);
    }
  };

  if (loading) return <div className="p-6 text-center">Verifying reset link...</div>;

  return (
    <div className="max-w-md mx-auto p-6">
      <Toaster />
      <h1 className="text-xl font-bold mb-4">Reset Your Password</h1>
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />
      <button
        onClick={handleResetPassword}
        className="w-full bg-green-600 text-white p-2 rounded"
      >
        Update Password
      </button>
    </div>
  );
}
