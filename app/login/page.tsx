'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleLogin = async () => {
    if (!email) {
      setMessage('⚠️ اكتب الإيميل');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage('📩 تم إرسال الرابط، شيك الإيميل');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>تسجيل الدخول</h2>

      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          borderRadius: '8px',
          border: '1px solid #ccc',
        }}
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '8px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? '⏳ جاري الإرسال...' : 'إرسال رابط الدخول'}
      </button>

      {message && (
        <p style={{ marginTop: '15px', color: '#333' }}>{message}</p>
      )}
    </div>
  );
}
