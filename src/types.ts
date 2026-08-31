export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  tags: string[];
  menu: MenuItem[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type Screen =
  | 'splash'
  | 'home'
  | 'restaurant'
  | 'cart'
  | 'checkout'
  | 'preparing'
  | 'tracking'
  | 'result'
  | 'location'
  | 'shop'
  | 'settings';

export interface SavedOrder {
  id: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}

export interface DeliveryLocation {
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface CosmeticsItem {
  id: string;
  name: string;
  type: 'vehicle' | 'outfit';
  price: number; // real money, SEK
  description: string;
  emoji: string;
  previewColor: string;
}

export interface CosmeticsState {
  selectedVehicleId: string;
  selectedOutfitId: string;
  ownedVehicleIds: string[];
  ownedOutfitIds: string[];
}
