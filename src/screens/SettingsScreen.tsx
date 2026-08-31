import { useState } from 'react';
import { ChevronLeft, Trash2, TriangleAlert as AlertTriangle, Bike, Wallet, TrendingUp, X } from 'lucide-react';
import { formatSEK } from '@/lib/format';

interface SettingsScreenProps {
  totalSaved: number;
  ordersCount: number;
  onResetData: () => void;
  onOpenShop: () => void;
  onBack: () => void;
}

export function SettingsScreen({
  totalSaved,
  ordersCount,
  onResetData,
  onOpenShop,
  onBack,
}: SettingsScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetStep, setResetStep] = useState(0);

  const handleConfirmReset = () => {
    if (resetStep === 0) {
      setResetStep(1);
    } else {
      onResetData();
      setConfirmOpen(false);
      setResetStep(0);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </button>
        <h1 className="text-stone-800 font-bold text-lg">Inställningar</h1>
      </div>

      {/* Stats */}
      <div className="px-5 mt-5">
        <h2 className="text-stone-800 font-bold text-base mb-3">Din statistik</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-stone-500 text-xs">Totalt sparat</p>
            <p className="text-stone-800 font-bold text-lg">{formatSEK(totalSaved)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
            </div>
            <p className="text-stone-500 text-xs">Beställningar</p>
            <p className="text-stone-800 font-bold text-lg">{ordersCount}</p>
          </div>
        </div>
      </div>

      {/* Bud shop link */}
      <div className="px-5 mt-5">
        <button
          onClick={onOpenShop}
          className="w-full bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Bike className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Bud-butiken</p>
            <p className="text-stone-400 text-xs">Designa din cyklist med fordon & kläder</p>
          </div>
          <span className="text-stone-500 text-sm">→</span>
        </button>
      </div>

      {/* Danger zone */}
      <div className="px-5 mt-6">
        <h2 className="text-stone-800 font-bold text-base mb-3">Farlig zon</h2>
        <button
          onClick={() => {
            setConfirmOpen(true);
            setResetStep(0);
          }}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-red-200 flex items-center gap-3 hover:border-red-400 transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-left flex-1">
            <p className="text-red-600 font-bold text-sm">Radera sparade pengar</p>
            <p className="text-stone-500 text-xs">Nollställ all data — kan inte ångras</p>
          </div>
        </button>
      </div>

      {/* About */}
      <div className="px-5 mt-8">
        <h2 className="text-stone-800 font-bold text-base mb-3">Om appen</h2>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <p className="text-stone-700 text-sm font-bold mb-1">Spökkäk</p>
          <p className="text-stone-500 text-xs leading-relaxed">
            Presenteras av gormin-studios. En underhållningsapp som låter dig uppleva
            dopaminkicken av att beställa mat — utan att spendera riktiga pengar.
            Alla restauranger, produkter och beställningar är på låtsas.
          </p>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setConfirmOpen(false);
                  setResetStep(0);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
              >
                <X className="w-4 h-4 text-stone-600" />
              </button>
            </div>

            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 -mt-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            {resetStep === 0 ? (
              <>
                <h2 className="text-stone-800 font-bold text-lg text-center mb-2">
                  Radera all data?
                </h2>
                <p className="text-stone-500 text-sm text-center leading-relaxed mb-6">
                  Du kommer att förlora <span className="font-bold text-red-600">{formatSEK(totalSaved)}</span> i
                  sparade pengar och {ordersCount} beställningar. <br />
                  <span className="font-bold">All din data går förlorad och kan inte återskapas.</span>
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleConfirmReset}
                    className="w-full bg-red-600 text-white rounded-2xl py-3.5 font-bold hover:bg-red-700 transition-colors"
                  >
                    Fortsätt
                  </button>
                  <button
                    onClick={() => {
                      setConfirmOpen(false);
                      setResetStep(0);
                    }}
                    className="w-full text-stone-600 text-sm font-medium py-2 hover:text-stone-800 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-red-700 font-bold text-lg text-center mb-2">
                  Är du helt säker?
                </h2>
                <p className="text-stone-500 text-sm text-center leading-relaxed mb-6">
                  Detta är din sista varning. När du trycker radera är allt borta för alltid —
                  dina sparade pengar, din statistik och din beställningshistorik.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleConfirmReset}
                    className="w-full bg-red-600 text-white rounded-2xl py-3.5 font-bold hover:bg-red-700 transition-colors"
                  >
                    Ja, radera allt
                  </button>
                  <button
                    onClick={() => {
                      setConfirmOpen(false);
                      setResetStep(0);
                    }}
                    className="w-full text-stone-600 text-sm font-medium py-2 hover:text-stone-800 transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
