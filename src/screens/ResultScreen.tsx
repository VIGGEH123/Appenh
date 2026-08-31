import { useState } from 'react';
import { Sparkles, TrendingUp, Heart, ArrowRight, Check, Wallet, Gift } from 'lucide-react';
import { formatSEK } from '@/lib/format';
import { Confetti } from '@/components/Confetti';
import { playChime } from '@/lib/sound';

interface ResultScreenProps {
  savedAmount: number;
  totalSaved: number;
  ordersCount: number;
  onGoHome: () => void;
}

const MIN_DONATION = 10;
const MAX_DONATION = 500;

export function ResultScreen({ savedAmount, totalSaved, ordersCount, onGoHome }: ResultScreenProps) {
  const [donation, setDonation] = useState(50);
  const [donated, setDonated] = useState(false);

  const handleDonate = () => {
    playChime();
    setDonated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-800 to-stone-900 flex flex-col items-center px-6 pt-16 pb-8 overflow-hidden">
      {donated && <Confetti active={donated} />}

      {/* Decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main reveal */}
      <div className="relative z-10 text-center max-w-md w-full">
        {/* Icon */}
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-rose-500/30 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-white font-bold text-3xl leading-tight mb-3">
          Maten kom aldrig.<br />
          <span className="text-rose-400">Du fick din dopaminkick!</span>
        </h1>

        <p className="text-stone-400 text-sm leading-relaxed mb-8">
          Du gick igenom hela beställningen, spänningen byggdes upp, budet var på väg...
          men du spenderade inga riktiga pengar. Din hjärna fick belöningen utan prislappen.
        </p>

        {/* Saved this order */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 mb-4">
          <p className="text-stone-400 text-sm mb-1">Du sparade den här gången</p>
          <p className="text-emerald-400 font-bold text-4xl mb-3">{formatSEK(savedAmount)}</p>
          <div className="flex items-center justify-center gap-2 text-stone-500 text-xs">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Pengarna stannar i din plånbok</span>
          </div>
        </div>

        {/* Total saved */}
        <div className="bg-gradient-to-r from-rose-600/20 to-rose-800/20 backdrop-blur-md rounded-2xl p-4 border border-rose-500/20 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-rose-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-left">
                <p className="text-stone-400 text-xs">Totalt sparat</p>
                <p className="text-white font-bold text-lg">{formatSEK(totalSaved)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-stone-400 text-xs">Beställningar</p>
              <p className="text-white font-bold text-lg">{ordersCount}</p>
            </div>
          </div>
        </div>

        {/* Donation prompt with slider */}
        {!donated ? (
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-5 border border-white/10 mb-6">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <Heart className="w-5 h-5 text-rose-400" />
              <p className="text-white font-bold text-base">Stäng utvecklarna?</p>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-5">
              Du sparade {formatSEK(savedAmount)} idag. Dra reglaget för att välja belopp —
              som ett tack för alla pengar du sparade.
            </p>

            {/* Slider */}
            <div className="mb-2">
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-rose-400 font-bold text-4xl">{donation}</span>
                <span className="text-stone-500 text-sm font-medium">kr</span>
              </div>

              <div className="relative px-1">
                <input
                  type="range"
                  min={MIN_DONATION}
                  max={MAX_DONATION}
                  step={5}
                  value={donation}
                  onChange={(e) => setDonation(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer slider-rose"
                  style={{
                    background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${
                      ((donation - MIN_DONATION) / (MAX_DONATION - MIN_DONATION)) * 100
                    }%, #44403c ${
                      ((donation - MIN_DONATION) / (MAX_DONATION - MIN_DONATION)) * 100
                    }%, #44403c 100%)`,
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-stone-500">
                  <span>{MIN_DONATION} kr</span>
                  <span>{MAX_DONATION} kr</span>
                </div>
              </div>
            </div>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2 mb-4 mt-4">
              {[10, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setDonation(amt)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    donation === amt
                      ? 'bg-rose-600 text-white shadow-lg'
                      : 'bg-white/10 text-stone-300 hover:bg-white/15'
                  }`}
                >
                  {amt} kr
                </button>
              ))}
            </div>

            <button
              onClick={handleDonate}
              className="w-full bg-rose-600 text-white rounded-2xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shadow-lg"
            >
              Donera {donation} kr <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoHome}
              className="w-full text-stone-500 text-sm font-medium mt-3 hover:text-stone-300 transition-colors"
            >
              Nej tack, jag sparar allt
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/10 backdrop-blur-md rounded-3xl p-5 border border-emerald-500/20 mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <Check className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-white font-bold text-base mb-1">Tack för ditt stöd!</p>
            <p className="text-stone-400 text-sm">
              Det här är också låtsas — inga riktiga pengar har dragits. Men tanken räknas!
              {donation >= 100 && (
                <span className="block mt-2 text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <Gift className="w-4 h-4" /> Du är en riktig hjälte!
                </span>
              )}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onGoHome}
          className="w-full bg-white text-stone-900 rounded-2xl py-4 font-bold text-base hover:bg-stone-100 transition-colors shadow-lg"
        >
          Beställ "igen" →
        </button>

        <p className="text-stone-600 text-xs mt-6 text-center">
          Spökkäk · gormin-studios · Beställ utan att beställa
        </p>
      </div>

      <style>{`
        .slider-rose::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #f43f5e;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        .slider-rose::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #f43f5e;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
