import React, { useState } from 'react';
import {
  Scale,
  Truck,
  Scissors,
  Boxes,
  ShoppingBag,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  PlusCircle,
  ChevronDown,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

interface DashboardModuleProps {
  onOpenWeighmentModal: () => void;
  onOpenVoucherModal: () => void;
  setActiveModule: (module: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onOpenWeighmentModal,
  onOpenVoucherModal,
  setActiveModule
}) => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const {
    suppliers,
    customers,
    items,
    purchases,
    sales,
    payments,
    expenses
  } = useData();

  // Period Filter Dropdown state
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  // Filter calculations based on period
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const filteredPurchases = purchases.filter((p) => {
    if (periodFilter === 'today') return p.createdAt.startsWith(todayStr);
    if (periodFilter === 'week') return p.createdAt >= oneWeekAgo;
    if (periodFilter === 'month') return p.createdAt >= oneMonthAgo;
    return true;
  });

  const filteredSales = sales.filter((s) => {
    if (periodFilter === 'today') return s.createdAt.startsWith(todayStr);
    if (periodFilter === 'week') return s.createdAt >= oneWeekAgo;
    if (periodFilter === 'month') return s.createdAt >= oneMonthAgo;
    return true;
  });

  // Stock stats
  const totalStockKg = items.reduce((acc, i) => acc + (i.currentStockKg || 0), 0);
  const totalStockValuation = items.reduce(
    (acc, i) => acc + (i.currentStockKg || 0) * (i.avgPurchasePricePerKg || 0),
    0
  );
  const rawScrapStockKg = items
    .filter((i) => i.category === 'raw_scrap')
    .reduce((acc, i) => acc + (i.currentStockKg || 0), 0);
  const recoveredMetalStockKg = items
    .filter((i) => i.category === 'recovered_metal')
    .reduce((acc, i) => acc + (i.currentStockKg || 0), 0);

  // Payables & Receivables
  const totalSupplierPayables = suppliers.reduce((acc, s) => acc + (s.currentBalance || 0), 0);
  const totalCustomerReceivables = customers.reduce((acc, c) => acc + (c.currentBalance || 0), 0);

  // Purchases & Sales totals for active period
  const purchasedKg = filteredPurchases.reduce((acc, p) => acc + (p.finalPayableWeight || 0), 0);
  const purchasedAmount = filteredPurchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const salesAmount = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);

  // Cash in Hand
  const totalReceipts = payments
    .filter((p) => p.type === 'customer_receipt' || p.type === 'capital_add')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalPayments = payments
    .filter((p) => p.type === 'supplier_payment' || p.type === 'labor_payment')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalExpensesAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const cashInHand = totalReceipts - totalPayments - totalExpensesAmount + 500000;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner / Filter & Quick Action Dropdowns */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <span>البرکۃ سکریپ گودام</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            لاہور و کراچی مارکیٹ · کانٹا، کٹائی، اسٹاک و کھاتہ
          </p>
        </div>

        {/* Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* 1. Period Filter Dropdown (Dropdown use karo) */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium py-2 px-3 pr-7 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
              title="مدت منتخب کریں"
            >
              <option value="today">📅 آج کا دن</option>
              <option value="week">📅 رواں ہفتہ</option>
              <option value="month">📅 رواں ماہ</option>
              <option value="all">📅 کل ریکارڈ</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3 pointer-events-none" />
          </div>

          {/* 2. Quick Action Dropdown (Dropdown use karo) */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                if (val === 'weighment') onOpenWeighmentModal();
                else if (val === 'voucher') onOpenVoucherModal();
                else setActiveModule(val);
                e.target.value = '';
              }}
              defaultValue=""
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-2 px-3 pr-7 rounded-xl focus:outline-none cursor-pointer appearance-none shadow-md shadow-amber-500/20"
              title="فوری عمل منتخب کریں"
            >
              <option value="" disabled>
                ⚡ فوری عمل / انٹری ▼
              </option>
              <option value="weighment" className="bg-slate-900 text-slate-100 font-normal">
                + نئی وزن پرچی (کانٹا)
              </option>
              <option value="purchases" className="bg-slate-900 text-slate-100 font-normal">
                + خریداری گاڑی بل
              </option>
              <option value="processing" className="bg-slate-900 text-slate-100 font-normal">
                + کٹائی و ریکوری بیچ
              </option>
              <option value="sales" className="bg-slate-900 text-slate-100 font-normal">
                + کسٹمر سیل آرڈر
              </option>
              <option value="voucher" className="bg-slate-900 text-slate-100 font-normal">
                + کیش / بینک واؤچر
              </option>
              <option value="expenses" className="bg-slate-900 text-slate-100 font-normal">
                + گودام خرچہ اندراج
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-950 absolute left-2.5 top-3 pointer-events-none" />
          </div>

          {/* 1-Tap Kanda Primary Button */}
          <button
            onClick={onOpenWeighmentModal}
            className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>وزن پرچی</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Short Words & Mobile-Optimized */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Purchases */}
        <div
          onClick={() => setActiveModule('purchases')}
          className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">{t('todayPurchases')}</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-100">
            {formatWeight(purchasedKg)}
          </div>
          <div className="text-[10px] sm:text-xs text-blue-400 mt-1 font-medium flex items-center gap-0.5 truncate">
            <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
            <span>{formatCurrency(purchasedAmount)}</span>
          </div>
        </div>

        {/* Sales */}
        <div
          onClick={() => setActiveModule('sales')}
          className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">{t('todaySales')}</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-100 truncate">
            {formatCurrency(salesAmount)}
          </div>
          <div className="text-[10px] sm:text-xs text-emerald-400 mt-1 font-medium">
            آرڈرز: {filteredSales.length}
          </div>
        </div>

        {/* Cash Balance */}
        <div
          onClick={() => setActiveModule('cashbook')}
          className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">{t('cashBalance')}</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-amber-400 truncate">
            {formatCurrency(cashInHand)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1">روکڑ بیلنس</div>
        </div>

        {/* Total Stock Value */}
        <div
          onClick={() => setActiveModule('inventory')}
          className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl shadow-md cursor-pointer hover:border-slate-700 transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1 sm:mb-2">
            <span className="text-[11px] sm:text-xs font-semibold">{t('stockValuation')}</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-bold text-slate-100 truncate">
            {formatCurrency(totalStockValuation)}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">
            وزن: {formatWeight(totalStockKg)}
          </div>
        </div>
      </div>

      {/* Stock Summary Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>اسٹاک تفصیل</span>
          </h3>
          <button
            onClick={() => setActiveModule('inventory')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            مکمل رجسٹر &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>خام سکریپ (غیر پروسیس شدہ)</span>
              <span className="text-amber-400">{formatWeight(rawScrapStockKg)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (rawScrapStockKg / (totalStockKg || 1)) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>خالص میٹلز (ریکور شدہ)</span>
              <span className="text-emerald-400">{formatWeight(recoveredMetalStockKg)}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(100, (recoveredMetalStockKg / (totalStockKg || 1)) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Compact Items List (Cards on mobile, table on desktop) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2 text-right">کوڈ</th>
                <th className="p-2 text-right">آئٹم</th>
                <th className="p-2 text-right">قسم</th>
                <th className="p-2 text-right">اسٹاک (KG)</th>
                <th className="p-2 text-right">خرید ریٹ</th>
                <th className="p-2 text-right">کل مالیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.slice(0, 5).map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40">
                  <td className="p-2 font-mono text-slate-400">{item.code}</td>
                  <td className="p-2 font-bold text-slate-100">{item.nameUrdu}</td>
                  <td className="p-2">
                    <span className="text-[10px] text-slate-300">
                      {item.category === 'raw_scrap' ? 'خام مال' : 'خالص میٹل'}
                    </span>
                  </td>
                  <td className="p-2 font-bold text-slate-100 font-mono">
                    {formatWeight(item.currentStockKg)}
                  </td>
                  <td className="p-2 text-slate-300 font-mono">
                    Rs {item.avgPurchasePricePerKg}
                  </td>
                  <td className="p-2 font-bold text-emerald-400 font-mono">
                    {formatCurrency(item.currentStockKg * item.avgPurchasePricePerKg)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View for Stock: Clean Compact List */}
        <div className="md:hidden divide-y divide-slate-800/60 pt-1">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="py-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-100">{item.nameUrdu}</span>
                <span className="text-[10px] text-slate-400 block font-mono">{item.code}</span>
              </div>
              <div className="text-left font-mono">
                <span className="text-amber-400 font-bold block">{formatWeight(item.currentStockKg)}</span>
                <span className="text-[10px] text-emerald-400 block">
                  {formatCurrency(item.currentStockKg * item.avgPurchasePricePerKg)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payables & Receivables Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Suppliers */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" />
              <span>سپلائر بقایا (ادائیگی)</span>
            </h3>
            <span className="text-sm sm:text-base font-bold text-rose-400 font-mono">
              {formatCurrency(totalSupplierPayables)}
            </span>
          </div>
          <div className="space-y-1.5">
            {suppliers.slice(0, 3).map((sup) => (
              <div
                key={sup.id}
                className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/40 border border-slate-800/60"
              >
                <span className="font-semibold text-slate-200 truncate">{sup.name}</span>
                <span className="font-bold text-rose-400 font-mono mr-2">
                  {formatCurrency(sup.currentBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customers */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <h3 className="font-bold text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>کسٹمر بقایا (وصولی)</span>
            </h3>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {formatCurrency(totalCustomerReceivables)}
            </span>
          </div>
          <div className="space-y-1.5">
            {customers.slice(0, 3).map((cust) => (
              <div
                key={cust.id}
                className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-800/40 border border-slate-800/60"
              >
                <span className="font-semibold text-slate-200 truncate">{cust.name}</span>
                <span className="font-bold text-emerald-400 font-mono mr-2">
                  {formatCurrency(cust.currentBalance)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Purchases List / Mobile Friendly Cards */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>حالیہ وزن پرچیاں</span>
          </h3>
          <button
            onClick={() => setActiveModule('purchases')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            تمام پرچیاں &rarr;
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold">
              <tr>
                <th className="p-2 text-right">پرچی</th>
                <th className="p-2 text-right">سپلائر</th>
                <th className="p-2 text-right">گاڑی</th>
                <th className="p-2 text-right">صافی وزن</th>
                <th className="p-2 text-right">کل رقم</th>
                <th className="p-2 text-right">تاریخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {purchases.slice(0, 5).map((pur) => (
                <tr key={pur.id} className="hover:bg-slate-800/40">
                  <td className="p-2 font-mono text-amber-400 font-bold">
                    {pur.weighmentSlipNo}
                  </td>
                  <td className="p-2 font-bold text-slate-100">{pur.supplierName}</td>
                  <td className="p-2 font-mono text-slate-300">{pur.vehicleNo}</td>
                  <td className="p-2 font-bold text-emerald-400 font-mono">
                    {formatWeight(pur.finalPayableWeight)}
                  </td>
                  <td className="p-2 font-bold text-slate-100 font-mono">
                    {formatCurrency(pur.totalAmount)}
                  </td>
                  <td className="p-2 text-slate-400">
                    {new Date(pur.createdAt).toLocaleDateString('ur-PK')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (Easy touch & clean view) */}
        <div className="md:hidden space-y-2">
          {purchases.slice(0, 4).map((pur) => (
            <div
              key={pur.id}
              className="bg-slate-800/40 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-amber-400 font-bold">{pur.weighmentSlipNo}</span>
                  <span className="text-[10px] text-slate-400 font-mono">· {pur.vehicleNo}</span>
                </div>
                <div className="text-slate-200 font-semibold mt-0.5">{pur.supplierName}</div>
              </div>
              <div className="text-left font-mono">
                <div className="text-emerald-400 font-bold">{formatWeight(pur.finalPayableWeight)}</div>
                <div className="text-slate-100 text-[11px] font-bold">{formatCurrency(pur.totalAmount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
