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
  | 'home'
  | 'restaurant'
  | 'cart'
  | 'checkout'
  | 'preparing'
  | 'tracking'
  | 'result';

export interface SavedOrder {
  id: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
}
