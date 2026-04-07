'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type VisitRow = {
  id?: string;
  date?: string | null;
  mashaer?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
};

const supabase = createClient();

export default function ReportsPage() {
  const [form, setForm] = useState({
    date: '',
    mashaer: '',
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
        mashaer: '',
        status: 'جيد',
        notes: '',
      });
      await loadRows();
    }

    setLoading(false);
  }

  return (
    <div style={page}>
      <div style={container}>
        <div style={heroCard}>
          <div>
            <div style={badge}>لوحة المتابعة</div>
            <h1 style={heroTitle}>تقارير الزيارات الميدانية</h1>
            <p style={heroText}>
              سجّل الزيارات بسرعة، راقب الحالات، وتابع آخر البيانات بشكل مرتب وواضح.
            </p>
          </div>
          <div style={heroIconBox}>📋</div>
        </div>

        <div style={statsGrid}>
          <StatCard title="إجمالي الزيارات" value={String(stats.total)} />
          <StatCard title="ممتاز" value={String(stats.excellent)} />
          <StatCard title="جيد" value={String(stats.good)} />
          <StatCard title="سيئ" value={String(stats.bad)} />
        </div>

        <div style={mainGrid}>
          <div style={formCard}>
            <div style={sectionHeader}>
              <h2 style={sectionTitle}>إضافة زيارة جديدة</h2>
              <p style={sectionText}>أدخل بيانات الزيارة وسيتم حفظها مباشرة في النظام.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={fieldBlock}>
                <label style={label}>التاريخ</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={input}
                />
              </div>

              <div style={fieldBlock}>
                <label style={label}>المشعر</label>
                <input
                  value={form.mashaer}
                  onChange={(e) => setForm({ ...form, mashaer: e.target.value })}
                  placeholder="مثال: منى / عرفات / مزدلفة"
                  style={input}
                />
              </div>

              <div style={fieldBlock}>
                <label style={label}>الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={input}
                >
                  <option>ممتاز</option>
                  <option>جيد</option>
                  <option>سيئ</option>
                </select>
              </div>

              <div style={fieldBlock}>
                <label style={label}>الملاحظات</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="اكتب ملاحظات الزيارة هنا"
                  style={textarea}
                />
              </div>

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
              <p style={sectionText}>لمحة فورية عن حالة السجلات الحالية.</p>
            </div>

            <div style={summaryList}>
              <SummaryRow label="إجمالي السجلات" value={String(stats.total)} />
              <SummaryRow label="حالة ممتاز" value={String(stats.excellent)} />
              <SummaryRow label="حالة جيد" value={String(stats.good)} />
              <SummaryRow label="حالة سيئ" value={String(stats.bad)} />
            </div>

            <div style={tipBox}>
              <div style={tipTitle}>ملاحظة</div>
              <div style={tipText}>
                يفضّل كتابة ملاحظات مختصرة وواضحة لتسهيل الرجوع للتقارير لاحقًا.
              </div>
            </div>
          </div>
        </div>

        <div style={tableCard}>
          <div style={sectionHeader}>
            <h2 style={sectionTitle}>آخر الزيارات</h2>
            <p style={sectionText}>عرض مباشر لآخر السجلات المحفوظة في قاعدة البيانات.</p>
          </div>

          {loadingRows ? (
            <div style={emptyState}>جاري تحميل البيانات...</div>
          ) : rows.length === 0 ? (
            <div style={emptyState}>لا توجد زيارات محفوظة حتى الآن.</div>
          ) : (
            <div style={tableWrap}>
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>التاريخ</th>
                    <th style={th}>المشعر</th>
                    <th style={th}>الحالة</th>
                    <th style={th}>الملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id || index} style={index % 2 === 0 ? rowEven : rowOdd}>
                      <td style={td}>{row.date || '-'}</td>
                      <td style={td}>{row.mashaer || '-'}</td>
                      <td style={td}>
                        <span
                          style={{
                            ...statusPill,
                            background:
                              row.status === 'ممتاز'
                                ? '#dcfce7'
                                : row.status === 'سيئ'
                                ? '#fee2e2'
                                : '#dbeafe',
                            color:
                              row.status === 'ممتاز'
                                ? '#166534'
                                : row.status === 'سيئ'
                                ? '#991b1b'
                                : '#1d4ed8',
                          }}
                        >
                          {row.status || '-'}
                        </span>
                      </td>
                      <td style={tdNotes}>{row.notes || '-'}</td>
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

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
  padding: '32px 20px',
  direction: 'rtl',
  fontFamily: 'Arial, sans-serif',
  color: '#0f172a',
};

const container: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const heroCard: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0f3d74 0%, #1d4f91 60%, #2b6cb0 100%)',
  borderRadius: '24px',
  padding: '28px',
  color: '#fff',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  boxShadow: '0 20px 50px rgba(29,79,145,0.25)',
  marginBottom: '18px',
};

