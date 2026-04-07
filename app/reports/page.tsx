'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type VisitRow = {
  id?: string;
  date?: string | null;
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

  const stats = useMemo(() => {
    return {
      total: rows.length,
      excellent: rows.filter((r) => r.status === 'ممتاز').length,
      good: rows.filter((r) => r.status === 'جيد').length,
      bad: rows.filter((r) => r.status === 'سيئ').length,
    };
  }, [rows]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      date: form.date || null,
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
      setMessage('✅ تم حفظ الزيارة بنجاح');
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
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <tr>
            <th>التاريخ</th>
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

  return (
    <div style={page}>
      <div style={container}>
        <div style={heroCard}>
          <div>
            <div style={badge}>لوحة المتابعة</div>
            <h1 style={heroTitle}>تقارير الزيارات الميدانية</h1>
            <p style={heroText}>
              سجّل الزيارات، راقب الحالة العامة، وصدّر السجلات إلى Excel من نفس الصفحة.
            </p>
          </div>
          <div style={heroIcon}>📋</div>
        </div>

        <div style={statsGrid}>
          <StatCard title="إجمالي الزيارات" value={String(stats.total)} />
          <StatCard title="ممتاز" value={String(stats.excellent)} />
          <StatCard title="جيد" value={String(stats.good)} />
          <StatCard title="سيئ" value={String(stats.bad)} />
        </div>

        <div style={contentGrid}>
          <div style={formCard}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>إضافة زيارة جديدة</h2>
              <p style={sectionText}>املأ الحقول التالية ثم اضغط حفظ.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={fieldGrid}>
                <Field label="التاريخ">
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    style={input}
                  />
                </Field>

                <Field label="المشعر">
                  <select
                    value={form.mashaer}
                    onChange={(e) => setForm({ ...form, mashaer: e.target.value })}
                    style={input}
                  >
                    {MASHAER_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="رقم الشاخص">
                  <input
                    value={form.marker}
                    onChange={(e) => setForm({ ...form, marker: e.target.value })}
                    placeholder="مثال: 54-1\\533"
                    style={input}
                  />
                </Field>

                <Field label="رقم مركز الضيافة">
                  <input
                    value={form.center}
                    onChange={(e) => setForm({ ...form, center: e.target.value })}
                    placeholder="مثال: 151-152"
                    style={input}
                  />
                </Field>

                <Field label="اسم المراقب">
                  <input
                    value={form.observer}
                    onChange={(e) => setForm({ ...form, observer: e.target.value })}
                    placeholder="اسم المراقب"
                    style={input}
                  />
                </Field>

                <Field label="الحالة">
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={input}
                  >
                    <option>ممتاز</option>
                    <option>جيد</option>
                    <option>سيئ</option>
                  </select>
                </Field>
              </div>

              <Field label="الملاحظات">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="اكتب الملاحظات هنا"
                  style={textarea}
                />
              </Field>

              <button type="submit" disabled={loading} style={primaryButton}>
                {loading ? 'جاري الحفظ...' : 'حفظ الزيارة'}
              </button>

              {message ? (
                <div
                  style={{
                    ...messageBox,
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

          <div style={sideCard}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>ملخص سريع</h2>
              <p style={sectionText}>قراءة سريعة لوضع السجلات الحالية.</p>
            </div>

            <div style={summaryList}>
              <SummaryRow label="إجمالي السجلات" value={String(stats.total)} />
              <SummaryRow label="ممتاز" value={String(stats.excellent)} />
              <SummaryRow label="جيد" value={String(stats.good)} />
              <SummaryRow label="سيئ" value={String(stats.bad)} />
            </div>

            <button type="button" onClick={exportExcel} style={excelButton}>
              تصدير Excel
            </button>

            <div style={noteBox}>
              يفضل إدخال رقم الشاخص والضيافة بشكل ثابت لتسهيل التصفية والمراجعة لاحقًا.
            </div>
          </div>
        </div>

        <div style={tableCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>آخر الزيارات</h2>
            <p style={sectionText}>عرض مباشر لآخر البيانات المحفوظة.</p>
          </div>

          {loadingRows ? (
            <div style={emptyState}>جاري تحميل البيانات...</div>
          ) : rows.length === 0 ? (
            <div style={emptyState}>لا توجد بيانات حتى الآن.</div>
          ) : (
            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <Th>التاريخ</Th>
                    <Th>المشعر</Th>
                    <Th>الشاخص</Th>
                    <Th>الضيافة</Th>
                    <Th>المراقب</Th>
                    <Th>الحالة</Th>
                    <Th>الملاحظات</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={r.id || i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <Td>{r.date || '-'}</Td>
                      <Td>{r.mashaer || '-'}</Td>
                      <Td>{r.marker || '-'}</Td>
                      <Td>{r.center || '-'}</Td>
                      <Td>{r.observer || '-'}</Td>
                      <Td>
                        <span
                          style={{
                            ...statusPill,
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
                      <Td notes>{r.notes || '-'}</Td>
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
    <div style={{ marginBottom: '14px' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div style={statCard}>
      <div style={statTitle}>{title}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={summaryRow}>
      <span style={summaryLabel}>{label}</span>
      <span style={summaryValue}>{value}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th style={th}>{children}</th>;
}

function Td({ children, notes = false }: { children: React.ReactNode; notes?: boolean }) {
  return <td style={notes ? tdNotes : td}>{children}</td>;
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
  padding: '32px 20px',
  direction: 'rtl',
  fontFamily: 'Arial, sans-serif',
};

const container: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const heroCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0f3d74 0%, #1d4f91 65%, #2563eb 100%)',
  color: '#fff',
  borderRadius: '24px',
  padding: '28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  boxShadow: '0 16px 40px rgba(37,99,235,0.20)',
  marginBottom: '18px',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.2)',
  fontSize: '13px',
  marginBottom: '12px',
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '38px',
  fontWeight: 800,
};

const heroText: React.CSSProperties = {
  margin: '10px 0 0',
  fontSize: '17px',
  lineHeight: 1.8,
  opacity: 0.95,
};

const heroIcon: React.CSSProperties = {
  width: '84px',
  height: '84px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.14)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '36px',
  flexShrink: 0,
};

const statsGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '14px',
  marginBottom: '18px',
};

const statCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '20px',
  padding: '20px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
};

const statTitle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '14px',
  marginBottom: '8px',
};

const statValue: React.CSSProperties = {
  color: '#111827',
  fontSize: '34px',
  fontWeight: 800,
};

const contentGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '18px',
  alignItems: 'start',
  marginBottom: '18px',
};

const formCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '22px',
  padding: '24px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
};

const sideCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '22px',
  padding: '24px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
};

const tableCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '22px',
  padding: '24px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
};

const sectionHeader: React.CSSProperties = {
  marginBottom: '18px',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '26px',
  fontWeight: 800,
  color: '#0f172a',
};

const sectionText: React.CSSProperties = {
  margin: '8px 0 0',
  fontSize: '15px',
  color: '#64748b',
  lineHeight: 1.7,
};

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  color: '#334155',
  fontWeight: 700,
  fontSize: '14px',
};

const input: React.CSSProperties = {
  width: '100%',
  height: '48px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  padding: '0 12px',
  fontSize: '14px',
  boxSizing: 'border-box',
  background: '#fff',
};

const textarea: React.CSSProperties = {
  width: '100%',
  minHeight: '130px',
  borderRadius: '12px',
  border: '1px solid #d1d5db',
  padding: '12px',
  fontSize: '14px',
  boxSizing: 'border-box',
  resize: 'vertical',
  background: '#fff',
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: '12px',
  background: '#1d4ed8',
  color: '#fff',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 800,
  cursor: 'pointer',
  marginTop: '8px',
};

const messageBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid',
  textAlign: 'center',
};

const summaryList: React.CSSProperties = {
  display: 'grid',
  gap: '10px',
};

const summaryRow: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '14px',
  padding: '14px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const summaryLabel: React.CSSProperties = {
  color: '#475569',
  fontSize: '15px',
};

const summaryValue: React.CSSProperties = {
  color: '#111827',
  fontWeight: 800,
  fontSize: '18px',
};

const excelButton: React.CSSProperties = {
  width: '100%',
  marginTop: '16px',
  border: 'none',
  borderRadius: '12px',
  background: '#059669',
  color: '#fff',
  padding: '14px',
  fontSize: '16px',
  fontWeight: 800,
  cursor: 'pointer',
};

const noteBox: React.CSSProperties = {
  marginTop: '16px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '14px',
  padding: '14px',
  color: '#1e3a8a',
  lineHeight: 1.8,
  fontSize: '14px',
};

const tableWrap: React.CSSProperties = {
  overflowX: 'auto',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const th: React.CSSProperties = {
  textAlign: 'right',
  padding: '14px',
  borderBottom: '1px solid #e5e7eb',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  textAlign: 'right',
  padding: '14px',
  borderBottom: '1px solid #eef2f7',
  color: '#111827',
  fontSize: '14px',
  whiteSpace: 'nowrap',
};

const tdNotes: React.CSSProperties = {
  ...td,
  whiteSpace: 'normal',
  minWidth: '280px',
  lineHeight: 1.7,
};

const statusPill: React.CSSProperties = {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: '999px',
  fontSize: '13px',
  fontWeight: 700,
};

const emptyState: React.CSSProperties = {
  textAlign: 'center',
  padding: '36px',
  color: '#64748b',
  fontSize: '16px',
};
