import { useState, useEffect, useRef } from 'react';
import { Flame, Check } from 'lucide-react';
import type { CartItem, Restaurant } from '@/types';
import { formatSEK } from '@/lib/format';

interface PreparingScreenProps {
  restaurant: Restaurant;
  cart: CartItem[];
  total: number;
  onDone: () => void;
}

const steps = [
  'Restaurangen tar emot din beställning...',
  'Kocken tänder spisen...',
  'Ingredienser förbereds...',
  'Maten tillagas med kärlek...',
  'Kryddor tillsätts...',
  'Sista touchen...',
  'Färdig att hämtas!',
];

export function PreparingScreen({ restaurant, cart, total, onDone }: PreparingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDone(true);
          setTimeout(() => onDone(), 1200);
          return prev;
        }
        return next;
      });
    }, 900);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onDone]);

  const progress = Math.min(100, (stepIndex / (steps.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Pan animation */}
      <div className="relative z-10 mb-8">
        <div
          className="relative"
          style={{
            animation: done
              ? 'none'
              : 'pan-shake 0.4s ease-in-out infinite',
          }}
        >
          {/* Pan */}
          <svg width="200" height="120" viewBox="0 0 200 120" fill="none">
            {/* Pan handle */}
            <rect x="140" y="48" width="55" height="14" rx="7" fill="#78716c" />
            <rect x="140" y="48" width="55" height="14" rx="7" fill="url(#handleGrad)" />
            {/* Pan body */}
            <ellipse cx="80" cy="55" rx="70" ry="22" fill="#44403c" />
            <ellipse cx="80" cy="50" rx="70" ry="20" fill="#57534e" />
            <ellipse cx="80" cy="48" rx="62" ry="16" fill="#292524" />
            {/* Food in pan */}
            <ellipse cx="80" cy="46" rx="50" ry="12" fill="#f97316" opacity="0.9" />
            <ellipse cx="65" cy="44" rx="12" ry="5" fill="#fb923c" />
            <ellipse cx="95" cy="45" rx="10" ry="4" fill="#fbbf24" />
            <ellipse cx="80" cy="42" rx="8" ry="3" fill="#fde047" />

            <defs>
              <linearGradient id="handleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#a8a29e" />
                <stop offset="1" stopColor="#57534e" />
              </linearGradient>
            </defs>
          </svg>

          {/* Steam */}
          {!done && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-16 pointer-events-none">
              <div className="absolute left-2 bottom-0 w-3 h-10 bg-white/20 rounded-full" style={{ animation: 'steam 1.5s ease-out infinite' }} />
              <div className="absolute left-8 bottom-0 w-3 h-12 bg-white/15 rounded-full" style={{ animation: 'steam 1.5s ease-out infinite 0.3s' }} />
              <div className="absolute left-14 bottom-0 w-3 h-10 bg-white/20 rounded-full" style={{ animation: 'steam 1.5s ease-out infinite 0.6s' }} />
            </div>
          )}

          {/* Flame */}
          {!done && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <Flame className="w-8 h-8 text-orange-500" style={{ animation: 'flicker 0.3s ease-in-out infinite alternate' }} />
            </div>
          )}
        </div>
      </div>

      {/* Status text */}
      <div className="relative z-10 text-center max-w-sm w-full">
        {done ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">Maten är klar!</h2>
            <p className="text-stone-400 text-sm">Budet hämtar din beställning...</p>
          </>
        ) : (
          <>
            <h2 className="text-white font-bold text-xl mb-2">{restaurant.name}</h2>
            <p className="text-stone-400 text-sm mb-6 min-h-[20px] transition-all" key={stepIndex}>
              {steps[stepIndex]}
            </p>

            {/* Progress bar */}
            <div className="w-full bg-stone-700 rounded-full h-2.5 mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-stone-500 text-xs">{Math.round(progress)}% klart</p>
          </>
        )}
      </div>

      {/* Order summary */}
      <div className="relative z-10 mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 max-w-sm w-full">
        <p className="text-stone-400 text-xs font-medium mb-2">Din beställning</p>
        <div className="space-y-1">
          {cart.map((ci) => (
            <div key={ci.item.id} className="flex justify-between text-sm">
              <span className="text-stone-300">{ci.quantity}× {ci.item.name}</span>
              <span className="text-stone-500">{formatSEK(ci.item.price * ci.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
          <span className="text-stone-300 text-sm font-bold">Totalt</span>
          <span className="text-rose-400 text-sm font-bold">{formatSEK(total)}</span>
        </div>
      </div>

      <style>{`
        @keyframes pan-shake {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          25% { transform: rotate(2deg) translateY(-2px); }
          50% { transform: rotate(-2deg) translateY(0); }
          75% { transform: rotate(3deg) translateY(-1px); }
        }
        @keyframes steam {
          0% { opacity: 0; transform: translateY(0) scaleX(1); }
          30% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-40px) scaleX(2); }
        }
        @keyframes flicker {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
