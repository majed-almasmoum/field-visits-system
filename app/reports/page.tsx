'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type VisitRow = {
  id?: string;
  date?: string | null;
  visit_time?: string | null;
  mashaer?: string | null;
  marker?: string | null;
  center?: string | null;
  observer?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

const supabase = createClient();
const MASHAER_OPTIONS = ['منى', 'عرفات', 'مزدلفة'];

export default function ReportsPage() {
  const [form, setForm] = useState({
    date: '',
    mashaer: 'منى',
    marker: '',
    center: '',
    observer: '',
    status: 'جيد',
    notes: '',
  });

  const [rows, setRows] = useState<VisitRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRows, setLoadingRows] = useState(true);
  const [message, setMessage] = useState('');

  async function loadRows() {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setRows(data || []);
    }
    setLoadingRows(false);
  }

  useEffect(() => {
    loadRows();
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const total = rows.length;
    const todayVisits = rows.filter((r) => r.date === today).length;
    const excellent = rows.filter((r) => r.status === 'ممتاز').length;
    const good = rows.filter((r) => r.status === 'جيد').length;
    const bad = rows.filter((r) => r.status === 'سيئ').length;

    const mashaerCounts: Record<string, number> = {};
    rows.forEach((r) => {
      const key = r.mashaer || 'غير محدد';
      mashaerCounts[key] = (mashaerCounts[key] || 0) + 1;
    });

    const topMashaer =
      Object.entries(mashaerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

    const latestVisit = rows[0]
      ? `${rows[0].date || '-'} ${rows[0].visit_time || ''}`.trim()
      : '-';

    return { total, todayVisits, excellent, good, bad, topMashaer, latestVisit };
  }, [rows, today]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const now = new Date();
    const autoTime = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const payload = {
      date: form.date || today,
      visit_time: autoTime,
      mashaer: form.mashaer || null,
      marker: form.marker || null,
      center: form.center || null,
      observer: form.observer || null,
      status: form.status || null,
      notes: form.notes || null,
    };

    const { error } = await supabase.from('visits').insert([payload]);

    if (error) {
      setMessage('❌ ' + error.message);
    } else {
      setMessage(`✅ تم حفظ الزيارة بنجاح عند ${autoTime}`);
      setForm({
        date: '',
        mashaer: 'منى',
        marker: '',
        center: '',
        observer: '',
        status: 'جيد',
        notes: '',
      });
      await loadRows();
    }

    setLoading(false);
  }

  function exportExcel() {
    const rowsHtml = rows
      .map(
        (r) => `
          <tr>
            <td>${escapeHtml(r.date || '')}</td>
            <td>${escapeHtml(r.visit_time || '')}</td>
            <td>${escapeHtml(r.mashaer || '')}</td>
            <td>${escapeHtml(r.marker || '')}</td>
            <td>${escapeHtml(r.center || '')}</td>
            <td>${escapeHtml(r.observer || '')}</td>
            <td>${escapeHtml(r.status || '')}</td>
            <td>${escapeHtml(r.notes || '')}</td>
          </tr>
        `
      )
      .join('');

    const html = `
      <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <table border="1">
          <tr>
            <th>التاريخ</th>
            <th>الوقت</th>
            <th>المشعر</th>
            <th>رقم الشاخص</th>
            <th>رقم مركز الضيافة</th>
            <th>اسم المراقب</th>
            <th>الحالة</th>
            <th>الملاحظات</th>
          </tr>
          ${rowsHtml}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visits-report.xls';
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadVisitPdf(row: VisitRow) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;

    const html = `
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>تقرير زيارة</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111827; direction: rtl; }
          .card { border: 1px solid #d1d5db; border-radius: 16px; padding: 24px; }
          h1 { margin: 0 0 10px; font-size: 28px; }
          p { color: #6b7280; margin: 0 0 24px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
          .item { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; }
          .label { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
          .value { font-size: 18px; font-weight: 700; color: #111827; word-break: break-word; }
          .notes { margin-top: 10px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; line-height: 1.9; white-space: pre-wrap; }
          .footer { margin-top: 24px; font-size: 12px; color: #6b7280; }
          @media print { .print-btn { display: none; } body { padding: 0; } }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()" style="margin-bottom:20px;padding:10px 16px;border:none;border-radius:10px;background:#1d4ed8;color:#fff;cursor:pointer;">تنزيل / طباعة PDF</button>
        <div class="card">
          <h1>تقرير زيارة ميدانية</h1>
          <p>تقرير فردي قابل للطباعة أو الحفظ بصيغة PDF</p>
          <div class="grid">
            <div class="item"><div class="label">التاريخ</div><div class="value">${escapeHtml(row.date || '-')}</div></div>
            <div class="item"><div class="label">الوقت</div><div class="value">${escapeHtml(row.visit_time || '-')}</div></div>
            <div class="item"><div class="label">المشعر</div><div class="value">${escapeHtml(row.mashaer || '-')}</div></div>
            <div class="item"><div class="label">رقم الشاخص</div><div class="value">${escapeHtml(row.marker || '-')}</div></div>
            <div class="item"><div class="label">رقم مركز الضيافة</div><div class="value">${escapeHtml(row.center || '-')}</div></div>
            <div class="item"><div class="label">اسم المراقب</div><div class="value">${escapeHtml(row.observer || '-')}</div></div>
            <div class="item"><div class="label">الحالة</div><div class="value">${escapeHtml(row.status || '-')}</div></div>
            <div class="item"><div class="label">وقت الإدخال</div><div class="value">${escapeHtml(row.created_at || '-')}</div></div>
          </div>
          <div class="item">
            <div class="label">الملاحظات</div>
            <div class="notes">${escapeHtml(row.notes || '-')}</div>
          </div>
          <div class="footer">تم إنشاء هذا التقرير من نظام تقارير الزيارات الميدانية.</div>
        </div>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="page">
      <style>{`
        * { box-sizing: border-box; }
        .page {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          padding: 20px;
          direction: rtl;
          font-family: Arial, sans-serif;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .hero {
          background: linear-gradient(135deg, #0f3d74 0%, #1d4f91 65%, #2563eb 100%);
          color: #fff;
          border-radius: 24px;
          padding: 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 16px 40px rgba(37,99,235,0.20);
          margin-bottom: 18px;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 13px;
          margin-bottom: 12px;
        }
        .hero h1 { margin: 0; font-size: 38px; font-weight: 800; }
        .hero p { margin: 10px 0 0; font-size: 17px; line-height: 1.8; opacity: 0.95; }
        .hero-icon {
          width: 84px; height: 84px; border-radius: 20px; background: rgba(255,255,255,0.14);
          display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }
        .stat-card, .card {
          background: #fff;
          border-radius: 22px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 24px rgba(15,23,42,0.06);
        }
        .stat-title { color: #64748b; font-size: 14px; margin-bottom: 8px; }
        .stat-value { color: #111827; font-size: 34px; font-weight: 800; }
        .stat-value.small { font-size: 20px; line-height: 1.5; }
        .content {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 18px;
          align-items: start;
          margin-bottom: 18px;
        }
        .section-title { margin: 0; font-size: 26px; font-weight: 800; color: #0f172a; }
        .section-text { margin: 8px 0 0; font-size: 15px; color: #64748b; line-height: 1.7; }
        .field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .field { margin-bottom: 14px; }
        .field label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-weight: 700;
          font-size: 14px;
        }
        .input, .textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          background: #fff;
        }
        .input { height: 48px; padding: 0 12px; }
        .textarea { min-height: 130px; padding: 12px; resize: vertical; }
        .primary-btn, .excel-btn, .pdf-btn, .pdf-mobile-btn {
          border: none;
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          font-weight: 800;
        }
        .primary-btn {
          width: 100%;
          background: #1d4ed8;
          padding: 14px;
          font-size: 16px;
          margin-top: 8px;
        }
        .excel-btn {
          width: 100%;
          margin-top: 16px;
          background: #059669;
          padding: 14px;
          font-size: 16px;
        }
        .pdf-btn, .pdf-mobile-btn {
          background: #7c3aed;
          padding: 8px 12px;
          font-size: 13px;
          white-space: nowrap;
        }
        .pdf-mobile-btn {
          display: none;
          width: 100%;
          margin-top: 10px;
          padding: 12px;
        }
        .message {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid;
          text-align: center;
        }
        .summary-list { display: grid; gap: 10px; }
        .summary-row {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .summary-label { color: #475569; font-size: 15px; }
        .summary-value { color: #111827; font-weight: 800; font-size: 18px; }
        .note-box {
          margin-top: 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 14px;
          padding: 14px;
          color: #1e3a8a;
          line-height: 1.8;
          font-size: 14px;
        }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th {
          text-align: right;
          padding: 14px;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
          color: #475569;
          font-size: 14px;
          white-space: nowrap;
        }
        td {
          text-align: right;
          padding: 14px;
          border-bottom: 1px solid #eef2f7;
          color: #111827;
          font-size: 14px;
          white-space: nowrap;
          vertical-align: top;
        }
        td.notes {
          white-space: normal;
          min-width: 280px;
          line-height: 1.7;
        }
        .status-pill {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
        }
        .empty { text-align: center; padding: 36px; color: #64748b; font-size: 16px; }
        .actions-cell { min-width: 110px; }

        @media (max-width: 900px) {
          .stats { grid-template-columns: 1fr 1fr; }
          .content { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .page { padding: 14px; }
          .hero { padding: 20px; border-radius: 18px; }
          .hero h1 { font-size: 28px; }
          .hero p { font-size: 14px; }
          .hero-icon {
            width: 60px; height: 60px; font-size: 28px; border-radius: 16px;
          }
          .stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .stat-card, .card { padding: 16px; border-radius: 18px; }
          .stat-value { font-size: 28px; }
          .stat-value.small { font-size: 16px; }
          .section-title { font-size: 22px; }
          .field-grid { grid-template-columns: 1fr; }
          th, td { padding: 10px; font-size: 13px; }
          .desktop-pdf { display: none; }
          .pdf-mobile-btn { display: block; }
          .notes .mobile-inline-pdf { display: block; }
        }
      `}</style>

      <div className="container">
        <div className="hero">
          <div>
            <div className="badge">لوحة المتابعة</div>
            <h1>تقارير الزيارات الميدانية</h1>
            <p>سجّل الزيارات، راقب الحالة العامة، وصدّر السجلات إلى Excel من نفس الصفحة.</p>
          </div>
          <div className="hero-icon">📋</div>
        </div>

        <div className="stats">
          <StatCard title="إجمالي الزيارات" value={String(stats.total)} />
          <StatCard title="زيارات اليوم" value={String(stats.todayVisits)} />
          <StatCard title="أفضل مشعر" value={stats.topMashaer} />
          <StatCard title="آخر زيارة" value={stats.latestVisit} small />
        </div>

        <div className="content">
          <div className="card">
            <div style={{ marginBottom: 18 }}>
              <h2 className="section-title">إضافة زيارة جديدة</h2>
              <p className="section-text">الوقت يُسجل تلقائيًا وقت الحفظ.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="field-grid">
                <Field label="التاريخ">
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </Field>

                <Field label="المشعر">
                  <select
                    className="input"
                    value={form.mashaer}
                    onChange={(e) => setForm({ ...form, mashaer: e.target.value })}
                  >
                    {MASHAER_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </Field>

                <Field label="رقم الشاخص">
                  <input
                    className="input"
                    value={form.marker}
                    onChange={(e) => setForm({ ...form, marker: e.target.value })}
                    placeholder="مثال: 54-1\\533"
                  />
                </Field>

                <Field label="رقم مركز الضيافة">
                  <input
                    className="input"
                    value={form.center}
                    onChange={(e) => setForm({ ...form, center: e.target.value })}
                    placeholder="مثال: 151-152"
                  />
                </Field>

                <Field label="اسم المراقب">
                  <input
                    className="input"
                    value={form.observer}
                    onChange={(e) => setForm({ ...form, observer: e.target.value })}
                    placeholder="اسم المراقب"
                  />
                </Field>

                <Field label="الحالة">
                  <select
                    className="input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>ممتاز</option>
                    <option>جيد</option>
                    <option>سيئ</option>
                  </select>
                </Field>
              </div>

              <Field label="الملاحظات">
                <textarea
                  className="textarea"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="اكتب الملاحظات هنا"
                />
              </Field>

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ الزيارة'}
              </button>

              {message ? (
                <div
                  className="message"
                  style={{
                    background: message.includes('❌') ? '#fef2f2' : '#eff6ff',
                    color: message.includes('❌') ? '#b91c1c' : '#1d4ed8',
                    borderColor: message.includes('❌') ? '#fecaca' : '#bfdbfe',
                  }}
                >
                  {message}
                </div>
              ) : null}
            </form>
          </div>

          <div className="card">
            <div style={{ marginBottom: 18 }}>
              <h2 className="section-title">ملخص سريع</h2>
              <p className="section-text">قراءة سريعة لوضع السجلات الحالية.</p>
            </div>

            <div className="summary-list">
              <SummaryRow label="إجمالي السجلات" value={String(stats.total)} />
              <SummaryRow label="زيارات اليوم" value={String(stats.todayVisits)} />
              <SummaryRow label="ممتاز" value={String(stats.excellent)} />
              <SummaryRow label="جيد" value={String(stats.good)} />
              <SummaryRow label="سيئ" value={String(stats.bad)} />
            </div>

            <button className="excel-btn" type="button" onClick={exportExcel}>
              تصدير Excel
            </button>

            <div className="note-box">
              الوقت يُحفظ تلقائيًا عند كل زيارة، ولكل سجل زر PDF مستقل.
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ marginBottom: 18 }}>
            <h2 className="section-title">آخر الزيارات</h2>
            <p className="section-text">عرض مباشر لآخر البيانات المحفوظة.</p>
          </div>

          {loadingRows ? (
            <div className="empty">جاري تحميل البيانات...</div>
          ) : rows.length === 0 ? (
            <div className="empty">لا توجد بيانات حتى الآن.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <Th>التاريخ</Th>
                    <Th>الوقت</Th>
                    <Th>المشعر</Th>
                    <Th>الشاخص</Th>
                    <Th>الضيافة</Th>
                    <Th>المراقب</Th>
                    <Th>الحالة</Th>
                    <Th>الملاحظات</Th>
                    <Th className="desktop-pdf">PDF</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <Td>{r.date || '-'}</Td>
                      <Td>{r.visit_time || '-'}</Td>
                      <Td>{r.mashaer || '-'}</Td>
                      <Td>{r.marker || '-'}</Td>
                      <Td>{r.center || '-'}</Td>
                      <Td>{r.observer || '-'}</Td>
                      <Td>
                        <span
                          className="status-pill"
                          style={{
                            background:
                              r.status === 'ممتاز'
                                ? '#dcfce7'
                                : r.status === 'سيئ'
                                ? '#fee2e2'
                                : '#dbeafe',
                            color:
                              r.status === 'ممتاز'
                                ? '#166534'
                                : r.status === 'سيئ'
                                ? '#991b1b'
                                : '#1d4ed8',
                          }}
                        >
                          {r.status || '-'}
                        </span>
                      </Td>
                      <Td notes>
                        <div>{r.notes || '-'}</div>
                        <button
                          className="pdf-mobile-btn mobile-inline-pdf"
                          type="button"
                          onClick={() => downloadVisitPdf(r)}
                        >
                          تنزيل PDF
                        </button>
                      </Td>
                      <Td className="actions-cell desktop-pdf">
                        <button className="pdf-btn" type="button" onClick={() => downloadVisitPdf(r)}>
                          تنزيل PDF
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ title, value, small = false }: { title: string; value: string; small?: boolean }) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className={`stat-value${small ? ' small' : ''}`}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={className}>{children}</th>;
}

function Td({
  children,
  notes = false,
  className = '',
}: {
  children: React.ReactNode;
  notes?: boolean;
  className?: string;
}) {
  return <td className={`${notes ? 'notes' : ''} ${className}`.trim()}>{children}</td>;
}
