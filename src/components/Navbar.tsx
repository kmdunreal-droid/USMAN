import React from 'react';
import {
  Scale,
  Languages,
  UserCheck,
  PlusCircle,
  Receipt,
  Menu,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface NavbarProps {
  onOpenWeighmentModal: () => void;
  onOpenVoucherModal: () => void;
  activeModule: string;
  setActiveModule: (m: string) => void;
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWeighmentModal,
  onOpenVoucherModal,
  activeModule,
  setActiveModule,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { activeRole, switchDemoRole, canViewFinancials, canManageUsers, canManageSystem } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-3 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2">
          {setIsSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="md:hidden p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
              aria-label="مینیو کھولیں"
              title="مینیو"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-amber-400 tracking-tight leading-tight">
                {t('appName')}
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block leading-none">
                {t('appSubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Module Dropdown Selector (Dropdown use karo) */}
        <div className="flex-1 max-w-[200px] sm:max-w-xs mx-1">
          <div className="relative">
            <select
              value={activeModule}
              onChange={(e) => setActiveModule(e.target.value)}
              className="w-full bg-slate-950/90 text-amber-300 text-xs font-semibold py-1.5 px-2.5 pr-7 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer appearance-none truncate shadow-inner"
              title="فوری اسکرین تبدیل کریں (Quick Screen Select)"
            >
              <optgroup label="📌 روزمرہ آپریشن" className="bg-slate-900 text-slate-200">
                <option value="dashboard">ڈیش بورڈ</option>
                <option value="weighbridge">وزن پرچی (کانٹا)</option>
                <option value="purchases">خریداری گاڑی</option>
                <option value="processing">کٹائی و ریکوری</option>
                <option value="inventory">اسٹاک رجسٹر</option>
              </optgroup>
              <optgroup label="🚚 سیلز و چالان" className="bg-slate-900 text-slate-200">
                <option value="sales">سیل آرڈرز</option>
                <option value="deliveries">ڈلیوری چالان</option>
              </optgroup>
              <optgroup label="👥 پارٹیاں" className="bg-slate-900 text-slate-200">
                <option value="suppliers">سپلائرز</option>
                <option value="customers">کسٹمرز</option>
              </optgroup>
              <optgroup label="💰 کھاتہ و کیش" className="bg-slate-900 text-slate-200">
                <option value="ledgers">پارٹی کھاتہ</option>
                <option value="cashbook">روکڑ / کیش بک</option>
                <option value="labor">مزدوری / ٹھیکہ</option>
                <option value="expenses">گودام اخراجات</option>
              </optgroup>
              {(canViewFinancials || canManageUsers || canManageSystem) && (
                <optgroup label="⚙️ انتظامیہ" className="bg-slate-900 text-slate-200">
                  {canViewFinancials && <option value="reports">نفع و نقصان</option>}
                  {canManageUsers && <option value="userMgmt">یوزرز</option>}
                  {canManageSystem && <option value="backupAudit">بیک اپ و لاگ</option>}
                </optgroup>
              )}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute left-2 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Right: Quick Action Buttons, Language & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Weighment Ticket Button (Short Word) */}
          <button
            onClick={onOpenWeighmentModal}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow-sm cursor-pointer whitespace-nowrap"
            title="نئی گاڑی وزن پرچی"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">وزن پرچی</span>
          </button>

          {/* Quick Cash Entry Button (Short Word) */}
          <button
            onClick={onOpenVoucherModal}
            className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer whitespace-nowrap"
            title="کیش اندراج"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>کیش انٹری</span>
          </button>

          {/* Language Toggle Button (Short Word) */}
          <button
            onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            title="زبان تبدیل کریں"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">{language === 'ur' ? 'EN' : 'اردو'}</span>
          </button>

          {/* User Role Switcher Dropdown */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1 text-xs">
            <UserCheck className="w-3 h-3 text-slate-400 hidden sm:inline mr-1" />
            <select
              value={activeRole}
              onChange={(e) => switchDemoRole(e.target.value as UserRole)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-medium py-0"
              title="رول سوئچ"
            >
              <option value="owner" className="bg-slate-900 text-slate-100">
                مالک
              </option>
              <option value="munshi" className="bg-slate-900 text-slate-100">
                منشی
              </option>
              <option value="employee" className="bg-slate-900 text-slate-100">
                ورکر
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
