import Link from 'next/link';

export default function Page() {
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
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#fff',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '32px', color: '#111827' }}>
          نظام تقارير الزيارات الميدانية
        </h1>

        <p style={{ marginTop: '12px', color: '#6b7280', fontSize: '18px' }}>
          تم تعطيل تسجيل الدخول مؤقتًا لتسريع الإطلاق
        </p>

        <div style={{ marginTop: '28px' }}>
          <Link
            href="/reports"
            style={{
              display: 'inline-block',
              background: '#1d4f91',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            الدخول إلى التقارير
          </Link>
        </div>
      </div>
    </div>
  );
}
