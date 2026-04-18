'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

const supabase = createClient();

const LOCATIONS = ['مكة المكرمة', 'المدينة المنورة', 'عرفات', 'منى', 'مزدلفة'];

const SUPERVISORS_BY_LOCATION: Record<string, { name: string; period: string }[]> = {
  'مكة المكرمة': [
    { name: 'يوسف الهذلي', period: 'الأولى' },
    { name: 'فايز الشريف', period: 'الثانية' },
    { name: 'خالد عليوة', period: 'الثالثة' },
  ],
  'المدينة المنورة': [
    { name: 'وراد سمان', period: 'الأولى' },
    { name: 'عبد المجيد الصخيري', period: 'الثانية' },
  ],
  'عرفات': [{ name: 'رامي الغامدي', period: 'المشاعر' }],
  'منى': [{ name: 'رامي الغامدي', period: 'المشاعر' }],
  'مزدلفة': [{ name: 'رامي الغامدي', period: 'المشاعر' }],
};

const ALL_CENTERS = [
  'مركز ضيافة مصر رقم 101',
  'مركز ضيافة مصر رقم 102',
  'مركز ضيافة مصر رقم 103',
  'مركز ضيافة مصر رقم 105',
  'مركز ضيافة مصر رقم 106',
  'مركز ضيافة مصر رقم 107',
  'مركز ضيافة مصر رقم 108',
  'مركز ضيافة مصر رقم 109',
  'مركز ضيافة مصر رقم 110',
  'مركز ضيافة مصر رقم 112',
  'مركز ضيافة مصر رقم 113',
  'مركز ضيافة مصر رقم 114',
  'مركز ضيافة مصر رقم 115',
  'مركز ضيافة مصر رقم 116',
  'مركز ضيافة مصر رقم 117',
  'مركز ضيافة مصر رقم 118',
  'مركز ضيافة مصر رقم 119',
  'مركز ضيافة مصر رقم 120',
  'مركز ضيافة مصر رقم 121',
  'مركز ضيافة مصر رقم 122',
  'مركز ضيافة مصر رقم 123',
  'مركز ضيافة مصر رقم 124',
  'مركز ضيافة مصر رقم 125',
  'مركز ضيافة مصر رقم 126',
  'مركز ضيافة مصر رقم 127',
  'مركز ضيافة مصر رقم 128',
  'مركز ضيافة مصر رقم 129',
  'مركز ضيافة مصر رقم 130',
  'مركز ضيافة مصر رقم 131',
  'مركز ضيافة مصر رقم 132',
  'مركز ضيافة مصر رقم 133',
  'مركز ضيافة مصر رقم 134',
  'مركز ضيافة مصر رقم 135',
  'مركز ضيافة مصر رقم 136',
  'مركز ضيافة مصر رقم 137',
  'مركز ضيافة مصر رقم 138',
  'مركز ضيافة باكستان رقم 140',
  'مركز ضيافة باكستان رقم 141',
  'مركز ضيافة باكستان رقم 142',
  'مركز ضيافة باكستان رقم 143',
  'مركز ضيافة باكستان رقم 144',
  'مركز ضيافة باكستان رقم 145',
  'مركز ضيافة باكستان رقم 146',
  'مركز ضيافة باكستان رقم 147',
  'مركز ضيافة باكستان رقم 148',
  'مركز ضيافة النيجر رقم 150',
  'مركز ضيافة النيجر رقم 151',
  'مركز ضيافة النيجر رقم 152',
  'مركز ضيافة النيجر رقم 153',
  'مركز ضيافة باكستان 1',
  'مركز ضيافة باكستان 2',
  'مركز ضيافة مصر',
  'مركز ضياقة النيجر',
];

const SECTION_OPTIONS = [
  'الجولات الميدانية',
  'الجولات الميدانية للمشاعر',
  'الاستقبال',
  'المغادرة',
];

type SectionRow = {
  center: string;
  answer: '' | 'نعم' | 'لا';
  notes: string;
  actions: string;
  result: string;
  modarStatus: '' | 'نعم' | 'لا';
};

