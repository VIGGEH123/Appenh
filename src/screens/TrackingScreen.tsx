import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bike, Clock, MapPin, Navigation, Star, Settings2, X, FastForward, Ban, Gauge } from 'lucide-react';
import type { CartItem, Restaurant, CosmeticsItem } from '@/types';
import { formatSEK } from '@/lib/format';
import { sendNotification, requestNotificationPermission } from '@/lib/notifications';
import { cosmeticsItems } from '@/data/cosmetics';

interface TrackingScreenProps {
  restaurant: Restaurant;
  cart: CartItem[];
  total: number;
  location: { label: string; address: string; lat: number; lng: number };
  cosmetics: { selectedVehicleId: string; selectedOutfitId: string };
  onArrive: () => void;
  onAbort: () => void;
}

type Phase = 'picked_up' | 'on_the_way' | 'nearby' | 'arrived';
type SpeedMode = '1x' | '2x' | '5x' | '10x';

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

const speedModes: { mode: SpeedMode; label: string }[] = [
  { mode: '1x', label: 'Normal' },
  { mode: '2x', label: '2×' },
  { mode: '5x', label: '5×' },
  { mode: '10x', label: '10×' },
];

function getVehicleEmoji(id: string): string {
  const item = cosmeticsItems.find((c) => c.id === id && c.type === 'vehicle');
  return item?.emoji || '🚲';
}

function getOutfitEmoji(id: string): string {
  const item = cosmeticsItems.find((c) => c.id === id && c.type === 'outfit');
  return item?.emoji || '🦺';
}

