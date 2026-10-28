import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  Building,
  Zap,
  Fuel,
  Wrench,
  Truck,
  Coffee,
  FileText,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Expense, ExpenseCategory } from '../types';

export const ExpensesModule: React.FC = () => {
  const { t, formatCurrency, language } = useLanguage();
  const { expenses, addExpense, setPrintableSlip } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('godown_rent');
  const [expenseType, setExpenseType] = useState<
    'operating_overhead' | 'direct_processing' | 'delivery_freight'
  >('operating_overhead');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_transfer'>('cash');
  const [bankName, setBankName] = useState<string>('Meezan Bank Ltd');
  const [paidTo, setPaidTo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [receiptRef, setReceiptRef] = useState<string>('');

  // Category info mapping
  const categoryConfig: Record<
    ExpenseCategory,
    { labelUrdu: string; labelEng: string; icon: any; color: string }
  > = {
    godown_rent: {
      labelUrdu: 'گودام کرایہ (Godown Rent)',
      labelEng: 'Godown Rent',
      icon: Building,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    },
    electricity: {
      labelUrdu: 'بجلی لیسکو بل (Electricity Bill)',
      labelEng: 'Electricity (LESCO)',
      icon: Zap,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
    },
    diesel_generator: {
      labelUrdu: 'ڈیزل و جنریٹر (Diesel Fuel)',
      labelEng: 'Diesel & Generator',
      icon: Fuel,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30'
    },
    equipment_maintenance: {
      labelUrdu: 'کانٹا و مشینری مرمت (Weighbridge / Tools)',
      labelEng: 'Equipment & Scales Repair',
      icon: Wrench,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
    },
    freight: {
      labelUrdu: 'کرایہ گاڑی / ترسیل (Freight & Delivery)',
      labelEng: 'Freight / Kiraya',
      icon: Truck,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30'
    },
    labor_tea_food: {
      labelUrdu: 'مزدور چائے، کھانا و پانی (Staff Tea / Food)',
      labelEng: 'Worker Food & Tea',
      icon: Coffee,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    },
    office_stationery: {
      labelUrdu: 'منشی کھاتہ و وزن پرچی بکس (Stationery / Slips)',
      labelEng: 'Stationery & Printing',
      icon: FileText,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
    },
    misc: {
      labelUrdu: 'متفرق اخراجات (Miscellaneous)',
      labelEng: 'Miscellaneous',
      icon: DollarSign,
      color: 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat =
        selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
      const matchType =
        selectedTypeFilter === 'all' ||
        (e.expenseType || 'operating_overhead') === selectedTypeFilter;
      const matchSearch =
        e.expenseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.paidTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.receiptRef || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchType && matchSearch;
    });
  }, [expenses, selectedCategoryFilter, selectedTypeFilter, searchTerm]);

  // Aggregate Metrics
  const totalAmount = useMemo(
    () => expenses.reduce((acc, e) => acc + e.amount, 0),
    [expenses]
  );
  const totalCashAmount = useMemo(
    () =>
      expenses
        .filter((e) => e.paymentMode === 'cash')
        .reduce((acc, e) => acc + e.amount, 0),
    [expenses]
  );
  const totalBankAmount = useMemo(
    () =>
      expenses
        .filter((e) => e.paymentMode === 'bank_transfer')
        .reduce((acc, e) => acc + e.amount, 0),
    [expenses]
  );

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const voucherNo = `EXP-${Date.now().toString().slice(-4)}`;

    addExpense({
      expenseNo: voucherNo,
      category,
      expenseType,
      amount: Number(amount),
      paymentMode,
      bankName: paymentMode === 'bank_transfer' ? bankName : undefined,
      paidTo: paidTo.trim() || 'نامعلوم وصول کنندہ',
      description: description.trim() || categoryConfig[category].labelUrdu,
      receiptRef: receiptRef.trim() || undefined,
      createdBy: 'محمد صابر (منشی)'
    });

    setShowAddModal(false);
    // Reset inputs
    setPaidTo('');
    setDescription('');
    setReceiptRef('');
  };

  const handlePrintSlip = (exp: Expense) => {
    setPrintableSlip({
      type: 'payment_voucher',
      titleUrdu: 'گودام اخراجات واؤچر پرچی',
      titleEng: 'GODOWN EXPENSE VOUCHER',
      docNo: exp.expenseNo,
      date: new Date(exp.createdAt).toLocaleDateString('ur-PK'),
      partyName: exp.paidTo || 'نقد وصول کنندہ',
      items: [
        {
          nameUrdu: categoryConfig[exp.category]?.labelUrdu || exp.category,
          nameEng: exp.description,
          weightKg: 0,
          rate: exp.amount,
          amount: exp.amount
        }
      ],
      totalAmount: exp.amount,
      paidAmount: exp.amount,
      notes: `ادائیگی موڈ: ${
        exp.paymentMode === 'cash' ? 'روکڑ نقد (Cash)' : `بینک ٹرانسفر (${exp.bankName || 'بینک'})`
      } | رسید / بل حوالہ: ${exp.receiptRef || 'موجود نہیں'}`,
      signatureText: 'منشی / مینیجر دستخط'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span>اخراجات و لاگت کھاتہ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            کرایہ گودام، بجلی بل، ڈیزل جنریٹر، کانٹا سروس، اور متفرق اخراجات
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-xs md:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>نیا خرچہ واؤچر</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">کل اخراجات</span>
            <Wallet className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-rose-400">
            {formatCurrency(totalAmount)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {expenses.length} کل واؤچرز
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">نقد روکڑ</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(totalCashAmount)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            دراز سے نقد ادائیگی
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">بینک ادائیگیاں</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl md:text-2xl font-bold font-mono text-cyan-400">
            {formatCurrency(totalBankAmount)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            بینک چیکس و ٹرانسفر
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold">لاگت پالیسی</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-slate-200">
            IAS-2 مطابقت
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ڈبل کاؤنٹنگ محفوظ
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute top-2.5 right-3 text-slate-400" />
            <input
              type="text"
              placeholder="تلاش بذریعہ واؤچر #، نام، تفصیل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 pr-9 pl-3 py-2 rounded-xl focus:border-amber-400 outline-none"
            />
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl font-medium cursor-pointer"
          >
            <option value="all">تمام زمرہ جات (All Categories)</option>
            <option value="godown_rent">گودام کرایہ (Rent)</option>
            <option value="electricity">بجلی بل (Electricity)</option>
            <option value="diesel_generator">ڈیزل و جنریٹر (Diesel)</option>
            <option value="equipment_maintenance">مشینری و کانٹا سروس (Tools)</option>
            <option value="freight">کرایہ گاڑی / فریٹ (Freight)</option>
            <option value="labor_tea_food">مزدور کھانا و چائے (Food/Tea)</option>
            <option value="office_stationery">اسٹیشنری و پرنٹنگ (Stationery)</option>
            <option value="misc">متفرق (Miscellaneous)</option>
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-3 py-2 rounded-xl font-medium cursor-pointer"
          >
            <option value="all">تمام اقسام (All Types)</option>
            <option value="operating_overhead">گودام عمومی اخراجات (Overheads)</option>
            <option value="direct_processing">براہ راست کٹائی لاگت (Processing)</option>
            <option value="delivery_freight">ترسیل کرایہ (Delivery)</option>
          </select>
        </div>

        <div className="text-slate-400 text-xs">
          مجموعی نتائج: <span className="text-amber-400 font-bold">{filteredExpenses.length}</span>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 md:p-5 space-y-4">
        {/* Mobile Cards (Phone screens) */}
        <div className="block md:hidden space-y-3">
          {filteredExpenses.map((exp) => {
            const conf = categoryConfig[exp.category] || categoryConfig.misc;
            const Icon = conf.icon;
            return (
              <div key={exp.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold text-xs">{exp.expenseNo}</span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${conf.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{conf.labelUrdu.split('(')[0].trim()}</span>
                  </span>
                </div>

                <div className="text-xs text-slate-200 font-medium">{exp.description}</div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">رقم:</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">{formatCurrency(exp.amount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ادائیگی طریقہ:</span>
                    <span className={`font-semibold text-[10px] ${exp.paymentMode === 'cash' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      {exp.paymentMode === 'cash' ? 'روکڑ نقد' : (exp.bankName || 'بینک')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {new Date(exp.createdAt).toLocaleDateString('ur-PK')}
                    {exp.paidTo && ` • ${exp.paidTo}`}
                  </span>
                  <button
                    onClick={() => handlePrintSlip(exp)}
                    className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>پرنٹ پرچی</span>
                  </button>
                </div>
              </div>
            );
          })}
          {filteredExpenses.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">کوئی خرچہ ریکارڈ نہیں ہے</div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3 text-right">واؤچر #</th>
                <th className="p-3 text-right">تاریخ</th>
                <th className="p-3 text-right">زمرہ / نوعیت</th>
                <th className="p-3 text-right">تفصیلات</th>
                <th className="p-3 text-right">وصول کنندہ</th>
                <th className="p-3 text-right">ادائیگی طریقہ</th>
                <th className="p-3 text-right">رسید حوالہ</th>
                <th className="p-3 text-left">رقم (PKR)</th>
                <th className="p-3 text-center">پرنٹ پرچی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-sans">
                    کوئی اخراجات ریکارڈ نہیں ملے۔
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const conf = categoryConfig[exp.category] || categoryConfig.misc;
                  const Icon = conf.icon;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-bold text-amber-400">{exp.expenseNo}</td>
                      <td className="p-3 text-slate-400">
                        {new Date(exp.createdAt).toLocaleDateString('ur-PK')}
                      </td>
                      <td className="p-3 font-sans">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${conf.color}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{conf.labelUrdu}</span>
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-200 max-w-xs truncate">
                        {exp.description}
                      </td>
                      <td className="p-3 font-sans text-slate-300 font-medium">
                        {exp.paidTo || '—'}
                      </td>
                      <td className="p-3 font-sans">
                        {exp.paymentMode === 'cash' ? (
                          <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            روکڑ نقد (Cash)
                          </span>
                        ) : (
                          <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {exp.bankName || 'بینک ٹرانسفر'}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-400">
                        {exp.receiptRef ? (
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                            {exp.receiptRef}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-left font-bold text-rose-400 text-sm">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handlePrintSlip(exp)}
                          title="واؤچر پرنٹ کریں"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <span>نیا گودام خرچہ واؤچر درج کریں</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  خرچہ زمرہ (Expense Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5 font-bold"
                >
                  <option value="godown_rent">گودام کرایہ (Godown Rent)</option>
                  <option value="electricity">بجلی بل لیسکو (Electricity Bill - LESCO)</option>
                  <option value="diesel_generator">کٹر و جنریٹر ڈیزل (Diesel Fuel)</option>
                  <option value="equipment_maintenance">کانٹا و کٹنگ ٹولز سروس (Weighbridge / Blades)</option>
                  <option value="freight">کرایہ گاڑی و ان لوڈنگ (Freight & Handling)</option>
                  <option value="labor_tea_food">مزدور کھانا و چائے (Worker Refreshments)</option>
                  <option value="office_stationery">وزن پرچی بکس و کھاتہ رجسٹر (Stationery)</option>
                  <option value="misc">✏️ دیگر / خود زمرہ درج کریں (+ Custom Expense Category)</option>
                </select>

                {category === 'misc' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="اپنے مخصوص خرچہ زمرہ کی تفصیل یہاں لکھیں..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-amber-500/50 text-amber-300 rounded-xl p-2.5 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  لاگت کی نوعیت (Costing Classification)
                </label>
                <select
                  value={expenseType}
                  onChange={(e) =>
                    setExpenseType(
                      e.target.value as
                        | 'operating_overhead'
                        | 'direct_processing'
                        | 'delivery_freight'
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                >
                  <option value="operating_overhead">
                    گودام عمومی آپریشنل اوور ہیڈ (Operating Overhead - P&L Period Cost)
                  </option>
                  <option value="direct_processing">
                    براہ راست کٹائی لاگت (Direct Processing Cost - Capitalized into Batch)
                  </option>
                  <option value="delivery_freight">
                    کسٹمر مال ترسیل کرایہ (Selling & Delivery Freight)
                  </option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  * کٹائی گیس سلنڈر و بلیڈز کی لاگت میٹل انوینٹری میں شامل کی جائے گی اور ڈبل کاؤنٹ نہیں ہوگی۔
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    خرچہ رقم (Amount PKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-mono font-bold text-base rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ادائیگی طریقہ (Payment Mode)
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) =>
                      setPaymentMode(e.target.value as 'cash' | 'bank_transfer')
                    }
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                  >
                    <option value="cash">روکڑ دراز نقد (Cash Drawer)</option>
                    <option value="bank_transfer">بینک ٹرانسفر / چیک (Bank Account)</option>
                  </select>
                </div>
              </div>

              {paymentMode === 'bank_transfer' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">بینک کا نام</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                  >
                    <option value="Meezan Bank Ltd">میزان بینک لمیٹڈ (Meezan Bank)</option>
                    <option value="Habib Bank Ltd">حبیب بینک لمیٹڈ (HBL)</option>
                    <option value="MCB Bank Ltd">مسلم کمرشل بینک (MCB)</option>
                    <option value="Bank Alfalah">بینک الفلاح (Bank Alfalah)</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ادا کنندہ نام (Paid To)
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: ملک ارشد / لیسکو / ڈرائیور"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    رسید / بل یا بلٹی نمبر
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: LESCO-3921 / BILTY-55"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  مکمل تفصیل و وجہ (Description & Purpose)
                </label>
                <textarea
                  rows={2}
                  placeholder="خرچے کی مکمل تفصیل درج کریں..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-2.5"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold cursor-pointer transition shadow-md"
                >
                  واؤچر محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
