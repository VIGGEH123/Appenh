import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bike, Clock, MapPin, Navigation, Star, Bike as BikeIcon } from 'lucide-react';
import type { CartItem, Restaurant } from '@/types';
import { formatSEK } from '@/lib/format';

interface TrackingScreenProps {
  restaurant: Restaurant;
  cart: CartItem[];
  total: number;
  onArrive: () => void;
}

type Phase = 'picked_up' | 'on_the_way' | 'nearby' | 'arrived';

const phaseLabels: Record<Phase, string> = {
  picked_up: 'Budet har hämtat din mat',
  on_the_way: 'Din mat är på väg!',
  nearby: 'Budet är nära dig',
  arrived: 'Budet har anlänt',
};

const phaseSteps: { phase: Phase; label: string }[] = [
  { phase: 'picked_up', label: 'Hämtad' },
  { phase: 'on_the_way', label: 'På väg' },
  { phase: 'nearby', label: 'Nära' },
  { phase: 'arrived', label: 'Levererad' },
];

const DEFAULT_LOCATION: [number, number] = [59.3293, 18.0686]; // Stockholm

function createBikeIcon() {
  return L.divIcon({
    html: `<div style="background: #f43f5e; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-2l3 6h-4l-2-4"/><path d="M3 17.5L7 9l4 4 3-5 4 9.5"/>
      </svg>
    </div>`,
    className: 'courier-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

function createRestaurantIcon() {
  return L.divIcon({
    html: `<div style="background: #1c1917; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #f43f5e; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 16px;">🍴</div>`,
    className: 'restaurant-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function createHomeIcon() {
  return L.divIcon({
    html: `<div style="background: #1c1917; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid #10b981; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
      <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
    </div>`,
    className: 'home-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function TrackingScreen({ restaurant, cart, total, onArrive }: TrackingScreenProps) {
  const [phase, setPhase] = useState<Phase>('picked_up');
  const [progress, setProgress] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_LOCATION);
  const [restaurantLoc, setRestaurantLoc] = useState<[number, number] | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const arrivedRef = useRef(false);

  // Get user's real location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        setUserLocation(DEFAULT_LOCATION);
      },
      { timeout: 5000 },
    );
  }, []);

  // Pick a random restaurant location near the user
  useEffect(() => {
    const offset = () => (Math.random() - 0.5) * 0.02;
    setRestaurantLoc([userLocation[0] + offset(), userLocation[1] + offset()]);
  }, [userLocation]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: true,
    }).setView(userLocation, 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when locations are ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !restaurantLoc) return;

    map.setView(userLocation, 14);

    // Home marker
    L.marker(userLocation, { icon: createHomeIcon() }).addTo(map);

    // Restaurant marker
    L.marker(restaurantLoc, { icon: createRestaurantIcon() }).addTo(map);

    // Route line
    const route: L.LatLngExpression[] = [restaurantLoc, userLocation];
    routeLineRef.current = L.polyline(route, {
      color: '#f43f5e',
      weight: 3,
      opacity: 0.6,
      dashArray: '8, 8',
    }).addTo(map);

    // Courier marker at restaurant
    courierMarkerRef.current = L.marker(restaurantLoc, { icon: createBikeIcon() }).addTo(map);

    // Fit bounds
    map.fitBounds(L.latLngBounds([restaurantLoc, userLocation]).pad(0.2));
  }, [restaurantLoc, userLocation]);

  // Animate courier + progress
  useEffect(() => {
    if (!restaurantLoc) return;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          if (timerRef.current) clearInterval(timerRef.current);
          setPhase('arrived');
          if (!arrivedRef.current) {
            arrivedRef.current = true;
            setTimeout(() => onArrive(), 1500);
          }
          return 100;
        }
        if (next < 20) setPhase('picked_up');
        else if (next < 60) setPhase('on_the_way');
        else if (next < 95) setPhase('nearby');
        else setPhase('arrived');
        return next;
      });
    }, 800);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restaurantLoc, onArrive]);

  // Move courier marker
  useEffect(() => {
    if (!courierMarkerRef.current || !restaurantLoc) return;
    const t = progress / 100;
    const lat = restaurantLoc[0] + (userLocation[0] - restaurantLoc[0]) * t;
    const lng = restaurantLoc[1] + (userLocation[1] - restaurantLoc[1]) * t;
    courierMarkerRef.current.setLatLng([lat, lng]);
  }, [progress, restaurantLoc, userLocation]);

  useEffect(() => {
    setSecondsLeft(Math.max(0, Math.ceil((100 - progress) * 0.6)));
  }, [progress]);

  const currentStepIndex = phaseSteps.findIndex((s) => s.phase === phase);

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Map area */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: '50vh' }}>
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Top overlay info */}
        <div className="absolute top-12 left-0 right-0 px-5 z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-stone-800 font-bold text-sm">
                  {phase === 'arrived' ? 'Levererad!' : `Ca ${secondsLeft} min kvar`}
                </p>
                <p className="text-stone-500 text-xs">{phaseLabels[phase]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-stone-400 text-xs">Beställt för</p>
              <p className="text-stone-800 font-bold text-sm">{formatSEK(total)}</p>
            </div>
          </div>
        </div>

        {/* Courier card */}
        {phase !== 'arrived' && (
          <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white">
                <BikeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-stone-800 font-bold text-sm">Alex är din bud</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-stone-600 text-xs font-medium">4.9 · Scooter</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tracking panel */}
      <div className="bg-white rounded-t-3xl px-5 pt-5 pb-6 shadow-2xl">
        <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-5" />

        <h2 className="text-stone-800 font-bold text-lg mb-1">{phaseLabels[phase]}</h2>
        <p className="text-stone-500 text-sm mb-5">
          {restaurant.name} · {restaurant.deliveryTime}
        </p>

        {/* Progress steps */}
        <div className="flex items-center justify-between mb-6">
          {phaseSteps.map((step, i) => {
            const isDone = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.phase} className="flex flex-col items-center flex-1 relative">
                {i < phaseSteps.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 ${
                      i < currentStepIndex ? 'bg-rose-500' : 'bg-stone-200'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? isCurrent
                        ? 'bg-rose-600 ring-4 ring-rose-100'
                        : 'bg-rose-500'
                      : 'bg-stone-200'
                  }`}
                >
                  {isDone && <span className="text-white text-xs font-bold">✓</span>}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    isDone ? 'text-stone-800' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="bg-stone-50 rounded-2xl p-4">
          <p className="text-stone-500 text-xs font-medium mb-2">Din beställning</p>
          <div className="space-y-1.5">
            {cart.map((ci) => (
              <div key={ci.item.id} className="flex justify-between text-sm">
                <span className="text-stone-700">
                  {ci.quantity}× {ci.item.name}
                </span>
                <span className="text-stone-500">{formatSEK(ci.item.price * ci.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {phase === 'arrived' && (
          <div className="mt-4 text-center animate-pulse">
            <MapPin className="w-6 h-6 text-rose-500 mx-auto mb-1" />
            <p className="text-stone-600 text-sm">Budet står utanför din dörr...</p>
          </div>
        )}
      </div>
    </div>
  );
}
