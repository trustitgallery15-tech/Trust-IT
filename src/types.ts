export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  model: string;
  sku: string;
  price: number;
  discountPrice?: number;
  stockStatus: 'In Stock' | 'Out of Stock' | 'Pre-Order';
  stockCount: number;
  rating: number;
  reviewsCount: number;
  description: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  warranty: string;
  color?: string;
  capacity?: string;
  storage?: string;
  processor?: string;
  socket?: string;
  rgb?: boolean;
  wireless?: boolean;
  tonerType?: string;
  printerType?: string;
  estimatedDelivery?: string;
  views?: number;
  sales?: number;
  createdAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses?: Address[];
  wishlist?: string[]; // product IDs
  loyaltyPoints?: number;
  referredBy?: string;
  referralCode?: string;
  createdAt: string;
}

export interface Address {
  id: string;
  type: 'Home' | 'Office' | 'Other';
  name: string;
  phone: string;
  streetAddress: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  shippingAddress: {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  paymentMethod: 'Stripe' | 'SSLCommerz' | 'Cash on Delivery';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
  expiryDate: string;
  isActive: boolean;
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  linkTo: string;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface WebsiteSettings {
  freeShippingThreshold: number;
  flatShippingRate: number;
  contactEmail: string;
  contactPhone: string;
  address: string;
  whatsappNumber: string;
  messengerLink: string;
  facebookLink: string;
  twitterLink: string;
  youtubeLink: string;
  enableNewsletterPopup: boolean;
  newsletterDiscountPercent: number;
}

export interface B2BRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  productNotes: string;
  quantity: number;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Completed';
  createdAt: string;
}

export type Banner = HeroBanner;
export interface SystemSettings {
  vatPercent: number;
  deliveryCharge: number;
  emergencyStatusAlert: string;
}
export type LogEntry = ActivityLog;
