import { useState } from 'react';
import { ChevronLeft, Check, Lock, Bike, Shirt, Sparkles, Info } from 'lucide-react';
import type { CosmeticsState, CosmeticsItem } from '@/types';
import { cosmeticsItems } from '@/data/cosmetics';
import { formatSEK } from '@/lib/format';

interface ShopScreenProps {
  cosmetics: CosmeticsState;
  onSelectVehicle: (id: string) => void;
  onSelectOutfit: (id: string) => void;
  onPurchase: (item: CosmeticsItem) => void;
  onBack: () => void;
}

export function ShopScreen({
  cosmetics,
  onSelectVehicle,
  onSelectOutfit,
  onPurchase,
  onBack,
}: ShopScreenProps) {
  const [tab, setTab] = useState<'vehicle' | 'outfit'>('vehicle');

  const vehicles = cosmeticsItems.filter((c) => c.type === 'vehicle');
  const outfits = cosmeticsItems.filter((c) => c.type === 'outfit');
  const list = tab === 'vehicle' ? vehicles : outfits;

  const isOwned = (item: CosmeticsItem) =>
    item.type === 'vehicle'
      ? cosmetics.ownedVehicleIds.includes(item.id)
      : cosmetics.ownedOutfitIds.includes(item.id);

  const isSelected = (item: CosmeticsItem) =>
    item.type === 'vehicle'
      ? cosmetics.selectedVehicleId === item.id
      : cosmetics.selectedOutfitId === item.id;

  return (
    <div className="min-h-screen bg-stone-50 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-400" /> Bud-butiken
            </h1>
            <p className="text-stone-400 text-xs">Designa din cyklist</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-black/30 rounded-2xl p-1">
          <button
            onClick={() => setTab('vehicle')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'vehicle' ? 'bg-rose-600 text-white shadow-lg' : 'text-stone-400'
            }`}
          >
            <Bike className="w-4 h-4" /> Fordon
          </button>
          <button
            onClick={() => setTab('outfit')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              tab === 'outfit' ? 'bg-rose-600 text-white shadow-lg' : 'text-stone-400'
            }`}
          >
            <Shirt className="w-4 h-4" /> Kläder
          </button>
        </div>
      </div>

      {/* Real-money notice */}
      <div className="px-5 mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-xs leading-relaxed">
            Kosmetiska köp görs för <span className="font-bold">riktiga pengar</span> via Stripe.
            Standardalternativen är gratis. Valda kosmetika visas på kartan under leverans.
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="px-5 mt-4 space-y-3">
        {list.map((item) => {
          const owned = isOwned(item);
          const selected = isSelected(item);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 shadow-sm border flex items-center gap-4 transition-all ${
                selected ? 'border-rose-400 ring-2 ring-rose-100' : 'border-stone-100'
              }`}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ backgroundColor: item.previewColor + '22' }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-stone-800 font-bold text-sm">{item.name}</h3>
                <p className="text-stone-500 text-xs mt-0.5 leading-relaxed">{item.description}</p>
                <div className="mt-2">
                  {owned ? (
                    selected ? (
                      <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-bold bg-rose-50 px-2.5 py-1 rounded-full">
                        <Check className="w-3 h-3" /> Vald
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          item.type === 'vehicle' ? onSelectVehicle(item.id) : onSelectOutfit(item.id)
                        }
                        className="text-stone-600 text-xs font-bold bg-stone-100 px-3 py-1.5 rounded-full hover:bg-stone-200 transition-colors"
                      >
                        Välj
                      </button>
                    )
                  ) : item.price === 0 ? (
                    <button
                      onClick={() =>
                        item.type === 'vehicle' ? onSelectVehicle(item.id) : onSelectOutfit(item.id)
                      }
                      className="text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors"
                    >
                      Gratis — välj
                    </button>
                  ) : (
                    <button
                      onClick={() => onPurchase(item)}
                      className="inline-flex items-center gap-1.5 text-white text-xs font-bold bg-rose-600 px-3 py-1.5 rounded-full hover:bg-rose-700 transition-colors"
                    >
                      <Lock className="w-3 h-3" /> Köp {formatSEK(item.price)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-stone-400 text-xs text-center mt-8 px-8 leading-relaxed">
        Köp är säkra och hanteras via Stripe. Kosmetika påverkar bara hur budet ser ut — inte leveransen.
      </p>
    </div>
  );
}
