export interface SearchRequest {
  query: string;
}

export interface ProductPrice {
  value: number;
  currency: string;
  raw: string;
}

export interface Product {
  asin: string;
  title: string;
  price: ProductPrice;
  image: string;
  rating?: number;
  ratings_total?: number;
  link: string;
  brand?: string;
  position?: number;
  is_sponsored?: boolean;
  is_prime?: boolean;
  fulfillment?: Record<string, any>;
}

export interface SearchResponse {
  products: Product[];
}

export interface ProductDetail {
  asin: string;
  title: string;
  description?: string;
  feature_bullets?: string[];
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  images?: string[];
  price?: ProductPrice;
  rating?: number;
  ratings_total?: number;
  reviews?: Record<string, unknown>[];
  link: string;
  brand?: string;
  availability?: {
    status: string;
  };
}

export interface ProductDetailResponse {
  product: ProductDetail;
}

export interface ProductDetailRequest {
  asin: string;
}

export interface UserData {
  privy_id: string;
  wallet_address: string | null;
}

export interface UserContextType {
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  userData: UserData | null;
}

export interface CartItem {
  asin: string;
  title: string;
  price: number;
  quantity: number;
  image_url: string;
  variant_asin?: string;
  variant_dimensions?: { [key: string]: string };
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface SearchBarProps {
  initialQuery?: string;
}

export interface CreateOrderRequest {
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  total_amount_usd: number;
  full_name: string;
  street: string;
  postal_code: string;
  phone: string;
  delivery_instructions: string;
  blockchain_order_id: string;
}

export interface CreateOrderResponse {
  orderId: string;
  status: string;
}

export interface NavItemProps {
  icon: React.ElementType;
  tooltip: string;
  to?: string;
  onClick?: () => void;
  badge?: number;
  tooltipClassName?: string;
}

export interface OrderItem {
  asin: string;
  quantity: number;
  price: number;
  title: string;
  image_url?: string;
  variant_asin?: string;
  variant_dimensions?: { [key: string]: string };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  total_amount_usd: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  full_name: string;
  street: string;
  postal_code: string;
  phone: string;
  delivery_instructions: string;
  shipping_guide?: string;
  blockchain_order_id: string;
}

export interface CreateOrderResponse {
  id: string;
  user_id: string;
  total_amount: number;
  total_amount_usd: number;
  status: string;
}

export interface ExchangeRate {
  idSerie: string;
  titulo: string;
  fecha: string;
  valor: number;
}

export interface ProductVariantDimension {
  name: string;
  value: string;
}
export interface ProductVariantImage {
  link: string;
  variant: string;
}

export interface ProductVariant {
  asin: string;
  title: string;
  link: string;
  dimensions: ProductVariantDimension[];
  main_image: string;
  images: ProductVariantImage[];
  price?: ProductPrice;
  availability?: {
    status: string;
  };
}

export interface BorrowCapacity {
  maxBorrowAmount: number;
  currentLiquidationThreshold: string;
  totalBorrowUSD: number;
  totalCollateralUSD: number;
  healthFactor: number;
  netWorthUSD: number;
}