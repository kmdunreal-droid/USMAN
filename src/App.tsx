import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardModule } from './components/DashboardModule';
import { WeighmentModule } from './components/WeighmentModule';
import { PurchasesModule } from './components/PurchasesModule';
import { ProcessingModule } from './components/ProcessingModule';
import { InventoryModule } from './components/InventoryModule';
import { SalesModule } from './components/SalesModule';
import { DeliveriesModule } from './components/DeliveriesModule';
import { SuppliersModule } from './components/SuppliersModule';
import { CustomersModule } from './components/CustomersModule';
import { LedgersModule } from './components/LedgersModule';
import { PaymentsCashbookModule } from './components/PaymentsCashbookModule';
import { LaborModule } from './components/LaborModule';
import { ExpensesModule } from './components/ExpensesModule';
import { ProfitLossModule } from './components/ProfitLossModule';
import { UserManagementModule } from './components/UserManagementModule';
import { BackupAuditModule } from './components/BackupAuditModule';
import { PrintSlipModal } from './components/PrintSlipModal';
import {
  X,
  LayoutDashboard,
  Scale,
  Truck,
  Boxes,
  BookOpen
} from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Quick Action Modal states
  const [showQuickWeighmentModal, setShowQuickWeighmentModal] = useState<boolean>(false);
  const [showQuickVoucherModal, setShowQuickVoucherModal] = useState<boolean>(false);

  // Deep link to party ledger
  const [selectedPartyForLedger, setSelectedPartyForLedger] = useState<string>('');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <Navbar
        onOpenWeighmentModal={() => setShowQuickWeighmentModal(true)}
        onOpenVoucherModal={() => setShowQuickVoucherModal(true)}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Body Layout */}
      <div className="flex flex-1 relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Dynamic Active Module Container */}
        <main className="flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && (
            <DashboardModule
              onOpenWeighmentModal={() => setShowQuickWeighmentModal(true)}
              onOpenVoucherModal={() => setShowQuickVoucherModal(true)}
              setActiveModule={setActiveModule}
            />
          )}

          {activeModule === 'weighbridge' && (
            <WeighmentModule onSuccessClose={() => setActiveModule('purchases')} />
          )}

          {activeModule === 'purchases' && (
            <PurchasesModule onOpenWeighmentModal={() => setShowQuickWeighmentModal(true)} />
          )}

          {activeModule === 'processing' && <ProcessingModule />}

          {activeModule === 'inventory' && <InventoryModule />}

          {activeModule === 'sales' && <SalesModule />}

          {activeModule === 'deliveries' && <DeliveriesModule />}

          {activeModule === 'suppliers' && (
            <SuppliersModule
              setActiveModule={setActiveModule}
              setSelectedPartyForLedger={setSelectedPartyForLedger}
            />
          )}

          {activeModule === 'customers' && (
            <CustomersModule
              setActiveModule={setActiveModule}
              setSelectedPartyForLedger={setSelectedPartyForLedger}
            />
          )}

          {activeModule === 'ledgers' && (
            <LedgersModule selectedPartyForLedger={selectedPartyForLedger} />
          )}

          {activeModule === 'cashbook' && <PaymentsCashbookModule />}

          {activeModule === 'labor' && <LaborModule />}

          {activeModule === 'expenses' && <ExpensesModule />}

          {activeModule === 'reports' && <ProfitLossModule />}

          {activeModule === 'userMgmt' && <UserManagementModule />}

          {activeModule === 'backupAudit' && <BackupAuditModule />}
        </main>
      </div>

      {/* Quick Weighment Modal */}
      {showQuickWeighmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-amber-400 text-lg">
                فوری گاڑی وزن پرچی (Quick Kanda Ticket)
              </h3>
              <button
                onClick={() => setShowQuickWeighmentModal(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <WeighmentModule onSuccessClose={() => setShowQuickWeighmentModal(false)} />
          </div>
        </div>
      )}

      {/* Quick Cash Voucher Modal */}
      {showQuickVoucherModal && (
        <PaymentsCashbookModule
          showModalInitially={true}
          onCloseModal={() => setShowQuickVoucherModal(false)}
        />
      )}

      {/* Print Ticket Overlay */}
      <PrintSlipModal />

      {/* Mobile Fixed Bottom Navigation Bar (Easy thumb navigation on phones) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-30 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveModule('dashboard')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition cursor-pointer ${
            activeModule === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">ہوم</span>
        </button>

        <button
          onClick={() => setActiveModule('weighbridge')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition cursor-pointer ${
            activeModule === 'weighbridge' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] mt-0.5 font-bold text-amber-400">کانٹا</span>
        </button>

        <button
          onClick={() => setActiveModule('purchases')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition cursor-pointer ${
            activeModule === 'purchases' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">خریداری</span>
        </button>

        <button
          onClick={() => setActiveModule('inventory')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition cursor-pointer ${
            activeModule === 'inventory' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">اسٹاک</span>
        </button>

        <button
          onClick={() => setActiveModule('ledgers')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-lg flex-1 transition cursor-pointer ${
            activeModule === 'ledgers' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">کھاتہ</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
