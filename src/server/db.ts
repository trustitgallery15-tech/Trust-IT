import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, User, Order, Review, Coupon, HeroBanner, ActivityLog, WebsiteSettings } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  products: Product[];
  users: User[];
  orders: Order[];
  reviews: Review[];
  coupons: Coupon[];
  banners: HeroBanner[];
  logs: ActivityLog[];
  settings: WebsiteSettings;
}

// Initial seed data to ensure the platform feels like a real IT shop instantly
const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Intel Core i9-14900K 14th Gen Processor',
    brand: 'Intel',
    category: 'Processors (CPU)',
    model: 'i9-14900K',
    sku: 'CPU-INTEL-14900K',
    price: 68000,
    discountPrice: 64900,
    stockStatus: 'In Stock',
    stockCount: 15,
    rating: 4.9,
    reviewsCount: 24,
    description: 'The Intel Core i9-14900K is the ultimate 14th generation desktop processor featuring 24 cores (8 P-cores and 16 E-cores) and up to 6.0 GHz thermal velocity boost. Designed for gamers and creators looking for maximum performance.',
    images: [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      '24 Cores & 32 Threads',
      'Max Turbo Frequency 6.0 GHz',
      'Intel Smart Cache (L3): 36MB',
      'Unlocked for overclocking'
    ],
    specifications: {
      'Socket Supported': 'LGA1700',
      'Total Cores': '24',
      'Performance-cores': '8',
      'Efficient-cores': '16',
      'Processor Base Power': '125W',
      'Maximum Turbo Power': '253W'
    },
    warranty: '3 Years Warranty',
    socket: 'LGA1700',
    processor: 'Intel Core i9',
    estimatedDelivery: '2-3 Days',
    views: 450,
    sales: 12
  },
  {
    id: 'prod-2',
    name: 'AMD Ryzen 7 7800X3D Gaming Processor',
    brand: 'AMD',
    category: 'Processors (CPU)',
    model: 'Ryzen 7 7800X3D',
    sku: 'CPU-AMD-7800X3D',
    price: 52000,
    discountPrice: 48500,
    stockStatus: 'In Stock',
    stockCount: 22,
    rating: 5.0,
    reviewsCount: 38,
    description: 'The AMD Ryzen 7 7800X3D is the absolute best gaming processor in the world, featuring 8 cores, 16 threads, and AMD 3D V-Cache technology with an incredible 96MB L3 cache for hyper-responsive gaming framerates.',
    images: [
      'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      '8 Cores & 16 Threads',
      'AMD 3D V-Cache Technology',
      '96MB L3 Cache',
      'TSMC 5nm FinFET process'
    ],
    specifications: {
      'Socket Supported': 'AM5',
      'Total Cores': '8',
      'Threads': '16',
      'Base Clock': '4.2GHz',
      'Boost Clock': 'Up to 5.0GHz',
      'TDP': '120W'
    },
    warranty: '3 Years Warranty',
    socket: 'AM5',
    processor: 'AMD Ryzen 7',
    estimatedDelivery: '1-2 Days',
    views: 890,
    sales: 34
  },
  {
    id: 'prod-3',
    name: 'ASUS ROG Strix GeForce RTX 4080 Super OC 16GB GDDR6X',
    brand: 'ASUS',
    category: 'Graphics Cards',
    model: 'ROG-STRIX-RTX4080S-O16G',
    sku: 'GPU-ASUS-4080S-STRIX',
    price: 165000,
    discountPrice: 158000,
    stockStatus: 'In Stock',
    stockCount: 8,
    rating: 4.8,
    reviewsCount: 15,
    description: 'The ASUS ROG Strix GeForce RTX 4080 SUPER 16GB GDDR6X OC Edition brings a majestic design with high-octane thermal performance. Powered by NVIDIA DLSS3, ultra-efficient Ada Lovelace arch, and full ray tracing capabilities.',
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'NVIDIA Ada Lovelace Streaming Multiprocessors',
      '4th Generation Tensor Cores with DLSS 3',
      'Patented Vapor Chamber with milled heatsink',
      'Aura Sync RGB lighting'
    ],
    specifications: {
      'Video Memory': '16GB GDDR6X',
      'Engine Clock': 'OC Mode: 2670 MHz',
      'CUDA Cores': '10240',
      'Memory Interface': '256-bit',
      'Power Connectors': '1 x 16-pin'
    },
    warranty: '3 Years Warranty',
    rgb: true,
    estimatedDelivery: '2-4 Days',
    views: 620,
    sales: 5
  },
  {
    id: 'prod-4',
    name: 'MSI MAG B650 TOMAHAWK WIFI AM5 Motherboard',
    brand: 'MSI',
    category: 'Motherboards',
    model: 'MAG B650 TOMAHAWK WIFI',
    sku: 'MB-MSI-B650-TOMAHAWK',
    price: 28500,
    discountPrice: 26900,
    stockStatus: 'In Stock',
    stockCount: 18,
    rating: 4.7,
    reviewsCount: 19,
    description: 'MSI MAG B650 TOMAHAWK WIFI is built for gamers who demand high performance and heavy durability. Features 14+2+1 Duet Rail Power System, dual 8-pin CPU power connectors, Core Boost, and DDR5 Memory Boost support.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Supports AMD Ryzen 7000/8000 Series Processors',
      'DDR5 Memory Support, up to 7600+(OC) MHz',
      'Premium Thermal Solution: Extended Heatsink Design',
      'Lightning Gen 4 PCIe and M.2 solutions'
    ],
    specifications: {
      'Socket Supported': 'AM5',
      'Chipset': 'AMD B650',
      'Memory Slot': '4x DDR5 DIMM',
      'Form Factor': 'ATX',
      'Wireless LAN': 'AMD Wi-Fi 6E, Bluetooth 5.3'
    },
    warranty: '3 Years Warranty',
    socket: 'AM5',
    estimatedDelivery: '2-3 Days',
    views: 310,
    sales: 14
  },
  {
    id: 'prod-5',
    name: 'Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz RAM',
    brand: 'Corsair',
    category: 'RAM',
    model: 'Vengeance RGB DDR5 32GB',
    sku: 'RAM-CORSAIR-VEN-32G-DDR5',
    price: 16500,
    discountPrice: 15200,
    stockStatus: 'In Stock',
    stockCount: 40,
    rating: 4.9,
    reviewsCount: 42,
    description: 'CORSAIR VENGEANCE RGB DDR5 memory delivers DDR5 performance, higher frequencies, and greater capacities optimized for Intel & AMD motherboards while illuminating your PC with dynamic, individually addressable ten-zone RGB lighting.',
    images: [
      'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Dynamic Ten-Zone RGB Lighting',
      'Onboard Voltage Regulation for Overclocking',
      'Custom Intel XMP 3.0 / AMD EXPO Profiles',
      'High-performance PCB and aluminum heatspreader'
    ],
    specifications: {
      'Memory Size': '32GB (2 x 16GB)',
      'Memory Type': 'DDR5',
      'Frequency': '6000MHz',
      'Tested Latency': '36-44-44-96',
      'Voltage': '1.40V'
    },
    warranty: 'Lifetime Warranty',
    rgb: true,
    capacity: '32GB',
    estimatedDelivery: '1-2 Days',
    views: 520,
    sales: 28
  },
  {
    id: 'prod-6',
    name: 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD',
    brand: 'Samsung',
    category: 'SSD',
    model: '990 PRO 2TB',
    sku: 'SSD-SAMSUNG-990P-2TB',
    price: 24500,
    discountPrice: 22800,
    stockStatus: 'In Stock',
    stockCount: 30,
    rating: 4.9,
    reviewsCount: 51,
    description: 'Reach maximum performance of PCIe 4.0. Experience long-lasting, opponent-blasting speed. The Samsung 990 PRO is optimized for smart thermal control, offering read speeds up to 7450 MB/s and write speeds up to 6900 MB/s.',
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Blazing Read speeds up to 7450 MB/s',
      'Write speeds up to 6900 MB/s',
      'Power efficiency up to 50% improved over 980 Pro',
      'Smart Thermal Control'
    ],
    specifications: {
      'Capacity': '2TB',
      'Interface': 'PCIe Gen 4.0 x4, NVMe 2.0',
      'Form Factor': 'M.2 (2280)',
      'Sequential Read': 'Up to 7450 MB/s',
      'Sequential Write': 'Up to 6900 MB/s'
    },
    warranty: '5 Years Warranty',
    capacity: '2TB',
    storage: 'SSD',
    estimatedDelivery: '2-3 Days',
    views: 730,
    sales: 45
  },
  {
    id: 'prod-7',
    name: 'Lian Li Galahad II Trinity SL-INF 360 AIO Liquid CPU Cooler',
    brand: 'Lian Li',
    category: 'CPU Coolers',
    model: 'Galahad II Trinity SL-INF 360',
    sku: 'CLR-LIANLI-GA-II-360',
    price: 21500,
    discountPrice: 19800,
    stockStatus: 'In Stock',
    stockCount: 12,
    rating: 4.8,
    reviewsCount: 16,
    description: 'The Lian Li Galahad II Trinity SL-INF 360 is an outstanding closed-loop liquid cooler featuring customized infinity mirror pump caps and pre-installed UNI FAN SL-INF fans for unparalleled visual customization and thermal efficiency.',
    images: [
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Three interchangeable look pump caps included',
      'UNI FAN SL-INF 120 fans pre-installed',
      '45-degree tubing connector rotating 360 degrees',
      'Advanced cooling radiator and copper cold plate'
    ],
    specifications: {
      'Radiator Size': '360mm',
      'Fan Speed': '2100 RPM',
      'Fan Airflow': '61.3 CFM',
      'Support': 'Intel LGA1700/1200/115X, AMD AM5/AM4'
    },
    warranty: '5 Years Warranty',
    rgb: true,
    estimatedDelivery: '1-3 Days',
    views: 290,
    sales: 8
  },
  {
    id: 'prod-8',
    name: 'Antec NE1000G M 1000W 80 Plus Gold Full Modular Power Supply',
    brand: 'Antec',
    category: 'Power Supplies',
    model: 'NE1000G M ATX 3.0',
    sku: 'PSU-ANTEC-NE1000G',
    price: 18500,
    discountPrice: 16900,
    stockStatus: 'In Stock',
    stockCount: 14,
    rating: 4.7,
    reviewsCount: 11,
    description: 'The Antec NeoECO 1000W Modular power supply is engineered to meet the highest ATX 3.0 standards, delivering PCIe 5.0 compatibility, 80 Plus Gold certified efficiency, and superior silence with a 120mm FDB fan.',
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'ATX 3.0 & PCIe 5.0 Compliant',
      '80 PLUS Gold Certified',
      '100% Japanese Heavy-Duty Capacitors',
      'Full Modular Cable Management'
    ],
    specifications: {
      'Wattage': '1000W',
      'Efficiency': '80 Plus Gold',
      'Modular': 'Full Modular',
      'Fan Size': '120mm Fluid Dynamic Bearing',
      'Dimensions': '140mm x 150mm x 86mm'
    },
    warranty: '10 Years Warranty',
    estimatedDelivery: '2-3 Days',
    views: 180,
    sales: 6
  },
  {
    id: 'prod-9',
    name: 'GIGABYTE G27Q 27" 144Hz QHD IPS Gaming Monitor',
    brand: 'GIGABYTE',
    category: 'Monitors',
    model: 'G27Q',
    sku: 'MON-GIGA-G27Q-27',
    price: 38500,
    discountPrice: 35500,
    stockStatus: 'In Stock',
    stockCount: 15,
    rating: 4.8,
    reviewsCount: 29,
    description: 'As an unseen player, monitor is often being underestimated. The truth is monitors form as a synergistic effect and bring out the best performance of PC components. GIGABYTE gaming monitors offer the ultimate specifications and quality.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      '27" QHD 2560 x 1440 IPS Display',
      '144Hz Refresh Rate & 1ms Response Time',
      '92% DCI-P3 Wide Color Gamut & VESA DisplayHDR 400',
      'AMD FreeSync Premium Compatible'
    ],
    specifications: {
      'Screen Size': '27 Inch',
      'Resolution': '2560 x 1440 (QHD)',
      'Panel Type': 'IPS',
      'Refresh Rate': '144Hz',
      'Response Time': '1ms (MPRT)'
    },
    warranty: '3 Years Warranty',
    estimatedDelivery: '1-3 Days',
    views: 640,
    sales: 20
  },
  {
    id: 'prod-10',
    name: 'Logitech G502 LIGHTSPEED Wireless Gaming Mouse',
    brand: 'Logitech',
    category: 'Mice',
    model: 'G502 LIGHTSPEED',
    sku: 'MSE-LOGI-G502-WL',
    price: 14500,
    discountPrice: 12900,
    stockStatus: 'In Stock',
    stockCount: 25,
    rating: 4.9,
    reviewsCount: 65,
    description: 'G502 LIGHTSPEED features the industry-leading HERO 25K sensor and is fully compatible with POWERPLAY. With advanced wireless tech, ultra-lightweight frame, and customizable weight adjustment system.',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'LIGHTSPEED Wireless Technology',
      'HERO 25K Optical Sensor',
      '11 Programmable Buttons',
      'Tunable Weight System (+16g)'
    ],
    specifications: {
      'Sensor': 'HERO 25K',
      'Resolution': '100 - 25,600 DPI',
      'Max Acceleration': '>40G',
      'Connection Type': 'Wireless',
      'Battery Life': 'Up to 60 Hours'
    },
    warranty: '2 Years Warranty',
    wireless: true,
    rgb: true,
    estimatedDelivery: '1-2 Days',
    views: 510,
    sales: 38
  },
  {
    id: 'prod-11',
    name: 'TP-Link Deco X50 AX3000 Whole Home Mesh WiFi 6 System (3-Pack)',
    brand: 'TP-Link',
    category: 'Routers',
    model: 'Deco X50 (3-Pack)',
    sku: 'NET-TPLINK-DECO-X50-3P',
    price: 28500,
    discountPrice: 26500,
    stockStatus: 'In Stock',
    stockCount: 10,
    rating: 4.8,
    reviewsCount: 14,
    description: 'Armed with WiFi 6 technology, Deco whole-home mesh WiFi is designed to deliver a huge boost in coverage, speed, and total capacity. Get on the latest mesh WiFi to enjoy the future network that loads faster and connects more.',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'AX3000 Dual-Band WiFi - Super-fast WiFi 6 speeds up to 3.0 Gbps',
      '4 Streams, Less Lag - 2×2/HE160 2402 Mbps + 2×2 574 Mbps',
      'Boosted Seamless Coverage - Seamless WiFi coverage up to 6,500 sq ft',
      'TP-Link HomeShield Security'
    ],
    specifications: {
      'WiFi Speed': 'AX3000 (2402 Mbps + 574 Mbps)',
      'Standards': 'Wi-Fi 6 (IEEE 802.11ax/ac/n/a/b/g)',
      'Ports': '3 x Gigabit Ports per Deco Unit',
      'Coverage': 'Up to 6,500 sq ft (3-pack)'
    },
    warranty: '1 Year Warranty',
    wireless: true,
    estimatedDelivery: '2-3 Days',
    views: 220,
    sales: 4
  },
  {
    id: 'prod-12',
    name: 'Epson EcoTank L3210 All-in-One Ink Tank Printer',
    brand: 'Epson',
    category: 'Printers',
    model: 'EcoTank L3210',
    sku: 'PRN-EPSON-L3210',
    price: 22000,
    discountPrice: 20500,
    stockStatus: 'In Stock',
    stockCount: 16,
    rating: 4.6,
    reviewsCount: 22,
    description: 'The Epson EcoTank L3210 multi-functional printing solutions are designed to improve business cost savings and print productivity. Expect a high print yield of up to 4,500 pages for black-and-white, and 7,500 pages for colour.',
    images: [
      'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Ultra-high page yield of 4,500 pages (black) and 7,500 pages (color)',
      'Compact integrated tank design',
      'Borderless printing up to 4R',
      'Spill-free, error-free refilling'
    ],
    specifications: {
      'Printer Type': 'Ink Tank',
      'Functions': 'Print, Scan, Copy',
      'Print Resolution': '5760 x 1440 dpi',
      'Print Speed': 'Up to 10.0 ipm (B) / 5.0 ipm (C)'
    },
    warranty: '1 Year Warranty',
    printerType: 'Ink Tank',
    estimatedDelivery: '2-4 Days',
    views: 390,
    sales: 11
  },
  {
    id: 'prod-13',
    name: 'Dahua DH-HAC-HFW1200RP 2MP Water-Proof Bullet CCTV Camera',
    brand: 'Dahua',
    category: 'CCTV Products',
    model: 'DH-HAC-HFW1200RP',
    sku: 'CCTV-DAHUA-1200RP',
    price: 2200,
    discountPrice: 1850,
    stockStatus: 'In Stock',
    stockCount: 150,
    rating: 4.5,
    reviewsCount: 33,
    description: 'Experience 1080P full HD video and the simplicity of using existing cabling infrastructure with HDCVI. The Lite series 1080P HDCVI camera features a compact design and offers a high quality image at a friendly price.',
    images: [
      'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80'
    ],
    features: [
      'Max 30fps@1080P Full HD Video',
      '3.6mm fixed lens (2.8mm, 6mm optional)',
      'Max. IR length 20m, Smart IR technology',
      'IP67 Weatherproof rating for outdoor use'
    ],
    specifications: {
      'Camera Type': 'Bullet',
      'Resolution': '2 Megapixel (1920x1080)',
      'IR Distance': 'Up to 20m (66ft)',
      'Lens Type': '3.6mm Fixed Lens',
      'Ingress Protection': 'IP67'
    },
    warranty: '1 Year Warranty',
    estimatedDelivery: '1-3 Days',
    views: 410,
    sales: 78
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'TRUSTIT2026',
    discountType: 'Percentage',
    discountValue: 10,
    minPurchase: 5000,
    maxDiscount: 2000,
    expiryDate: '2026-12-31',
    isActive: true
  },
  {
    code: 'COMP500',
    discountType: 'Fixed',
    discountValue: 500,
    minPurchase: 10000,
    expiryDate: '2026-09-30',
    isActive: true
  },
  {
    code: 'FREESHIP',
    discountType: 'Percentage',
    discountValue: 100, // Covers shipping cost
    minPurchase: 2000,
    maxDiscount: 150,
    expiryDate: '2026-12-31',
    isActive: true
  }
];

