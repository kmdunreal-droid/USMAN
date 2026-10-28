import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  Printer,
  RotateCcw,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PaymentVoucher } from '../types';

interface PaymentsCashbookModuleProps {
  showModalInitially?: boolean;
  onCloseModal?: () => void;
}

const BANK_ACCOUNTS = [
  { name: 'Meezan Bank Ltd', accountNo: '0234-010549210-01', branch: 'بند روڈ برانچ، لاہور' },
  { name: 'Habib Bank Ltd (HBL)', accountNo: '1092-79018243-03', branch: 'مصری شاہ برانچ، لاہور' },
  { name: 'Allied Bank Ltd (ABL)', accountNo: '0010-04981274-02', branch: 'بادامی باغ برانچ، لاہور' },
  { name: 'MCB Bank Ltd', accountNo: '0543-91823741-01', branch: 'سرکلر روڈ برانچ، لاہور' }
];

export const PaymentsCashbookModule: React.FC<PaymentsCashbookModuleProps> = ({
  showModalInitially = false,
  onCloseModal
}) => {
  const { t, formatCurrency } = useLanguage();
  const {
    suppliers,
    customers,
    laborers,
    payments,
    expenses,
    purchases,
    sales,
    addPaymentVoucher,
    reversePaymentVoucher,
    setPrintableSlip
  } = useData();

  // Tab State: Cashbook vs Bankbook
  const [activeTab, setActiveTab] = useState<'cashbook' | 'bankbook'>('cashbook');
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Add Voucher Modal State
  const [showAddModal, setShowAddModal] = useState(showModalInitially);
  const [voucherType, setVoucherType] = useState<
    'supplier_payment' | 'customer_receipt' | 'labor_payment' | 'capital_add'
  >('supplier_payment');

  const [partyType, setPartyType] = useState<'supplier' | 'customer' | 'laborer' | 'owner'>('supplier');
  const [partyId, setPartyId] = useState(suppliers[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer' | 'cheque'>('cash');
  const [bankName, setBankName] = useState(BANK_ACCOUNTS[0].name);
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState('');
  const [allocatedInvoiceNo, setAllocatedInvoiceNo] = useState('');

  // Reversal Confirmation Modal State
  const [reversalTargetVoucher, setReversalTargetVoucher] = useState<PaymentVoucher | null>(null);
  const [reversalReason, setReversalReason] = useState('');

  // Filter Payments by Mode & Criteria
  const filteredPayments = payments.filter((p) => {
    // Tab filter
    if (activeTab === 'cashbook' && p.paymentMode !== 'cash') return false;
    if (activeTab === 'bankbook' && p.paymentMode === 'cash') return false;

    // Bank account filter
    if (activeTab === 'bankbook' && selectedBankFilter !== 'all') {
      if (p.bankName !== selectedBankFilter) return false;
    }

    // Type filter
    if (filterType !== 'all') {
      if (filterType === 'receipts' && p.type !== 'customer_receipt' && p.type !== 'capital_add') return false;
      if (filterType === 'payments' && p.type !== 'supplier_payment' && p.type !== 'labor_payment') return false;
      if (filterType === 'reversals' && !p.isReversal) return false;
    }

    // Date range
    const pDate = p.createdAt.slice(0, 10);
    if (fromDate && pDate < fromDate) return false;
    if (toDate && pDate > toDate) return false;

    // Search query
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.voucherNo.toLowerCase().includes(q) ||
        p.partyName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.allocatedInvoiceNo && p.allocatedInvoiceNo.toLowerCase().includes(q)) ||
        (p.bankName && p.bankName.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Calculate Totals for Cashbook
  const cashReceipts = payments
    .filter((p) => p.paymentMode === 'cash' && (p.type === 'customer_receipt' || p.type === 'capital_add') && !p.isReversal)
    .reduce((acc, p) => acc + p.amount, 0);

  const cashPayments = payments
    .filter((p) => p.paymentMode === 'cash' && (p.type === 'supplier_payment' || p.type === 'labor_payment') && !p.isReversal)
    .reduce((acc, p) => acc + p.amount, 0);

  const cashExpenses = expenses
    .filter((e) => e.paymentMode === 'cash')
    .reduce((acc, e) => acc + e.amount, 0);

  const OPENING_CASH = 500000;
  const netCashInHand = OPENING_CASH + cashReceipts - cashPayments - cashExpenses;

  // Calculate Totals for Bankbook
  const bankReceipts = payments
    .filter((p) => p.paymentMode !== 'cash' && (p.type === 'customer_receipt' || p.type === 'capital_add') && !p.isReversal)
    .reduce((acc, p) => acc + p.amount, 0);

  const bankPayments = payments
    .filter((p) => p.paymentMode !== 'cash' && (p.type === 'supplier_payment' || p.type === 'labor_payment') && !p.isReversal)
    .reduce((acc, p) => acc + p.amount, 0);

  const bankExpenses = expenses
    .filter((e) => e.paymentMode !== 'cash')
    .reduce((acc, e) => acc + e.amount, 0);

  const OPENING_BANK = 1250000;
  const netBankBalance = OPENING_BANK + bankReceipts - bankPayments - bankExpenses;

  // Active Party Purchases/Sales for invoice allocation in modal
  const availablePurchases = purchases.filter((p) => p.supplierId === partyId);
  const availableSales = sales.filter((s) => s.customerId === partyId);

  // Handle Voucher Creation
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('براہِ کرم رقم کی صحیح تعداد درج کریں۔');
      return;
    }

    let partyName = 'عام کیش';
    if (partyType === 'supplier') {
      partyName = suppliers.find((s) => s.id === partyId)?.name || 'سپلائر';
    } else if (partyType === 'customer') {
      partyName = customers.find((c) => c.id === partyId)?.name || 'کسٹمر';
    } else if (partyType === 'laborer') {
      partyName = laborers.find((l) => l.id === partyId)?.name || 'مزدور';
    }

    const prefix =
      voucherType === 'supplier_payment'
        ? 'SPV'
        : voucherType === 'customer_receipt'
        ? 'CRV'
        : voucherType === 'labor_payment'
        ? 'LPV'
        : 'CPV';

    const voucherNo = `${prefix}-${Date.now().toString().slice(-5)}`;

    addPaymentVoucher({
      voucherNo,
      type: voucherType,
      partyType,
      partyId: partyType === 'owner' ? 'owner-1' : partyId,
      partyName,
      paymentMode,
      bankName: paymentMode !== 'cash' ? bankName : undefined,
      amount,
      allocatedInvoiceNo: allocatedInvoiceNo || undefined,
      description: description || 'روزنامچہ کیش و بینک واؤچر اندراج',
      createdBy: 'منشی / کیشیئر'
    });

    setShowAddModal(false);
    setDescription('');
    setAllocatedInvoiceNo('');
    if (onCloseModal) onCloseModal();
  };

  // Handle Reversal Action
  const handleConfirmReversal = () => {
    if (!reversalTargetVoucher) return;
    if (!reversalReason.trim()) {
      alert('براہ کرم واؤچر منسوخی / ریورسل کی باضابطہ وجہ درج کریں۔');
      return;
    }

    reversePaymentVoucher(reversalTargetVoucher.id, reversalReason.trim());
    setReversalTargetVoucher(null);
    setReversalReason('');
  };

  // Handle Print Voucher Receipt
  const handlePrintVoucher = (p: PaymentVoucher) => {
    const isReceipt = p.type === 'customer_receipt' || p.type === 'capital_add';

    setPrintableSlip({
      type: 'payment_voucher',
      titleUrdu: isReceipt ? 'رسید وصولی کیش / بینک واؤچر' : 'رسید ادائیگی کیش / بینک واؤچر',
      titleEng: isReceipt ? 'Official Cash / Bank Receipt Voucher' : 'Official Payment Voucher',
      docNo: p.voucherNo,
      date: new Date(p.createdAt).toLocaleDateString('ur-PK'),
      partyName: p.partyName,
      items: [
        {
          nameUrdu: p.description || 'مالیاتی کھاتہ ادائیگی',
          nameEng: p.allocatedInvoiceNo ? `Allocated Invoice: ${p.allocatedInvoiceNo}` : 'Khata Entry',
          weightKg: 0,
          rate: 0,
          amount: p.amount
        }
      ],
      totalAmount: p.amount,
      paidAmount: p.amount,
      remainingBalance: 0,
      notes: `طریقہ: ${p.paymentMode === 'cash' ? 'نقد کیش' : `بینک ٹرانسفر (${p.bankName || ''})`} | اندراج کنندہ: ${p.createdBy || 'منشی'}`,
      signatureText: 'دستخط منشی / اکاؤنٹنٹ'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header & Actions - Short Words */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <span>روکڑ و بینک کیش بک</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            روزنامچہ نقد و آن لائن ادائیگیاں و وصولیاں
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Mobile Dropdown Switcher (Dropdown use karo) */}
          <div className="sm:hidden flex-1">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-amber-400 text-xs font-bold py-2 px-3 rounded-lg focus:outline-none"
            >
              <option value="cashbook">💵 روکڑ کیش بک</option>
              <option value="bankbook">🏦 بینک بک کھاتہ</option>
            </select>
          </div>

          {/* Desktop Cashbook vs Bankbook Switcher */}
          <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800 items-center">
            <button
              onClick={() => setActiveTab('cashbook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'cashbook'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>کیش بک</span>
            </button>

            <button
              onClick={() => setActiveTab('bankbook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'bankbook'
                  ? 'bg-blue-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>بینک بک</span>
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition shadow-md cursor-pointer text-xs min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>نیا واؤچر</span>
          </button>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      {activeTab === 'cashbook' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-slate-400 block font-medium">افتتاحی کیش (Opening Cash)</span>
            <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">
              {formatCurrency(OPENING_CASH)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">صبح کیش دراز میں موجود رقم</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-emerald-400 block font-medium">کل نقد وصولیاں (+) Receipts</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(cashReceipts)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">کسٹمرز و مالک کیش ڈپازٹ</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-rose-400 block font-medium">کل نقد ادائیگیاں (-) Payments</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
              {formatCurrency(cashPayments + cashExpenses)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">سپلائر، مزدور اور روزمرہ خرچے</span>
          </div>

          <div className="bg-slate-950 border-2 border-amber-500/60 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-amber-300 block font-bold uppercase">
              موجودہ کیش ان ہینڈ (Cash In Hand)
            </span>
            <span className="text-2xl font-extrabold font-mono text-amber-400 mt-1 block">
              {formatCurrency(netCashInHand)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              گودام دراز میں موجود نقد بیلنس
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-slate-400 block font-medium">ابتدائی بینک بیلنس (Opening)</span>
            <span className="text-xl font-bold font-mono text-slate-200 mt-1 block">
              {formatCurrency(OPENING_BANK)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">تمام بینک اکاؤنٹس کا سابقہ بیلنس</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-emerald-400 block font-medium">بینک وصولیاں (+) Inflow</span>
            <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
              {formatCurrency(bankReceipts)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">آن لائن و چیک کسٹمر ادائیگیاں</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-rose-400 block font-medium">بینک ادائیگیاں (-) Outflow</span>
            <span className="text-xl font-bold font-mono text-rose-400 mt-1 block">
              {formatCurrency(bankPayments + bankExpenses)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">آن لائن سپلائر ادائیگی و خرچے</span>
          </div>

          <div className="bg-slate-950 border-2 border-blue-500/60 p-4 rounded-xl shadow-md">
            <span className="text-[11px] text-blue-300 block font-bold uppercase">
              مجموعی بینک بیلنس (Total Bank)
            </span>
            <span className="text-2xl font-extrabold font-mono text-blue-400 mt-1 block">
              {formatCurrency(netBankBalance)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5 font-sans">
              تمام بینک کھاتوں کا دستیاب بیلنس
            </span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'bankbook' && (
            <select
              value={selectedBankFilter}
              onChange={(e) => setSelectedBankFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 font-bold focus:border-blue-500"
            >
              <option value="all">تمام بینک اکاؤنٹس (All Banks)</option>
              {BANK_ACCOUNTS.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name} ({b.accountNo})
                </option>
              ))}
            </select>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="واؤچر #، پارٹی یا انوائس تلاش..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg pr-9 pl-3 py-2 w-48 sm:w-60 focus:border-amber-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 focus:border-amber-500"
          >
            <option value="all">تمام اقسام (All Transactions)</option>
            <option value="receipts">صرف وصولیاں (+) Receipts</option>
            <option value="payments">صرف ادائیگیاں (-) Payments</option>
            <option value="reversals">ریورسل اندراجات (Reversals)</option>
          </select>

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
        </div>

        <span className="text-xs text-slate-400 font-mono">
          نمائش: {filteredPayments.length} واؤچرز
        </span>
      </div>

      {/* Vouchers Table & Mobile Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2.5 text-right">واؤچر #</th>
                <th className="p-2.5 text-right">قسم</th>
                <th className="p-2.5 text-right">پارٹی</th>
                <th className="p-2.5 text-right">طریقہ</th>
                <th className="p-2.5 text-right">بل #</th>
                <th className="p-2.5 text-right">تفصیلات</th>
                <th className="p-2.5 text-right">رقم</th>
                <th className="p-2.5 text-right">تاریخ</th>
                <th className="p-2.5 text-center">ایکشن</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-slate-500 font-sans">
                    کوئی واؤچر ریکارڈ موجود نہیں۔
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isReceipt = p.type === 'customer_receipt' || p.type === 'capital_add';
                  const isReversed = !!p.reversedVoucherId;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition ${
                        p.isReversal
                          ? 'bg-rose-950/25 border-l-4 border-rose-500'
                          : isReversed
                          ? 'opacity-60 bg-slate-950/40 line-through'
                          : ''
                      }`}
                    >
                      <td className="p-2.5 font-bold text-amber-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{p.voucherNo}</span>
                          {p.isReversal && (
                            <span className="no-underline text-[9px] bg-rose-500/20 text-rose-300 px-1 py-0.2 rounded font-sans">
                              ریورسل
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-2.5 font-sans font-bold text-slate-100 whitespace-nowrap">
                        {p.type === 'supplier_payment'
                          ? 'سپلائر ادائیگی'
                          : p.type === 'customer_receipt'
                          ? 'کسٹمر وصولی'
                          : p.type === 'labor_payment'
                          ? 'مزدوری/اجرت'
                          : p.type === 'debit_note'
                          ? 'ڈیبٹ نوٹ'
                          : p.type === 'credit_note'
                          ? 'کریڈٹ نوٹ'
                          : p.type === 'adjustment'
                          ? 'ایڈجسٹمنٹ'
                          : 'کیپیٹل'}
                      </td>

                      <td className="p-2.5 font-sans font-bold text-slate-200">{p.partyName}</td>

                      <td className="p-2.5 font-sans text-slate-400 whitespace-nowrap">
                        {p.paymentMode === 'cash' ? (
                          <span className="text-amber-300">نقد کیش</span>
                        ) : (
                          <span className="text-blue-300">{p.bankName || 'بینک'}</span>
                        )}
                      </td>

                      <td className="p-2.5 text-slate-300">
                        {p.allocatedInvoiceNo ? (
                          <span className="bg-slate-800 text-amber-400 px-1 py-0.2 rounded text-[10px]">
                            {p.allocatedInvoiceNo}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="p-2.5 font-sans text-slate-300 max-w-xs truncate" title={p.description}>
                        {p.description}
                      </td>

                      <td
                        className={`p-2.5 font-bold whitespace-nowrap ${
                          isReceipt ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isReceipt ? '+' : '-'} {formatCurrency(p.amount)}
                      </td>

                      <td className="p-2.5 text-slate-400 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('ur-PK')}
                      </td>

                      <td className="p-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handlePrintVoucher(p)}
                            title="پرنٹ"
                            className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {!p.isReversal && !isReversed && (
                            <button
                              onClick={() => {
                                setReversalTargetVoucher(p);
                                setReversalReason('');
                              }}
                              title="ریورسل"
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
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

        {/* Mobile Cards View (Easy touch & clean view) */}
        <div className="md:hidden space-y-2.5 font-sans">
          {filteredPayments.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              کوئی واؤچر ریکارڈ موجود نہیں۔
            </div>
          ) : (
            filteredPayments.map((p) => {
              const isReceipt = p.type === 'customer_receipt' || p.type === 'capital_add';
              const isReversed = !!p.reversedVoucherId;

              return (
                <div
                  key={p.id}
                  className={`bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs space-y-2 ${
                    p.isReversal
                      ? 'border-rose-500/40 bg-rose-950/20'
                      : isReversed
                      ? 'opacity-60 line-through'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-amber-400 font-bold">{p.voucherNo}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isReceipt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isReceipt ? 'وصولی' : 'ادائیگی'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(p.createdAt).toLocaleDateString('ur-PK')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-100">{p.partyName}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {p.paymentMode === 'cash' ? 'نقد کیش' : p.bankName || 'بینک'}
                        {p.allocatedInvoiceNo && ` · بل: ${p.allocatedInvoiceNo}`}
                      </p>
                    </div>
                    <div className="text-left font-mono">
                      <span
                        className={`text-base font-bold ${
                          isReceipt ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isReceipt ? '+' : '-'} {formatCurrency(p.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <p className="text-slate-300 text-[11px] truncate max-w-[200px]">{p.description}</p>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePrintVoucher(p)}
                        className="p-1.5 bg-slate-800 text-amber-400 rounded-lg text-xs flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>پرنٹ</span>
                      </button>

                      {!p.isReversal && !isReversed && (
                        <button
                          onClick={() => {
                            setReversalTargetVoucher(p);
                            setReversalReason('');
                          }}
                          className="p-1.5 bg-slate-800 text-rose-400 rounded-lg text-xs"
                        >
                          ریورس
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

      {/* Add Voucher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              <span>نیا کیش / بینک واؤچر اندراج کریں</span>
            </h3>

            <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">واؤچر کی قسم</label>
                <select
                  value={voucherType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setVoucherType(val);
                    if (val === 'supplier_payment') setPartyType('supplier');
                    if (val === 'customer_receipt') setPartyType('customer');
                    if (val === 'labor_payment') setPartyType('laborer');
                    if (val === 'capital_add') setPartyType('owner');
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                >
                  <option value="supplier_payment">سپلائر کو ادائیگی (-) Supplier Payment</option>
                  <option value="customer_receipt">کسٹمر سے وصولی (+) Customer Receipt</option>
                  <option value="labor_payment">مزدور / ٹھیکیدار کو پیشگی/ادائیگی (-) Labor Payment</option>
                  <option value="capital_add">مالک کیش ڈپازٹ (+) Capital Deposit</option>
                </select>
              </div>

              {partyType !== 'owner' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">پارٹی منتخب کریں</label>
                  <select
                    value={partyId}
                    onChange={(e) => {
                      setPartyId(e.target.value);
                      setAllocatedInvoiceNo('');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    {partyType === 'supplier' &&
                      suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.company || s.city}) — واجب الادا: Rs {s.currentBalance.toLocaleString()}
                        </option>
                      ))}
                    {partyType === 'customer' &&
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.millName}) — واجب الوصول: Rs {c.currentBalance.toLocaleString()}
                        </option>
                      ))}
                    {partyType === 'laborer' &&
                      laborers.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.phone}) — پیشگی: Rs {l.currentPeshgiBalance.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Payment Allocation Dropdown */}
              {partyType !== 'owner' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    مخصوص بل / انوائس ایلوکیشن (اختیاری)
                  </label>
                  <select
                    value={allocatedInvoiceNo}
                    onChange={(e) => setAllocatedInvoiceNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    <option value="">-- عام کھاتہ ادائیگی (بغیر مخصوص بل کے) --</option>
                    {partyType === 'supplier' &&
                      availablePurchases.map((p) => (
                        <option key={p.id} value={p.weighmentSlipNo}>
                          پرچی {p.weighmentSlipNo} | گاڑی {p.vehicleNo} | رقم Rs {p.totalAmount.toLocaleString()}
                        </option>
                      ))}
                    {partyType === 'customer' &&
                      availableSales.map((s) => (
                        <option key={s.id} value={s.saleNo}>
                          سیلز آرڈر {s.saleNo} | رقم Rs {s.totalAmount.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">طریقہ ادائیگی</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    <option value="cash">نقد کیش (Cash in Hand)</option>
                    <option value="bank_transfer">آن لائن بینک ٹرانسفر (Online Transfer)</option>
                    <option value="cheque">بینک چیک (Cheque Deposit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم (PKR) *</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono text-base rounded-lg p-2"
                  />
                </div>
              </div>

              {paymentMode !== 'cash' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">بینک کھاتہ منتخب کریں</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  >
                    {BANK_ACCOUNTS.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} - {b.accountNo} ({b.branch})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">تفصیلات / کیش رسید نوٹس</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثلاً کمپریسر گاڑی بقایا رقم، یا سکریپ کسٹمر چیک ادائیگی"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    if (onCloseModal) onCloseModal();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  واؤچر محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audited Reversal Confirmation Modal */}
      {reversalTargetVoucher && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-rose-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-base font-bold">واؤچر ریورسل کی تصدیق (Audit Contra Reversal)</h3>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">واؤچر نمبر:</span>
                <span className="font-mono text-amber-400 font-bold">{reversalTargetVoucher.voucherNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">پارٹی کا نام:</span>
                <span className="text-slate-200 font-bold">{reversalTargetVoucher.partyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">رقم:</span>
                <span className="font-mono text-rose-400 font-bold">{formatCurrency(reversalTargetVoucher.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">طریقہ ادائیگی:</span>
                <span className="text-slate-200">
                  {reversalTargetVoucher.paymentMode === 'cash' ? 'نقد کیش' : reversalTargetVoucher.bankName}
                </span>
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg text-[11px] text-rose-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>حسابات کا قانونی ضابطہ:</span>
              </div>
              <p className="text-slate-300">
                یہ واؤچر سسٹم سے ڈیلیٹ نہیں ہوگا، بلکہ اس کی منسوخی کیلئے ایک آڈیٹڈ متضاد (Contra Entry) بنائی جائے گی اور کھاتہ بیلنس خودکار طور پر درست ہو جائے گا۔
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 text-xs">
                ریورسل کا سبب / وجہ (Audit Reason) *
              </label>
              <textarea
                rows={2}
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="مثلاً: بینک چیک باؤنس، غلط پارٹی یا غلط رقم کا اندراج..."
                required
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setReversalTargetVoucher(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                منسوخ
              </button>
              <button
                type="button"
                onClick={handleConfirmReversal}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                ریورسل جاری کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
