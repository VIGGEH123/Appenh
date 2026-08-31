import { useState, useRef, useCallback } from 'react';
import { ChevronLeft, Search, MapPin, Check, Crosshair, Loader as Loader2, CircleAlert as AlertCircle } from 'lucide-react';
import type { DeliveryLocation } from '@/types';
import { swedishLocations } from '@/data/locations';

interface LocationScreenProps {
  current: DeliveryLocation | null;
  onSelect: (loc: DeliveryLocation) => void;
  onBack: () => void;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
  };
}

export function LocationScreen({ current, onSelect, onBack }: LocationScreenProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DeliveryLocation[]>([]);
  const [searchError, setSearchError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredCities = swedishLocations.filter(
    (l) =>
      l.label.toLowerCase().includes(query.toLowerCase()) ||
      l.address.toLowerCase().includes(query.toLowerCase()),
  );

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setSearchResults([]);
      setSearchError(false);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setSearchError(false);
    setHasSearched(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=se&limit=8&q=${encodeURIComponent(q)}`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'sv' },
      });
      if (!res.ok) throw new Error('Search failed');
      const data: NominatimResult[] = await res.json();
      const results: DeliveryLocation[] = data.map((r, i) => {
        const addr = r.address;
        const street = addr?.road ? (addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road) : '';
        const city = addr?.city || addr?.town || addr?.village || addr?.municipality || '';
        const postcode = addr?.postcode || '';
        const shortLabel = street || city || r.display_name.split(',')[0] || `Plats ${i + 1}`;
        const fullAddress = [street, postcode, city].filter(Boolean).join(', ') || r.display_name;
        return {
          label: shortLabel,
          address: fullAddress,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
        };
      });
      setSearchResults(results);
    } catch {
      setSearchError(true);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    runSearch(query);
  };

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
        // fallback handled silently
      },
      { timeout: 5000 },
    );
  };

  const showingSearch = hasSearched && query.trim().length >= 3;

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
        <form onSubmit={handleSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Skriv en adress i Sverige..."
            className="w-full bg-white rounded-2xl pl-12 pr-12 py-3.5 text-sm text-stone-700 placeholder:text-stone-400 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {searching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-400 animate-spin" />
          )}
        </form>
        <p className="text-rose-100/70 text-xs mt-2">
          Sök på gatuadress, postnummer eller stad — över hela Sverige.
        </p>
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

      {/* Search results or city list */}
      <div className="px-5 mt-5">
        {showingSearch ? (
          <>
            <h2 className="text-stone-800 font-bold text-base mb-3">Sökresultat</h2>
            {searchError ? (
              <div className="text-center py-10">
                <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="text-stone-500 text-sm">Kunde inte söka just nu. Försök igen.</p>
              </div>
            ) : searching ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 text-rose-400 animate-spin mx-auto mb-2" />
                <p className="text-stone-500 text-sm">Söker adresser...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-stone-500 text-sm">Inga adresser hittades</p>
                <p className="text-stone-400 text-xs mt-1">Försök med en mer specifik adress</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((loc, i) => {
                  const isActive = current?.address === loc.address;
                  return (
                    <button
                      key={`${loc.lat}-${i}`}
                      onClick={() => onSelect(loc)}
                      className={`w-full bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-3 transition-all hover:shadow-md ${
                        isActive ? 'border-rose-400 ring-2 ring-rose-100' : 'border-stone-100 hover:border-rose-200'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-rose-500" />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="text-stone-800 font-bold text-sm truncate">{loc.label}</p>
                        <p className="text-stone-500 text-xs truncate">{loc.address}</p>
                      </div>
                      {isActive && (
                        <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="text-stone-800 font-bold text-base mb-3">Städer i Sverige</h2>
            <div className="space-y-2">
              {filteredCities.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-2">🗺️</div>
                  <p className="text-stone-500 text-sm">Inga platser hittades</p>
                </div>
              ) : (
                filteredCities.map((loc) => {
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
          </>
        )}
      </div>
    </div>
  );
}
