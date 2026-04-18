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

const MECCA_CENTERS = [
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
];

const MADINAH_CENTERS = [
  'باكستان 1',
  'باكستان 2',
  'مركز مصر',
  'مركز النيجر',
];

const MASHAER_CENTERS = [...MECCA_CENTERS];

const SECTION_OPTIONS = [
  'الجولات الميدانية',
  'الجولات الميدانية للمشاعر',
  'الاستقبال',
  'المغادرة',
  'المحاضر أو الملاحظات',
  'الإدارات',
];

const ADMIN_OPTIONS = [
  'اداره الخدمات العامه',
  'اداره المشاعر المقدسة',
  'ادارة الاسكان',
  'ادارة نسك',
  'ادارة عمليات الحج المالية',
  'ادارة الموارد البشرية و الشؤون الادارية',
  'ادارة تقنية المعلومات',
  'ادارة الاستقبال',
  'ادارة النقل والتفويج',
  'ادارة خدمة العملاء',
  'ادارة الجوازات',
  'ادارة الاستعداد المسبق',
];

type SectionAnswer = '' | 'نعم' | 'لا';
type ModarStatus = '' | 'نعم' | 'لا';

type SectionRow = {
  center: string;
  answer: SectionAnswer;
  notes: string;
  actions: string;
  result: string;
  modarStatus: ModarStatus;
  pilgrimsCount: string;
  nationality: string;
};

