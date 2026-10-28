import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Trash2,
  CheckCircle,
  Boxes,
  Percent,
  HardHat,
  ArrowRightLeft,
  FileText,
  Printer,
  X,
  AlertTriangle,
  Flame,
  Zap,
  Truck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ProcessingInput, ProcessingOutput, ProcessingBatch } from '../types';

export const ProcessingModule: React.FC = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { items, laborers, purchases, processingBatches, addProcessingBatch } = useData();

  const [processingType, setProcessingType] = useState<string>(
    'کمپریسر کٹائی و تانبا ایلومینیم الگائی'
  );

  // Linked Purchase & Vehicle
  const [linkedPurchaseId, setLinkedPurchaseId] = useState<string>('');
  const [status, setStatus] = useState<'in_progress' | 'completed' | 'partially_processed'>('completed');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Raw Input selection
  const [selectedRawItemId, setSelectedRawItemId] = useState<string>(
    items.find((i) => i.category === 'raw_scrap')?.id || items[0]?.id || ''
  );
  const [rawWeightKg, setRawWeightKg] = useState<number>(5000);

  // Output Recovered Metals
  const recoveredMetalItems = items.filter((i) => i.category === 'recovered_metal');

  const [outputRows, setOutputRows] = useState<
    Array<{ itemId: string; weightKg: number; estRate: number; storageLocation: string }>
  >([
    { itemId: recoveredMetalItems[0]?.id || '', weightKg: 650, estRate: 2750, storageLocation: 'گودام A - کاپر ریک #1' },
    { itemId: recoveredMetalItems[1]?.id || '', weightKg: 300, estRate: 620, storageLocation: 'گودام B - ایلومینیم سیکشن' },
    { itemId: recoveredMetalItems[2]?.id || '', weightKg: 3950, estRate: 165, storageLocation: 'گودام C - فاؤنڈری لوہا یارڈ' }
  ]);

  // Detailed Waste Breakdown
  const [dustWasteKg, setDustWasteKg] = useState<number>(50);
  const [moistureOilLossKg, setMoistureOilLossKg] = useState<number>(30);
  const [contaminationLossKg, setContaminationLossKg] = useState<number>(20);

  // Labor & Operating Expenses
  const [laborType, setLaborType] = useState<'daily_wages' | 'theka'>('theka');
  const [laborContractorId, setLaborContractorId] = useState<string>(
    laborers[0]?.id || ''
  );
  const [laborCost, setLaborCost] = useState<number>(90000); // 5000kg * Rs 18
  const [gasCylinderExpense, setGasCylinderExpense] = useState<number>(5000);
  const [cuttingBladesExpense, setCuttingBladesExpense] = useState<number>(4000);
  const [electricityPowerExpense, setElectricityPowerExpense] = useState<number>(3000);
  const [otherExpenses, setOtherExpenses] = useState<number>(2000);
  const [notes, setNotes] = useState<string>('');

  // Selected Batch for Detailed Modal Report
  const [viewBatchModal, setViewBatchModal] = useState<ProcessingBatch | null>(null);

  const selectedPurchase = purchases.find((p) => p.id === linkedPurchaseId);

  const rawItemObj = items.find((i) => i.id === selectedRawItemId);
  const rawUnitCost = rawItemObj?.avgPurchasePricePerKg || 0;
  const totalRawCost = rawWeightKg * rawUnitCost;

  const totalRecoveredWeightKg = outputRows.reduce((acc, r) => acc + (Number(r.weightKg) || 0), 0);
  const totalRecoveredValuation = outputRows.reduce((acc, r) => {
    return acc + (Number(r.weightKg) || 0) * (Number(r.estRate) || 0);
  }, 0);

  // Weight Reconciliation
  const totalAccountedWasteKg = dustWasteKg + moistureOilLossKg + contaminationLossKg;
  const unexplainedWeightDiffKg = rawWeightKg - (totalRecoveredWeightKg + totalAccountedWasteKg);
  const wasteWeightKg = Math.max(0, rawWeightKg - totalRecoveredWeightKg);
  const recoveryPercentage = rawWeightKg > 0 ? Math.round((totalRecoveredWeightKg / rawWeightKg) * 100) : 0;

  const totalOpsExpenses = gasCylinderExpense + cuttingBladesExpense + electricityPowerExpense + otherExpenses;
  const totalBatchCost = totalRawCost + laborCost + totalOpsExpenses;

  const handleAddOutputRow = () => {
    setOutputRows([
      ...outputRows,
      {
        itemId: recoveredMetalItems[0]?.id || '',
        weightKg: 100,
        estRate: 1000,
        storageLocation: 'گودام A'
      }
    ]);
  };

  const handleRemoveOutputRow = (index: number) => {
    setOutputRows(outputRows.filter((_, i) => i !== index));
  };

  const handleOutputChange = (index: number, field: string, value: any) => {
    const updated = [...outputRows];
    updated[index] = { ...updated[index], [field]: value };
    setOutputRows(updated);
  };

  const handleSaveBatch = (e: React.FormEvent) => {
    e.preventDefault();

    if (rawWeightKg <= 0) {
      alert('براہِ کرم خام سکریپ کا صحیح وزن درج کریں۔');
      return;
    }

    if (totalRecoveredWeightKg <= 0) {
      alert('براہِ کرم ریکور شدہ دھاتوں کا وزن درج کریں۔');
      return;
    }

    const rawInputsArr: ProcessingInput[] = [
      {
        itemId: selectedRawItemId,
        itemNameUrdu: rawItemObj?.nameUrdu || 'خام سکریپ',
        itemNameEng: rawItemObj?.nameEng || 'Raw Scrap',
        weightKg: rawWeightKg,
        unitCostPerKg: rawUnitCost,
        totalInputCost: totalRawCost
      }
    ];

    const recoveredOutputsArr: ProcessingOutput[] = outputRows.map((r) => {
      const match = items.find((i) => i.id === r.itemId);
      const w = Number(r.weightKg) || 0;
      const rate = Number(r.estRate) || 0;
      return {
        itemId: r.itemId,
        itemNameUrdu: match?.nameUrdu || 'ریکور شدہ میٹل',
        itemNameEng: match?.nameEng || 'Recovered Metal',
        weightKg: w,
        storageLocation: r.storageLocation || 'گودام Main',
        estimatedMarketRatePerKg: rate,
        totalValuation: w * rate
      };
    });

    const contractorObj = laborers.find((l) => l.id === laborContractorId);
    const batchNo = `PRC-${Date.now().toString().slice(-4)}`;

    const newBatchData: Omit<ProcessingBatch, 'id' | 'createdAt'> = {
      batchNo,
      processingType,
      linkedPurchaseId: selectedPurchase?.id,
      linkedPurchaseNo: selectedPurchase?.purchaseNo,
      linkedVehicleNo: selectedPurchase?.vehicleNo,
      startDate,
      completionDate: status === 'completed' ? completionDate : undefined,
      status,
      laborType,
      laborContractorId,
      laborContractorName: contractorObj?.name,
      rawInputs: rawInputsArr,
      recoveredOutputs: recoveredOutputsArr,
      totalRawWeightKg: rawWeightKg,
      totalRecoveredWeightKg,
      dustWasteKg,
      moistureOilLossKg,
      contaminationLossKg,
      unexplainedWeightDiffKg,
      recoveryPercentage,
      laborCost,
      gasCylinderExpense,
      cuttingBladesExpense,
      electricityPowerExpense,
      otherExpenses,
      totalBatchCost,
      notes,
      createdBy: 'منشی / کٹر سپروائزر'
    };

    addProcessingBatch(newBatchData);
    alert('کٹائی بیچ کی تفصیلات اور اسٹاک ریکوری کامیابی سے درج ہو گئی!');
  };

  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const filteredBatches = processingBatches.filter((b) => {
    if (historyFilter === 'completed') return b.status === 'completed';
    if (historyFilter === 'in_progress') return b.status === 'in_progress';
    if (historyFilter === 'partially_processed') return b.status === 'partially_processed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              <span>کٹائی و میٹل ریکوری</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              خام سکریپ سے تانبا، ایلومینیم، لوہا اور پیتل الگائی و اسٹاک منتقلی
            </p>
          </div>

          {/* Quick Preset Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap hidden sm:inline">مشہور کٹائی:</label>
            <select
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setProcessingType('');
                } else if (e.target.value) {
                  setProcessingType(e.target.value);
                }
              }}
              className="bg-slate-950 border border-amber-500/40 text-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold focus:border-amber-400 cursor-pointer"
            >
              <option value="">⚙️ کٹائی زمرہ منتخب کریں ▼</option>
              <option value="کمپریسر کٹائی و تانبا ایلومینیم الگائی">کمپریسر کٹائی (کاپر + ایلومینیم)</option>
              <option value="موٹر اسٹریپنگ و کاپر وائنڈنگ">موٹر اسٹریپنگ (خالص تانبا)</option>
              <option value="فریج باڈی کٹائی و فوم صفائی">فریج باڈی شیٹ و پریس</option>
              <option value="کیبل چھلائی و کاپر وائر">کیبل چھلائی (ملٹی کاپر وائر)</option>
              <option value="براس و پیتل والو چھانٹی">پیتل و والو الگائی</option>
              <option value="custom">✏️ دیگر / خود تحریر کریں (+ Custom Entry)</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSaveBatch} className="space-y-6">
          {/* Header & Link Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/40 p-3 md:p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                کٹائی کی تفصیل
              </label>
              <input
                type="text"
                value={processingType}
                onChange={(e) => setProcessingType(e.target.value)}
                placeholder="مثلاً کمپریسر کٹائی"
                required
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                منسلکہ گاڑی / خریداری
              </label>
              <select
                value={linkedPurchaseId}
                onChange={(e) => setLinkedPurchaseId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs focus:border-amber-500"
              >
                <option value="">-- بلا واسطہ گودام اسٹاک --</option>
                {purchases.map((p) => (
                  <option key={p.id} value={p.id}>
                    واؤچر {p.purchaseNo} | گاڑی {p.vehicleNo} ({p.supplierName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                بیچ کی موجودہ حالت (Status)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded-lg p-2.5 text-xs"
              >
                <option value="completed">مکمل شدہ (Completed)</option>
                <option value="in_progress">کٹائی جاری ہے (In Progress)</option>
                <option value="partially_processed">جزوی کٹائی (Partially Processed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                مزدوری کی قسم (Labor Mode)
              </label>
              <div className="flex items-center gap-3 mt-2.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="laborType"
                    checked={laborType === 'theka'}
                    onChange={() => setLaborType('theka')}
                    className="accent-amber-500"
                  />
                  <span>ٹھیکہ (Contractor)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="laborType"
                    checked={laborType === 'daily_wages'}
                    onChange={() => setLaborType('daily_wages')}
                    className="accent-amber-500"
                  />
                  <span>دہاڑی (Daily)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Raw Scrap Input Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-4">
            <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Boxes className="w-4 h-4" />
              <span>1. خام کباڑ ڈسکاؤنٹ کٹائی میں استعمال (Raw Scrap Input)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  خام آئٹم کا انتخاب
                </label>
                <select
                  value={selectedRawItemId}
                  onChange={(e) => setSelectedRawItemId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs focus:border-amber-500"
                >
                  {items
                    .filter((i) => i.category === 'raw_scrap')
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nameUrdu} (اسٹاک: {formatWeight(i.currentStockKg)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کٹائی کیلئے خام وزن (KG)
                </label>
                <input
                  type="number"
                  value={rawWeightKg}
                  onChange={(e) => setRawWeightKg(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-base font-bold rounded-lg p-2 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  خرید لاگت تخمینہ (PKR)
                </label>
                <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono font-bold text-sm">
                  {formatCurrency(totalRawCost)}
                  <span className="text-[10px] text-slate-400 block font-normal">
                    (Rs {rawUnitCost} / کلو)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recovered Metals Output Section */}
          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4" />
                <span>2. حاصل شدہ خالص میٹلز و ریکوری (Recovered Metal Yield)</span>
              </h3>

              <button
                type="button"
                onClick={handleAddOutputRow}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>نیا میٹل آؤٹ پٹ شامل کریں</span>
              </button>
            </div>

            <div className="space-y-2">
              {outputRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800 items-center text-xs"
                >
                  <div className="sm:col-span-1">
                    <label className="block text-[10px] text-slate-400 mb-1">
                      حاصل شدہ میٹل آئٹم
                    </label>
                    <select
                      value={row.itemId}
                      onChange={(e) =>
                        handleOutputChange(index, 'itemId', e.target.value)
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded p-2 text-xs"
                    >
                      {recoveredMetalItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.nameUrdu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      ریکور شدہ وزن (KG)
                    </label>
                    <input
                      type="number"
                      value={row.weightKg}
                      onChange={(e) =>
                        handleOutputChange(index, 'weightKg', Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      اسٹوریج گودام لوکیشن
                    </label>
                    <input
                      type="text"
                      value={row.storageLocation}
                      onChange={(e) =>
                        handleOutputChange(index, 'storageLocation', e.target.value)
                      }
                      placeholder="مثلاً گودام A کاپر ریک"
                      className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">
                      فروخت تخمینہ ریٹ (PKR)
                    </label>
                    <input
                      type="number"
                      value={row.estRate}
                      onChange={(e) =>
                        handleOutputChange(index, 'estRate', Number(e.target.value))
                      }
                      className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded p-2 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="block text-[10px] text-slate-400">کل مالیت</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        {formatCurrency(row.weightKg * row.estRate)}
                      </span>
                    </div>

                    {outputRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOutputRow(index)}
                        className="text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Waste Reconciliation Breakdown */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>وزن مطابقت و ضیاع تفصیلات (Waste & Weight Reconciliation)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    مٹی / ڈسٹ کچرا (KG)
                  </label>
                  <input
                    type="number"
                    value={dustWasteKg}
                    onChange={(e) => setDustWasteKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono rounded p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    رطوبت و ڈینش تیل (KG)
                  </label>
                  <input
                    type="number"
                    value={moistureOilLossKg}
                    onChange={(e) => setMoistureOilLossKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono rounded p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    آلودگی / دیگر آلائش (KG)
                  </label>
                  <input
                    type="number"
                    value={contaminationLossKg}
                    onChange={(e) => setContaminationLossKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 font-mono rounded p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">
                    غیر واضح وزن فرق (KG)
                  </label>
                  <div
                    className={`p-2 bg-slate-950 border border-slate-800 rounded font-mono font-bold text-xs ${
                      unexplainedWeightDiffKg === 0
                        ? 'text-emerald-400'
                        : unexplainedWeightDiffKg > 0
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {unexplainedWeightDiffKg} KG
                  </div>
                </div>
              </div>

              {/* Yield Analytics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3 rounded-lg text-xs font-semibold border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">کل خام وزن:</span>
                  <span className="text-amber-400 font-mono text-sm">
                    {rawWeightKg.toLocaleString()} KG
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">کل خالص میٹل ریکوری:</span>
                  <span className="text-emerald-400 font-mono text-sm">
                    {totalRecoveredWeightKg.toLocaleString()} KG
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">کل ضیاع و کچرا:</span>
                  <span className="text-rose-400 font-mono text-sm">
                    {wasteWeightKg.toLocaleString()} KG
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ریکوری فیصد (Yield %):</span>
                  <span className="text-purple-400 font-mono text-sm">{recoveryPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Costs and Operating Expenses Breakdown */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>3. کٹائی مزدوری و آپریٹنگ اخراجات (Labor & Operating Expenses)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کٹر ٹھیکیدار / مزدور
                </label>
                <select
                  value={laborContractorId}
                  onChange={(e) => setLaborContractorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2.5 text-xs"
                >
                  {laborers.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.type === 'contractor_thekedar' ? 'ٹھیکیدار' : 'دہاڑی مزدور'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کٹائی مزدوری لاگت (PKR)
                </label>
                <input
                  type="number"
                  value={laborCost}
                  onChange={(e) => setLaborCost(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  گیس سلنڈر خرچہ (PKR)
                </label>
                <input
                  type="number"
                  value={gasCylinderExpense}
                  onChange={(e) => setGasCylinderExpense(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  کٹنگ بلیڈز و کٹر آلات (PKR)
                </label>
                <input
                  type="number"
                  value={cuttingBladesExpense}
                  onChange={(e) => setCuttingBladesExpense(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  بجلی / ڈیزل جنریٹر (PKR)
                </label>
                <input
                  type="number"
                  value={electricityPowerExpense}
                  onChange={(e) => setElectricityPowerExpense(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  متفرق اخراجات (PKR)
                </label>
                <input
                  type="number"
                  value={otherExpenses}
                  onChange={(e) => setOtherExpenses(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-xs">
                <span className="text-slate-400">کل بیچ پروسیسنگ لاگت (خام + مزدوری + اخراجات): </span>
                <span className="font-bold text-amber-400 font-mono text-sm">
                  {formatCurrency(totalBatchCost)}
                </span>
              </div>

              <div className="text-xs">
                <span className="text-slate-400">تخمینہ آؤٹ پٹ مارکیٹ مالیت: </span>
                <span className="font-bold text-emerald-400 font-mono text-sm">
                  {formatCurrency(totalRecoveredValuation)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-500/20 cursor-pointer text-sm"
            >
              <CheckCircle className="w-5 h-5" />
              <span>پروسیسنگ بیچ محفوظ کریں و اسٹاک اپڈیٹ کریں</span>
            </button>
          </div>
        </form>
      </div>

      {/* History Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">
              سابقہ کٹائی بیچ ریکارڈ ({filteredBatches.length})
            </h3>
            <p className="text-[11px] text-slate-400">تمام مکمل و جاری کٹائی بیچز کی تفصیل</p>
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400">فلٹر:</label>
            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-amber-500"
            >
              <option value="all">سب بیجز ({processingBatches.length})</option>
              <option value="completed">مکمل شدہ</option>
              <option value="in_progress">کٹائی جاری</option>
              <option value="partially_processed">جزوی کٹائی</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards (Phones & Small screens) */}
        <div className="block md:hidden space-y-3">
          {filteredBatches.map((b) => (
            <div key={b.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-400 font-bold text-xs">{b.batchNo}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  b.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {b.status === 'completed' ? 'مکمل' : b.status === 'in_progress' ? 'جاری' : 'جزوی'}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-200">{b.processingType}</div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">خام وزن:</span>
                  <span className="font-semibold text-slate-200">{formatWeight(b.totalRawWeightKg)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">خالص ریکوری:</span>
                  <span className="font-bold text-emerald-400">{formatWeight(b.totalRecoveredWeightKg)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ریکوری فیصد:</span>
                  <span className="font-bold text-purple-400">{b.recoveryPercentage}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">مزدوری لاگت:</span>
                  <span className="font-semibold text-amber-300 font-mono">{formatCurrency(b.laborCost)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  {b.linkedVehicleNo ? `گاڑی: ${b.linkedVehicleNo}` : 'گودام اسٹاک'}
                </span>
                <button
                  type="button"
                  onClick={() => setViewBatchModal(b)}
                  className="inline-flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>رپورٹ دیکھیں</span>
                </button>
              </div>
            </div>
          ))}
          {filteredBatches.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">کوئی بیچ موجود نہیں ہے</div>
          )}
        </div>

        {/* Desktop Table (Tablet & Large screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-2.5 text-right">بیچ نمبر</th>
                <th className="p-2.5 text-right">تفصیل کٹائی</th>
                <th className="p-2.5 text-right">گاڑی / خریداری</th>
                <th className="p-2.5 text-right">خام وزن</th>
                <th className="p-2.5 text-right">ریکور شدہ خالص وزن</th>
                <th className="p-2.5 text-right">ریکوری فیصد</th>
                <th className="p-2.5 text-right">مزدوری لاگت</th>
                <th className="p-2.5 text-center">تفصیلی رپورٹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40">
                  <td className="p-2.5 font-mono text-amber-400 font-bold">{b.batchNo}</td>
                  <td className="p-2.5 font-bold text-slate-100">{b.processingType}</td>
                  <td className="p-2.5 text-slate-300 font-mono">
                    {b.linkedVehicleNo ? `گاڑی ${b.linkedVehicleNo}` : 'گودام اسٹاک'}
                  </td>
                  <td className="p-2.5 text-slate-300">{formatWeight(b.totalRawWeightKg)}</td>
                  <td className="p-2.5 font-bold text-emerald-400">
                    {formatWeight(b.totalRecoveredWeightKg)}
                  </td>
                  <td className="p-2.5 font-bold text-purple-400">{b.recoveryPercentage}%</td>
                  <td className="p-2.5 text-slate-200">{formatCurrency(b.laborCost)}</td>
                  <td className="p-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => setViewBatchModal(b)}
                      className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>رپورٹ دکھائیں</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Processing Detailed Report Modal */}
      {viewBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>پروسیسنگ بیچ رپورٹ - {viewBatchModal.batchNo}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  البَرَکَہ سکریپ اینڈ میٹل ٹریڈنگ - بیچ ریکوری و مالیاتی رپورٹ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewBatchModal(null)}
                className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Batch Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">نوعیت کٹائی:</span>
                <span className="font-bold text-slate-100">{viewBatchModal.processingType}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">حالت (Status):</span>
                <span className="font-bold text-amber-400 capitalize">
                  {viewBatchModal.status === 'completed' ? 'مکمل شدہ' : 'کٹائی جاری'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">منسلکہ گاڑی:</span>
                <span className="font-mono text-slate-200">
                  {viewBatchModal.linkedVehicleNo || 'عام اسٹاک'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ٹھیکیدار / سپروائزر:</span>
                <span className="font-bold text-slate-200">
                  {viewBatchModal.laborContractorName || 'خود کار'}
                </span>
              </div>
            </div>

            {/* Raw Scrap Input Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-amber-400">خام سکریپ استعمال (Raw Scrap Input)</h4>
              <table className="w-full text-xs text-right text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2 text-right">خام آئٹم</th>
                    <th className="p-2 text-right">وزن (KG)</th>
                    <th className="p-2 text-right">خرید ریٹ (PKR)</th>
                    <th className="p-2 text-right">کل خام لاگت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewBatchModal.rawInputs.map((inp, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold text-slate-100">{inp.itemNameUrdu}</td>
                      <td className="p-2 font-mono text-amber-400">{formatWeight(inp.weightKg)}</td>
                      <td className="p-2 font-mono">Rs {inp.unitCostPerKg} / کلو</td>
                      <td className="p-2 font-mono font-bold text-slate-200">
                        {formatCurrency(inp.totalInputCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recovered Metals Yield Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-emerald-400">حاصل شدہ خالص میٹلز (Recovered Metals Yield)</h4>
              <table className="w-full text-xs text-right text-slate-300 border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-800 text-slate-400">
                  <tr>
                    <th className="p-2 text-right">خالص میٹل آئٹم</th>
                    <th className="p-2 text-right">ریکور وزن (KG)</th>
                    <th className="p-2 text-right">لوکیشن</th>
                    <th className="p-2 text-right">تخمینہ ریٹ</th>
                    <th className="p-2 text-right">کل مالیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {viewBatchModal.recoveredOutputs.map((out, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-bold text-slate-100">{out.itemNameUrdu}</td>
                      <td className="p-2 font-mono text-emerald-400 font-bold">{formatWeight(out.weightKg)}</td>
                      <td className="p-2 text-slate-400">{out.storageLocation}</td>
                      <td className="p-2 font-mono">Rs {out.estimatedMarketRatePerKg}</td>
                      <td className="p-2 font-mono font-bold text-emerald-400">
                        {formatCurrency(out.totalValuation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconciliation & Financial Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800 pt-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-300 block text-xs border-b border-slate-800 pb-1">
                  وزن مطابقت و ضیاع (Weight Reconciliation)
                </span>
                <div className="flex justify-between text-slate-400">
                  <span>کل خام وزن:</span>
                  <span className="font-mono text-amber-400">{viewBatchModal.totalRawWeightKg} KG</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>خالص میٹل ریکوری:</span>
                  <span className="font-mono text-emerald-400">{viewBatchModal.totalRecoveredWeightKg} KG</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>ڈسٹ / کچرا:</span>
                  <span className="font-mono text-rose-400">{viewBatchModal.dustWasteKg || 0} KG</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>رطوبت و تیل ضیاع:</span>
                  <span className="font-mono text-rose-400">{viewBatchModal.moistureOilLossKg || 0} KG</span>
                </div>
                <div className="flex justify-between text-slate-400 font-bold pt-1 border-t border-slate-800 text-purple-400">
                  <span>ریکوری ییلڈ (Yield):</span>
                  <span>{viewBatchModal.recoveryPercentage}%</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <span className="font-bold text-slate-300 block text-xs border-b border-slate-800 pb-1">
                  مالیاتی رپورٹ (Financial Breakdown)
                </span>
                <div className="flex justify-between text-slate-400">
                  <span>خام کباڑ لاگت:</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(viewBatchModal.rawInputs.reduce((a, c) => a + c.totalInputCost, 0))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>کٹائی مزدوری:</span>
                  <span className="font-mono text-slate-200">{formatCurrency(viewBatchModal.laborCost)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>آپریٹنگ اخراجات (گیس/آلات):</span>
                  <span className="font-mono text-slate-200">
                    {formatCurrency(
                      (viewBatchModal.gasCylinderExpense || 0) +
                        (viewBatchModal.cuttingBladesExpense || 0) +
                        (viewBatchModal.electricityPowerExpense || 0) +
                        (viewBatchModal.otherExpenses || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800">
                  <span>کل بیچ لاگت:</span>
                  <span>{formatCurrency(viewBatchModal.totalBatchCost)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>پرنٹ رپورٹ پرچی</span>
              </button>

              <button
                type="button"
                onClick={() => setViewBatchModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                بند کریں
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

