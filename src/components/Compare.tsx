import { Trash2, ShoppingCart, HelpCircle, ArrowLeftRight, Plus } from 'lucide-react';
import { Product } from '../types.js';

interface CompareProps {
  compareList: Product[];
  onRemoveFromCompare: (p: Product) => void;
  onAddToCart: (p: Product) => void;
  setCurrentView: (view: string) => void;
  setSelectedProductId: (id: string) => void;
}

export default function Compare({
  compareList,
  onRemoveFromCompare,
  onAddToCart,
  setCurrentView,
  setSelectedProductId
}: CompareProps) {
  
  if (compareList.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center font-sans">
        <div className="rounded-full bg-blue-50 p-6 text-blue-600 inline-block mb-4">
          <ArrowLeftRight className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-gray-800">Comparison List is Empty</h2>
        <p className="text-xs text-gray-400 max-w-sm mx-auto mt-2 leading-relaxed">
          Add up to 4 components (processors, RAM, motherboards, or graphics cards) side-by-side from our shop to contrast technical specifications and pricing.
        </p>
        <button
          onClick={() => setCurrentView('shop')}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  // Aggregate all unique specification keys across all products in the comparison list
  const allSpecKeys = Array.from(
    new Set(
      compareList.flatMap(p => Object.keys(p.specifications))
    )
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
      
      <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Hardware Comparison Matrix</h1>
          <p className="text-xs text-gray-400 mt-1">Contrasting {compareList.length} component specs side-by-side</p>
        </div>

        <button
          onClick={() => setCurrentView('shop')}
          className="rounded-xl border border-gray-200 bg-white px-4.5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add More Components</span>
        </button>
      </div>

      {/* Comparison Grid container */}
      <div className="border border-gray-100 rounded-3xl overflow-x-auto shadow-sm bg-white">
        
        <table className="w-full text-xs text-left min-w-[600px] table-fixed">
          
          {/* Header Row: Products Images, Titles, and Delete/Cart triggers */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              
              {/* Spacer cell for row headers */}
              <th className="w-48 px-6 py-4 font-black text-gray-400 uppercase tracking-wider text-[10px]">Specifications Specs</th>
              
              {compareList.map((p) => {
                const price = p.discountPrice || p.price;
                return (
                  <th key={p.id} className="p-6 font-semibold relative group border-l border-gray-100">
                    
                    {/* Clear button */}
                    <button
                      onClick={() => onRemoveFromCompare(p)}
                      className="absolute right-3 top-3 rounded-full bg-gray-200/50 p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      title="Remove from comparison"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="space-y-4">
                      <div 
                        onClick={() => { setSelectedProductId(p.id); setCurrentView('product'); }}
                        className="aspect-square w-24 h-24 overflow-hidden rounded-xl bg-white border mx-auto flex items-center justify-center cursor-pointer hover:border-blue-500 transition"
                      >
                        <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                      </div>

                      <div className="space-y-1 text-center">
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.brand}</span>
                        <h4 
                          onClick={() => { setSelectedProductId(p.id); setCurrentView('product'); }}
                          className="font-bold text-gray-800 line-clamp-2 hover:text-blue-600 cursor-pointer min-h-[32px] text-center"
                        >
                          {p.name}
                        </h4>
                        <p className="font-mono font-black text-gray-900 text-xs">BDT {price.toLocaleString()}</p>
                      </div>

                      {/* Add to Cart button */}
                      <button
                        onClick={() => onAddToCart(p)}
                        disabled={p.stockStatus === 'Out of Stock'}
                        className="w-full rounded-xl bg-blue-600 py-2 text-[10px] font-black text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>

                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Rows: Comparison specifications specs */}
          <tbody className="divide-y divide-gray-100">
            
            {/* Core specs rows */}
            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Brand Manufacturer</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">{p.brand}</td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Model ID</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">{p.model}</td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Hardware Class</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">{p.category}</td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Stock Availability</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 border-l border-gray-100">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    p.stockStatus === 'In Stock' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {p.stockStatus}
                  </span>
                </td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Reviews & Ratings</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">
                  <span className="text-yellow-500 font-bold">★ {p.rating}</span> ({p.reviewsCount} reviews)
                </td>
              ))}
            </tr>

            <tr className="hover:bg-gray-50/20 transition">
              <td className="px-6 py-3.5 font-bold text-gray-500">Official Warranty</td>
              {compareList.map((p) => (
                <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">{p.warranty}</td>
              ))}
            </tr>

            {/* Dynamic specs rows retrieved from spec dictionary */}
            {allSpecKeys.map((specKey) => (
              <tr key={specKey} className="hover:bg-gray-50/20 transition">
                <td className="px-6 py-3.5 font-bold text-gray-500">{specKey}</td>
                {compareList.map((p) => {
                  const val = p.specifications[specKey] || '-';
                  return (
                    <td key={p.id} className="px-6 py-3.5 font-semibold text-gray-700 border-l border-gray-100">{val}</td>
                  );
                })}
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
