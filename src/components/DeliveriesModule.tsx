import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Printer, Truck, CheckCircle, Search, Ban } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PrintableSlipData } from '../types';

export const DeliveriesModule: React.FC = () => {
  const { t, formatCurrency, formatWeight } = useLanguage();
  const { canDeleteRecords, canEditRecords } = useAuth();
  const { sales, deliveries, items, addDelivery, cancelDelivery, setPrintableSlip } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(sales[0]?.id || '');
  const [vehicleNo, setVehicleNo] = useState('GA-7890');
  const [driverName, setDriverName] = useState('جاوید اقبال');
  const [grossWeight, setGrossWeight] = useState(4500);
  const [tareWeight, setTareWeight] = useState(3500);
  const [freightCharge, setFreightCharge] = useState(15000);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedSaleObj = sales.find((s) => s.id === selectedSaleId);
  const netWeight = Math.max(0, grossWeight - tareWeight);

  // Compute remaining undelivered weight for selected sale
  const firstSaleItem = selectedSaleObj?.items[0];
  const orderedKg = firstSaleItem?.orderedQtyKg || 0;
  const deliveredKg = firstSaleItem?.deliveredQtyKg || 0;
  const remainingOrderKg = Math.max(0, orderedKg - deliveredKg);

  const handleCreateChalan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSaleObj || netWeight <= 0) {
      alert('براہِ کرم درست چالان وزنی اعدادوشمار درج کریں۔');
      return;
    }

    if (netWeight > remainingOrderKg && remainingOrderKg > 0) {
      const confirmExceed = window.confirm(
        `توجہ فرمائیں: روانگی صافی وزن (${netWeight} کلو) آرڈر کے بقیہ غیر روانہ وزن (${remainingOrderKg} کلو) سے زیادہ ہے۔ کیا آپ بلا واسطہ اجازت کے ساتھ چالان کاٹنا چاہتے ہیں؟`
      );
      if (!confirmExceed) return;
    }

    const chalanNo = `CHL-${Date.now().toString().slice(-4)}`;
    const weighTicket = `KANDA-${Math.floor(1000 + Math.random() * 9000)}`;

    addDelivery({
      deliveryNo: chalanNo,
      saleId: selectedSaleObj.id,
      saleNo: selectedSaleObj.saleNo,
      customerId: selectedSaleObj.customerId,
      customerName: selectedSaleObj.customerName,
      vehicleNo,
      driverName,
      weighmentTicketNo: weighTicket,
      grossWeight,
      tareWeight,
      netWeight,
      deductionKg: 0,
      deliveredItems: [
        {
          itemId: firstSaleItem?.itemId || items[0]?.id || '',
          itemNameUrdu: firstSaleItem?.itemNameUrdu || 'خالص میٹل',
          itemNameEng: firstSaleItem?.itemNameEng || 'Recovered Metal',
          weightKg: netWeight,
          ratePerKg: firstSaleItem?.ratePerKg || 2750,
          amount: netWeight * (firstSaleItem?.ratePerKg || 2750)
        }
      ],
      freightCharge,
      status: 'received',
      createdBy: 'منشی / گیٹ انچارج'
    });

    // Generate Printable Chalan Ticket
    const slipData: PrintableSlipData = {
      type: 'chalan',
      titleUrdu: 'البَرَکَہ سکریپ گودام - مال روانگی چالان پرچی (Gate Pass)',
      titleEng: 'Al-Baraka Scrap Godown - Dispatch Chalan',
      docNo: chalanNo,
      date: new Date().toLocaleDateString('ur-PK'),
      partyName: selectedSaleObj.customerName,
      vehicleNo,
      driverName,
      items: [
        {
          nameUrdu: firstSaleItem?.itemNameUrdu || 'خالص میٹل',
          nameEng: firstSaleItem?.itemNameEng || 'Recovered Metal',
          weightKg: netWeight,
          rate: firstSaleItem?.ratePerKg || 0,
          amount: netWeight * (firstSaleItem?.ratePerKg || 0)
        }
      ],
      grossWeight,
      tareWeight,
      netWeight,
      deductionKg: 0,
      totalAmount: netWeight * (firstSaleItem?.ratePerKg || 0),
      signatureText: 'دستخط منشی / ڈرائیور وصولی'
    };

    setPrintableSlip(slipData);
    setShowAddModal(false);
    alert(`روانگی چالان ${chalanNo} (وزن ${netWeight} کلو) کامیابی سے جاری ہو گیا!`);
  };

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesSearch =
      d.deliveryNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'cancelled'
        ? d.status === 'cancelled'
        : d.status !== 'cancelled';
    const matchesCustomer = customerFilter === 'all' || d.customerId === customerFilter;
    return matchesSearch && matchesStatus && matchesCustomer;
  });

  const uniqueCustomers = Array.from(new Set(deliveries.map((d) => d.customerName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <span>روانگی چالان و گیٹ پاس</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            کسٹمر آرڈرز پر مال ترسیل، گاڑی وزن اور چالان پرچی کا اندراج
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer text-xs md:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>نیا روانگی چالان</span>
        </button>
      </div>

      {/* Filter Bar with Dropdowns */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="چالان، کسٹمر، گاڑی تلاش کریں..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:border-amber-500"
            />
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">حالت:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:border-amber-500"
            >
              <option value="all">تمام چالانز ({deliveries.length})</option>
              <option value="active">روانہ شدہ (Active)</option>
              <option value="cancelled">منسوخ شدہ (Cancelled)</option>
            </select>
          </div>

          {/* Customer Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">کسٹمر:</label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:border-amber-500"
            >
              <option value="all">سب کسٹمرز</option>
              {sales.map((s) => (
                <option key={s.customerId} value={s.customerId}>
                  {s.customerName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Cards (Phone screen) */}
        <div className="block md:hidden space-y-3">
          {filteredDeliveries.map((d) => {
            const isCancelled = d.status === 'cancelled';
            return (
              <div
                key={d.id}
                className={`bg-slate-950/80 border rounded-xl p-3.5 space-y-2.5 ${
                  isCancelled ? 'border-rose-900/40 opacity-70' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold text-xs">{d.deliveryNo}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isCancelled
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isCancelled ? 'منسوخ' : 'روانہ'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{d.customerName}</span>
                  <span className="text-[10px] text-slate-400 font-mono">آرڈر: {d.saleNo}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px]">صافی وزن:</span>
                    <span className="font-bold text-emerald-400 font-mono">{formatWeight(d.netWeight)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">گاڑی / ڈرائیور:</span>
                    <span className="font-semibold text-slate-200 font-mono text-[10px] truncate block">
                      {d.vehicleNo} ({d.driverName})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                  <span className="text-[10px] text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString('ur-PK')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setPrintableSlip({
                          type: 'chalan',
                          titleUrdu: isCancelled
                            ? 'البَرَکَہ سکریپ گودام - مال روانگی چالان پرچی (منسوخ شدہ)'
                            : 'البَرَکَہ سکریپ گودام - مال روانگی چالان پرچی (Gate Pass)',
                          titleEng: isCancelled
                            ? 'Al-Baraka Scrap Godown - Dispatch Chalan (CANCELLED)'
                            : 'Al-Baraka Scrap Godown - Dispatch Chalan',
                          docNo: d.deliveryNo,
                          date: new Date(d.createdAt).toLocaleDateString('ur-PK'),
                          partyName: d.customerName,
                          vehicleNo: d.vehicleNo,
                          driverName: d.driverName,
                          items: d.deliveredItems.map((i) => ({
                            nameUrdu: i.itemNameUrdu,
                            nameEng: i.itemNameEng,
                            weightKg: i.weightKg,
                            rate: i.ratePerKg,
                            amount: i.amount
                          })),
                          grossWeight: d.grossWeight,
                          tareWeight: d.tareWeight,
                          netWeight: d.netWeight,
                          deductionKg: 0,
                          totalAmount: d.deliveredItems.reduce((a, c) => a + c.amount, 0),
                          signatureText: 'دستخط منشی / ڈرائیور وصولی'
                        });
                      }}
                      className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>پرنٹ</span>
                    </button>

                    {!isCancelled && (canDeleteRecords || canEditRecords) && (
                      <button
                        type="button"
                        onClick={() => {
                          const reason = prompt('چالان منسوخی کی وجہ درج کریں:');
                          if (reason && reason.trim()) {
                            cancelDelivery(d.id, reason.trim());
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 bg-slate-800 rounded-lg border border-slate-700 cursor-pointer"
                        title="منسوخ کریں"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs">کوئی چالان موجود نہیں ہے</div>
          )}
        </div>

        {/* Desktop Table (Tablet and PC) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-right text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-3 text-right">چالان نمبر</th>
                <th className="p-3 text-right">آرڈر نمبر</th>
                <th className="p-3 text-right">کسٹمر کا نام</th>
                <th className="p-3 text-right">گاڑی نمبر</th>
                <th className="p-3 text-right">ڈرائیور</th>
                <th className="p-3 text-right">روانہ صافی وزن (Net Weight)</th>
                <th className="p-3 text-right">کرایہ / چارجز</th>
                <th className="p-3 text-right">تاریخ</th>
                <th className="p-3 text-center">پرنٹ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredDeliveries.map((d) => {
                const isCancelled = d.status === 'cancelled';
                return (
                  <tr key={d.id} className={`hover:bg-slate-800/40 font-mono ${isCancelled ? 'opacity-60 bg-rose-950/20' : ''}`}>
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {d.deliveryNo}
                      {isCancelled && (
                        <span className="block mt-1 text-[9px] text-rose-300 font-sans">
                          منسوخ شدہ ({d.cancellationReason || 'Cancelled'})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{d.saleNo}</td>
                    <td className="p-3 font-bold text-slate-100 font-sans">{d.customerName}</td>
                    <td className="p-3 font-mono text-slate-300">{d.vehicleNo}</td>
                    <td className="p-3 text-slate-300 font-sans">{d.driverName}</td>
                    <td className="p-3 font-bold text-emerald-400">{formatWeight(d.netWeight)}</td>
                    <td className="p-3 text-slate-300">{formatCurrency(d.freightCharge || 0)}</td>
                    <td className="p-3 text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString('ur-PK')}
                    </td>
                    <td className="p-3 text-center font-sans">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPrintableSlip({
                              type: 'chalan',
                              titleUrdu: isCancelled
                                ? 'البَرَکَہ سکریپ گودام - مال روانگی چالان پرچی (منسوخ شدہ)'
                                : 'البَرَکَہ سکریپ گودام - مال روانگی چالان پرچی (Gate Pass)',
                              titleEng: isCancelled
                                ? 'Al-Baraka Scrap Godown - Dispatch Chalan (CANCELLED)'
                                : 'Al-Baraka Scrap Godown - Dispatch Chalan',
                              docNo: d.deliveryNo,
                              date: new Date(d.createdAt).toLocaleDateString('ur-PK'),
                              partyName: d.customerName,
                              vehicleNo: d.vehicleNo,
                              driverName: d.driverName,
                              items: d.deliveredItems.map((i) => ({
                                nameUrdu: i.itemNameUrdu,
                                nameEng: i.itemNameEng,
                                weightKg: i.weightKg,
                                rate: i.ratePerKg,
                                amount: i.amount
                              })),
                              grossWeight: d.grossWeight,
                              tareWeight: d.tareWeight,
                              netWeight: d.netWeight,
                              deductionKg: 0,
                              totalAmount: d.deliveredItems.reduce((a, c) => a + c.amount, 0),
                              signatureText: 'دستخط منشی / ڈرائیور وصولی'
                            });
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1 rounded border border-slate-700 cursor-pointer"
                          title="چالان پرنٹ کریں"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {!isCancelled && (canDeleteRecords || canEditRecords) && (
                          <button
                            type="button"
                            onClick={() => {
                              const reason = prompt('کیا آپ واقعی یہ روانگی چالان منسوخ کرنا چاہتے ہیں؟ اس سے روانہ کیا گیا مال گودام اسٹاک میں واپس بحال ہو جائے گا اور کسٹمر بل ریورس ہو جائے گا۔ وجہ درج کریں:');
                              if (reason && reason.trim()) {
                                cancelDelivery(d.id, reason.trim());
                              }
                            }}
                            className="bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 p-1 rounded border border-slate-700 cursor-pointer"
                            title="چالان منسوخ کریں (Safe Reversal)"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Chalan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3">
              نیا مال روانگی چالان ٹکٹ کاٹیں (Dispatch Chalan)
            </h3>

            <form onSubmit={handleCreateChalan} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">سیلز آرڈر کا انتخاب *</label>
                <select
                  value={selectedSaleId}
                  onChange={(e) => setSelectedSaleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                >
                  {sales.map((s) => {
                    const item = s.items[0];
                    const ord = item?.orderedQtyKg || 0;
                    const del = item?.deliveredQtyKg || 0;
                    const rem = Math.max(0, ord - del);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.saleNo} | {s.customerName} (بقیہ غیر روانہ: {rem} کلو)
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedSaleObj && (
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300 font-bold">
                    <span>آرڈر شدہ کل وزن: <strong className="text-slate-100">{firstSaleItem?.orderedQtyKg} KG</strong></span>
                    <span>سابقہ روانہ شدہ: <strong className="text-emerald-400">{firstSaleItem?.deliveredQtyKg || 0} KG</strong></span>
                  </div>
                  <div className="text-amber-400 font-bold text-xs">
                    بقیہ دستیاب غیر روانہ آرڈر وزن: {remainingOrderKg.toLocaleString()} KG ({(remainingOrderKg / 1000).toFixed(2)} ٹن)
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">گاڑی نمبر *</label>
                  <input
                    type="text"
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ڈرائیور نام</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">گراس وزن (گاڑی + مال) KG</label>
                  <input
                    type="number"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ٹیر وزن (خالی گاڑی) KG</label>
                  <input
                    type="number"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 font-mono rounded-lg p-2.5"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-bold font-mono text-sm flex justify-between">
                <span>روانہ ہونے والا صافی وزن (Net Weight):</span>
                <span>{netWeight.toLocaleString()} KG ({(netWeight / 1000).toFixed(2)} ٹن)</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold cursor-pointer"
                >
                  منسوخ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  چالان و پرنٹ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

