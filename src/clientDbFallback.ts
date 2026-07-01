import { Product, Review, User, Order, Coupon, HeroBanner, ActivityLog, WebsiteSettings, B2BRequest, Category, Brand } from './types.js';
import { FALLBACK_PRODUCTS, FALLBACK_BANNERS } from './fallbackData.js';

// Setup Mock DB in localStorage if it doesn't exist
const getLocalJSON = <T>(key: string, defaultValue: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setLocalJSON = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
};

// Initialize categories from fallback products
const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Processors (CPU)', order: 1, isVisible: true },
  { id: 'cat-2', name: 'Graphics Cards', order: 2, isVisible: true },
  { id: 'cat-3', name: 'Motherboards', order: 3, isVisible: true },
  { id: 'cat-4', name: 'RAM', order: 4, isVisible: true },
  { id: 'cat-5', name: 'SSD', order: 5, isVisible: true },
  { id: 'cat-6', name: 'CPU Coolers', order: 6, isVisible: true },
  { id: 'cat-7', name: 'Power Supplies', order: 7, isVisible: true },
  { id: 'cat-8', name: 'Monitors', order: 8, isVisible: true },
  { id: 'cat-9', name: 'Mice', order: 9, isVisible: true },
  { id: 'cat-10', name: 'Routers', order: 10, isVisible: true },
  { id: 'cat-11', name: 'Printers', order: 11, isVisible: true },
  { id: 'cat-12', name: 'CCTV Products', order: 12, isVisible: true },
];

const defaultBrands: Brand[] = [
  { id: 'brand-1', name: 'Intel' },
  { id: 'brand-2', name: 'AMD' },
  { id: 'brand-3', name: 'ASUS' },
  { id: 'brand-4', name: 'MSI' },
  { id: 'brand-5', name: 'Corsair' },
  { id: 'brand-6', name: 'GigaByte' },
  { id: 'brand-7', name: 'Samsung' },
  { id: 'brand-8', name: 'HP' },
];

const defaultCoupons: Coupon[] = [
  { code: 'TRUSTIT10', discountType: 'Percentage', discountValue: 10, minPurchase: 5000, isActive: true, expiryDate: '2027-12-31' },
  { code: 'WELCOME1000', discountType: 'Fixed', discountValue: 1000, minPurchase: 20000, isActive: true, expiryDate: '2027-12-31' },
];

const defaultSettings: WebsiteSettings = {
  freeShippingThreshold: 50000,
  flatShippingRate: 150,
  contactEmail: 'sales@trustit.com',
  contactPhone: '+8801700000000',
  address: 'Trust IT Building, Multiplan Center, Dhaka, Bangladesh',
  whatsappNumber: '+8801700000000',
  messengerLink: 'https://m.me/trustit',
  facebookLink: 'https://facebook.com/trustit',
  twitterLink: 'https://twitter.com/trustit',
  youtubeLink: 'https://youtube.com/trustit',
  enableNewsletterPopup: true,
  newsletterDiscountPercent: 5,
};

const defaultUsers: User[] = [
  {
    id: 'user-admin',
    email: 'admin@trustit.com',
    name: 'Trust IT Administrator',
    phone: '+8801700000000',
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-customer',
    email: 'trustitgallery15@gmail.com',
    name: 'Valued Client',
    phone: '+8801712345678',
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];

const defaultReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'Kazi Ahmed',
    userEmail: 'kazi@example.com',
    rating: 5,
    comment: 'Absolutely legendary gaming and compile performance! Highly recommended.',
    date: new Date().toISOString(),
    approved: true
  },
  {
    id: 'rev-2',
    productId: 'prod-2',
    userName: 'Sajid Islam',
    userEmail: 'sajid@example.com',
    rating: 5,
    comment: 'The 3D V-Cache makes standard frames incredibly buttery smooth.',
    date: new Date().toISOString(),
    approved: true
  }
];

const defaultLogs: ActivityLog[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@trustit.com',
    action: 'Database Initialized',
    details: 'Client-side fallback simulation db loaded successfully',
    timestamp: new Date().toISOString()
  }
];

