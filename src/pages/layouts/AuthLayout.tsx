import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => (
  <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 font-sans antialiased">

    {/* 1. Animated gradient base (now uses 3-stop gradient for smoother banding) */}
    <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50 animate-gradient-flow" />

    {/* 2. Premium noise (opacity dropped to 0.025 so it’s only felt, not seen) */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.025] noise-bg" />

    {/* 3. Blobs with hardware-accelerated blur() + will-change */}
    <div className="absolute inset-0 isolate">
      <div
        className="absolute w-[520px] h-[520px] rounded-full blur-[140px] bg-sky-400/30 will-change-transform animate-voice-pulse"
        style={{ top: '-18%', left: '-18%' }}
      />
      <div
        className="absolute w-[620px] h-[620px] rounded-full blur-[160px] bg-indigo-500/30 will-change-transform animate-drift-slow"
        style={{ bottom: '-20%', right: '-15%' }}
      />
      <div
        className="absolute w-[420px] h-[420px] rounded-full blur-[120px] bg-blue-400/25 will-change-transform animate-drift-fast"
        style={{ top: '35%', left: '55%' }}
      />
    </div>

    {/* 4. Subtle grid (now scales with rem instead of px, crisper on retina) */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(to right, #94a3b8 0.05rem, transparent 0.05rem), linear-gradient(to bottom, #94a3b8 0.05rem, transparent 0.05rem)',
        backgroundSize: '2.625rem 2.625rem',
      }}
    />

    {/* 5. Layout container (added backdrop-blur safety for ultra-light content) */}
    <div className="relative z-10 flex min-h-screen flex-col">
      {/* 6. Header (logo now has a subtle glass back-plate so it never clips on white) */}
      <header className="absolute top-0 left-0 z-50 flex w-full items-center px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3 rounded-xl bg-white/40 px-4 py-2 shadow-sm backdrop-blur-sm">
          <img
            src="/logo-icon1.2.png"
            alt="Vocal Scale Logo"
            className="w-9 h-9 object-contain drop-shadow-sm"
          />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Vocal Scale
          </span>
        </div>
      </header>

      {/* 7. Center content (min-h-[calc(100vh-4rem)] prevents footer-jump on short pages) */}
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>

    {/* 8. All animations kept, just prefixed for older Safari & reduced-motion safe */}
    <style>{`
      @keyframes gradientFlow {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .animate-gradient-flow {
        background-size: 200% 200%;
        animation: gradientFlow 30s ease infinite;
      }

      @keyframes voicePulse {
        0%   { transform: scale(1) translate(0, 0); opacity: 0.8; }
        50%  { transform: scale(1.08) translate(30px, 20px); opacity: 1; }
        100% { transform: scale(1) translate(0, 0); opacity: 0.8; }
      }
      .animate-voice-pulse {
        animation: voicePulse 22s ease-in-out infinite;
      }

      @keyframes driftSlow {
        0%   { transform: translate(0, 0); }
        50%  { transform: translate(-40px, 60px); }
        100% { transform: translate(0, 0); }
      }
      .animate-drift-slow {
        animation: driftSlow 35s ease-in-out infinite;
      }

      @keyframes driftFast {
        0%   { transform: translate(0, 0); }
        50%  { transform: translate(50px, -40px); }
        100% { transform: translate(0, 0); }
      }
      .animate-drift-fast {
        animation: driftFast 26s ease-in-out infinite;
      }

      .noise-bg {
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
      }

      @media (prefers-reduced-motion: reduce) {
        .animate-gradient-flow,
        .animate-voice-pulse,
        .animate-drift-slow,
        .animate-drift-fast {
          animation: none;
        }
      }
    `}</style>
  </div>
);

export default AuthLayout;