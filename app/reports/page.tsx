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

  async function loadRows() {
    const { data } = await supabase
      .from('visits')
      .select('*')
      .order('created_at', { ascending: false });

    setRows(data || []);
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await supabase.from('visits').insert([
      {
        date: form.date,
        mashaer: form.mashaer,
        marker: form.marker,
        center: form.center,
        observer: form.observer,
        status: form.status,
        notes: form.notes,
      },
    ]);

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
    setLoading(false);
  }

  function exportExcel() {
    const rowsHtml = rows
      .map(
        (r) => `
      <tr>
        <td>${r.date || ''}</td>
        <td>${r.mashaer || ''}</td>
        <td>${r.marker || ''}</td>
        <td>${r.center || ''}</td>
        <td>${r.observer || ''}</td>
        <td>${r.status || ''}</td>
        <td>${r.notes || ''}</td>
      </tr>`
      )
      .join('');

    const html = `
    <table border="1">
      <tr>
        <th>التاريخ</th>
        <th>المشعر</th>
        <th>الشاخص</th>
        <th>الضيافة</th>
        <th>المراقب</th>
        <th>الحالة</th>
        <th>الملاحظات</th>
      </tr>
      ${rowsHtml}
    </table>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'visits.xls';
    a.click();
  }

  return (
    <div style={{ padding: 20, direction: 'rtl' }}>
      <h1>تقارير الزيارات</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        
        <select value={form.mashaer} onChange={(e) => setForm({ ...form, mashaer: e.target.value })}>
          {MASHAER_OPTIONS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <input placeholder="الشاخص" value={form.marker} onChange={(e) => setForm({ ...form, marker: e.target.value })} />
        <input placeholder="الضيافة" value={form.center} onChange={(e) => setForm({ ...form, center: e.target.value })} />
        <input placeholder="اسم المراقب" value={form.observer} onChange={(e) => setForm({ ...form, observer: e.target.value })} />

        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option>ممتاز</option>
          <option>جيد</option>
          <option>سيئ</option>
        </select>

        <input placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <button type="submit">{loading ? '...' : 'حفظ'}</button>
      </form>

      <button onClick={exportExcel}>📥 تصدير Excel</button>

      <table border={1} style={{ marginTop: 20, width: '100%' }}>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>المشعر</th>
            <th>الشاخص</th>
            <th>الضيافة</th>
            <th>المراقب</th>
            <th>الحالة</th>
            <th>الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.date}</td>
              <td>{r.mashaer}</td>
              <td>{r.marker}</td>
              <td>{r.center}</td>
              <td>{r.observer}</td>
              <td>{r.status}</td>
              <td>{r.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
