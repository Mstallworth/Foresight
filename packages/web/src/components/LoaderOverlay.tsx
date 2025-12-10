import React from 'react';

type LoaderOverlayProps = {
  text?: string;
};

export const LoaderOverlay: React.FC<LoaderOverlayProps> = ({ text = 'exploring the future' }) => (
  <div className="loader-overlay" aria-live="polite">
    <div>
      <div style={{ textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '12px' }}>
        {text}
      </div>
      <div
        style={{
          width: '240px',
          height: '6px',
          background: '#eef1f6',
          marginTop: '10px',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, #111827, #4b5563)',
            animation: 'slide 1.2s infinite'
          }}
        />
      </div>
      <style jsx>{`
        @keyframes slide {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(220%);
          }
        }
      `}</style>
    </div>
  </div>
);
