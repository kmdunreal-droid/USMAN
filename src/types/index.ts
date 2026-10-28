export type UserRole = 'owner' | 'munshi' | 'employee';

export type Language = 'ur' | 'en';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string;
  phone: string;
  city: string;
  cnic?: string;
  openingBalance: number; // Opening balance in PKR
  currentBalance: number; // positive = payable to supplier, negative = advance paid
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  millName?: string;
  phone: string;
  city: string;
  cnic?: string;
  openingBalance: number; // Opening balance in PKR
  currentBalance: number; // positive = customer owes us (receivable)
  creditLimit: number;
  notes?: string;
  createdAt: string;
}

export type ItemCategory = 'raw_scrap' | 'recovered_metal' | 'processed_item';

export type MetalType =
  | 'compressor'
  | 'motor'
  | 'mixed_scrap'
  | 'copper'
  | 'aluminum'
  | 'iron'
  | 'brass'
  | 'silver'
  | 'steel'
  | 'plastic'
  | 'other';

export interface Item {
  id: string;
  code: string;
  nameUrdu: string;
  nameEng: string;
  category: ItemCategory;
  metalType: MetalType;
  unit: 'kg' | 'ton' | 'piece';
  currentStockKg: number;
  reservedStockKg?: number;
  damagedWasteKg?: number;
  avgPurchasePricePerKg: number;
  alertMinStockKg: number;
  storageLocation?: string;
}

export type StockMovementType =
  | 'purchase_receipt'
  | 'processing_consumption'
  | 'metal_recovery'
  | 'sale_dispatch'
  | 'customer_return'
  | 'supplier_return'
  | 'purchase_cancellation'
  | 'sale_cancellation'
  | 'delivery_cancellation'
  | 'authorized_adjustment'
  | 'damaged_waste';

export interface StockMovementLog {
  id: string;
  movementNo: string;
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  type: StockMovementType;
  direction: 'in' | 'out';
  weightKg: number;
  unitCostPerKg: number;
  totalValuation: number;
  balanceAfterKg: number;
  storageLocation?: string;
  referenceType?: 'purchase' | 'processing' | 'delivery' | 'sale' | 'adjustment' | 'return';
  referenceNo?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  itemId: string;
  itemNameUrdu: string;
  systemWeightKg: number;
  physicalWeightKg: number;
  varianceKg: number;
  reason: string;
  authorizedBy: string;
  createdAt: string;
}

export interface PurchaseItem {
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  quantityPieces?: number;
  weightKg: number;
  rateUnit: 'per_kg' | 'per_maund' | 'per_ton';
  inputRate: number;
  ratePerKg: number;
  totalAmount: number;
}

export interface Purchase {
  id: string;
  purchaseNo: string; // Unique Voucher No
  supplierId: string;
  supplierName: string;
  vehicleNo: string;
  driverName?: string;
  driverPhone?: string;
  transporterName?: string;
  grossWeight: number; // kg
  tareWeight: number; // kg
  netWeight: number; // kg
  deductionKg: number; // moisture / waste / gand
  finalPayableWeight: number; // net - deduction
  items: PurchaseItem[];
  materialsTotalAmount: number; // Sum of material costs
  freightCharge: number; // Kiraya
  loadingUnloadingCharge: number; // Mazduri
  weighbridgeFee: number; // Kanda Fee
  totalAmount: number; // Total PKR Bill
  paidAmount: number;
  paymentMode: 'cash' | 'bank_transfer' | 'credit' | 'cheque';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  weighmentSlipNo: string;
  attachmentUrls?: string[];
  notes?: string;
  status?: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleItem {
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  orderedQtyKg: number;
  deliveredQtyKg: number;
  rateUnit?: 'per_kg' | 'per_maund' | 'per_ton';
  inputRate?: number;
  ratePerKg: number;
  totalAmount: number;
}

export interface Sale {
  id: string;
  saleNo: string;
  customerId: string;
  customerName: string;
  orderType: 'direct' | 'contract';
  subtotalAmount?: number;
  discountAmount?: number;
  additionalCharges?: number;
  totalAmount: number;
  paidAmount: number;
  deliveredInvoiceAmount?: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'credit';
  deliveryStatus: 'pending' | 'partial_delivered' | 'fully_delivered' | 'cancelled';
  status?: 'active' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  items: SaleItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface DeliveryItem {
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  weightKg: number;
  ratePerKg: number;
  amount: number;
}

export interface Delivery {
  id: string;
  deliveryNo: string; // Chalan No
  saleId: string;
  saleNo: string;
  customerId: string;
  customerName: string;
  vehicleNo: string;
  driverName: string;
  weighmentTicketNo: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  deductionKg: number;
  deliveredItems: DeliveryItem[];
  freightCharge: number;
  status: 'dispatched' | 'received' | 'cancelled';
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdBy: string;
  createdAt: string;
}

export interface ProcessingInput {
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  weightKg: number;
  unitCostPerKg: number;
  totalInputCost: number;
}

export interface ProcessingOutput {
  itemId: string;
  itemNameUrdu: string;
  itemNameEng: string;
  weightKg: number;
  storageLocation: string; // e.g. "گودام A - کاپر ریک #1"
  estimatedMarketRatePerKg: number;
  totalValuation: number;
}

export interface ProcessingBatch {
  id: string;
  batchNo: string; // e.g. PRC-2026-0001
  processingType: string;
  
