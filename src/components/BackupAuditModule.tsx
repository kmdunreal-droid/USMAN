import React, { useState, useRef } from 'react';
import { Database, Download, Upload, RefreshCw, ShieldAlert, History, Search, Filter, ShieldCheck, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const BackupAuditModule: React.FC = () => {
  const { t } = useLanguage();
  const {
    auditLogs,
    exportBackupJson,
    importBackupJson,
    resetToSampleData,
    clearAllData,
    suppliers,
    customers,
    items,
    purchases,
    sales,
    deliveries,
    processingBatches,
    stockMovements
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJson(content);
        if (success) {
          alert('ڈیٹا بیس بیک اپ کامیابی سے ری سٹور کر دیا گیا!');
        } else {
          alert('فائل امپورٹ کرنے میں ناکامی ہوئی۔ براہِ کرم درست بیک اپ فائل کا انتخاب کریں۔');
        }
      }
    };
    reader.readAsText(file);
  };

  const filteredLogs = auditLogs.filter((a) => {
    const matchesSearch =
      a.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.module.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || a.module === moduleFilter;
    const matchesAction = actionFilter === 'all' || a.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Database className="w-6 h-6" />
            <span>ڈیٹا بیک اپ و سیکیورٹی آڈٹ لاگز (Backup & Immutable Audit Logs)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            سیستم کی تمام مالیاتی، وزنی اور گودام اسٹاک تبدیلیوں کی تاریخ وار لاگ ہسٹری، بیک اپ ایکسپورٹ و تصدیق شدہ ریسٹور
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportBackupJson}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs cursor-pointer shadow-md"
            title="تمام ڈیٹا بیس کا محفوظ بیک اپ JSON فارمیٹ میں ڈاؤن لوڈ کریں"
          >
            <Download className="w-4 h-4" />
            <span>بیک اپ (JSON) ڈاؤن لوڈ</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs cursor-pointer"
            title="پہلے سے ڈاؤن لوڈ شدہ JSON بیک اپ فائل منتخب کر کے ریسٹور کریں"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>بیک اپ ریسٹور کریں</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Database Health & Record Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">سپلائرز کھاتے</span>
          <span className="text-base font-bold font-mono text-slate-100">{suppliers.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">کسٹمر ملز</span>
          <span className="text-base font-bold font-mono text-slate-100">{customers.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">اسٹاک آئٹمز</span>
          <span className="text-base font-bold font-mono text-amber-400">{items.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">خریداری گاڑیاں</span>
          <span className="text-base font-bold font-mono text-emerald-400">{purchases.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">کٹائی بیچز</span>
          <span className="text-base font-bold font-mono text-indigo-400">{processingBatches.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <span className="text-[11px] text-slate-400 block font-medium">اسٹاک موومنٹ لاگز</span>
          <span className="text-base font-bold font-mono text-cyan-400">{stockMovements.length}</span>
        </div>
      </div>

      {/* Reset Seed Button */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-slate-200 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ڈیمو کباڑ گودام ڈیٹا سیٹ اپ (Load Sample Pakistan Scrap Business Data)</span>
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            مصری شاہ لاہور اور کراچی سکریپ مارکیٹ کی نمونہ وزن پرچیاں، کسٹمرز اور کٹائی بیچز ریسٹور کرنے کیلئے
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('کیا آپ واقعی تمام نمونہ ڈیمو ڈیٹا ریسٹور کرنا چاہتے ہیں؟')) {
                resetToSampleData();
              }
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold px-3 py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>ڈیمو ڈیٹا ری سیٹ</span>
          </button>

          <button
            onClick={() => {
              if (confirm('کیا آپ واقعی تمام جعلی / ڈیمو ڈیٹا (خریداری، سیلز، سپلائرز، کھاتے) صاف کرنا چاہتے ہیں؟ اس سے سسٹم مکمل خالی (Clean) ہو جائے گا۔')) {
                clearAllData();
                alert('تمام جعلی و ڈیمو ڈیٹا صاف کر دیا گیا۔ اب آپ بالکل نیا ڈیٹا درج کر سکتے ہیں!');
              }
            }}
            className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold px-3 py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>تمام ڈیمو ڈیٹا ختم کریں (Clear All Data)</span>
          </button>
        </div>
      </div>

      {/* Audit Logs Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                سیستم آڈٹ ٹریل لاگز (Full Tamper-Proof Audit Trail)
              </h3>
              <p className="text-[11px] text-slate-400">
                کل ریکارڈ شدہ لاگز: <span className="text-amber-400 font-bold font-mono">{filteredLogs.length}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="تلاش کریں..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg pr-8 pl-2 py-1.5 text-xs focus:border-amber-500"
              />
            </div>

            {/* Module Filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
            >
              <option value="all">تمام ماڈیولز (All)</option>
              <option value="PURCHASE">آمد خریداری (PURCHASE)</option>
              <option value="PROCESSING">کٹائی و ریکوری (PROCESSING)</option>
              <option value="SALE">سیلز آرڈر (SALE)</option>
              <option value="DELIVERY">روانگی چالان (DELIVERY)</option>
              <option value="LABOR">مزدور ٹھیکیدار (LABOR)</option>
              <option value="LEDGER">کھاتہ جات (LEDGER)</option>
              <option value="EXPENSE">اخراجات (EXPENSE)</option>
              <option value="SYSTEM">سسٹم (SYSTEM)</option>
            </select>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium"
            >
              <option value="all">تمام ایکشنز (All)</option>
              <option value="CREATE">نیا اندراج (CREATE)</option>
              <option value="UPDATE">تبدیلی (UPDATE)</option>
              <option value="CANCEL">منسوخی (CANCEL)</option>
              <option value="WEIGHMENT">وزن کانٹا (WEIGHMENT)</option>
              <option value="BACKUP">بیک اپ (BACKUP)</option>
              <option value="RESTORE">ریسٹور (RESTORE)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 text-right">وقت / تاریخ</th>
                <th className="p-3 text-right">یوزر کا نام</th>
                <th className="p-3 text-right">رول</th>
                <th className="p-3 text-right">ایکشن (Action)</th>
                <th className="p-3 text-right">ماڈیول</th>
                <th className="p-3 text-right">تفصیلات لاگ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    کوئی آڈٹ لاگ ریکارڈ نہیں ملا۔
                  </td>
                </tr>
              ) : (
                filteredLogs.map((a) => {
                  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  if (a.action === 'CANCEL') {
                    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  } else if (a.action === 'UPDATE') {
                    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                  } else if (a.action === 'WEIGHMENT') {
                    badgeColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
                  }

                  return (
                    <tr key={a.id} className="hover:bg-slate-800/40 font-mono">
                      <td className="p-3 text-slate-400 whitespace-nowrap">
                        {new Date(a.timestamp).toLocaleString('ur-PK')}
                      </td>
                      <td className="p-3 font-sans font-bold text-slate-100 whitespace-nowrap">
                        {a.userName}
                      </td>
                      <td className="p-3 uppercase text-amber-400 font-bold whitespace-nowrap">
                        {a.userRole}
                      </td>
                      <td className="p-3 uppercase font-bold whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] border ${badgeColor}`}>
                          {a.action}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-300 font-bold whitespace-nowrap">
                        {a.module}
                      </td>
                      <td className="p-3 font-sans text-slate-200">{a.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
