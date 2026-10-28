import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Printer,
  Scale,
  Paperclip,
  Trash2,
  CheckCircle,
  FileText,
  UserPlus,
  Filter,
  DollarSign,
  RotateCcw,
  Ban
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PurchaseItem, PrintableSlipData } from '../types';

interface PurchasesModuleProps {
  onOpenWeighmentModal?: () => void;
}

export const PurchasesModule: React.FC<PurchasesModuleProps> = ({ onOpenWeighmentModal }) => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { canDeleteRecords, canEditRecords } = useAuth();
  const {
    purchases,
    suppliers,
    items,
    addPurchase,
    cancelPurchase,
    addSupplier,
    setPrintableSlip
  } = useData();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInlineSupplierModal, setShowInlineSupplierModal] = useState(false);

  // New Supplier Inline Form
  const [newSupName, setNewSupName] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCity, setNewSupCity] = useState('مصری شاہ، لاہور');

  // New Purchase Voucher Form
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [vehicleNo, setVehicleNo] = useState('LES-4921');
  const [driverName, setDriverName] = useState('نعیم خان');
  const [driverPhone, setDriverPhone] = useState('0300-1122334');
  const [transporterName, setTransporterName] = useState('الخیبر ٹرانسپورٹ لاہور');

  // Weights (KG)
  const [grossWeight, setGrossWeight] = useState(18500);
  const [tareWeight, setTareWeight] = useState(6200);
  const [deductionKg, setDeductionKg] = useState(300);

  // Multi-Material Items in 1 Truck
  const [materialRows, setMaterialRows] = useState<
    Array<{
      itemId: string;
      quantityPieces: number;
      weightKg: number;
      rateUnit: 'per_kg' | 'per_maund' | 'per_ton';
      inputRate: number;
    }>
  >([
    {
      itemId: items[0]?.id || '',
      quantityPieces: 250,
      weightKg: 12000,
      rateUnit: 'per_kg',
      inputRate: 380
    }
  ]);

  // Operational Charges
  const [freightCharge, setFreightCharge] = useState(35000); // Kiraya
  const [loadingCharge, setLoadingCharge] = useState(5000); // Mazduri
  const [weighbridgeFee, setWeighbridgeFee] = useState(1000); // Kanda fee

  // Payment
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer' | 'credit' | 'cheque'>('cash');
  const [paidAmount, setPaidAmount] = useState(2000000);
  const [notes, setNotes] = useState('کمپریسر کباڑ سپلائی گاڑی');
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

  // Calculated Weights
  const netWeight = Math.max(0, grossWeight - tareWeight);
  const finalPayableWeight = Math.max(0, netWeight - deductionKg);

  // Calculate Materials Costs
  const calculatedItems: PurchaseItem[] = materialRows.map((row) => {
    const itemObj = items.find((i) => i.id === row.itemId);
    let ratePerKg = Number(row.inputRate) || 0;
    if (row.rateUnit === 'per_maund') {
      ratePerKg = ratePerKg / 40;
    } else if (row.rateUnit === 'per_ton') {
      ratePerKg = ratePerKg / 1000;
    }

    const itemWeight = Number(row.weightKg) || 0;
    const itemTotalAmount = Math.round(itemWeight * ratePerKg);

    return {
      itemId: row.itemId,
      itemNameUrdu: itemObj?.nameUrdu || 'سکریپ آئٹم',
      itemNameEng: itemObj?.nameEng || 'Scrap Item',
      quantityPieces: Number(row.quantityPieces) || 0,
      weightKg: itemWeight,
      rateUnit: row.rateUnit,
      inputRate: Number(row.inputRate) || 0,
      ratePerKg,
      totalAmount: itemTotalAmount
    };
  });

  const materialsTotalAmount = calculatedItems.reduce((acc, i) => acc + i.totalAmount, 0);
  const grandTotalAmount =
    materialsTotalAmount + freightCharge + loadingCharge + weighbridgeFee;
  const remainingPayableBalance = Math.max(0, grandTotalAmount - paidAmount);

  // Handlers for Multi-Item rows
  const handleAddMaterialRow = () => {
    setMaterialRows([
      ...materialRows,
      {
        itemId: items[1]?.id || items[0]?.id || '',
        quantityPieces: 100,
        weightKg: 1000,
        rateUnit: 'per_kg',
        inputRate: 400
      }
    ]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    setMaterialRows(materialRows.filter((_, i) => i !== index));
  };

  const handleMaterialRowChange = (index: number, field: string, value: any) => {
    const updated = [...materialRows];
    updated[index] = { ...updated[index], [field]: value };
    setMaterialRows(updated);
  };

  // Add Inline Supplier
  const handleCreateInlineSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName || !newSupPhone) {
      alert('براہِ کرم نیا سپلائر نام اور فون نمبر درج کریں۔');
      return;
    }
    const newId = `sup-${Date.now()}`;
    addSupplier({
      name: newSupName,
      company: newSupName,
      phone: newSupPhone,
      city: newSupCity,
      openingBalance: 0,
      currentBalance: 0
    });

    setSupplierId(newId);
    setShowInlineSupplierModal(false);
    setNewSupName('');
    setNewSupPhone('');
  };

  // Submit Purchase Voucher
  const handleSavePurchaseVoucher = (e: React.FormEvent) => {
    e.preventDefault();

    if (finalPayableWeight <= 0) {
      alert('براہِ کرم گاڑی کا درست وزن درج کریں۔ (گراس وزن، ٹیر وزن سے زیادہ ہونا چاہئے)');
      return;
    }

    const uniqueVoucherNo = `PUR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const uniqueSlipNo = `KANDA-${Math.floor(1000 + Math.random() * 9000)}`;

    const selectedSupplier = suppliers.find((s) => s.id === supplierId);

    addPurchase({
      purchaseNo: uniqueVoucherNo,
      supplierId,
      supplierName: selectedSupplier?.name || 'عام سپلائر',
      vehicleNo,
      driverName,
      driverPhone,
      transporterName,
      grossWeight,
      tareWeight,
      netWeight,
      deductionKg,
      finalPayableWeight,
      items: calculatedItems,
      materialsTotalAmount,
      freightCharge,
      loadingUnloadingCharge: loadingCharge,
      weighbridgeFee,
      totalAmount: grandTotalAmount,
      paidAmount,
      paymentMode,
      paymentStatus:
        paidAmount >= grandTotalAmount
          ? 'paid'
          : paidAmount > 0
          ? 'partial'
          : 'unpaid',
      weighmentSlipNo: uniqueSlipNo,
      attachmentUrls: attachmentPreview ? [attachmentPreview] : undefined,
      notes,
      createdBy: 'منشی (Purchasing Manager)'
    });

    // Generate Printable Receipt
    const slipData: PrintableSlipData = {
      type: 'weighment_purchase',
      titleUrdu: 'البرکۃ سکریپ گودام - خریداری و کینڈا پرچی',
      titleEng: 'Al-Baraka Scrap Godown - Purchase Voucher',
      docNo: uniqueVoucherNo,
      date: new Date().toLocaleDateString('ur-PK') + ' ' + new Date().toLocaleTimeString('ur-PK'),
      partyName: selectedSupplier?.name || 'عام سپلائر',
      vehicleNo,
      driverName,
      items: calculatedItems.map((i) => ({
        nameUrdu: i.itemNameUrdu,
        nameEng: i.itemNameEng,
        weightKg: i.weightKg,
        rate: i.ratePerKg,
        amount: i.totalAmount
      })),
      grossWeight,
      tareWeight,
      netWeight,
      deductionKg,
      totalAmount: grandTotalAmount,
      paidAmount,
      remainingBalance: remainingPayableBalance,
      notes: `${notes} | کرایہ: Rs ${freightCharge}`,
      signatureText: 'دستخط منشی / سپلائر وصولی'
    };

    setPrintableSlip(slipData);
    setShowPurchaseModal(false);
  };

  // Simulated Attachment File Upload
  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter Purchase Records
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredPurchases = purchases.filter((p) => {
    const matchesSearch =
      p.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.weighmentSlipNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.items.some((i) => i.itemNameUrdu.includes(searchTerm));

    const matchesStatus =
      statusFilter === 'all' || p.paymentStatus === statusFilter;

    const matchesSupplier =
      supplierFilter === 'all' || p.supplierId === supplierFilter;

    const matchesDate =
      dateFilter === 'all' ||
      (dateFilter === 'today' && p.createdAt.startsWith(todayStr)) ||
      (dateFilter === 'week' && p.createdAt >= oneWeekAgo) ||
      (dateFilter === 'month' && p.createdAt >= oneMonthAgo);

    return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner Header - Short Words */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <span>خریداری آمد رجسٹر</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            سپلائرز سے مال خرید، وزن، بل و ادائیگیاں
          </p>
        </div>

        <button
          onClick={() => setShowPurchaseModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-xs sm:text-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>نیا واؤچر</span>
        </button>
      </div>

      {/* Filter and Search Controls with Dropdowns (Dropdown use karo) */}
      <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row flex-wrap items-center justify-between gap-2.5 shadow-md text-xs">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="سپلائر، گاڑی، واؤچر..."
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg pr-8 pl-3 py-1.5 focus:border-amber-500 text-xs"
          />
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Supplier Dropdown */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="flex-1 sm:flex-initial bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="all">تمام سپلائرز</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 sm:flex-initial bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="all">تمام اسٹیٹس</option>
            <option value="paid">مکمل ادا شدہ</option>
            <option value="partial">جزوی ادائیگی</option>
            <option value="unpaid">ادھار</option>
          </select>

          {/* Date Filter Dropdown */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as any)}
            className="flex-1 sm:flex-initial bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium cursor-pointer"
          >
            <option value="all">تمام تاریخیں</option>
            <option value="today">آج</option>
            <option value="week">رواں ہفتہ</option>
            <option value="month">رواں ماہ</option>
          </select>
        </div>
      </div>

      {/* Purchase Records - Responsive Desktop Table & Mobile Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2.5 text-right">واؤچر #</th>
                <th className="p-2.5 text-right">سپلائر</th>
                <th className="p-2.5 text-right">گاڑی</th>
                <th className="p-2.5 text-right">مٹیریل</th>
                <th className="p-2.5 text-right">صافی وزن</th>
                <th className="p-2.5 text-right">کل رقم</th>
                <th className="p-2.5 text-right">ادائیگی / بقایا</th>
                <th className="p-2.5 text-right">تاریخ</th>
                <th className="p-2.5 text-right">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500">
                    کوئی خریداری ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => {
                  const rem = p.totalAmount - p.paidAmount;
                  const isCancelled = p.status === 'cancelled';
                  return (
                    <tr key={p.id} className={`hover:bg-slate-800/40 ${isCancelled ? 'opacity-60 bg-rose-950/20' : ''}`}>
                      <td className="p-2.5 font-mono font-bold text-amber-400">
                        {p.purchaseNo}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {p.weighmentSlipNo}
                        </span>
                        {isCancelled && (
                          <span className="inline-block mt-0.5 px-1 py-0.5 rounded text-[9px] bg-rose-500/20 text-rose-300 font-sans border border-rose-500/30">
                            منسوخ ({p.cancellationReason || 'Cancelled'})
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-bold text-slate-100">{p.supplierName}</td>
                      <td className="p-2.5 font-mono text-slate-300">
                        {p.vehicleNo}
                      </td>
                      <td className="p-2.5 text-slate-200">
                        {p.items.map((i) => `${i.itemNameUrdu} (${i.weightKg}k)`).join(', ')}
                      </td>
                      <td className="p-2.5 font-bold text-emerald-400 font-mono">
                        {formatWeight(p.finalPayableWeight)}
                      </td>
                      <td className="p-2.5 font-bold text-slate-100 font-mono">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="p-2.5 font-mono">
                        <span className="text-emerald-400 font-bold block">
                          {formatCurrency(p.paidAmount)}
                        </span>
                        {rem > 0 && !isCancelled && (
                          <span className="text-rose-400 text-[10px] block">
                            بقایا: {formatCurrency(rem)}
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-400 font-mono">
                        {new Date(p.createdAt).toLocaleDateString('ur-PK')}
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              const slipData: PrintableSlipData = {
                                type: 'weighment_purchase',
                                titleUrdu: isCancelled
                                  ? 'البرکۃ سکریپ گودام - خریداری واؤچر پرچی (منسوخ شدہ)'
                                  : 'البرکۃ سکریپ گودام - خریداری واؤچر پرچی',
                                titleEng: isCancelled
                                  ? 'Al-Baraka Scrap Godown - Purchase Voucher (CANCELLED)'
                                  : 'Al-Baraka Scrap Godown - Purchase Voucher',
                                docNo: p.purchaseNo,
                                date: new Date(p.createdAt).toLocaleDateString('ur-PK'),
                                partyName: p.supplierName,
                                vehicleNo: p.vehicleNo,
                                driverName: p.driverName,
                                items: p.items.map((i) => ({
                                  nameUrdu: i.itemNameUrdu,
                                  nameEng: i.itemNameEng,
                                  weightKg: i.weightKg,
                                  rate: i.ratePerKg,
                                  amount: i.totalAmount
                                })),
                                grossWeight: p.grossWeight,
                                tareWeight: p.tareWeight,
                                netWeight: p.netWeight,
                                deductionKg: p.deductionKg,
                                totalAmount: p.totalAmount,
                                paidAmount: p.paidAmount,
                                remainingBalance: p.totalAmount - p.paidAmount,
                                notes: isCancelled ? `[منسوخ شدہ: ${p.cancellationReason}] ${p.notes || ''}` : p.notes,
                                signatureText: 'دستخط منشی / سپلائر'
                              };
                              setPrintableSlip(slipData);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                            title="پرچی پرنٹ کریں"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!isCancelled && (canDeleteRecords || canEditRecords) && (
                            <button
                              onClick={() => {
                                const reason = prompt('کیا آپ واقعی یہ خریداری واؤچر منسوخ کرنا چاہتے ہیں؟ اس سے انوینٹری اسٹاک اور سپلائر کھاتہ واپس ریورس ہو جائے گا۔ منسوخی کی وجہ درج کریں:');
                                if (reason && reason.trim()) {
                                  cancelPurchase(p.id, reason.trim());
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg transition cursor-pointer"
                              title="واؤچر منسوخ کریں"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Easy thumb reading & touch targets) */}
        <div className="md:hidden space-y-2.5">
          {filteredPurchases.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              کوئی خریداری ریکارڈ موجود نہیں۔
            </div>
          ) : (
            filteredPurchases.map((p) => {
              const rem = p.totalAmount - p.paidAmount;
              const isCancelled = p.status === 'cancelled';
              return (
                <div
                  key={p.id}
                  className={`bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs space-y-2 ${
                    isCancelled ? 'opacity-60 bg-rose-950/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div>
                      <span className="font-mono text-amber-400 font-bold">{p.purchaseNo}</span>
                      <span className="text-[10px] text-slate-400 font-mono mr-2">· {p.vehicleNo}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(p.createdAt).toLocaleDateString('ur-PK')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100">{p.supplierName}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {p.items.map((i) => i.itemNameUrdu).join(', ')}
                      </p>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-emerald-400 font-bold block">{formatWeight(p.finalPayableWeight)}</span>
                      <span className="text-slate-100 font-bold block">{formatCurrency(p.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="text-[10px] font-mono">
                      <span className="text-emerald-400">ادا: {formatCurrency(p.paidAmount)}</span>
                      {rem > 0 && !isCancelled && (
                        <span className="text-rose-400 mr-2">بقایا: {formatCurrency(rem)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          const slipData: PrintableSlipData = {
                            type: 'weighment_purchase',
                            titleUrdu: isCancelled
                              ? 'البرکۃ سکریپ گودام - خریداری واؤچر پرچی (منسوخ شدہ)'
                              : 'البرکۃ سکریپ گودام - خریداری واؤچر پرچی',
                            titleEng: isCancelled
                              ? 'Al-Baraka Scrap Godown - Purchase Voucher (CANCELLED)'
                              : 'Al-Baraka Scrap Godown - Purchase Voucher',
                            docNo: p.purchaseNo,
                            date: new Date(p.createdAt).toLocaleDateString('ur-PK'),
                            partyName: p.supplierName,
                            vehicleNo: p.vehicleNo,
                            driverName: p.driverName,
                            items: p.items.map((i) => ({
                              nameUrdu: i.itemNameUrdu,
                              nameEng: i.itemNameEng,
                              weightKg: i.weightKg,
                              rate: i.ratePerKg,
                              amount: i.totalAmount
                            })),
                            grossWeight: p.grossWeight,
                            tareWeight: p.tareWeight,
                            netWeight: p.netWeight,
                            deductionKg: p.deductionKg,
                            totalAmount: p.totalAmount,
                            paidAmount: p.paidAmount,
                            remainingBalance: p.totalAmount - p.paidAmount,
                            notes: isCancelled ? `[منسوخ شدہ: ${p.cancellationReason}] ${p.notes || ''}` : p.notes,
                            signatureText: 'دستخط منشی / سپلائر'
                          };
                          setPrintableSlip(slipData);
                        }}
                        className="p-1.5 bg-slate-800 text-amber-400 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>پرنٹ</span>
                      </button>

                      {!isCancelled && (canDeleteRecords || canEditRecords) && (
                        <button
                          onClick={() => {
                            const reason = prompt('منسوخی کی وجہ درج کریں:');
                            if (reason && reason.trim()) {
                              cancelPurchase(p.id, reason.trim());
                            }
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
            })
          )}
        </div>
      </div>

      {/* New Purchase Voucher Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-5 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <span>نیا گاڑی و سکریپ خریداری واؤچر (New Incoming Vehicle Purchase)</span>
              </h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-slate-100 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchaseVoucher} className="space-y-5">
              {/* Supplier Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800 items-end">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">سپلائر کا انتخاب *</label>
                    <button
                      type="button"
                      onClick={() => setShowInlineSupplierModal(true)}
                      className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ نیا سپلائر شامل کریں</span>
                    </button>
                  </div>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.company || s.city}) - واجب الادا: Rs {s.currentBalance}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">گاڑی نمبر *</label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      placeholder="LES-4921"
                      required
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">ڈرائیور نام</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="ڈرائیور"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">فون نمبر</label>
                    <input
                      type="text"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="0300-XXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Weighbridge Weights Indicator Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3">
                <span className="text-amber-400 font-bold block text-xs">
                  کانٹا وزن انڈیکیٹر (Weighbridge Scale Weights)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">گراس وزن KG</label>
                    <input
                      type="number"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-lg font-bold rounded-lg p-2 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">ٹیر خالی گاڑی KG</label>
                    <input
                      type="number"
                      value={tareWeight}
                      onChange={(e) => setTareWeight(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-lg font-bold rounded-lg p-2 text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">گند / کچرا کٹوتی KG</label>
                    <input
                      type="number"
                      value={deductionKg}
                      onChange={(e) => setDeductionKg(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-rose-400 font-mono text-lg font-bold rounded-lg p-2 text-center"
                    />
                  </div>

                  <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/50 flex flex-col justify-center items-center">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">
                      قابلِ بل صافی وزن
                    </span>
                    <span className="text-xl font-bold font-mono text-emerald-400">
                      {finalPayableWeight.toLocaleString()} KG
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-Material Items Builder */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold">
                    گاڑی میں موجود مٹیریل اور ریٹ (Multiple Scrap Items in Truck)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ نیا آئٹم شامل کریں</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {materialRows.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-2 p-3 bg-slate-900 rounded-lg border border-slate-800 items-center text-xs"
                    >
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">آئٹم نام</label>
                        <select
                          value={row.itemId}
                          onChange={(e) =>
                            handleMaterialRowChange(index, 'itemId', e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                        >
                          {items.map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.nameUrdu}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">تعداد / وزن (KG)</label>
                        <input
                          type="number"
                          value={row.weightKg}
                          onChange={(e) =>
                            handleMaterialRowChange(index, 'weightKg', Number(e.target.value))
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold rounded p-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">ریٹ اکائی</label>
                        <select
                          value={row.rateUnit}
                          onChange={(e) =>
                            handleMaterialRowChange(index, 'rateUnit', e.target.value)
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                        >
                          <option value="per_kg">فی کلوگرام (Per KG)</option>
                          <option value="per_maund">فی من (Per Maund = 40kg)</option>
                          <option value="per_ton">فی ٹن (Per Ton = 1000kg)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">ریٹ (PKR)</label>
                        <input
                          type="number"
                          value={row.inputRate}
                          onChange={(e) =>
                            handleMaterialRowChange(index, 'inputRate', Number(e.target.value))
                          }
                          className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="block text-[10px] text-slate-400">آئٹم بل</span>
                          <span className="font-bold text-emerald-400 font-mono">
                            {formatCurrency(calculatedItems[index]?.totalAmount || 0)}
                          </span>
                        </div>

                        {materialRows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(index)}
                            className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-slate-800 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Charges & Payment Options */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">کرایہ گاڑی (Freight)</label>
                  <input
                    type="number"
                    value={freightCharge}
                    onChange={(e) => setFreightCharge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">پلائی و مزدوری</label>
                  <input
                    type="number"
                    value={loadingCharge}
                    onChange={(e) => setLoadingCharge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">طریقہ ادائیگی</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                  >
                    <option value="cash">نقد ادا (Cash)</option>
                    <option value="bank_transfer">آن لائن بینک ٹرانسفر</option>
                    <option value="credit">مکمل ادھار (Credit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">موقع پر ادائیگی (Paid Cash)</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-sm rounded p-2"
                  />
                </div>
              </div>

              {/* Attachments / Photo Upload */}
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <Paperclip className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-semibold">وزن پرچی تصویر منسلک کریں:</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAttachmentUpload}
                  className="text-xs text-slate-400 cursor-pointer"
                />
                {attachmentPreview && (
                  <span className="text-emerald-400 font-bold text-[10px]">
                    ✓ تصویر منسلک ہوگئی
                  </span>
                )}
              </div>

              {/* Financial Calculation Grand Summary Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    مٹیریل بل: Rs {materialsTotalAmount.toLocaleString()} | اخراجات: Rs {(freightCharge + loadingCharge + weighbridgeFee).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-200">
                    کل فائنل بل (Grand Total):
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">کل بل رقم</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {formatCurrency(grandTotalAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">سپلائر کھاتہ بقایا</span>
                    <span className="text-xl font-bold font-mono text-rose-400">
                      {formatCurrency(remainingPayableBalance)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer text-sm shadow-lg shadow-amber-500/20"
                >
                  خریداری واؤچر محفوظ کریں و پرنٹ پرچی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inline Supplier Modal */}
      {showInlineSupplierModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl text-xs">
            <h3 className="text-base font-bold text-amber-400 border-b border-slate-800 pb-2">
              نیا سپلائر فوری شامل کریں
            </h3>

            <form onSubmit={handleCreateInlineSupplier} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">سپلائر نام *</label>
                <input
                  type="text"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="نام سپلائر"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">فون نمبر *</label>
                <input
                  type="text"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  placeholder="0300-XXXXXXX"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">شہر / مارکیٹ</label>
                <input
                  type="text"
                  value={newSupCity}
                  onChange={(e) => setNewSupCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInlineSupplierModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded"
                >
                  شامل کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
