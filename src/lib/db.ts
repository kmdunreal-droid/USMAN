import {
  Supplier,
  Customer,
  Item,
  Purchase,
  Sale,
  Delivery,
  ProcessingBatch,
  Laborer,
  LaborLog,
  PaymentVoucher,
  Expense,
  AuditLog
} from '../types';

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-comp',
    code: 'RAW-COMP',
    nameUrdu: 'کمپریسر کباڑ (AC & Fridge Compressors)',
    nameEng: 'Compressor Scrap',
    category: 'raw_scrap',
    metalType: 'compressor',
    unit: 'kg',
    currentStockKg: 14500,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 380,
    alertMinStockKg: 2000,
    storageLocation: 'گودام A - کباڑ یارڈ #1'
  },
  {
    id: 'item-mot',
    code: 'RAW-MOT',
    nameUrdu: 'برقی موٹریں (Electric Motors 3-Phase)',
    nameEng: 'Electric Motors',
    category: 'raw_scrap',
    metalType: 'motor',
    unit: 'kg',
    currentStockKg: 22000,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 420,
    alertMinStockKg: 3000,
    storageLocation: 'گودام A - موٹر ریک'
  },
  {
    id: 'item-mix',
    code: 'RAW-MIX',
    nameUrdu: 'مکسڈ کباڑ و ریفریجریٹر باڈی',
    nameEng: 'Mixed Scrap & Fridge Bodies',
    category: 'raw_scrap',
    metalType: 'mixed_scrap',
    unit: 'kg',
    currentStockKg: 8500,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 140,
    alertMinStockKg: 1500,
    storageLocation: 'گودام C - اوپن یارڈ'
  },
  {
    id: 'item-cop-a',
    code: 'REC-COP',
    nameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
    nameEng: 'Copper Wire Super-A',
    category: 'recovered_metal',
    metalType: 'copper',
    unit: 'kg',
    currentStockKg: 4850,
    reservedStockKg: 1000,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 2750,
    alertMinStockKg: 500,
    storageLocation: 'گودام B - کاپر سیف ہال'
  },
  {
    id: 'item-alu',
    code: 'REC-ALU',
    nameUrdu: 'ایلومینیم ڈھلائی (Casting Aluminum)',
    nameEng: 'Aluminum Scrap',
    category: 'recovered_metal',
    metalType: 'aluminum',
    unit: 'kg',
    currentStockKg: 9200,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 620,
    alertMinStockKg: 1000,
    storageLocation: 'گودام B - ایلومینیم سیکشن'
  },
  {
    id: 'item-iron',
    code: 'REC-IRN',
    nameUrdu: 'لوہا ہیوی کباڑ (Heavy Iron Scrap)',
    nameEng: 'Iron Heavy Scrap',
    category: 'recovered_metal',
    metalType: 'iron',
    unit: 'kg',
    currentStockKg: 38500,
    reservedStockKg: 5000,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 165,
    alertMinStockKg: 5000,
    storageLocation: 'گودام C - فاؤنڈری لوہا یارڈ'
  },
  {
    id: 'item-brass',
    code: 'REC-BRS',
    nameUrdu: 'پیتل کباڑ (Brass Pittal Scrap)',
    nameEng: 'Brass Scrap',
    category: 'recovered_metal',
    metalType: 'brass',
    unit: 'kg',
    currentStockKg: 1250,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 1850,
    alertMinStockKg: 300,
    storageLocation: 'گودام B - پیتل کیبن'
  },
  {
    id: 'item-silver',
    code: 'REC-SLV',
    nameUrdu: 'سلور برتن و باڈی (Silver Scrap)',
    nameEng: 'Silver / Light Aluminum',
    category: 'recovered_metal',
    metalType: 'silver',
    unit: 'kg',
    currentStockKg: 2100,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 540,
    alertMinStockKg: 400,
    storageLocation: 'گودام B - سلور سیکشن'
  },
  {
    id: 'item-steel',
    code: 'REC-STL',
    nameUrdu: 'سٹینلیس اسٹیل 304 (Stainless Steel)',
    nameEng: 'Stainless Steel Scrap',
    category: 'recovered_metal',
    metalType: 'steel',
    unit: 'kg',
    currentStockKg: 3200,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 390,
    alertMinStockKg: 500,
    storageLocation: 'گودام B - اسٹیل ریک'
  },
  {
    id: 'item-plastic',
    code: 'REC-PLAST',
    nameUrdu: 'ویسٹ پلاسٹک دانہ کباڑ (Waste Plastic)',
    nameEng: 'Plastic Waste Scrap',
    category: 'recovered_metal',
    metalType: 'plastic',
    unit: 'kg',
    currentStockKg: 4500,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 85,
    alertMinStockKg: 1000,
    storageLocation: 'گودام C - پلاسٹک یارڈ'
  },
  {
    id: 'item-other',
    code: 'REC-OTH',
    nameUrdu: 'دیگر دھاتیں و باٹ (Other Metal Scrap)',
    nameEng: 'Other Materials',
    category: 'recovered_metal',
    metalType: 'other',
    unit: 'kg',
    currentStockKg: 1800,
    reservedStockKg: 0,
    damagedWasteKg: 0,
    avgPurchasePricePerKg: 220,
    alertMinStockKg: 300,
    storageLocation: 'گودام A - ریک #4'
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'حاجی افضل کباڑ مارکیٹ',
    company: 'افضل سکریپ ٹریڈرز',
    phone: '0300-4829102',
    city: 'مصری شاہ، لاہور (Lahore)',
    cnic: '35201-1928374-1',
    openingBalance: 200000,
    currentBalance: 485000, // Payable to supplier
    notes: 'کمپریسر و الیکٹرک موٹر سپلائر',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: 'sup-002',
    name: 'چوہدری بشارت حسین',
    company: 'بشارت اینڈ سنز میٹل',
    phone: '0321-9876543',
    city: 'شیر شاہ، کراچی (Karachi)',
    cnic: '42101-8273645-3',
    openingBalance: 500000,
    currentBalance: 1250000,
    notes: 'فیکٹری سکریپ و لوہا باٹ',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: 'sup-003',
    name: 'شیخ ندیم گوہر',
    company: 'گوہر الیکٹرونکس کباڑ',
    phone: '0333-5511223',
    city: 'گوجرانوالہ (Gujranwala)',
    cnic: '34101-5544332-1',
    openingBalance: 0,
    currentBalance: 0,
    notes: 'فریج و واشنگ مشین باڈی',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    name: 'اتحاد اسٹیل اینڈ رولنگ ملز',
    millName: 'اتحاد اسٹیل ملز',
    phone: '0301-8877665',
    city: 'شیخوپورہ روڈ، لاہور (Lahore)',
    cnic: '35202-9988776-5',
    openingBalance: 500000,
    currentBalance: 1850000, // Customer owes us
    creditLimit: 5000000,
    notes: 'لوہا ہیوی سکریپ کا مستقل خریدار',
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString()
  },
  {
    id: 'cust-002',
    name: 'سوبرائن تانبا ڈھلائی فاؤنڈری',
    millName: 'سوبرائن کاپر فاؤنڈری',
    phone: '0312-3344556',
    city: 'گوجرانوالہ (Gujranwala)',
    cnic: '34101-1122334-9',
    openingBalance: 300000,
    currentBalance: 920000,
    creditLimit: 3000000,
    notes: 'تانبا تار گریڈ-A خریدار',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  },
  {
    id: 'cust-003',
    name: 'ملت ایلومینیم پروڈکٹس',
    millName: 'ملت ایلومینیم انڈسٹریز',
    phone: '0345-6677889',
    city: 'فیصل آباد (Faisalabad)',
    cnic: '33100-4455667-3',
    openingBalance: 0,
    currentBalance: 0,
    creditLimit: 2000000,
    notes: 'ایلومینیم ڈھلائی سکریپ',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  }
];

