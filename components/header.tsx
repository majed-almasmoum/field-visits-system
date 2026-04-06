import Link from 'next/link';

export function Header() {
  return (
    <div className="card topbar">
      <div className="header-brand">
        <div className="logo-box">مت</div>
        <div>
          <div className="badge">نظام مجاني قابل للنشر</div>
          <h1 className="page-title">تقارير الزيارات الميدانية</h1>
          <div className="muted">إدخال الزيارات، تقارير يومية، وتقارير حسب الفترة مع تصدير Excel</div>
        </div>
      </div>
      <div className="actions">
        <Link className="button secondary" href="/reports">التقارير</Link>
        <form action="/auth/callback/logout" method="post">
          <button className="button ghost" type="submit">تسجيل الخروج</button>
        </form>
      </div>
    </div>
  );
}