const mappedBanners: HeroBanner[] = FALLBACK_BANNERS.map((b: any) => ({
  id: b.id,
  title: b.title,
  subtitle: b.subtitle,
  description: b.description || '',
  buttonText: b.buttonText || 'Learn More',
  imageUrl: b.image || b.imageUrl || '',
  linkTo: b.link || b.linkTo || 'shop',
  isActive: b.isActive !== undefined ? b.isActive : true
}));

// In-Memory Fallback State backed by localStorage
export const getLocalDb = () => {
  return {
    products: getLocalJSON<Product[]>('db_products', FALLBACK_PRODUCTS),
    banners: getLocalJSON<HeroBanner[]>('db_banners', mappedBanners),

    categories: getLocalJSON<Category[]>('db_categories', defaultCategories),
    brands: getLocalJSON<Brand[]>('db_brands', defaultBrands),
    coupons: getLocalJSON<Coupon[]>('db_coupons', defaultCoupons),
    settings: getLocalJSON<WebsiteSettings>('db_settings', defaultSettings),
    users: getLocalJSON<User[]>('db_users', defaultUsers),
    reviews: getLocalJSON<Review[]>('db_reviews', defaultReviews),
    orders: getLocalJSON<Order[]>('db_orders', []),
    b2bRequests: getLocalJSON<B2BRequest[]>('db_b2b_requests', []),
    logs: getLocalJSON<ActivityLog[]>('db_logs', defaultLogs),
    subscribers: getLocalJSON<string[]>('db_subscribers', []),
  };
};

export const saveLocalDb = (db: ReturnType<typeof getLocalDb>) => {
  setLocalJSON('db_products', db.products);
  setLocalJSON('db_banners', db.banners);
  setLocalJSON('db_categories', db.categories);
  setLocalJSON('db_brands', db.brands);
  setLocalJSON('db_coupons', db.coupons);
  setLocalJSON('db_settings', db.settings);
  setLocalJSON('db_users', db.users);
  setLocalJSON('db_reviews', db.reviews);
  setLocalJSON('db_orders', db.orders);
  setLocalJSON('db_b2b_requests', db.b2bRequests);
  setLocalJSON('db_logs', db.logs);
  setLocalJSON('db_subscribers', db.subscribers);
};

// Helper: Response Creator
const makeResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'Content-Type': 'application/json' }),
    text: () => Promise.resolve(JSON.stringify(data)),
    json: () => Promise.resolve(data),
  } as Response);
};

