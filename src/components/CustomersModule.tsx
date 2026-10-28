import React, { useState } from 'react';
import { Building2, Plus, Phone, MapPin, CreditCard, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

interface CustomersModuleProps {
  setActiveModule: (m: string) => void;
  setSelectedPartyForLedger: (id: string) => void;
}

export const CustomersModule: React.FC<CustomersModuleProps> = ({
  setActiveModule,
  setSelectedPartyForLedger
}) => {
  const { t, formatCurrency } = useLanguage();
  const { customers, addCustomer } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [millName, setMillName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('شیخوپورہ روڈ، لاہور');
  const [creditLimit, setCreditLimit] = useState(3000000);
  const [initialBalance, setInitialBalance] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('براہِ کرم کسٹمر کا نام اور فون نمبر درج کریں۔');
      return;
    }

    addCustomer({
      name,
      millName,
      phone,
      city,
      creditLimit,
      openingBalance: initialBalance,
      currentBalance: initialBalance
    });

    setShowAddModal(false);
    setName('');
    setMillName('');
    setPhone('');
  };

  const [search, setSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'due' | 'zero'>('all');

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(search.toLowerCase()) ||
      (cust.millName || '').toLowerCase().includes(search.toLowerCase()) ||
      cust.phone.includes(search);
    const matchesBalance =
      balanceFilter === 'all'
        ? true
        : balanceFilter === 'due'
        ? cust.currentBalance > 0
        : cust.currentBalance <= 0;
    return matchesSearch && matchesBalance;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>کسٹمرز و ملز کھاتہ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            اسٹیل ملز، تانبا فاؤنڈریز اور خریداروں کے کھاتہ جات و بقایا
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer text-xs md:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>نیا کسٹمر</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="کسٹمر کا نام، مل یا فون تلاش کریں..."
          className="w-full sm:w-72 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs focus:border-emerald-500"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] font-bold text-slate-400 whitespace-nowrap">کھاتہ:</label>
          <select
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value as any)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:border-emerald-500"
          >
            <option value="all">تمام کسٹمرز ({customers.length})</option>
            <option value="due">واجب الوصول بقایا</option>
            <option value="zero">بے باق کھاتہ</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition space-y-3"
          >
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="font-bold text-slate-100 text-base">{cust.name}</h3>
                {cust.millName && (
                  <span className="text-xs text-emerald-400 block font-medium">
                    {cust.millName}
                  </span>
                )}
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                کسٹمر مل
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{cust.phone}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{cust.city}</span>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>کریڈٹ لمٹ: {formatCurrency(cust.creditLimit)}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">قابلِ وصولی بیلنس:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {formatCurrency(cust.currentBalance)}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedPartyForLedger(cust.id);
                setActiveModule('ledgers');
              }}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>کھاتہ (Ledger) دیکھیں</span>
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-3">
              نیا کسٹمر فاؤنڈری شامل کریں
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">کسٹمر نام *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام خریدار"
                  required
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">مل / فاؤنڈری نام</label>
                  <input
                    type="text"
                    value={millName}
                    onChange={(e) => setMillName(e.target.value)}
                    placeholder="مثلاً اتحاد اسٹیل ملز"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">فون نمبر *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-XXXXXXX"
                    required
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شہر / پتہ</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">کریڈٹ لمٹ (PKR)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ابتدائی بیلنس (PKR)</label>
                  <input
                    type="number"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg p-2.5 font-mono"
                  />
                </div>
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
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-bold cursor-pointer"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