type SectionBlock = {
  id: string;
  sectionName: string;
  rows: SectionRow[];
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeRows(centers: string[]): SectionRow[] {
  return centers.map((center) => ({
    center,
    answer: '',
    notes: '',
    actions: '',
    result: '',
    modarStatus: '',
  }));
}

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [reportDate, setReportDate] = useState(today);
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [period, setPeriod] = useState('');
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [selectAllCenters, setSelectAllCenters] = useState(false);
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  const supervisorOptions = useMemo(() => {
    return location ? SUPERVISORS_BY_LOCATION[location] || [] : [];
  }, [location]);

  const centerOptions = useMemo(() => {
    return ALL_CENTERS;
  }, [location]);

  function onChangeLocation(value: string) {
    setLocation(value);
    setSupervisor('');
    setPeriod('');
    setSelectedCenters([]);
    setSelectAllCenters(false);
    setSections([]);
  }

  function onChangeSupervisor(name: string) {
    setSupervisor(name);
    const found = supervisorOptions.find((s) => s.name === name);
    setPeriod(found?.period || '');
  }

  function toggleCenter(center: string) {
    const exists = selectedCenters.includes(center);
    const next = exists
      ? selectedCenters.filter((c) => c !== center)
      : [...selectedCenters, center];

    setSelectedCenters(next);
    setSelectAllCenters(next.length === centerOptions.length && centerOptions.length > 0);
    syncSectionsWithCenters(next);
  }

  function toggleAllCenters() {
    const next = selectAllCenters ? [] : [...centerOptions];
    setSelectedCenters(next);
    setSelectAllCenters(!selectAllCenters);
    syncSectionsWithCenters(next);
  }

  function syncSectionsWithCenters(nextCenters: string[]) {
    setSections((prev) =>
      prev.map((section) => {
        const map = new Map(section.rows.map((r) => [r.center, r]));
        return {
          ...section,
          rows: nextCenters.map(
            (center) =>
              map.get(center) || {
                center,
                answer: '',
                notes: '',
                actions: '',
                result: '',
                modarStatus: '',
              }
          ),
        };
      })
    );
  }

  function addSection() {
    if (selectedCenters.length === 0) {
      setMessage('❌ اختر مركز ضيافة واحد على الأقل قبل إضافة قسم');
      return;
    }
    setSections((prev) => [
      ...prev,
      {
        id: uid(),
        sectionName: '',
        rows: makeRows(selectedCenters),
      },
    ]);
    setMessage('');
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSectionName(id: string, value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, sectionName: value } : s))
    );
  }

  function updateRow(
    sectionId: string,
    center: string,
    patch: Partial<SectionRow>
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              rows: section.rows.map((row) =>
                row.center !== center
                  ? row
                  : {
                      ...row,
                      ...patch,
                      ...(patch.answer === 'لا'
                        ? { notes: '', actions: '', result: '', modarStatus: '' }
                        : {}),
                    }
              ),
            }
      )
    );
  }

  async function getNextReportId() {
    const { data } = await supabase
      .from('daily_report_items')
      .select('report_id')
      .order('report_id', { ascending: false })
      .limit(1);

    const last = data?.[0]?.report_id;
    return typeof last === 'number' ? last + 1 : 1000;
  }

  function validateBeforeSave() {
    if (!location || !supervisor || !period || !reportDate) {
      return 'أكمل البيانات الأساسية';
    }
    if (selectedCenters.length === 0) {
      return 'اختر مركز ضيافة واحد على الأقل';
    }
    if (sections.length === 0) {
      return 'أضف قسمًا واحدًا على الأقل';
    }

    for (const section of sections) {
      if (!section.sectionName) {
        return 'اختر اسم القسم لكل قسم مضاف';
      }

      for (const row of section.rows) {
        if (!row.answer) {
          return `حدد نعم أو لا للمركز: ${row.center}`;
        }
        if (row.answer === 'نعم') {
          if (!row.notes.trim() || !row.actions.trim() || !row.result.trim()) {
            return `أكمل الملاحظات والإجراءات والنتيجة للمركز: ${row.center}`;
          }
          if (!row.modarStatus) {
            return `حدد حالة المحضر في منصة مدار للمركز: ${row.center}`;
          }
        }
      }
    }

    return '';
  }

  async function handleSave() {
    setMessage('');
    const validationError = validateBeforeSave();
    if (validationError) {
      setMessage(`❌ ${validationError}`);
      return;
    }

    setSaving(true);
    try {
      const reportId = await getNextReportId();

      const payload = sections.flatMap((section) =>
        section.rows.map((row) => ({
          report_id: reportId,
          report_date: reportDate,
          supervisor_name: supervisor,
          period,
          assessment_location: location,
          hospitality_center: row.center,
          section_name: section.sectionName,
          answer: row.answer,
          notes: row.answer === 'نعم' ? row.notes.trim() : null,
          actions: row.answer === 'نعم' ? row.actions.trim() : null,
          result: row.answer === 'نعم' ? row.result.trim() : null,
          modar_status: row.answer === 'نعم' ? row.modarStatus : null,
        }))
      );

      const { error } = await supabase.from('daily_report_items').insert(payload);
      if (error) throw error;

      setMessage(`✅ تم حفظ التقرير اليومي رقم ${reportId}`);
      setSelectedCenters([]);
      setSelectAllCenters(false);
      setSections([]);
    } catch (e: any) {
      setMessage(`❌ ${e.message || 'حدث خطأ أثناء الحفظ'}`);
    } finally {
      setSaving(false);
    }
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
        .container { max-width: 1280px; margin: 0 auto; }
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
        .hero-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .hero-logo, .hero-logo-fallback {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          background: rgba(255,255,255,0.12);
          object-fit: contain;
          padding: 8px;
        }
        .hero-logo-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #fff;
        }
        .hero h1 {
          margin: 0;
          font-size: 34px;
          font-weight: 800;
        }
        .hero p {
          margin: 8px 0 0;
          opacity: 0.95;
          line-height: 1.8;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.2);
          font-size: 13px;
          margin-bottom: 10px;
        }
        .hero-icon {
          width: 84px;
          height: 84px;
          border-radius: 20px;
          background: rgba(255,255,255,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
        }
        .card {
          background: #fff;
          border-radius: 22px;
          padding: 20px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 10px 24px rgba(15,23,42,0.06);
          margin-bottom: 18px;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .field label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-weight: 700;
          font-size: 14px;
        }
        .input, .select, .textarea {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 14px;
          background: #fff;
          font-family: inherit;
        }
        .input, .select {
          height: 48px;
          padding: 0 12px;
        }
        .textarea {
          min-height: 90px;
          padding: 12px;
          resize: vertical;
        }
        .centers-box {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 14px;
          background: #f8fafc;
          margin-top: 14px;
        }
        .centers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 12px;
        }
        .center-item {
          background: #fff;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }
        .add-btn, .save-btn {
          border: none;
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          font-weight: 800;
          font-family: inherit;
        }
        .add-btn {
          background: #0f766e;
          padding: 12px 16px;
        }
        .save-btn {
          width: 100%;
          background: #1d4ed8;
          padding: 14px;
          font-size: 16px;
          margin-top: 10px;
        }
        .message {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid;
          text-align: center;
        }
        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }
        .remove-btn {
          border: none;
          background: #fee2e2;
          color: #991b1b;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
        }
        .table-wrap {
          overflow-x: auto;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }
        th, td {
          border-bottom: 1px solid #eef2f7;
          padding: 12px;
          text-align: right;
          vertical-align: top;
          font-size: 14px;
          white-space: nowrap;
        }
        th {
          background: #f8fafc;
          color: #475569;
          font-weight: 800;
        }
        .answer-box {
          display: flex;
          gap: 8px;
        }
        .pill-btn {
          border: 1px solid #d1d5db;
          background: #fff;
          color: #0f172a;
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          font-weight: 700;
          font-family: inherit;
        }
        .pill-btn.active-yes {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }
        .pill-btn.active-no {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #991b1b;
        }
        .subfields {
          display: grid;
          gap: 10px;
          min-width: 260px;
        }
        .mini-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          display: block;
          font-weight: 700;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }
        .stat {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          padding: 18px;
          box-shadow: 0 10px 24px rgba(15,23,42,0.06);
        }
        .stat-title {
          color: #64748b;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .stat-value {
          color: #111827;
          font-size: 28px;
          font-weight: 800;
        }
        @media (max-width: 1000px) {
          .grid-4, .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .centers-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .page { padding: 14px; }
          .hero {
            padding: 20px;
            border-radius: 18px;
            align-items: flex-start;
          }
          .hero h1 { font-size: 28px; }
          .hero-left { align-items: flex-start; }
          .hero-icon { width: 60px; height: 60px; font-size: 28px; }
          .hero-logo, .hero-logo-fallback { width: 52px; height: 52px; }
          .grid-4, .stats-grid, .centers-grid {
            grid-template-columns: 1fr;
          }
          th, td { font-size: 13px; }
        }
      `}</style>

      <div className="container">
        <div className="hero">
          <div className="hero-left">
            {!logoFailed ? (
              <img
                src="/alrajhi.png"
                alt="شعار الراجحي"
                className="hero-logo"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              <div className="hero-logo-fallback">الراجحي</div>
            )}
            <div>
              <div className="badge">تقرير يومي</div>
              <h1>نظام التقرير اليومي</h1>
              <p>اختر الموقع ثم المشرف والمراكز، وبعدها أضف الأقسام وسجّل التقييم اليومي.</p>
            </div>
          </div>
          <div className="hero-icon">🗂️</div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <div className="stat-title">عدد المراكز المختارة</div>
            <div className="stat-value">{selectedCenters.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">عدد الأقسام المضافة</div>
            <div className="stat-value">{sections.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">الموقع</div>
            <div className="stat-value" style={{ fontSize: '18px' }}>{location || '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-title">المشرف</div>
            <div className="stat-value" style={{ fontSize: '18px' }}>{supervisor || '-'}</div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>البيانات الأساسية</h2>
          <div className="grid-4">
            <div className="field">
              <label>موقع التقييم</label>
              <select className="select" value={location} onChange={(e) => onChangeLocation(e.target.value)}>
                <option value="">اختر الموقع</option>
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>اسم المشرف</label>
              <select
                className="select"
                value={supervisor}
                onChange={(e) => onChangeSupervisor(e.target.value)}
                disabled={!location}
              >
                <option value="">اختر المشرف</option>
                {supervisorOptions.map((s) => (
                  <option key={s.name} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>الفترة</label>
              <input className="input" value={period} readOnly placeholder="تظهر تلقائيًا" />
            </div>

            <div className="field">
              <label>تاريخ التقرير</label>
              <input
                className="input"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
          </div>

          <div className="centers-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <strong>مراكز الضيافة</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={selectAllCenters}
                  onChange={toggleAllCenters}
                  disabled={!location}
                />
                اختيار الكل
              </label>
            </div>

            <div className="centers-grid">
              {centerOptions.map((center) => (
                <label key={center} className="center-item">
                  <input
                    type="checkbox"
                    checked={selectedCenters.includes(center)}
                    onChange={() => toggleCenter(center)}
                    disabled={!location}
                  />
                  <span>{center}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="add-btn" type="button" onClick={addSection}>
              إضافة قسم
            </button>
          </div>

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
        </div>

        {sections.map((section, idx) => (
          <div className="card" key={section.id}>
            <div className="section-head">
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>القسم {idx + 1}</h3>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <select
                  className="select"
                  value={section.sectionName}
                  onChange={(e) => updateSectionName(section.id, e.target.value)}
                >
                  <option value="">اختر القسم</option>
                  {SECTION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <button className="remove-btn" type="button" onClick={() => removeSection(section.id)}>
                حذف القسم
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>مركز الضيافة</th>
                    <th>التقييم</th>
                    <th>الملاحظات</th>
                    <th>الإجراءات</th>
                    <th>النتيجة</th>
                    <th>محضر داخل منصة مدار</th>
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.center}>
                      <td>{row.center}</td>

                      <td>
                        <div className="answer-box">
                          <button
                            type="button"
                            className={`pill-btn ${row.answer === 'نعم' ? 'active-yes' : ''}`}
                            onClick={() => updateRow(section.id, row.center, { answer: 'نعم' })}
                          >
                            نعم
                          </button>
                          <button
                            type="button"
                            className={`pill-btn ${row.answer === 'لا' ? 'active-no' : ''}`}
                            onClick={() => updateRow(section.id, row.center, { answer: 'لا' })}
                          >
                            لا
                          </button>
                        </div>
                      </td>

                      <td>
                        {row.answer === 'نعم' ? (
                          <div className="subfields">
                            <div>
                              <span className="mini-label">الملاحظات</span>
                              <textarea
                                className="textarea"
                                value={row.notes}
                                onChange={(e) =>
                                  updateRow(section.id, row.center, { notes: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {row.answer === 'نعم' ? (
                          <div className="subfields">
                            <div>
                              <span className="mini-label">الإجراءات</span>
                              <textarea
                                className="textarea"
                                value={row.actions}
                                onChange={(e) =>
                                  updateRow(section.id, row.center, { actions: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {row.answer === 'نعم' ? (
                          <div className="subfields">
                            <div>
                              <span className="mini-label">النتيجة</span>
                              <textarea
                                className="textarea"
                                value={row.result}
                                onChange={(e) =>
                                  updateRow(section.id, row.center, { result: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>

                      <td>
                        {row.answer === 'نعم' ? (
                          <select
                            className="select"
                            value={row.modarStatus}
                            onChange={(e) =>
                              updateRow(section.id, row.center, {
                                modarStatus: e.target.value as 'نعم' | 'لا',
                              })
                            }
                          >
                            <option value="">اختر</option>
                            <option value="نعم">نعم، تم إعداد محضر داخل منصة مدار</option>
                            <option value="لا">لا، لم يتم إدخال محضر داخل منصة مدار</option>
                          </select>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="card">
          <button className="save-btn" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'جاري حفظ التقرير...' : 'حفظ التقرير اليومي'}
          </button>
        </div>
      </div>
    </div>
  );
}
