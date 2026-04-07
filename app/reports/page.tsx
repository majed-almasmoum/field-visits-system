'use client';

export default function ReportsPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        color: '#fff',
        padding: '40px',
        direction: 'rtl',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          background: '#111827',
          border: '3px solid #22c55e',
          borderRadius: '24px',
          padding: '32px',
        }}
      >
        <h1 style={{ fontSize: '42px', margin: 0, color: '#22c55e' }}>
          صفحة التقارير الجديدة شغالة
        </h1>

        <p style={{ fontSize: '22px', marginTop: '16px' }}>
          إذا تشوف هذه الصفحة السوداء والإطار الأخضر، فالتحديث وصل 100٪.
        </p>

        <div
          style={{
            marginTop: '24px',
            background: '#1f2937',
            borderRadius: '16px',
            padding: '24px',
            fontSize: '20px',
          }}
        >
          TEST REPORTS PAGE
        </div>
      </div>
    </div>
  );
}