export const INITIAL_LABORERS: Laborer[] = [
  {
    id: 'lab-001',
    name: 'استاد ذوالفقار احمد (ٹھیکیدار)',
    type: 'contractor_thekedar',
    phone: '0302-7711223',
    cnic: '35201-7788990-1',
    defaultPerKgRate: 18,
    currentPeshgiBalance: 25000,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'lab-002',
    name: 'محمد رشید (دہاڑی دار مزدور)',
    type: 'daily_worker',
    phone: '0322-8811224',
    cnic: '35201-1122334-7',
    defaultDailyRate: 1600,
    currentPeshgiBalance: 5000,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'pur-101',
    purchaseNo: 'PUR-2026-0001',
    supplierId: 'sup-001',
    supplierName: 'حاجی افضل کباڑ مارکیٹ',
    vehicleNo: 'LES-4921',
    driverName: 'نعیم خان',
    driverPhone: '0300-1122334',
    transporterName: 'الخیبر ٹرانسپورٹ لاہور',
    grossWeight: 18500,
    tareWeight: 6200,
    netWeight: 12300,
    deductionKg: 300,
    finalPayableWeight: 12000,
    items: [
      {
        itemId: 'item-comp',
        itemNameUrdu: 'کمپریسر کباڑ (AC & Fridge Compressors)',
        itemNameEng: 'Compressor Scrap',
        quantityPieces: 250,
        weightKg: 12000,
        rateUnit: 'per_kg',
        inputRate: 380,
        ratePerKg: 380,
        totalAmount: 4560000
      }
    ],
    materialsTotalAmount: 4560000,
    freightCharge: 35000,
    loadingUnloadingCharge: 5000,
    weighbridgeFee: 1000,
    totalAmount: 4601000,
    paidAmount: 2000000,
    paymentMode: 'bank_transfer',
    paymentStatus: 'partial',
    weighmentSlipNo: 'KANDA-8841',
    notes: 'افضل کباڑ مارکیٹ سے کمپریسر کی پہلی گاڑی',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    saleNo: 'INV-2026-0001',
    customerId: 'cust-002',
    customerName: 'سوبرائن تانبا ڈھلائی فاؤنڈری',
    orderType: 'direct',
    subtotalAmount: 11000000,
    totalAmount: 11000000,
    paidAmount: 2000000,
    paymentStatus: 'partial',
    deliveryStatus: 'partial_delivered',
    items: [
      {
        itemId: 'item-cop-a',
        itemNameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
        itemNameEng: 'Copper Wire Super-A',
        orderedQtyKg: 4000,
        deliveredQtyKg: 1500,
        ratePerKg: 2750,
        totalAmount: 11000000
      }
    ],
    notes: 'گوجرانوالہ کاپر فاؤنڈری 4,000 کلو تانبا تار سپلائی معاہدہ (جزوی ڈیلیوری 1,500 کلو)',
    createdBy: 'حاجی محمد رفیق (مالک)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-101',
    deliveryNo: 'CHL-2026-0001',
    saleId: 'sale-101',
    saleNo: 'INV-2026-0001',
    customerId: 'cust-002',
    customerName: 'سوبرائن تانبا ڈھلائی فاؤنڈری',
    vehicleNo: 'GA-7890',
    driverName: 'جاوید اقبال',
    weighmentTicketNo: 'KANDA-8850',
    grossWeight: 4500,
    tareWeight: 3500,
    netWeight: 1000,
    deductionKg: 0,
    deliveredItems: [
      {
        itemId: 'item-cop-a',
        itemNameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
        itemNameEng: 'Copper Wire Super-A',
        weightKg: 1000,
        ratePerKg: 2750,
        amount: 2750000
      }
    ],
    freightCharge: 15000,
    status: 'received',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'del-102',
    deliveryNo: 'CHL-2026-0002',
    saleId: 'sale-101',
    saleNo: 'INV-2026-0001',
    customerId: 'cust-002',
    customerName: 'سوبرائن تانبا ڈھلائی فاؤنڈری',
    vehicleNo: 'LES-9921',
    driverName: 'نعیم خان',
    weighmentTicketNo: 'KANDA-8855',
    grossWeight: 3800,
    tareWeight: 3300,
    netWeight: 500,
    deductionKg: 0,
    deliveredItems: [
      {
        itemId: 'item-cop-a',
        itemNameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
        itemNameEng: 'Copper Wire Super-A',
        weightKg: 500,
        ratePerKg: 2750,
        amount: 1375000
      }
    ],
    freightCharge: 10000,
    status: 'received',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

export const INITIAL_PROCESSING: ProcessingBatch[] = [
  {
    id: 'prc-101',
    batchNo: 'PRC-2026-0001',
    processingType: 'کمپریسر کٹائی و تانبا ایلومینیم الگائی',
    linkedPurchaseId: 'pur-101',
    linkedPurchaseNo: 'PUR-2026-0001',
    linkedVehicleNo: 'LES-4921',
    startDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    completionDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    status: 'completed',
    laborType: 'theka',
    laborContractorId: 'lab-001',
    laborContractorName: 'استاد ذوالفقار احمد (ٹھیکیدار)',
    rawInputs: [
      {
        itemId: 'item-comp',
        itemNameUrdu: 'کمپریسر کباڑ (AC & Fridge Compressors)',
        itemNameEng: 'Compressor Scrap',
        weightKg: 5000,
        unitCostPerKg: 380,
        totalInputCost: 1900000
      }
    ],
    recoveredOutputs: [
      {
        itemId: 'item-cop-a',
        itemNameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
        itemNameEng: 'Copper Wire Super-A',
        weightKg: 650,
        storageLocation: 'گودام A - کاپر ریک #1',
        estimatedMarketRatePerKg: 2750,
        totalValuation: 1787500
      },
      {
        itemId: 'item-iron',
        itemNameUrdu: 'لوہا ہیوی کباڑ',
        itemNameEng: 'Iron Heavy Scrap',
        weightKg: 3950,
        storageLocation: 'گودام B - لوہا پلاٹ #2',
        estimatedMarketRatePerKg: 165,
        totalValuation: 651750
      },
      {
        itemId: 'item-alu',
        itemNameUrdu: 'ایلومینیم ڈھلائی',
        itemNameEng: 'Aluminum Scrap',
        weightKg: 300,
        storageLocation: 'گودام C - ایلومینیم شیڈ',
        estimatedMarketRatePerKg: 620,
        totalValuation: 186000
      }
    ],
    totalRawWeightKg: 5000,
    totalRecoveredWeightKg: 4900,
    dustWasteKg: 50,
    moistureOilLossKg: 30,
    contaminationLossKg: 20,
    unexplainedWeightDiffKg: 0,
    recoveryPercentage: 98,
    laborCost: 90000,
    gasCylinderExpense: 8000,
    cuttingBladesExpense: 4000,
    electricityPowerExpense: 0,
    otherExpenses: 12000,
    totalBatchCost: 2002000,
    notes: '5000 کلو کمپریسر پروسیسنگ مکمل، بہترین تانبا ریکوری',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const INITIAL_PAYMENTS: PaymentVoucher[] = [
  {
    id: 'pay-101',
    voucherNo: 'VCH-2026-0001',
    type: 'supplier_payment',
    partyType: 'supplier',
    partyId: 'sup-001',
    partyName: 'حاجی افضل کباڑ مارکیٹ',
    paymentMode: 'bank_transfer',
    bankName: 'Meezan Bank Ltd',
    referenceNo: 'MB-998812',
    amount: 2000000,
    description: 'کمپریسر سپلائی گاڑی رقم کی جزوی بینک ادائیگی',
    createdBy: 'حاجی محمد رفیق (مالک)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'pay-102',
    voucherNo: 'VCH-2026-0002',
    type: 'customer_receipt',
    partyType: 'customer',
    partyId: 'cust-002',
    partyName: 'سوبرائن تانبا ڈھلائی فاؤنڈری',
    paymentMode: 'cash',
    amount: 3000000,
    description: 'تانبا تار سپلائی ایڈوانس نقد وصولی',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    expenseNo: 'EXP-2026-0001',
    category: 'freight',
    expenseType: 'operating_overhead',
    amount: 35000,
    paymentMode: 'cash',
    paidTo: 'نعیم خان ڈرائیور',
    description: 'کمپریسر گاڑی LES-4921 کا کرایہ لاری اڈا تا گودام',
    receiptRef: 'BILTY-7781',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'exp-102',
    expenseNo: 'EXP-2026-0002',
    category: 'godown_rent',
    expenseType: 'operating_overhead',
    amount: 120000,
    paymentMode: 'bank_transfer',
    bankName: 'Meezan Bank Ltd',
    paidTo: 'ملک ارشد گودام مالک',
    description: 'ماہانہ گودام کرایہ پلاٹ A و شیڈ B (مصری شاہ لاہور)',
    receiptRef: 'RENT-REC-441',
    createdBy: 'حاجی محمد رفیق (مالک)',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'exp-103',
    expenseNo: 'EXP-2026-0003',
    category: 'electricity',
    expenseType: 'operating_overhead',
    amount: 48500,
    paymentMode: 'bank_transfer',
    bankName: 'Habib Bank Ltd',
    paidTo: 'لیسکو (LESCO Lahore Electric)',
    description: 'کمرشل تھری فیز انڈسٹریل بجلی بل میٹر #38910',
    receiptRef: 'LESCO-998273',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'exp-104',
    expenseNo: 'EXP-2026-0004',
    category: 'diesel_generator',
    expenseType: 'operating_overhead',
    amount: 28000,
    paymentMode: 'cash',
    paidTo: 'بسم اللہ پیٹرولیم سروس',
    description: '100 لٹر ڈیزل برائے فورک لفٹ، ہائیڈرولک پریس و بیک اپ جنریٹر',
    receiptRef: 'PETROL-1029',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'exp-105',
    expenseNo: 'EXP-2026-0005',
    category: 'equipment_maintenance',
    expenseType: 'operating_overhead',
    amount: 15000,
    paymentMode: 'cash',
    paidTo: 'شاہین اسکیلز اینڈ الیکٹرانکس',
    description: 'ڈیجیٹل وزن کانٹا 60 ٹن لوڈ سیل سروسنگ و اوزان پیمائش کیلیبریشن فیس',
    receiptRef: 'SCALE-CAL-88',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'exp-106',
    expenseNo: 'EXP-2026-0006',
    category: 'labor_tea_food',
    expenseType: 'operating_overhead',
    amount: 14500,
    paymentMode: 'cash',
    paidTo: 'مدینہ ہوٹل و ڈھابہ',
    description: 'ہفتہ وار مزدور و اسٹاف دوپہر کھانا، روٹیاں، چائے و منرل واٹر کین',
    receiptRef: 'TEA-KHATA-12',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'exp-107',
    expenseNo: 'EXP-2026-0007',
    category: 'office_stationery',
    expenseType: 'operating_overhead',
    amount: 5500,
    paymentMode: 'cash',
    paidTo: 'عالمگیر اسٹیشنرز اردو بازار',
    description: 'وزن پرچی بکس پرنٹنگ، منشی روزنامچہ کھاتہ رجسٹر، ڈاٹ میٹرکس پرنٹر ربن',
    receiptRef: 'STAT-552',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    userId: 'owner-001',
    userName: 'حاجی محمد رفیق (مالک)',
    userRole: 'owner',
    action: 'CREATE',
    module: 'SYSTEM',
    details: 'البرکۃ سکریپ گودام مینجمنٹ سسٹم شروع و فائر اسٹور ڈیٹا بیس سیٹ اپ مکمل',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const INITIAL_STOCK_MOVEMENTS: any[] = [
  {
    id: 'stk-001',
    movementNo: 'STK-2026-0001',
    itemId: 'item-comp',
    itemNameUrdu: 'کمپریسر کباڑ (AC & Fridge Compressors)',
    itemNameEng: 'Compressor Scrap',
    type: 'purchase_receipt',
    direction: 'in',
    weightKg: 19500,
    unitCostPerKg: 380,
    totalValuation: 7410000,
    balanceAfterKg: 19500,
    storageLocation: 'گودام A - کباڑ یارڈ #1',
    referenceType: 'purchase',
    referenceNo: 'PUR-2026-0001',
    notes: 'آمد گاڑی LES-4921 پرچی #10982 کلو گرام',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'stk-002',
    movementNo: 'STK-2026-0002',
    itemId: 'item-comp',
    itemNameUrdu: 'کمپریسر کباڑ (AC & Fridge Compressors)',
    itemNameEng: 'Compressor Scrap',
    type: 'processing_consumption',
    direction: 'out',
    weightKg: 5000,
    unitCostPerKg: 380,
    totalValuation: 1900000,
    balanceAfterKg: 14500,
    storageLocation: 'گودام A - کباڑ یارڈ #1',
    referenceType: 'processing',
    referenceNo: 'PRC-1001',
    notes: 'کمپریسر کٹائی بیچ PRC-1001 میں استعمال',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'stk-003',
    movementNo: 'STK-2026-0003',
    itemId: 'item-cop-a',
    itemNameUrdu: 'تانبا تار (Pure Copper Wire Super-A)',
    itemNameEng: 'Copper Wire Super-A',
    type: 'metal_recovery',
    direction: 'in',
    weightKg: 650,
    unitCostPerKg: 2750,
    totalValuation: 1787500,
    balanceAfterKg: 4850,
    storageLocation: 'گودام B - کاپر سیف ہال',
    referenceType: 'processing',
    referenceNo: 'PRC-1001',
    notes: 'کمپریسر کٹائی بیچ PRC-1001 سے حاصل شدہ تانبا',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'stk-004',
    movementNo: 'STK-2026-0004',
    itemId: 'item-iron',
    itemNameUrdu: 'لوہا ہیوی کباڑ (Heavy Iron Scrap)',
    itemNameEng: 'Iron Heavy Scrap',
    type: 'sale_dispatch',
    direction: 'out',
    weightKg: 12000,
    unitCostPerKg: 165,
    totalValuation: 1980000,
    balanceAfterKg: 38500,
    storageLocation: 'گودام C - فاؤنڈری لوہا یارڈ',
    referenceType: 'delivery',
    referenceNo: 'CHL-2026-0001',
    notes: 'روانگی چالان CHL-2026-0001 اتفاق اسٹیل ملز',
    createdBy: 'محمد صابر (منشی)',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

