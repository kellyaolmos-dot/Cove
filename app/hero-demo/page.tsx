'use client';

import { useState } from 'react';
import CoveCityHero from '@/components/CoveCityHero';

type DemoVariant = 'default' | 'sunset' | 'midnight' | 'minimal';

export default function HeroDemoPage() {
  const [variant, setVariant] = useState<DemoVariant>('default');

  const renderHero = () => {
    switch (variant) {
      case 'default':
        return <CoveCityHero />;

      case 'sunset':
        return (
          <CoveCityHero
            headline="Live where ambition meets community"
            subline="Fully-furnished apartments in Manhattan's most vibrant neighborhoods"
            city="nyc"
            palette={{
              skyA: '#ff6b9d',
              skyB: '#ff8c42',
              skyC: '#9b59b6',
              bg: '#0f0a1e',
              ink: '#ffffff',
              muted: '#d4c5f9',
              accent: '#feca57',
              line: '#2c1654',
              blurTeal: '#48dbfb',
              blurYellow: '#feca57',
            }}
          />
        );

      case 'midnight':
        return (
          <CoveCityHero
            headline="Where the city never sleeps"
            subline="Premium living spaces for those who dream bigger"
            city="nyc"
            palette={{
              skyA: '#667eea',
              skyB: '#4facfe',
              skyC: '#1a2a6c',
              bg: '#0a0e1a',
              ink: '#e8f4f8',
              muted: '#8ba3c7',
              accent: '#00d2ff',
              line: '#1e3a5f',
              blurTeal: '#00d2ff',
              blurYellow: '#667eea',
            }}
          />
        );

      case 'minimal':
        return (
          <CoveCityHero
            headline="Modern living, elevated"
            subline="Your sanctuary in the heart of the city"
            palette={{
              accent: '#00f2fe',
              blurTeal: '#00f2fe',
            }}
          />
        );
    }
  };

  return (
    <>
      {renderHero()}

      {/* Variant Switcher */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '1rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={() => setVariant('default')}
          style={{
            padding: '0.5rem 1rem',
            background: variant === 'default' ? '#ffd166' : '#1a2030',
            color: variant === 'default' ? '#0a0d14' : '#f4f6fb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: variant === 'default' ? 600 : 400,
          }}
        >
          Default
        </button>
        <button
          onClick={() => setVariant('sunset')}
          style={{
            padding: '0.5rem 1rem',
            background: variant === 'sunset' ? '#feca57' : '#1a2030',
            color: variant === 'sunset' ? '#0a0d14' : '#f4f6fb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: variant === 'sunset' ? 600 : 400,
          }}
        >
          Sunset
        </button>
        <button
          onClick={() => setVariant('midnight')}
          style={{
            padding: '0.5rem 1rem',
            background: variant === 'midnight' ? '#00d2ff' : '#1a2030',
            color: variant === 'midnight' ? '#0a0d14' : '#f4f6fb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: variant === 'midnight' ? 600 : 400,
          }}
        >
          Midnight
        </button>
        <button
          onClick={() => setVariant('minimal')}
          style={{
            padding: '0.5rem 1rem',
            background: variant === 'minimal' ? '#00f2fe' : '#1a2030',
            color: variant === 'minimal' ? '#0a0d14' : '#f4f6fb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: variant === 'minimal' ? 600 : 400,
          }}
        >
          Minimal
        </button>
      </div>
    </>
  );
}
