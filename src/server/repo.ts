import db from './db.js';
import { 
  isMongoActive, 
  MongoUser, 
  MongoProduct, 
  MongoCategory, 
  MongoBrand, 
  MongoOrder, 
  MongoReview, 
  MongoCoupon, 
  MongoHeroBanner, 
  MongoActivityLog, 
  MongoWebsiteSettings, 
  MongoNewsletter,
  MongoB2BRequest
} from './mongodb.js';
import { 
  Product, 
  User, 
  Order, 
  Review, 
  Coupon, 
  HeroBanner, 
  ActivityLog, 
  WebsiteSettings, 
  Category, 
  Brand,
  B2BRequest
} from '../types.js';

// --- Helper: Clean Mongoose Documents into plain TS types ---
function cleanDoc<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) delete obj._id;
  if (obj.__v !== undefined) delete obj.__v;
  return obj as T;
}

function cleanDocs<T>(docs: any[]): T[] {
  return docs.map(doc => cleanDoc<T>(doc));
}

// --- 1. Products Repo ---
export async function getProducts(): Promise<Product[]> {
  if (isMongoActive()) {
    const docs = await MongoProduct.find().lean();
    return cleanDocs<Product>(docs);
  } else {
    return db.readDb().products;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isMongoActive()) {
    const doc = await MongoProduct.findOne({ id }).lean();
    return doc ? cleanDoc<Product>(doc) : null;
  } else {
    const data = db.readDb();
    return data.products.find(p => p.id === id) || null;
  }
}

