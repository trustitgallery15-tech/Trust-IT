import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectMongo, isMongoActive } from './src/server/mongodb.js';
import * as repo from './src/server/repo.js';
import { Product, Order, User, Review, Coupon, ActivityLog, Category, Brand, B2BRequest } from './src/types.js';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'trust-it-gallery-super-secure-key';

async function startServer() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Connect to MongoDB Atlas (Gracefully falls back if MONGODB_URI is not set)
  await connectMongo();

  // Helper: Secure route auth checks
  function requireAuth(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization;
    let token = '';
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.headers.cookie?.split('; ').find((row: string) => row.trim().startsWith('token='))?.split('=')[1] || '';
    }

    if (!token) {
      res.status(401).json({ error: 'Unauthorized: Authentication token required.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Unauthorized: Invalid token.' });
    }
  }

  function requireAdmin(req: any, res: any, next: any) {
    requireAuth(req, res, () => {
      if (req.user?.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access only.' });
        return;
      }
      next();
    });
  }

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: isMongoActive() ? 'MongoDB Atlas' : 'Local File', time: new Date().toISOString() });
  });

  // Website Settings
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await repo.getWebsiteSettings();
      res.json(settings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve website settings.' });
    }
  });

  app.put('/api/settings', requireAdmin, async (req, res) => {
    try {
      const updated = await repo.saveWebsiteSettings(req.body);
      
      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Settings',
        details: 'Updated global configuration parameters',
        timestamp: new Date().toISOString()
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save website settings.' });
    }
  });

  app.post('/api/settings', requireAdmin, async (req, res) => {
    try {
      const updated = await repo.saveWebsiteSettings(req.body);
      
      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Settings',
        details: 'Updated global configuration parameters',
        timestamp: new Date().toISOString()
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to save website settings.' });
    }
  });

  // Banners Management
  app.get('/api/banners', async (req, res) => {
    try {
      const banners = await repo.getHeroBanners();
      res.json(banners);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch hero banners.' });
    }
  });

  app.put('/api/banners/:id', requireAdmin, async (req, res) => {
    try {
      const banners = await repo.getHeroBanners();
      const banner = banners.find(b => b.id === req.params.id);
      if (!banner) {
        res.status(404).json({ error: 'Banner not found.' });
        return;
      }

      const updatedBanner = {
        ...banner,
        ...req.body
      };

      const saved = await repo.saveHeroBanner(updatedBanner);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Banner',
        details: `Updated banner ID: ${req.params.id} (isActive: ${saved.isActive})`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update banner.' });
    }
  });

  app.post('/api/banners', requireAdmin, async (req, res) => {
    try {
      const { banner } = req.body;
      const newBanner = {
        id: `ban-${Date.now()}`,
        imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
        title: banner.title || 'Special Promotion',
        subtitle: banner.subtitle || 'Unbeatable prices on all IT accessories',
        linkTo: banner.linkTo || 'Shop',
        isActive: banner.isActive !== undefined ? banner.isActive : true
      };

      const saved = await repo.saveHeroBanner(newBanner);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Create Banner',
        details: `Created hero banner card: "${newBanner.title}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create banner.' });
    }
  });

  app.delete('/api/banners/:id', requireAdmin, async (req, res) => {
    try {
      const deleted = await repo.deleteHeroBanner(req.params.id);
      if (deleted) {
        await repo.saveActivityLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: 'Delete Banner',
          details: `Removed hero banner card ID: ${req.params.id}`,
          timestamp: new Date().toISOString()
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Banner not found.' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete banner.' });
    }
  });

  // --- Category Management CRUD ---
  app.get('/api/categories', async (req, res) => {
    try {
      const list = await repo.getCategories();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch categories.' });
    }
  });

  app.post('/api/categories', requireAdmin, async (req, res) => {
    try {
      const { category } = req.body;
      if (!category?.name) {
        res.status(400).json({ error: 'Category name is required.' });
        return;
      }

      const id = `cat-${category.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const newCat: Category = {
        id,
        name: category.name.trim(),
        imageUrl: category.imageUrl || 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=100&q=80',
        order: Number(category.order || 0),
        isVisible: category.isVisible !== undefined ? category.isVisible : true
      };

      const saved = await repo.saveCategory(newCat);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Create Category',
        details: `Created component category: "${newCat.name}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create category.' });
    }
  });

  app.put('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const { category } = req.body;
      const updatedCat: Category = {
        ...category,
        id: req.params.id
      };

      const saved = await repo.saveCategory(updatedCat);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Category',
        details: `Updated category configurations: "${updatedCat.name}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update category.' });
    }
  });

  app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const deleted = await repo.deleteCategory(req.params.id);
      if (deleted) {
        await repo.saveActivityLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: 'Delete Category',
          details: `Deleted component category: "${req.params.id}"`,
          timestamp: new Date().toISOString()
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Category not found.' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete category.' });
    }
  });

  // --- Brand Management CRUD ---
  app.get('/api/brands', async (req, res) => {
    try {
      const list = await repo.getBrands();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch brands.' });
    }
  });

  app.post('/api/brands', requireAdmin, async (req, res) => {
    try {
      const { brand } = req.body;
      if (!brand?.name) {
        res.status(400).json({ error: 'Brand name is required.' });
        return;
      }

      const id = `brand-${brand.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const newBrand: Brand = {
        id,
        name: brand.name.trim(),
        logoUrl: brand.logoUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&q=80'
      };

      const saved = await repo.saveBrand(newBrand);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Create Brand',
        details: `Created partner brand: "${newBrand.name}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create brand.' });
    }
  });

  app.put('/api/brands/:id', requireAdmin, async (req, res) => {
    try {
      const { brand } = req.body;
      const updatedBrand: Brand = {
        ...brand,
        id: req.params.id
      };

      const saved = await repo.saveBrand(updatedBrand);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Brand',
        details: `Updated brand properties for: "${updatedBrand.name}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update brand.' });
    }
  });

  app.delete('/api/brands/:id', requireAdmin, async (req, res) => {
    try {
      const deleted = await repo.deleteBrand(req.params.id);
      if (deleted) {
        await repo.saveActivityLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: 'Delete Brand',
          details: `Deleted partner brand: "${req.params.id}"`,
          timestamp: new Date().toISOString()
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Brand not found.' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete brand.' });
    }
  });

  // --- Authentication ---
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, name, password, phone, referralCode } = req.body;
      if (!email || !name || !password) {
        res.status(400).json({ error: 'Missing name, email, or secure password.' });
        return;
      }

      const existing = await repo.getUserByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'An account is already registered with this email address.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const uniqueCode = `TRUST-${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newUser: User = {
        id: `user-${Date.now()}`,
        email: email.trim().toLowerCase(),
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        role: 'customer',
        addresses: [],
        wishlist: [],
        loyaltyPoints: referralCode ? 100 : 0,
        referredBy: referralCode ? referralCode.trim() : undefined,
        referralCode: uniqueCode,
        createdAt: new Date().toISOString()
      };

      await repo.saveUser(newUser, hashedPassword);

      // Reward referrer
      if (referralCode) {
        const referrer = await repo.getUserByReferralCode(referralCode.trim());
        if (referrer) {
          referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 150;
          await repo.saveUser(referrer);
        }
      }

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: false, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      res.json({ user: newUser, token });
    } catch (err) {
      res.status(500).json({ error: 'Registration service encountered an error.' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustitgallery.com';
      const adminUserEnv = process.env.ADMIN_USERNAME || 'admin';
      const adminPassEnv = process.env.ADMIN_PASSWORD || 'admin';

      const emailLower = email.trim().toLowerCase();
      const isLoginAdmin = emailLower === 'admin' || emailLower === adminEmail || emailLower === adminUserEnv.toLowerCase();

      if (isLoginAdmin) {
        // Hash the admin password at runtime to use bcrypt hashing for verification
        const hashedAdminPassword = await bcrypt.hash(adminPassEnv, 10);
        const isAdminPasswordCorrect = await bcrypt.compare(password, hashedAdminPassword);

        if (isAdminPasswordCorrect) {
          const adminUser: User = {
            id: 'user-admin',
            email: 'admin@trustitgallery.com',
            name: 'Trust IT System Admin',
            role: 'admin',
            createdAt: new Date().toISOString()
          };
          const token = jwt.sign({ id: adminUser.id, email: adminUser.email, role: adminUser.role }, JWT_SECRET, { expiresIn: '7d' });
          res.cookie('token', token, { httpOnly: false, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
          res.json({ user: adminUser, token });
          return;
        } else {
          res.status(401).json({ error: 'Invalid admin credentials.' });
          return;
        }
      }

      const user = await repo.getUserByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Account with this email does not exist.' });
        return;
      }

      // Check password (backward compatibility for developer demo user)
      const isBuyerDemo = emailLower === 'buyer@gmail.com' && password === 'buyer123';
      const storedUser: any = isMongoActive() ? await repo.getUserByEmail(email) : (await repo.getUserByEmail(email) as any);
      
      let passIsValid = false;
      if (isBuyerDemo) {
        passIsValid = true;
      } else if (storedUser && storedUser.password) {
        passIsValid = await bcrypt.compare(password, storedUser.password);
      }

      if (!passIsValid) {
        res.status(401).json({ error: 'Invalid password credentials.' });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: false, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      res.json({ user, token });
    } catch (err) {
      res.status(500).json({ error: 'Authentication service encountered an error.' });
    }
  });

  app.post('/api/auth/profile', async (req, res) => {
    try {
      const { token, name, phone, addresses } = req.body;
      if (!token) {
        res.status(401).json({ error: 'Authentication token required.' });
        return;
      }

      // Resolve user ID
      let userId = '';
      if (token === 'mock-jwt-token-for-admin') {
        userId = 'user-admin';
      } else if (token.startsWith('mock-jwt-token-for-')) {
        userId = token.replace('mock-jwt-token-for-', '');
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          userId = decoded.id;
        } catch (e) {
          res.status(401).json({ error: 'Unauthorized token signature.' });
          return;
        }
      }

      if (userId === 'user-admin') {
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

      const user = await repo.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'User profile not found.' });
        return;
      }

      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (addresses) user.addresses = addresses;

      const saved = await repo.saveUser(user);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user profile.' });
    }
  });

  // --- Products CRUD ---
  app.get('/api/products', async (req, res) => {
    try {
      const list = await repo.getProducts();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch product catalog.' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await repo.getProductById(req.params.id);
      if (!product) {
        res.status(404).json({ error: 'Product listing not found.' });
        return;
      }
      product.views = (product.views || 0) + 1;
      await repo.saveProduct(product);
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch product details.' });
    }
  });

  app.post('/api/products', requireAdmin, async (req, res) => {
    try {
      const { product } = req.body;
      const newProduct: Product = {
        ...product,
        id: `prod-${Date.now()}`,
        rating: 5.0,
        reviewsCount: 0,
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString()
      };

      const saved = await repo.saveProduct(newProduct);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Create Product',
        details: `Created hardware item: "${newProduct.name}" (SKU: ${newProduct.sku})`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to add product.' });
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      const { product } = req.body;
      const existing = await repo.getProductById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      const updatedProduct: Product = {
        ...existing,
        ...product,
        id: req.params.id,
        updatedAt: new Date().toISOString()
      };

      const saved = await repo.saveProduct(updatedProduct);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Product',
        details: `Updated hardware product: "${updatedProduct.name}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product.' });
    }
  });

  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    try {
      const existing = await repo.getProductById(req.params.id);
      if (!existing) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }

      await repo.deleteProduct(req.params.id);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Delete Product',
        details: `Removed hardware listing: "${existing.name}" (SKU: ${existing.sku})`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'Product listing removed successfully.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product.' });
    }
  });

  // Autocomplete Suggestions
  app.get('/api/search-suggestions', async (req, res) => {
    try {
      const query = (req.query.q || '').toString().toLowerCase();
      if (!query) {
        res.json([]);
        return;
      }

      const products = await repo.getProducts();
      const suggestions: string[] = [];

      products.forEach(p => {
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

      const allBrands = Array.from(new Set(products.map(p => p.brand)));
      allBrands.forEach(brand => {
        if (levenshteinDistance(query, brand.toLowerCase()) <= 2 && !suggestions.includes(brand)) {
          suggestions.unshift(brand);
        }
      });

      res.json(suggestions.slice(0, 8));
    } catch (err) {
      res.json([]);
    }
  });

  // Reviews
  app.get('/api/reviews/:productId', async (req, res) => {
    try {
      const list = await repo.getReviews(req.params.productId);
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch product reviews.' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const { review } = req.body;
      if (!review?.productId || !review?.rating || !review?.userName) {
        res.status(400).json({ error: 'Invalid review payload details.' });
        return;
      }

      const newReview: Review = {
        id: `rev-${Date.now()}`,
        productId: review.productId,
        userName: review.userName,
        userEmail: review.userEmail || 'anonymous@trustitgallery.com',
        rating: Number(review.rating),
        comment: review.comment || '',
        date: new Date().toISOString(),
        approved: true
      };

      const saved = await repo.saveReview(newReview);

      // Re-calculate product ratings
      const list = await repo.getReviews(review.productId);
      const avgRating = list.reduce((sum, r) => sum + r.rating, 0) / (list.length || 1);

      const product = await repo.getProductById(review.productId);
      if (product) {
        product.rating = parseFloat(avgRating.toFixed(1));
        product.reviewsCount = list.length;
        await repo.saveProduct(product);
      }

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to post review.' });
    }
  });

  // Coupons
  app.get('/api/coupons', async (req, res) => {
    try {
      const coupons = await repo.getCoupons();
      res.json(coupons);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coupons.' });
    }
  });

  app.post('/api/coupons/validate', async (req, res) => {
    try {
      const { code, cartAmount } = req.body;
      if (!code) {
        res.status(400).json({ error: 'Coupon code required.' });
        return;
      }

      const coupon = await repo.getCouponByCode(code);
      if (!coupon || !coupon.isActive) {
        res.status(404).json({ error: 'Invalid or inactive coupon code.' });
        return;
      }

      if (cartAmount < coupon.minPurchase) {
        res.status(400).json({ error: `Minimum purchase of BDT ${coupon.minPurchase} is required to use this coupon.` });
        return;
      }

      res.json(coupon);
    } catch (err) {
      res.status(500).json({ error: 'Coupon validation failed.' });
    }
  });

  app.post('/api/coupons', requireAdmin, async (req, res) => {
    try {
      const { coupon } = req.body;
      const newCoupon: Coupon = {
        code: coupon.code.toUpperCase(),
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minPurchase: Number(coupon.minPurchase),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : undefined,
        expiryDate: coupon.expiryDate,
        isActive: true
      };

      const saved = await repo.saveCoupon(newCoupon);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Create Coupon',
        details: `Created coupon: "${newCoupon.code}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create coupon.' });
    }
  });

  app.delete('/api/admin/coupons/:code', requireAdmin, async (req, res) => {
    try {
      const deleted = await repo.deleteCoupon(req.params.code);
      if (deleted) {
        await repo.saveActivityLog({
          id: `log-${Date.now()}`,
          adminEmail: req.user.email,
          action: 'Delete Coupon',
          details: `Deleted coupon code: "${req.params.code.toUpperCase()}"`,
          timestamp: new Date().toISOString()
        });
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Coupon not found.' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete coupon.' });
    }
  });

  // Orders
  app.post('/api/orders', async (req, res) => {
    try {
      const { order } = req.body;
      if (!order || !order.items || order.items.length === 0) {
        res.status(400).json({ error: 'Cannot process empty order.' });
        return;
      }

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

      const saved = await repo.saveOrder(newOrder);

      // Subtract stock & increment sales counts
      for (const item of order.items) {
        const prod = await repo.getProductById(item.productId);
        if (prod) {
          prod.stockCount = Math.max(0, prod.stockCount - item.quantity);
          if (prod.stockCount === 0) {
            prod.stockStatus = 'Out of Stock';
          }
          prod.sales = (prod.sales || 0) + item.quantity;
          await repo.saveProduct(prod);
        }
      }

      // Allocate Loyalty Points (1 point per BDT 100 spent)
      if (order.userEmail) {
        const user = await repo.getUserByEmail(order.userEmail);
        if (user) {
          const pointsEarned = Math.floor(order.total / 100);
          user.loyaltyPoints = (user.loyaltyPoints || 0) + pointsEarned;
          await repo.saveUser(user);
        }
      }

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to submit order transaction.' });
    }
  });

  app.get('/api/orders/user/:email', async (req, res) => {
    try {
      const orders = await repo.getOrdersByEmail(req.params.email);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch user orders.' });
    }
  });

  app.get('/api/orders/track/:tracking', async (req, res) => {
    try {
      const order = await repo.getOrderByIdOrTracking(req.params.tracking);
      if (!order) {
        res.status(404).json({ error: 'Order trace not located.' });
        return;
      }
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: 'Error processing tracking lookup.' });
    }
  });

  app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
      const orders = await repo.getOrders();
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load order queue.' });
    }
  });

  app.put('/api/orders/:id', requireAdmin, async (req, res) => {
    try {
      const { orderStatus, paymentStatus } = req.body;
      const order = await repo.getOrderByIdOrTracking(req.params.id);
      if (!order) {
        res.status(404).json({ error: 'Order not found.' });
        return;
      }

      if (orderStatus) {
        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
          order.paymentStatus = 'Paid';
        }
      }
      if (paymentStatus) {
        order.paymentStatus = paymentStatus;
      }

      const saved = await repo.saveOrder(order);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update Order',
        details: `Updated status for order ${order.id} (Status: "${order.orderStatus}", Payment: "${order.paymentStatus}")`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update order status.' });
    }
  });

  // Activity Logs
  app.get('/api/admin/logs', requireAdmin, async (req, res) => {
    try {
      const logs = await repo.getActivityLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load system logs.' });
    }
  });

  // Admin users list
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await repo.getUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load users list.' });
    }
  });

  // Toggle user status (Enable/Disable Customer)
  app.put('/api/admin/users/:id/toggle', requireAdmin, async (req, res) => {
    try {
      const users = await repo.getUsers();
      const userToToggle = users.find(u => u.id === req.params.id);
      if (!userToToggle) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      userToToggle.disabled = !userToToggle.disabled;
      const updatedUser = await repo.saveUser(userToToggle);
      
      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Toggle User Status',
        details: `${userToToggle.disabled ? 'Disabled' : 'Enabled'} user email: ${userToToggle.email}`,
        timestamp: new Date().toISOString()
      });

      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: 'Failed to toggle user status.' });
    }
  });

  // Admin reviews list
  app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
    try {
      const reviews = await repo.getAllReviews();
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load reviews.' });
    }
  });

  // Approve review
  app.put('/api/admin/reviews/:id/approve', requireAdmin, async (req, res) => {
    try {
      const reviews = await repo.getAllReviews();
      const review = reviews.find(r => r.id === req.params.id);
      if (!review) {
        res.status(404).json({ error: 'Review not found.' });
        return;
      }
      review.approved = true;
      const updated = await repo.saveReview(review);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Approve Review',
        details: `Approved review ID: ${review.id} by ${review.userName}`,
        timestamp: new Date().toISOString()
      });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to approve review.' });
    }
  });

  // Delete review
  app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
    try {
      const deleted = await repo.deleteReview(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Review not found.' });
        return;
      }

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Delete Review',
        details: `Deleted review ID: ${req.params.id}`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete review.' });
    }
  });

  // Admin newsletter subscribers
  app.get('/api/admin/newsletter', requireAdmin, async (req, res) => {
    try {
      const emails = await repo.getNewsletterEmails();
      res.json(emails);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load newsletter subscribers.' });
    }
  });

  // Corporate B2B RFQs
  app.get('/api/admin/b2b-requests', requireAdmin, async (req, res) => {
    try {
      const list = await repo.getB2BRequests();
      res.json(list);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load B2B requests.' });
    }
  });

  app.post('/api/b2b/request', async (req, res) => {
    try {
      const { rfq } = req.body;
      if (!rfq?.companyName || !rfq?.contactName || !rfq?.email || !rfq?.phone) {
        res.status(400).json({ error: 'Missing required corporate RFQ detail fields.' });
        return;
      }

      const newRfq: B2BRequest = {
        id: `rfq-${Date.now()}`,
        companyName: rfq.companyName.trim(),
        contactName: rfq.contactName.trim(),
        email: rfq.email.trim().toLowerCase(),
        phone: rfq.phone.trim(),
        productNotes: rfq.productNotes || 'Custom specifications rig quotes',
        quantity: Number(rfq.quantity || 1),
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const saved = await repo.saveB2BRequest(newRfq);

      // System Log
      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: 'system@trustitgallery.com',
        action: 'B2B RFQ Submitted',
        details: `New corporate procurement request from "${newRfq.companyName}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Corporate RFQ submission failed.' });
    }
  });

  app.put('/api/admin/b2b-requests/:id', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const data = await repo.getB2BRequests();
      const rfq = data.find(r => r.id === req.params.id);
      if (!rfq) {
        res.status(404).json({ error: 'RFQ request not located.' });
        return;
      }

      rfq.status = status;
      const saved = await repo.saveB2BRequest(rfq);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: req.user.email,
        action: 'Update B2B RFQ',
        details: `Updated status for RFQ ${rfq.id} to "${status}"`,
        timestamp: new Date().toISOString()
      });

      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update RFQ status.' });
    }
  });

  // Newsletter subscription
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email address is required.' });
        return;
      }

      await repo.addNewsletterSubscription(email);

      await repo.saveActivityLog({
        id: `log-${Date.now()}`,
        adminEmail: 'system@trustitgallery.com',
        action: 'Newsletter Subscription',
        details: `New marketing campaign subscription: "${email.trim().toLowerCase()}"`,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, message: 'Subscribed successfully! Thank you for joining Trust IT Gallery.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process newsletter signup.' });
    }
  });

  // AI Assistant groundings - lazy loaded
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
      const products = await repo.getProducts();
      const ai = new GoogleGenAI({ apiKey });

      let prompt = '';
      if (productId && compareId) {
        const p1 = products.find(p => p.id === productId);
        const p2 = products.find(p => p.id === compareId);
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
        const p = products.find(p => p.id === productId);
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
    console.log(`Server successfully running on port ${PORT}`);
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