const badge: React.CSSProperties = {
  display: 'inline-block',
  background: 'rgba(255,255,255,0.16)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '999px',
  padding: '6px 12px',
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
  fontSize: '18px',
  opacity: 0.95,
  lineHeight: 1.7,
};

const heroIconBox: React.CSSProperties = {
  width: '88px',
  height: '88px',
  borderRadius: '22px',
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
  boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
  border: '1px solid #e5e7eb',
};

const statTitle: React.CSSProperties = {
  color: '#64748b',
  fontSize: '15px',
  marginBottom: '10px',
};

const statValue: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 800,
  color: '#111827',
};

const mainGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.4fr 0.9fr',
  gap: '18px',
  marginBottom: '18px',
};

const formCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
  border: '1px solid #e5e7eb',
};

const sideCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
  border: '1px solid #e5e7eb',
};

const tableCard: React.CSSProperties = {
  background: '#fff',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
  border: '1px solid #e5e7eb',
};

const sectionHeader: React.CSSProperties = {
  marginBottom: '18px',
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '28px',
  fontWeight: 800,
  color: '#111827',
};

const sectionText: React.CSSProperties = {
  margin: '8px 0 0',
  color: '#6b7280',
  fontSize: '15px',
  lineHeight: 1.7,
};

const fieldBlock: React.CSSProperties = {
  marginBottom: '14px',
};

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#334155',
};

const input: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  height: '48px',
  borderRadius: '14px',
  border: '1px solid #d1d5db',
  padding: '0 14px',
  fontSize: '15px',
  background: '#fff',
  outline: 'none',
};

const textarea: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: '140px',
  borderRadius: '14px',
  border: '1px solid #d1d5db',
  padding: '14px',
  fontSize: '15px',
  background: '#fff',
  outline: 'none',
  resize: 'vertical',
};

const primaryButton: React.CSSProperties = {
  width: '100%',
  height: '50px',
  borderRadius: '14px',
  border: 'none',
  background: 'linear-gradient(135deg, #1d4f91, #2563eb)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 800,
  cursor: 'pointer',
  marginTop: '8px',
  boxShadow: '0 10px 24px rgba(37,99,235,0.25)',
};

const messageBox: React.CSSProperties = {
  marginTop: '14px',
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid',
  textAlign: 'center',
  fontSize: '14px',
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
  alignItems: 'center',
  justifyContent: 'space-between',
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

const tipBox: React.CSSProperties = {
  marginTop: '16px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '16px',
  padding: '16px',
};

const tipTitle: React.CSSProperties = {
  fontWeight: 800,
  color: '#1d4ed8',
  marginBottom: '8px',
};

const tipText: React.CSSProperties = {
  color: '#1e3a8a',
  lineHeight: 1.8,
  fontSize: '14px',
};

const tableWrap: React.CSSProperties = {
  overflowX: 'auto',
};

const table: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  overflow: 'hidden',
};

const th: React.CSSProperties = {
  textAlign: 'right',
  padding: '14px',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '14px',
  borderBottom: '1px solid #e5e7eb',
  whiteSpace: 'nowrap',
};

const td: React.CSSProperties = {
  textAlign: 'right',
  padding: '14px',
  borderBottom: '1px solid #eef2f7',
  fontSize: '14px',
  color: '#111827',
  whiteSpace: 'nowrap',
};

const tdNotes: React.CSSProperties = {
  ...td,
  whiteSpace: 'normal',
  minWidth: '320px',
  lineHeight: 1.7,
};

const rowEven: React.CSSProperties = {
  background: '#ffffff',
};

const rowOdd: React.CSSProperties = {
  background: '#fcfdff',
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
  padding: '40px 20px',
  color: '#64748b',
  fontSize: '16px',
};
