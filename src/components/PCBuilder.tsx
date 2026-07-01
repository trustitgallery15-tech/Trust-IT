import { useState, useEffect } from 'react';
import { 
  Cpu, Layout, HardDrive, Cpu as GpuIcon, Box, Sliders, 
  Trash2, Plus, AlertTriangle, CheckCircle, Calculator, Printer, ShoppingCart, HelpCircle 
} from 'lucide-react';
import { Product } from '../types.js';

interface PCBuilderProps {
  products: Product[];
  onAddToCart: (p: Product, qty?: number) => void;
  setCurrentView: (view: string) => void;
}

interface BuildSlots {
  cpu: Product | null;
  motherboard: Product | null;
  ram: Product | null;
  storage: Product | null;
  gpu: Product | null;
  psu: Product | null;
  cooler: Product | null;
  casing: Product | null;
}

export default function PCBuilder({
  products,
  onAddToCart,
  setCurrentView
}: PCBuilderProps) {
  
  // Custom builds state
  const [build, setBuild] = useState<BuildSlots>({
    cpu: null, motherboard: null, ram: null, storage: null,
    gpu: null, psu: null, cooler: null, casing: null
  });

  // Active selector state
  const [activeSlot, setActiveSlot] = useState<keyof BuildSlots | null>(null);

  // Warnings lists
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic calculations
  const [estimatedWattage, setEstimatedWattage] = useState(0);

  // Validate motherboard, CPU sockets and power requirements
  useEffect(() => {
    const list: string[] = [];
    let wattage = 0;

    // CPU Socket matching
    if (build.cpu && build.motherboard) {
      const cpuSocket = build.cpu.specifications['Socket'] || build.cpu.specifications['CPU Socket'];
      const mbSocket = build.motherboard.specifications['Socket'] || build.motherboard.specifications['Supported Socket'] || build.motherboard.specifications['Socket Type'];
      
      if (cpuSocket && mbSocket && cpuSocket.toLowerCase() !== mbSocket.toLowerCase()) {
        list.push(`⚠️ Socket Incompatibility: Chosen CPU requires socket ${cpuSocket} but Motherboard has socket ${mbSocket}.`);
      }
    }

    // RAM technology matching
    if (build.motherboard && build.ram) {
      const mbRamType = build.motherboard.specifications['Memory Slots'] || build.motherboard.specifications['Memory Type'] || '';
      const ramType = build.ram.specifications['Type'] || build.ram.specifications['Memory Type'] || '';
      
      if (mbRamType && ramType && !mbRamType.toLowerCase().includes(ramType.toLowerCase())) {
        list.push(`⚠️ Memory Mismatch: Chosen RAM is ${ramType} but Motherboard specification supports ${mbRamType}.`);
      }
    }

    // Dynamic wattage calculation based on TDP parameters
    if (build.cpu) {
      // Extract wattage integer from string (e.g. "125W", "65W")
      const tdpStr = build.cpu.specifications['TDP'] || '65W';
      const tdp = parseInt(tdpStr) || 65;
      wattage += tdp;
    }
    if (build.gpu) {
      const gPowerStr = build.gpu.specifications['Power Consumption'] || build.gpu.specifications['TDP'] || '200W';
      const tdp = parseInt(gPowerStr) || 200;
      wattage += tdp;
    }
    // Accessory loads (RAM, SSD, fans)
    if (build.ram) wattage += 10;
    if (build.storage) wattage += 15;
    if (build.cooler) wattage += 35;
    if (build.motherboard) wattage += 50;

    setEstimatedWattage(wattage);

    // PSU limit validations
    if (build.psu) {
      const psuWattStr = build.psu.specifications['Maximum Power'] || build.psu.specifications['Wattage'] || '550W';
      const psuWatts = parseInt(psuWattStr) || 550;
      
      if (wattage > psuWatts) {
        list.push(`⚠️ Power Depletion: System wattage requirement (${wattage}W) exceeds your Power Supply’s capacity (${psuWatts}W). We strongly recommend upgrading your PSU!`);
      }
    }

    setWarnings(list);
    setIsSuccess(list.length === 0 && !!build.cpu && !!build.motherboard);
  }, [build]);

  const handleSelectProduct = (slot: keyof BuildSlots, product: Product) => {
    setBuild(prev => ({ ...prev, [slot]: product }));
    setActiveSlot(null);
  };

  const handleClearSlot = (slot: keyof BuildSlots) => {
    setBuild(prev => ({ ...prev, [slot]: null }));
  };

  const handleAddAllToCart = () => {
    (Object.values(build) as (Product | null)[]).forEach(product => {
      if (product) onAddToCart(product, 1);
    });
    setCurrentView('checkout');
  };

  const triggerPrintConfig = () => {
    const originalContent = document.body.innerHTML;
    const printSection = document.getElementById('pc-build-printable-view');
    if (!printSection) return;
    document.body.innerHTML = printSection.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const totalBuildCost = (Object.values(build) as (Product | null)[]).reduce((sum, p) => sum + (p ? (p.discountPrice || p.price) : 0), 0);

  // Filter products relative to the chosen builder slot category
  const getSlotFilteredProducts = (slot: keyof BuildSlots) => {
    if (slot === 'cpu') return products.filter(p => p.category === 'Processors (CPU)');
    if (slot === 'motherboard') return products.filter(p => p.category === 'Motherboards');
    if (slot === 'ram') return products.filter(p => p.category === 'RAM');
    if (slot === 'storage') return products.filter(p => p.category === 'SSD' || p.category === 'HDD');
    if (slot === 'gpu') return products.filter(p => p.category === 'Graphics Cards');
    if (slot === 'psu') return products.filter(p => p.category === 'Power Supplies');
    if (slot === 'cooler') return products.filter(p => p.category === 'CPU Coolers');
    if (slot === 'casing') return products.filter(p => p.category === 'PC Cases');
    return [];
  };

  const slotLabels: Record<keyof BuildSlots, { label: string; icon: any }> = {
    cpu: { label: 'Processor (CPU)', icon: Cpu },
    motherboard: { label: 'Motherboard', icon: Layout },
    ram: { label: 'System Memory (RAM)', icon: Sliders },
    storage: { label: 'Storage Device (SSD/HDD)', icon: HardDrive },
    gpu: { label: 'Graphics Card (GPU)', icon: GpuIcon },
    psu: { label: 'Power Supply Unit (PSU)', icon: Calculator },
    cooler: { label: 'CPU Cooler', icon: HelpCircle },
    casing: { label: 'PC Casing', icon: Box }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 font-sans">
      
      {/* Upper banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 shadow-xl shadow-blue-100">
        <div>
          <span className="rounded bg-blue-500 text-[9px] font-black tracking-widest uppercase px-2 py-0.5">Custom Rig Configurator</span>
          <h1 className="text-xl md:text-2xl font-black mt-2">Custom PC Rig Builder</h1>
          <p className="text-xs text-blue-100 mt-1">Assemble hardware parts, validate socket fits, calculate aggregate wattages, and export config listings.</p>
        </div>

        <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/5 backdrop-blur-sm shrink-0">
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest leading-none">Wattage Demand</p>
          <p className="text-xl font-black text-white mt-1.5">{estimatedWattage} W</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Rig assembly lists */}
        <div className="lg:col-span-8 space-y-4">
          
          {Object.entries(slotLabels).map(([slotKey, meta]) => {
            const key = slotKey as keyof BuildSlots;
            const chosen = build[key];
            const IconComponent = meta.icon;

            return (
              <div key={key} className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center justify-between gap-4 hover:shadow-xs transition">
                
                {/* Slot Icon & Labels */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600 shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  
                  {chosen ? (
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{meta.label}</p>
                      <h4 className="text-xs font-black text-gray-800 truncate mt-0.5 max-w-[250px] md:max-w-[380px]">{chosen.name}</h4>
                      <p className="text-[10px] text-blue-600 font-bold mt-1">BDT {(chosen.discountPrice || chosen.price).toLocaleString()}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-black text-gray-800">{meta.label}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">Select a compatible component</p>
                    </div>
                  )}
                </div>

                {/* Right Actions */}
                <div className="shrink-0">
                  {chosen ? (
                    <button
                      onClick={() => handleClearSlot(key)}
                      className="rounded-xl p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      title="Clear slot"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveSlot(key)}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Choose</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}

        </div>

        {/* Right validation warnings & checkout widget */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-gray-100 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest border-b border-gray-50 pb-3">Build Overview</h3>
            
            {/* Cost sum */}
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-gray-500 font-bold">Rig Est. Cost:</span>
              <span className="text-xl font-black text-blue-600">BDT {totalBuildCost.toLocaleString()}</span>
            </div>

            {/* Validation warning block */}
            <div className="space-y-3.5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Rig Compatibility Engine</h4>
              
              {warnings.length > 0 ? (
                <div className="space-y-2">
                  {warnings.map((warn, idx) => (
                    <div key={idx} className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-[10px] text-amber-800 font-semibold leading-relaxed flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-green-50 border border-green-100 p-3.5 text-[10px] text-green-800 font-bold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Congratulations! All components are compatible.</span>
                </div>
              )}
            </div>

            {/* Print and purchase button layout */}
            <div className="space-y-3 pt-3 border-t border-gray-50">
              <button
                onClick={handleAddAllToCart}
                disabled={totalBuildCost === 0}
                className="w-full rounded-xl bg-blue-600 py-3.5 text-xs font-black text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg shadow-blue-100 flex items-center justify-center gap-1.5 transition"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Buy Custom Build</span>
              </button>

              <button
                onClick={triggerPrintConfig}
                disabled={totalBuildCost === 0}
                className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 py-3 text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="h-4 w-4" />
                <span>Print Build Specifications</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Selector modal wrapper if activeSlot exists */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3 shrink-0">
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                Select {slotLabels[activeSlot].label}
              </h4>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-gray-400 hover:text-gray-600 font-black text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {getSlotFilteredProducts(activeSlot).length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-10 font-bold">No components found under this category.</p>
              ) : (
                getSlotFilteredProducts(activeSlot).map(p => {
                  const price = p.discountPrice || p.price;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectProduct(activeSlot, p)}
                      className="rounded-2xl border border-gray-100 p-3 flex gap-4 items-center justify-between hover:border-blue-500 cursor-pointer transition bg-gray-50/20"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={p.images[0]} alt={p.name} referrerPolicy="no-referrer" className="h-12 w-12 rounded-lg object-cover border bg-white" />
                        <div className="min-w-0">
                          <h5 className="text-xs font-black text-gray-800 truncate max-w-[280px]">{p.name}</h5>
                          <p className="text-[10px] text-gray-400 mt-0.5">Model: {p.model} | SKU: {p.sku}</p>
                          <p className="text-[10px] text-blue-600 font-black mt-1">BDT {price.toLocaleString()}</p>
                        </div>
                      </div>

                      <button className="rounded-lg bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-600 hover:bg-blue-100">
                        Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden printable layout for custom computer builds */}
      <div id="pc-build-printable-view" className="hidden p-8 font-sans text-gray-800">
        <h2 className="text-xl font-black text-gray-900 border-b pb-4">TRUST IT GALLERY - CUSTOM SYSTEM rig CHECKLIST</h2>
        <p className="text-xs text-gray-400 mt-1">Est. Build Price: BDT {totalBuildCost.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-0.5">Wattage Requirement: {estimatedWattage} Watts</p>

        <div className="mt-6 space-y-4">
          {(Object.entries(build) as [string, Product | null][]).map(([key, p]) => {
            if (!p) return null;
            const prod = p as Product;
            return (
              <div key={key} className="flex justify-between items-center border-b pb-2 text-xs">
                <div>
                  <p className="font-bold text-gray-900 uppercase text-[9px]">{slotLabels[key as keyof BuildSlots].label}</p>
                  <p className="text-gray-700 mt-0.5 font-semibold">{prod.name}</p>
                </div>
                <p className="font-mono font-bold text-gray-800">BDT {(prod.discountPrice || prod.price).toLocaleString()}</p>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-center text-gray-400 font-bold mt-12 border-t pt-4">Generated via Trust IT Gallery Rig Builder. All components qualify for full brand warranties.</p>
      </div>

    </div>
  );
}