const INITIAL_BANNERS: HeroBanner[] = [
  {
    id: 'ban-1',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
    title: 'Unleash Next-Gen Power',
    subtitle: 'NVIDIA RTX 40-Series Super GPUs and Intel 14th Gen Processors now in stock!',
    linkTo: 'Shop',
    isActive: true
  },
  {
    id: 'ban-2',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    title: 'Aesthetic Gaming Battle Stations',
    subtitle: 'Up to 20% Off on GIGABYTE and ASUS ROG Monitors & RGB Accessories.',
    linkTo: 'Shop',
    isActive: true
  },
  {
    id: 'ban-3',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    title: 'Enterprise Smart IT Solutions',
    subtitle: 'Printers, Smart Mesh Routers, UPS & Office Automation Systems.',
    linkTo: 'Shop',
    isActive: true
  }
];

const DEFAULT_SETTINGS: WebsiteSettings = {
  freeShippingThreshold: 50000,
  flatShippingRate: 150,
  contactEmail: 'support@trustitgallery.com',
  contactPhone: '+880 1712-345678',
  address: 'Level 4, Trust IT Gallery Tower, Multiplan Center, Dhaka, Bangladesh',
  whatsappNumber: '+8801712345678',
  messengerLink: 'https://m.me/trustitgallery',
  facebookLink: 'https://facebook.com/trustitgallery',
  twitterLink: 'https://twitter.com/trustitgallery',
  youtubeLink: 'https://youtube.com/trustitgallery',
  enableNewsletterPopup: true,
  newsletterDiscountPercent: 10
};

