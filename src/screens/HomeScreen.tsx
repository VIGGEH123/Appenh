import { useState, useMemo } from 'react';
import { Star, Clock, Bike, Search, TrendingUp, MapPin, Utensils, Settings, Sparkles, ChevronRight } from 'lucide-react';
import type { Restaurant, DeliveryLocation } from '@/types';
import { restaurants, categories } from '@/data/restaurants';
import { formatSEK } from '@/lib/format';

interface HomeScreenProps {
  onSelectRestaurant: (restaurant: Restaurant) => void;
  totalSaved: number;
  location: DeliveryLocation | null;
  onChangeLocation: () => void;
  onOpenSettings: () => void;
  onOpenShop: () => void;
}

const cuisineToCategory: Record<string, string> = {
  'Koreansk': 'korean',
  'Italiensk': 'italian',
  'Japansk': 'japanese',
  'Amerikansk': 'american',
  'Thailändsk': 'thai',
  'Indisk': 'indian',
  'Mexikansk': 'mexican',
  'Hälsosam': 'healthy',
  'Dessert': 'dessert',
  'Frukost': 'breakfast',
  'Dryck': 'drinks',
};

export function HomeScreen({
  onSelectRestaurant,
  totalSaved,
  location,
  onChangeLocation,
  onOpenSettings,
  onOpenShop,
}: HomeScreenProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRestaurants = useMemo(() => {
    let result = restaurants;
    if (activeCategory !== 'all') {
      result = result.filter((r) => cuisineToCategory[r.cuisine] === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onChangeLocation}
            className="flex-1 text-left"
          >
            <p className="text-rose-100 text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Leverera till
            </p>
            <p className="text-white font-bold text-base flex items-center gap-1 mt-0.5">
              {location ? location.label : 'Välj plats'}
              <ChevronRight className="w-4 h-4 text-rose-200" />
            </p>
            {location && (
              <p className="text-rose-100/80 text-xs mt-0.5 truncate">{location.address}</p>
            )}
          </button>
          <div className="flex gap-2">
            <button
              onClick={onOpenShop}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onOpenSettings}
              className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Savings badge */}
        {totalSaved > 0 && (
          <div className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-emerald-400/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <p className="text-rose-50 text-xs">Du har sparat hittills</p>
              <p className="text-white font-bold text-lg leading-tight">{formatSEK(totalSaved)}</p>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sök restaurang eller mat..."
            className="w-full bg-white rounded-2xl pl-12 pr-4 py-3.5 text-sm text-stone-700 placeholder:text-stone-400 shadow-md focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mt-6">
        <h2 className="text-stone-800 font-bold text-lg mb-3">Kategorier</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 flex flex-col items-center gap-2 rounded-2xl px-4 py-3 shadow-sm border transition-all min-w-[80px] ${
                activeCategory === cat.id
                  ? 'bg-rose-600 border-rose-600'
                  : 'bg-white border-stone-100 hover:border-rose-300 hover:shadow-md'
              }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span
                className={`text-xs font-medium ${
                  activeCategory === cat.id ? 'text-white' : 'text-stone-600'
                }`}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="px-5 mt-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-800 to-stone-900 p-5">
          <div className="relative z-10">
            <p className="text-rose-400 text-xs font-bold tracking-wider uppercase mb-1">Spökkäk Special</p>
            <p className="text-white font-bold text-lg leading-snug">
              Beställ utan att beställa.<br />Spara pengar, få kick.
            </p>
          </div>
          <div className="absolute right-2 bottom-0 text-6xl opacity-20">🍜</div>
        </div>
      </div>

      {/* Bud shop shortcut */}
      <div className="px-5 mt-4">
        <button
          onClick={onOpenShop}
          className="w-full bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-4 flex items-center gap-3 border border-rose-100 hover:shadow-md transition-all"
        >
          <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-left flex-1">
            <p className="text-stone-800 font-bold text-sm">Designa din cyklist</p>
            <p className="text-stone-500 text-xs">Fordon, kläder & kosmetika i bud-butiken</p>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </button>
      </div>

      {/* Restaurants */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-stone-800 font-bold text-lg">
            {activeCategory === 'all'
              ? 'Populära restauranger'
              : `${categories.find((c) => c.id === activeCategory)?.label} restauranger`}
          </h2>
          <span className="text-stone-400 text-sm font-medium">
            {filteredRestaurants.length} st
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-stone-500 text-sm">Inga restauranger hittades</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => onSelectRestaurant(restaurant)}
                className="block w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-lg hover:border-rose-200 transition-all"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-stone-800 text-xs font-bold">{restaurant.rating}</span>
                    <span className="text-stone-400 text-xs">({restaurant.reviews})</span>
                  </div>
                  {restaurant.deliveryFee === 0 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 rounded-full px-2.5 py-1 shadow-sm">
                      <span className="text-white text-xs font-bold">Gratis leverans</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <span className="text-white text-lg font-bold drop-shadow-lg">{restaurant.cuisine}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-stone-800 font-bold text-base">{restaurant.name}</h3>
                  <p className="text-stone-500 text-sm mt-0.5">{restaurant.cuisine}</p>
                  <div className="flex items-center gap-4 mt-3 text-stone-500">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-rose-500" />
                      {restaurant.deliveryTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm">
                      <Bike className="w-4 h-4 text-rose-500" />
                      {restaurant.deliveryFee === 0 ? 'Gratis' : formatSEK(restaurant.deliveryFee)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {restaurant.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer + disclaimer */}
      <div className="px-5 mt-8 text-center">
        <p className="text-stone-400 text-xs">
          Spökkäk · gormin-studios · Beställ utan att beställa
        </p>
        <p className="text-stone-400/70 text-[10px] mt-2 leading-relaxed px-4">
          Denna app är endast avsedd för underhållningssyfte. Alla restauranger, produkter,
          beställningar och pengar är på låtsas. Inga riktiga köp eller leveranser görs
          (förutom valfria kosmetiska köp).
        </p>
      </div>
    </div>
  );
}
