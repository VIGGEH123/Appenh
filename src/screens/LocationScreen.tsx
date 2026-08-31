import { useState } from 'react';
import { ChevronLeft, Search, MapPin, Check, Crosshair } from 'lucide-react';
import type { DeliveryLocation } from '@/types';
import { swedishLocations } from '@/data/locations';

interface LocationScreenProps {
  current: DeliveryLocation | null;
  onSelect: (loc: DeliveryLocation) => void;
  onBack: () => void;
}

export function LocationScreen({ current, onSelect, onBack }: LocationScreenProps) {
  const [query, setQuery] = useState('');

  const filtered = swedishLocations.filter(
    (l) =>
      l.label.toLowerCase().includes(query.toLowerCase()) ||
      l.address.toLowerCase().includes(query.toLowerCase()),
  );

  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSelect({
          label: 'Min position',
          address: 'Nuvarande plats (GPS)',
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        // fallback handled silently — user can pick manually
      },
      { timeout: 5000 },
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-700 px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white font-bold text-xl">Välj leveransplats</h1>
        </div>
        <p className="text-rose-100 text-sm mb-4">
          Var i Sverige vill du få din (påhittade) mat levererad?
        </p>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök stad eller adress..."
            className="w-full bg-white rounded-2xl pl-12 pr-4 py-3.5 text-sm text-stone-700 placeholder:text-stone-400 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* GPS option */}
      <div className="px-5 mt-5">
        <button
          onClick={handleUseGPS}
          className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center gap-3 hover:border-rose-200 hover:shadow-md transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Crosshair className="w-5 h-5 text-rose-600" />
          </div>
          <div className="text-left flex-1">
            <p className="text-stone-800 font-bold text-sm">Använd min position</p>
            <p className="text-stone-500 text-xs">Hitta mig via GPS</p>
          </div>
        </button>
      </div>

      {/* City list */}
      <div className="px-5 mt-5">
        <h2 className="text-stone-800 font-bold text-base mb-3">Städer i Sverige</h2>
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-stone-500 text-sm">Inga platser hittades</p>
            </div>
          ) : (
            filtered.map((loc) => {
              const isActive = current?.label === loc.label;
              return (
                <button
                  key={loc.label}
                  onClick={() => onSelect(loc)}
                  className={`w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 transition-all hover:shadow-md ${
                    isActive ? 'border-rose-400 ring-2 ring-rose-100' : 'border-stone-100 hover:border-rose-200'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-stone-800 font-bold text-sm">{loc.label}</p>
                    <p className="text-stone-500 text-xs">{loc.address}</p>
                  </div>
                  {isActive && (
                    <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
