import {
  Item,
  Purchase,
  Sale,
  Delivery,
  ProcessingBatch,
  Expense,
  PaymentVoucher,
  LaborLog,
  Supplier,
  Customer,
  ProfitLossReport,
  InventoryCostingItem
} from '../types';

export interface DateFilterOptions {
  period: 'today' | 'month' | 'year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * Filter helper by date string (ISO or YYYY-MM-DD)
 */
export const isWithinDateRange = (
  dateStr: string,
  options: DateFilterOptions
): boolean => {
  if (options.period === 'all') return true;

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) return true;

  const now = new Date();

  if (options.period === 'today') {
    const todayStr = now.toISOString().split('T')[0];
    return dateStr.startsWith(todayStr);
  }

  if (options.period === 'month') {
    return (
      targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth()
    );
  }

  if (options.period === 'year') {
    return targetDate.getFullYear() === now.getFullYear();
  }

  if (options.period === 'custom') {
    if (options.startDate) {
      const start = new Date(options.startDate);
      start.setHours(0, 0, 0, 0);
      if (targetDate < start) return false;
    }
    if (options.endDate) {
      const end = new Date(options.endDate);
      end.setHours(23, 59, 59, 999);
      if (targetDate > end) return false;
    }
    return true;
  }

  return true;
};

/**
 * Calculates Weighted Average Cost (WAC) per Kg for every inventory item.
 * Incorporates:
 * 1. Raw purchases with landed costs (freight & handling)
 * 2. Processing batches with Relative Sales Value (NRV) cost allocation
 */
export const calculateAllItemsWAC = (
  items: Item[],
  purchases: Purchase[],
  batches: ProcessingBatch[]
): Map<string, number> => {
  const wacMap = new Map<string, number>();

  // 1. Calculate WAC for Raw Scrap items from purchases
  items.forEach((item) => {
    // Start with item's base/opening cost
    let totalCost = item.currentStockKg * item.avgPurchasePricePerKg;
    let totalWeight = item.currentStockKg;

    // Add purchases for this item
    purchases.forEach((p) => {
      p.items.forEach((pi) => {
        if (pi.itemId === item.id) {
          // Direct landed cost = material rate + proportion of freight/handling
          const itemPortion = pi.weightKg / (p.netWeight || pi.weightKg || 1);
          const landedAdditions =
            (p.freightCharge || 0) * itemPortion +
            (p.loadingUnloadingCharge || 0) * itemPortion +
            (p.weighbridgeFee || 0) * itemPortion;
          
          totalCost += pi.totalAmount + landedAdditions;
          totalWeight += pi.weightKg;
        }
      });
    });

    const calculatedWac = totalWeight > 0 ? totalCost / totalWeight : item.avgPurchasePricePerKg;
    wacMap.set(item.id, Math.round(calculatedWac * 100) / 100);
  });

  // 2. Calculate WAC for Recovered Metals from completed Processing Batches
  // Using Relative Sales Value (Net Realizable Value) Allocation Policy
  batches
    .filter((b) => b.status === 'completed')
    .forEach((batch) => {
      // Calculate total input cost of raw materials consumed
      let rawScrapInputCost = 0;
      batch.rawInputs.forEach((raw) => {
        const rawWac = wacMap.get(raw.itemId) || raw.unitCostPerKg || 380;
        rawScrapInputCost += raw.weightKg * rawWac;
      });

      // Direct processing labor and operational expenses
      const batchLabor = batch.laborCost || 0;
      const batchOps =
        (batch.gasCylinderExpense || 0) +
        (batch.cuttingBladesExpense || 0) +
        (batch.electricityPowerExpense || 0) +
        (batch.otherExpenses || 0);

      const totalBatchCost = rawScrapInputCost + batchLabor + batchOps;

      // Calculate total market valuation of all recovered outputs in this batch
      let totalOutputsMarketValuation = 0;
      batch.recoveredOutputs.forEach((out) => {
        const marketRate = out.estimatedMarketRatePerKg || 100;
        totalOutputsMarketValuation += out.weightKg * marketRate;
      });

      // Allocate cost to each recovered metal proportionally
      if (totalOutputsMarketValuation > 0) {
        batch.recoveredOutputs.forEach((out) => {
          const marketValue = out.weightKg * (out.estimatedMarketRatePerKg || 100);
          const relativeShare = marketValue / totalOutputsMarketValuation;
          const allocatedCostToOutput = totalBatchCost * relativeShare;
          const batchUnitCostPerKg =
            out.weightKg > 0 ? allocatedCostToOutput / out.weightKg : 0;

          // Merge into item's continuous WAC
          const currentWac = wacMap.get(out.itemId) || batchUnitCostPerKg;
          const targetItem = items.find((i) => i.id === out.itemId);
          const existingStockKg = targetItem ? targetItem.currentStockKg : 1000;

          const updatedWac =
            (existingStockKg * currentWac + out.weightKg * batchUnitCostPerKg) /
            (existingStockKg + out.weightKg || 1);

          wacMap.set(out.itemId, Math.round(updatedWac * 100) / 100);
        });
      }
    });

  return wacMap;
};

