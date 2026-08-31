import { useState, useCallback } from 'react';
import type { Restaurant, CartItem, MenuItem, Screen, DeliveryLocation, CosmeticsItem } from '@/types';
import { useSession } from '@/hooks/useSession';
import { useCosmetics } from '@/hooks/useCosmetics';
import { swedishLocations } from '@/data/locations';
import { HomeScreen } from '@/screens/HomeScreen';
import { RestaurantScreen } from '@/screens/RestaurantScreen';
import { CartScreen } from '@/screens/CartScreen';
import { TrackingScreen } from '@/screens/TrackingScreen';
import { PreparingScreen } from '@/screens/PreparingScreen';
import { ResultScreen } from '@/screens/ResultScreen';
import { SplashScreen } from '@/screens/SplashScreen';
import { LocationScreen } from '@/screens/LocationScreen';
import { ShopScreen } from '@/screens/ShopScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [location, setLocation] = useState<DeliveryLocation>(swedishLocations[0]);
  const [aborted, setAborted] = useState(false);
  const { totalSaved, ordersCount, addSavings, recordOrder, resetSession } = useSession();
  const { cosmetics, selectVehicle, selectOutfit, grantOwnership } = useCosmetics();

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

  // Aborted delivery: still record savings, go to result screen first (donation),
  // then user goes home from there.
  const handleAbortDelivery = () => {
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

    setAborted(true);
    setScreen('result');
  };

  const handleGoHome = () => {
    setCart([]);
    setSelectedRestaurant(null);
    setAborted(false);
    setScreen('home');
  };

  const handleResetData = () => {
    resetSession();
    setScreen('home');
  };

  const handlePurchaseCosmetic = (item: CosmeticsItem) => {
    // Stripe is not yet configured for this project.
    // Real-money purchases require Stripe onboarding.
    // For now we show an alert directing to setup.
    if (item.price === 0) {
      grantOwnership(item.type, item.id);
      return;
    }
    alert(
      'Riktiga köp kräver Stripe-integration.\n\nFör att aktivera betalningar, koppla Stripe till projektet via https://bolt.new/setup/stripe',
    );
  };

  return (
    <div className="max-w-md mx-auto bg-stone-50 min-h-screen relative shadow-2xl">
      {screen === 'splash' && <SplashScreen onContinue={() => setScreen('home')} />}

      {screen === 'home' && (
        <HomeScreen
          onSelectRestaurant={handleSelectRestaurant}
          totalSaved={totalSaved}
          location={location}
          onChangeLocation={() => setScreen('location')}
          onOpenSettings={() => setScreen('settings')}
          onOpenShop={() => setScreen('shop')}
        />
      )}

      {screen === 'location' && (
        <LocationScreen
          current={location}
          onSelect={(loc) => {
            setLocation(loc);
            setScreen('home');
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'shop' && (
        <ShopScreen
          cosmetics={cosmetics}
          onSelectVehicle={selectVehicle}
          onSelectOutfit={selectOutfit}
          onPurchase={handlePurchaseCosmetic}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          totalSaved={totalSaved}
          ordersCount={ordersCount}
          onResetData={handleResetData}
          onOpenShop={() => setScreen('shop')}
          onBack={() => setScreen('home')}
        />
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
          location={location}
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
          location={location}
          cosmetics={cosmetics}
          onArrive={handleArrive}
          onAbort={handleAbortDelivery}
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
