'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

const supabase = createClient();

export default function ReportsPage() {
  const [form, setForm] = useState({
    date: '',
    mashaer: '',
    status: 'جيد',
    notes: '',
  });

  const [data, setData] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function load() {
    const { data } = await supabase.from('visits').select('*').order('created_at', { ascending: false });
    setData(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();
    setMsg('');

    const { error } = await supabase.from('visits').insert([form]);

    if (error) {
      setMsg('❌ ' + error.message);
    } else {
      setMsg('✅ تم الحفظ');
      setForm({ date: '', mashaer: '', status: 'جيد', notes: '' });
      load();
    }
  }

  return (
    <div style={{ padding: '40px', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <h1>تقارير الزيارات</h1>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />

        <input
          placeholder="المشعر"
          value={form.mashaer}
          onChange={(e) => setForm({ ...form, mashaer: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />

        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        >
          <option>ممتاز</option>
          <option>جيد</option>
          <option>سيئ</option>
        </select>

        <textarea
          placeholder="ملاحظات"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          style={{ display: 'block', marginBottom: '10px' }}
        />

        <button type="submit">حفظ</button>
      </form>

      {msg && <p>{msg}</p>}

      {/* TABLE */}
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>التاريخ</th>
            <th>المشعر</th>
            <th>الحالة</th>
            <th>الملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.date}</td>
              <td>{row.mashaer}</td>
              <td>{row.status}</td>
              <td>{row.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