// Handle intercepted local calls
export const handleMockApi = (url: string, options: any = {}): Promise<Response> | null => {
  // Only intercept /api/ routes
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;

  if (!path.startsWith('/api')) {
    return null;
  }

  const db = getLocalDb();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : null;

  console.log(`[Local API Interceptor] ${method} ${path}`, body);

  // Helper log action
  const addLog = (action: string, details: string) => {
    const authUser = getLocalJSON<any>('trust_user', null);
    const email = authUser ? authUser.email : 'system@trustit.com';
    db.logs.unshift({
      id: `log-${Date.now()}`,
      adminEmail: email,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    saveLocalDb(db);
  };

  try {
    // 1. PRODUCTS
    if (path === '/api/products') {
      if (method === 'GET') {
        return makeResponse(db.products);
      }
      if (method === 'POST') {
        const newProd: Product = {
          ...body,
          id: body.id || `prod-${Date.now()}`,
          rating: body.rating || 5.0,
          reviewsCount: body.reviewsCount || 0,
          createdAt: new Date().toISOString()
        };
        db.products.unshift(newProd);
        saveLocalDb(db);
        addLog('Create Product', `Created product: ${newProd.name}`);
        return makeResponse(newProd, 201);
      }
    }

    if (path.startsWith('/api/products/')) {
      const id = path.split('/')[3];
      const idx = db.products.findIndex(p => p.id === id);

      if (method === 'GET') {
        if (idx !== -1) return makeResponse(db.products[idx]);
        return makeResponse({ error: 'Product not found' }, 404);
      }
      if (method === 'PUT') {
        if (idx !== -1) {
          db.products[idx] = { ...db.products[idx], ...body };
          saveLocalDb(db);
          addLog('Update Product', `Updated product details: ${db.products[idx].name}`);
          return makeResponse(db.products[idx]);
        }
        return makeResponse({ error: 'Product not found' }, 404);
      }
      if (method === 'DELETE') {
        if (idx !== -1) {
          const deleted = db.products[idx];
          db.products.splice(idx, 1);
          saveLocalDb(db);
          addLog('Delete Product', `Deleted product: ${deleted.name}`);
          return makeResponse({ success: true, message: 'Deleted' });
        }
        return makeResponse({ error: 'Product not found' }, 404);
      }
    }

    // 2. BANNERS
    if (path === '/api/banners') {
      if (method === 'GET') {
        return makeResponse(db.banners);
      }
    }
    if (path.startsWith('/api/banners/')) {
      const id = path.split('/')[3];
      const idx = db.banners.findIndex(b => b.id === id);
      if (method === 'PUT' && idx !== -1) {
        db.banners[idx] = { ...db.banners[idx], ...body };
        saveLocalDb(db);
        addLog('Update Banner', `Updated marketing banner ${id}`);
        return makeResponse(db.banners[idx]);
      }
    }

    // 3. AUTH (Login / Register / Profile)
    if (path === '/api/auth/login') {
      if (method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        const pwd = body.password;

        // Dev login shortcuts
        if (email === 'admin' && pwd === 'admin') {
          const sysAdmin = db.users.find(u => u.role === 'admin') || db.users[0];
          return makeResponse({
            user: sysAdmin,
            token: 'mock-admin-token-jwt'
          });
        }

        const foundUser = db.users.find(u => u.email.toLowerCase() === email);
        if (foundUser) {
          if (foundUser.disabled) {
            return makeResponse({ error: 'This user account is disabled by administrators.' }, 403);
          }
          return makeResponse({
            user: foundUser,
            token: `mock-token-${foundUser.id}`
          });
        }

        // Auto creation or standard credentials fail
        return makeResponse({ error: 'Invalid user credentials. For quick access, use user "admin" and password "admin".' }, 401);
      }
    }

    if (path === '/api/auth/register') {
      if (method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        if (db.users.some(u => u.email.toLowerCase() === email)) {
          return makeResponse({ error: 'This email address is already registered.' }, 400);
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          email,
          name: body.name,
          phone: body.phone,
          role: 'customer',
          createdAt: new Date().toISOString()
        };
        db.users.push(newUser);
        saveLocalDb(db);
        return makeResponse({
          user: newUser,
          token: `mock-token-${newUser.id}`
        });
      }
    }

    if (path === '/api/auth/profile') {
      const authUser = getLocalJSON<any>('trust_user', null);
      if (method === 'GET') {
        if (!authUser) return makeResponse({ error: 'Unauthorized' }, 401);
        const freshUser = db.users.find(u => u.id === authUser.id) || authUser;
        return makeResponse(freshUser);
      }
      if (method === 'POST' || method === 'PUT') {
        if (!authUser) return makeResponse({ error: 'Unauthorized' }, 401);
        const idx = db.users.findIndex(u => u.id === authUser.id);
        if (idx !== -1) {
          db.users[idx] = { ...db.users[idx], ...body };
          saveLocalDb(db);
          localStorage.setItem('trust_user', JSON.stringify(db.users[idx]));
          return makeResponse(db.users[idx]);
        }
        return makeResponse({ error: 'User not found' }, 404);
      }
    }

    // 4. CATEGORIES
    if (path === '/api/categories') {
      if (method === 'GET') {
        return makeResponse(db.categories);
      }
      if (method === 'POST') {
        const newCat: Category = {
          ...body,
          id: body.id || `cat-${Date.now()}`
        };
        db.categories.push(newCat);
        saveLocalDb(db);
        addLog('Create Category', `Created category: ${newCat.name}`);
        return makeResponse(newCat, 201);
      }
    }
    if (path.startsWith('/api/categories/')) {
      const id = path.split('/')[3];
      const idx = db.categories.findIndex(c => c.id === id);
      if (method === 'DELETE' && idx !== -1) {
        const deleted = db.categories[idx];
        db.categories.splice(idx, 1);
        saveLocalDb(db);
        addLog('Delete Category', `Deleted category: ${deleted.name}`);
        return makeResponse({ success: true });
      }
    }

    // 5. BRANDS
    if (path === '/api/brands') {
      if (method === 'GET') {
        return makeResponse(db.brands);
      }
      if (method === 'POST') {
        const newBrand: Brand = {
          ...body,
          id: body.id || `brand-${Date.now()}`
        };
        db.brands.push(newBrand);
        saveLocalDb(db);
        addLog('Create Brand', `Created brand: ${newBrand.name}`);
        return makeResponse(newBrand, 201);
      }
    }
    if (path.startsWith('/api/brands/')) {
      const id = path.split('/')[3];
      const idx = db.brands.findIndex(b => b.id === id);
      if (method === 'DELETE' && idx !== -1) {
        const deleted = db.brands[idx];
        db.brands.splice(idx, 1);
        saveLocalDb(db);
        addLog('Delete Brand', `Deleted brand: ${deleted.name}`);
        return makeResponse({ success: true });
      }
    }

    // 6. ORDERS
    if (path === '/api/orders') {
      if (method === 'GET') {
        return makeResponse(db.orders);
      }
      if (method === 'POST') {
        const newOrder: Order = {
          ...body,
          id: body.id || `TR-ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          orderStatus: 'Pending',
          paymentStatus: body.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
          trackingNumber: `TR-${Math.floor(10000000 + Math.random() * 90000000)}`,
          estimatedDelivery: '3-5 Days',
          createdAt: new Date().toISOString()
        };

        // Decrement product inventory stock
        newOrder.items.forEach(item => {
          const prodIdx = db.products.findIndex(p => p.id === item.productId);
          if (prodIdx !== -1) {
            db.products[prodIdx].stockCount = Math.max(0, db.products[prodIdx].stockCount - item.quantity);
            if (db.products[prodIdx].stockCount === 0) {
              db.products[prodIdx].stockStatus = 'Out of Stock';
            }
          }
        });

        db.orders.unshift(newOrder);
        saveLocalDb(db);
        addLog('New Order Placed', `Order ${newOrder.id} placed by ${newOrder.userName} (${newOrder.userEmail})`);
        return makeResponse(newOrder, 201);
      }
    }
    if (path.startsWith('/api/orders/user/')) {
      const email = decodeURIComponent(path.split('/')[4]);
      const userOrders = db.orders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
      return makeResponse(userOrders);
    }
    if (path.startsWith('/api/orders/track/')) {
      const query = decodeURIComponent(path.split('/')[4]).trim();
      const trackOrder = db.orders.find(o => o.id.toLowerCase() === query.toLowerCase() || o.trackingNumber.toLowerCase() === query.toLowerCase());
      if (trackOrder) return makeResponse(trackOrder);
      return makeResponse({ error: 'No order found matching your tracking search query.' }, 404);
    }
    if (path.startsWith('/api/orders/')) {
      const id = path.split('/')[3];
      const idx = db.orders.findIndex(o => o.id === id);
      if (method === 'PUT' && idx !== -1) {
        db.orders[idx] = { ...db.orders[idx], ...body };
        saveLocalDb(db);
        addLog('Update Order', `Updated order status for ${id} to ${body.orderStatus}`);
        return makeResponse(db.orders[idx]);
      }
    }

    // 7. NEWSLETTER
    if (path === '/api/newsletter/subscribe') {
      if (method === 'POST') {
        const email = (body.email || '').trim().toLowerCase();
        if (!db.subscribers.includes(email)) {
          db.subscribers.push(email);
          saveLocalDb(db);
        }
        return makeResponse({ success: true, message: 'Thank you for subscribing to our tech updates newsletter!' });
      }
    }

    // 8. SEARCH SUGGESTIONS
    if (path.startsWith('/api/search-suggestions')) {
      const query = parsedUrl.searchParams.get('q') || '';
      const filtered = db.products
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
        .map(p => p.name);
      return makeResponse(filtered);
    }

    // 9. REVIEWS
    if (path.startsWith('/api/reviews/')) {
      const productId = path.split('/')[3];
      const prodReviews = db.reviews.filter(r => r.productId === productId && r.approved);
      return makeResponse(prodReviews);
    }
    if (path === '/api/reviews') {
      if (method === 'POST') {
        const newReview: Review = {
          id: `rev-${Date.now()}`,
          productId: body.productId,
          userName: body.userName,
          userEmail: body.userEmail,
          rating: Number(body.rating),
          comment: body.comment,
          date: new Date().toISOString(),
          approved: false // Starts pending admin approval
        };
        db.reviews.unshift(newReview);
        saveLocalDb(db);
        return makeResponse(newReview, 201);
      }
    }

    // 10. AI ASSISTANCE
    if (path === '/api/ai/suggest') {
      const prompt = (body.prompt || '').toLowerCase();
      let suggestions = 'Based on your hardware profile, we highly recommend upgrading to a fast high-bandwidth DDR5 RAM module and selecting an NVIDIA Ada Lovelace graphic system for optimal frame timing and ultra-realistic workloads.';
      if (prompt.includes('game') || prompt.includes('gaming')) {
        suggestions = 'For high framerate esports and immersive AAA ray-traced graphics, pairing an AMD Ryzen 7 7800X3D with an RTX 4080 Super will yield the absolute peak FPS profiles on the market.';
      } else if (prompt.includes('budget') || prompt.includes('affordable')) {
        suggestions = 'For budget computing, prioritizing a stable AMD Ryzen 5 processor or Intel Core i5 with a high-capacity SSD delivers excellent snap performance without massive investment.';
      }
      return makeResponse({ suggestion: suggestions });
    }

    // 11. COUPONS
    if (path === '/api/coupons/validate') {
      const code = (body.code || '').toUpperCase().trim();
      const coup = db.coupons.find(c => c.code === code && c.isActive);
      if (coup) {
        return makeResponse({ valid: true, coupon: coup });
      }
      return makeResponse({ valid: false, message: 'Invalid or expired promo code.' });
    }

    // 12. ADMIN-ONLY READS
    if (path === '/api/admin/users') {
      return makeResponse(db.users);
    }
    if (path.startsWith('/api/admin/users/') && path.endsWith('/toggle')) {
      const id = path.split('/')[4];
      const idx = db.users.findIndex(u => u.id === id);
      if (idx !== -1) {
        db.users[idx].disabled = !db.users[idx].disabled;
        saveLocalDb(db);
        addLog('Toggle User Lockout', `Locked/Unlocked account of user: ${db.users[idx].email}`);
        return makeResponse(db.users[idx]);
      }
    }

    if (path === '/api/admin/coupons') {
      return makeResponse(db.coupons);
    }
    if (path.startsWith('/api/admin/coupons/')) {
      const code = path.split('/')[4];
      const idx = db.coupons.findIndex(c => c.code === code);
      if (method === 'DELETE' && idx !== -1) {
        db.coupons.splice(idx, 1);
        saveLocalDb(db);
        addLog('Delete Coupon', `Deleted discount coupon code: ${code}`);
        return makeResponse({ success: true });
      }
    }

    if (path === '/api/admin/reviews') {
      return makeResponse(db.reviews);
    }
    if (path.startsWith('/api/admin/reviews/')) {
      const id = path.split('/')[4];
      const idx = db.reviews.findIndex(r => r.id === id);
      if (idx !== -1) {
        if (path.endsWith('/approve') && method === 'PUT') {
          db.reviews[idx].approved = true;
          saveLocalDb(db);
          // Recalculate average rating of associated product
          const assocPid = db.reviews[idx].productId;
          const reviewsForProd = db.reviews.filter(r => r.productId === assocPid && r.approved);
          const totalRating = reviewsForProd.reduce((acc, curr) => acc + curr.rating, 0);
          const prodIdx = db.products.findIndex(p => p.id === assocPid);
          if (prodIdx !== -1 && reviewsForProd.length > 0) {
            db.products[prodIdx].rating = Number((totalRating / reviewsForProd.length).toFixed(1));
            db.products[prodIdx].reviewsCount = reviewsForProd.length;
          }
          saveLocalDb(db);
          addLog('Approve Review', `Approved user product feedback ID: ${id}`);
          return makeResponse(db.reviews[idx]);
        }
        if (method === 'DELETE') {
          db.reviews.splice(idx, 1);
          saveLocalDb(db);
          addLog('Delete Review', `Removed user product feedback ID: ${id}`);
          return makeResponse({ success: true });
        }
      }
    }

    if (path === '/api/admin/newsletter') {
      return makeResponse(db.subscribers.map((email, idx) => ({ id: `sub-${idx}`, email, date: new Date().toISOString() })));
    }
    if (path === '/api/admin/logs') {
      return makeResponse(db.logs);
    }

    if (path === '/api/settings') {
      if (method === 'GET') {
        return makeResponse(db.settings);
      }
      if (method === 'POST' || method === 'PUT') {
        db.settings = { ...db.settings, ...body };
        saveLocalDb(db);
        addLog('Update Settings', 'Saved website system control parameters');
        return makeResponse(db.settings);
      }
    }

    if (path === '/api/admin/b2b-requests') {
      return makeResponse(db.b2bRequests);
    }
    if (path === '/api/b2b/request') {
      if (method === 'POST') {
        const newReq: B2BRequest = {
          ...body,
          id: `b2b-${Date.now()}`,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        db.b2bRequests.unshift(newReq);
        saveLocalDb(db);
        addLog('New B2B Corporate Request', `Company: ${newReq.companyName}, Email: ${newReq.email}`);
        return makeResponse(newReq, 201);
      }
    }

  } catch (err: any) {
    console.error('[Mock API Router Error]', err);
    return makeResponse({ error: `Mock routing error: ${err.message}` }, 500);
  }

  // Fallback 404
  return makeResponse({ error: `Not found: ${method} ${path}` }, 404);
};

// Override window.fetch in the browser
export function installClientDbFallback() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  if (!originalFetch) return;

  const mockFetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const urlString = input instanceof URL ? input.toString() : typeof input === 'string' ? input : (input as any).url || '';
    
    // Only intercept if it's an API route and we are on Vercel OR if we want an active local fallback
    const isVercelHost = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('github.io');
    
    // Check if it's a relative/absolute API URL of the current app
    const isApiRoute = urlString.startsWith('/api/') || urlString.includes(window.location.origin + '/api/');

    if (isApiRoute) {
      // In Vercel host, always use the mock database directly for absolute speed and bypass the missing backend
      if (isVercelHost) {
        const mockRes = handleMockApi(urlString, init);
        if (mockRes) return mockRes;
      }

      // On other hosts, execute the real call first. If it fails with connection/cors errors OR returns 404, fallback
      try {
        const response = await originalFetch(input, init);
        // If the backend returned a 404/502/504 for an API route, it usually means the express server is down or Vercel static router returned a 404 HTML
        const contentType = response.headers.get('content-type') || '';
        if (response.status === 404 || response.status >= 502 || (response.status === 200 && contentType.includes('text/html'))) {
          const mockRes = handleMockApi(urlString, init);
          if (mockRes) return mockRes;
        }
        return response;
      } catch (networkError) {
        console.warn('Network error detected. Activating Client-Side Fallback DB...', networkError);
        const mockRes = handleMockApi(urlString, init);
        if (mockRes) return mockRes;
        throw networkError;
      }
    }

    return originalFetch(input, init);
  };

  try {
    // First try defining the property using Object.defineProperty
    Object.defineProperty(window, 'fetch', {
      value: mockFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
    console.log('✅ Local Client-Side Database Fallback installed for pure Vercel/Static hosting compatibility via Object.defineProperty.');
  } catch (err) {
    console.warn('Could not define window.fetch via Object.defineProperty. Trying direct assignment...', err);
    try {
      // Fallback to direct assignment
      window.fetch = mockFetch;
      console.log('✅ Local Client-Side Database Fallback installed for pure Vercel/Static hosting compatibility via direct assignment.');
    } catch (err2) {
      console.error('❌ Failed to install Client-Side Database Fallback. window.fetch is read-only in this sandbox environment.', err2);
    }
  }
}
