import { useEffect, useState } from 'react';
import { Bike, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export function SplashScreen({ onContinue }: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLeaving(true), 2600);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setLeaving(true);
    setTimeout(onContinue, 450);
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 flex flex-col items-center justify-center px-8 text-center transition-opacity duration-500 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleEnter}
    >
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Animated courier icon */}
      <div className="relative z-10 mb-8">
        <div className="absolute inset-0 bg-rose-500/30 blur-2xl rounded-full animate-pulse" />
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl animate-bounce" style={{ animationDuration: '2.5s' }}>
          <Bike className="w-14 h-14 text-white" />
        </div>
      </div>

      {/* App name */}
      <h1 className="relative z-10 text-white font-extrabold text-6xl tracking-tight mb-2 drop-shadow-2xl">
        Spökkäk
      </h1>

      {/* Subtitle */}
      <div className="relative z-10 flex items-center gap-2 mb-10">
        <div className="h-px w-8 bg-stone-600" />
        <p className="text-stone-400 text-sm font-medium tracking-wide uppercase">
          presenteras av gormin-studios
        </p>
        <div className="h-px w-8 bg-stone-600" />
      </div>

      <p className="relative z-10 text-stone-500 text-sm max-w-xs leading-relaxed mb-12">
        Beställ mat, få din dopaminkick — och behåll pengarna. Maten kommer aldrig.
      </p>

      {/* Continue button */}
      <button
        onClick={handleEnter}
        className="relative z-10 bg-white text-stone-900 rounded-2xl px-10 py-4 font-bold text-base hover:bg-stone-100 transition-all shadow-xl flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-rose-500" />
        Kom igång
      </button>

      {/* Disclaimer */}
      <p className="relative z-10 text-stone-600 text-[11px] mt-10 max-w-xs leading-relaxed">
        Denna app är endast avsedd för underhållningssyfte. Alla restauranger, produkter,
        beställningar och pengar är på låtsas. Inga riktiga köp eller leveranser görs
        (förutom valfria kosmetiska köp som tydligt markeras).
      </p>

      {/* Tap to skip hint */}
      <p className="relative z-10 text-stone-700 text-xs mt-6 animate-pulse">
        Tryck var som helst för att fortsätta
      </p>
    </div>
  );
}