/**
 * Generates the full Profit & Loss, Cost of Goods Sold, and Inventory Valuation report.
 */
export const generateProfitLossReport = (
  items: Item[],
  purchases: Purchase[],
  sales: Sale[],
  deliveries: Delivery[],
  batches: ProcessingBatch[],
  expenses: Expense[],
  payments: PaymentVoucher[],
  laborLogs: LaborLog[],
  suppliers: Supplier[],
  customers: Customer[],
  filter: DateFilterOptions
): ProfitLossReport => {
  // 1. Calculate accurate WAC for all items
  const wacMap = calculateAllItemsWAC(items, purchases, batches);

  // 2. Filter deliveries for COGS & Dispatched Revenue in the selected period
  const filteredDeliveries = deliveries.filter(
    (d) => isWithinDateRange(d.createdAt, filter) && d.status === 'received'
  );

  let totalSalesRevenue = 0;
  let totalCogs = 0;

  // Track item-level sales and COGS
  const itemDispatchesMap = new Map<
    string,
    { dispatchedKg: number; revenue: number; cogs: number }
  >();

  filteredDeliveries.forEach((del) => {
    del.deliveredItems.forEach((dItem) => {
      const itemWac = wacMap.get(dItem.itemId) || dItem.ratePerKg * 0.8;
      const revenue = dItem.amount;
      const cogs = dItem.weightKg * itemWac;

      totalSalesRevenue += revenue;
      totalCogs += cogs;

      const current = itemDispatchesMap.get(dItem.itemId) || {
        dispatchedKg: 0,
        revenue: 0,
        cogs: 0
      };
      itemDispatchesMap.set(dItem.itemId, {
        dispatchedKg: current.dispatchedKg + dItem.weightKg,
        revenue: current.revenue + revenue,
        cogs: current.cogs + cogs
      });
    });
  });

  const grossProfit = totalSalesRevenue - totalCogs;
  const grossMarginPct =
    totalSalesRevenue > 0 ? (grossProfit / totalSalesRevenue) * 100 : 0;

  // 3. Operating Expenses (Period Costs) within date range
  // Exclude freight that was already capitalized into purchase WAC to avoid double counting!
  const filteredExpenses = expenses.filter((e) => isWithinDateRange(e.createdAt, filter));

  const opEx = {
    godownRent: 0,
    electricity: 0,
    dieselGenerator: 0,
    equipmentMaintenance: 0,
    deliveryFreight: 0,
    laborTeaFood: 0,
    officeStationery: 0,
    misc: 0,
    total: 0
  };

  filteredExpenses.forEach((exp) => {
    // If expense is already capitalized in a batch or landed purchase, we don't count it twice in overhead
    if (exp.expenseType === 'direct_processing') {
      return; // Already capitalized in ProcessingBatch cost
    }

    switch (exp.category) {
      case 'godown_rent':
        opEx.godownRent += exp.amount;
        break;
      case 'electricity':
        opEx.electricity += exp.amount;
        break;
      case 'diesel_generator':
        opEx.dieselGenerator += exp.amount;
        break;
      case 'equipment_maintenance':
        opEx.equipmentMaintenance += exp.amount;
        break;
      case 'freight':
        // Outgoing delivery freight
        opEx.deliveryFreight += exp.amount;
        break;
      case 'labor_tea_food':
        opEx.laborTeaFood += exp.amount;
        break;
      case 'office_stationery':
        opEx.officeStationery += exp.amount;
        break;
      case 'misc':
      default:
        opEx.misc += exp.amount;
        break;
    }
  });

  opEx.total =
    opEx.godownRent +
    opEx.electricity +
    opEx.dieselGenerator +
    opEx.equipmentMaintenance +
    opEx.deliveryFreight +
    opEx.laborTeaFood +
    opEx.officeStationery +
    opEx.misc;

  const netProfit = grossProfit - opEx.total;
  const netMarginPct =
    totalSalesRevenue > 0 ? (netProfit / totalSalesRevenue) * 100 : 0;

  // 4. Inventory Valuation & Unrealized Profit on unsold stock
  let totalInventoryValuationWac = 0;
  let totalInventoryMarketValue = 0;
  let totalUnrealizedProfitOnStock = 0;

  const itemBreakdown: InventoryCostingItem[] = items.map((item) => {
    const wac = wacMap.get(item.id) || item.avgPurchasePricePerKg;
    const currentStockKg = item.currentStockKg;
    const currentStockTons = currentStockKg / 1000;
    const totalValuationWac = currentStockKg * wac;

    // Approximate current selling market rate (e.g. Copper ~2,750, Iron ~165, Alu ~620)
    let marketRate = item.avgPurchasePricePerKg * 1.25;
    if (item.metalType === 'copper') marketRate = 2750;
    else if (item.metalType === 'iron') marketRate = 165;
    else if (item.metalType === 'aluminum') marketRate = 620;
    else if (item.metalType === 'brass') marketRate = 1850;
    else if (item.metalType === 'silver') marketRate = 3200;
    else if (item.metalType === 'steel') marketRate = 420;
    else if (item.metalType === 'plastic') marketRate = 85;

    const totalMarketValuation = currentStockKg * marketRate;
    const unrealizedProfitLoss = totalMarketValuation - totalValuationWac;

    totalInventoryValuationWac += totalValuationWac;
    totalInventoryMarketValue += totalMarketValuation;
    totalUnrealizedProfitOnStock += unrealizedProfitLoss;

    const dispatchInfo = itemDispatchesMap.get(item.id) || {
      dispatchedKg: 0,
      revenue: 0,
      cogs: 0
    };

    const itemGrossProfit = dispatchInfo.revenue - dispatchInfo.cogs;
    const itemMargin =
      dispatchInfo.revenue > 0 ? (itemGrossProfit / dispatchInfo.revenue) * 100 : 0;

    return {
      itemId: item.id,
      nameUrdu: item.nameUrdu,
      nameEng: item.nameEng,
      category: item.category,
      metalType: item.metalType,
      currentStockKg,
      currentStockTons: Math.round(currentStockTons * 100) / 100,
      wacPerKg: Math.round(wac * 100) / 100,
      totalValuationWac: Math.round(totalValuationWac),
      marketRatePerKg: marketRate,
      totalMarketValuation: Math.round(totalMarketValuation),
      unrealizedProfitLoss: Math.round(unrealizedProfitLoss),
      dispatchedKg: dispatchInfo.dispatchedKg,
      salesRevenue: dispatchInfo.revenue,
      cogsAmount: Math.round(dispatchInfo.cogs),
      realizedGrossProfit: Math.round(itemGrossProfit),
      grossMarginPct: Math.round(itemMargin * 10) / 10
    };
  });

  // 5. Working Capital (Receivables & Payables)
  const customerReceivables = customers.reduce((sum, c) => sum + (c.currentBalance || 0), 0);
  const supplierPayables = suppliers.reduce((sum, s) => sum + (s.currentBalance || 0), 0);

  // Contractor & Labor payables
  const laborContractorPayables = laborLogs.reduce(
    (sum, l) => sum + (l.outstandingAmount || 0),
    0
  );

  const netWorkingCapital =
    totalInventoryValuationWac + customerReceivables - supplierPayables - laborContractorPayables;

  // 6. Cash Flow Side-by-Side (Distinguishing Cash vs Accrual)
  const filteredPayments = payments.filter((p) => isWithinDateRange(p.createdAt, filter));

  let cashFromCustomers = 0;
  let cashToSuppliers = 0;
  let cashToLabor = 0;
  let cashForExpenses = 0;

  filteredPayments.forEach((p) => {
    if (p.isReversal) return;

    if (p.type === 'customer_receipt') {
      cashFromCustomers += p.amount;
    } else if (p.type === 'supplier_payment') {
      cashToSuppliers += p.amount;
    } else if (p.type === 'labor_payment') {
      cashToLabor += p.amount;
    } else if (p.type === 'expense_payment') {
      cashForExpenses += p.amount;
    }
  });

  // Add operational cash expenses paid directly
  filteredExpenses
    .filter((e) => e.paymentMode === 'cash' || e.paymentMode === 'bank_transfer')
    .forEach((e) => {
      // Avoid double counting if already in payment vouchers
      const isAlreadyInPayments = filteredPayments.some(
        (p) => p.type === 'expense_payment' && p.amount === e.amount
      );
      if (!isAlreadyInPayments) {
        cashForExpenses += e.amount;
      }
    });

  const netOperatingCashFlow =
    cashFromCustomers - (cashToSuppliers + cashToLabor + cashForExpenses);

  // Period label
  let periodLabel = 'تمام مالیاتی ریکارڈ (All Time)';
  if (filter.period === 'today') periodLabel = 'آج کا مالیاتی گوشوارہ (Today)';
  else if (filter.period === 'month') periodLabel = 'موجودہ ماہانہ نفع و نقصان (Current Month)';
  else if (filter.period === 'year') periodLabel = 'سالانہ مالیاتی گوشوارہ (Fiscal Year)';
  else if (filter.period === 'custom') {
    periodLabel = `حسبِ منشاء مدت: ${filter.startDate || 'ابتداء'} تا ${filter.endDate || 'آج'}`;
  }

  return {
    periodLabel,
    startDate: filter.startDate || '',
    endDate: filter.endDate || '',
    salesRevenue: Math.round(totalSalesRevenue),
    cogs: Math.round(totalCogs),
    grossProfit: Math.round(grossProfit),
    grossMarginPct: Math.round(grossMarginPct * 10) / 10,
    operatingExpenses: {
      godownRent: Math.round(opEx.godownRent),
      electricity: Math.round(opEx.electricity),
      dieselGenerator: Math.round(opEx.dieselGenerator),
      equipmentMaintenance: Math.round(opEx.equipmentMaintenance),
      deliveryFreight: Math.round(opEx.deliveryFreight),
      laborTeaFood: Math.round(opEx.laborTeaFood),
      officeStationery: Math.round(opEx.officeStationery),
      misc: Math.round(opEx.misc),
      total: Math.round(opEx.total)
    },
    netProfit: Math.round(netProfit),
    netMarginPct: Math.round(netMarginPct * 10) / 10,
    realizedProfit: Math.round(netProfit),
    unrealizedProfitOnStock: Math.round(totalUnrealizedProfitOnStock),
    totalEconomicGain: Math.round(netProfit + totalUnrealizedProfitOnStock),
    totalInventoryValuationWac: Math.round(totalInventoryValuationWac),
    totalInventoryMarketValue: Math.round(totalInventoryMarketValue),
    customerReceivables: Math.round(customerReceivables),
    supplierPayables: Math.round(supplierPayables),
    laborContractorPayables: Math.round(laborContractorPayables),
    netWorkingCapital: Math.round(netWorkingCapital),
    cashFlow: {
      cashFromCustomers: Math.round(cashFromCustomers),
      cashToSuppliers: Math.round(cashToSuppliers),
      cashToLabor: Math.round(cashToLabor),
      cashForExpenses: Math.round(cashForExpenses),
      netOperatingCashFlow: Math.round(netOperatingCashFlow)
    },
    itemBreakdown
  };
};
