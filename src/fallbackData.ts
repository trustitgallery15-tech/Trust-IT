import { Product } from './types.js';

export const FALLBACK_PRODUCTS: Product[] = [
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
    sales: 12,
    isFeatured: true,
    isFlashDeal: true,
    isTrending: true,
    isBestSeller: true
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
    sales: 34,
    isFeatured: true,
    isTrending: true,
    isBestSeller: true
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
    sales: 5,
    isFeatured: true,
    isFlashDeal: true,
    isBestSeller: true
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
    sales: 14,
    isTrending: true
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
      'Speed': '6000MHz',
      'Type': 'DDR5',
      'Latency': 'CL36',
      'Tested Voltage': '1.35V'
    },
    warranty: 'Lifetime Warranty',
    rgb: true,
    estimatedDelivery: '1-3 Days',
    views: 290,
    sales: 21,
    isFeatured: true
  }
];

export const FALLBACK_BANNERS = [
  {
    id: 'banner-1',
    title: 'Unleash Next-Gen Gaming Performance',
    subtitle: 'NVIDIA RTX 40 SUPER Series Now In Stock',
    description: 'Experience hyper-realistic graphics, unmatched ray-tracing, and AI-accelerated DLSS 3 technologies with standard-setting warranties.',
    buttonText: 'Secure Yours Now',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1200&q=80',
    link: 'shop',
    isActive: true
  },
  {
    id: 'banner-2',
    title: 'Reframe Your Productivity Workloads',
    subtitle: '14th Gen Intel Core i9 Processors Available',
    description: 'Empower modern workflows with 24 high-powered computing cores designed to blast through rendering, gaming, and encoding tasks simultaneously.',
    buttonText: 'Browse Processors',
    image: 'https://images.unsplash.com/photo-1591405351990-4726e331f141?auto=format&fit=crop&w=1200&q=80',
    link: 'shop',
    isActive: true
  }
];
