'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setError(error.message);
    else setMessage('تم إرسال رابط الدخول إلى بريدك الإلكتروني.');

    setLoading(false);
  };

  return (
    <form className="card section" onSubmit={onSubmit}>
      <h2 className="section-title">تسجيل الدخول</h2>
      <p className="muted">أدخل بريدك الإلكتروني وسيصلك رابط دخول آمن.</p>
      <div className="field">
        <label className="label">البريد الإلكتروني</label>
        <input
          className="input"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
      </div>
      <div style={{ height: 12 }} />
      <button className="button" disabled={loading} type="submit">
        {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الدخول'}
      </button>
      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}
    </form>
  );
}
