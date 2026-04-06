import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="container" style={{ maxWidth: 560, minHeight: '100vh', display: 'grid', alignItems: 'center' }}>
      <div>
        <div className="card section" style={{ marginBottom: 16 }}>
          <div className="header-brand">
            <div className="logo-box">مت</div>
            <div>
              <h1 className="page-title" style={{ fontSize: 24 }}>تقارير الزيارات الميدانية</h1>
              <div className="muted">دخول آمن بالبريد الإلكتروني عبر Supabase Auth</div>
            </div>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