type SectionBlock = {
  id: string;
  sectionName: string;
  selectedCenters: string[];
  selectAll: boolean;
  rows: SectionRow[];
  dropdownOpen: boolean;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function nowLocalDateTimeValue() {
  const now = new Date();
  const tzAdjusted = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return tzAdjusted.toISOString().slice(0, 16);
}

function formatDateTimeArabic(value: string) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('ar-SA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCentersByLocation(location: string) {
  if (location === 'المدينة المنورة') return MADINAH_CENTERS;
  if (location === 'عرفات' || location === 'منى' || location === 'مزدلفة') return MASHAER_CENTERS;
  if (location === 'مكة المكرمة') return MECCA_CENTERS;
  return [];
}

function getSelectableOptions(location: string, sectionName: string) {
  if (sectionName === 'الإدارات') return ADMIN_OPTIONS;
  return getCentersByLocation(location);
}

function syncRowsWithCenters(existingRows: SectionRow[], selectedCenters: string[]): SectionRow[] {
  const map = new Map(existingRows.map((row) => [row.center, row] as const));

  return selectedCenters.map((center): SectionRow => {
    const existing = map.get(center);
    if (existing) return existing;

    return {
      center,
      answer: '' as SectionAnswer,
      notes: '',
      actions: '',
      result: '',
      modarStatus: '' as ModarStatus,
      pilgrimsCount: '',
      nationality: '',
    };
  });
}

function isMemosSection(name: string) {
  return name === 'المحاضر أو الملاحظات';
}

function isReceptionOrDeparture(name: string) {
  return name === 'الاستقبال' || name === 'المغادرة';
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function ReportsPage() {
  const [reportDate, setReportDate] = useState(nowLocalDateTimeValue());
  const [location, setLocation] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [period, setPeriod] = useState('');
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  const supervisorOptions = useMemo(() => {
    return location ? SUPERVISORS_BY_LOCATION[location] || [] : [];
  }, [location]);

  function onChangeLocation(value: string) {
    setLocation(value);
    setSupervisor('');
    setPeriod('');
    setSections([]);
  }

  function onChangeSupervisor(name: string) {
    setSupervisor(name);
    const found = supervisorOptions.find((s) => s.name === name);
    setPeriod(found?.period || '');
  }

  function addSection() {
    if (!location) {
      setMessage('❌ اختر موقع التقييم أولًا');
      return;
    }

    setSections((prev) => [
      ...prev,
      {
        id: uid(),
        sectionName: '',
        selectedCenters: [],
        selectAll: false,
        rows: [],
        dropdownOpen: false,
      },
    ]);
    setMessage('');
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function updateSectionName(id: string, value: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== id) return section;
        return {
          ...section,
          sectionName: value,
          selectedCenters: [],
          selectAll: false,
          rows: [],
          dropdownOpen: false,
        };
      })
    );
  }

  function toggleDropdown(id: string) {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, dropdownOpen: !s.dropdownOpen } : { ...s, dropdownOpen: false }
      )
    );
  }

  function toggleCenter(sectionId: string, center: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const options = getSelectableOptions(location, section.sectionName);
        const exists = section.selectedCenters.includes(center);
        const nextCenters = exists
          ? section.selectedCenters.filter((c) => c !== center)
          : [...section.selectedCenters, center];

        return {
          ...section,
          selectedCenters: nextCenters,
          selectAll: nextCenters.length === options.length && options.length > 0,
          rows: syncRowsWithCenters(section.rows, nextCenters),
        };
      })
    );
  }

  function toggleAllCenters(sectionId: string) {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        const options = getSelectableOptions(location, section.sectionName);
        const nextCenters = section.selectAll ? [] : [...options];

        return {
          ...section,
          selectAll: !section.selectAll,
          selectedCenters: nextCenters,
          rows: syncRowsWithCenters(section.rows, nextCenters),
        };
      })
    );
  }

  function updateRow(sectionId: string, center: string, patch: Partial<SectionRow>) {
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
                        ? {
                            notes: '',
                            actions: '',
                            result: '',
                            modarStatus: '',
                          }
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

    if (sections.length === 0) {
      return 'أضف قسمًا واحدًا على الأقل';
    }

    for (const section of sections) {
      if (!section.sectionName) {
        return 'اختر اسم القسم لكل قسم';
      }

      if (section.selectedCenters.length === 0) {
        return `اختر عنصرًا واحدًا على الأقل في القسم: ${section.sectionName || 'بدون اسم'}`;
      }

      for (const row of section.rows) {
        if (!row.answer) {
          return `حدد هل تم رصد ملاحظات أمام: ${row.center}`;
        }

        if (isReceptionOrDeparture(section.sectionName)) {
          if (!row.pilgrimsCount.trim() || !row.nationality.trim()) {
            return `أكمل عدد الحجاج والجنسية أمام: ${row.center}`;
          }
        }

        if (row.answer === 'نعم') {
          if (!row.notes.trim()) {
            return `أكمل الملاحظات أمام: ${row.center}`;
          }

          if (!isReceptionOrDeparture(section.sectionName)) {
            if (!row.actions.trim() || !row.result.trim()) {
              return `أكمل الإجراءات والنتيجة أمام: ${row.center}`;
            }
          }

          if (isMemosSection(section.sectionName) && !row.modarStatus) {
            return `حدد حالة المحضر في منصة مدار أمام: ${row.center}`;
          }
        }
      }
    }

    return '';
  }

  function buildReportExportHtml(reportId?: number) {
    const logoUrl = `${window.location.origin}/alrajhi.png`;

    const sectionsHtml = sections
      .map((section) => {
        const rowsHtml = section.rows
          .map((row) => {
            const col4 = isReceptionOrDeparture(section.sectionName)
              ? `<div><strong>عدد الحجاج:</strong> ${escapeHtml(row.pilgrimsCount || '-')}</div>`
              : `<div><strong>الإجراءات:</strong> ${escapeHtml(row.answer === 'نعم' ? row.actions || '-' : '-')}</div>`;

            const col5 = isReceptionOrDeparture(section.sectionName)
              ? `<div><strong>الجنسية:</strong> ${escapeHtml(row.nationality || '-')}</div>`
              : `<div><strong>النتيجة:</strong> ${escapeHtml(row.answer === 'نعم' ? row.result || '-' : '-')}</div>`;

            const modar = isMemosSection(section.sectionName)
              ? escapeHtml(row.answer === 'نعم' ? row.modarStatus || '-' : '-')
              : '-';

            return `
              <tr>
                <td>${escapeHtml(row.center)}</td>
                <td>${escapeHtml(row.answer || '-')}</td>
                <td>${escapeHtml(row.answer === 'نعم' ? row.notes || '-' : '-')}</td>
                <td>${col4}</td>
                <td>${col5}</td>
                <td>${modar}</td>
              </tr>
            `;
          })
          .join('');

        return `
          <div class="section-card">
            <h3>${escapeHtml(section.sectionName || 'قسم بدون اسم')}</h3>
            <table>
              <thead>
                <tr>
                  <th>${section.sectionName === 'الإدارات' ? 'الإدارة' : 'العنصر'}</th>
                  <th>هل تم رصد ملاحظات؟</th>
                  <th>الملاحظات</th>
                  <th>${isReceptionOrDeparture(section.sectionName) ? 'عدد الحجاج' : 'الإجراءات'}</th>
                  <th>${isReceptionOrDeparture(section.sectionName) ? 'الجنسية' : 'النتيجة'}</th>
                  <th>حالة المحضر في مدار</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
        `;
      })
      .join('');

    return `
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>تقرير يومي</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; color: #111827; padding: 24px; }
          .header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 18px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 14px;
          }
          .logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            border-radius: 12px;
          }
          .fallback {
            width: 70px;
            height: 70px;
            border-radius: 12px;
            background: #eff6ff;
            color: #1d4ed8;
            display: none;
            align-items: center;
            justify-content: center;
            font-weight: 800;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin: 18px 0;
          }
          .meta-card, .section-card {
            border: 1px solid #d1d5db;
            border-radius: 14px;
            padding: 14px;
            background: #fff;
          }
          .meta-label {
            color: #64748b;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .meta-value {
            font-size: 18px;
            font-weight: 800;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: right;
            vertical-align: top;
            font-size: 13px;
          }
          th {
            background: #f8fafc;
          }
          h3 {
            margin: 0 0 10px;
          }
          .print-btn {
            margin-bottom: 16px;
            padding: 10px 16px;
            border: none;
            border-radius: 10px;
            background: #1d4ed8;
            color: white;
            font-weight: 700;
            cursor: pointer;
          }
          @media print {
            .print-btn { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">تنزيل / طباعة PDF</button>

        <div class="header">
          <img src="${logoUrl}" class="logo" onerror="this.style.display='none';document.getElementById('fallback').style.display='flex';" />
          <div id="fallback" class="fallback">الراجحي</div>
          <div>
            <h1 style="margin:0;">التقرير اليومي</h1>
            <div style="color:#64748b;margin-top:6px;">تقرير متابعة يومي مفصل</div>
          </div>
        </div>

        <div class="meta">
          <div class="meta-card"><div class="meta-label">رقم التقرير</div><div class="meta-value">${escapeHtml(String(reportId ?? '-'))}</div></div>
          <div class="meta-card"><div class="meta-label">التاريخ</div><div class="meta-value">${escapeHtml(formatDateTimeArabic(reportDate))}</div></div>
          <div class="meta-card"><div class="meta-label">الموقع</div><div class="meta-value">${escapeHtml(location || '-')}</div></div>
          <div class="meta-card"><div class="meta-label">المشرف</div><div class="meta-value">${escapeHtml(supervisor || '-')}</div></div>
          <div class="meta-card"><div class="meta-label">الفترة</div><div class="meta-value">${escapeHtml(period || '-')}</div></div>
          <div class="meta-card"><div class="meta-label">عدد الأقسام</div><div class="meta-value">${escapeHtml(String(sections.length))}</div></div>
        </div>

        ${sectionsHtml}
      </body>
      </html>
    `;
  }

  function exportExcelReport() {
    const html = buildReportExportHtml();
    const blob = new Blob(['\uFEFF' + html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${reportDate.replace(/[:T]/g, '-')}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPdfReport() {
    const win = window.open('', '_blank', 'width=1200,height=900');
    if (!win) return;
    win.document.open();
    win.document.write(buildReportExportHtml());
    win.document.close();
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
          actions: isReceptionOrDeparture(section.sectionName)
            ? `عدد الحجاج: ${row.pilgrimsCount.trim()} | الجنسية: ${row.nationality.trim()}`
            : row.answer === 'نعم'
              ? row.actions.trim()
              : null,
          result: !isReceptionOrDeparture(section.sectionName) && row.answer === 'نعم' ? row.result.trim() : null,
          modar_status:
            row.answer === 'نعم' && isMemosSection(section.sectionName)
              ? row.modarStatus
              : null,
        }))
      );

      const { error } = await supabase.from('daily_report_items').insert(payload);
      if (error) throw error;

      setMessage(`✅ تم حفظ التقرير اليومي رقم ${reportId}`);
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
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
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
          font-size: 24px;
          font-weight: 800;
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
        .add-btn, .save-btn, .sticky-add-btn, .export-btn {
          border: none;
          border-radius: 12px;
          color: #fff;
          cursor: pointer;
          font-weight: 800;
          font-family: inherit;
        }
        .add-btn, .sticky-add-btn {
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
        .export-row {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .export-btn {
          background: #059669;
          padding: 12px 16px;
        }
        .export-btn.pdf {
          background: #7c3aed;
        }
        .sticky-add-wrap {
          display: flex;
          justify-content: center;
          margin-top: 14px;
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
          flex-wrap: wrap;
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
          min-width: 220px;
        }
        .mini-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
          display: block;
          font-weight: 700;
        }
        .multi-box {
          position: relative;
        }
        .multi-trigger {
          width: 100%;
          min-height: 48px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: #fff;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
        }
        .multi-placeholder {
          color: #64748b;
        }
        .multi-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .tag {
          background: #eff6ff;
          color: #1d4ed8;
          border-radius: 999px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
        }
        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          left: 0;
          background: #fff;
          border: 1px solid #d1d5db;
          border-radius: 14px;
          box-shadow: 0 14px 24px rgba(15,23,42,0.08);
          padding: 10px;
          z-index: 20;
          max-height: 280px;
          overflow: auto;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: 10px;
          font-size: 14px;
        }
        .dropdown-item:hover {
          background: #f8fafc;
        }
        .mobile-note {
          color: #64748b;
          font-size: 13px;
          margin-top: 8px;
        }
        @media (max-width: 1000px) {
          .grid-4, .stats-grid {
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
          .grid-4, .stats-grid {
            grid-template-columns: 1fr;
          }
          th, td { font-size: 13px; }
          .section-head {
            align-items: stretch;
          }
          .answer-box {
            flex-direction: column;
          }
          .export-row {
            flex-direction: column;
          }
          .sticky-add-wrap {
            position: sticky;
            bottom: 10px;
            z-index: 15;
          }
          .sticky-add-btn {
            width: 100%;
            box-shadow: 0 10px 24px rgba(15,23,42,0.18);
          }
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
              <p>اختر الموقع ثم المشرف، وبعدها أضف الأقسام وحدد عناصر كل قسم بشكل مستقل.</p>
            </div>
          </div>
          <div className="hero-icon">🗂️</div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <div className="stat-title">الموقع</div>
            <div className="stat-value">{location || '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-title">المشرف</div>
            <div className="stat-value">{supervisor || '-'}</div>
          </div>
          <div className="stat">
            <div className="stat-title">عدد الأقسام</div>
            <div className="stat-value">{sections.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">تاريخ التقرير</div>
            <div className="stat-value">{formatDateTimeArabic(reportDate)}</div>
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
              <label>تاريخ ووقت التقرير</label>
              <input
                className="input"
                type="datetime-local"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <button className="add-btn" type="button" onClick={addSection}>
              إضافة قسم
            </button>
            <div className="mobile-note">يمكنك إضافة أكثر من قسم، ويوجد زر إضافة أيضًا أسفل الصفحة.</div>
          </div>

          <div className="export-row">
            <button className="export-btn" type="button" onClick={exportExcelReport}>
              تصدير Excel
            </button>
            <button className="export-btn pdf" type="button" onClick={exportPdfReport}>
              تصدير PDF
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

        {sections.map((section, idx) => {
          const options = getSelectableOptions(location, section.sectionName);

          return (
            <div className="card" key={section.id}>
              <div className="section-head">
                <div style={{ flex: '1 1 220px' }}>
                  <h3 style={{ margin: 0 }}>القسم {idx + 1}</h3>
                </div>

                <div style={{ flex: '1 1 260px' }}>
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

                <div style={{ flex: '1 1 340px' }} className="multi-box">
                  <div className="multi-trigger" onClick={() => toggleDropdown(section.id)}>
                    <div className="multi-tags">
                      {section.selectedCenters.length === 0 ? (
                        <span className="multi-placeholder">
                          {section.sectionName === 'الإدارات' ? 'اختر الإدارات' : 'اختر عناصر هذا القسم'}
                        </span>
                      ) : (
                        section.selectedCenters.slice(0, 2).map((c) => (
                          <span key={c} className="tag">{c}</span>
                        ))
                      )}
                      {section.selectedCenters.length > 2 ? (
                        <span className="tag">+{section.selectedCenters.length - 2}</span>
                      ) : null}
                    </div>
                    <span>▾</span>
                  </div>

                  {section.dropdownOpen ? (
                    <div className="dropdown">
                      <label className="dropdown-item">
                        <input
                          type="checkbox"
                          checked={section.selectAll}
                          onChange={() => toggleAllCenters(section.id)}
                        />
                        <strong>اختيار الكل</strong>
                      </label>

                      {options.map((center) => (
                        <label key={center} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={section.selectedCenters.includes(center)}
                            onChange={() => toggleCenter(section.id, center)}
                          />
                          <span>{center}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>

                <button className="remove-btn" type="button" onClick={() => removeSection(section.id)}>
                  حذف القسم
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{section.sectionName === 'الإدارات' ? 'الإدارة' : 'العنصر'}</th>
                      <th>هل تم رصد ملاحظات؟</th>
                      <th>الملاحظات</th>
                      <th>{isReceptionOrDeparture(section.sectionName) ? 'عدد الحجاج' : 'الإجراءات'}</th>
                      <th>{isReceptionOrDeparture(section.sectionName) ? 'الجنسية' : 'النتيجة'}</th>
                      <th>حالة المحضر في مدار</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>
                          {section.sectionName === 'الإدارات'
                            ? 'اختر الإدارات من القائمة المنسدلة'
                            : 'اختر عناصر هذا القسم من القائمة المنسدلة'}
                        </td>
                      </tr>
                    ) : (
                      section.rows.map((row) => (
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
                            {isReceptionOrDeparture(section.sectionName) ? (
                              <div className="subfields">
                                <div>
                                  <span className="mini-label">عدد الحجاج</span>
                                  <input
                                    className="input"
                                    value={row.pilgrimsCount}
                                    onChange={(e) =>
                                      updateRow(section.id, row.center, { pilgrimsCount: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                            ) : row.answer === 'نعم' ? (
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
                            {isReceptionOrDeparture(section.sectionName) ? (
                              <div className="subfields">
                                <div>
                                  <span className="mini-label">الجنسية</span>
                                  <input
                                    className="input"
                                    value={row.nationality}
                                    onChange={(e) =>
                                      updateRow(section.id, row.center, { nationality: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                            ) : row.answer === 'نعم' ? (
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
                            {row.answer === 'نعم' && isMemosSection(section.sectionName) ? (
                              <select
                                className="select"
                                value={row.modarStatus}
                                onChange={(e) =>
                                  updateRow(section.id, row.center, {
                                    modarStatus: e.target.value as ModarStatus,
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="sticky-add-wrap">
                <button className="sticky-add-btn" type="button" onClick={addSection}>
                  إضافة قسم جديد
                </button>
              </div>
            </div>
          );
        })}

        <div className="card">
          <button className="save-btn" type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'جاري حفظ التقرير...' : 'حفظ التقرير اليومي'}
          </button>
        </div>
      </div>
    </div>
  );
}
