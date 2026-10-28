import React, { useState } from 'react';
import {
  BookOpen,
  Printer,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  Building,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PaymentVoucherType } from '../types';

interface LedgersModuleProps {
  selectedPartyForLedger?: string;
}

export const LedgersModule: React.FC<LedgersModuleProps> = ({ selectedPartyForLedger }) => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const {
    suppliers,
    customers,
    laborers,
    purchases,
    sales,
    deliveries,
    payments,
    addPaymentVoucher,
    setPrintableSlip
  } = useData();

  const [activePartyType, setActivePartyType] = useState<'supplier' | 'customer' | 'laborer'>('supplier');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(
    selectedPartyForLedger || suppliers[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Modal State for Debit Note / Credit Note / Adjustment
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteType, setNoteType] = useState<'debit_note' | 'credit_note' | 'adjustment'>('credit_note');
  const [noteAmount, setNoteAmount] = useState<number>(5000);
  const [allocatedInvoiceNo, setAllocatedInvoiceNo] = useState<string>('');
  const [noteReason, setNoteReason] = useState<string>('');

  // Active Selected Party Details
  const activeSupplier = suppliers.find((s) => s.id === selectedPartyId);
  const activeCustomer = customers.find((c) => c.id === selectedPartyId);
  const activeLaborer = laborers.find((l) => l.id === selectedPartyId);

  // Available invoices/purchases for current party for note allocation
  const partyPurchases = purchases.filter((p) => p.supplierId === selectedPartyId);
  const partySales = sales.filter((s) => s.customerId === selectedPartyId);

  // Build Chronological Ledger Entries
  type LedgerRow = {
    id: string;
    date: string;
    type: string;
    refNo: string;
    description: string;
    allocatedInvoice?: string;
    debit: number; // +
    credit: number; // -
    runningBalance: number;
    isReversal?: boolean;
    isNote?: boolean;
  };

  const rawEntries: Omit<LedgerRow, 'runningBalance'>[] = [];
  let openingBalance = 0;
  let partyName = '';
  let partyContact = '';
  let partyCityOrRole = '';

  if (activePartyType === 'supplier' && activeSupplier) {
    partyName = activeSupplier.name;
    partyContact = activeSupplier.phone;
    partyCityOrRole = activeSupplier.company ? `${activeSupplier.company} - ${activeSupplier.city}` : activeSupplier.city;
    openingBalance = activeSupplier.openingBalance || 0;

    // Supplier Purchases (Payable increases: Debit)
    partyPurchases.forEach((p) => {
      rawEntries.push({
        id: p.id,
        date: p.createdAt,
        type: 'خریداری مال (Purchase Bill)',
        refNo: p.weighmentSlipNo,
        description: `گاڑی ${p.vehicleNo || 'لوکل'} | کانٹا صافی وزن: ${p.finalPayableWeight.toLocaleString()} کلوگرام`,
        debit: p.totalAmount,
        credit: 0
      });
    });

    // Supplier Payments & Notes
    payments
      .filter((py) => py.partyId === selectedPartyId || py.partyName === activeSupplier.name)
      .forEach((py) => {
        const isReversal = py.isReversal;
        const isDebitNote = py.type === 'debit_note';
        const isCreditNote = py.type === 'credit_note';
        const isAdjustment = py.type === 'adjustment';

        let typeLabel = 'ادائیگی واؤچر (Payment)';
        let debit = 0;
        let credit = py.amount;

        if (isDebitNote) {
          typeLabel = 'ڈیبٹ نوٹ کلیم (Debit Note)';
          debit = py.amount;
          credit = 0;
        } else if (isCreditNote) {
          typeLabel = 'کریڈٹ نوٹ رعایت (Credit Note)';
          debit = 0;
          credit = py.amount;
        } else if (isAdjustment) {
          typeLabel = 'کھاتہ ایڈجسٹمنٹ (Adjustment)';
          credit = py.amount;
        } else if (isReversal) {
          typeLabel = 'واؤچر ریورسل اندراج (Contra Reversal)';
          debit = py.amount;
          credit = 0;
        }

        rawEntries.push({
          id: py.id,
          date: py.createdAt,
          type: typeLabel,
          refNo: py.voucherNo,
          description: py.description + (py.reversalReason ? ` [وجہ: ${py.reversalReason}]` : ''),
          allocatedInvoice: py.allocatedInvoiceNo,
          debit,
          credit,
          isReversal,
          isNote: isDebitNote || isCreditNote || isAdjustment
        });
      });
  } else if (activePartyType === 'customer' && activeCustomer) {
    partyName = activeCustomer.name;
    partyContact = activeCustomer.phone;
    partyCityOrRole = activeCustomer.millName ? `${activeCustomer.millName} - ${activeCustomer.city}` : activeCustomer.city;
    openingBalance = activeCustomer.openingBalance || 0;

    // Customer Dispatches / Deliveries (Receivable increases: Debit)
    const customerDeliveries = deliveries.filter((d) => d.customerId === selectedPartyId);
    if (customerDeliveries.length > 0) {
      customerDeliveries.forEach((d) => {
        const dVal = d.deliveredItems?.reduce((acc, it) => acc + it.amount, 0) || 0;
        rawEntries.push({
          id: d.id,
          date: d.createdAt,
          type: 'مال ترسیل چالان (Metal Delivery)',
          refNo: d.deliveryNo,
          description: `گاڑی ${d.vehicleNo} | ترسیل کردہ وزن: ${d.netWeight.toLocaleString()} کلوگرام | آرڈر ${d.saleNo}`,
          allocatedInvoice: d.saleNo,
          debit: dVal,
          credit: 0
        });
      });
    } else {
      partySales.forEach((s) => {
        rawEntries.push({
          id: s.id,
          date: s.createdAt,
          type: 'میٹل سیلز آرڈر (Sale Invoice)',
          refNo: s.saleNo,
          description: s.notes || 'میٹل سپلائی بل',
          allocatedInvoice: s.saleNo,
          debit: s.totalAmount,
          credit: 0
        });
      });
    }

    // Customer Receipts & Notes
    payments
      .filter((py) => py.partyId === selectedPartyId || py.partyName === activeCustomer.name)
      .forEach((py) => {
        const isReversal = py.isReversal;
        const isDebitNote = py.type === 'debit_note';
        const isCreditNote = py.type === 'credit_note';
        const isAdjustment = py.type === 'adjustment';

        let typeLabel = 'وصولی واؤچر (Customer Receipt)';
        let debit = 0;
        let credit = py.amount;

        if (isDebitNote) {
          typeLabel = 'ڈیبٹ نوٹ اضافہ (Debit Note)';
          debit = py.amount;
          credit = 0;
        } else if (isCreditNote) {
          typeLabel = 'کریڈٹ نوٹ ڈسکاؤنٹ (Credit Note)';
          debit = 0;
          credit = py.amount;
        } else if (isAdjustment) {
          typeLabel = 'کھاتہ ایڈجسٹمنٹ (Adjustment)';
          credit = py.amount;
        } else if (isReversal) {
          typeLabel = 'وصولی ریورسل (Contra Reversal)';
          debit = py.amount;
          credit = 0;
        }

        rawEntries.push({
          id: py.id,
          date: py.createdAt,
          type: typeLabel,
          refNo: py.voucherNo,
          description: py.description + (py.reversalReason ? ` [وجہ: ${py.reversalReason}]` : ''),
          allocatedInvoice: py.allocatedInvoiceNo,
          debit,
          credit,
          isReversal,
          isNote: isDebitNote || isCreditNote || isAdjustment
        });
      });
  } else if (activePartyType === 'laborer' && activeLaborer) {
    partyName = activeLaborer.name;
    partyContact = activeLaborer.phone;
    partyCityOrRole = activeLaborer.type === 'contractor_thekedar' ? 'ٹھیکیدار (Contractor)' : 'دیہاڑی مزدور (Daily Worker)';
    openingBalance = activeLaborer.currentPeshgiBalance || 0;

    // Payments / Advances to laborer
    payments
      .filter((py) => py.partyId === selectedPartyId || py.partyName === activeLaborer.name)
      .forEach((py) => {
        rawEntries.push({
          id: py.id,
          date: py.createdAt,
          type: py.isReversal ? 'ریورسل اندراج (Contra Reversal)' : 'پیشگی ادائیگی واؤچر (Advance Peshgi)',
          refNo: py.voucherNo,
          description: py.description,
          debit: py.amount,
          credit: 0,
          isReversal: py.isReversal
        });
      });
  }

  // Sort raw entries chronologically
  rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance
  const fullLedger: LedgerRow[] = [];
  let running = openingBalance;

  rawEntries.forEach((entry) => {
    running = running + entry.debit - entry.credit;
    fullLedger.push({
      ...entry,
      runningBalance: running
    });
  });

  // Filter by search and date range
  const filteredLedger = fullLedger.filter((entry) => {
    const entryDate = entry.date.slice(0, 10);
    if (fromDate && entryDate < fromDate) return false;
    if (toDate && entryDate > toDate) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        entry.refNo.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.type.toLowerCase().includes(q) ||
        (entry.allocatedInvoice && entry.allocatedInvoice.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Totals for the filtered view
  const totalDebits = filteredLedger.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = filteredLedger.reduce((sum, e) => sum + e.credit, 0);
  const closingBalance = openingBalance + totalDebits - totalCredits;

  // Handle Note Submission
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (noteAmount <= 0) {
      alert('براہ کرم رقم کی درست مقدار درج کریں۔');
      return;
    }

    const voucherNo = `${noteType === 'debit_note' ? 'DBN' : noteType === 'credit_note' ? 'CRN' : 'ADJ'}-${Date.now().toString().slice(-4)}`;

    addPaymentVoucher({
      voucherNo,
      type: noteType,
      partyType: activePartyType as 'supplier' | 'customer' | 'laborer',
      partyId: selectedPartyId,
      partyName: partyName,
      paymentMode: 'cash',
      amount: noteAmount,
      description: `${noteType === 'debit_note' ? 'ڈیبٹ نوٹ' : noteType === 'credit_note' ? 'کریڈٹ نوٹ' : 'کھاتہ ایڈجسٹمنٹ'}: ${noteReason || 'حساب برابر کرنے کیلئے'}`,
      allocatedInvoiceNo: allocatedInvoiceNo || undefined,
      createdBy: 'اکاؤنٹنٹ / منشی'
    });

    setShowNoteModal(false);
    setNoteReason('');
    setAllocatedInvoiceNo('');
  };

  // Handle Print Statement
  const handlePrintStatement = () => {
    const printableRows = [
      {
        date: 'ابتدائی',
        type: 'ابتدائی بقایا (Opening Balance)',
        refNo: 'OPN-BAL',
        description: 'کھاتہ کھولنے کے وقت بقایا بیلنس',
        debit: openingBalance > 0 ? openingBalance : 0,
        credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
        balance: openingBalance
      },
      ...filteredLedger.map((e) => ({
        date: new Date(e.date).toLocaleDateString('ur-PK'),
        type: e.type,
        refNo: e.refNo,
        description: e.description + (e.allocatedInvoice ? ` [بل: ${e.allocatedInvoice}]` : ''),
        debit: e.debit,
        credit: e.credit,
        balance: e.runningBalance
      }))
    ];

    setPrintableSlip({
      type: 'ledger',
      titleUrdu: `پارٹی کھاتہ اسٹیٹمنٹ برائے ${partyName}`,
      titleEng: `Official Party Ledger Statement - ${partyName}`,
      docNo: `LEDGER-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('ur-PK'),
      partyName: `${partyName} (${partyCityOrRole})`,
      items: [],
      ledgerRows: printableRows,
      totalAmount: closingBalance,
      remainingBalance: closingBalance,
      notes: `اسٹیٹمنٹ تاریخ: ${fromDate || 'شروع'} تا ${toDate || 'آج تک'} | مصدقہ البرکہ سکریپ گودام`,
      signatureText: 'تصدیق و دستخط اکاؤنٹنٹ / منشی'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Tabs - Short Words */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              <span>پارٹی کھاتہ رجسٹر</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              سپلائرز، کسٹمرز و لیبر لیجر اور بیلنس
            </p>
          </div>

          {/* Party Type: Dropdown on Mobile, Tabs on Desktop (Dropdown use karo) */}
          <div className="sm:hidden w-full">
            <select
              value={activePartyType}
              onChange={(e) => {
                const type = e.target.value as 'supplier' | 'customer' | 'laborer';
                setActivePartyType(type);
                if (type === 'supplier' && suppliers[0]) setSelectedPartyId(suppliers[0].id);
                if (type === 'customer' && customers[0]) setSelectedPartyId(customers[0].id);
                if (type === 'laborer' && laborers[0]) setSelectedPartyId(laborers[0].id);
              }}
              className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-xs font-bold py-2 px-3 rounded-lg focus:outline-none"
            >
              <option value="supplier">🏢 سپلائر کھاتہ</option>
              <option value="customer">👤 کسٹمر کھاتہ</option>
              <option value="laborer">👷 مزدور / ٹھیکیدار</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => {
                setActivePartyType('supplier');
                if (suppliers[0]) setSelectedPartyId(suppliers[0].id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePartyType === 'supplier'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>سپلائر</span>
            </button>

            <button
              onClick={() => {
                setActivePartyType('customer');
                if (customers[0]) setSelectedPartyId(customers[0].id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePartyType === 'customer'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>کسٹمر</span>
            </button>

            <button
              onClick={() => {
                setActivePartyType('laborer');
                if (laborers[0]) setSelectedPartyId(laborers[0].id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activePartyType === 'laborer'
                  ? 'bg-indigo-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>مزدور / ٹھیکہ</span>
            </button>
          </div>
        </div>

        {/* Party Selector and Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {activePartyType === 'supplier'
                ? 'سپلائر منتخب کریں (Select Supplier)'
                : activePartyType === 'customer'
                ? 'کسٹمر / فیکٹری منتخب کریں (Select Customer)'
                : 'مزدور / ٹھیکیدار منتخب کریں (Select Laborer)'}
            </label>
            <select
              value={selectedPartyId}
              onChange={(e) => setSelectedPartyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-bold text-sm rounded-lg p-2.5 focus:border-amber-500"
            >
              {activePartyType === 'supplier' &&
                suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.company || s.city} (موجودہ: Rs {s.currentBalance.toLocaleString()})
                  </option>
                ))}
              {activePartyType === 'customer' &&
                customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.millName} (واجب الوصول: Rs {c.currentBalance.toLocaleString()})
                  </option>
                ))}
              {activePartyType === 'laborer' &&
                laborers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.type === 'contractor_thekedar' ? 'ٹھیکیدار' : 'دیہاڑی'} (پیشگی: Rs {l.currentPeshgiBalance.toLocaleString()})
                  </option>
                ))}
            </select>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">رابطہ و پتہ (Contact & Info)</span>
            <span className="text-xs font-bold text-slate-200 block mt-0.5 truncate">{partyContact || 'رابطہ نمبر درج نہیں'}</span>
            <span className="text-[11px] text-slate-400 block truncate">{partyCityOrRole}</span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 block uppercase">
              {activePartyType === 'supplier'
                ? 'کل واجب الادا (Total Payable)'
                : activePartyType === 'customer'
                ? 'کل واجب الوصول (Total Receivable)'
                : 'پیشگی بقایا (Peshgi Advance)'}
            </span>
            <span className="text-xl font-bold font-mono text-amber-400 block mt-0.5">
              {formatCurrency(closingBalance)}
            </span>
          </div>
        </div>

        {/* Filter and Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                placeholder="ریفرنس، بل # یا تفصیل تلاش..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg pr-9 pl-3 py-2 w-48 sm:w-60 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>تاریخ سے:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>تاریخ تک:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
              />
            </div>

            {(fromDate || toDate || searchTerm) && (
              <button
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                  setSearchTerm('');
                }}
                className="text-[11px] text-amber-400 hover:underline px-2 py-1 cursor-pointer"
              >
                فلٹرز ختم کریں
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activePartyType !== 'laborer' && (
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-xl text-xs transition border border-amber-500/30 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>ڈیبٹ / کریڈٹ نوٹ جاری کریں</span>
              </button>
            )}

            <button
              onClick={handlePrintStatement}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>پرنٹ کھاتہ اسٹیٹمنٹ (Print Statement)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-slate-400 block font-medium">سابقہ / ابتدائی بقایا (Opening)</span>
          <span className="text-lg font-bold font-mono text-slate-200 mt-1 block">
            {formatCurrency(openingBalance)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">اکاؤنٹ آغاز پر طے شدہ بیلنس</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-amber-400 block font-medium">
            {activePartyType === 'supplier' ? 'کل مال خریداری (+) Total Purchases' : 'کل مال ترسیل (+) Total Dispatched'}
          </span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-1 block">
            {formatCurrency(totalDebits)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">کل بلز اور ڈیبٹ نوٹس</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-emerald-400 block font-medium">
            {activePartyType === 'supplier' ? 'کل ادائیگیاں (-) Total Payments' : 'کل نقد وصولیاں (-) Total Receipts'}
          </span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
            {formatCurrency(totalCredits)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">کیش، بینک اور کریڈٹ نوٹس</span>
        </div>

        <div className="bg-slate-950 border-2 border-amber-500/60 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-amber-300 block font-bold uppercase">
            صافی اختتامی بیلنس (Closing Balance)
          </span>
          <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">
            {formatCurrency(closingBalance)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
            {closingBalance > 0
              ? activePartyType === 'supplier'
                ? 'گودام پر واجب الادا رقم'
                : 'کسٹمر سے واجب الوصول رقم'
              : 'کھاتہ برابر / ایڈوانس'}
          </span>
        </div>
      </div>

      {/* Ledger Entries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>تاریخ وار کھاتہ ٹرانزیکشنز (Chronological Statement)</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            کل اندراجات: {filteredLedger.length + 1}
          </span>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2.5 text-right">تاریخ</th>
                <th className="p-2.5 text-right">قسم</th>
                <th className="p-2.5 text-right">واؤچر #</th>
                <th className="p-2.5 text-right">بل #</th>
                <th className="p-2.5 text-right">تفصیلات</th>
                <th className="p-2.5 text-right text-amber-400">ڈیبٹ (+)</th>
                <th className="p-2.5 text-right text-emerald-400">کریڈٹ (-)</th>
                <th className="p-2.5 text-right text-slate-200">بیلنس</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {/* Row 1: Opening Balance Row */}
              <tr className="bg-slate-950/60 font-semibold border-b border-amber-500/20">
                <td className="p-2.5 text-slate-400 font-sans">سابقہ</td>
                <td className="p-2.5 font-sans font-bold text-amber-300">ابتدائی بقایا</td>
                <td className="p-2.5 text-slate-400">OPN-BAL</td>
                <td className="p-2.5 text-slate-500">-</td>
                <td className="p-2.5 font-sans text-slate-400">کھاتہ آغاز سابقہ ذمہ بقایا</td>
                <td className="p-2.5 font-bold text-amber-400">
                  {openingBalance > 0 ? formatCurrency(openingBalance) : '-'}
                </td>
                <td className="p-2.5 font-bold text-emerald-400">
                  {openingBalance < 0 ? formatCurrency(Math.abs(openingBalance)) : '-'}
                </td>
                <td className="p-2.5 font-bold text-slate-100">{formatCurrency(openingBalance)}</td>
              </tr>

              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 font-sans">
                    کوئی ٹرانزیکشن موجود نہیں ہے۔
                  </td>
                </tr>
              ) : (
                filteredLedger.map((e) => (
                  <tr
                    key={e.id}
                    className={`hover:bg-slate-800/40 transition ${
                      e.isReversal
                        ? 'bg-rose-950/20 text-rose-200'
                        : e.isNote
                        ? 'bg-indigo-950/15'
                        : ''
                    }`}
                  >
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(e.date).toLocaleDateString('ur-PK')}
                    </td>
                    <td className="p-2.5 font-sans font-bold text-slate-100 flex items-center gap-1">
                      {e.isReversal && <RotateCcw className="w-3 h-3 text-rose-400 inline" />}
                      <span>{e.type}</span>
                    </td>
                    <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">{e.refNo}</td>
                    <td className="p-2.5 font-mono text-slate-300">
                      {e.allocatedInvoice ? (
                        <span className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-amber-300">
                          {e.allocatedInvoice}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="p-2.5 font-sans text-slate-300 max-w-xs truncate" title={e.description}>
                      {e.description}
                    </td>
                    <td className="p-2.5 font-bold text-amber-400">
                      {e.debit > 0 ? formatCurrency(e.debit) : '-'}
                    </td>
                    <td className="p-2.5 font-bold text-emerald-400">
                      {e.credit > 0 ? formatCurrency(e.credit) : '-'}
                    </td>
                    <td className="p-2.5 font-bold text-slate-100 whitespace-nowrap">
                      {formatCurrency(e.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700">
              <tr>
                <td colSpan={5} className="p-2.5 text-left font-sans text-slate-300">
                  میزان کل:
                </td>
                <td className="p-2.5 text-amber-400 font-mono">{formatCurrency(totalDebits)}</td>
                <td className="p-2.5 text-emerald-400 font-mono">{formatCurrency(totalCredits)}</td>
                <td className="p-2.5 text-amber-400 font-mono text-sm">{formatCurrency(closingBalance)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Cards View (Easy thumb view on phones) */}
        <div className="md:hidden space-y-2.5 font-sans">
          {/* Opening balance card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-300 block">ابتدائی بقایا</span>
              <span className="text-[10px] text-slate-500 font-mono">OPN-BAL</span>
            </div>
            <span className="font-mono font-bold text-slate-100">{formatCurrency(openingBalance)}</span>
          </div>

          {filteredLedger.map((e) => (
            <div
              key={e.id}
              className={`bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs space-y-2 ${
                e.isReversal ? 'border-rose-500/30 bg-rose-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <div className="flex items-center gap-1.5">
                  {e.isReversal && <RotateCcw className="w-3 h-3 text-rose-400" />}
                  <span className="font-bold text-slate-100">{e.type}</span>
                  <span className="text-[10px] font-mono text-amber-400 mr-1.5">· {e.refNo}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(e.date).toLocaleDateString('ur-PK')}
                </span>
              </div>

              <p className="text-slate-300 text-[11px]">{e.description}</p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono">
                <div className="flex items-center gap-2">
                  {e.debit > 0 && (
                    <span className="text-amber-400 font-bold">نام: {formatCurrency(e.debit)}</span>
                  )}
                  {e.credit > 0 && (
                    <span className="text-emerald-400 font-bold">جمع: {formatCurrency(e.credit)}</span>
                  )}
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block font-sans">بقایا بیلنس</span>
                  <span className="font-bold text-slate-100">{formatCurrency(e.runningBalance)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Debit Note / Credit Note / Adjustment */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <span>کھاتہ میں ڈیبٹ / کریڈٹ نوٹ اندراج</span>
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوٹ کی قسم</label>
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                >
                  <option value="credit_note">کریڈٹ نوٹ (Credit Note - رعایت / کلیم کمی)</option>
                  <option value="debit_note">ڈیبٹ نوٹ (Debit Note - کلیم چارج / کٹوتی)</option>
                  <option value="adjustment">کھاتہ ایڈجسٹمنٹ (Ledger Balance Adjustment)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">پارٹی</label>
                <input
                  type="text"
                  disabled
                  value={`${partyName} (${partyCityOrRole})`}
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-400 rounded-lg p-2.5 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  مربوطہ بل / انوائس نمبر (اختیاری)
                </label>
                <select
                  value={allocatedInvoiceNo}
                  onChange={(e) => setAllocatedInvoiceNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                >
                  <option value="">-- عام کھاتہ نوٹ (بغیر مخصوص بل کے) --</option>
                  {activePartyType === 'supplier' &&
                    partyPurchases.map((p) => (
                      <option key={p.id} value={p.weighmentSlipNo}>
                        پرچی {p.weighmentSlipNo} | گاڑی {p.vehicleNo} | رقم Rs {p.totalAmount.toLocaleString()}
                      </option>
                    ))}
                  {activePartyType === 'customer' &&
                    partySales.map((s) => (
                      <option key={s.id} value={s.saleNo}>
                        آرڈر {s.saleNo} | رقم Rs {s.totalAmount.toLocaleString()}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوٹ رقم (PKR) *</label>
                <input
                  type="number"
                  value={noteAmount}
                  onChange={(e) => setNoteAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono text-base rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  نوٹ کا سبب / تفصیلات (Reason / Notes) *
                </label>
                <textarea
                  rows={2}
                  value={noteReason}
                  onChange={(e) => setNoteReason(e.target.value)}
                  required
                  placeholder="مثلاً وزن میں کچرا کٹوتی کا کلیم، نرخ میں فرق، یا باہمی رضامندی سے رعایت"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  نوٹ جاری کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
