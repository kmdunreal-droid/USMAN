import React from 'react';
import {
  LayoutDashboard,
  Scale,
  Truck,
  Scissors,
  Boxes,
  ShoppingBag,
  FileSpreadsheet,
  Users,
  Building2,
  BookOpen,
  Receipt,
  HardHat,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Database,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isOpen,
  setIsOpen
}) => {
  const { t } = useLanguage();
  const { canViewFinancials, canManageUsers, canManageSystem } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'weighbridge', label: t('weighbridge'), icon: Scale, highlight: true },
    { id: 'purchases', label: t('purchases'), icon: Truck },
    { id: 'processing', label: t('processing'), icon: Scissors },
    { id: 'inventory', label: t('inventory'), icon: Boxes },
    { id: 'sales', label: t('sales'), icon: ShoppingBag },
    { id: 'deliveries', label: t('deliveries'), icon: FileSpreadsheet },
    { id: 'suppliers', label: t('suppliers'), icon: Users },
    { id: 'customers', label: t('customers'), icon: Building2 },
    { id: 'ledgers', label: t('ledgers'), icon: BookOpen },
    { id: 'cashbook', label: t('cashbook'), icon: Receipt },
    { id: 'labor', label: t('labor'), icon: HardHat },
    { id: 'expenses', label: t('expenses'), icon: Wallet },
    ...(canViewFinancials
      ? [{ id: 'reports', label: t('reports'), icon: TrendingUp }]
      : []),
    ...(canManageUsers
      ? [{ id: 'userMgmt', label: t('userMgmt'), icon: ShieldCheck }]
      : []),
    ...(canManageSystem
      ? [{ id: 'backupAudit', label: t('backupAudit'), icon: Database }]
      : [])
  ];

  const handleSelect = (id: string) => {
    setActiveModule(id);
    // On mobile screens, automatically close drawer after selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 right-0 z-40 md:z-auto w-64 bg-slate-900 border-l md:border-l-0 md:border-r border-slate-800 flex-shrink-0 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } ${!isOpen ? 'hidden md:block' : 'block'} min-h-[calc(100vh-53px)] p-3 text-slate-300 overflow-y-auto`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between pb-3 mb-2 border-b border-slate-800">
          <span className="font-bold text-amber-400 text-sm">مینیو فہرست</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : item.highlight
                    ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 hover:text-amber-300 border border-amber-500/30'
                    : 'hover:bg-slate-800/80 hover:text-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-slate-950' : 'text-amber-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};
