import React, { createContext, useContext, useState, useEffect } from 'react';
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
  AuditLog,
  PrintableSlipData,
  StockMovementLog,
  StockMovementType,
  StockAdjustment
} from '../types';
import {
  INITIAL_SUPPLIERS,
  INITIAL_CUSTOMERS,
  INITIAL_ITEMS,
  INITIAL_PURCHASES,
  INITIAL_SALES,
  INITIAL_DELIVERIES,
  INITIAL_PROCESSING,
  INITIAL_LABORERS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_STOCK_MOVEMENTS
} from '../lib/db';
import { saveDocument, removeDocument } from '../lib/firestoreService';
import { useAuth } from './AuthContext';

interface DataContextType {
  suppliers: Supplier[];
  customers: Customer[];
  items: Item[];
  purchases: Purchase[];
  sales: Sale[];
  deliveries: Delivery[];
  processingBatches: ProcessingBatch[];
  laborers: Laborer[];
  laborLogs: LaborLog[];
  payments: PaymentVoucher[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  stockMovements: StockMovementLog[];

  // Data mutations
  addSupplier: (sup: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;

  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => void;
  addProcessingBatch: (batch: Omit<ProcessingBatch, 'id' | 'createdAt'>) => void;
  addLaborer: (laborer: Omit<Laborer, 'id' | 'createdAt'>) => void;
  addLaborLog: (log: Omit<LaborLog, 'id' | 'createdAt'>) => void;
  addPaymentVoucher: (voucher: Omit<PaymentVoucher, 'id' | 'createdAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addStockAdjustment: (adjData: { itemId: string; physicalWeightKg: number; reason: string }) => void;
  reversePaymentVoucher: (voucherId: string, reason: string) => void;
  cancelPurchase: (purchaseId: string, reason: string) => boolean;
  cancelSale: (saleId: string, reason: string) => boolean;
  cancelDelivery: (deliveryId: string, reason: string) => boolean;

  // Utilities
  recordAuditLog: (action: AuditLog['action'], module: AuditLog['module'], details: string) => void;
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => boolean;

  // Print Modal
  printableSlip: PrintableSlipData | null;
  setPrintableSlip: (slip: PrintableSlipData | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'albaraka_godown_v2_data';

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [processingBatches, setProcessingBatches] = useState<ProcessingBatch[]>([]);
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [laborLogs, setLaborLogs] = useState<LaborLog[]>([]);
  const [payments, setPayments] = useState<PaymentVoucher[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovementLog[]>([]);

  const [printableSlip, setPrintableSlip] = useState<PrintableSlipData | null>(null);

  // Load initial state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSuppliers(parsed.suppliers || INITIAL_SUPPLIERS);
        setCustomers(parsed.customers || INITIAL_CUSTOMERS);
        setItems(parsed.items || INITIAL_ITEMS);
        setPurchases(parsed.purchases || INITIAL_PURCHASES);
        setSales(parsed.sales || INITIAL_SALES);
        setDeliveries(parsed.deliveries || INITIAL_DELIVERIES);
        setProcessingBatches(parsed.processingBatches || INITIAL_PROCESSING);
        setLaborers(parsed.laborers || INITIAL_LABORERS);
        setLaborLogs(parsed.laborLogs || []);
        setPayments(parsed.payments || INITIAL_PAYMENTS);
        setExpenses(parsed.expenses || INITIAL_EXPENSES);
        setAuditLogs(parsed.auditLogs || INITIAL_AUDIT_LOGS);
        setStockMovements(parsed.stockMovements || INITIAL_STOCK_MOVEMENTS);
      } else {
        loadDefaults();
      }
    } catch (e) {
      loadDefaults();
    }
  }, []);

  const loadDefaults = () => {
    setSuppliers(INITIAL_SUPPLIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setItems(INITIAL_ITEMS);
    setPurchases(INITIAL_PURCHASES);
    setSales(INITIAL_SALES);
    setDeliveries(INITIAL_DELIVERIES);
    setProcessingBatches(INITIAL_PROCESSING);
    setLaborers(INITIAL_LABORERS);
    setLaborLogs([]);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
  };

  // Sync state to local storage
  useEffect(() => {
    const payload = {
      suppliers,
      customers,
      items,
      purchases,
      sales,
      deliveries,
      processingBatches,
      laborers,
      laborLogs,
      payments,
      expenses,
      auditLogs,
      stockMovements
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Local storage sync error:', err);
    }
  }, [
    suppliers,
    customers,
    items,
    purchases,
    sales,
    deliveries,
    processingBatches,
    laborers,
    laborLogs,
    payments,
    expenses,
    auditLogs,
    stockMovements
  ]);

  const recordAuditLog = (
    action: AuditLog['action'],
    module: AuditLog['module'],
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: userProfile?.uid || 'anon',
      userName: userProfile?.displayName || 'System User',
      userRole: userProfile?.role || 'employee',
      action,
      module,
      details,
      timestamp: new Date().toISOString()
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    saveDocument('audit_logs', newLog).catch(() => {});
  };

  // Record Immutable Stock Movement Log
  const recordStockMovementLog = (
    logData: Omit<StockMovementLog, 'id' | 'movementNo' | 'createdAt'>
  ) => {
    const newLog: StockMovementLog = {
      ...logData,
      id: `stk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      movementNo: `STK-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString()
    };
    setStockMovements((prev) => [newLog, ...prev]);
    saveDocument('stock_movements', newLog).catch(() => {});
  };

  // Add Supplier
  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...supData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setSuppliers((prev) => [newSup, ...prev]);
    saveDocument('suppliers', newSup).catch(() => {});
    recordAuditLog('CREATE', 'LEDGER', `نیا سپلائر شامل کیا گیا: ${newSup.name} (${newSup.city})`);
  };

  const updateSupplier = (id: string, supData: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...supData };
          saveDocument('suppliers', updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );
    recordAuditLog('UPDATE', 'LEDGER', `سپلائر اپڈیٹ ہوا: ID ${id}`);
  };

