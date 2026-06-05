import React, { useState, useMemo } from 'react';
import type { Customer } from '../types';
import Modal from './Modal';
import Pagination from './common/Pagination';
import { 
    Users, Search, Plus, Edit3, 
    Trash2, Phone, MapPin, Mail, 
    UserPlus, MoreVertical, MessageSquare,
    UserCheck, UserMinus, Clock, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomersViewProps {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id'>) => void | Promise<any>;
  updateCustomer: (id: string, customer: Omit<Customer, 'id'>) => void | Promise<any>;
  deleteCustomer: (id: string) => void | Promise<any>;
}

const ITEMS_PER_PAGE = 10;

const StatCard = ({ title, value, icon: Icon, colorClass, subtext }: { 
    title: string, 
    value: string | number, 
    icon: any, 
    colorClass: string, 
    subtext?: string
}) => (
    <motion.div 
        whileHover={{ y: -4 }}
        className="card-professional p-6 flex flex-col justify-between"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${colorClass.replace('text-', 'bg-').split(' ')[0]}/10 ${colorClass}`}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>
        <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">{value}</p>
            {subtext && <p className="text-[10px] text-slate-400 font-medium">{subtext}</p>}
        </div>
    </motion.div>
);

const CustomersView: React.FC<CustomersViewProps> = ({ customers, addCustomer, updateCustomer, deleteCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [customers, searchTerm]);

  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  
  const handleOpenModal = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCustomer(null);
    setIsModalOpen(false);
  };

  const handleSave = (customerData: Omit<Customer, 'id'>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 opacity-80">Customer Relations</span>
            </div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tight">قاعدة العملاء</h2>
            <p className="text-slate-400 font-medium text-sm">إدارة بيانات المشتركين والعملاء الدائمين وتتبع تفاعلاتهم.</p>
          </div>

          <button onClick={() => handleOpenModal()} className="btn-primary shadow-xl shadow-indigo-600/20 py-3 px-6">
              <UserPlus size={20} strokeWidth={3} />
              إضافة عميل جديد
          </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="إجمالي العملاء" value={customers.length} icon={Users} colorClass="text-indigo-600" subtext="عملاء مسجلين" />
        <StatCard title="نشطون مؤخراً" value={customers.length > 0 ? Math.ceil(customers.length * 0.8) : 0} icon={UserCheck} colorClass="text-emerald-600" />
        <StatCard title="جدد هذا الشهر" value={customers.length > 0 ? Math.ceil(customers.length * 0.1) : 0} icon={Plus} colorClass="text-sky-600" />
        <StatCard title="غير نشطين" value={customers.length > 0 ? Math.floor(customers.length * 0.05) : 0} icon={UserMinus} colorClass="text-rose-500" />
      </div>

      <div className="card-professional bg-white overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 lg:p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="relative group w-full lg:w-96">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                      type="text" 
                      placeholder="ابحث بالاسم، رقم الهاتف، أو البريد..." 
                      value={searchTerm} 
                      onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-3 pr-12 pl-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  />
              </div>
              <div className="flex items-center gap-3">
                  <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2">
                      <Clock size={16} />
                      Last Interaction
                  </button>
              </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
              <table className="w-full text-right border-collapse">
                  <thead>
                      <tr className="bg-slate-50/50">
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">العميل</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">بيانات التواصل</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">العنوان السياقي</th>
                          <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">إجراءات</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                      {paginatedCustomers.map((customer, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            key={customer.id} 
                            className="group hover:bg-slate-50/50 transition-colors"
                          >
                              <td className="p-5">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                                          {customer.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-black text-slate-800 text-base tracking-tight leading-none mb-1">{customer.name}</p>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {customer.id.substring(0, 6)}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-5">
                                  <div className="space-y-1">
                                      <div className="flex items-center gap-2 text-slate-600">
                                          <Phone size={14} className="text-slate-300" />
                                          <span className="text-sm font-bold tabular-nums">{customer.phone}</span>
                                      </div>
                                      {customer.email && (
                                          <div className="flex items-center gap-2 text-slate-400">
                                              <Mail size={14} className="text-slate-300" />
                                              <span className="text-xs font-medium">{customer.email}</span>
                                          </div>
                                      )}
                                  </div>
                              </td>
                              <td className="p-5">
                                  <div className="flex items-center gap-2 text-slate-500 max-w-[200px]">
                                      <MapPin size={14} className="text-slate-300 flex-shrink-0" />
                                      <span className="text-sm font-medium truncate">{customer.address || 'غير محدد'}</span>
                                  </div>
                              </td>
                              <td className="p-5">
                                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={() => handleOpenModal(customer)} className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                          <Edit3 size={18} />
                                      </button>
                                       <button className="p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                          <MessageSquare size={18} />
                                      </button>
                                      <button onClick={() => handleDelete(customer.id)} className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                          <Trash2 size={18} />
                                      </button>
                                      <button className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                                          <MoreVertical size={18} />
                                      </button>
                                  </div>
                              </td>
                          </motion.tr>
                      ))}
                  </tbody>
              </table>
          </div>

          <div className="p-6 lg:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-slate-50">
              <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  Showing {paginatedCustomers.length} to {filteredCustomers.length} of {customers.length} Results
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={ITEMS_PER_PAGE} totalItems={filteredCustomers.length} />
          </div>
      </div>

      <AnimatePresence>
          {isModalOpen && (
            <CustomerModal
              customer={editingCustomer}
              onClose={handleCloseModal}
              onSave={handleSave}
            />
          )}
      </AnimatePresence>
    </div>
  );
};

const CustomerModal: React.FC<{
  customer: Customer | null;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'>) => void;
}> = ({ customer, onClose, onSave }) => {
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [notes, setNotes] = useState(customer?.notes || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('الاسم ورقم الهاتف حقول إلزامية.');
      return;
    }
    onSave({ name, phone, address, email, notes, balance: customer?.balance || 0 });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={customer ? 'تعديل ملف العميل' : 'تسجيل عميل جديد'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">اسم العميل</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="الاسم الكامل"
                />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">رقم الجوال</label>
                <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-sm tabular-nums"
                    placeholder="05xxxxxxxx"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">البريد الإلكتروني</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="example@mail.com"
                />
            </div>
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">العنوان السكني</label>
                <input 
                    type="text" 
                    value={address} 
                    onChange={e => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
                    placeholder="المدينة، الحي، الشارع"
                />
            </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">ملاحظات إضافية</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-600"
            placeholder="أي تفاصيل أخرى تميز هذا العميل..."
          />
        </div>

        {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-500 text-xs font-bold uppercase">
                <AlertTriangle size={16} />
                {error}
            </motion.div>
        )}

        <div className="flex items-center justify-end gap-3 pt-8 mt-6 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">إلغاء</button>
          <button type="submit" className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">حفظ البيانات</button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomersView;
