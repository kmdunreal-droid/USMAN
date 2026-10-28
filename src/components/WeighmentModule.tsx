import React, { useState } from 'react';
import {
  Scale,
  Truck,
  Printer,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { PrintableSlipData } from '../types';

interface WeighmentModuleProps {
  onSuccessClose?: () => void;
}

const VEHICLE_PRESETS = [
  { label: 'کسٹم وزن (Custom)', tare: 0 },
  { label: 'سوزوکی پک اپ (1,100 کلو)', tare: 1100 },
  { label: 'شہزور ڈالہ (2,200 کلو)', tare: 2200 },
  { label: 'مزدا 6 وہیلر (5,800 کلو)', tare: 5800 },
  { label: 'بیڈفورڈ 10 وہیلر (9,500 کلو)', tare: 9500 },
  { label: '22 وہیلر ٹرالر (14,200 کلو)', tare: 14200 }
];

export const WeighmentModule: React.FC<WeighmentModuleProps> = ({ onSuccessClose }) => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { suppliers, customers, items, addPurchase, setPrintableSlip } = useData();

  const [transactionType, setTransactionType] = useState<'purchase' | 'sale_dispatch'>('purchase');
  const [partyId, setPartyId] = useState<string>(suppliers[0]?.id || '');
  const [vehicleNo, setVehicleNo] = useState<string>('LES-7821');
  const [driverName, setDriverName] = useState<string>('محمد علی');
  const [driverPhone, setDriverPhone] = useState<string>('0300-9876543');

  // Weighbridge Inputs (KG)
  const [grossWeight, setGrossWeight] = useState<number>(18500);
  const [tareWeight, setTareWeight] = useState<number>(6500);
  const [deductionKg, setDeductionKg] = useState<number>(200);

  // Selected Item & Rate
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [rateUnit, setRateUnit] = useState<'per_kg' | 'per_maund' | 'per_ton'>('per_kg');
  const [inputRate, setInputRate] = useState<number>(380);

  const [freightCharge, setFreightCharge] = useState<number>(25000);
  const [paidAmount, setPaidAmount] = useState<number>(1000000);
  const [notes, setNotes] = useState<string>('');

  // Auto Calculations
  const rawNetWeight = Math.max(0, grossWeight - tareWeight);
  const finalPayableWeight = Math.max(0, rawNetWeight - deductionKg);

  // Convert rate to per kg
  let ratePerKg = inputRate;
  if (rateUnit === 'per_maund') {
    ratePerKg = inputRate / 40;
  } else if (rateUnit === 'per_ton') {
    ratePerKg = inputRate / 1000;
  }

  const totalAmount = Math.round(finalPayableWeight * ratePerKg);
  const remainingBalance = Math.max(0, totalAmount - paidAmount);

  const selectedItemObj = items.find((i) => i.id === selectedItemId);
  const selectedPartyName =
    transactionType === 'purchase'
      ? suppliers.find((s) => s.id === partyId)?.name || 'عام سپلائر'
      : customers.find((c) => c.id === partyId)?.name || 'عام کسٹمر';

  const handleSaveWeighment = (e: React.FormEvent) => {
    e.preventDefault();

    if (finalPayableWeight <= 0) {
      alert('براہِ کرم گاڑی کا صحیح وزن درج کریں۔ (گراس وزن، ٹیر وزن سے زیادہ ہونا چاہئے)');
      return;
    }

    const slipNo = `KANDA-${Math.floor(1000 + Math.random() * 9000)}`;

    if (transactionType === 'purchase') {
      addPurchase({
        purchaseNo: `PUR-${Date.now().toString().slice(-4)}`,
        supplierId: partyId,
        supplierName: selectedPartyName,
        vehicleNo,
        driverName,
        driverPhone,
        grossWeight,
        tareWeight,
        netWeight: rawNetWeight,
        deductionKg,
        finalPayableWeight,
        items: [
          {
            itemId: selectedItemId,
            itemNameUrdu: selectedItemObj?.nameUrdu || 'سکریپ آئٹم',
            itemNameEng: selectedItemObj?.nameEng || 'Scrap Item',
            weightKg: finalPayableWeight,
            rateUnit: 'per_kg',
            inputRate: ratePerKg,
            ratePerKg,
            totalAmount
          }
        ],
        materialsTotalAmount: totalAmount,
        freightCharge,
        loadingUnloadingCharge: 5000,
        weighbridgeFee: 1000,
        totalAmount,
        paidAmount,
        paymentMode: 'cash',
        paymentStatus: paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid',
        status: 'active',
        weighmentSlipNo: slipNo,
        notes,
        createdBy: 'منشی / کانٹا انچارج'
      });
    }

    // Prepare printable slip
    const slipData: PrintableSlipData = {
      type: 'weighment_purchase',
      titleUrdu: 'البرکۃ سکریپ گودام - کمپیوٹرائزڈ وزن پرچی',
      titleEng: 'Al-Baraka Scrap Godown - Weighment Ticket',
      docNo: slipNo,
      date: new Date().toLocaleDateString('ur-PK'),
      partyName: selectedPartyName,
      vehicleNo,
      driverName,
      driverPhone,
      items: [
        {
          nameUrdu: selectedItemObj?.nameUrdu || 'سکریپ آئٹم',
          nameEng: selectedItemObj?.nameEng || 'Scrap Item',
          weightKg: finalPayableWeight,
          rate: ratePerKg,
          amount: totalAmount
        }
      ],
      grossWeight,
      tareWeight,
      netWeight: rawNetWeight,
      deductionKg,
      totalAmount,
      paidAmount,
      remainingBalance,
      notes,
      signatureText: 'دستخط منشی / کانٹا انچارج'
    };

    setPrintableSlip(slipData);

    if (onSuccessClose) {
      onSuccessClose();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 sm:space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-amber-400 flex items-center gap-2">
            <Scale className="w-5 h-5" />
            <span>گاڑی وزن پرچی (کانٹا)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            گراس و ٹیر وزن، کٹوتی اور خودکار رقم حساب
          </p>
        </div>

        {/* Transaction Type Dropdown (Dropdown use karo) */}
        <div className="relative w-full sm:w-auto">
          <select
            value={transactionType}
            onChange={(e) => {
              const type = e.target.value as 'purchase' | 'sale_dispatch';
              setTransactionType(type);
              if (type === 'purchase' && suppliers[0]) setPartyId(suppliers[0].id);
              if (type === 'sale_dispatch' && customers[0]) setPartyId(customers[0].id);
            }}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-amber-300 text-xs font-bold py-2 px-3 pr-7 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer appearance-none"
            title="ٹرانزیکشن قسم"
          >
            <option value="purchase">📥 خریداری آمد (Incoming)</option>
            <option value="sale_dispatch">📤 روانگی چالان (Sales)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      <form onSubmit={handleSaveWeighment} className="space-y-4 sm:space-y-5">
        {/* Party, Vehicle, Item Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/40 p-3 sm:p-4 rounded-xl border border-slate-800">
          {/* Party Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {transactionType === 'purchase' ? 'سپلائر' : 'کسٹمر'}
            </label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
            >
              {transactionType === 'purchase'
                ? suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))
                : customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.millName})
                    </option>
                  ))}
            </select>
          </div>

          {/* Vehicle No */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              گاڑی نمبر
            </label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="LES-4921"
              required
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none uppercase font-mono"
            />
          </div>

          {/* Vehicle Type Dropdown Preset */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              قسم گاڑی / تخمینہ ٹیر
            </label>
            <select
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > 0) setTareWeight(val);
              }}
              defaultValue="0"
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
            >
              {VEHICLE_PRESETS.map((vp, idx) => (
                <option key={idx} value={vp.tare}>
                  {vp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Material Item Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              آئٹم / مٹیریل
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nameUrdu}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Weighbridge Display Cards */}
        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-amber-500/30 relative shadow-xl">
          <div className="text-[11px] font-bold text-amber-400 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>کانٹا لائیو وزن اسکرین (KG)</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Gross Weight */}
            <div className="bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-amber-400 mb-1">
                گراس وزن (گاڑی+مال)
              </label>
              <input
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-mono text-xl sm:text-2xl font-bold p-1.5 rounded-lg text-center focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Tare Weight */}
            <div className="bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                ٹیر وزن (خالی گاڑی)
              </label>
              <input
                type="number"
                value={tareWeight}
                onChange={(e) => setTareWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono text-xl sm:text-2xl font-bold p-1.5 rounded-lg text-center focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Deduction */}
            <div className="bg-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold text-rose-400 mb-1">
                کچرا کٹوتی (KG)
              </label>
              <input
                type="number"
                value={deductionKg}
                onChange={(e) => setDeductionKg(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-mono text-xl sm:text-2xl font-bold p-1.5 rounded-lg text-center focus:border-rose-400 focus:outline-none"
              />
            </div>

            {/* Final Net Weight Result */}
            <div className="bg-emerald-950/40 p-2.5 sm:p-3 rounded-xl border border-emerald-500/50 flex flex-col justify-center items-center">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">
                صافی وزن (بل)
              </span>
              <span className="text-xl sm:text-2xl font-mono font-extrabold text-emerald-400">
                {finalPayableWeight.toLocaleString()} <span className="text-xs">کلو</span>
              </span>
              <span className="text-[10px] text-emerald-300/80">
                ({(finalPayableWeight / 1000).toFixed(2)} ٹن)
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-800/40 p-3 sm:p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ریٹ اکائی
            </label>
            <select
              value={rateUnit}
              onChange={(e) => setRateUnit(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
            >
              <option value="per_kg">فی کلوگرام (KG)</option>
              <option value="per_maund">فی من (40 کلو)</option>
              <option value="per_ton">فی ٹن (1000 کلو)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ریٹ (روپے)
            </label>
            <input
              type="number"
              value={inputRate}
              onChange={(e) => setInputRate(Number(e.target.value))}
              required
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono text-base font-bold rounded-lg p-1.5 focus:border-amber-500 focus:outline-none"
            />
            <p className="text-[10px] text-amber-400 mt-0.5">
              ریٹ فی کلو: Rs {ratePerKg.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              کرایہ گاڑی
            </label>
            <input
              type="number"
              value={freightCharge}
              onChange={(e) => setFreightCharge(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 font-mono rounded-lg p-2 text-xs focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              ادا شدہ کیش
            </label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-base font-bold rounded-lg p-1.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Calculation Summary & Submit */}
        <div className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center justify-around w-full sm:w-auto gap-4 sm:gap-6">
            <div>
              <div className="text-[10px] text-slate-400">کل رقم</div>
              <div className="text-lg sm:text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(totalAmount)}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400">بقایا کھاتہ</div>
              <div className="text-base sm:text-xl font-bold font-mono text-rose-400">
                {formatCurrency(remainingBalance)}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer text-xs sm:text-sm min-h-[44px]"
          >
            <Printer className="w-4 h-4" />
            <span>پرچی محفوظ و پرنٹ</span>
          </button>
        </div>
      </form>
    </div>
  );
};
