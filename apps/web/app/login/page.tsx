'use client';

import dynamic from 'next/dynamic';

// 🔥 Импортируем компонент без SSR
const LoginPageContent = dynamic(
  () => import('./LoginContent'),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginPageContent />;
}