// Seed administrative activity logs
const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    adminEmail: 'admin@trustitgallery.com',
    action: 'Database Initialization',
    details: 'Seeded initial products, banners, settings, and discount coupon codes.',
    timestamp: new Date().toISOString()
  }
];

// Verify or create database directory and file
export function initializeDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const defaultData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      users: [
        {
          id: 'user-admin',
          email: 'admin@trustitgallery.com',
          name: 'Trust IT System Admin',
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      orders: [],
      reviews: [
        {
          id: 'rev-1',
          productId: 'prod-2',
          userName: 'Imtiaz Ahmed',
          userEmail: 'imtiaz@gmail.com',
          rating: 5,
          comment: 'Outstanding gaming performance! Replaced my 5800X3D and saw a huge framerate bump in Microsoft Flight Simulator. Highly recommend this store, packaging was top-notch.',
          date: '2026-06-15T12:00:00Z',
          approved: true
        },
        {
          id: 'rev-2',
          productId: 'prod-6',
          userName: 'Sajib Rahman',
          userEmail: 'sajib@gmail.com',
          rating: 5,
          comment: 'Incredible speeds. Read/write speeds are exactly as advertised on PCIe 4.0 motherboards. Original product with warranty.',
          date: '2026-06-20T10:30:00Z',
          approved: true
        }
      ],
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      logs: INITIAL_LOGS,
      settings: DEFAULT_SETTINGS
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    console.log('Database seeded successfully.');
  }
}

export function readDb(): DatabaseSchema {
  initializeDb();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

export function writeDb(data: DatabaseSchema) {
  initializeDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
export default {
  readDb,
  writeDb
};
