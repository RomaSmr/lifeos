// apps/web/app/analytics/page.tsx

'use client';

import dynamic from 'next/dynamic';

// 🔥 Отключаем SSR — страница будет загружаться только на клиенте
const AnalyticsContent = dynamic(
  () => import('./AnalyticsContent'),
  { ssr: false }
);

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}