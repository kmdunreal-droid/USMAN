import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  History,
  CheckCircle2,
  SlidersHorizontal,
  FileCheck,
  ShieldAlert,
  MapPin,
  Scale,
  X,
  Printer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { StockMovementType, StockMovementLog, Item } from '../types';

export const InventoryModule: React.FC = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { items, stockMovements, updateItem, addItem, addStockAdjustment } = useData();

  const [activeTab, setActiveTab] = useState<'register' | 'ledger' | 'reconciliation'>('register');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'raw_scrap' | 'recovered_metal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Movement Ledger Filters
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all');
  const [selectedItemFilter, setSelectedItemFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState<Item | null>(null);

  // Add Item State
  const [code, setCode] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [nameEng, setNameEng] = useState('');
  const [category, setCategory] = useState<'raw_scrap' | 'recovered_metal'>('recovered_metal');
  const [metalType, setMetalType] = useState<any>('copper');
  const [stockKg, setStockKg] = useState(1000);
  const [pricePerKg, setPricePerKg] = useState(500);
  const [storageLocation, setStorageLocation] = useState('گودام A');

  // Physical Audit Adjustment State
  const [auditItemId, setAuditItemId] = useState<string>(items[0]?.id || '');
  const [physicalWeightKg, setPhysicalWeightKg] = useState<number>(0);
  const [auditReason, setAuditReason] = useState<string>('ماہانہ جسمانی گنتی آڈٹ');

  // Inventory Totals
  const totalStockKg = items.reduce((acc, i) => acc + (i.currentStockKg || 0), 0);
  const totalReservedKg = items.reduce((acc, i) => acc + (i.reservedStockKg || 0), 0);
  const totalValuation = items.reduce(
    (acc, i) => acc + (i.currentStockKg || 0) * (i.avgPurchasePricePerKg || 0),
    0
  );
  const lowStockItemsCount = items.filter((i) => i.currentStockKg <= i.alertMinStockKg).length;

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch =
      item.nameUrdu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nameEng.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Stock Movements
  const filteredMovements = stockMovements.filter((m) => {
    const matchesType = movementTypeFilter === 'all' || m.type === movementTypeFilter;
    const matchesItem = selectedItemFilter === 'all' || m.itemId === selectedItemFilter;
    return matchesType && matchesItem;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !nameUrdu) {
      alert('براہِ کرم آئٹم کوڈ اور نام درج کریں۔');
      return;
    }

    addItem({
      code,
      nameUrdu,
      nameEng: nameEng || nameUrdu,
      category,
      metalType,
      unit: 'kg',
      currentStockKg: stockKg,
      reservedStockKg: 0,
      damagedWasteKg: 0,
      avgPurchasePricePerKg: pricePerKg,
      alertMinStockKg: 500,
      storageLocation
    });

    setShowAddModal(false);
    setCode('');
    setNameUrdu('');
  };

  const handleOpenAuditModal = (item?: Item) => {
    const target = item || items[0];
    if (target) {
      setAuditItemId(target.id);
      setPhysicalWeightKg(target.currentStockKg);
    }
    setShowAuditModal(true);
  };

  const handleExecuteAuditAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const target = items.find((i) => i.id === auditItemId);
    if (!target) return;

    addStockAdjustment({
      itemId: auditItemId,
      physicalWeightKg,
      reason: auditReason
    });

    alert(`آئٹم "${target.nameUrdu}" کا اسٹاک کامیابی سے جسمانی گنتی کے مطابق اپڈیٹ کر دیا گیا۔`);
    setShowAuditModal(false);
  };

  const getMovementTypeBadge = (type: StockMovementType) => {
    switch (type) {
      case 'purchase_receipt':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            آمد خرید (+IN)
          </span>
        );
      case 'metal_recovery':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowDownRight className="w-3 h-3 text-emerald-400" />
            قطع برائے ریکوری (+IN)
          </span>
        );
      case 'processing_consumption':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3 text-amber-400" />
            کٹائی استعمال (-OUT)
          </span>
        );
      case 'sale_dispatch':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <ArrowUpRight className="w-3 h-3 text-rose-400" />
            روانگی کسٹمر (-OUT)
          </span>
        );
      case 'authorized_adjustment':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
            <SlidersHorizontal className="w-3 h-3" />
            آڈٹ ایڈجسٹمنٹ
          </span>
        );
      case 'damaged_waste':
        return (
          <span className="inline-flex items-center gap-1 bg-slate-800 text-rose-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            کچرا ضیاع (-OUT)
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Banner - Short Words */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Boxes className="w-5 h-5" />
            <span>اسٹاک رجسٹر</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            موجودہ گودام ذخیرہ، موومنٹ لیجر و فزیکل آڈٹ
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleOpenAuditModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3 py-2 rounded-xl transition cursor-pointer text-xs min-h-[40px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فزیکل آڈٹ</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer text-xs min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>نیا آئٹم</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner - Compact & Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md space-y-0.5">
          <span className="text-[11px] text-slate-400 block font-medium">کل گودام وزن</span>
          <span className="text-base sm:text-xl font-bold text-amber-400 font-mono block">
            {formatWeight(totalStockKg)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {(totalStockKg / 1000).toFixed(2)} ٹن
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md space-y-0.5">
          <span className="text-[11px] text-slate-400 block font-medium">اسٹاک مالیت</span>
          <span className="text-base sm:text-xl font-bold text-emerald-400 font-mono block">
            {formatCurrency(totalValuation)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {items.length} آئٹمز
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md space-y-0.5">
          <span className="text-[11px] text-slate-400 block font-medium">رزروڈ وزن</span>
          <span className="text-base sm:text-xl font-bold text-purple-400 font-mono block">
            {formatWeight(totalReservedKg)}
          </span>
          <span className="text-[10px] text-purple-300 block">سیل معاہدے</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md space-y-0.5">
          <span className="text-[11px] text-slate-400 block font-medium">کم اسٹاک</span>
          <span
            className={`text-base sm:text-xl font-bold font-mono block ${
              lowStockItemsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {lowStockItemsCount} الرٹ
          </span>
          <span className="text-[10px] text-slate-400 block">وارننگ</span>
        </div>
      </div>

      {/* Tabs - Dropdown on Mobile, Tabs on Desktop (Dropdown use karo) */}
      <div className="sm:hidden bg-slate-900 p-2 rounded-xl border border-slate-800">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-xs font-bold py-2 px-3 rounded-lg focus:outline-none"
        >
          <option value="register">📦 موجودہ اسٹاک رجسٹر</option>
          <option value="ledger">📜 موومنٹ لاگ لیجر</option>
          <option value="reconciliation">⚖️ فزیکل آڈٹ رپورٹ</option>
        </select>
      </div>

      <div className="hidden sm:flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'register'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>اسٹاک رجسٹر</span>
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>موومنٹ لاگ</span>
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>آڈٹ رپورٹ</span>
        </button>
      </div>

      {/* TAB 1: LIVE STOCK REGISTER */}
      {activeTab === 'register' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
          {/* Controls & Search with Category Dropdown */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2.5 bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Category Dropdown (Dropdown use karo) */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
              >
                <option value="all">تمام زمرہ جات</option>
                <option value="raw_scrap">خام کباڑ (Raw Scrap)</option>
                <option value="recovered_metal">خالص میٹلز (Clean Metals)</option>
              </select>

              <span className="text-slate-400 font-mono text-xs hidden lg:inline">
                آئٹمز: {filteredItems.length}
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="آئٹم نام یا کوڈ..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg py-1.5 pr-8 pl-3 text-xs focus:border-amber-500"
              />
            </div>
          </div>

          {/* Desktop Main Stock Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 font-semibold">
                <tr>
                  <th className="p-2.5 text-right">کوڈ</th>
                  <th className="p-2.5 text-right">آئٹم نام</th>
                  <th className="p-2.5 text-right">زمرہ</th>
                  <th className="p-2.5 text-right">دستیاب اسٹاک</th>
                  <th className="p-2.5 text-right">رزروڈ</th>
                  <th className="p-2.5 text-right">لوکیشن</th>
                  <th className="p-2.5 text-right">خرید ریٹ</th>
                  <th className="p-2.5 text-right">کل مالیت</th>
                  <th className="p-2.5 text-center">ایکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredItems.map((item) => {
                  const tonsVal = (item.currentStockKg / 1000).toFixed(2);
                  const maundsVal = (item.currentStockKg / 40).toFixed(1);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono font-bold text-amber-400">{item.code}</td>
                      <td className="p-2.5 font-bold text-slate-100">
                        {item.nameUrdu}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {item.nameEng}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                            item.category === 'raw_scrap'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.category === 'raw_scrap' ? 'خام مال' : 'خالص میٹل'}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold font-mono">
                        <div className={item.currentStockKg < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {item.currentStockKg.toLocaleString()} KG
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          ({tonsVal} ٹن)
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-purple-400 font-bold">
                        {item.reservedStockKg ? `${item.reservedStockKg.toLocaleString()} k` : '0 k'}
                      </td>
                      <td className="p-2.5 text-slate-300">
                        <span className="text-xs">{item.storageLocation || 'گودام Main'}</span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-300">
                        Rs {item.avgPurchasePricePerKg}
                      </td>
                      <td className="p-2.5 font-bold text-slate-100 font-mono">
                        {formatCurrency(item.currentStockKg * item.avgPurchasePricePerKg)}
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedItemForHistory(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1.5 rounded-lg border border-slate-700 cursor-pointer"
                            title="لیجر لاگ"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenAuditModal(item)}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-1.5 rounded-lg border border-slate-700 cursor-pointer"
                            title="فزیکل آڈٹ"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Easy thumb reading & touch buttons) */}
          <div className="md:hidden space-y-2.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                  <div>
                    <span className="font-bold text-slate-100">{item.nameUrdu}</span>
                    <span className="font-mono text-slate-400 text-[10px] mr-2">· {item.code}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      item.category === 'raw_scrap'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {item.category === 'raw_scrap' ? 'خام کباڑ' : 'خالص میٹل'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">دستیاب اسٹاک</div>
                    <div className="font-mono text-base font-bold text-emerald-400">
                      {item.currentStockKg.toLocaleString()} KG
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-[10px] text-slate-400">کل مالیت</div>
                    <div className="font-bold text-slate-100">
                      {formatCurrency(item.currentStockKg * item.avgPurchasePricePerKg)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ریٹ: Rs {item.avgPurchasePricePerKg}/کلو · {item.storageLocation || 'Main'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedItemForHistory(item)}
                      className="p-1.5 bg-slate-800 text-amber-400 rounded-lg text-xs flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" />
                      <span>لاگ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAuditModal(item)}
                      className="p-1.5 bg-slate-800 text-emerald-400 rounded-lg text-xs flex items-center gap-1"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>آڈٹ</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: IMMUTABLE STOCK MOVEMENT LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">موومنٹ نوعیت فلٹر</label>
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs"
                >
                  <option value="all">تمام موومنٹس (All)</option>
                  <option value="purchase_receipt">آمد خریداری (+IN)</option>
                  <option value="processing_consumption">کٹائی پروسیسنگ (-OUT)</option>
                  <option value="metal_recovery">خالص میٹل ریکوری (+IN)</option>
                  <option value="sale_dispatch">روانگی کسٹمر (-OUT)</option>
                  <option value="authorized_adjustment">آڈٹ ایڈجسٹمنٹ</option>
                  <option value="damaged_waste">کچرا ضیاع</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">آئٹم فلٹر</label>
                <select
                  value={selectedItemFilter}
                  onChange={(e) => setSelectedItemFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs"
                >
                  <option value="all">تمام میٹل آئٹمز</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameUrdu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-slate-400 text-xs font-semibold">
              کل موومنٹ ریکارڈز: <span className="text-amber-400 font-mono font-bold">{filteredMovements.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 text-right">موومنٹ نمبر</th>
                  <th className="p-2.5 text-right">تاریخ</th>
                  <th className="p-2.5 text-right">آئٹم نام</th>
                  <th className="p-2.5 text-right">نوعیت موومنٹ</th>
                  <th className="p-2.5 text-right">وزن (KG & Tons)</th>
                  <th className="p-2.5 text-right">ریٹ فی کلو</th>
                  <th className="p-2.5 text-right">کل مالیت</th>
                  <th className="p-2.5 text-right">اسٹاک بعد از موومنٹ</th>
                  <th className="p-2.5 text-right">تفصیل / ریفرنس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-amber-400 font-bold">{m.movementNo}</td>
                    <td className="p-2.5 text-slate-400 text-[11px]">
                      {new Date(m.createdAt).toLocaleDateString('ur-PK')}
                    </td>
                    <td className="p-2.5 font-bold text-slate-100 font-sans">{m.itemNameUrdu}</td>
                    <td className="p-2.5 font-sans">{getMovementTypeBadge(m.type)}</td>
                    <td
                      className={`p-2.5 font-bold ${
                        m.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {m.direction === 'in' ? '+' : '-'}{m.weightKg.toLocaleString()} KG
                      <span className="block text-[10px] text-slate-400 font-normal">
                        ({(m.weightKg / 1000).toFixed(2)} ٹن)
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-300">Rs {m.unitCostPerKg}</td>
                    <td className="p-2.5 font-bold text-slate-200">
                      {formatCurrency(m.totalValuation)}
                    </td>
                    <td className="p-2.5 font-bold text-amber-400">
                      {m.balanceAfterKg.toLocaleString()} KG
                    </td>
                    <td className="p-2.5 font-sans text-slate-400 text-[11px]">
                      {m.notes || m.referenceNo || 'بلا واسطہ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: RECONCILIATION & AUDIT REPORT */}
      {activeTab === 'reconciliation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              <span>انوینٹری مطابقت و آڈٹ رپورٹ (System vs Physical Audit Verification)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              سسٹم موومنٹ لیجر کے مطابق حساب شدہ وزن اور لائیو رجسٹرڈ وزن کا تقابل و فرق
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-300 border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-3 text-right">آئٹم کوڈ</th>
                  <th className="p-3 text-right">آئٹم نام</th>
                  <th className="p-3 text-right">کل آمد موومنٹس (+IN)</th>
                  <th className="p-3 text-right">کل نکلنے والی موومنٹس (-OUT)</th>
                  <th className="p-3 text-right">سسٹم حساب شدہ وزن</th>
                  <th className="p-3 text-right">موجودہ رجسٹر وزن</th>
                  <th className="p-3 text-right">فرق (Variance)</th>
                  <th className="p-3 text-center">آڈٹ ایکشن</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {items.map((item) => {
                  const itemLogs = stockMovements.filter((m) => m.itemId === item.id);
                  const totalInKg = itemLogs
                    .filter((m) => m.direction === 'in')
                    .reduce((acc, m) => acc + m.weightKg, 0);
                  const totalOutKg = itemLogs
                    .filter((m) => m.direction === 'out')
                    .reduce((acc, m) => acc + m.weightKg, 0);

                  const calculatedSystemWeightKg = totalInKg - totalOutKg;
                  const currentRecordedKg = item.currentStockKg;
                  const varianceKg = currentRecordedKg - calculatedSystemWeightKg;

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-amber-400 font-bold">{item.code}</td>
                      <td className="p-3 font-bold text-slate-100 font-sans">{item.nameUrdu}</td>
                      <td className="p-3 text-emerald-400 font-bold">+{totalInKg.toLocaleString()} KG</td>
                      <td className="p-3 text-rose-400 font-bold">-{totalOutKg.toLocaleString()} KG</td>
                      <td className="p-3 text-slate-200 font-bold">{calculatedSystemWeightKg.toLocaleString()} KG</td>
                      <td className="p-3 text-amber-400 font-bold">{currentRecordedKg.toLocaleString()} KG</td>
                      <td className="p-3 font-bold">
                        {varianceKg === 0 ? (
                          <span className="text-emerald-400">0 KG (مطابقت)</span>
                        ) : (
                          <span className={varianceKg > 0 ? 'text-purple-400' : 'text-rose-400'}>
                            {varianceKg > 0 ? '+' : ''}{varianceKg.toLocaleString()} KG
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAuditModal(item)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1 rounded text-[11px] font-sans font-semibold cursor-pointer"
                        >
                          آڈٹ سیٹ کریں
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Stock History Modal */}
      {selectedItemForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  <span>آئٹم اسٹاک کارڈ و موومنٹ ہسٹری</span>
                </h3>
                <p className="text-xs text-slate-300 font-bold mt-1">
                  {selectedItemForHistory.nameUrdu} ({selectedItemForHistory.code}) - موجودہ اسٹاک:{' '}
                  <span className="text-emerald-400 font-mono">
                    {selectedItemForHistory.currentStockKg.toLocaleString()} KG
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemForHistory(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold">
                  <tr>
                    <th className="p-2.5 text-right">تاریخ</th>
                    <th className="p-2.5 text-right">نوعیت موومنٹ</th>
                    <th className="p-2.5 text-right">وزن (KG)</th>
                    <th className="p-2.5 text-right">ریٹ</th>
                    <th className="p-2.5 text-right">اسٹاک بعد از موومنٹ</th>
                    <th className="p-2.5 text-right">نوٹس</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {stockMovements
                    .filter((m) => m.itemId === selectedItemForHistory.id)
                    .map((m) => (
                      <tr key={m.id}>
                        <td className="p-2.5 text-slate-400">
                          {new Date(m.createdAt).toLocaleDateString('ur-PK')}
                        </td>
                        <td className="p-2.5 font-sans">{getMovementTypeBadge(m.type)}</td>
                        <td
                          className={`p-2.5 font-bold ${
                            m.direction === 'in' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {m.direction === 'in' ? '+' : '-'}{m.weightKg.toLocaleString()} KG
                        </td>
                        <td className="p-2.5">Rs {m.unitCostPerKg}</td>
                        <td className="p-2.5 text-amber-400 font-bold">
                          {m.balanceAfterKg.toLocaleString()} KG
                        </td>
                        <td className="p-2.5 font-sans text-slate-400 text-[11px]">{m.notes}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedItemForHistory(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical Audit Stock Adjustment Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-amber-400" />
              <span>جسمانی اسٹاک گنتی آڈٹ (Physical Stock Reconciliation)</span>
            </h3>

            <form onSubmit={handleExecuteAuditAdjustment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">میٹیریل آئٹم کا انتخاب *</label>
                <select
                  value={auditItemId}
                  onChange={(e) => {
                    setAuditItemId(e.target.value);
                    const matched = items.find((i) => i.id === e.target.value);
                    if (matched) setPhysicalWeightKg(matched.currentStockKg);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameUrdu} (سسٹم اسٹاک: {i.currentStockKg} کلو)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">جسمانی گنتی وزن (Physical Count KG) *</label>
                <input
                  type="number"
                  value={physicalWeightKg}
                  onChange={(e) => setPhysicalWeightKg(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono text-base font-bold rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">آڈٹ وجہ / تفصیلی نوٹس *</label>
                <input
                  type="text"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  placeholder="مثلاً ماہانہ فزیکل گنتی آڈٹ یا رطوبت نمی فرق"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  آڈٹ ایڈجسٹمنٹ محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3">
              نیا میٹل / سکریپ آئٹم ڈائریکٹری میں شامل کریں
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">آئٹم کوڈ *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="مثلاً REC-COP-B"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">آئٹم نام (اردو) *</label>
                <input
                  type="text"
                  value={nameUrdu}
                  onChange={(e) => setNameUrdu(e.target.value)}
                  placeholder="مثلاً تانبا تار بی-گریڈ"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">زمرہ (Category)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                  >
                    <option value="raw_scrap">خام کباڑ (Raw Scrap)</option>
                    <option value="recovered_metal">خالص ریکور شدہ میٹل</option>
                    <option value="processed_item">پروسیسڈ / ریفائنڈ مال</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">گودام سیکشن / لوکیشن</label>
                  <input
                    type="text"
                    value={storageLocation}
                    onChange={(e) => setStorageLocation(e.target.value)}
                    placeholder="مثلاً گودام A، کباڑ یارڈ #2"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ابتدائی اسٹاک (KG)</label>
                  <input
                    type="number"
                    value={stockKg}
                    onChange={(e) => setStockKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ریٹ فی کلو (PKR)</label>
                  <input
                    type="number"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

