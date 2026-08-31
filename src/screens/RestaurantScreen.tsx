import { useState, useMemo } from 'react';
import { ChevronLeft, Star, Clock, Bike, Plus, Minus, Heart } from 'lucide-react';
import type { Restaurant, CartItem, MenuItem } from '@/types';
import { formatSEK } from '@/lib/format';

interface RestaurantScreenProps {
  restaurant: Restaurant;
  cart: CartItem[];
  onBack: () => void;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onGoToCart: () => void;
}

export function RestaurantScreen({
  restaurant,
  cart,
  onBack,
  onAddToCart,
  onRemoveFromCart,
  onGoToCart,
}: RestaurantScreenProps) {
  const [activeCategory, setActiveCategory] = useState('Allt');
  const [liked, setLiked] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(restaurant.menu.map((m) => m.category));
    return ['Allt', ...Array.from(cats)];
  }, [restaurant]);

  const filteredMenu = useMemo(() => {
    if (activeCategory === 'Allt') return restaurant.menu;
    return restaurant.menu.filter((m) => m.category === activeCategory);
  }, [restaurant, activeCategory]);

  const cartCount = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);

  const getQty = (item: MenuItem) =>
    cart.find((ci) => ci.item.id === item.id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-stone-50 pb-28">
      {/* Hero image */}
      <div className="relative h-56 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        <button
          onClick={onBack}
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </button>
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : 'text-stone-800'}`} />
        </button>
        <div className="absolute bottom-4 left-4">
          <h1 className="text-white text-2xl font-bold drop-shadow-lg">{restaurant.name}</h1>
          <p className="text-white/80 text-sm font-medium drop-shadow-lg mt-0.5">{restaurant.cuisine}</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white -mt-6 rounded-t-3xl relative px-5 pt-5 pb-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-stone-800 text-sm font-bold">{restaurant.rating}</span>
            <span className="text-stone-400 text-sm">({restaurant.reviews} omdömen)</span>
          </span>
          <span className="flex items-center gap-1.5 text-stone-500 text-sm">
            <Clock className="w-4 h-4 text-rose-500" /> {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1.5 text-stone-500 text-sm">
            <Bike className="w-4 h-4 text-rose-500" />
            {restaurant.deliveryFee === 0 ? 'Gratis leverans' : formatSEK(restaurant.deliveryFee)}
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-0 z-20 bg-stone-50 pt-3 pb-2 px-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white text-stone-500 border border-stone-200 hover:border-rose-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-5 mt-2 space-y-3">
        {filteredMenu.map((item) => {
          const qty = getQty(item);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4"
            >
              <div className="flex-1">
                {item.popular && (
                  <span className="inline-block text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mb-1.5">
                    Populär
                  </span>
                )}
                <h3 className="text-stone-800 font-bold text-base">{item.name}</h3>
                <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">{item.description}</p>
                <p className="text-stone-800 font-bold text-base mt-2">{formatSEK(item.price)}</p>
              </div>
              <div className="relative w-24 h-24 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
                {qty === 0 ? (
                  <button
                    onClick={() => onAddToCart(item)}
                    className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-white rounded-full shadow-lg p-0.5">
                    <button
                      onClick={() => onRemoveFromCart(item)}
                      className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-stone-800 font-bold text-sm w-5 text-center">{qty}</span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4">
          <button
            onClick={onGoToCart}
            className="w-full bg-rose-600 text-white rounded-2xl py-4 px-5 flex items-center justify-between shadow-2xl hover:bg-rose-700 transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="bg-white/25 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                {cartCount}
              </span>
              <span className="font-bold">Varukorg</span>
            </span>
            <span className="font-bold">{formatSEK(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
