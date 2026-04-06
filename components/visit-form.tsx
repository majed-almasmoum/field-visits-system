'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

const initialState = {
  visit_date: new Date().toISOString().slice(0, 10),
  visit_time: new Date().toTimeString().slice(0, 5),
  mashaer: '',
  marker_no: '',
  hospitality_center_no: '',
  site_status: 'جيد',
  pilgrims_count: '',
  notes: '',
  observer_name: '',
};

export function VisitForm({ userId }: { userId: string }) {
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const update = (key: keyof typeof initialState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      ...form,
      pilgrims_count: form.pilgrims_count ? Number(form.pilgrims_count) : null,
      created_by: userId,
    };

    const { error } = await supabase.from('visits').insert([payload]);

    if (error) {
      setError(error.message);
    } else {
      setMessage('تم حفظ الزيارة بنجاح.');
      setForm({ ...initialState, visit_date: form.visit_date, visit_time: form.visit_time, observer_name: form.observer_name });
    }

    setSaving(false);
  };

  return (
    <form className="card section watermark" onSubmit={handleSubmit}>
      <div className="actions" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="section-title">إدخال زيارة جديدة</h2>
          <div className="muted">املأ الحقول ثم اضغط حفظ.</div>
        </div>
        <span className="badge">المستخدم الحالي محمي بتسجيل الدخول</span>
      </div>

      <div className="grid grid-3" style={{ marginTop: 18 }}>
        <div className="field"><label className="label">التاريخ</label><input className="input" type="date" value={form.visit_date} onChange={(e) => update('visit_date', e.target.value)} required /></div>
        <div className="field"><label className="label">وقت الزيارة</label><input className="input" type="time" value={form.visit_time} onChange={(e) => update('visit_time', e.target.value)} required /></div>
        <div className="field"><label className="label">المشعر</label><select className="select" value={form.mashaer} onChange={(e) => update('mashaer', e.target.value)} required><option value="">اختر</option><option>منى</option><option>مزدلفة</option><option>عرفات</option></select></div>
        <div className="field"><label className="label">رقم الشاخص</label><input className="input" value={form.marker_no} onChange={(e) => update('marker_no', e.target.value)} required /></div>
        <div className="field"><label className="label">رقم مركز الضيافة</label><input className="input" value={form.hospitality_center_no} onChange={(e) => update('hospitality_center_no', e.target.value)} required /></div>
        <div className="field"><label className="label">حالة الموقع</label><select className="select" value={form.site_status} onChange={(e) => update('site_status', e.target.value)}><option>ممتاز</option><option>جيد</option><option>يحتاج تحسين</option><option>سيء</option></select></div>
        <div className="field"><label className="label">عدد الحجاج التقريبي</label><input className="input" type="number" min="0" value={form.pilgrims_count} onChange={(e) => update('pilgrims_count', e.target.value)} /></div>
        <div className="field"><label className="label">اسم المراقب</label><input className="input" value={form.observer_name} onChange={(e) => update('observer_name', e.target.value)} required /></div>
      </div>

      <div className="field" style={{ marginTop: 16 }}>
        <label className="label">الملاحظات</label>
        <textarea className="textarea" value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="اكتب الملاحظات هنا" />
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button className="button" disabled={saving} type="submit">{saving ? 'جارٍ الحفظ...' : 'حفظ الزيارة'}</button>
      </div>

      {message ? <p className="notice success">{message}</p> : null}
      {error ? <p className="notice error">{error}</p> : null}
    </form>
  );
}
