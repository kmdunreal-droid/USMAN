import React from 'react';
import { X, Printer, Scale, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const PrintSlipModal: React.FC = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { printableSlip, setPrintableSlip } = useData();

  if (!printableSlip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 no-print">
          <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
            <Printer className="w-5 h-5" />
            <span>پرنٹ وزن پرچی پیش نظارہ (Print Ticket Preview)</span>
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>پرنٹ کریں (Print)</span>
            </button>

            <button
              onClick={() => setPrintableSlip(null)}
              className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Ticket Card */}
        <div className="print-card bg-white text-black p-6 rounded-xl shadow-inner space-y-4 font-sans text-xs">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-3">
            <h1 className="text-xl font-extrabold text-black font-serif">
              {printableSlip.titleUrdu}
            </h1>
            <h2 className="text-xs font-bold text-slate-700 uppercase">
              {printableSlip.titleEng}
            </h2>
            <p className="text-[10px] text-slate-600 mt-1">
              مصری شاہ / بند روڈ سکریپ مارکیٹ، لاہور - فون: 0300-8451920
            </p>
          </div>

          {/* Ticket Metadata */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-300 pb-3 font-semibold">
            <div>
              <span className="text-slate-600 block text-[10px]">پرچی / ٹکٹ نمبر:</span>
              <span className="text-sm font-mono text-black font-bold">
                {printableSlip.docNo}
              </span>
            </div>

            <div className="text-left">
              <span className="text-slate-600 block text-[10px]">تاریخ و وقت:</span>
              <span className="text-xs font-mono text-black">{printableSlip.date}</span>
            </div>

            <div>
              <span className="text-slate-600 block text-[10px]">پارٹی نام:</span>
              <span className="text-sm text-black font-bold">{printableSlip.partyName}</span>
            </div>

            {printableSlip.vehicleNo && (
              <div className="text-left">
                <span className="text-slate-600 block text-[10px]">گاڑی نمبر:</span>
                <span className="text-sm font-mono text-black font-bold">
                  {printableSlip.vehicleNo}
                </span>
              </div>
            )}
          </div>

          {/* Weighment Table if gross/tare present */}
          {printableSlip.grossWeight !== undefined && (
            <div className="bg-slate-100 p-3 rounded border border-slate-300 grid grid-cols-3 text-center gap-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-600 block font-bold">گراس (Gross Weight)</span>
                <span className="text-sm font-bold">{printableSlip.grossWeight} KG</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-600 block font-bold">ٹیر (Tare Weight)</span>
                <span className="text-sm font-bold">{printableSlip.tareWeight} KG</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-600 block font-bold">کچرا کٹوتی</span>
                <span className="text-sm font-bold text-red-600">
                  -{printableSlip.deductionKg} KG
                </span>
              </div>
            </div>
          )}

          {/* Ledger Table if printableSlip is ledger */}
          {printableSlip.type === 'ledger' && printableSlip.ledgerRows ? (
            <table className="w-full text-right border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-200 text-black font-bold">
                  <th className="border border-slate-300 p-1.5 text-right">تاریخ</th>
                  <th className="border border-slate-300 p-1.5 text-right">قسم / ٹرانزیکشن</th>
                  <th className="border border-slate-300 p-1.5 text-right">ریفرنس #</th>
                  <th className="border border-slate-300 p-1.5 text-right">تفصیلات</th>
                  <th className="border border-slate-300 p-1.5 text-right">نام (ڈیبٹ +)</th>
                  <th className="border border-slate-300 p-1.5 text-right">جمع (کریڈٹ -)</th>
                  <th className="border border-slate-300 p-1.5 text-right">بیلنس</th>
                </tr>
              </thead>
              <tbody>
                {printableSlip.ledgerRows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-1.5 font-mono text-slate-700">{row.date}</td>
                    <td className="border border-slate-300 p-1.5 font-bold">{row.type}</td>
                    <td className="border border-slate-300 p-1.5 font-mono font-semibold">{row.refNo}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-800">{row.description}</td>
                    <td className="border border-slate-300 p-1.5 font-mono text-amber-800 font-bold">
                      {row.debit > 0 ? `Rs ${row.debit.toLocaleString()}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5 font-mono text-emerald-800 font-bold">
                      {row.credit > 0 ? `Rs ${row.credit.toLocaleString()}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5 font-mono font-bold text-black">
                      Rs {row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Items Table for Purchases/Sales/Deliveries/Vouchers */
            <table className="w-full text-right border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-200 text-black font-bold">
                  <th className="border border-slate-300 p-1.5 text-right">تفصیل آئٹم</th>
                  <th className="border border-slate-300 p-1.5 text-right">صافی وزن</th>
                  <th className="border border-slate-300 p-1.5 text-right">ریٹ (PKR)</th>
                  <th className="border border-slate-300 p-1.5 text-right">کل رقم</th>
                </tr>
              </thead>
              <tbody>
                {printableSlip.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-300">
                    <td className="border border-slate-300 p-1.5 font-bold">{item.nameUrdu}</td>
                    <td className="border border-slate-300 p-1.5 font-mono">
                      {item.weightKg > 0 ? `${item.weightKg.toLocaleString()} KG` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5 font-mono">
                      {item.rate > 0 ? `Rs ${item.rate.toFixed(1)}` : '-'}
                    </td>
                    <td className="border border-slate-300 p-1.5 font-mono font-bold">
                      Rs {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Totals Banner */}
          <div className="border-t-2 border-black pt-2 text-right space-y-1">
            <div className="text-base font-extrabold text-black font-mono">
              کل رقم (Total Amount): Rs {printableSlip.totalAmount.toLocaleString()}
            </div>

            {printableSlip.paidAmount !== undefined && (
              <div className="text-xs font-semibold text-slate-800">
                موقع پر ادائیگی: Rs {printableSlip.paidAmount.toLocaleString()} |
                بقایا کھاتہ: Rs {(printableSlip.remainingBalance || 0).toLocaleString()}
              </div>
            )}
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 flex items-center justify-between border-t border-slate-300 text-[11px] font-bold">
            <div>دستخط ڈرائیور / وصول کنندہ: ____________</div>
            <div>{printableSlip.signatureText || 'دستخط منشی / کانٹا انچارج'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
