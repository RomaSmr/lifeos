'use client';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Home() {
  const router = useRouter();
  const circle1Ref = useRef<HTMLDivElement>(null);
  const circle2Ref = useRef<HTMLDivElement>(null);
  const circle3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Круг 1 — скорость x3
      if (circle1Ref.current) {
        const scale1 = 1 + Math.sin(elapsed * 0.9) * 0.2;
        const x1 = Math.sin(elapsed * 0.45) * 50;
        const y1 = Math.cos(elapsed * 0.6) * 40;
        circle1Ref.current.style.transform = `translate(${x1}px, ${y1}px) scale(${scale1})`;
      }

      // Круг 2 — скорость x3
      if (circle2Ref.current) {
        const scale2 = 1 + Math.sin(elapsed * 0.75 + 1) * 0.18;
        const x2 = Math.sin(elapsed * 0.36 + 2) * 60;
        const y2 = Math.cos(elapsed * 0.54 + 1) * 50;
        circle2Ref.current.style.transform = `translate(${x2}px, ${y2}px) scale(${scale2})`;
      }

      // Круг 3 — скорость x3
      if (circle3Ref.current) {
        const scale3 = 1 + Math.sin(elapsed * 1.2 + 0.5) * 0.25;
        const x3 = Math.sin(elapsed * 0.6 + 1.5) * 70;
        const y3 = Math.cos(elapsed * 0.45 + 0.7) * 60;
        circle3Ref.current.style.transform = `translate(${x3}px, ${y3}px) scale(${scale3})`;
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Анимированные фоновые круги */}
      
      {/* Круг 1 — большой, синий */}
      <div
        ref={circle1Ref}
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '50%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'none',
        }}
      />

      {/* Круг 2 — фиолетовый */}
      <div
        ref={circle2Ref}
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-15%',
          width: '55%',
          height: '65%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'none',
        }}
      />

      {/* Круг 3 — маленький, голубой */}
      <div
        ref={circle3Ref}
        style={{
          position: 'absolute',
          top: '30%',
          right: '-5%',
          width: '25%',
          height: '35%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          willChange: 'transform',
          transition: 'none',
        }}
      />

      {/* Дополнительный маленький светлый блик */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '25%',
        width: '15%',
        height: '20%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        animation: 'floatSlow 6s ease-in-out infinite',
      }} />

      {/* Основной контент */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '520px',
      }}>
        {/* Иконка */}
        <div style={{
          width: '64px',
          height: '64px',
          margin: '0 auto 24px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(59,130,246,0.25)',
          animation: 'floatIcon 1.8s ease-in-out infinite',
        }}>
          <Sparkles style={{ width: '32px', height: '32px', color: 'white' }} />
        </div>

        {/* Заголовок */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
        }}>
          LifeOS
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#9ca3af',
          fontWeight: '300',
          margin: '0 0 6px',
        }}>
          Твоя жизнь. Твоя система.
        </p>

        <p style={{
          fontSize: '14px',
          color: '#4b5563',
          maxWidth: '400px',
          margin: '16px auto 36px',
          lineHeight: '1.6',
        }}>
          Цифровая экосистема для развития личности.
        </p>

        {/* Кнопки */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => router.push('/login?mode=signup')}
            style={{
              padding: '14px 36px',
              background: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              boxShadow: '0 4px 20px rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,255,255,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.08)';
            }}
          >
            Начать
            <ArrowRight style={{ width: '16px', height: '16px' }} />
          </button>
          <button
            onClick={() => router.push('/login?mode=login')}
            style={{
              padding: '14px 36px',
              background: 'transparent',
              color: '#d1d5db',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontWeight: '500',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Войти
          </button>
        </div>

        <p style={{
          marginTop: '48px',
          fontSize: '11px',
          color: '#ffffff',
          fontFamily: 'monospace',
          letterSpacing: '2px',
          opacity: 0.3,
        }}>
          v1.0 · ALPHA
        </p>
      </div>

      {/* Стили для анимаций */}
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0px, 0px); }
          25% { transform: translate(25px, -20px); }
          50% { transform: translate(-15px, 30px); }
          75% { transform: translate(20px, 15px); }
        }
      `}</style>
    </div>
  );
}