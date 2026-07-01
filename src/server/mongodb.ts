import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Product, User, Order, Review, Coupon, HeroBanner, ActivityLog, WebsiteSettings } from '../types.js';

// Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  addresses: [{
    id: String,
    type: { type: String, enum: ['Home', 'Office', 'Other'] },
    name: String,
    phone: String,
    streetAddress: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  }],
  wishlist: [String],
  loyaltyPoints: { type: Number, default: 0 },
  referredBy: String,
  referralCode: String,
  disabled: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  model: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  discountPrice: Number,
  stockStatus: { type: String, enum: ['In Stock', 'Out of Stock', 'Pre-Order'], default: 'In Stock' },
  stockCount: { type: Number, required: true, default: 0 },
  rating: { type: Number, default: 5 },
  reviewsCount: { type: Number, default: 0 },
  description: { type: String, required: true },
  images: [String],
  features: [String],
  specifications: { type: Map, of: String },
  warranty: String,
  color: String,
  capacity: String,
  storage: String,
  processor: String,
  socket: String,
  rgb: Boolean,
  wireless: Boolean,
  tonerType: String,
  printerType: String,
  estimatedDelivery: String,
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isFlashDeal: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  imageUrl: String,
  order: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true }
});

const BrandSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  logoUrl: String
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  shippingAddress: {
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  total: { type: Number, required: true },
  couponCode: String,
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'], default: 'Pending' },
  trackingNumber: { type: String, required: true, unique: true },
  estimatedDelivery: String,
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, default: () => new Date().toISOString() },
  approved: { type: Boolean, default: true }
});

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], required: true },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, required: true },
  maxDiscount: Number,
  expiryDate: { type: String, required: true },
  isActive: { type: Boolean, default: true }
});

const HeroBannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: String,
  linkTo: { type: String, default: 'Shop' },
  isActive: { type: Boolean, default: true }
});

const ActivityLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  adminEmail: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
});

const WebsiteSettingsSchema = new mongoose.Schema({
  freeShippingThreshold: { type: Number, default: 50000 },
  flatShippingRate: { type: Number, default: 150 },
  contactEmail: { type: String, default: 'support@trustitgallery.com' },
  contactPhone: { type: String, default: '+880 1712-345678' },
  address: { type: String, default: 'Level 4, Trust IT Gallery Tower, Multiplan Center, Dhaka' },
  whatsappNumber: String,
  messengerLink: String,
  facebookLink: String,
  twitterLink: String,
  youtubeLink: String,
  enableNewsletterPopup: { type: Boolean, default: true },
  newsletterDiscountPercent: { type: Number, default: 10 }
});

const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

const B2BRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  productNotes: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Approved', 'Completed'], default: 'Pending' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

// Models
export const MongoUser = mongoose.model('User', UserSchema);
export const MongoProduct = mongoose.model('Product', ProductSchema);
export const MongoCategory = mongoose.model('Category', CategorySchema);
export const MongoBrand = mongoose.model('Brand', BrandSchema);
export const MongoOrder = mongoose.model('Order', OrderSchema);
export const MongoReview = mongoose.model('Review', ReviewSchema);
export const MongoCoupon = mongoose.model('Coupon', CouponSchema);
export const MongoHeroBanner = mongoose.model('HeroBanner', HeroBannerSchema);
export const MongoActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);
export const MongoWebsiteSettings = mongoose.model('WebsiteSettings', WebsiteSettingsSchema);
export const MongoNewsletter = mongoose.model('Newsletter', NewsletterSchema);
export const MongoB2BRequest = mongoose.model('B2BRequest', B2BRequestSchema);

// Connection state helper
let isConnected = false;

export async function connectMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MongoDB Atlas: MONGODB_URI environment variable is missing. Operating in Local File Database fallback mode.');
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    console.log('Successfully connected to MongoDB Atlas!');
    
    // Auto-seed initial datasets if they are empty
    await seedMongoIfEmpty();
    
    return true;
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    return false;
  }
}

export function isMongoActive(): boolean {
  return isConnected;
}

// Seeder helper
async function seedMongoIfEmpty() {
  try {
    // 1. Seed Products & categories/brands based on them
    const productCount = await MongoProduct.countDocuments();
    if (productCount === 0) {
      const dbModule = await import('./db.js');
      const data = dbModule.readDb();
      
      console.log('MongoDB Atlas: Seeding empty collections from db.json...');
      
      // Seed products
      for (const prod of data.products) {
        await MongoProduct.create(prod);
      }
      
      // Seed coupons
      for (const coup of data.coupons) {
        await MongoCoupon.create(coup);
      }
      
      // Seed banners
      for (const ban of data.banners) {
        await MongoHeroBanner.create(ban);
      }
      
      // Seed settings
      const settingsCount = await MongoWebsiteSettings.countDocuments();
      if (settingsCount === 0) {
        await MongoWebsiteSettings.create(data.settings);
      }

      // Seed admin user
      const adminCount = await MongoUser.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash('admin', 10);
        await MongoUser.create({
          id: 'user-admin',
          email: 'admin@trustitgallery.com',
          name: 'Trust IT System Admin',
          role: 'admin',
          password: hashedPassword,
          createdAt: new Date().toISOString()
        });
      }

      // Extract and seed categories
      const categoriesSet = new Set(data.products.map(p => p.category));
      let catOrder = 1;
      for (const catName of categoriesSet) {
        await MongoCategory.create({
          id: `cat-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: catName,
          imageUrl: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=100&q=80',
          order: catOrder++,
          isVisible: true
        });
      }

      // Extract and seed brands
      const brandsSet = new Set(data.products.map(p => p.brand));
      for (const brandName of brandsSet) {
        await MongoBrand.create({
          id: `brand-${brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          name: brandName,
          logoUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80'
        });
      }
      
      console.log('MongoDB Atlas: Seeding completed successfully!');
    }
  } catch (err) {
    console.error('MongoDB Atlas Seeding Error:', err);
  }
}
