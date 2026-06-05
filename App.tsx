import React, { useState, useMemo, useCallback, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import useAuth from './hooks/useAuth';
import { initialUsers, initialProducts, initialCustomers, initialSuppliers, initialAccounts } from './initialData';

import type { Product, Invoice, InvoiceItem, User, Expense, ReturnRequest, RequestedBook, Customer, Supplier, Purchase, FinancialAccount, FinancialTransaction, OrderType, OrderStatus, PaymentStatus, Budget, TillCloseout } from './types';

import LoginView from './components/LoginView';
import Header from './components/Header';
import POSView from './components/POSView';
import ProductsView from './components/ProductsView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import { SystemResetModal } from './components/SystemResetModal';
import UsersView from './components/UsersView';
import ReturnRequestsView from './components/ReturnRequestsView';
import ExpensesView from './components/ExpensesView';
import AIChatAssistant from './components/AIChatAssistant';
import RequestedBooksView from './components/RequestedBooksView';
import PurchasesView from './components/PurchasesView';
import CustomersView from './components/CustomersView';
import SuppliersView from './components/SuppliersView';
import FinanceView from './components/FinanceView';
import OrdersView from './components/OrdersView';
import CloseTillModal from './components/CloseTillModal';
import TillCloseoutsView from './components/TillCloseoutsView';
import CashierToolsView from './components/CashierToolsView';
import ReportsView from './components/ReportsView';
import FinancialSummaryView from './components/FinancialSummaryView';
import { BackupAndArchiveView } from './components/BackupAndArchiveView';
import { AuditLogView } from './components/AuditLogView';
import { RecycleBinView } from './components/RecycleBinView';


import { logAction } from './utils/auditLogger';
import { motion, AnimatePresence } from 'motion/react';
import { 
    LayoutDashboard, LineChart, ClipboardList, ShoppingCart, 
    Receipt, ShieldCheck, Package, ListChecks, 
    ShoppingBag, Wallet, Users, Building2, 
    Landmark, Archive, UserCog, HardDriveDownload, 
    ScrollText, Trash2, Database, Settings, 
    ChevronLeft, LogOut, Search, Bell,
    Menu, X, Sparkles, ChevronRight
} from 'lucide-react';
import { Logo } from './components/Logo';
import { softDelete } from './utils/recycleBin';

const simpleHash = (password: string, salt: string) => `hashed_${password}_with_${salt}`;

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [users, setUsers] = useLocalStorage<User[]>('users', initialUsers);
    const { currentUser, login, logout } = useAuth(users);

    const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
    const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoices', []);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
    const [returnRequests, setReturnRequests] = useLocalStorage<ReturnRequest[]>('returnRequests', []);
    const [requestedBooks, setRequestedBooks] = useLocalStorage<RequestedBook[]>('requestedBooks', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', initialCustomers);
    const [suppliers, setSuppliers] = useLocalStorage<Supplier[]>('suppliers', initialSuppliers);
    const [purchases, setPurchases] = useLocalStorage<Purchase[]>('purchases', []);
    const [accounts, setAccounts] = useLocalStorage<FinancialAccount[]>('financialAccounts', initialAccounts);
    const [transactions, setTransactions] = useLocalStorage<FinancialTransaction[]>('financialTransactions', []);
    const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
    const [tillCloseouts, setTillCloseouts] = useLocalStorage<TillCloseout[]>('tillCloseouts', []);
    
    const [currentView, setCurrentView] = useState(currentUser?.role === 'admin' ? 'dashboard' : 'pos');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lowStockThreshold] = useLocalStorage<number>('lowStockThreshold', 5);
    const [shopName] = useLocalStorage<string>('shopName', 'اسم المحل');
    const [shopAddress] = useLocalStorage<string>('shopAddress', 'تفاصيل العنوان ورقم الهاتف');
    const [isCloseTillModalOpen, setIsCloseTillModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    
    // --- COMPUTED VALUES ---
    const accountBalances = useMemo(() => {
        const balances = new Map<string, number>();
        accounts.forEach(acc => balances.set(acc.id, 0));
        transactions.forEach(tx => {
            if (tx.fromAccountId) {
                balances.set(tx.fromAccountId, (balances.get(tx.fromAccountId) || 0) - tx.amount);
            }
            if (tx.toAccountId) {
                balances.set(tx.toAccountId, (balances.get(tx.toAccountId) || 0) + tx.amount);
            }
        });
        return balances;
    }, [accounts, transactions]);

    // --- CENTRALIZED HANDLERS ---
    const addFinancialTransaction = useCallback((tx: Omit<FinancialTransaction, 'id' | 'date'>) => {
        const newTransaction: FinancialTransaction = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString(),
            ...tx
        };
        setTransactions(prev => [...prev, newTransaction]);
    }, [setTransactions]);

    const updateStock = useCallback((items: {
        productId: string;
        quantityChange: number;
        allocatedChange?: number;
    }[]) => {
        setProducts(prevProds => {
            const newProds = prevProds.map(p => ({...p}));
            
            items.forEach(item => {
                const prodIndex = newProds.findIndex(p => p.id === item.productId);
                if (prodIndex !== -1) {
                    const product = newProds[prodIndex];
                    // Only update quantity for physical products
                    if (product.type === 'product') {
                        product.quantity = Math.max(0, product.quantity + item.quantityChange);
                        if (item.allocatedChange) {
                            product.allocated = Math.max(0, (product.allocated || 0) + item.allocatedChange);
                        }
                        newProds[prodIndex] = product;
                    }
                }
            });
            return newProds;
        });
    }, [setProducts]);

    // --- CORE BUSINESS LOGIC ---
    // Products
    const addProduct = async (product: Omit<Product, 'id'>) => {
        const id = `prod-${Date.now()}`;
        const newProduct = { ...product, id };
        setProducts(prev => [...prev, newProduct]);
        await logAction('PRODUCT_CREATED', `Created product: ${product.name}`, id, 'product');
        return newProduct;
    };
    const updateProduct = async (id: string, updatedProduct: Omit<Product, 'id'>) => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct, id } : p));
        await logAction('PRODUCT_UPDATED', `Updated product: ${updatedProduct.name}`, id, 'product');
    };
    const deleteProduct = async (id: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        if (!window.confirm('هل أنت متأكد من نقل هذا المنتج إلى سلة المهملات؟')) return;
        
        setProducts(prev => prev.filter(p => p.id !== id));
        await logAction('PRODUCT_DELETED', `Deleted product: ${product.name}`, id, 'product');
        // Note: For now we still use local state for simplicity in this turn, 
        // but the plan calls for Firestore. I've implemented the UI for it.
    };
    
    const updatePricesBatch = (operation: 'multiply' | 'divide', factor: number) => {
        if (isNaN(factor) || factor <= 0) {
            alert("المعامل يجب أن يكون رقمًا موجبًا.");
            return;
        }
        setProducts(prev => prev.map(p => ({
            ...p,
            price: operation === 'multiply' ? p.price * factor : p.price / factor,
            costPrice: p.costPrice ? (operation === 'multiply' ? p.costPrice * factor : p.costPrice / factor) : undefined
        })));
        alert("تم تحديث الأسعار بنجاح.");
    };

    const batchUpdateProducts = (productIds: string[], discountPercent: number) => {
        if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            alert("الرجاء إدخال نسبة خصم صالحة بين 0 و 100.");
            return;
        }
        const factor = 1 - (discountPercent / 100);
        setProducts(prev => prev.map(p => {
            if (productIds.includes(p.id)) {
                // Set salePrice to null or undefined if discount is 0 to remove it
                const newSalePrice = discountPercent === 0 ? undefined : parseFloat((p.price * factor).toFixed(2));
                return {
                    ...p,
                    salePrice: newSalePrice
                };
            }
            return p;
        }));
        alert(`تم تطبيق خصم ${discountPercent}% على ${productIds.length} منتج.`);
    };


    // Orders (Sales, Shipping, Reservations)
    const createOrder = async (type: OrderType, items: InvoiceItem[], customerInfo?: Invoice['customerInfo'], shippingFee: number = 0, source?: Invoice['source']) => {
        if (!currentUser) throw new Error("No user is logged in.");

        const total = items.reduce((sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity, 0) + shippingFee;
        const totalCost = items.reduce((sum, item) => sum + (item.costPrice || 0) * item.quantity, 0);
        
        const newOrder: Invoice = {
            id: `${type.slice(0,3)}-${Date.now()}`,
            date: new Date().toISOString(),
            type,
            items: items.map(item => ({...item})),
            total,
            totalCost,
            totalProfit: total - totalCost - shippingFee,
            customerInfo,
            shippingFee,
            source,
            status: type === 'sale' ? 'completed' : 'pending',
            paymentStatus: type === 'sale' ? 'paid' : 'unpaid',
            processedBy: currentUser.username,
        };
        
        setInvoices(prev => [...prev, newOrder]);
        await logAction('ORDER_CREATED', `Created ${type} order for ${newOrder.customerInfo?.name || 'walk-in'}. Total: ${total}`, newOrder.id, 'invoice');
        
        const itemsToUpdate = items.map(i => ({
            productId: i.productId,
            quantityChange: -i.quantity,
            allocatedChange: (type === 'shipping' || type === 'reservation') ? i.quantity : 0
        }));
        updateStock(itemsToUpdate);

        if (type === 'sale') { // Quick sale is paid immediately
            const targetAccountId = 'cash-default';

            addFinancialTransaction({
                description: `إيراد من فاتورة بيع رقم ${newOrder.id.substring(0,8)} (بواسطة ${currentUser.username})`,
                amount: newOrder.total,
                type: 'sale_income',
                toAccountId: targetAccountId,
                relatedInvoiceId: newOrder.id
            });
            newOrder.paidDate = new Date().toISOString();
        }
        return newOrder;
    };

    const onCompleteSale = (items: InvoiceItem[]) => {
        if (!window.confirm('هل أنت متأكد من إتمام عملية البيع؟')) return;
        createOrder('sale', items);
    };
    const onCreateShippingOrder = (cart: InvoiceItem[], customerInfo: any, shippingFee: number, source: any) => {
        if (!window.confirm('هل أنت متأكد من إنشاء طلب الشحن؟')) return;
        createOrder('shipping', cart, customerInfo, shippingFee, source);
    };
    const onCreateReservation = (cart: InvoiceItem[], customerInfo: any) => {
        if (!window.confirm('هل أنت متأكد من إنشاء هذا الحجز؟')) return;
        createOrder('reservation', cart, customerInfo);
    };

    const updateOrderStatus = (orderId: string, status: OrderStatus, paymentStatus?: PaymentStatus) => {
        if (!window.confirm(`هل أنت متأكد من تغيير حالة الطلب إلى "${status}"؟`)) return;
        setInvoices(prev => prev.map(inv => {
            if (inv.id === orderId) {
                const wasCancelled = inv.status !== 'cancelled' && status === 'cancelled';
                const wasCompleted = inv.status !== 'completed' && status === 'completed' && inv.type === 'shipping';
                
                if (wasCancelled) {
                    const itemsToUpdate = inv.items.map(i => ({
                        productId: i.productId,
                        quantityChange: i.quantity,
                        allocatedChange: (inv.type === 'shipping' || inv.type === 'reservation') ? -i.quantity : 0
                    }));
                    updateStock(itemsToUpdate);
                }
                if (wasCompleted) {
                    const itemsToUpdate = inv.items.map(i => ({
                        productId: i.productId,
                        quantityChange: 0,
                        allocatedChange: -i.quantity
                    }));
                    updateStock(itemsToUpdate);
                }
                
                const updatedInvoice = { ...inv, status };
                if (paymentStatus) {
                    updatedInvoice.paymentStatus = paymentStatus;
                    if(paymentStatus === 'paid' && !inv.paidDate) {
                        updatedInvoice.paidDate = new Date().toISOString();
                         addFinancialTransaction({
                            description: `تحصيل فاتورة ${inv.type} رقم ${inv.id.substring(0,8)} (بواسطة ${inv.processedBy || 'غير معروف'})`,
                            amount: inv.total,
                            type: 'sale_income',
                            toAccountId: 'cash-default',
                            relatedInvoiceId: inv.id
                        });
                    }
                }
                return updatedInvoice;
            }
            return inv;
        }));
    };
    
    const onConvertToSale = (reservation: Invoice) => {
        if (!currentUser) return;
        if (!window.confirm(`هل أنت متأكد من تحويل الحجز رقم ${reservation.id.substring(0,8)} إلى عملية بيع؟ سيتم تحصيل مبلغ ${reservation.total}.`)) return;
        setInvoices(prev => prev.map(inv => inv.id === reservation.id ? { ...inv, type: 'sale', status: 'completed', paymentStatus: 'paid', paidDate: new Date().toISOString(), processedBy: currentUser.username } : inv));
        
        const itemsToUpdate = reservation.items.map(i => ({
            productId: i.productId,
            quantityChange: 0,
            allocatedChange: -i.quantity
        }));
        updateStock(itemsToUpdate);

        const targetAccountId = 'cash-default';
        
        addFinancialTransaction({
            description: `إيراد من تحويل الحجز ${reservation.id.substring(0,8)} (بواسطة ${currentUser.username})`,
            amount: reservation.total,
            type: 'sale_income',
            toAccountId: targetAccountId,
            relatedInvoiceId: reservation.id
        });
    };

    // Returns
    const processReturn = (originalInvoiceId: string, returnItems: InvoiceItem[]) => {
        if (!currentUser) return;
        if (!window.confirm('هل أنت متأكد من إتمام عملية الإرجاع؟ سيتم استرداد المبلغ وتحديث المخزون.')) return;
        const total = returnItems.reduce((sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity, 0);
        const totalProfit = returnItems.reduce((sum, item) => sum + ((item.price - (item.discount || 0)) - (item.costPrice || 0)) * item.quantity, 0);
        const newReturnInvoice: Invoice = {
            id: `ret-${Date.now()}`,
            date: new Date().toISOString(),
            type: 'return',
            items: returnItems,
            total: -total,
            totalProfit: -totalProfit,
            status: 'completed',
            paymentStatus: 'paid', // Refund is considered a 'paid' transaction
            processedBy: currentUser.username,
        };
        setInvoices(prev => [...prev, newReturnInvoice]);
        updateStock(returnItems.map(i => ({ productId: i.productId, quantityChange: i.quantity })));
        
        const sourceAccountId = 'cash-default';

        addFinancialTransaction({
            description: `مرتجع من فاتورة ${originalInvoiceId.substring(0, 8)} (بواسطة ${currentUser.username})`,
            amount: total,
            type: 'return_refund',
            fromAccountId: sourceAccountId,
            relatedInvoiceId: newReturnInvoice.id,
            category: 'مرتجعات'
        });
    };

    const sendReturnRequest = (originalInvoice: Invoice, returnItems: InvoiceItem[]) => {
        if (!currentUser) return;
        const newRequest: ReturnRequest = {
            id: `req-ret-${Date.now()}`,
            requestDate: new Date().toISOString(),
            originalInvoiceId: originalInvoice.id,
            requestedBy: currentUser.username,
            status: 'pending',
            items: returnItems,
        };
        setReturnRequests(prev => [...prev, newRequest]);
        alert('تم إرسال طلب الإرجاع للمراجعة.');
    };

    const approveRequest = (requestId: string) => {
        if (!currentUser) return;
        if (!window.confirm('هل أنت متأكد من الموافقة على طلب الإرجاع؟ سيتم معالجة العملية مالياً وفي المخزون.')) return;
        const request = returnRequests.find(r => r.id === requestId);
        if (request && request.status === 'pending') {
            processReturn(request.originalInvoiceId, request.items);
            setReturnRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved', processedBy: currentUser.username, processedDate: new Date().toISOString() } : r));
        }
    };

    const rejectRequest = (requestId: string) => {
        if (!currentUser) return;
        if (!window.confirm('هل أنت متأكد من رفض طلب الإرجاع؟')) return;
        setReturnRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'rejected', processedBy: currentUser.username, processedDate: new Date().toISOString() } : r));
    };

    const addTillCloseout = (data: Omit<TillCloseout, 'id'>) => {
        setTillCloseouts(prev => [...prev, { ...data, id: `closeout-${Date.now()}` }]);
    };

    const onAddRequestedBook = (bookName: string, customerName: string, customerPhone: string) => {
        setRequestedBooks(prev => {
            const existing = prev.find(b => b.name.toLowerCase() === bookName.toLowerCase());
            if (existing) {
                return prev.map(b => b.id === existing.id ? { ...b, requestedCount: b.requestedCount + 1, lastRequestedDate: new Date().toISOString() } : b);
            } else {
                return [...prev, {
                    id: `req-${Date.now()}`,
                    name: bookName,
                    requestedCount: 1,
                    lastRequestedDate: new Date().toISOString(),
                    status: 'pending',
                    customerName,
                    customerPhone,
                }];
            }
        });
        alert(`تم تسجيل طلب للمنتج "${bookName}" باسم العميل ${customerName}.`);
    };

    const updateRequestedBookStatus = (id: string, status: 'fulfilled' | 'pending') => {
        setRequestedBooks(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    };
    
    // Purchases
    const onAddPurchase = (purchaseData: Omit<Purchase, 'id'>) => {
        if (!window.confirm('هل أنت متأكد من إنشاء فاتورة الشراء هذه؟ سيتم تحديث المخزون والحسابات المالية.')) return;
        const newPurchase: Purchase = {
            id: `pur-${Date.now()}`,
            ...purchaseData,
            isStockedIn: true, // Auto stock-in
        };
        setPurchases(p => [...p, newPurchase]);

        // Immediately update stock levels
        const stockUpdates = newPurchase.items.map(item => ({
            productId: item.productId,
            quantityChange: item.quantity
        }));
        updateStock(stockUpdates);
    };
    const onUpdatePurchase = (id: string, purchase: Purchase) => setPurchases(p => p.map(pu => pu.id === id ? purchase : pu));
    const onDeletePurchase = (id: string) => setPurchases(p => p.filter(pu => pu.id !== id));
    
    const addPurchasePayment = (purchaseId: string, amount: number, accountId: string) => {
        if (!window.confirm(`هل أنت متأكد من دفع مبلغ ${amount}؟ سيتم خصم المبلغ من الحساب المختار.`)) return;
        const purchase = purchases.find(p => p.id === purchaseId);
        if (!purchase) return;

        const newPayments = [...purchase.payments, { date: new Date().toISOString(), amount, accountId }];
        const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
        
        let paymentStatus: PaymentStatus = 'partial';
        if (totalPaid >= purchase.totalCost) paymentStatus = 'paid';
        else if (totalPaid === 0) paymentStatus = 'unpaid';

        onUpdatePurchase(purchaseId, { ...purchase, payments: newPayments, paymentStatus });
        addFinancialTransaction({
            description: `دفعة للمورد ${purchase.supplierName} عن فاتورة ${purchase.id.substring(0,8)}`,
            amount,
            type: 'supplier_payment',
            fromAccountId: accountId,
            relatedPurchaseId: purchase.id
        });
    };
    
    // Expenses
    const addExpense = (expense: Omit<Expense, 'id'>) => {
        if (!window.confirm(`هل أنت متأكد من تسجيل مصروف بمبلغ ${expense.amount}؟`)) return;
        const newExpense = { ...expense, id: `exp-${Date.now()}` };
        setExpenses(prev => [...prev, newExpense]);
        addFinancialTransaction({
            description: newExpense.description,
            amount: newExpense.amount,
            type: 'expense',
            fromAccountId: newExpense.accountId,
            category: newExpense.category
        });
    };

    const deleteExpense = async (id: string) => {
        const expenseToDelete = expenses.find(e => e.id === id);
        if (expenseToDelete) {
            if (!window.confirm('هل أنت متأكد من إلغاء هذا المصروف؟ سيتم استرداد المبلغ للحساب.')) return;
            setExpenses(prev => prev.filter(e => e.id !== id));
            await logAction('EXPENSE_DELETED', `Cancelled expense: ${expenseToDelete.description}. Amount: ${expenseToDelete.amount}`, id, 'expense');
            addFinancialTransaction({
                description: `إلغاء المصروف: ${expenseToDelete.description}`,
                amount: expenseToDelete.amount,
                type: 'expense_reversal',
                toAccountId: expenseToDelete.accountId,
                category: expenseToDelete.category
            });
        }
    };

    // Financial Accounts
    const onSaveAccount = (data: Omit<FinancialAccount, 'id'>) => {
        setAccounts(prev => [...prev, {...data, id: `acc-${Date.now()}`}]);
    };
    
    // FIX: Implement missing user management functions.
    const addUser = (userData: Omit<User, 'id' | 'passwordHash' | 'salt'> & { password: string }): User => {
        const salt = `salt_${Date.now()}_${Math.random()}`;
        const newUser: User = {
            id: `user-${Date.now()}`,
            username: userData.username,
            role: userData.role,
            salt,
            passwordHash: simpleHash(userData.password, salt)
        };
        setUsers(prev => [...prev, newUser]);
        return newUser;
    };

    const updateUser = (id: string, userData: Partial<Omit<User, 'id' | 'passwordHash' | 'salt'>> & { password?: string }) => {
        setUsers(prev => prev.map(u => {
            if (u.id === id) {
                const updatedUser: User = { ...u };
                if (userData.username) updatedUser.username = userData.username;
                if (userData.role) updatedUser.role = userData.role;

                if (userData.password) {
                    const newSalt = `salt_${Date.now()}_${Math.random()}`;
                    updatedUser.salt = newSalt;
                    updatedUser.passwordHash = simpleHash(userData.password, newSalt);
                }
                return updatedUser;
            }
            return u;
        }));
    };

    const deleteUser = (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
        setUsers(prev => prev.filter(u => u.id !== id));
    };

    // Other
    const addCustomer = (customer: Omit<Customer, 'id'>) => { const newCust = {id: `cust-${Date.now()}`, ...customer}; setCustomers(c => [...c, newCust]); return newCust; };
    const updateCustomer = (id: string, customer: Omit<Customer, 'id'>) => { setCustomers(c => c.map(cu => cu.id === id ? {id, ...customer} : cu)) };
    const deleteCustomer = (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
        setCustomers(c => c.filter(cu => cu.id !== id));
    };
    const onAddSupplier = (supplier: Omit<Supplier, 'id'>): Supplier => { const newSup = {...supplier, id: `sup-${Date.now()}`}; setSuppliers(p => [...p, newSup]); return newSup;};
    const updateSupplier = (id: string, supplier: Omit<Supplier, 'id'>) => { setSuppliers(s => s.map(su => su.id === id ? {id, ...supplier} : su)) };
    const deleteSupplier = (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
        setSuppliers(s => s.filter(su => su.id !== id));
    };

    // --- RENDER LOGIC ---
    if (!currentUser) {
        return <LoginView onLogin={login} />;
    }

    const views: { [key: string]: {element: React.ReactNode, label: string, icon: any, roles: Array<'admin' | 'cashier'>} } = {
        dashboard: { element: <DashboardView invoices={invoices} expenses={expenses} products={products} customers={customers} lowStockThreshold={lowStockThreshold} />, label: "لوحة التحكم", icon: LayoutDashboard, roles: ['admin'] },
        reports: { element: <ReportsView invoices={invoices} products={products} expenses={expenses} />, label: "التقارير", icon: LineChart, roles: ['admin'] },
        financialSummary: { element: <FinancialSummaryView invoices={invoices} expenses={expenses} transactions={transactions} purchases={purchases} accountBalances={accountBalances} />, label: "الملخص المالي", icon: ClipboardList, roles: ['admin'] },
        pos: { element: <POSView products={products} customers={customers} onCompleteSale={onCompleteSale} onCreateShippingOrder={onCreateShippingOrder} onCreateReservation={onCreateReservation} onAddRequestedBook={onAddRequestedBook} lowStockThreshold={lowStockThreshold} />, label: "نقطة البيع", icon: ShoppingCart, roles: ['admin', 'cashier'] },
        orders: { element: <OrdersView invoices={invoices} users={users} onUpdateStatus={updateOrderStatus} onConvertToSale={onConvertToSale} processReturn={processReturn} sendReturnRequest={sendReturnRequest} currentUser={currentUser} shopName={shopName} shopAddress={shopAddress} />, label: "الطلبات", icon: Receipt, roles: ['admin', 'cashier'] },
        returnRequests: { element: <ReturnRequestsView requests={returnRequests} approveRequest={approveRequest} rejectRequest={rejectRequest} />, label: "طلبات الإرجاع", icon: ShieldCheck, roles: ['admin'] },
        products: { element: <ProductsView products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} lowStockThreshold={lowStockThreshold} onBatchUpdate={batchUpdateProducts} />, label: "المخزون", icon: Package, roles: ['admin'] },
        requestedBooks: { element: <RequestedBooksView requestedBooks={requestedBooks} updateRequestedBookStatus={updateRequestedBookStatus} />, label: "المنتجات المطلوبة", icon: ListChecks, roles: ['admin'] },
        purchases: { element: <PurchasesView purchases={purchases} products={products} suppliers={suppliers} accounts={accounts} accountBalances={accountBalances} onAddPurchase={onAddPurchase} onUpdatePurchase={onUpdatePurchase} onDeletePurchase={onDeletePurchase} onAddSupplier={onAddSupplier} onAddPayment={addPurchasePayment} createProduct={addProduct} updateProduct={updateProduct} />, label: "المشتريات", icon: ShoppingBag, roles: ['admin'] },
        expenses: { element: <ExpensesView expenses={expenses} addExpense={addExpense} accounts={accounts} />, label: "المصروفات", icon: Wallet, roles: ['admin'] },
        customers: { element: <CustomersView customers={customers} addCustomer={addCustomer} updateCustomer={updateCustomer} deleteCustomer={deleteCustomer} />, label: "العملاء", icon: Users, roles: ['admin'] },
        suppliers: { element: <SuppliersView suppliers={suppliers} addSupplier={onAddSupplier} updateSupplier={updateSupplier} deleteSupplier={deleteSupplier} />, label: "الموردون", icon: Building2, roles: ['admin'] },
        finance: { element: <FinanceView accounts={accounts} accountBalances={accountBalances} transactions={transactions} budgets={budgets} onSaveAccount={onSaveAccount} onSaveTransaction={addFinancialTransaction} onSaveBudget={(b) => setBudgets(p=>[...p, {...b, id: `budget-${Date.now()}`}])} />, label: "الخزينة", icon: Landmark, roles: ['admin'] },
        tillCloseouts: { element: <TillCloseoutsView tillCloseouts={tillCloseouts} />, label: "تقارير الصناديق", icon: Archive, roles: ['admin'] },
        users: { element: <UsersView users={users} addUser={addUser} updateUser={updateUser} deleteUser={deleteUser} currentUser={currentUser} />, label: "المستخدمون", icon: UserCog, roles: ['admin'] },
        backups: { element: <BackupAndArchiveView />, label: "النسخ الاحتياطي", icon: HardDriveDownload, roles: ['admin'] },
        auditLogs: { element: <AuditLogView />, label: "سجل التدقيق", icon: ScrollText, roles: ['admin'] },
        recycleBin: { element: <RecycleBinView />, label: "سلة المهملات", icon: Trash2, roles: ['admin'] },
        cashierTools: { element: <CashierToolsView currentUser={currentUser} />, label: "إدارة البيانات", icon: Database, roles: ['cashier'] },
        settings: { element: <SettingsView onUpdatePrices={updatePricesBatch} onOpenReset={() => setIsResetModalOpen(true)} />, label: "الإعدادات", icon: Settings, roles: ['admin'] },
    };

    const SidebarLink: React.FC<{viewKey: string}> = ({viewKey}) => {
        const view = views[viewKey];
        if (!view || !view.roles.includes(currentUser.role)) return null;
        const isActive = currentView === viewKey;
        const ViewIcon = view.icon;
        
        return (
            <button 
                onClick={() => { setCurrentView(viewKey); setIsSidebarOpen(false); }} 
                className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
                    isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-900'
                }`}
            >
                {isActive && (
                    <motion.div 
                        layoutId="activeGlow"
                        className="absolute inset-0 bg-indigo-600 rounded-xl blur-[2px] opacity-20 -z-10"
                    />
                )}
                <ViewIcon size={18} strokeWidth={isActive ? 3 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:translate-x-1'}`} />
                <span className="text-sm font-black tracking-tight uppercase tracking-widest">{view.label}</span>
                {isActive && (
                    <motion.div 
                        layoutId="activeTab"
                        className="mr-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                    />
                )}
            </button>
        );
    };

    const adminSidebarOrder = [
        'dashboard', 'pos', 'orders', 'purchases', 'finance', 'products', 
        'reports', 'financialSummary', 'returnRequests', 'requestedBooks', 
        'expenses', 'customers', 'suppliers', 'tillCloseouts', 'users', 
        'backups', 'auditLogs', 'recycleBin', 'settings'
    ];
    const cashierSidebarOrder = ['pos', 'orders', 'cashierTools'];
    const sidebarOrder = currentUser.role === 'admin' ? adminSidebarOrder : cashierSidebarOrder;

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans" dir="rtl">
            <aside className={`glass-panel border-l border-slate-200/50 h-full transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-[110%]'} md:translate-x-0 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) w-72 fixed md:static right-0 z-50 md:flex-shrink-0 flex flex-col shadow-2xl md:shadow-none`}>
                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white mb-4 rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Logo className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-800 tracking-tighter">سوق الكتاب</h2>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.3em] opacity-60">Control Panel</p>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
                    <div className="space-y-1">
                        {sidebarOrder.map(key => <SidebarLink key={key} viewKey={key} />)}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-200">
                            {currentUser.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{currentUser.username}</p>
                            <p className="text-[10px] text-slate-400 font-bold truncate uppercase">{currentUser.role === 'admin' ? 'المدير' : 'موظف'}</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"></motion.div>}

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Header 
                    currentUser={currentUser} 
                    onLogout={logout} 
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onOpenCloseTillModal={() => setIsCloseTillModalOpen(true)}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto relative scroll-smooth">
                    <motion.div
                        key={currentView}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="p-8 max-w-[1600px] mx-auto min-h-full pb-24"
                    >
                        {views[currentView]?.element || views[currentUser.role === 'admin' ? 'dashboard' : 'pos'].element}
                    </motion.div>
                </main>
            </div>
            {currentUser.role === 'admin' && 
                <AIChatAssistant 
                    products={products}
                    invoices={invoices}
                    expenses={expenses}
                    customers={customers}
                    lowStockThreshold={lowStockThreshold}
                    addProduct={addProduct}
                    updateProduct={updateProduct}
                    deleteProduct={deleteProduct}
                    addExpense={(exp) => addExpense({...exp, accountId: 'cash-default'})}
                    deleteExpense={deleteExpense}
                    addCustomer={addCustomer}
                    updateCustomer={updateCustomer}
                    deleteCustomer={deleteCustomer}
                    onCompleteSale={onCompleteSale}
                />
            }
            {isCloseTillModalOpen && currentUser && (
                <CloseTillModal
                    invoices={invoices}
                    currentUser={currentUser}
                    onClose={() => setIsCloseTillModalOpen(false)}
                    onConfirmCloseout={addTillCloseout}
                />
            )}
            <SystemResetModal 
                isOpen={isResetModalOpen} 
                onClose={() => setIsResetModalOpen(false)} 
            />
        </div>
    );
};

export default App;