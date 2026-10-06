import React from 'react';

interface RoboMascotProps {
  expression?: 'happy' | 'thinking' | 'surprised' | 'dancing';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RoboMascot: React.FC<RoboMascotProps> = ({
  expression = 'happy',
  message,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} shrink-0 transition-transform duration-300 ${
          expression === 'dancing' ? 'animate-bounce' : ''
        }`}
      >
        {/* Robot Antenna */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-slate-400 rounded-t-full">
          <div
            className={`w-3.5 h-3.5 -mt-1.5 -ml-1 rounded-full shadow-md animate-pulse ${
              expression === 'surprised' ? 'bg-rose-400' : 'bg-amber-400'
            }`}
          />
        </div>

        {/* Robot Head */}
        <div className="w-full h-full bg-gradient-to-b from-sky-400 to-blue-500 rounded-2xl border-3 border-white shadow-lg p-2 flex flex-col items-center justify-between relative overflow-hidden">
          {/* Glass glare effect */}
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/30 rounded-full blur-xs" />

          {/* Ears / Head bolts */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-4 bg-amber-400 rounded-l-md" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-4 bg-amber-400 rounded-r-md" />

          {/* Screen Visor */}
          <div className="w-full h-11/12 bg-slate-900 rounded-xl flex items-center justify-center gap-2 px-2 relative border border-cyan-300/40">
            {/* Eyes */}
            {expression === 'happy' && (
              <>
                <div className="w-3.5 h-3.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse" />
                <div className="w-3.5 h-3.5 bg-cyan-300 rounded-full shadow-[0_0_8px_#22d3ee] animate-pulse" />
              </>
            )}

            {expression === 'thinking' && (
              <>
                <div className="w-4 h-1.5 bg-amber-300 rounded-full shadow-[0_0_8px_#fcd34d]" />
                <div className="w-3 h-3 bg-amber-300 rounded-full shadow-[0_0_8px_#fcd34d] -translate-y-1" />
              </>
            )}

            {expression === 'surprised' && (
              <>
                <div className="w-4 h-4 bg-rose-400 rounded-full shadow-[0_0_10px_#fb7185] animate-ping" />
                <div className="w-4 h-4 bg-rose-400 rounded-full shadow-[0_0_10px_#fb7185]" />
              </>
            )}

            {expression === 'dancing' && (
              <>
                <div className="w-3.5 h-2 border-b-2 border-emerald-300 rounded-full" />
                <div className="w-3.5 h-2 border-b-2 border-emerald-300 rounded-full" />
              </>
            )}

            {/* Rosy Cheeks */}
            <div className="absolute bottom-1 left-2 w-2 h-1 bg-pink-400/60 rounded-full" />
            <div className="absolute bottom-1 right-2 w-2 h-1 bg-pink-400/60 rounded-full" />
          </div>
        </div>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div className="relative bg-white/95 backdrop-blur-xs border-2 border-sky-300 text-slate-800 text-sm md:text-base font-medium px-4 py-2.5 rounded-2xl shadow-md max-w-sm">
          {/* Arrow */}
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-r-8 border-r-sky-300" />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};
