import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Scale,
  Calendar,
  Printer,
  Boxes,
  HelpCircle,
  FileSpreadsheet,
  Building2,
  Users,
  HardHat,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Info,
  CheckCircle2,
  PieChart
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  generateProfitLossReport,
  DateFilterOptions
} from '../lib/inventoryCosting';

export const ProfitLossModule: React.FC = () => {
  const { t, formatCurrency, language } = useLanguage();
  const {
    items,
    purchases,
    sales,
    deliveries,
    processingBatches,
    expenses,
    payments,
    laborLogs,
    suppliers,
    customers,
    setPrintableSlip
  } = useData();

  // Date Filter State
  const [period, setPeriod] = useState<DateFilterOptions['period']>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'statement' | 'costing' | 'cashflow' | 'policy'>(
    'statement'
  );

  // Generate Report
  const report = useMemo(() => {
    return generateProfitLossReport(
      items,
      purchases,
      sales,
      deliveries,
      processingBatches,
      expenses,
      payments,
      laborLogs,
      suppliers,
      customers,
      { period, startDate, endDate }
    );
  }, [
    items,
    purchases,
    sales,
    deliveries,
    processingBatches,
    expenses,
    payments,
    laborLogs,
    suppliers,
    customers,
    period,
    startDate,
    endDate
  ]);

  const handlePrintFullReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>نفع و نقصان اور لاگت رپورٹ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            اوسط وزنی لاگت (WAC)، کوسٹ آف گڈز سولڈ (COGS)، گودام اخراجات اور صافی منافع
          </p>
        </div>

        <button
          onClick={handlePrintFullReport}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-semibold px-4 py-2 rounded-xl transition cursor-pointer text-xs md:text-sm shadow-md"
        >
          <Printer className="w-4 h-4" />
          <span>پرنٹ رپورٹ</span>
        </button>
      </div>

      {/* Date Range Selector Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 md:p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Mobile Dropdown for Period */}
        <div className="flex sm:hidden items-center gap-2 w-full">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs"
          >
            <option value="today">📅 آج کی رپورٹ</option>
            <option value="month">📅 رواں ماہ (This Month)</option>
            <option value="year">📅 رواں سال (Fiscal Year)</option>
            <option value="all">📅 کل ریکارڈ (All Time)</option>
            <option value="custom">📅 حسبِ منشاء تاریخ (Custom)</option>
          </select>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden sm:flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5 ml-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>مدت:</span>
          </span>

          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              period === 'today'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            آج (Daily)
          </button>

          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              period === 'month'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            رواں ماہ
          </button>

          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              period === 'year'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            رواں سال
          </button>

          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              period === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            تمام ریکارڈ
          </button>

          <button
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              period === 'custom'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            حسبِ منشاء تاریخ
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 px-3 rounded-xl border border-slate-700">
            <span className="text-slate-400">از:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-900 text-slate-100 px-2 py-1 rounded border border-slate-700 text-xs"
            />
            <span className="text-slate-400">تا:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-900 text-slate-100 px-2 py-1 rounded border border-slate-700 text-xs"
            />
          </div>
        )}

        <div className="text-slate-400">
          فعال مدت: <span className="text-amber-400 font-bold">{report.periodLabel}</span>
        </div>
      </div>

      {/* Top Level Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sales Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>سیلز آمدن (Sales Revenue)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatCurrency(report.salesRevenue)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            روانہ شدہ چالان کی بنیاد پر (Accrual)
          </span>
        </div>

        {/* COGS */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>فروخت مال لاگت (COGS - WAC)</span>
            <Scale className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatCurrency(report.cogs)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            اوسط وزنی لاگت (Weighted Average Cost)
          </span>
        </div>

        {/* Gross Profit & Margin */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>گراس منافع (Gross Profit)</span>
            <span className="text-amber-400 font-mono font-bold text-xs">
              {report.grossMarginPct}% مارجن
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {formatCurrency(report.grossProfit)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            آمدن منہا فروخت شدہ میٹل لاگت
          </span>
        </div>

        {/* Net Realized Profit */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 p-4 rounded-xl shadow-lg bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1 font-bold">
            <span>خالص حاصل شدہ نفع (Net Profit)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {formatCurrency(report.netProfit)}
          </div>
          <span className="text-[11px] text-emerald-300/80 mt-1 block">
            تمام آپریشنل اخراجات وضع کرنے کے بعد
          </span>
        </div>
      </div>

      {/* Secondary Metrics Row: Unrealized Profit & Working Capital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unrealized Paper Profit */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>غیر فروخت شدہ اسٹاک پر متوقع نفع (Unrealized)</span>
            <Boxes className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">
            + {formatCurrency(report.unrealizedProfitOnStock)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            موجودہ مارکیٹ ریٹ منہا اوسط لاگت
          </span>
        </div>

        {/* Godown Stock Value */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>گودام اسٹاک مالیت (Inventory at WAC)</span>
            <Boxes className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {formatCurrency(report.totalInventoryValuationWac)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            مارکیٹ ویلیو: {formatCurrency(report.totalInventoryMarketValue)}
          </span>
        </div>

        {/* Customer Receivables */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>کسٹمرز کے ذمہ واجب الوصول (Receivables)</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400">
            {formatCurrency(report.customerReceivables)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            کھاتہ دار خریداروں سے بقایا
          </span>
        </div>

        {/* Supplier & Labor Payables */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>سپلائر و ٹھیکیدار واجب الادا (Payables)</span>
            <HardHat className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-orange-400">
            {formatCurrency(report.supplierPayables + report.laborContractorPayables)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            سپلائرز: {formatCurrency(report.supplierPayables)} | مزدوری:{' '}
            {formatCurrency(report.laborContractorPayables)}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      {/* Mobile Dropdown */}
      <div className="block sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as any)}
          className="w-full bg-slate-900 border border-amber-500/40 text-amber-300 font-bold rounded-xl p-2.5 text-xs focus:border-amber-400"
        >
          <option value="statement">📊 نفع و نقصان گوشوارہ (P&L)</option>
          <option value="costing">📦 میٹل لاگت و WAC شیٹ</option>
          <option value="cashflow">💵 کیش بمقابلہ ریونیو</option>
          <option value="policy">📜 لاگت پالیسی و گائیڈ</option>
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:flex border-b border-slate-800 text-xs font-bold gap-2">
        <button
          onClick={() => setActiveTab('statement')}
          className={`pb-3 px-4 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'statement'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>نفع و نقصان گوشوارہ</span>
        </button>

        <button
          onClick={() => setActiveTab('costing')}
          className={`pb-3 px-4 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'costing'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>اسٹاک لاگت و WAC</span>
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`pb-3 px-4 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'cashflow'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>کیش بمقابلہ ریونیو</span>
        </button>

        <button
          onClick={() => setActiveTab('policy')}
          className={`pb-3 px-4 flex items-center gap-2 cursor-pointer transition border-b-2 ${
            activeTab === 'policy'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>لاگت پالیسی</span>
        </button>
      </div>

      {/* Tab 1: P&L Income Statement */}
      {activeTab === 'statement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 text-center">
            <h3 className="text-lg font-bold text-slate-100">
              البرکۃ سکریپ گودام و میٹل ٹریڈنگ (رجسٹرڈ) لاہور
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              جامع مالیاتی گوشوارہ برائے خام کباڑ کٹائی، خالص میٹل ریکوری و گودام آپریشنز
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-slate-800 rounded-full text-[11px] text-amber-400 font-mono font-bold">
              {report.periodLabel}
            </div>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Section A: Revenue */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold font-sans text-slate-100">
                <span>الف: میٹل سیلز آمدن (Sales Revenue - Dispatched Invoices)</span>
                <span className="text-emerald-400 text-base">
                  + {formatCurrency(report.salesRevenue)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                صرف وہی مال جو کانٹا وزن کے بعد کسٹمر کو گاڑی پر لوڈ ہو کر روانہ ہو چکا ہے۔
              </p>
            </div>

            {/* Section B: COGS */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sm font-bold font-sans text-slate-100">
                <span>ب: فروخت شدہ میٹل کی اوسط لاگت (Cost of Goods Sold - COGS)</span>
                <span className="text-rose-400 text-base">
                  - {formatCurrency(report.cogs)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                روانہ شدہ میٹلز وزن × اوسط وزنی لاگت (بشمول خام کباڑ، کٹائی ٹھیکیداری و گیس سلنڈر لاگت)
              </p>
            </div>

            {/* Gross Profit Callout */}
            <div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 font-bold">
              <div className="font-sans">
                <span className="text-amber-400 text-sm block">
                  گراس میٹل ٹریڈنگ مارجن (Gross Profit):
                </span>
                <span className="text-slate-400 text-[11px]">
                  سیلز آمدن وضع فروخت شدہ مال لاگت
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-amber-400 block font-mono">
                  {formatCurrency(report.grossProfit)}
                </span>
                <span className="text-xs text-amber-300 font-sans">
                  {report.grossMarginPct}% گراس مارجن
                </span>
              </div>
            </div>

            {/* Section C: Operating Overheads */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-sm font-bold text-slate-200">
                  ج: گودام عمومی آپریشنل اخراجات (Operating Overheads - Period Costs):
                </span>
                <span className="font-bold font-mono text-rose-400 text-sm">
                  - {formatCurrency(report.operatingExpenses.total)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">گودام کرایہ (Godown Rent)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.godownRent)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">بجلی بل لیسکو (LESCO Electricity)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.electricity)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">جنریٹر و فورک لفٹ ڈیزل (Diesel Fuel)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.dieselGenerator)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">کانٹا کیلیبریشن و مرمت (Weighbridge Repair)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.equipmentMaintenance)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">کسٹمر مال ترسیل کرایہ (Delivery Freight)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.deliveryFreight)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">مزدور کھانا و چائے (Worker Refreshments)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.laborTeaFood)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">وزن پرچی بکس و اسٹیشنری (Stationery)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.officeStationery)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">متفرق اخراجات (Miscellaneous)</span>
                  <span className="text-slate-200 font-bold">
                    {formatCurrency(report.operatingExpenses.misc)}
                  </span>
                </div>
              </div>
            </div>

            {/* Section D: Final Net Realized Profit */}
            <div className="bg-emerald-950/80 p-5 rounded-2xl border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
              <div>
                <span className="text-base font-extrabold text-emerald-400 block">
                  خالص حاصل شدہ نفع / منفع (Net Realized Business Profit)
                </span>
                <span className="text-xs text-emerald-300/80 mt-1 block">
                  خام مال لاگت، کٹائی مزدوری اور تمام گودام اخراجات منہا کرنے کے بعد
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-extrabold font-mono text-emerald-400 block">
                  {formatCurrency(report.netProfit)}
                </span>
                <span className="text-xs font-bold text-emerald-300 font-mono">
                  {report.netMarginPct}% خالص نفع تناسب
                </span>
              </div>
            </div>

            {/* Separate Unrealized Paper Profit Display */}
            <div className="bg-slate-950 p-4 rounded-xl border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    گودام میں موجود غیر فروخت شدہ اسٹاک پر تخمینہ نفع (Unrealized Holding Gain):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    یہ منافع ابھی مال بکنے پر وصول ہونا ہے، اسے حاصل شدہ کیش میں شامل نہیں کیا جاتا۔
                  </span>
                </div>
              </div>
              <span className="text-lg font-bold font-mono text-purple-400">
                + {formatCurrency(report.unrealizedProfitOnStock)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Itemized Costing & Material Cost Breakdown */}
      {activeTab === 'costing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                دھات وار تفصیلی اوسط لاگت، مالیت و منافع تجزیہ
              </h3>
              <p className="text-xs text-slate-400">
                ہر میٹل کا گودام اسٹاک (کلو و ٹن)، اوسط وزنی لاگت (WAC)، مارکیٹ ریٹ اور فروخت شدہ لاگت
              </p>
            </div>
            <div className="text-xs text-slate-400">
              کل اسٹاک مالیت: <span className="font-bold text-amber-400 font-mono">{formatCurrency(report.totalInventoryValuationWac)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3 text-right">دھات / میٹل نام</th>
                  <th className="p-3 text-right">نوعیت</th>
                  <th className="p-3 text-right">گودام موجودہ وزن</th>
                  <th className="p-3 text-right">اوسط لاگت (WAC / Kg)</th>
                  <th className="p-3 text-right">کل لاگت مالیت</th>
                  <th className="p-3 text-right">مارکیٹ ریٹ</th>
                  <th className="p-3 text-right">روانہ وزن (Kg)</th>
                  <th className="p-3 text-right">سیلز آمدن</th>
                  <th className="p-3 text-right">COGS لاگت</th>
                  <th className="p-3 text-left">حاصل منافع</th>
                  <th className="p-3 text-left">تخمینہ نفع (Unrealized)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {report.itemBreakdown.map((item) => (
                  <tr key={item.itemId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-sans font-bold text-slate-100">
                      <div>{item.nameUrdu}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{item.nameEng}</div>
                    </td>
                    <td className="p-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.category === 'recovered_metal'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.category === 'recovered_metal' ? 'خالص میٹل' : 'خام کباڑ'}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-100">
                      {item.currentStockKg.toLocaleString()} کلو
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({item.currentStockTons} ٹن)
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      {item.wacPerKg.toLocaleString()} روپے
                    </td>
                    <td className="p-3 font-bold text-slate-200">
                      {formatCurrency(item.totalValuationWac)}
                    </td>
                    <td className="p-3 text-cyan-400 font-bold">
                      {item.marketRatePerKg.toLocaleString()} روپے
                    </td>
                    <td className="p-3 text-slate-200">
                      {item.dispatchedKg > 0 ? `${item.dispatchedKg.toLocaleString()} کلو` : '—'}
                    </td>
                    <td className="p-3 text-emerald-400 font-bold">
                      {item.salesRevenue > 0 ? formatCurrency(item.salesRevenue) : '—'}
                    </td>
                    <td className="p-3 text-rose-400 font-bold">
                      {item.cogsAmount > 0 ? formatCurrency(item.cogsAmount) : '—'}
                    </td>
                    <td className="p-3 text-left font-bold text-emerald-400">
                      {item.realizedGrossProfit !== 0 ? (
                        <div>
                          <span>{formatCurrency(item.realizedGrossProfit)}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            ({item.grossMarginPct}%)
                          </span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3 text-left font-bold text-purple-400">
                      {item.unrealizedProfitLoss > 0
                        ? `+ ${formatCurrency(item.unrealizedProfitLoss)}`
                        : formatCurrency(item.unrealizedProfitLoss)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Cash Flow vs Accrual Accounting */}
      {activeTab === 'cashflow' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-base">
              نقد روانی بمقابلہ اکاؤنٹنگ نفع (Cash Flow vs Accrual Reconciliation)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              یہ جدول نقد آمد و خرچ کو کاغذی نفع و نقصان سے الگ کر کے ڈبل کاؤنٹنگ اور غلط فہمی سے بچاتا ہے۔
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Accrual Income Statement */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="font-bold text-amber-400 text-sm">
                  1. حقِ ملکیت و انوائس منافع (Accrual P&L)
                </span>
                <span className="text-xs text-slate-400">مال روانگی کی بنیاد پر</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">روانہ شدہ میٹل بلز (Delivered Sales):</span>
                  <span className="font-bold text-emerald-400">
                    + {formatCurrency(report.salesRevenue)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">فروخت شدہ مال کی لاگت (COGS):</span>
                  <span className="font-bold text-rose-400">
                    - {formatCurrency(report.cogs)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">گودام آپریشنل اخراجات (OpEx):</span>
                  <span className="font-bold text-rose-400">
                    - {formatCurrency(report.operatingExpenses.total)}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <span className="font-sans font-bold text-slate-200">خالص اکاؤنٹنگ نفع:</span>
                  <span className="font-bold text-lg text-emerald-400">
                    {formatCurrency(report.netProfit)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Cash Flow Statement */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="font-bold text-cyan-400 text-sm">
                  2. حقیقی نقد و بینک روانی (Actual Cash Flow)
                </span>
                <span className="text-xs text-slate-400">روکڑ و بینک واؤچرز کی بنیاد پر</span>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">کسٹمرز سے نقد و بینک وصولیاں:</span>
                  <span className="font-bold text-emerald-400">
                    + {formatCurrency(report.cashFlow.cashFromCustomers)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">سپلائرز کو نقد و بینک ادائیگیاں:</span>
                  <span className="font-bold text-rose-400">
                    - {formatCurrency(report.cashFlow.cashToSuppliers)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">مزدوروں و ٹھیکیداروں کو ادائیگیاں:</span>
                  <span className="font-bold text-rose-400">
                    - {formatCurrency(report.cashFlow.cashToLabor)}
                  </span>
                </div>

                <div className="flex justify-between p-2 bg-slate-900 rounded-lg">
                  <span className="font-sans text-slate-300">گودام اخراجات نقد ادائیگیاں:</span>
                  <span className="font-bold text-rose-400">
                    - {formatCurrency(report.cashFlow.cashForExpenses)}
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center">
                  <span className="font-sans font-bold text-slate-200">خالص نقد بہاؤ (Net Cash Flow):</span>
                  <span
                    className={`font-bold text-lg ${
                      report.cashFlow.netOperatingCashFlow >= 0
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(report.cashFlow.netOperatingCashFlow)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <span className="font-bold text-amber-400 block">
              نکتہ برائے منشی و مالک (Accounting Note):
            </span>
            <p>
              اکاؤنٹنگ نفع ({formatCurrency(report.netProfit)}) اور نقد بہاؤ ({formatCurrency(report.cashFlow.netOperatingCashFlow)}) میں فرق کی بنیادی وجوہات:
              1. کسٹمرز سے بقایا ادھار وصول ہونا باقی ہے ({formatCurrency(report.customerReceivables)})۔
              2. سپلائرز کو واجب الادا رقم بعد میں دی جائے گی ({formatCurrency(report.supplierPayables)})۔
              3. خریدا گیا کباڑ گودام اسٹاک میں موجود ہے اور فوری نقد فروخت نہیں ہوا۔
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Cost Allocation Policy & Methodology */}
      {activeTab === 'policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <span>سکریپ پروسیسنگ لاگت تقسیم پالیسی (Joint Cost Allocation Policy)</span>
            </h3>
            <p className="text-slate-400 mt-1">
              کمپریسر و الیکٹرک موٹرز کی کٹائی سے حاصل شدہ مختلف قیمتی دھاتوں (تانبا، ایلومینیم، لوہا) پر لاگت تقسیم کا طریقہ کار
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-amber-400 text-sm">
                1. وزنی اوسط لاگت (Weighted Average Cost - WAC)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                خام کباڑ (مثلاً کمپریسر لاٹ) کے لیے ہر گاڑی کی خریداری پر صافی وزن اور مکمل لینڈڈ لاگت (خرید ریٹ + گاڑی کرایہ + کانٹا پرچی فیس + لیبر ان لوڈنگ) کو سابقہ اسٹاک کے ساتھ ملا کر نئی فی کلو اوسط لاگت نکالی جاتی ہے۔
              </p>
              <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-amber-300 border border-slate-800">
                WAC = (پہلا اسٹاک لاگت + نیا گاڑی بل + کرایہ) ÷ (کل وزنی کلو گرام)
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-emerald-400 text-sm">
                2. تناسبِ مارکیٹ مالیت پالیسی (Relative Sales Value / NRV)
              </h4>
              <p className="text-slate-300 leading-relaxed">
                کٹائی بیچ کے دوران خام مال کی قیمت + ٹھیکیدار کٹائی مزدوری + گیس سلنڈر و کٹر بلیڈز اخراجات کو تمام حاصل شدہ دھاتوں پر ان کی متوقع مارکیٹ ویلیو کے تناسب سے تقسیم کیا جاتا ہے۔
              </p>
              <div className="bg-slate-900 p-3 rounded-lg font-mono text-[11px] text-emerald-300 border border-slate-800">
                تانبا لاگت حصہ = (تانبا مارکیٹ مالیت ÷ کل ریکوری مارکیٹ مالیت) × کل بیچ لاگت
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">
              کیوں سادہ وزنی اوسط (Weight-based Allocation) استعمال نہیں کی جاتی؟
            </h4>
            <p className="text-slate-300 leading-relaxed">
              اگر 5,000 کلو کمپریسر کٹائی کے تمام اخراجات کو وزن کی بنیاد پر بانٹا جائے تو لوہا (جس کا ریٹ 165 روپے ہے) کو 400 روپے فی کلو لاگت مل جائے گی، جس سے لوہے پر غیر حقیقی نقصان اور تانبے پر بے حد غیر حقیقی زیادہ منافع ظاہر ہوگا۔ بین الاقوامی اکاؤنٹنگ معیار (IAS 2) اور پاکستان کباڑ مارکیٹ اصول کے مطابق Relative Sales Value طریقہ اختیار کیا گیا ہے تاکہ ہر دھات کا حقیقی منافع حاصل ہو۔
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-slate-200">ڈبل کاؤنٹنگ (Double Counting) کی ممانعت:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>
                خام کباڑ لانے کا کرایہ اور ان لوڈنگ سیدھی انوینٹری لاگت (WAC) میں شامل ہوتی ہے، اسے دوبارہ عمومی اخراجات میں نہیں لکھا جاتا۔
              </li>
              <li>
                کٹائی بیچ کے گیس سلنڈر اور کٹر بلیڈز کا خرچہ بیچ لاگت میں شامل ہو کر تیار شدہ میٹل کی لاگت بن جاتا ہے۔
              </li>
              <li>
                مزدوروں کو دی گئی پیشگی (Peshgi Advance) ایک اثاثہ ہے، جب تک وہ کام مکمل نہ کرے اسے اخراجات میں شمار نہیں کیا جاتا۔
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
