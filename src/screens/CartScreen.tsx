import { ChevronLeft, Plus, Minus, Trash2, Bike, Tag, CreditCard } from 'lucide-react';
import type { CartItem, MenuItem, Restaurant } from '@/types';
import { formatSEK } from '@/lib/format';

interface CartScreenProps {
  restaurant: Restaurant;
  cart: CartItem[];
  onBack: () => void;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onRemoveAll: (item: MenuItem) => void;
  onCheckout: () => void;
}

export function CartScreen({
  restaurant,
  cart,
  onBack,
  onAddToCart,
  onRemoveFromCart,
  onRemoveAll,
  onCheckout,
}: CartScreenProps) {
  const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
  const deliveryFee = restaurant.deliveryFee;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + serviceFee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-8 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-stone-800 font-bold text-xl mb-2">Varukorgen är tom</h2>
        <p className="text-stone-500 text-sm mb-6">Lägg till några rätter för att komma igång!</p>
        <button
          onClick={onBack}
          className="bg-rose-600 text-white rounded-2xl px-8 py-3 font-bold hover:bg-rose-700 transition-colors"
        >
          Tillbaka till menyn
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-32">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-stone-800" />
        </button>
        <div>
          <h1 className="text-stone-800 font-bold text-lg">Varukorg</h1>
          <p className="text-stone-500 text-sm">{restaurant.name}</p>
        </div>
      </div>

      {/* Delivery address */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
              <Bike className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <p className="text-stone-800 font-bold text-sm">Levereras till</p>
              <p className="text-stone-500 text-sm mt-0.5">Drottninggatan 12, 111 51 Stockholm</p>
              <p className="text-rose-600 text-xs font-medium mt-1">Levereras om {restaurant.deliveryTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart items */}
      <div className="px-5 mt-4">
        <h2 className="text-stone-800 font-bold text-base mb-3">Dina rätter</h2>
        <div className="space-y-3">
          {cart.map((ci) => (
            <div
              key={ci.item.id}
              className="bg-white rounded-2xl p-3 shadow-sm border border-stone-100 flex gap-3 items-center"
            >
              <img src={ci.item.image} alt={ci.item.name} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="text-stone-800 font-bold text-sm">{ci.item.name}</h3>
                <p className="text-stone-800 font-bold text-sm mt-1">{formatSEK(ci.item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onRemoveFromCart(ci.item)}
                  className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-stone-800 font-bold text-sm w-6 text-center">{ci.quantity}</span>
                <button
                  onClick={() => onAddToCart(ci.item)}
                  className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onRemoveAll(ci.item)}
                  className="w-8 h-8 rounded-full bg-stone-50 text-stone-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-colors ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo code */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center gap-3">
          <Tag className="w-5 h-5 text-stone-400" />
          <input
            type="text"
            placeholder="Lägg till rabattkod"
            className="flex-1 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
          />
          <button className="text-rose-600 text-sm font-bold">Använd</button>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Delsumma</span>
            <span className="text-stone-800 font-medium">{formatSEK(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Leveransavgift</span>
            <span className="text-stone-800 font-medium">
              {deliveryFee === 0 ? 'Gratis' : formatSEK(deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-stone-500">Serviceavgift (5%)</span>
            <span className="text-stone-800 font-medium">{formatSEK(serviceFee)}</span>
          </div>
          <div className="border-t border-stone-100 pt-2.5 flex justify-between">
            <span className="text-stone-800 font-bold">Totalt</span>
            <span className="text-rose-600 font-bold text-lg">{formatSEK(total)}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-stone-400" />
          <span className="text-sm text-stone-600 flex-1">Falskt kort · •••• 4242</span>
          <span className="text-stone-400 text-sm">Ändra</span>
        </div>
      </div>

      {/* Checkout bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-stone-50 to-transparent">
        <button
          onClick={onCheckout}
          className="w-full bg-rose-600 text-white rounded-2xl py-4 px-5 flex items-center justify-between shadow-2xl hover:bg-rose-700 transition-colors"
        >
          <span className="font-bold text-base">Beställ för {formatSEK(total)}</span>
          <span className="font-medium text-sm text-white/80">Falsk betalning →</span>
        </button>
      </div>
    </div>
  );
}
