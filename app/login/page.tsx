'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');

  const supabase = createClient();

  const handleLogin = async () => {
    if (!email) {
      setMessage('⚠️ اكتب البريد الإلكتروني');
      return;
    }

    if (loading || cooldown > 0) return;

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
      setMessage('📩 تم إرسال الرابط، تحقق من بريدك الإلكتروني');
      setCooldown(60);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        direction: 'rtl',
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '34px',
                fontWeight: 800,
                color: '#111827',
                lineHeight: 1.2,
              }}
            >
              تقارير الزيارات الميدانية
            </h1>
            <p
              style={{
                margin: '8px 0 0',
                color: '#6b7280',
                fontSize: '18px',
              }}
            >
              دخول آمن بالبريد الإلكتروني عبر Supabase Auth
            </p>
          </div>

          <div
            style={{
              minWidth: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0f3d74, #d8b65a)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
            }}
          >
            مت
          </div>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: '18px',
            padding: '22px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: 800,
              color: '#111827',
            }}
          >
            تسجيل الدخول
          </h2>

          <p
            style={{
              margin: '10px 0 18px',
              color: '#6b7280',
              fontSize: '17px',
              lineHeight: 1.7,
            }}
          >
            أدخل بريدك الإلكتروني وسنرسل لك رابط دخول آمن.
          </p>

          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#111827',
            }}
          >
            البريد الإلكتروني
          </label>

          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: '1px solid #d1d5db',
              outline: 'none',
              fontSize: '16px',
              boxSizing: 'border-box',
              marginBottom: '14px',
            }}
          />

          <button
            onClick={handleLogin}
            disabled={loading || cooldown > 0}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: '#1d4f91',
              color: '#fff',
              fontSize: '17px',
              fontWeight: 700,
              cursor: loading || cooldown > 0 ? 'not-allowed' : 'pointer',
              opacity: loading || cooldown > 0 ? 0.65 : 1,
            }}
          >
            {loading
              ? 'جاري الإرسال...'
              : cooldown > 0
              ? `انتظر ${cooldown} ثانية`
              : 'إرسال رابط الدخول'}
          </button>

          {message ? (
            <div
              style={{
                marginTop: '14px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: message.includes('❌') ? '#fef2f2' : '#eff6ff',
                color: message.includes('❌') ? '#b91c1c' : '#1d4ed8',
                fontSize: '15px',
                textAlign: 'center',
              }}
            >
              {message}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
