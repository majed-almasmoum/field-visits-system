'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Tooltip, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase-browser';

type Visit = {
  id: string;
  visit_date: string;
  visit_time: string;
  mashaer: string;
  marker_no: string;
  hospitality_center_no: string;
  site_status: string;
  pilgrims_count: number | null;
  notes: string | null;
  observer_name: string;
  created_at: string;
};

const colors = ['#134b8a', '#caa85e', '#5f95d1', '#88b38a'];

export function ReportsClient() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [rows, setRows] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .gte('visit_date', from)
      .lte('visit_date', to)
      .order('visit_date', { ascending: false })
      .order('visit_time', { ascending: false });

    if (error) setError(error.message);
    else setRows((data as Visit[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const totals = useMemo(() => {
    const observations = rows.filter((r) => (r.notes || '').trim()).length;
    const pilgrims = rows.reduce((sum, r) => sum + (r.pilgrims_count || 0), 0);
    return { visits: rows.length, observations, pilgrims };
  }, [rows]);

  const byStatus = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.site_status, (map.get(r.site_status) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const byMashaer = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((r) => map.set(r.mashaer, (map.get(r.mashaer) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [rows]);

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((row) => ({
        التاريخ: row.visit_date,
        الوقت: row.visit_time,
        المشعر: row.mashaer,
        'رقم الشاخص': row.marker_no,
        'رقم مركز الضيافة': row.hospitality_center_no,
        'حالة الموقع': row.site_status,
        'عدد الحجاج': row.pilgrims_count ?? '',
        الملاحظات: row.notes ?? '',
        'اسم المراقب': row.observer_name,
        'تاريخ الإدخال': row.created_at,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Visits');
    XLSX.writeFile(workbook, `visits_${from}_to_${to}.xlsx`);
  };

  return (
    <div className="grid" style={{ gap: 20 }}>
      <div className="card section">
        <div className="actions" style={{ justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <h2 className="section-title">تقرير حسب الفترة</h2>
            <div className="muted">اختر التاريخ من وإلى ثم اعرض النتائج أو نزّلها Excel.</div>
          </div>
          <div className="actions">
            <button className="button secondary" onClick={exportExcel}>تحميل Excel</button>
            <button className="button" onClick={() => void load()}>{loading ? 'جارٍ التحميل...' : 'عرض التقرير'}</button>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginTop: 16 }}>
          <div className="field"><label className="label">من تاريخ</label><input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field"><label className="label">إلى تاريخ</label><input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          <div className="field"><label className="label">نوع التقرير</label><input className="input" value={from === to ? 'تقرير يومي' : 'تقرير فترة'} readOnly /></div>
        </div>

        {error ? <p className="notice error">{error}</p> : null}
      </div>

      <div className="stats">
        <div className="card stat"><span className="muted">عدد الزيارات</span><h3>{totals.visits}</h3></div>
        <div className="card stat"><span className="muted">السجلات التي فيها ملاحظات</span><h3>{totals.observations}</h3></div>
        <div className="card stat"><span className="muted">إجمالي عدد الحجاج</span><h3>{totals.pilgrims}</h3></div>
        <div className="card stat"><span className="muted">نوع التقرير</span><h3>{from === to ? 'يومي' : 'فترة'}</h3></div>
      </div>

      <div className="grid grid-2">
        <div className="card section">
          <h3 className="section-title">توزيع الحالات</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} label>
                  {byStatus.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card section">
          <h3 className="section-title">توزيع الزيارات حسب المشعر</h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={byMashaer}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="عدد الزيارات" fill="#134b8a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card section">
        <h3 className="section-title">النتائج التفصيلية</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>المشعر</th>
                <th>الشاخص</th>
                <th>مركز الضيافة</th>
                <th>الحالة</th>
                <th>الحجاج</th>
                <th>الملاحظات</th>
                <th>المراقب</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.visit_date}</td>
                  <td>{row.visit_time}</td>
                  <td>{row.mashaer}</td>
                  <td>{row.marker_no}</td>
                  <td>{row.hospitality_center_no}</td>
                  <td>{row.site_status}</td>
                  <td>{row.pilgrims_count ?? '-'}</td>
                  <td>{row.notes || '-'}</td>
                  <td>{row.observer_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!rows.length && !loading ? <p className="muted">لا توجد بيانات في الفترة المحددة.</p> : null}
      </div>
    </div>
  );
}
