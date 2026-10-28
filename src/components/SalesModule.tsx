import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  FileText,
  CheckCircle,
  Truck,
  Printer,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Ban
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Sale, PrintableSlipData } from '../types';

interface SalesModuleProps {
  onOpenDispatchModal?: () => void;
}

export const SalesModule: React.FC<SalesModuleProps> = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { canDeleteRecords, canEditRecords } = useAuth();
  const { customers, items, sales, deliveries, addSale, cancelSale, setPrintableSlip } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<Sale | null>(null);

  // Form State
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState(
    items.find((i) => i.category === 'recovered_metal')?.id || items[0]?.id || ''
  );
  const [orderedQtyKg, setOrderedQtyKg] = useState(4000);
  const [rateUnit, setRateUnit] = useState<'per_kg' | 'per_maund' | 'per_ton'>('per_kg');
  const [inputRate, setInputRate] = useState(2750);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(1000000);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const customerObj = customers.find((c) => c.id === customerId);
  const itemObj = items.find((i) => i.id === selectedItemId);

  // Rate calculation
  let ratePerKg = inputRate;
  if (rateUnit === 'per_maund') {
    ratePerKg = inputRate / 40;
  } else if (rateUnit === 'per_ton') {
    ratePerKg = inputRate / 1000;
  }

  const subtotalAmount = Math.round(orderedQtyKg * ratePerKg);
  const totalAmount = Math.max(0, subtotalAmount - discountAmount + additionalCharges);

  const handleCreateSale = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderedQtyKg <= 0 || ratePerKg <= 0) {
      alert('براہِ کرم مقدار اور ریٹ صحیح درج کریں۔');
      return;
    }

    const newSaleNo = `INV-${Date.now().toString().slice(-4)}`;

    addSale({
      saleNo: newSaleNo,
      customerId,
      customerName: customerObj?.name || 'کسٹمر',
      orderType: 'direct',
      subtotalAmount,
      discountAmount,
      additionalCharges,
      totalAmount,
      paidAmount,
      paymentStatus: paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'credit',
      deliveryStatus: 'pending',
      items: [
        {
          itemId: selectedItemId,
          itemNameUrdu: itemObj?.nameUrdu || 'خالص میٹل',
          itemNameEng: itemObj?.nameEng || 'Recovered Metal',
          orderedQtyKg,
          deliveredQtyKg: 0,
          rateUnit,
          inputRate,
          ratePerKg,
          totalAmount: subtotalAmount
        }
      ],
      notes,
      createdBy: 'مالک / منشی'
    });

    setShowAddModal(false);
    alert(`سیلز آرڈر ${newSaleNo} کامیابی سے درج ہو گیا۔ اسٹاک رزرو کر دیا گیا!`);
  };

  const handlePrintSaleInvoice = (sale: Sale) => {
    const slipData: PrintableSlipData = {
      type: 'weighment_sale',
      titleUrdu: 'البَرَکَہ سکریپ و میٹل ٹریڈنگ - سیلز انوائس و سپلائی معاہدہ',
      titleEng: 'Al-Baraka Metal Trading - Sales Contract & Invoice',
      docNo: sale.saleNo,
      date: new Date(sale.createdAt).toLocaleDateString('ur-PK'),
      partyName: sale.customerName,
      items: sale.items.map((i) => ({
        nameUrdu: i.itemNameUrdu,
        nameEng: i.itemNameEng,
        weightKg: i.orderedQtyKg,
        rate: i.ratePerKg,
        amount: i.totalAmount
      })),
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      remainingBalance: sale.totalAmount - sale.paidAmount,
      notes: sale.notes || 'معاہدہ کے مطابق مال چالان کے بعد وصولی واجب الادا ہوگی۔',
      signatureText: 'دستخط برائے المشتری / البرکۃ منیجر'
    };

    setPrintableSlip(slipData);
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.saleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCustomer =
      customerFilter === 'all' || s.customerId === customerFilter;

    const matchesStatus =
      statusFilter === 'all' || s.deliveryStatus === statusFilter;

    return matchesSearch && matchesCustomer && matchesStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner - Short Words */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span>سیلز آرڈرز رجسٹر</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            کسٹمر ملز کے آرڈرز، مال روانگی و بقایا
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer text-xs sm:text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>نیا آرڈر</span>
        </button>
      </div>

      {/* Filter and Search Controls with Dropdowns (Dropdown use karo) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="آرڈر # یا کسٹمر نام..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Customer Dropdown */}
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="flex-1 sm:flex-initial bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="all">تمام کسٹمرز</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-initial bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
            >
              <option value="all">تمام اسٹیٹس</option>
              <option value="pending">پینڈنگ (Pending)</option>
              <option value="partial_delivered">جزوی روانہ (Partial)</option>
              <option value="fully_delivered">مکمل روانہ</option>
            </select>

            <span className="text-slate-400 font-mono text-xs hidden lg:inline">
              کل: {filteredSales.length}
            </span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2.5 text-right">آرڈر #</th>
                <th className="p-2.5 text-right">کسٹمر</th>
                <th className="p-2.5 text-right">آئٹم</th>
                <th className="p-2.5 text-right">آرڈر وزن</th>
                <th className="p-2.5 text-right">روانہ وزن</th>
                <th className="p-2.5 text-right">بقیہ وزن</th>
                <th className="p-2.5 text-right">کل رقم</th>
                <th className="p-2.5 text-right">حالت</th>
                <th className="p-2.5 text-center">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSales.map((s) => {
                const firstItem = s.items[0];
                const totalOrderedKg = s.items.reduce((acc, i) => acc + (i.orderedQtyKg || 0), 0);
                const totalDeliveredKg = s.items.reduce((acc, i) => acc + (i.deliveredQtyKg || 0), 0);
                const remainingKg = Math.max(0, totalOrderedKg - totalDeliveredKg);
                const isCancelled = s.status === 'cancelled' || s.deliveryStatus === 'cancelled';

                return (
                  <tr key={s.id} className={`hover:bg-slate-800/40 ${isCancelled ? 'opacity-60 bg-rose-950/20' : ''}`}>
                    <td className="p-2.5 font-mono font-bold text-emerald-400">{s.saleNo}</td>
                    <td className="p-2.5 font-bold text-slate-100">{s.customerName}</td>
                    <td className="p-2.5 text-slate-300 font-medium">
                      {firstItem?.itemNameUrdu || 'خالص میٹل'}
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-200">
                      {totalOrderedKg.toLocaleString()} k
                    </td>
                    <td className="p-2.5 font-mono font-bold text-emerald-400">
                      {totalDeliveredKg.toLocaleString()} k
                    </td>
                    <td className="p-2.5 font-mono font-bold text-amber-400">
                      {remainingKg.toLocaleString()} k
                    </td>
                    <td className="p-2.5 font-bold text-slate-100 font-mono">
                      {formatCurrency(s.totalAmount)}
                    </td>
                    <td className="p-2.5">
                      {isCancelled ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          منسوخ ({s.cancellationReason || 'Cancelled'})
                        </span>
                      ) : (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            s.deliveryStatus === 'fully_delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : s.deliveryStatus === 'partial_delivered'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {s.deliveryStatus === 'fully_delivered'
                            ? 'مکمل'
                            : s.deliveryStatus === 'partial_delivered'
                            ? 'جزوی'
                            : 'پینڈنگ'}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedSaleForDetails(s)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 px-2 py-1 rounded text-[11px] font-bold border border-slate-700 cursor-pointer"
                        >
                          تفصیلات
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintSaleInvoice(s)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1 rounded border border-slate-700 cursor-pointer"
                          title="انوائس پرنٹ کریں"
                        >
                          <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                        {!isCancelled && (canDeleteRecords || canEditRecords) && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('کیا آپ واقعی یہ سیلز آرڈر منسوخ کرنا چاہتے ہیں؟ اس سے رزرویشن خارج ہو جائے گی اور پیشگی رقم واپس ریورس ہو جائے گی۔ وجہ درج کریں:');
                              if (reason && reason.trim()) {
                                cancelSale(s.id, reason.trim());
                              }
                            }}
                            className="bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 p-1 rounded border border-slate-700 cursor-pointer"
                            title="سیلز آرڈر منسوخ کریں"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Easy thumb view) */}
        <div className="md:hidden space-y-2.5">
          {filteredSales.map((s) => {
            const firstItem = s.items[0];
            const totalOrderedKg = s.items.reduce((acc, i) => acc + (i.orderedQtyKg || 0), 0);
            const totalDeliveredKg = s.items.reduce((acc, i) => acc + (i.deliveredQtyKg || 0), 0);
            const remainingKg = Math.max(0, totalOrderedKg - totalDeliveredKg);
            const isCancelled = s.status === 'cancelled' || s.deliveryStatus === 'cancelled';

            return (
              <div
                key={s.id}
                className={`bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs space-y-2 ${
                  isCancelled ? 'opacity-60 bg-rose-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-emerald-400 font-bold">{s.saleNo}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      s.deliveryStatus === 'fully_delivered'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : s.deliveryStatus === 'partial_delivered'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.deliveryStatus === 'fully_delivered' ? 'مکمل' : s.deliveryStatus === 'partial_delivered' ? 'جزوی' : 'پینڈنگ'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-100">{s.customerName}</span>
                    <p className="text-[11px] text-slate-400">{firstItem?.itemNameUrdu}</p>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-slate-100 font-bold block">{formatCurrency(s.totalAmount)}</span>
                    <span className="text-[10px] text-amber-400 block">بقیہ: {remainingKg} k</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-mono">
                    آرڈر: {totalOrderedKg}k · روانہ: {totalDeliveredKg}k
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedSaleForDetails(s)}
                      className="p-1.5 bg-slate-800 text-amber-400 rounded-lg text-xs font-semibold"
                    >
                      تفصیل
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePrintSaleInvoice(s)}
                      className="p-1.5 bg-slate-800 text-emerald-400 rounded-lg"
                      title="پرنٹ"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    {!isCancelled && (canDeleteRecords || canEditRecords) && (
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt('منسوخی کی وجہ:');
                          if (reason && reason.trim()) cancelSale(s.id, reason.trim());
                        }}
                        className="p-1.5 bg-slate-800 text-rose-400 rounded-lg text-xs"
                      >
                        منسوخ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sale Order Details & Partial Deliveries Modal */}
      {selectedSaleForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>سیلز آرڈر تفصیلات - {selectedSaleForDetails.saleNo}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  کسٹمر: <span className="text-slate-200 font-bold">{selectedSaleForDetails.customerName}</span> |
                  تاریخ: {new Date(selectedSaleForDetails.createdAt).toLocaleDateString('ur-PK')}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSaleForDetails(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Weight Breakdown Card */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 border-b border-slate-800 pb-1.5">
                آرڈر مطابقت و ڈیلیوری خلاصی (Order Fulfillment Progress)
              </h4>

              {selectedSaleForDetails.items.map((item, idx) => {
                const ord = item.orderedQtyKg || 0;
                const del = item.deliveredQtyKg || 0;
                const rem = Math.max(0, ord - del);
                const percent = ord > 0 ? Math.round((del / ord) * 100) : 0;

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-100">
                      <span>{item.itemNameUrdu} ({item.itemNameEng})</span>
                      <span className="text-emerald-400 font-mono">ریٹ: Rs {item.ratePerKg} / کلو</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">آرڈر شدہ (Ordered):</span>
                        <span className="text-slate-100 font-bold text-sm">{ord.toLocaleString()} KG</span>
                        <span className="text-[10px] text-slate-500 font-sans block">({(ord / 1000).toFixed(2)} ٹن)</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">روانہ شدہ (Delivered):</span>
                        <span className="text-emerald-400 font-bold text-sm">{del.toLocaleString()} KG</span>
                        <span className="text-[10px] text-emerald-600 font-sans block">({(del / 1000).toFixed(2)} ٹن)</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">بقیہ غیر روانہ (Remaining):</span>
                        <span className="text-amber-400 font-bold text-sm">{rem.toLocaleString()} KG</span>
                        <span className="text-[10px] text-amber-600 font-sans block">({(rem / 1000).toFixed(2)} ٹن)</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-400 text-left font-mono">{percent}% مکمل روانہ</div>
                  </div>
                );
              })}
            </div>

            {/* List of Dispatches / Chalans for this sale */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>اس آرڈر کے روانگی چالانز ہسٹری (Dispatch Chalans History)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-800 text-slate-400 font-semibold">
                    <tr>
                      <th className="p-2.5 text-right">چالان نمبر</th>
                      <th className="p-2.5 text-right">تاریخ</th>
                      <th className="p-2.5 text-right">گاڑی نمبر</th>
                      <th className="p-2.5 text-right">ڈرائیور</th>
                      <th className="p-2.5 text-right">روانہ صافی وزن</th>
                      <th className="p-2.5 text-right">چالان بل رقم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {deliveries
                      .filter((d) => d.saleId === selectedSaleForDetails.id)
                      .map((d) => (
                        <tr key={d.id}>
                          <td className="p-2.5 font-bold text-amber-400">{d.deliveryNo}</td>
                          <td className="p-2.5 text-slate-400">
                            {new Date(d.createdAt).toLocaleDateString('ur-PK')}
                          </td>
                          <td className="p-2.5 text-slate-200">{d.vehicleNo}</td>
                          <td className="p-2.5 text-slate-300 font-sans">{d.driverName}</td>
                          <td className="p-2.5 text-emerald-400 font-bold">{d.netWeight.toLocaleString()} KG</td>
                          <td className="p-2.5 text-slate-100 font-bold">
                            {formatCurrency(d.netWeight * (selectedSaleForDetails.items[0]?.ratePerKg || 0))}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => handlePrintSaleInvoice(selectedSaleForDetails)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>انوائس پرنٹ کریں</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSaleForDetails(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Sale Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-3">
              نیا میٹل سیلز آرڈر / سپلائی معاہدہ کاٹیں
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">کسٹمر مل کا انتخاب *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.millName || c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">خالص میٹل آئٹم *</label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => setSelectedItemId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    {items
                      .filter((i) => i.category === 'recovered_metal')
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nameUrdu} (دستیاب: {formatWeight(i.currentStockKg)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">آرڈر مقدار (KG) *</label>
                  <input
                    type="number"
                    value={orderedQtyKg}
                    onChange={(e) => setOrderedQtyKg(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-sm rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ریٹ یونٹ</label>
                  <select
                    value={rateUnit}
                    onChange={(e) => setRateUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    <option value="per_kg">فی کلو (Per KG)</option>
                    <option value="per_maund">فی من (Per Maund / 40KG)</option>
                    <option value="per_ton">فی ٹن (Per Ton / 1000KG)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">درج کردہ ریٹ (PKR)</label>
                  <input
                    type="number"
                    value={inputRate}
                    onChange={(e) => setInputRate(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ڈسکاؤنٹ رعائیت (PKR)</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اضافی چارجز (PKR)</label>
                  <input
                    type="number"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ایڈوانس وصولی (PKR)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                <span className="text-slate-400">حساب شدہ ریٹ فی کلو: <strong className="text-slate-200">Rs {ratePerKg.toFixed(2)}</strong></span>
                <span className="text-slate-400">کل آرڈر بل: <strong className="text-emerald-400 font-mono text-sm">{formatCurrency(totalAmount)}</strong></span>
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
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  آرڈر و رزرویشن محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

