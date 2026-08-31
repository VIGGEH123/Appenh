import { useState, useCallback } from 'react';
import type { Restaurant, CartItem, MenuItem, Screen } from '@/types';
import { useSession } from '@/hooks/useSession';
import { HomeScreen } from '@/screens/HomeScreen';
import { RestaurantScreen } from '@/screens/RestaurantScreen';
import { CartScreen } from '@/screens/CartScreen';
import { TrackingScreen } from '@/screens/TrackingScreen';
import { PreparingScreen } from '@/screens/PreparingScreen';
import { ResultScreen } from '@/screens/ResultScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const { totalSaved, ordersCount, addSavings, recordOrder } = useSession();

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setScreen('restaurant');
  };

  const handleAddToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const handleRemoveFromCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (!existing) return prev;
      if (existing.quantity === 1) {
        return prev.filter((ci) => ci.item.id !== item.id);
      }
      return prev.map((ci) =>
        ci.item.id === item.id ? { ...ci, quantity: ci.quantity - 1 } : ci,
      );
    });
  }, []);

  const handleRemoveAll = useCallback((item: MenuItem) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== item.id));
  }, []);

  const handleCheckout = () => {
    if (!selectedRestaurant) return;
    const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + selectedRestaurant.deliveryFee + serviceFee;
    setLastOrderTotal(total);
    setScreen('preparing');
  };

  const handleArrive = () => {
    if (!selectedRestaurant) return;
    const subtotal = cart.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0);
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + selectedRestaurant.deliveryFee + serviceFee;

    addSavings(total);
    recordOrder({
      restaurantName: selectedRestaurant.name,
      items: cart.map((ci) => ({
        name: ci.item.name,
        price: ci.item.price,
        quantity: ci.quantity,
      })),
      subtotal,
      deliveryFee: selectedRestaurant.deliveryFee,
      total,
    });

    setScreen('result');
  };

  const handleGoHome = () => {
    setCart([]);
    setSelectedRestaurant(null);
    setScreen('home');
  };

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen relative shadow-2xl">
      {screen === 'home' && (
        <HomeScreen onSelectRestaurant={handleSelectRestaurant} totalSaved={totalSaved} />
      )}

      {screen === 'restaurant' && selectedRestaurant && (
        <RestaurantScreen
          restaurant={selectedRestaurant}
          cart={cart}
          onBack={() => setScreen('home')}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onGoToCart={() => setScreen('cart')}
        />
      )}

      {screen === 'cart' && selectedRestaurant && (
        <CartScreen
          restaurant={selectedRestaurant}
          cart={cart}
          onBack={() => setScreen('restaurant')}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onRemoveAll={handleRemoveAll}
          onCheckout={handleCheckout}
        />
      )}

      {screen === 'preparing' && selectedRestaurant && (
        <PreparingScreen
          restaurant={selectedRestaurant}
          cart={cart}
          total={lastOrderTotal}
          onDone={() => setScreen('tracking')}
        />
      )}

      {screen === 'tracking' && selectedRestaurant && (
        <TrackingScreen
          restaurant={selectedRestaurant}
          cart={cart}
          total={lastOrderTotal}
          onArrive={handleArrive}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          savedAmount={lastOrderTotal}
          totalSaved={totalSaved}
          ordersCount={ordersCount}
          onGoHome={handleGoHome}
        />
      )}
    </div>
  );
}