  // Add Customer
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setCustomers((prev) => [newCust, ...prev]);
    saveDocument('customers', newCust).catch(() => {});
    recordAuditLog('CREATE', 'LEDGER', `نیا کسٹمر مل شامل کیا گیا: ${newCust.name} (${newCust.city})`);
  };

  const updateCustomer = (id: string, custData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...custData };
          saveDocument('customers', updated).catch(() => {});
          return updated;
        }
        return c;
      })
    );
    recordAuditLog('UPDATE', 'LEDGER', `کسٹمر اپڈیٹ ہوا: ID ${id}`);
  };

  // Add Item
  const addItem = (itemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...itemData,
      id: `item-${Date.now()}`
    };
    setItems((prev) => [...prev, newItem]);
    saveDocument('items', newItem).catch(() => {});

    if (newItem.currentStockKg > 0) {
      recordStockMovementLog({
        itemId: newItem.id,
        itemNameUrdu: newItem.nameUrdu,
        itemNameEng: newItem.nameEng,
        type: 'authorized_adjustment',
        direction: 'in',
        weightKg: newItem.currentStockKg,
        unitCostPerKg: newItem.avgPurchasePricePerKg,
        totalValuation: newItem.currentStockKg * newItem.avgPurchasePricePerKg,
        balanceAfterKg: newItem.currentStockKg,
        storageLocation: newItem.storageLocation || 'گودام Main',
        referenceType: 'adjustment',
        referenceNo: 'INIT-BAL',
        notes: 'ابتدائی ذخیرہ برائے نیا آئٹم',
        createdBy: userProfile?.displayName || 'System'
      });
    }

    recordAuditLog('CREATE', 'SYSTEM', `نیا آئٹم شامل ہوا: ${newItem.nameUrdu}`);
  };

  const updateItem = (id: string, itemData: Partial<Item>) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...itemData };
          saveDocument('items', updated).catch(() => {});
          return updated;
        }
        return i;
      })
    );
  };

  // Add Purchase Record (Incoming Vehicle Weighment)
  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const isDuplicate = purchases.some(
      (p) => p.purchaseNo === purchaseData.purchaseNo || p.weighmentSlipNo === purchaseData.weighmentSlipNo
    );
    if (isDuplicate) {
      console.warn('Duplicate purchase voucher attempt blocked:', purchaseData.purchaseNo);
      return;
    }

    const newPurchase: Purchase = {
      ...purchaseData,
      id: `pur-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    setPurchases((prev) => [newPurchase, ...prev]);
    saveDocument('purchases', newPurchase).catch(() => {});

    // 1. Update Inventory Stocks & Record Movements for all materials
    setItems((prev) => {
      let updatedItems = [...prev];
      newPurchase.items.forEach((pItem) => {
        updatedItems = updatedItems.map((item) => {
          if (item.id === pItem.itemId) {
            const newWeight = item.currentStockKg + pItem.weightKg;
            const oldVal = item.currentStockKg * item.avgPurchasePricePerKg;
            const newVal = pItem.weightKg * pItem.ratePerKg;
            const newAvgPrice = newWeight > 0 ? (oldVal + newVal) / newWeight : item.avgPurchasePricePerKg;
            const updatedItem = {
              ...item,
              currentStockKg: newWeight,
              avgPurchasePricePerKg: Math.round(newAvgPrice)
            };
            saveDocument('items', updatedItem).catch(() => {});

            // Record Movement Log
            recordStockMovementLog({
              itemId: item.id,
              itemNameUrdu: pItem.itemNameUrdu,
              itemNameEng: pItem.itemNameEng,
              type: 'purchase_receipt',
              direction: 'in',
              weightKg: pItem.weightKg,
              unitCostPerKg: pItem.ratePerKg,
              totalValuation: pItem.totalAmount,
              balanceAfterKg: newWeight,
              storageLocation: item.storageLocation || 'گودام Main',
              referenceType: 'purchase',
              referenceNo: newPurchase.purchaseNo,
              notes: `آمد سکریپ گاڑی ${newPurchase.vehicleNo} (پرچی #${newPurchase.weighmentSlipNo})`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return updatedItem;
          }
          return item;
        });
      });
      return updatedItems;
    });

    // 2. Update Supplier Payable Balance
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === newPurchase.supplierId) {
          const netAddedToLedger = newPurchase.totalAmount - newPurchase.paidAmount;
          const updatedSup = {
            ...sup,
            currentBalance: sup.currentBalance + netAddedToLedger
          };
          saveDocument('suppliers', updatedSup).catch(() => {});
          return updatedSup;
        }
        return sup;
      })
    );

    // 3. Record Cashbook Voucher if paid spot
    if (newPurchase.paidAmount > 0) {
      const newPayment: PaymentVoucher = {
        id: `pay-${Date.now()}`,
        voucherNo: `VCH-${Date.now().toString().slice(-4)}`,
        type: 'supplier_payment',
        partyType: 'supplier',
        partyId: newPurchase.supplierId,
        partyName: newPurchase.supplierName,
        paymentMode: newPurchase.paymentMode === 'bank_transfer' ? 'bank_transfer' : 'cash',
        amount: newPurchase.paidAmount,
        description: `خریداری واؤچر ${newPurchase.purchaseNo} (پرچی ${newPurchase.weighmentSlipNo}) کے برعکس ادائیگی`,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [newPayment, ...prev]);
      saveDocument('payments', newPayment).catch(() => {});
    }

    recordAuditLog(
      'WEIGHMENT',
      'PURCHASE',
      `آمد سکریپ گاڑی ${newPurchase.purchaseNo}: گاڑی ${newPurchase.vehicleNo}، صافی وزن ${newPurchase.finalPayableWeight} کلو، کل بل ${newPurchase.totalAmount} روپے`
    );
  };

  // Add Processing Batch
  const addProcessingBatch = (batchData: Omit<ProcessingBatch, 'id' | 'createdAt'>) => {
    const isDuplicate = processingBatches.some((b) => b.batchNo === batchData.batchNo);
    if (isDuplicate) {
      console.warn('Duplicate processing batch attempt blocked:', batchData.batchNo);
      return;
    }

    const newBatch: ProcessingBatch = {
      ...batchData,
      id: `prc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    setProcessingBatches((prev) => [newBatch, ...prev]);
    saveDocument('processing', newBatch).catch(() => {});

    // Stock Transfer: Decrement Raw Scrap Stock & Increment Recovered Metal Stock
    setItems((prev) => {
      let updated = [...prev];

      // 1. Decrement Raw Scrap consumed
      newBatch.rawInputs.forEach((input) => {
        updated = updated.map((item) => {
          if (item.id === input.itemId) {
            const newStock = Math.max(0, item.currentStockKg - input.weightKg);
            const u = {
              ...item,
              currentStockKg: newStock
            };
            saveDocument('items', u).catch(() => {});

            // Record Movement Log
            recordStockMovementLog({
              itemId: input.itemId,
              itemNameUrdu: input.itemNameUrdu,
              itemNameEng: input.itemNameEng,
              type: 'processing_consumption',
              direction: 'out',
              weightKg: input.weightKg,
              unitCostPerKg: input.unitCostPerKg,
              totalValuation: input.totalInputCost,
              balanceAfterKg: newStock,
              storageLocation: item.storageLocation || 'گودام Main',
              referenceType: 'processing',
              referenceNo: newBatch.batchNo,
              notes: `سکریپ کٹائی بیچ ${newBatch.batchNo} میں استعمال`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return u;
          }
          return item;
        });
      });

      // 2. Increment Recovered Pure Metals yielded
      newBatch.recoveredOutputs.forEach((output) => {
        updated = updated.map((item) => {
          if (item.id === output.itemId) {
            const newStock = item.currentStockKg + output.weightKg;
            const u = {
              ...item,
              currentStockKg: newStock
            };
            saveDocument('items', u).catch(() => {});

            // Record Movement Log
            recordStockMovementLog({
              itemId: output.itemId,
              itemNameUrdu: output.itemNameUrdu,
              itemNameEng: output.itemNameEng,
              type: 'metal_recovery',
              direction: 'in',
              weightKg: output.weightKg,
              unitCostPerKg: output.estimatedMarketRatePerKg,
              totalValuation: output.totalValuation,
              balanceAfterKg: newStock,
              storageLocation: output.storageLocation || item.storageLocation || 'گودام Main',
              referenceType: 'processing',
              referenceNo: newBatch.batchNo,
              notes: `سکریپ کٹائی بیچ ${newBatch.batchNo} سے ریکور شدہ خالص میٹل`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return u;
          }
          return item;
        });
      });

      return updated;
    });

    // Record operating expenses if any
    const totalOps =
      (newBatch.gasCylinderExpense || 0) +
      (newBatch.cuttingBladesExpense || 0) +
      (newBatch.electricityPowerExpense || 0) +
      (newBatch.otherExpenses || 0);

    if (totalOps > 0) {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        expenseNo: `EXP-${Date.now().toString().slice(-4)}`,
        category: 'equipment_maintenance',
        amount: totalOps,
        paymentMode: 'cash',
        paidTo: 'کٹائی و آلات سپلائر',
        description: `پروسیسنگ بیچ ${newBatch.batchNo} کے گیس سلنڈر و کٹر آلات اخراجات`,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setExpenses((prev) => [newExp, ...prev]);
      saveDocument('expenses', newExp).catch(() => {});
    }

    recordAuditLog(
      'CREATE',
      'PROCESSING',
      `سکریپ کٹائی بیچ ${newBatch.batchNo}: خام وزن ${newBatch.totalRawWeightKg} کلو -> ریکور شدہ خالص میٹلز ${newBatch.totalRecoveredWeightKg} کلو (ریکوری ${newBatch.recoveryPercentage}%)`
    );
  };

  // Add Sale
  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setSales((prev) => [newSale, ...prev]);
    saveDocument('sales', newSale).catch(() => {});

    // Reserve stock for all ordered items
    setItems((prev) =>
      prev.map((i) => {
        const match = newSale.items.find((si) => si.itemId === i.id);
        if (match) {
          const u = {
            ...i,
            reservedStockKg: (i.reservedStockKg || 0) + match.orderedQtyKg
          };
          saveDocument('items', u).catch(() => {});
          return u;
        }
        return i;
      })
    );

    // If advance payment made on order, post payment voucher & update customer balance
    if (newSale.paidAmount > 0) {
      const newPayment: PaymentVoucher = {
        id: `pay-${Date.now()}`,
        voucherNo: `VCH-${Date.now().toString().slice(-4)}`,
        type: 'customer_receipt',
        partyType: 'customer',
        partyId: newSale.customerId,
        partyName: newSale.customerName,
        paymentMode: 'cash',
        amount: newSale.paidAmount,
        description: `میٹل سیلز آرڈر ${newSale.saleNo} ایڈوانس وصولی`,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [newPayment, ...prev]);
      saveDocument('payments', newPayment).catch(() => {});

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            const u = { ...c, currentBalance: c.currentBalance - newSale.paidAmount };
            saveDocument('customers', u).catch(() => {});
            return u;
          }
          return c;
        })
      );
    }

    recordAuditLog(
      'CREATE',
      'SALE',
      `نیا سیلز آرڈر ${newSale.saleNo} کسٹمر ${newSale.customerName}: کل رقم ${newSale.totalAmount} روپے`
    );
  };

  // Add Delivery (Dispatch Chalan)
  const addDelivery = (deliveryData: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDel: Delivery = {
      ...deliveryData,
      id: `del-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    setDeliveries((prev) => [newDel, ...prev]);
    saveDocument('deliveries', newDel).catch(() => {});

    // 1. Update Sale record: update deliveredQtyKg for matching items & update deliveryStatus
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === newDel.saleId) {
          const updatedItems = s.items.map((sItem) => {
            const matchedDeliveryItem = newDel.deliveredItems.find((di) => di.itemId === sItem.itemId);
            if (matchedDeliveryItem) {
              return {
                ...sItem,
                deliveredQtyKg: (sItem.deliveredQtyKg || 0) + matchedDeliveryItem.weightKg
              };
            }
            return sItem;
          });

          const totalOrdered = updatedItems.reduce((acc, i) => acc + (i.orderedQtyKg || 0), 0);
          const totalDelivered = updatedItems.reduce((acc, i) => acc + (i.deliveredQtyKg || 0), 0);

          let newDeliveryStatus: Sale['deliveryStatus'] = 'pending';
          if (totalDelivered >= totalOrdered && totalOrdered > 0) {
            newDeliveryStatus = 'fully_delivered';
          } else if (totalDelivered > 0) {
            newDeliveryStatus = 'partial_delivered';
          }

          const updatedSale = {
            ...s,
            items: updatedItems,
            deliveryStatus: newDeliveryStatus
          };
          saveDocument('sales', updatedSale).catch(() => {});
          return updatedSale;
        }
        return s;
      })
    );

    // 2. Decrement physical stock (currentStockKg) and release reserved stock (reservedStockKg)
    setItems((prev) => {
      let updated = [...prev];
      newDel.deliveredItems.forEach((dItem) => {
        updated = updated.map((item) => {
          if (item.id === dItem.itemId) {
            const newStock = Math.max(0, item.currentStockKg - dItem.weightKg);
            const newReserved = Math.max(0, (item.reservedStockKg || 0) - dItem.weightKg);
            const u = {
              ...item,
              currentStockKg: newStock,
              reservedStockKg: newReserved
            };
            saveDocument('items', u).catch(() => {});

            // Record Stock Movement
            recordStockMovementLog({
              itemId: item.id,
              itemNameUrdu: dItem.itemNameUrdu,
              itemNameEng: dItem.itemNameEng,
              type: 'sale_dispatch',
              direction: 'out',
              weightKg: dItem.weightKg,
              unitCostPerKg: dItem.ratePerKg,
              totalValuation: dItem.amount,
              balanceAfterKg: newStock,
              storageLocation: item.storageLocation || 'گودام Main',
              referenceType: 'delivery',
              referenceNo: newDel.deliveryNo,
              notes: `روانگی چالان ${newDel.deliveryNo} (گاڑی ${newDel.vehicleNo}) کسٹمر ${newDel.customerName} برائے آرڈر ${newDel.saleNo}`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return u;
          }
          return item;
        });
      });
      return updated;
    });

    // 3. Post delivered bill to Customer Ledger
    const deliveredBillAmount = newDel.deliveredItems.reduce((acc, i) => acc + i.amount, 0);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newDel.customerId) {
          const u = {
            ...c,
            currentBalance: c.currentBalance + deliveredBillAmount
          };
          saveDocument('customers', u).catch(() => {});
          return u;
        }
        return c;
      })
    );

    recordAuditLog(
      'WEIGHMENT',
      'DELIVERY',
      `مال روانگی چالان ${newDel.deliveryNo}: گاڑی ${newDel.vehicleNo}، صافی وزن ${newDel.netWeight} کلو کسٹمر ${newDel.customerName}`
    );
  };

  // Safe Purchase Cancellation (Reverses stock and supplier balance)
  const cancelPurchase = (purchaseId: string, reason: string): boolean => {
    const target = purchases.find((p) => p.id === purchaseId);
    if (!target) return false;
    if (target.status === 'cancelled') {
      alert('یہ خریداری واؤچر پہلے ہی منسوخ شدہ ہے۔');
      return false;
    }

    // 1. Reverse Inventory Stock
    setItems((prev) => {
      let updated = [...prev];
      target.items.forEach((pItem) => {
        updated = updated.map((item) => {
          if (item.id === pItem.itemId) {
            const newWeight = Math.max(0, item.currentStockKg - pItem.weightKg);
            const u = { ...item, currentStockKg: newWeight };
            saveDocument('items', u).catch(() => {});

            recordStockMovementLog({
              itemId: item.id,
              itemNameUrdu: pItem.itemNameUrdu,
              itemNameEng: pItem.itemNameEng,
              type: 'purchase_cancellation',
              direction: 'out',
              weightKg: pItem.weightKg,
              unitCostPerKg: pItem.ratePerKg,
              totalValuation: pItem.totalAmount,
              balanceAfterKg: newWeight,
              storageLocation: item.storageLocation || 'گودام Main',
              referenceType: 'purchase',
              referenceNo: target.purchaseNo,
              notes: `خریداری واؤچر ${target.purchaseNo} منسوخی برائے گاڑی ${target.vehicleNo} - وجہ: ${reason}`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return u;
          }
          return item;
        });
      });
      return updated;
    });

    // 2. Reverse Supplier Payable Balance
    setSuppliers((prev) =>
      prev.map((sup) => {
        if (sup.id === target.supplierId) {
          const netCredited = target.totalAmount - target.paidAmount;
          const u = { ...sup, currentBalance: Math.max(0, sup.currentBalance - netCredited) };
          saveDocument('suppliers', u).catch(() => {});
          return u;
        }
        return sup;
      })
    );

    // 3. If paidAmount was disbursed, create cash reversal voucher back to godown till
    if (target.paidAmount > 0) {
      const revVoucher: PaymentVoucher = {
        id: `rev-pur-${Date.now()}`,
        voucherNo: `REV-${Date.now().toString().slice(-4)}`,
        type: 'reversal',
        partyType: 'supplier',
        partyId: target.supplierId,
        partyName: target.supplierName,
        paymentMode: target.paymentMode === 'bank_transfer' ? 'bank_transfer' : 'cash',
        amount: target.paidAmount,
        description: `خریداری پرچی ${target.purchaseNo} منسوخی پر ادا شدہ نقد رقم واپسی کیش بُک میں جمع`,
        isReversal: true,
        reversalReason: reason,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [revVoucher, ...prev]);
      saveDocument('payments', revVoucher).catch(() => {});
    }

    // 4. Mark purchase as cancelled
    const updatedPurchase: Purchase = {
      ...target,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userProfile?.displayName || 'Munshi/Owner',
      cancellationReason: reason
    };
    setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? updatedPurchase : p)));
    saveDocument('purchases', updatedPurchase).catch(() => {});

    // 5. Audit Log
    recordAuditLog(
      'CANCEL',
      'PURCHASE',
      `خریداری واؤچر ${target.purchaseNo} (گاڑی ${target.vehicleNo}) منسوخ: کٹوتی اسٹاک و کھاتہ ریورسل - وجہ: ${reason}`
    );

    return true;
  };

  // Safe Sale Order Cancellation (Releases reserved stock)
  const cancelSale = (saleId: string, reason: string): boolean => {
    const target = sales.find((s) => s.id === saleId);
    if (!target) return false;
    if (target.status === 'cancelled') {
      alert('یہ سیلز آرڈر پہلے ہی منسوخ ہو چکا ہے۔');
      return false;
    }

    // Check if any deliveries are active for this sale
    const activeDeliveries = deliveries.filter((d) => d.saleId === saleId && d.status !== 'cancelled');
    if (activeDeliveries.length > 0) {
      alert(`اس آرڈر پر پہلے ہی ${activeDeliveries.length} روانگی چالان جاری ہیں۔ برائے مہربانی پہلے وہ چالان منسوخ کریں۔`);
      return false;
    }

    // Release reserved stock for all ordered items
    setItems((prev) =>
      prev.map((item) => {
        const match = target.items.find((si) => si.itemId === item.id);
        if (match) {
          const remainingToRelease = Math.max(0, (match.orderedQtyKg || 0) - (match.deliveredQtyKg || 0));
          const newReserved = Math.max(0, (item.reservedStockKg || 0) - remainingToRelease);
          const u = { ...item, reservedStockKg: newReserved };
          saveDocument('items', u).catch(() => {});
          return u;
        }
        return item;
      })
    );

    // If advance paidAmount was received, create a reversal cash voucher
    if (target.paidAmount > 0) {
      const revVoucher: PaymentVoucher = {
        id: `rev-sale-${Date.now()}`,
        voucherNo: `REV-${Date.now().toString().slice(-4)}`,
        type: 'reversal',
        partyType: 'customer',
        partyId: target.customerId,
        partyName: target.customerName,
        paymentMode: 'cash',
        amount: target.paidAmount,
        description: `سیلز آرڈر ${target.saleNo} منسوخی پر وصول شدہ ایڈوانس کی واپسی`,
        isReversal: true,
        reversalReason: reason,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [revVoucher, ...prev]);
      saveDocument('payments', revVoucher).catch(() => {});

      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === target.customerId) {
            const u = { ...c, currentBalance: c.currentBalance + target.paidAmount };
            saveDocument('customers', u).catch(() => {});
            return u;
          }
          return c;
        })
      );
    }

    const updatedSale: Sale = {
      ...target,
      status: 'cancelled',
      deliveryStatus: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userProfile?.displayName || 'Munshi/Owner',
      cancellationReason: reason
    };
    setSales((prev) => prev.map((s) => (s.id === saleId ? updatedSale : s)));
    saveDocument('sales', updatedSale).catch(() => {});

    recordAuditLog(
      'CANCEL',
      'SALE',
      `سیلز آرڈر ${target.saleNo} کسٹمر ${target.customerName} منسوخ: رزرویشن خارج - وجہ: ${reason}`
    );

    return true;
  };

  // Safe Delivery Chalan Cancellation (Restores dispatched stock back to godown)
  const cancelDelivery = (deliveryId: string, reason: string): boolean => {
    const target = deliveries.find((d) => d.id === deliveryId);
    if (!target) return false;
    if (target.status === 'cancelled') {
      alert('یہ چالان پہلے ہی منسوخ ہو چکا ہے۔');
      return false;
    }

    // 1. Restore physical inventory stock back into godown
    setItems((prev) => {
      let updated = [...prev];
      target.deliveredItems.forEach((dItem) => {
        updated = updated.map((item) => {
          if (item.id === dItem.itemId) {
            const newStock = item.currentStockKg + dItem.weightKg;
            const u = { ...item, currentStockKg: newStock };
            saveDocument('items', u).catch(() => {});

            recordStockMovementLog({
              itemId: item.id,
              itemNameUrdu: dItem.itemNameUrdu,
              itemNameEng: dItem.itemNameEng,
              type: 'delivery_cancellation',
              direction: 'in',
              weightKg: dItem.weightKg,
              unitCostPerKg: dItem.ratePerKg,
              totalValuation: dItem.amount,
              balanceAfterKg: newStock,
              storageLocation: item.storageLocation || 'گودام Main',
              referenceType: 'delivery',
              referenceNo: target.deliveryNo,
              notes: `روانگی چالان ${target.deliveryNo} منسوخی: مال گودام میں واپس جمع - وجہ: ${reason}`,
              createdBy: userProfile?.displayName || 'Munshi'
            });

            return u;
          }
          return item;
        });
      });
      return updated;
    });

    // 2. Adjust matching Sale order delivered quantities
    setSales((prev) =>
      prev.map((s) => {
        if (s.id === target.saleId) {
          const updatedItems = s.items.map((sItem) => {
            const matchedDeliveryItem = target.deliveredItems.find((di) => di.itemId === sItem.itemId);
            if (matchedDeliveryItem) {
              return {
                ...sItem,
                deliveredQtyKg: Math.max(0, (sItem.deliveredQtyKg || 0) - matchedDeliveryItem.weightKg)
              };
            }
            return sItem;
          });

          const totalOrdered = updatedItems.reduce((acc, i) => acc + (i.orderedQtyKg || 0), 0);
          const totalDelivered = updatedItems.reduce((acc, i) => acc + (i.deliveredQtyKg || 0), 0);

          let newDeliveryStatus: Sale['deliveryStatus'] = 'pending';
          if (totalDelivered >= totalOrdered && totalOrdered > 0) {
            newDeliveryStatus = 'fully_delivered';
          } else if (totalDelivered > 0) {
            newDeliveryStatus = 'partial_delivered';
          }

          const updatedSale = {
            ...s,
            items: updatedItems,
            deliveryStatus: newDeliveryStatus
          };
          saveDocument('sales', updatedSale).catch(() => {});
          return updatedSale;
        }
        return s;
      })
    );

    // 3. Reverse customer balance charge
    const deliveredBillAmount = target.deliveredItems.reduce((acc, i) => acc + i.amount, 0);
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === target.customerId) {
          const u = {
            ...c,
            currentBalance: Math.max(0, c.currentBalance - deliveredBillAmount)
          };
          saveDocument('customers', u).catch(() => {});
          return u;
        }
        return c;
      })
    );

    // 4. Mark delivery as cancelled
    const updatedDelivery: Delivery = {
      ...target,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userProfile?.displayName || 'Munshi/Owner',
      cancellationReason: reason
    };
    setDeliveries((prev) => prev.map((d) => (d.id === deliveryId ? updatedDelivery : d)));
    saveDocument('deliveries', updatedDelivery).catch(() => {});

    recordAuditLog(
      'CANCEL',
      'DELIVERY',
      `روانگی چالان ${target.deliveryNo} (گاڑی ${target.vehicleNo}) منسوخ: مال بحال و کھاتہ کٹوتی ریورس - وجہ: ${reason}`
    );

    return true;
  };


  // Authorized Stock Physical Reconciliation
  const addStockAdjustment = (adjData: {
    itemId: string;
    physicalWeightKg: number;
    reason: string;
  }) => {
    const targetItem = items.find((i) => i.id === adjData.itemId);
    if (!targetItem) return;

    const systemWeightKg = targetItem.currentStockKg;
    const varianceKg = adjData.physicalWeightKg - systemWeightKg;

    if (varianceKg === 0) return;

    const newStock = adjData.physicalWeightKg;

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === adjData.itemId) {
          const u = { ...i, currentStockKg: newStock };
          saveDocument('items', u).catch(() => {});
          return u;
        }
        return i;
      })
    );

    const isPositive = varianceKg > 0;
    recordStockMovementLog({
      itemId: targetItem.id,
      itemNameUrdu: targetItem.nameUrdu,
      itemNameEng: targetItem.nameEng,
      type: 'authorized_adjustment',
      direction: isPositive ? 'in' : 'out',
      weightKg: Math.abs(varianceKg),
      unitCostPerKg: targetItem.avgPurchasePricePerKg,
      totalValuation: Math.abs(varianceKg) * targetItem.avgPurchasePricePerKg,
      balanceAfterKg: newStock,
      storageLocation: targetItem.storageLocation || 'گودام Main',
      referenceType: 'adjustment',
      referenceNo: `ADJ-${Date.now().toString().slice(-4)}`,
      notes: `جسمانی آڈٹ ایڈجسٹمنٹ (${adjData.reason}) - فرق: ${varianceKg > 0 ? '+' : ''}${varianceKg} کلو`,
      createdBy: userProfile?.displayName || 'Owner/Munshi'
    });

    recordAuditLog(
      'UPDATE',
      'SYSTEM',
      `جسمانی آڈٹ اسٹاک ایڈجسٹمنٹ: ${targetItem.nameUrdu} (فرق ${varianceKg > 0 ? '+' : ''}${varianceKg} کلو) - وجہ: ${adjData.reason}`
    );
  };


  // Add Laborer
  const addLaborer = (labData: Omit<Laborer, 'id' | 'createdAt'>) => {
    const newLab: Laborer = {
      ...labData,
      id: `lab-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLaborers((prev) => [newLab, ...prev]);
    saveDocument('laborers', newLab).catch(() => {});
    recordAuditLog('CREATE', 'LABOR', `نیا مزدور / ٹھیکیدار شامل ہوا: ${newLab.name}`);
  };

  // Add Labor Log
  const addLaborLog = (logData: Omit<LaborLog, 'id' | 'createdAt'>) => {
    // Unique check to prevent duplicate labor payments
    const isDuplicate = laborLogs.some((l) => l.logVoucherNo === logData.logVoucherNo);
    if (isDuplicate) {
      console.warn('Duplicate labor log voucher attempt blocked:', logData.logVoucherNo);
      return;
    }

    const newLog: LaborLog = {
      ...logData,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    setLaborLogs((prev) => [newLog, ...prev]);
    saveDocument('labor_logs', newLog).catch(() => {});

    // Update Laborer Peshgi balance if deduction was applied
    if (newLog.peshgiDeduction > 0) {
      setLaborers((prev) =>
        prev.map((lab) => {
          if (lab.id === newLog.laborerId) {
            const u = {
              ...lab,
              currentPeshgiBalance: Math.max(0, lab.currentPeshgiBalance - newLog.peshgiDeduction)
            };
            saveDocument('laborers', u).catch(() => {});
            return u;
          }
          return lab;
        })
      );
    }

    // Post to Cashbook / Expense if paid cash on spot
    if (newLog.paidAmount > 0) {
      const newPayment: PaymentVoucher = {
        id: `pay-${Date.now()}`,
        voucherNo: `VCH-${Date.now().toString().slice(-4)}`,
        type: 'labor_payment',
        partyType: 'laborer',
        partyId: newLog.laborerId,
        partyName: newLog.laborerName,
        paymentMode: 'cash',
        amount: newLog.paidAmount,
        description: `مزدوری واؤچر ${newLog.logVoucherNo} (${newLog.workDescription}) کے برعکس نقد ادائیگی`,
        createdBy: userProfile?.displayName || 'Munshi',
        createdAt: new Date().toISOString()
      };
      setPayments((prev) => [newPayment, ...prev]);
      saveDocument('payments', newPayment).catch(() => {});
    }

    recordAuditLog(
      'CREATE',
      'LABOR',
      `مزدوری واؤچر ${newLog.logVoucherNo}: ${newLog.laborerName} (${newLog.type === 'contractor_thekedar' ? 'ٹھیکیدار' : 'دہاڑی'}) - کل مزدوری ${newLog.totalWages} روپے، صافی ادائیگی ${newLog.paidAmount} روپے`
    );
  };

  // Add Payment Voucher
  const addPaymentVoucher = (voucherData: Omit<PaymentVoucher, 'id' | 'createdAt'>) => {
    const newVoucher: PaymentVoucher = {
      ...voucherData,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };

    setPayments((prev) => [newVoucher, ...prev]);
    saveDocument('payments', newVoucher).catch(() => {});

    if (newVoucher.partyType === 'supplier' && newVoucher.partyId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newVoucher.partyId) {
            let balanceChange = -newVoucher.amount; // default payment reduces payable
            if (newVoucher.type === 'credit_note') {
              balanceChange = newVoucher.amount; // increases payable
            } else if (newVoucher.type === 'debit_note' || newVoucher.type === 'supplier_payment') {
              balanceChange = -newVoucher.amount;
            }
            const u = { ...s, currentBalance: s.currentBalance + balanceChange };
            saveDocument('suppliers', u).catch(() => {});
            return u;
          }
          return s;
        })
      );
    } else if (newVoucher.partyType === 'customer' && newVoucher.partyId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newVoucher.partyId) {
            let balanceChange = -newVoucher.amount; // default receipt reduces receivable
            if (newVoucher.type === 'debit_note') {
              balanceChange = newVoucher.amount; // increases receivable
            } else if (newVoucher.type === 'credit_note' || newVoucher.type === 'customer_receipt') {
              balanceChange = -newVoucher.amount;
            }
            const u = { ...c, currentBalance: c.currentBalance + balanceChange };
            saveDocument('customers', u).catch(() => {});
            return u;
          }
          return c;
        })
      );
    } else if (newVoucher.partyType === 'laborer' && newVoucher.partyId) {
      setLaborers((prev) =>
        prev.map((l) => {
          if (l.id === newVoucher.partyId) {
            const u = { ...l, currentPeshgiBalance: l.currentPeshgiBalance + newVoucher.amount };
            saveDocument('laborers', u).catch(() => {});
            return u;
          }
          return l;
        })
      );
    }

    recordAuditLog(
      'CREATE',
      'LEDGER',
      `واؤچر اندراج ${newVoucher.voucherNo} (${newVoucher.type}): پارٹی ${newVoucher.partyName} - رقم ${newVoucher.amount} روپے (${newVoucher.paymentMode})`
    );
  };

  // Payment Reversal (Audited Contra Entry instead of physical deletion)
  const reversePaymentVoucher = (voucherId: string, reason: string) => {
    const orig = payments.find((p) => p.id === voucherId);
    if (!orig) return;
    if (orig.isReversal) {
      alert('یہ واؤچر خود ایک واپسی اندراج ہے۔ اسے دوبارہ واپس نہیں کیا جا سکتا۔');
      return;
    }

    const alreadyReversed = payments.some((p) => p.reversedVoucherId === orig.id);
    if (alreadyReversed) {
      alert('یہ واؤچر پہلے ہی ریورس کیا جا چکا ہے۔');
      return;
    }

    const reversalVoucher: PaymentVoucher = {
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      voucherNo: `REV-${Date.now().toString().slice(-4)}`,
      type: 'reversal',
      partyType: orig.partyType,
      partyId: orig.partyId,
      partyName: orig.partyName,
      paymentMode: orig.paymentMode,
      bankName: orig.bankName,
      referenceNo: orig.voucherNo,
      allocatedInvoiceNo: orig.allocatedInvoiceNo,
      amount: orig.amount,
      description: `واپسی / منسوخی واؤچر ${orig.voucherNo}: ${reason}`,
      isReversal: true,
      reversedVoucherId: orig.id,
      reversalReason: reason,
      createdBy: userProfile?.displayName || 'Munshi/Owner',
      createdAt: new Date().toISOString()
    };

    setPayments((prev) => [reversalVoucher, ...prev]);
    saveDocument('payments', reversalVoucher).catch(() => {});

    // Reverse party balance adjustments
    if (orig.partyType === 'supplier' && orig.partyId) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === orig.partyId) {
            const diff = orig.type === 'supplier_payment' ? orig.amount : -orig.amount;
            const u = { ...s, currentBalance: s.currentBalance + diff };
            saveDocument('suppliers', u).catch(() => {});
            return u;
          }
          return s;
        })
      );
    } else if (orig.partyType === 'customer' && orig.partyId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === orig.partyId) {
            const diff = orig.type === 'customer_receipt' ? orig.amount : -orig.amount;
            const u = { ...c, currentBalance: c.currentBalance + diff };
            saveDocument('customers', u).catch(() => {});
            return u;
          }
          return c;
        })
      );
    } else if (orig.partyType === 'laborer' && orig.partyId) {
      setLaborers((prev) =>
        prev.map((l) => {
          if (l.id === orig.partyId) {
            const u = { ...l, currentPeshgiBalance: Math.max(0, l.currentPeshgiBalance - orig.amount) };
            saveDocument('laborers', u).catch(() => {});
            return u;
          }
          return l;
        })
      );
    }

    recordAuditLog(
      'UPDATE',
      'LEDGER',
      `مالیاتی واؤچر ریورسل اندراج ${reversalVoucher.voucherNo} برائے واؤچر ${orig.voucherNo} (رقم ${orig.amount} روپے) - وجہ: ${reason}`
    );
  };


  // Add Expense
  const addExpense = (expData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setExpenses((prev) => [newExp, ...prev]);
    saveDocument('expenses', newExp).catch(() => {});
    recordAuditLog('CREATE', 'EXPENSE', `گودام خرچہ اندراج ${newExp.expenseNo}: زمرہ ${newExp.category} - رقم ${newExp.amount} روپے`);
  };

  const resetToSampleData = () => {
    loadDefaults();
    recordAuditLog('RESTORE', 'SYSTEM', 'تمام گودام ڈیٹا ڈیمو بنیادی حالت پر ریسٹور کر دیا گیا');
  };

  const clearAllData = () => {
    setSuppliers([]);
    setCustomers([]);
    setPurchases([]);
    setSales([]);
    setDeliveries([]);
    setProcessingBatches([]);
    setLaborers([]);
    setLaborLogs([]);
    setPayments([]);
    setExpenses([]);
    setAuditLogs([]);
    setStockMovements([]);
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        currentStockKg: 0,
        reservedStockKg: 0,
        damagedWasteKg: 0
      }))
    );
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          suppliers: [],
          customers: [],
          items: items.map((i) => ({ ...i, currentStockKg: 0, reservedStockKg: 0, damagedWasteKg: 0 })),
          purchases: [],
          sales: [],
          deliveries: [],
          processingBatches: [],
          laborers: [],
          laborLogs: [],
          payments: [],
          expenses: [],
          auditLogs: [],
          stockMovements: []
        })
      );
    } catch (e) {}
    recordAuditLog('DELETE', 'SYSTEM', 'تمام جعلی و نمونہ ڈیٹا کامیابی سے صاف کر دیا گیا');
  };

  const exportBackupJson = () => {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      suppliers,
      customers,
      items,
      purchases,
      sales,
      deliveries,
      processingBatches,
      laborers,
      laborLogs,
      payments,
      expenses,
      auditLogs,
      stockMovements
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AlBaraka_Godown_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    recordAuditLog('BACKUP', 'SYSTEM', 'مکمل گودام ڈیٹا بیس بیک اپ JSON فائل کامیابی سے ایکسپورٹ کی گئی');
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.suppliers && data.items) {
        setSuppliers(data.suppliers || []);
        setCustomers(data.customers || []);
        setItems(data.items || []);
        setPurchases(data.purchases || []);
        setSales(data.sales || []);
        setDeliveries(data.deliveries || []);
        setProcessingBatches(data.processingBatches || []);
        setLaborers(data.laborers || []);
        setLaborLogs(data.laborLogs || []);
        setPayments(data.payments || []);
        setExpenses(data.expenses || []);
        setAuditLogs(data.auditLogs || []);
        setStockMovements(data.stockMovements || []);
        recordAuditLog('RESTORE', 'SYSTEM', 'ڈیٹا بیس بیک اپ JSON فائل سے کامیابی سے ریسٹور کیا گیا');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        suppliers,
        customers,
        items,
        purchases,
        sales,
        deliveries,
        processingBatches,
        laborers,
        laborLogs,
        payments,
        expenses,
        auditLogs,
        stockMovements,

        addSupplier,
        updateSupplier,
        addCustomer,
        updateCustomer,
        addItem,
        updateItem,
        addPurchase,
        addSale,
        addDelivery,
        addProcessingBatch,
        addLaborer,
        addLaborLog,
        addPaymentVoucher,
        reversePaymentVoucher,
        cancelPurchase,
        cancelSale,
        cancelDelivery,
        addExpense,
        addStockAdjustment,

        recordAuditLog,
        resetToSampleData,
        clearAllData,
        exportBackupJson,
        importBackupJson,

        printableSlip,
        setPrintableSlip
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