function createCourierIcon(vehicleId: string, outfitId: string) {
  const vehicle = getVehicleEmoji(vehicleId);
  const outfit = getOutfitEmoji(outfitId);
  return L.divIcon({
    html: `<div style="background: #f43f5e; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.4); font-size: 20px;">
      ${vehicle}
    </div>
    <div style="position:absolute; top:-8px; right:-6px; background:#1c1917; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:12px; border:2px solid #f43f5e;">
      ${outfit}
    </div>`,
    className: 'courier-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
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

interface RoutePoint {
  lat: number;
  lng: number;
}

export function TrackingScreen({
  restaurant,
  cart,
  total,
  location,
  cosmetics,
  onArrive,
  onAbort,
}: TrackingScreenProps) {
  const [phase, setPhase] = useState<Phase>('picked_up');
  const [progress, setProgress] = useState(0);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [speedMode, setSpeedMode] = useState<SpeedMode>('1x');
  const [abortConfirm, setAbortConfirm] = useState(false);
  const [routeLoading, setRouteLoading] = useState(true);

  const userLocation: [number, number] = [location.lat, location.lng];
  const restaurantLocRef = useRef<[number, number] | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const homeMarkerRef = useRef<L.Marker | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);
  const speedRef = useRef<SpeedMode>('1x');
  const arrivedRef = useRef(false);
  const lastNotifRef = useRef<Phase>('picked_up');
  const drawnRef = useRef(false);

  // Pick a restaurant location near the user
  useEffect(() => {
    const offset = () => (Math.random() - 0.5) * 0.03;
    restaurantLocRef.current = [userLocation[0] + offset(), userLocation[1] + offset()];
  }, [userLocation[0], userLocation[1]]);

  // Request notification permission + fetch real road route from OSRM
  useEffect(() => {
    requestNotificationPermission();

    const restaurantLoc = restaurantLocRef.current;
    if (!restaurantLoc) return;

    setRouteLoading(true);
    const coords = `${restaurantLoc[1]},${restaurantLoc[0]};${userLocation[1]},${userLocation[0]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.routes?.[0]?.geometry?.coordinates) {
          const pts: RoutePoint[] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => ({ lat: c[1], lng: c[0] }),
          );
          setRoutePoints(pts);
        }
      })
      .catch(() => {
        // fallback: straight line
        const r = restaurantLoc;
        const u = userLocation;
        const pts: RoutePoint[] = [];
        const steps = 40;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          pts.push({ lat: r[0] + (u[0] - r[0]) * t, lng: r[1] + (u[1] - r[1]) * t });
        }
        setRoutePoints(pts);
      })
      .finally(() => setRouteLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation[0], userLocation[1]]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw markers + route once route points are ready (only once)
  useEffect(() => {
    const map = mapRef.current;
    const restaurantLoc = restaurantLocRef.current;
    if (!map || !restaurantLoc || routePoints.length === 0 || drawnRef.current) return;

    drawnRef.current = true;

    homeMarkerRef.current = L.marker(userLocation, { icon: createHomeIcon() }).addTo(map);
    restaurantMarkerRef.current = L.marker(restaurantLoc, { icon: createRestaurantIcon() }).addTo(map);

    // Route line following roads
    const latlngs: L.LatLngExpression[] = routePoints.map((p) => [p.lat, p.lng]);
    routeLineRef.current = L.polyline(latlngs, {
      color: '#f43f5e',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 8',
    }).addTo(map);

    // Courier at start
    courierMarkerRef.current = L.marker(restaurantLoc, {
      icon: createCourierIcon(cosmetics.selectedVehicleId, cosmetics.selectedOutfitId),
    }).addTo(map);

    map.fitBounds(L.latLngBounds([restaurantLoc, userLocation]).pad(0.25));

    return () => {
      if (homeMarkerRef.current) { map.removeLayer(homeMarkerRef.current); homeMarkerRef.current = null; }
      if (restaurantMarkerRef.current) { map.removeLayer(restaurantMarkerRef.current); restaurantMarkerRef.current = null; }
      if (routeLineRef.current) { map.removeLayer(routeLineRef.current); routeLineRef.current = null; }
      if (courierMarkerRef.current) { map.removeLayer(courierMarkerRef.current); courierMarkerRef.current = null; }
      drawnRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePoints]);

  // Update courier icon when cosmetics change (without recreating marker)
  useEffect(() => {
    if (courierMarkerRef.current) {
      courierMarkerRef.current.setIcon(createCourierIcon(cosmetics.selectedVehicleId, cosmetics.selectedOutfitId));
    }
  }, [cosmetics.selectedVehicleId, cosmetics.selectedOutfitId]);

  // Realistic timer: 10-15 minutes of real time at 1x.
  // We advance progress in small increments and compute remaining time.
  useEffect(() => {
    if (routePoints.length === 0) return;

    // Random delivery duration between 10-15 minutes (in seconds)
    const totalSeconds = 600 + Math.floor(Math.random() * 300); // 600-900s
    setSecondsLeft(totalSeconds);

    // Tick every 1 second; at 1x, progress advances 1/totalSeconds per tick.
    // Speed modes multiply the effective elapsed time.
    const tickMs = 1000;
    timerRef.current = setInterval(() => {
      const speed = speedRef.current;
      const speedMult: Record<SpeedMode, number> = { '1x': 1, '2x': 2, '5x': 5, '10x': 10 };
      const deltaProgress = (100 / totalSeconds) * speedMult[speed];

      progressRef.current = Math.min(100, progressRef.current + deltaProgress);
      const p = progressRef.current;
      setProgress(p);
      setSecondsLeft(Math.max(0, Math.ceil((100 - p) * (totalSeconds / 100))));

      // Phase transitions
      let newPhase: Phase = 'picked_up';
      if (p < 15) newPhase = 'picked_up';
      else if (p < 60) newPhase = 'on_the_way';
      else if (p < 96) newPhase = 'nearby';
      else newPhase = 'arrived';

      setPhase((prev) => {
        if (prev !== newPhase) {
          // Send notification on phase change
          if (newPhase !== lastNotifRef.current) {
            lastNotifRef.current = newPhase;
            const notifBody: Record<Phase, string> = {
              picked_up: 'Budet har hämtat din beställning och är på väg!',
              on_the_way: 'Din mat är ute på väg mot dig.',
              nearby: 'Budet är nära dig — gör dig redo!',
              arrived: 'Budet har anlänt till din adress!',
            };
            sendNotification('Spökkäk', notifBody[newPhase]);
          }
          return newPhase;
        }
        return prev;
      });

      if (p >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!arrivedRef.current) {
          arrivedRef.current = true;
          setPhase('arrived');
          sendNotification('Spökkäk', 'Din leverans har anlänt!');
          setTimeout(() => onArrive(), 1800);
        }
      }
    }, tickMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routePoints]);

  // Move courier marker along the route
  useEffect(() => {
    if (!courierMarkerRef.current || routePoints.length === 0) return;
    const t = progress / 100;
    const idx = Math.min(routePoints.length - 1, Math.floor(t * (routePoints.length - 1)));
    const frac = t * (routePoints.length - 1) - idx;
    const p0 = routePoints[idx];
    const p1 = routePoints[Math.min(routePoints.length - 1, idx + 1)];
    const lat = p0.lat + (p1.lat - p0.lat) * frac;
    const lng = p0.lng + (p1.lng - p0.lng) * frac;
    courierMarkerRef.current.setLatLng([lat, lng]);
  }, [progress, routePoints]);

  // Update speed ref when speedMode changes
  useEffect(() => {
    speedRef.current = speedMode;
  }, [speedMode]);

  const currentStepIndex = phaseSteps.findIndex((s) => s.phase === phase);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAbort = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setAbortConfirm(false);
    setMenuOpen(false);
    onAbort();
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col">
      {/* Map area */}
      <div className="relative flex-1 overflow-hidden" style={{ minHeight: '50vh' }}>
        <div ref={containerRef} className="absolute inset-0 z-0" />

        {/* Loading overlay */}
        {routeLoading && (
          <div className="absolute inset-0 z-20 bg-stone-900/80 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-stone-400 text-sm">Rutt beräknas...</p>
            </div>
          </div>
        )}

        {/* Top overlay info */}
        <div className="absolute top-12 left-0 right-0 px-5 z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-stone-800 font-bold text-sm">
                  {phase === 'arrived' ? 'Levererad!' : `Ca ${formatTime(secondsLeft)} kvar`}
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

        {/* Control menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="absolute top-12 right-5 z-10 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          style={{ marginTop: '64px' }}
        >
          <Settings2 className="w-5 h-5 text-stone-800" />
        </button>

        {/* Speed badge */}
        {speedMode !== '1x' && (
          <div className="absolute top-12 left-5 z-10 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1" style={{ marginTop: '64px' }}>
            <Gauge className="w-3.5 h-3.5" /> {speedMode} snabbspolning
          </div>
        )}

        {/* Courier card */}
        {phase !== 'arrived' && (
          <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-2xl">
                {getVehicleEmoji(cosmetics.selectedVehicleId)}
              </div>
              <div className="flex-1">
                <p className="text-stone-800 font-bold text-sm">Alex är din bud</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-stone-600 text-xs font-medium">
                    4.9 · {getOutfitEmoji(cosmetics.selectedOutfitId)}
                  </span>
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
          {restaurant.name} · {restaurant.deliveryTime} → {location.label}
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

      {/* Control menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end" onClick={() => setMenuOpen(false)}>
          <div
            className="bg-white rounded-t-3xl w-full max-w-md mx-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-stone-800 font-bold text-lg flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-rose-500" /> Leveranskontroll
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5 text-stone-600" />
              </button>
            </div>

            {/* Speed control */}
            <div className="mb-6">
              <p className="text-stone-800 font-bold text-sm mb-1 flex items-center gap-2">
                <FastForward className="w-4 h-4 text-amber-500" /> Snabbspola leveransen
              </p>
              <p className="text-stone-500 text-xs mb-3">
                Välj en hastighet för att snabbspola din (påhittade) leverans.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {speedModes.map((s) => (
                  <button
                    key={s.mode}
                    onClick={() => setSpeedMode(s.mode)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all ${
                      speedMode === s.mode
                        ? 'bg-rose-600 text-white shadow-lg'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Abort */}
            <div className="border-t border-stone-100 pt-5">
              <p className="text-stone-800 font-bold text-sm mb-1 flex items-center gap-2">
                <Ban className="w-4 h-4 text-red-500" /> Avbryt leveransen
              </p>
              <p className="text-stone-500 text-xs mb-3">
                Avbryter du kommer du till donationsskärmen och sedan tillbaka till startsidan.
              </p>
              <button
                onClick={() => setAbortConfirm(true)}
                className="w-full bg-red-50 text-red-600 rounded-2xl py-3.5 font-bold hover:bg-red-100 transition-colors border border-red-200"
              >
                Avbryt leveransen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abort confirmation */}
      {abortConfirm && (
        <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-stone-800 font-bold text-lg text-center mb-2">
              Avbryt leveransen?
            </h2>
            <p className="text-stone-500 text-sm text-center leading-relaxed mb-6">
              Budet vänder om och maten (som ändå inte är riktig) slängds. Du kommer till
              donationsskärmen innan du kommer tillbaka till startsidan.
            </p>
            <div className="space-y-2">
              <button
                onClick={handleAbort}
                className="w-full bg-red-600 text-white rounded-2xl py-3.5 font-bold hover:bg-red-700 transition-colors"
              >
                Ja, avbryt
              </button>
              <button
                onClick={() => setAbortConfirm(false)}
                className="w-full text-stone-600 text-sm font-medium py-2 hover:text-stone-800 transition-colors"
              >
                Fortsätt leveransen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
