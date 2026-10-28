import React, { useState } from 'react';
import {
  HardHat,
  Plus,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  UserPlus,
  Scissors,
  Truck,
  Printer,
  DollarSign,
  Clock,
  Briefcase
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Laborer, LaborLog, PrintableSlipData } from '../types';
import { useAuth } from '../context/AuthContext';

export const LaborModule: React.FC = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { userProfile } = useAuth();
  const {
    laborers,
    laborLogs,
    processingBatches,
    purchases,
    addLaborer,
    addLaborLog,
    setPrintableSlip
  } = useData();

  // Modal States
  const [showAddLaborerModal, setShowAddLaborerModal] = useState(false);
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // New Laborer Form
  const [newLabName, setNewLabName] = useState('');
  const [newLabType, setNewLabType] = useState<'daily_worker' | 'contractor_thekedar'>('contractor_thekedar');
  const [newLabPhone, setNewLabPhone] = useState('');
  const [newLabCnic, setNewLabCnic] = useState('');
  const [newLabRate, setNewLabRate] = useState(18); // Rs 18/kg or Rs 1600/day
  const [newLabPeshgi, setNewLabPeshgi] = useState(0);

  // Work Log Entry Form Mode
  const [paymentMethodMode, setPaymentMethodMode] = useState<'daily_wages' | 'theka_contractor'>('theka_contractor');

  // Common Form Fields
  const [laborerId, setLaborerId] = useState(laborers[0]?.id || '');

  // 1. Daily Wages Form Fields
  const [numWorkers, setNumWorkers] = useState(5);
  const [workingDays, setWorkingDays] = useState(6);
  const [dailyRate, setDailyRate] = useState(1600);
  const [overtimeHours, setOvertimeHours] = useState(10);
  const [overtimeRate, setOvertimeRate] = useState(250);
  const [dailyExpenses, setDailyExpenses] = useState(2500); // Food, Tea, Gloves
  const [dailyPeshgiDeduction, setDailyPeshgiDeduction] = useState(3000);
  const [dailyPaidAmount, setDailyPaidAmount] = useState(40000);
  const [dailyWorkDesc, setDailyWorkDesc] = useState('گودام لوہا چھٹائی و لوڈنگ دہاڑی مزدوری');

  // Daily Wages Calculation
  const dailyBaseWages = numWorkers * workingDays * dailyRate;
  const overtimeTotal = overtimeHours * overtimeRate;
  const dailyGrossWages = dailyBaseWages + overtimeTotal + dailyExpenses;
  const dailyNetPayable = Math.max(0, dailyGrossWages - dailyPeshgiDeduction);
  const dailyOutstanding = Math.max(0, dailyNetPayable - dailyPaidAmount);

  // 2. Contractor / Theka Form Fields
  const [jobReference, setJobReference] = useState('JOB-CUT-2026-01');
  const [linkedBatchType, setLinkedBatchType] = useState<'processing' | 'purchase' | 'none'>('processing');
  const [linkedBatchId, setLinkedBatchId] = useState(processingBatches[0]?.id || '');
  const [assignedWeightKg, setAssignedWeightKg] = useState(5000);
  const [processedWeightKg, setProcessedWeightKg] = useState(4900);
  const [thekaRateType, setThekaRateType] = useState<'per_kg' | 'per_ton' | 'per_item' | 'per_job'>('per_kg');
  const [thekaRateAmount, setThekaRateAmount] = useState(18); // Rs 18 / kg
  const [thekaAdditionalCharges, setThekaAdditionalCharges] = useState(5000); // Gas cylinder / blades
  const [thekaPeshgiDeduction, setThekaPeshgiDeduction] = useState(15000);
  const [thekaPaidAmount, setThekaPaidAmount] = useState(70000);
  const [thekaWorkDesc, setThekaWorkDesc] = useState('کمپریسر کٹائی ٹھیکہ پروسیسنگ اور تانبا الگائی');

  // Contractor Calculation
  let calculatedAgreedCost = 0;
  if (thekaRateType === 'per_kg') {
    calculatedAgreedCost = processedWeightKg * thekaRateAmount;
  } else if (thekaRateType === 'per_ton') {
    calculatedAgreedCost = (processedWeightKg / 1000) * thekaRateAmount;
  } else {
    calculatedAgreedCost = thekaRateAmount;
  }

  const thekaTotalWages = calculatedAgreedCost + thekaAdditionalCharges;
  const thekaNetPayable = Math.max(0, thekaTotalWages - thekaPeshgiDeduction);
  const thekaOutstanding = Math.max(0, thekaNetPayable - thekaPaidAmount);

  const selectedLaborerObj = laborers.find((l) => l.id === laborerId);

  // Add Laborer
  const handleSaveLaborer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabName) {
      alert('براہِ کرم مزدور یا ٹھیکیدار کا نام درج کریں۔');
      return;
    }

    addLaborer({
      name: newLabName,
      type: newLabType,
      phone: newLabPhone,
      cnic: newLabCnic,
      defaultDailyRate: newLabType === 'daily_worker' ? newLabRate : undefined,
      defaultPerKgRate: newLabType === 'contractor_thekedar' ? newLabRate : undefined,
      currentPeshgiBalance: newLabPeshgi,
      status: 'active'
    });

    setShowAddLaborerModal(false);
    setNewLabName('');
    setNewLabPhone('');
  };

  // Submit Work Log Entry
  const handleSaveWorkLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLaborerObj) {
      alert('براہِ کرم مزدور یا ٹھیکیدار کا انتخاب کریں۔');
      return;
    }

    const uniqueVoucherNo = `LAB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let linkedBatchNo = '';
    if (linkedBatchType === 'processing') {
      const matchP = processingBatches.find((b) => b.id === linkedBatchId);
      linkedBatchNo = matchP ? matchP.batchNo : '';
    } else if (linkedBatchType === 'purchase') {
      const matchPur = purchases.find((p) => p.id === linkedBatchId);
      linkedBatchNo = matchPur ? matchPur.purchaseNo : '';
    }

    if (paymentMethodMode === 'daily_wages') {
      addLaborLog({
        logVoucherNo: uniqueVoucherNo,
        laborerId: selectedLaborerObj.id,
        laborerName: selectedLaborerObj.name,
        type: 'daily_worker',
        date: new Date().toISOString().split('T')[0],
        workDescription: dailyWorkDesc,
        numberOfWorkers: numWorkers,
        workingDays,
        dailyRate,
        overtimeHours,
        overtimeRatePerHour: overtimeRate,
        additionalExpenses: dailyExpenses,
        totalWages: dailyGrossWages,
        peshgiDeduction: dailyPeshgiDeduction,
        paidAmount: dailyPaidAmount,
        outstandingAmount: dailyOutstanding,
        createdBy: `${userProfile?.displayName || 'Munshi'} (${userProfile?.role || 'user'})`
      });
    } else {
      addLaborLog({
        logVoucherNo: uniqueVoucherNo,
        laborerId: selectedLaborerObj.id,
        laborerName: selectedLaborerObj.name,
        type: 'contractor_thekedar',
        date: new Date().toISOString().split('T')[0],
        workDescription: thekaWorkDesc,
        jobReference,
        linkedBatchType,
        linkedBatchId,
        linkedBatchNo,
        assignedWeightKg,
        processedWeightKg,
        rateType: thekaRateType,
        rateAmount: thekaRateAmount,
        agreedAmount: calculatedAgreedCost,
        additionalCharges: thekaAdditionalCharges,
        totalWages: thekaTotalWages,
        peshgiDeduction: thekaPeshgiDeduction,
        paidAmount: thekaPaidAmount,
        outstandingAmount: thekaOutstanding,
        createdBy: `${userProfile?.displayName || 'Munshi'} (${userProfile?.role || 'user'})`
      });
    }

    // Trigger Print Receipt
    const slipData: PrintableSlipData = {
      type: 'payment_voucher',
      titleUrdu: 'البرکۃ سکریپ گودام - مزدوری و ٹھیکہ ادائیگی واؤچر',
      titleEng: 'Al-Baraka Scrap Godown - Labor Wage Slip',
      docNo: uniqueVoucherNo,
      date: new Date().toLocaleDateString('ur-PK'),
      partyName: selectedLaborerObj.name,
      items: [
        {
          nameUrdu: paymentMethodMode === 'daily_wages' ? dailyWorkDesc : thekaWorkDesc,
          nameEng: paymentMethodMode === 'daily_wages' ? 'Daily Wage Work' : 'Contractor Work',
          weightKg: paymentMethodMode === 'theka_contractor' ? processedWeightKg : 0,
          rate: paymentMethodMode === 'daily_wages' ? dailyRate : thekaRateAmount,
          amount: paymentMethodMode === 'daily_wages' ? dailyGrossWages : thekaTotalWages
        }
      ],
      totalAmount: paymentMethodMode === 'daily_wages' ? dailyGrossWages : thekaTotalWages,
      paidAmount: paymentMethodMode === 'daily_wages' ? dailyPaidAmount : thekaPaidAmount,
      remainingBalance: paymentMethodMode === 'daily_wages' ? dailyOutstanding : thekaOutstanding,
      notes: `پیشگی کٹوتی: Rs ${paymentMethodMode === 'daily_wages' ? dailyPeshgiDeduction : thekaPeshgiDeduction}`,
      signatureText: 'دستخط منشی / مزدور وصولی'
    };

    setPrintableSlip(slipData);
    setShowAddLogModal(false);
  };

  // Filter States
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'theka' | 'daily'>('all');
  const [selectedWorkerFilter, setSelectedWorkerFilter] = useState<string>('all');

  const filteredLogs = laborLogs.filter((log) => {
    const matchesType =
      logTypeFilter === 'all'
        ? true
        : logTypeFilter === 'theka'
        ? log.type === 'contractor_thekedar'
        : log.type === 'daily_worker';
    const matchesWorker =
      selectedWorkerFilter === 'all' ? true : log.laborerId === selectedWorkerFilter;
    return matchesType && matchesWorker;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            <span>مزدور و ٹھیکیدار کھاتہ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            دہاڑی دار مزدور، کٹر ٹھیکیدار، پیشگی رقم اور کام لاگز کا انتظام
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddLaborerModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-3 py-2 rounded-xl text-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>نیا مزدور</span>
          </button>

          <button
            onClick={() => setShowAddLogModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>نیا کام لاگ</span>
          </button>
        </div>
      </div>

      {/* Laborers & Contractors Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {laborers.map((lab) => (
          <div
            key={lab.id}
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md space-y-3"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{lab.name}</h3>
                <span className="text-xs text-slate-400 font-mono block">{lab.phone}</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  lab.type === 'contractor_thekedar'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}
              >
                {lab.type === 'contractor_thekedar' ? 'کٹر ٹھیکیدار (Theka)' : 'دہاڑی مزدور (Daily)'}
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">تعینات ریٹ:</span>
                <span className="font-bold text-slate-100">
                  {lab.type === 'contractor_thekedar'
                    ? `Rs ${lab.defaultPerKgRate || 18} / کلو کٹائی`
                    : `Rs ${lab.defaultDailyRate || 1600} / روزانہ`}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">پیشگی رقم (Peshgi Balance):</span>
                <span className="font-bold text-rose-400 font-mono text-sm">
                  {formatCurrency(lab.currentPeshgiBalance)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Labor Work Logs & Payment History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>مزدوری و ادائیگی لاگز ({filteredLogs.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400">تاریخ وار اجرت، پیشگی کٹوتی اور بقایا جات</p>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-amber-500"
            >
              <option value="all">سب اقسام ({laborLogs.length})</option>
              <option value="theka">ٹھیکیدار (Theka)</option>
              <option value="daily">دہاڑی مزدور (Daily)</option>
            </select>

            <select
              value={selectedWorkerFilter}
              onChange={(e) => setSelectedWorkerFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-amber-500"
            >
              <option value="all">سب مزدور / ٹھیکیدار</option>
              {laborers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Cards View (Phones) */}
        <div className="block md:hidden space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold text-xs">{log.logVoucherNo || log.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  log.type === 'contractor_thekedar'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {log.type === 'contractor_thekedar' ? 'ٹھیکہ' : 'دہاڑی'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 text-xs">{log.laborerName}</span>
                <span className="text-[10px] text-slate-400">{log.date}</span>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 space-y-1">
                <div>{log.workDescription}</div>
                {log.linkedBatchNo && (
                  <div className="text-[10px] text-amber-400 font-mono">منسلک بیچ: {log.linkedBatchNo}</div>
                )}
                <div className="text-[10px] text-slate-400">
                  {log.type === 'contractor_thekedar'
                    ? `وزن: ${log.processedWeightKg || 0} کلو`
                    : `افراد: ${log.numberOfWorkers || 1} x ${log.workingDays || 1} دن`}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] bg-slate-900/40 p-2 rounded-lg">
                <div>
                  <span className="text-slate-400 block">کل اجرت</span>
                  <span className="font-bold text-slate-200">{formatCurrency(log.totalWages)}</span>
                </div>
                <div>
                  <span className="text-emerald-400 block">نقد ادا</span>
                  <span className="font-bold text-emerald-300">{formatCurrency(log.paidAmount)}</span>
                </div>
                <div>
                  <span className="text-amber-400 block">بقایا</span>
                  <span className="font-bold text-amber-300">{formatCurrency(log.outstandingAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-sans">بذریعہ: {log.createdBy || 'منشی'}</span>
                <button
                  type="button"
                  onClick={() => {
                    const slipData: PrintableSlipData = {
                      type: 'payment_voucher',
                      titleUrdu: 'البرکۃ سکریپ گودام - مزدوری ادائیگی رسید',
                      titleEng: 'Al-Baraka Scrap Godown - Wage Slip',
                      docNo: log.logVoucherNo || log.id,
                      date: log.date,
                      partyName: log.laborerName,
                      items: [
                        {
                          nameUrdu: log.workDescription,
                          nameEng: 'Labor Work',
                          weightKg: log.processedWeightKg || 0,
                          rate: log.dailyRate || log.rateAmount || 0,
                          amount: log.totalWages
                        }
                      ],
                      totalAmount: log.totalWages,
                      paidAmount: log.paidAmount,
                      remainingBalance: log.outstandingAmount,
                      notes: `پیشگی کٹوتی: Rs ${log.peshgiDeduction}`,
                      signatureText: 'دستخط منشی / مزدور'
                    };
                    setPrintableSlip(slipData);
                  }}
                  className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>رسید</span>
                </button>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">کوئی لاگ ریکارڈ موجود نہیں ہے</div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 text-right">واؤچر #</th>
                <th className="p-3 text-right">مزدور / ٹھیکیدار</th>
                <th className="p-3 text-right">نوعیت ادائیگی</th>
                <th className="p-3 text-right">تفصیل کام / لنکڈ بیچ</th>
                <th className="p-3 text-right">وزن / دن</th>
                <th className="p-3 text-right">کل مزدوری (PKR)</th>
                <th className="p-3 text-right text-rose-400">پیشگی کٹوتی</th>
                <th className="p-3 text-right text-emerald-400">صافی نقد ادا</th>
                <th className="p-3 text-right text-amber-400">بقایا</th>
                <th className="p-3 text-right">اندراج</th>
                <th className="p-3 text-right">رسید</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 font-sans">
                    کوئی مزدوری لاگ ریکارڈ موجود نہیں ہے۔
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-amber-400">{log.logVoucherNo || log.id}</td>
                    <td className="p-3 font-sans font-bold text-slate-100">{log.laborerName}</td>
                    <td className="p-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'contractor_thekedar'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {log.type === 'contractor_thekedar' ? 'ٹھیکہ' : 'دہاڑی'}
                      </span>
                    </td>
                    <td className="p-3 font-sans text-slate-300">
                      {log.workDescription}
                      {log.linkedBatchNo && (
                        <span className="block text-[10px] text-amber-400 font-mono">
                          بیچ: {log.linkedBatchNo}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-amber-400 font-bold">
                      {log.type === 'contractor_thekedar'
                        ? `${log.processedWeightKg || 0} KG`
                        : `${log.numberOfWorkers || 1} ورکرز x ${log.workingDays || 1} دن`}
                    </td>
                    <td className="p-3 text-slate-100 font-bold">
                      {formatCurrency(log.totalWages)}
                    </td>
                    <td className="p-3 text-rose-400 font-bold">
                      -{formatCurrency(log.peshgiDeduction)}
                    </td>
                    <td className="p-3 font-bold text-emerald-400 font-mono">
                      {formatCurrency(log.paidAmount)}
                    </td>
                    <td className="p-3 font-bold text-amber-400 font-mono">
                      {formatCurrency(log.outstandingAmount)}
                    </td>
                    <td className="p-3 font-sans text-slate-400 text-[11px]">
                      {log.createdBy || 'Munshi'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const slipData: PrintableSlipData = {
                            type: 'payment_voucher',
                            titleUrdu: 'البرکۃ سکریپ گودام - مزدوری ادائیگی رسید',
                            titleEng: 'Al-Baraka Scrap Godown - Wage Slip',
                            docNo: log.logVoucherNo || log.id,
                            date: log.date,
                            partyName: log.laborerName,
                            items: [
                              {
                                nameUrdu: log.workDescription,
                                nameEng: 'Labor Work',
                                weightKg: log.processedWeightKg || 0,
                                rate: log.dailyRate || log.rateAmount || 0,
                                amount: log.totalWages
                              }
                            ],
                            totalAmount: log.totalWages,
                            paidAmount: log.paidAmount,
                            remainingBalance: log.outstandingAmount,
                            notes: `پیشگی کٹوتی: Rs ${log.peshgiDeduction}`,
                            signatureText: 'دستخط منشی / مزدور'
                          };
                          setPrintableSlip(slipData);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded transition cursor-pointer"
                        title="رسید پرنٹ کریں"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Laborer / Contractor */}
      {showAddLaborerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3">
              نیا ٹھیکیدار / مزدور رجسٹر کریں
            </h3>

            <form onSubmit={handleSaveLaborer} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نام *</label>
                <input
                  type="text"
                  value={newLabName}
                  onChange={(e) => setNewLabName(e.target.value)}
                  placeholder="نام مزدور یا ٹھیکیدار"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوعیت (Category)</label>
                <select
                  value={newLabType}
                  onChange={(e) => setNewLabType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-bold"
                >
                  <option value="contractor_thekedar">کٹائی ٹھیکیدار (Theka per KG Contractor)</option>
                  <option value="daily_worker">دہاڑی دار مزدور (Daily Wage Worker)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">فون نمبر</label>
                  <input
                    type="text"
                    value={newLabPhone}
                    onChange={(e) => setNewLabPhone(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شناختی کارڈ (CNIC)</label>
                  <input
                    type="text"
                    value={newLabCnic}
                    onChange={(e) => setNewLabCnic(e.target.value)}
                    placeholder="35201-XXXXXXX-X"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {newLabType === 'contractor_thekedar' ? 'ریٹ فی کلو' : 'روزانہ دہاڑی'}
                  </label>
                  <input
                    type="number"
                    value={newLabRate}
                    onChange={(e) => setNewLabRate(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ابتدائی پیشگی (Peshgi Balance)</label>
                  <input
                    type="number"
                    value={newLabPeshgi}
                    onChange={(e) => setNewLabPeshgi(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-mono font-bold rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLaborerModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-slate-950 rounded-lg font-bold"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Work Log Entry (Daily Wages OR Contractor) */}
      {showAddLogModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>نیا مزدوری و ٹھیکہ کام واؤچر (New Labor Wage Entry)</span>
              </h3>
              <button
                onClick={() => setShowAddLogModal(false)}
                className="text-slate-400 hover:text-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 font-bold text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethodMode('theka_contractor')}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  paymentMethodMode === 'theka_contractor'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                کٹائی ٹھیکیدار (Theka per KG / Job)
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethodMode('daily_wages')}
                className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                  paymentMethodMode === 'daily_wages'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                دہاڑی دار مزدور (Daily Wages & Overtime)
              </button>
            </div>

            <form onSubmit={handleSaveWorkLog} className="space-y-4">
              {/* Select Laborer */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">مزدور / ٹھیکیدار کا انتخاب *</label>
                <select
                  value={laborerId}
                  onChange={(e) => setLaborerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-bold rounded-lg p-2.5"
                >
                  {laborers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type === 'contractor_thekedar' ? 'ٹھیکیدار' : 'دہاڑی'}) - پیشگی: Rs {l.currentPeshgiBalance}
                    </option>
                  ))}
                </select>
              </div>

              {/* FORM A: Daily Wages Mode */}
              {paymentMethodMode === 'daily_wages' && (
                <div className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-emerald-400 font-bold block">دہاڑی دار مزدور اندراج تفصیلات</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">تعداد ورکرز (Workers)</label>
                      <input
                        type="number"
                        value={numWorkers}
                        onChange={(e) => setNumWorkers(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">کام کے دن (Days)</label>
                      <input
                        type="number"
                        value={workingDays}
                        onChange={(e) => setWorkingDays(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">روزانہ فی ورکر دہاڑی (PKR)</label>
                      <input
                        type="number"
                        value={dailyRate}
                        onChange={(e) => setDailyRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">اوور ٹائم (گھنٹے)</label>
                      <input
                        type="number"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">اوور ٹائم ریٹ فی گھنٹہ</label>
                      <input
                        type="number"
                        value={overtimeRate}
                        onChange={(e) => setOvertimeRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">اضافی اخراجات (چائے/کھانا)</label>
                      <input
                        type="number"
                        value={dailyExpenses}
                        onChange={(e) => setDailyExpenses(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">تفصیل کام</label>
                    <input
                      type="text"
                      value={dailyWorkDesc}
                      onChange={(e) => setDailyWorkDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">پیشگی کٹوتی (Peshgi)</label>
                      <input
                        type="number"
                        value={dailyPeshgiDeduction}
                        onChange={(e) => setDailyPeshgiDeduction(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-mono font-bold rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">موقع پر نقد ادائیگی</label>
                      <input
                        type="number"
                        value={dailyPaidAmount}
                        onChange={(e) => setDailyPaidAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold rounded p-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM B: Contractor / Theka Mode */}
              {paymentMethodMode === 'theka_contractor' && (
                <div className="space-y-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                  <span className="text-amber-400 font-bold block">کٹائی ٹھیکیدار کام تفصیلات</span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">جاب ریفرنس / کنٹریکٹ #</label>
                      <input
                        type="text"
                        value={jobReference}
                        onChange={(e) => setJobReference(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2 font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">لنکڈ سکریپ پروسیسنگ بیچ</label>
                      <select
                        value={linkedBatchId}
                        onChange={(e) => setLinkedBatchId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                      >
                        <option value="">-- کوئی بیچ نہ لنک کریں --</option>
                        {processingBatches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.batchNo} - {b.processingType} ({b.totalRawWeightKg}kg)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">پروسیس شدہ وزن (KG)</label>
                      <input
                        type="number"
                        value={processedWeightKg}
                        onChange={(e) => setProcessedWeightKg(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold rounded p-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">ریٹ کی قسم</label>
                      <select
                        value={thekaRateType}
                        onChange={(e) => setThekaRateType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                      >
                        <option value="per_kg">فی کلوگرام (Per KG)</option>
                        <option value="per_ton">فی ٹن (Per Ton)</option>
                        <option value="per_job">پورا ٹھیکہ لک سام (Per Job Lump Sum)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">طے شدہ ریٹ (PKR)</label>
                      <input
                        type="number"
                        value={thekaRateAmount}
                        onChange={(e) => setThekaRateAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">اضافی چارجز (گیس cylinder/بلیڈ)</label>
                      <input
                        type="number"
                        value={thekaAdditionalCharges}
                        onChange={(e) => setThekaAdditionalCharges(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">تفصیل کام</label>
                    <input
                      type="text"
                      value={thekaWorkDesc}
                      onChange={(e) => setThekaWorkDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">پیشگی کٹوتی (Peshgi)</label>
                      <input
                        type="number"
                        value={thekaPeshgiDeduction}
                        onChange={(e) => setThekaPeshgiDeduction(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-mono font-bold rounded p-2"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">موقع پر نقد ادائیگی</label>
                      <input
                        type="number"
                        value={thekaPaidAmount}
                        onChange={(e) => setThekaPaidAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold rounded p-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Total Summary Display */}
              <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">
                    کل مزدوری بل: Rs {(paymentMethodMode === 'daily_wages' ? dailyGrossWages : thekaTotalWages).toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    واجب الادا بقایا:
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">نقد ادا رقم</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {formatCurrency(paymentMethodMode === 'daily_wages' ? dailyPaidAmount : thekaPaidAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">بقایا رقم</span>
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {formatCurrency(paymentMethodMode === 'daily_wages' ? dailyOutstanding : thekaOutstanding)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg cursor-pointer text-sm shadow-lg shadow-amber-500/20"
                >
                  مزدوری واؤچر محفوظ کریں و پرنٹ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
