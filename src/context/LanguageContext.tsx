import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: 'rtl' | 'ltr';
  t: (key: string) => string;
  formatNumber: (val: number, decimals?: number) => string;
  formatCurrency: (val: number) => string;
  formatWeight: (valKg: number) => string;
}

const translations: Record<string, { ur: string; en: string }> = {
  // App Title & Header - Short and Clear
  appName: { ur: 'البرکۃ سکریپ', en: 'Al-Baraka Scrap' },
  appSubtitle: { ur: 'گودام و کانٹا سسٹم', en: 'Scrap & Weighbridge' },
  ownerRole: { ur: 'مالک', en: 'Owner' },
  munshiRole: { ur: 'منشی', en: 'Munshi' },
  employeeRole: { ur: 'ورکر', en: 'Worker' },
  
  // Navigation Modules - Short Names
  dashboard: { ur: 'ڈیش بورڈ', en: 'Dashboard' },
  weighbridge: { ur: 'کانٹا', en: 'Kanda' },
  suppliers: { ur: 'سپلائرز', en: 'Suppliers' },
  customers: { ur: 'کسٹمرز', en: 'Customers' },
  purchases: { ur: 'خریداری', en: 'Purchases' },
  processing: { ur: 'کٹائی / ریکوری', en: 'Recovery' },
  labor: { ur: 'مزدوری / ٹھیکہ', en: 'Labor' },
  inventory: { ur: 'اسٹاک', en: 'Stock' },
  sales: { ur: 'سیل آرڈر', en: 'Sales' },
  deliveries: { ur: 'چالان', en: 'Challans' },
  ledgers: { ur: 'کھاتہ', en: 'Ledgers' },
  cashbook: { ur: 'روکڑ / کیش', en: 'Cashbook' },
  expenses: { ur: 'اخراجات', en: 'Expenses' },
  reports: { ur: 'نفع / نقصان', en: 'P & L' },
  userMgmt: { ur: 'یوزرز', en: 'Users' },
  backupAudit: { ur: 'بیک اپ', en: 'Backup' },

  // Dashboard Stats - Short Labels
  todayPurchases: { ur: 'آج خریداری', en: "Today Purchases" },
  todaySales: { ur: 'آج سیلز', en: "Today Sales" },
  cashBalance: { ur: 'روکڑ کیش', en: 'Cash Balance' },
  stockValuation: { ur: 'کل اسٹاک مالیت', en: 'Stock Value' },
  supplierPayables: { ur: 'سپلائر بقایا', en: 'Payables' },
  customerReceivables: { ur: 'کسٹمر بقایا', en: 'Receivables' },
  unprocessedScrap: { ur: 'خام سکریپ', en: 'Raw Scrap' },
  recoveredMetalStock: { ur: 'صاف میٹل', en: 'Clean Metal' },

  // Form Terms - Concise
  grossWeight: { ur: 'گراس وزن', en: 'Gross Wt' },
  tareWeight: { ur: 'ٹیر وزن', en: 'Tare Wt' },
  netWeight: { ur: 'صافی وزن', en: 'Net Wt' },
  deduction: { ur: 'کٹوتی (کلو)', en: 'Deduction' },
  payableWeight: { ur: 'صافی بل وزن', en: 'Payable Wt' },
  vehicleNo: { ur: 'گاڑی نمبر', en: 'Vehicle #' },
  driverName: { ur: 'ڈرائیور', en: 'Driver' },
  weighmentSlip: { ur: 'پرچی نمبر', en: 'Slip #' },
  ratePerKg: { ur: 'ریٹ / کلو', en: 'Rate/KG' },
  ratePerMaund: { ur: 'ریٹ / من (40کلو)', en: 'Rate/Maund' },
  totalAmount: { ur: 'کل رقم', en: 'Total' },
  paidAmount: { ur: 'ادا شدہ', en: 'Paid' },
  remainingBalance: { ur: 'بقایا', en: 'Balance' },
  freightKiraya: { ur: 'کرایہ گاڑی', en: 'Freight' },
  peshgiAdvance: { ur: 'پیشگی', en: 'Advance' },

  // Actions - Clean Verbs
  add: { ur: 'نیا اندراج', en: 'New' },
  save: { ur: 'محفوظ', en: 'Save' },
  cancel: { ur: 'منسوخ', en: 'Cancel' },
  edit: { ur: 'ترمیم', en: 'Edit' },
  delete: { ur: 'حذف', en: 'Delete' },
  printSlip: { ur: 'پرنٹ', en: 'Print' },
  search: { ur: 'تلاش...', en: 'Search...' },
  filter: { ur: 'فلٹر', en: 'Filter' },
  exportCsv: { ur: 'ایکسل CSV', en: 'CSV' },
  demoSeed: { ur: 'ڈیمو ڈیٹا', en: 'Demo Data' },

  // Currency & Units
  pkr: { ur: 'روپے', en: 'PKR' },
  kg: { ur: 'کلو', en: 'KG' },
  ton: { ur: 'ٹن', en: 'Ton' },
  maund: { ur: 'من', en: 'Maund' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ur');

  useEffect(() => {
    const dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const dir = language === 'ur' ? 'rtl' : 'ltr';

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en || key;
    }
    return key;
  };

  const formatNumber = (val: number, decimals: number = 2): string => {
    if (isNaN(val) || val === null || val === undefined) return '0';
    return new Intl.NumberFormat(language === 'ur' ? 'ur-PK' : 'en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatCurrency = (val: number): string => {
    if (isNaN(val)) return language === 'ur' ? '0 روپے' : 'PKR 0';
    const formatted = formatNumber(val, 0);
    return language === 'ur' ? `${formatted} روپے` : `PKR ${formatted}`;
  };

  const formatWeight = (valKg: number): string => {
    if (isNaN(valKg)) return language === 'ur' ? '0 کلو' : '0 KG';
    if (valKg >= 1000) {
      const tons = valKg / 1000;
      return language === 'ur'
        ? `${formatNumber(valKg, 0)} کلو (${formatNumber(tons, 2)} ٹن)`
        : `${formatNumber(valKg, 0)} KG (${formatNumber(tons, 2)} Ton)`;
    } else if (valKg >= 40) {
      const maunds = valKg / 40;
      return language === 'ur'
        ? `${formatNumber(valKg, 0)} کلو (${formatNumber(maunds, 1)} من)`
        : `${formatNumber(valKg, 0)} KG (${formatNumber(maunds, 1)} Maund)`;
    }
    return language === 'ur' ? `${formatNumber(valKg, 0)} کلو` : `${formatNumber(valKg, 0)} KG`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        dir,
        t,
        formatNumber,
        formatCurrency,
        formatWeight
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
