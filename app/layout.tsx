import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نظام تقارير الزيارات الميدانية',
  description: 'نظام مجاني لتسجيل زيارات المخيمات وإصدار التقارير وتصدير Excel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