  // Link to Purchase & Vehicle
  linkedPurchaseId?: string;
  linkedPurchaseNo?: string;
  linkedVehicleNo?: string;

  // Dates & Status
  startDate: string;
  completionDate?: string;
  status: 'in_progress' | 'completed' | 'partially_processed';

  // Labor Assignment
  laborType: 'daily_wages' | 'theka';
  laborContractorId?: string;
  laborContractorName?: string;

  // Weights & Reconciliation
  rawInputs: ProcessingInput[];
  recoveredOutputs: ProcessingOutput[];
  totalRawWeightKg: number;
  totalRecoveredWeightKg: number;
  
  // Detailed Waste Breakdown
  dustWasteKg: number;
  moistureOilLossKg: number;
  contaminationLossKg: number;
  unexplainedWeightDiffKg: number; // Difference = Raw - (Recovered + Dust + Moisture + Contamination)
  recoveryPercentage: number;

  // Financials & Operating Expenses
  laborCost: number;
  gasCylinderExpense: number;
  cuttingBladesExpense: number;
  electricityPowerExpense: number;
  otherExpenses: number;
  totalBatchCost: number;

  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Laborer {
  id: string;
  name: string;
  type: 'daily_worker' | 'contractor_thekedar';
  phone: string;
  cnic?: string;
  defaultDailyRate?: number;
  defaultPerKgRate?: number;
  currentPeshgiBalance: number; // advance paid balance
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface LaborLog {
  id: string;
  logVoucherNo: string; // Unique labor voucher e.g. LAB-2026-0001
  laborerId: string;
  laborerName: string;
  type: 'daily_worker' | 'contractor_thekedar';
  date: string;
  workDescription: string;

  // Daily Wages specific
  numberOfWorkers?: number;
  workingDays?: number;
  dailyRate?: number;
  overtimeHours?: number;
  overtimeRatePerHour?: number;
  additionalExpenses?: number; // food, tea, equipment

  // Contractor / Theka specific
  jobReference?: string;
  linkedBatchType?: 'processing' | 'purchase' | 'none';
  linkedBatchId?: string;
  linkedBatchNo?: string;
  assignedWeightKg?: number;
  processedWeightKg?: number;
  rateType?: 'per_kg' | 'per_ton' | 'per_item' | 'per_job';
  rateAmount?: number;
  agreedAmount?: number;
  additionalCharges?: number;

  // Totals & Financials
  totalWages: number;
  peshgiDeduction: number;
  paidAmount: number;
  outstandingAmount: number;

  createdBy: string;
  createdAt: string;
}

export type PaymentVoucherType =
  | 'supplier_payment'
  | 'customer_receipt'
  | 'labor_payment'
  | 'expense_payment'
  | 'capital_add'
  | 'debit_note'
  | 'credit_note'
  | 'adjustment'
  | 'reversal';

export interface PaymentVoucher {
  id: string;
  voucherNo: string;
  type: PaymentVoucherType;
  partyType: 'supplier' | 'customer' | 'laborer' | 'expense' | 'owner';
  partyId?: string;
  partyName: string;
  paymentMode: 'cash' | 'bank_transfer' | 'cheque';
  bankName?: string;
  referenceNo?: string;
  allocatedInvoiceNo?: string;
  amount: number;
  description: string;
  isReversal?: boolean;
  reversedVoucherId?: string;
  reversalReason?: string;
  createdBy: string;
  createdAt: string;
}


export type ExpenseCategory =
  | 'freight'
  | 'diesel_generator'
  | 'electricity'
  | 'godown_rent'
  | 'labor_tea_food'
  | 'equipment_maintenance'
  | 'office_stationery'
  | 'misc';

export interface Expense {
  id: string;
  expenseNo: string;
  category: ExpenseCategory;
  expenseType?: 'operating_overhead' | 'direct_processing' | 'delivery_freight';
  amount: number;
  paymentMode: 'cash' | 'bank_transfer';
  bankName?: string;
  paidTo?: string;
  description: string;
  receiptRef?: string;
  date?: string;
  createdBy: string;
  createdAt: string;
}

export interface InventoryCostingItem {
  itemId: string;
  nameUrdu: string;
  nameEng: string;
  category: ItemCategory;
  metalType: string;
  currentStockKg: number;
  currentStockTons: number;
  wacPerKg: number; // Weighted Average Cost
  totalValuationWac: number;
  marketRatePerKg: number;
  totalMarketValuation: number;
  unrealizedProfitLoss: number;
  dispatchedKg: number;
  salesRevenue: number;
  cogsAmount: number;
  realizedGrossProfit: number;
  grossMarginPct: number;
}

export interface ProfitLossReport {
  periodLabel: string;
  startDate: string;
  endDate: string;
  
  // Accrual Basis P&L
  salesRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  
  // Operating Expenses Breakdown
  operatingExpenses: {
    godownRent: number;
    electricity: number;
    dieselGenerator: number;
    equipmentMaintenance: number;
    deliveryFreight: number;
    laborTeaFood: number;
    officeStationery: number;
    misc: number;
    total: number;
  };

  netProfit: number;
  netMarginPct: number;

  // Realized vs Unrealized
  realizedProfit: number;
  unrealizedProfitOnStock: number;
  totalEconomicGain: number;

  // Balance Sheet / Working Capital Snapshot
  totalInventoryValuationWac: number;
  totalInventoryMarketValue: number;
  customerReceivables: number;
  supplierPayables: number;
  laborContractorPayables: number;
  netWorkingCapital: number;

  // Cash Flow Side-by-Side (Distinguishing Cash vs Accrual)
  cashFlow: {
    cashFromCustomers: number;
    cashToSuppliers: number;
    cashToLabor: number;
    cashForExpenses: number;
    netOperatingCashFlow: number;
  };

  // Itemized Costing & P&L
  itemBreakdown: InventoryCostingItem[];
}


export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'BACKUP' | 'RESTORE' | 'WEIGHMENT' | 'CANCEL' | 'REVERSE';
  module:
    | 'PURCHASE'
    | 'SALE'
    | 'DELIVERY'
    | 'PROCESSING'
    | 'LEDGER'
    | 'EXPENSE'
    | 'LABOR'
    | 'USERS'
    | 'SYSTEM';
  details: string;
  timestamp: string;
}

export interface PrintableSlipData {
  type: 'weighment_purchase' | 'weighment_sale' | 'chalan' | 'ledger' | 'payment_voucher';
  titleUrdu: string;
  titleEng: string;
  docNo: string;
  date: string;
  partyName: string;
  vehicleNo?: string;
  driverName?: string;
  driverPhone?: string;
  items: Array<{
    nameUrdu: string;
    nameEng: string;
    weightKg: number;
    rate: number;
    amount: number;
  }>;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  deductionKg?: number;
  ledgerRows?: Array<{
    date: string;
    type: string;
    refNo: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  totalAmount: number;
  paidAmount?: number;
  remainingBalance?: number;
  notes?: string;
  signatureText?: string;
}