export async function saveProduct(product: Product): Promise<Product> {
  if (isMongoActive()) {
    const doc = await MongoProduct.findOneAndUpdate(
      { id: product.id },
      { $set: product },
      { upsert: true, new: true }
    );
    return cleanDoc<Product>(doc);
  } else {
    const data = db.readDb();
    const idx = data.products.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      data.products[idx] = product;
    } else {
      data.products.push(product);
    }
    db.writeDb(data);
    return product;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoProduct.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      data.products.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 2. Categories Repo ---
export async function getCategories(): Promise<Category[]> {
  if (isMongoActive()) {
    const docs = await MongoCategory.find().sort({ order: 1 }).lean();
    return cleanDocs<Category>(docs);
  } else {
    return db.readDb().categories || [];
  }
}

export async function saveCategory(category: Category): Promise<Category> {
  if (isMongoActive()) {
    const doc = await MongoCategory.findOneAndUpdate(
      { id: category.id },
      { $set: category },
      { upsert: true, new: true }
    );
    return cleanDoc<Category>(doc);
  } else {
    const data = db.readDb();
    if (!data.categories) data.categories = [];
    const idx = data.categories.findIndex(c => c.id === category.id);
    if (idx !== -1) {
      data.categories[idx] = category;
    } else {
      data.categories.push(category);
    }
    db.writeDb(data);
    return category;
  }
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoCategory.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    if (!data.categories) data.categories = [];
    const idx = data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      data.categories.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 3. Brands Repo ---
export async function getBrands(): Promise<Brand[]> {
  if (isMongoActive()) {
    const docs = await MongoBrand.find().lean();
    return cleanDocs<Brand>(docs);
  } else {
    return db.readDb().brands || [];
  }
}

export async function saveBrand(brand: Brand): Promise<Brand> {
  if (isMongoActive()) {
    const doc = await MongoBrand.findOneAndUpdate(
      { id: brand.id },
      { $set: brand },
      { upsert: true, new: true }
    );
    return cleanDoc<Brand>(doc);
  } else {
    const data = db.readDb();
    if (!data.brands) data.brands = [];
    const idx = data.brands.findIndex(b => b.id === brand.id);
    if (idx !== -1) {
      data.brands[idx] = brand;
    } else {
      data.brands.push(brand);
    }
    db.writeDb(data);
    return brand;
  }
}

export async function deleteBrand(id: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoBrand.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    if (!data.brands) data.brands = [];
    const idx = data.brands.findIndex(b => b.id === id);
    if (idx !== -1) {
      data.brands.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 4. Users Repo ---
export async function getUsers(): Promise<User[]> {
  if (isMongoActive()) {
    const docs = await MongoUser.find().lean();
    return cleanDocs<User>(docs);
  } else {
    return db.readDb().users;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  if (isMongoActive()) {
    const doc = await MongoUser.findOne({ email: email.toLowerCase() }).lean();
    return doc ? cleanDoc<User>(doc) : null;
  } else {
    const data = db.readDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  if (isMongoActive()) {
    const doc = await MongoUser.findOne({ id }).lean();
    return doc ? cleanDoc<User>(doc) : null;
  } else {
    const data = db.readDb();
    return data.users.find(u => u.id === id) || null;
  }
}

export async function saveUser(user: User, passwordHash?: string): Promise<User> {
  if (isMongoActive()) {
    const payload: any = { ...user };
    if (passwordHash) {
      payload.password = passwordHash;
    }
    const doc = await MongoUser.findOneAndUpdate(
      { id: user.id },
      { $set: payload },
      { upsert: true, new: true }
    );
    return cleanDoc<User>(doc);
  } else {
    const data = db.readDb();
    const idx = data.users.findIndex(u => u.id === user.id);
    const userWithPass: any = { ...user };
    if (passwordHash) {
      userWithPass.password = passwordHash;
    } else if (idx !== -1) {
      userWithPass.password = (data.users[idx] as any).password;
    }
    if (idx !== -1) {
      data.users[idx] = userWithPass;
    } else {
      data.users.push(userWithPass);
    }
    db.writeDb(data);
    return user;
  }
}

export async function getUserByReferralCode(code: string): Promise<User | null> {
  if (isMongoActive()) {
    const doc = await MongoUser.findOne({ referralCode: code }).lean();
    return doc ? cleanDoc<User>(doc) : null;
  } else {
    const data = db.readDb();
    return data.users.find(u => u.referralCode === code) || null;
  }
}

// --- 5. Orders Repo ---
export async function getOrders(): Promise<Order[]> {
  if (isMongoActive()) {
    const docs = await MongoOrder.find().lean();
    return cleanDocs<Order>(docs);
  } else {
    return db.readDb().orders;
  }
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  if (isMongoActive()) {
    const docs = await MongoOrder.find({ userEmail: email.toLowerCase() }).lean();
    return cleanDocs<Order>(docs);
  } else {
    const data = db.readDb();
    return data.orders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
  }
}

export async function getOrderByIdOrTracking(query: string): Promise<Order | null> {
  if (isMongoActive()) {
    const doc = await MongoOrder.findOne({
      $or: [
        { id: query },
        { trackingNumber: query }
      ]
    }).lean();
    return doc ? cleanDoc<Order>(doc) : null;
  } else {
    const data = db.readDb();
    return data.orders.find(o => o.id === query || o.trackingNumber === query) || null;
  }
}

export async function saveOrder(order: Order): Promise<Order> {
  if (isMongoActive()) {
    const doc = await MongoOrder.findOneAndUpdate(
      { id: order.id },
      { $set: order },
      { upsert: true, new: true }
    );
    return cleanDoc<Order>(doc);
  } else {
    const data = db.readDb();
    const idx = data.orders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
      data.orders[idx] = order;
    } else {
      data.orders.push(order);
    }
    db.writeDb(data);
    return order;
  }
}

// --- 6. Reviews Repo ---
export async function getReviews(productId: string): Promise<Review[]> {
  if (isMongoActive()) {
    const docs = await MongoReview.find({ productId, approved: true }).lean();
    return cleanDocs<Review>(docs);
  } else {
    const data = db.readDb();
    return data.reviews.filter(r => r.productId === productId && r.approved);
  }
}

export async function getAllReviews(): Promise<Review[]> {
  if (isMongoActive()) {
    const docs = await MongoReview.find().lean();
    return cleanDocs<Review>(docs);
  } else {
    const data = db.readDb();
    return data.reviews;
  }
}

export async function saveReview(review: Review): Promise<Review> {
  if (isMongoActive()) {
    const doc = await MongoReview.findOneAndUpdate(
      { id: review.id },
      { $set: review },
      { upsert: true, new: true }
    );
    return cleanDoc<Review>(doc);
  } else {
    const data = db.readDb();
    const idx = data.reviews.findIndex(r => r.id === review.id);
    if (idx !== -1) {
      data.reviews[idx] = review;
    } else {
      data.reviews.push(review);
    }
    db.writeDb(data);
    return review;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoReview.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    const idx = data.reviews.findIndex(r => r.id === id);
    if (idx !== -1) {
      data.reviews.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 7. Coupons Repo ---
export async function getCoupons(): Promise<Coupon[]> {
  if (isMongoActive()) {
    const docs = await MongoCoupon.find().lean();
    return cleanDocs<Coupon>(docs);
  } else {
    return db.readDb().coupons;
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  if (isMongoActive()) {
    const doc = await MongoCoupon.findOne({ code: code.toUpperCase() }).lean();
    return doc ? cleanDoc<Coupon>(doc) : null;
  } else {
    const data = db.readDb();
    return data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
  }
}

export async function saveCoupon(coupon: Coupon): Promise<Coupon> {
  if (isMongoActive()) {
    const doc = await MongoCoupon.findOneAndUpdate(
      { code: coupon.code.toUpperCase() },
      { $set: coupon },
      { upsert: true, new: true }
    );
    return cleanDoc<Coupon>(doc);
  } else {
    const data = db.readDb();
    const idx = data.coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx !== -1) {
      data.coupons[idx] = coupon;
    } else {
      data.coupons.push(coupon);
    }
    db.writeDb(data);
    return coupon;
  }
}

export async function deleteCoupon(code: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoCoupon.deleteOne({ code: code.toUpperCase() });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    const idx = data.coupons.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      data.coupons.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 8. Hero Banners Repo ---
export async function getHeroBanners(): Promise<HeroBanner[]> {
  if (isMongoActive()) {
    const docs = await MongoHeroBanner.find().lean();
    return cleanDocs<HeroBanner>(docs);
  } else {
    return db.readDb().banners;
  }
}

export async function saveHeroBanner(banner: HeroBanner): Promise<HeroBanner> {
  if (isMongoActive()) {
    const doc = await MongoHeroBanner.findOneAndUpdate(
      { id: banner.id },
      { $set: banner },
      { upsert: true, new: true }
    );
    return cleanDoc<HeroBanner>(doc);
  } else {
    const data = db.readDb();
    const idx = data.banners.findIndex(b => b.id === banner.id);
    if (idx !== -1) {
      data.banners[idx] = banner;
    } else {
      data.banners.push(banner);
    }
    db.writeDb(data);
    return banner;
  }
}

export async function deleteHeroBanner(id: string): Promise<boolean> {
  if (isMongoActive()) {
    const res = await MongoHeroBanner.deleteOne({ id });
    return res.deletedCount > 0;
  } else {
    const data = db.readDb();
    const idx = data.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      data.banners.splice(idx, 1);
      db.writeDb(data);
      return true;
    }
    return false;
  }
}

// --- 9. Activity Logs Repo ---
export async function getActivityLogs(): Promise<ActivityLog[]> {
  if (isMongoActive()) {
    const docs = await MongoActivityLog.find().sort({ timestamp: -1 }).limit(100).lean();
    return cleanDocs<ActivityLog>(docs);
  } else {
    return db.readDb().logs;
  }
}

export async function saveActivityLog(log: ActivityLog): Promise<ActivityLog> {
  if (isMongoActive()) {
    const doc = await MongoActivityLog.findOneAndUpdate(
      { id: log.id },
      { $set: log },
      { upsert: true, new: true }
    );
    return cleanDoc<ActivityLog>(doc);
  } else {
    const data = db.readDb();
    data.logs.push(log);
    db.writeDb(data);
    return log;
  }
}

// --- 10. Website Settings Repo ---
export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  if (isMongoActive()) {
    const doc = await MongoWebsiteSettings.findOne().lean();
    if (doc) {
      return cleanDoc<WebsiteSettings>(doc);
    }
    // Fallback default
    const defaults = {
      freeShippingThreshold: 50000,
      flatShippingRate: 150,
      contactEmail: 'support@trustitgallery.com',
      contactPhone: '+880 1712-345678',
      address: 'Level 4, Trust IT Gallery Tower, Multiplan Center, Dhaka',
      enableNewsletterPopup: true,
      newsletterDiscountPercent: 10
    } as any;
    const created = await MongoWebsiteSettings.create(defaults);
    return cleanDoc<WebsiteSettings>(created);
  } else {
    return db.readDb().settings;
  }
}

export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
  if (isMongoActive()) {
    const doc = await MongoWebsiteSettings.findOneAndUpdate(
      {},
      { $set: settings },
      { upsert: true, new: true }
    );
    return cleanDoc<WebsiteSettings>(doc);
  } else {
    const data = db.readDb();
    data.settings = { ...data.settings, ...settings };
    db.writeDb(data);
    return data.settings;
  }
}

// --- 11. Newsletter Subscriptions Repo ---
export async function addNewsletterSubscription(email: string): Promise<boolean> {
  if (isMongoActive()) {
    try {
      await MongoNewsletter.create({ email: email.toLowerCase() });
      return true;
    } catch {
      return false; // already subscribed or error
    }
  } else {
    // We can simulate newsletter sub on local file
    return true;
  }
}

export async function getNewsletterEmails(): Promise<string[]> {
  if (isMongoActive()) {
    const docs = await MongoNewsletter.find().lean();
    return docs.map((d: any) => d.email);
  } else {
    return ['news-subscriber1@gmail.com', 'news-subscriber2@gmail.com'];
  }
}

// --- 12. B2B RFQ Requests Repo ---
export async function getB2BRequests(): Promise<B2BRequest[]> {
  if (isMongoActive()) {
    const docs = await MongoB2BRequest.find().sort({ createdAt: -1 }).lean();
    return cleanDocs<B2BRequest>(docs);
  } else {
    const data = db.readDb() as any;
    return data.b2bRequests || [];
  }
}

export async function saveB2BRequest(req: B2BRequest): Promise<B2BRequest> {
  if (isMongoActive()) {
    const doc = await MongoB2BRequest.findOneAndUpdate(
      { id: req.id },
      { $set: req },
      { upsert: true, new: true }
    );
    return cleanDoc<B2BRequest>(doc);
  } else {
    const data = db.readDb() as any;
    if (!data.b2bRequests) data.b2bRequests = [];
    const idx = data.b2bRequests.findIndex((r: any) => r.id === req.id);
    if (idx !== -1) {
      data.b2bRequests[idx] = req;
    } else {
      data.b2bRequests.push(req);
    }
    db.writeDb(data);
    return req;
  }
}

