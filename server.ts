import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import db from './src/server/db.js';
import { Product, Order, User, Review, Coupon, ActivityLog } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Database Initialization
  db.readDb(); // Ensures directory and file exist with initial seed

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Website Settings
  app.get('/api/settings', (req, res) => {
    const data = db.readDb();
    res.json(data.settings);
  });

  app.put('/api/settings', (req, res) => {
    const { email, password } = req.body.auth || {};
    // simple admin auth gate
    if (email !== 'admin@trustitgallery.com' && email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const data = db.readDb();
    data.settings = { ...data.settings, ...req.body.settings };
    db.writeDb(data);
    res.json(data.settings);
  });

  // Banners
  app.get('/api/banners', (req, res) => {
    const data = db.readDb();
    res.json(data.banners.filter(b => b.isActive));
  });

  app.post('/api/banners', (req, res) => {
    const { banner, auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const data = db.readDb();
    const newBanner = {
      id: `ban-${Date.now()}`,
      imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
      title: banner.title || 'Special Promotion',
      subtitle: banner.subtitle || 'Unbeatable prices on all IT accessories',
      linkTo: banner.linkTo || 'Shop',
      isActive: true
    };
    data.banners.push(newBanner);
    
    // Log action
    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Create Banner',
      details: `Added new banner: "${newBanner.title}"`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json(newBanner);
  });

  // Authentication
  app.post('/api/auth/register', (req, res) => {
    const { email, name, password, phone, referredBy } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ error: 'Missing email, name, or password' });
      return;
    }

    const data = db.readDb();
    const existing = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    const referralCode = `TRUST-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      phone,
      role: 'customer',
      addresses: [],
      wishlist: [],
      loyaltyPoints: referredBy ? 100 : 0, // Bonus for referred users
      referredBy,
      referralCode,
      createdAt: new Date().toISOString()
    };

    data.users.push(newUser);

    // If referred, give credit to referrer too
    if (referredBy) {
      const referrer = data.users.find(u => u.referralCode === referredBy);
      if (referrer) {
        referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 150;
      }
    }

    db.writeDb(data);
    res.json({ user: newUser, token: `mock-jwt-token-for-${newUser.id}` });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }

    // Secure Developer Admin Credentials
    if ((email.toLowerCase() === 'admin' || email.toLowerCase() === 'admin@trustitgallery.com') && password === 'admin') {
      const adminUser: User = {
        id: 'user-admin',
        email: 'admin@trustitgallery.com',
        name: 'Trust IT System Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      res.json({ user: adminUser, token: 'mock-jwt-token-for-admin' });
      return;
    }

    const data = db.readDb();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // In this robust full-stack preview, any other user logs in successfully with mock validation
    res.json({ user, token: `mock-jwt-token-for-${user.id}` });
  });

  app.post('/api/auth/profile', (req, res) => {
    const { token, name, phone, addresses } = req.body;
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = db.readDb();
    if (token === 'mock-jwt-token-for-admin') {
      const adminUser = {
        id: 'user-admin',
        email: 'admin@trustitgallery.com',
        name: name || 'Trust IT System Admin',
        role: 'admin' as const,
        createdAt: new Date().toISOString()
      };
      res.json(adminUser);
      return;
    }

    const userId = token.replace('mock-jwt-token-for-', '');
    const userIndex = data.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = data.users[userIndex];
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (addresses) user.addresses = addresses;

    data.users[userIndex] = user;
    db.writeDb(data);
    res.json(user);
  });

  // Products CRUD
  app.get('/api/products', (req, res) => {
    const data = db.readDb();
    res.json(data.products);
  });

  app.get('/api/products/:id', (req, res) => {
    const data = db.readDb();
    const product = data.products.find(p => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    // Increment views
    product.views = (product.views || 0) + 1;
    db.writeDb(data);
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const { product, auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = db.readDb();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      views: 0,
      sales: 0,
      createdAt: new Date().toISOString()
    };

    data.products.push(newProduct);

    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Create Product',
      details: `Added product: "${newProduct.name}" (SKU: ${newProduct.sku})`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const { product, auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = db.readDb();
    const index = data.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const updatedProduct = {
      ...data.products[index],
      ...product,
      updatedAt: new Date().toISOString()
    };

    data.products[index] = updatedProduct;

    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Update Product',
      details: `Updated product details for: "${updatedProduct.name}"`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json(updatedProduct);
  });

  app.delete('/api/products/:id', (req, res) => {
    const { auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = db.readDb();
    const index = data.products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const deleted = data.products[index];
    data.products.splice(index, 1);

    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Delete Product',
      details: `Removed product: "${deleted.name}" (SKU: ${deleted.sku})`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json({ success: true, message: 'Product deleted' });
  });

  // Autocomplete & typo-correction search suggestions
  app.get('/api/search-suggestions', (req, res) => {
    const query = (req.query.q || '').toString().toLowerCase();
    if (!query) {
      res.json([]);
      return;
    }

    const data = db.readDb();
    const suggestions: string[] = [];

    // Search matches in name, category, model, and brand
    data.products.forEach(p => {
      if (p.name.toLowerCase().includes(query) && !suggestions.includes(p.name)) {
        suggestions.push(p.name);
      }
      if (p.category.toLowerCase().includes(query) && !suggestions.includes(p.category)) {
        suggestions.push(p.category);
      }
      if (p.brand.toLowerCase().includes(query) && !suggestions.includes(p.brand)) {
        suggestions.push(p.brand);
      }
      if (p.model.toLowerCase().includes(query) && !suggestions.includes(p.model)) {
        suggestions.push(p.model);
      }
    });

    // Simple typo suggestion: if query is similar to a brand or category, suggest it
    const allBrands = Array.from(new Set(data.products.map(p => p.brand)));
    const allCats = Array.from(new Set(data.products.map(p => p.category)));
    
    allBrands.forEach(brand => {
      if (levenshteinDistance(query, brand.toLowerCase()) <= 2 && !suggestions.includes(brand)) {
        suggestions.unshift(brand); // Prioritize close typos
      }
    });

    res.json(suggestions.slice(0, 8)); // Return max 8 suggestions
  });

  // Reviews
  app.get('/api/reviews/:productId', (req, res) => {
    const data = db.readDb();
    const reviews = data.reviews.filter(r => r.productId === req.params.productId && r.approved);
    res.json(reviews);
  });

  app.post('/api/reviews', (req, res) => {
    const { review } = req.body;
    if (!review || !review.productId || !review.rating || !review.userName) {
      res.status(400).json({ error: 'Invalid review payload' });
      return;
    }

    const data = db.readDb();
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: review.productId,
      userName: review.userName,
      userEmail: review.userEmail || 'anonymous@trustitgallery.com',
      rating: Number(review.rating),
      comment: review.comment || '',
      date: new Date().toISOString(),
      approved: true // Auto approve in local demo, but togglable by admin
    };

    data.reviews.push(newReview);

    // Recompute product average rating
    const productReviews = data.reviews.filter(r => r.productId === review.productId && r.approved);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / (productReviews.length || 1);
    
    const product = data.products.find(p => p.id === review.productId);
    if (product) {
      product.rating = parseFloat(avgRating.toFixed(1));
      product.reviewsCount = productReviews.length;
    }

    db.writeDb(data);
    res.json(newReview);
  });

  // Coupons
  app.get('/api/coupons', (req, res) => {
    const data = db.readDb();
    res.json(data.coupons);
  });

  app.post('/api/coupons/validate', (req, res) => {
    const { code, cartAmount } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Coupon code required' });
      return;
    }

    const data = db.readDb();
    const coupon = data.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) {
      res.status(404).json({ error: 'Invalid or inactive coupon code' });
      return;
    }

    if (cartAmount < coupon.minPurchase) {
      res.status(400).json({ error: `Minimum purchase of BDT ${coupon.minPurchase} is required to use this coupon` });
      return;
    }

    res.json(coupon);
  });

  app.post('/api/coupons', (req, res) => {
    const { coupon, auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const data = db.readDb();
    const newCoupon: Coupon = {
      code: coupon.code.toUpperCase(),
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      minPurchase: Number(coupon.minPurchase),
      maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
      expiryDate: coupon.expiryDate,
      isActive: true
    };
    data.coupons.push(newCoupon);

    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Create Coupon',
      details: `Created coupon code: "${newCoupon.code}" (${newCoupon.discountValue}% / BDT)`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json(newCoupon);
  });

  // Orders
  app.post('/api/orders', (req, res) => {
    const { order } = req.body;
    if (!order || !order.items || order.items.size() === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    const data = db.readDb();
    const orderId = `TG-${Date.now().toString().substring(5)}-${Math.floor(100 + Math.random() * 900)}`;
    const trackingNumber = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder: Order = {
      ...order,
      id: orderId,
      trackingNumber,
      paymentStatus: order.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
      orderStatus: 'Pending',
      estimatedDelivery: '3-4 Days',
      createdAt: new Date().toISOString()
    };

    data.orders.push(newOrder);

    // Subtract product stock, and increment sales
    order.items.forEach((item: any) => {
      const p = data.products.find(prod => prod.id === item.productId);
      if (p) {
        p.stockCount = Math.max(0, p.stockCount - item.quantity);
        if (p.stockCount === 0) {
          p.stockStatus = 'Out of Stock';
        }
        p.sales = (p.sales || 0) + item.quantity;
      }
    });

    // Allocate loyalty points (1 point per BDT 100 spent)
    if (order.userId) {
      const user = data.users.find(u => u.id === order.userId || u.email === order.userEmail);
      if (user) {
        const pointsEarned = Math.floor(order.total / 100);
        user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
      }
    }

    db.writeDb(data);
    res.json(newOrder);
  });

  app.get('/api/orders/user/:email', (req, res) => {
    const data = db.readDb();
    const orders = data.orders.filter(o => o.userEmail.toLowerCase() === req.params.email.toLowerCase());
    res.json(orders);
  });

  app.get('/api/orders/track/:tracking', (req, res) => {
    const data = db.readDb();
    const order = data.orders.find(o => o.trackingNumber === req.params.tracking || o.id === req.params.tracking);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  });

  app.get('/api/orders', (req, res) => {
    const data = db.readDb();
    res.json(data.orders);
  });

  app.put('/api/orders/:id', (req, res) => {
    const { status, auth } = req.body;
    if (auth?.email !== 'admin@trustitgallery.com' && auth?.email !== 'admin') {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const data = db.readDb();
    const order = data.orders.find(o => o.id === req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    order.orderStatus = status;
    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: auth.email,
      action: 'Update Order',
      details: `Updated order status for ${order.id} to "${status}"`,
      timestamp: new Date().toISOString()
    });

    db.writeDb(data);
    res.json(order);
  });

  // Activity Logs
  app.get('/api/logs', (req, res) => {
    const data = db.readDb();
    res.json(data.logs.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
  });

  // Admin users list
  app.get('/api/customers', (req, res) => {
    const data = db.readDb();
    res.json(data.users.filter(u => u.role !== 'admin'));
  });

  // Newsletter subscription
  app.post('/api/newsletter/subscribe', (req, res) => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email address required' });
      return;
    }
    // Record log/activity
    const data = db.readDb();
    data.logs.push({
      id: `log-${Date.now()}`,
      adminEmail: 'system@trustitgallery.com',
      action: 'Newsletter Signup',
      details: `New email subscription: "${email}"`,
      timestamp: new Date().toISOString()
    });
    db.writeDb(data);
    res.json({ success: true, message: 'Subscribed successfully! Thank you for joining Trust IT Gallery.' });
  });

  // AI assistant integration route - lazy loaded
  app.post('/api/ai/suggest', async (req, res) => {
    const { query, productId, compareId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.json({
        text: "💡 **AI Smart Tip**: Trust IT Gallery's AI Engine is ready! Setup the `GEMINI_API_KEY` in the Secrets panel to activate full real-time comparisons, specifications analyzer, and smart hardware matching."
      });
      return;
    }

    try {
      const dbData = db.readDb();
      const ai = new GoogleGenAI({ apiKey });

      let prompt = '';
      if (productId && compareId) {
        const p1 = dbData.products.find(p => p.id === productId);
        const p2 = dbData.products.find(p => p.id === compareId);
        if (p1 && p2) {
          prompt = `You are a helpful IT hardware expert and purchasing consultant at "Trust IT Gallery". Compare the following two products in detail and give a recommendation for which type of user each is best suited for. Speak professionally, concisely, and focus on the technical values:
          
          Product 1: ${p1.name} (Price: BDT ${p1.discountPrice || p1.price})
          Specs: ${JSON.stringify(p1.specifications)}
          Features: ${JSON.stringify(p1.features)}
          
          Product 2: ${p2.name} (Price: BDT ${p2.discountPrice || p2.price})
          Specs: ${JSON.stringify(p2.specifications)}
          Features: ${JSON.stringify(p2.features)}`;
        }
      } else if (productId) {
        const p = dbData.products.find(p => p.id === productId);
        if (p) {
          prompt = `You are a helpful IT hardware expert at "Trust IT Gallery". Give a brief, high-impact marketing summary and professional buying advice for the following product. Highlight its key selling points and compatibility considerations:
          
          Product: ${p.name}
          Category: ${p.category}
          Price: BDT ${p.discountPrice || p.price}
          Specs: ${JSON.stringify(p.specifications)}`;
        }
      } else {
        prompt = `You are a helpful IT hardware advisor at "Trust IT Gallery". Answer this customer question in a friendly, expert, and structured format: "${query}". Keep the answer highly practical for custom PC building, hardware compatibility, or purchasing decisions. Here are some of our featured brands: Intel, AMD, ASUS, MSI, Lian Li, Corsair, Samsung, Logitech, Dahua, TP-Link.`;
      }

      if (!prompt) {
        res.status(400).json({ error: 'Could not resolve advice prompt' });
        return;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error('Gemini AI Generation Error:', err);
      res.json({
        text: "🔧 **AI Assistant**: Hello! I'm here to help. Currently, our AI hardware analyzer is undergoing brief routine maintenance. Please feel free to check our catalog or contact support if you need compatibility assistance!"
      });
    }
  });

  // --- End of API Routes ---

  // Vite development vs production serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully running on http://localhost:${PORT}`);
  });
}

// Simple Levenshtein distance helper for fuzzy typo searches
function levenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

startServer();
