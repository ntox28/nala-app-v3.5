import React, { useState, useEffect, useMemo } from 'react';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';
import { Customer } from '../customers/CustomerManagement';
import { Bahan } from '../bahan/BahanManagement';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import Pagination from '../Pagination';
import FilterBar from '../FilterBar';
import { useToast } from '../../hooks/useToast';

export type ProductionStatus = 'Belum Dikerjakan' | 'Proses' | 'Selesai';
export type PaymentStatus = 'Belum Lunas' | 'DP' | 'Lunas';

export interface OrderItem {
    id: number;
    bahanId: number | '';
    deskripsiPesanan: string;
    panjang: number;
    lebar: number;
    qty: number;
    statusProduksi: ProductionStatus;
}

export interface Payment {
    amount: number;
    date: string;
    kasirId: string;
}

export interface Order {
    id: number;
    noNota: string;
    tanggal: string;
    pelangganId: number | '';
    items: OrderItem[];
    pelaksanaId: number | null;
    statusPembayaran: PaymentStatus;
    payments: Payment[];
}

interface OrderManagementProps {
    customers: Customer[];
    bahanList: Bahan[];
    orders: Order[];
    onUpdate: (updatedOrders: Order[]) => void;
}

const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const emptyItem: Omit<OrderItem, 'id'> = { bahanId: '', deskripsiPesanan: '', panjang: 0, lebar: 0, qty: 1, statusProduksi: 'Belum Dikerjakan' };
const emptyOrder: Omit<Order, 'id'> = {
    noNota: '',
    tanggal: new Date().toISOString().split('T')[0],
    pelangganId: '',
    items: [{ ...emptyItem, id: Date.now() }],
    pelaksanaId: null,
    statusPembayaran: 'Belum Lunas',
    payments: [],
};

const OrderManagement: React.FC<OrderManagementProps> = ({ customers, bahanList, orders, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [formData, setFormData] = useState<Omit<Order, 'id'>>(emptyOrder);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { addToast } = useToast();
    const ITEMS_PER_PAGE = 10;
    
    const [filters, setFilters] = useState({
        customerId: 'all',
        startDate: '',
        endDate: '',
        status: 'all',
    });

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => {
                const customerMatch = filters.customerId === 'all' || order.pelangganId === Number(filters.customerId);
                const startDateMatch = !filters.startDate || order.tanggal >= filters.startDate;
                const endDateMatch = !filters.endDate || order.tanggal <= filters.endDate;
                const statusMatch = filters.status === 'all' || order.statusPembayaran === filters.status;
                return customerMatch && startDateMatch && endDateMatch && statusMatch;
            })
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    }, [orders, filters]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const currentOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    useEffect(() => {
        if (isModalOpen) {
            if (editingOrder) {
                setFormData(JSON.parse(JSON.stringify(editingOrder)));
            } else {
                setFormData({ ...emptyOrder, items: [{ ...emptyItem, id: Date.now() }] });
            }
        }
    }, [isModalOpen, editingOrder]);

    const handleFilterChange = (name: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters({
            customerId: 'all',
            startDate: '',
            endDate: '',
            status: 'all',
        });
    };

    const paymentStatusOptions = [
        { value: 'Belum Lunas', label: 'Belum Lunas' },
        { value: 'DP', label: 'DP' },
        { value: 'Lunas', label: 'Lunas' },
    ];

    const handleOpenModal = (order: Order | null) => {
        setEditingOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingOrder(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'pelangganId' ? Number(value) : value 
        }));
    };

    const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const newItems = [...formData.items];
        const itemToUpdate = { ...newItems[index] };
        
        const numericFields = ['bahanId', 'qty', 'panjang', 'lebar'];
        if (numericFields.includes(name)) {
             (itemToUpdate as any)[name] = Number(value);
        } else {
             (itemToUpdate as any)[name] = value;
        }

        newItems[index] = itemToUpdate;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { ...emptyItem, id: Date.now() }] }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length <= 1) {
             addToast('Pesanan harus memiliki minimal satu item.', 'error');
            return;
        };
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingOrder) {
            const updatedOrderData = { ...formData, id: editingOrder.id, payments: editingOrder.payments, statusPembayaran: editingOrder.statusPembayaran };
            onUpdate(orders.map(o => o.id === editingOrder.id ? updatedOrderData : o));
            addToast('Order berhasil diperbarui!', 'success');
        } else {
            const newOrder: Order = { ...formData, id: Date.now(), payments: [], statusPembayaran: 'Belum Lunas' };
            const updatedOrders = [...orders, newOrder];
            onUpdate(updatedOrders);
            setCurrentPage(1); // Go to the first page to see the newest item
            addToast('Order berhasil ditambahkan!', 'success');
        }
        handleCloseModal();
    };

    const handleDelete = (orderId: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
            onUpdate(orders.filter(o => o.id !== orderId));
            if (currentOrders.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            addToast('Order berhasil dihapus.', 'success');
        }
    };
    
    const getCustomerName = (id: number | '') => {
        return customers.find(c => c.id === id)?.name || 'N/A';
    }

    const toggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-xl font-semibold text-white">Manajemen Order</h2>
                <button
                    onClick={() => handleOpenModal(null)}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                >
                    Tambah Order
                </button>
            </div>

            <FilterBar
                customers={customers}
                statusOptions={paymentStatusOptions}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
            />
            
            <div className="flex-1 overflow-y-auto">
                 <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th scope="col" className="px-6 py-3">No. Nota</th>
                            <th scope="col" className="px-6 py-3">Tanggal</th>
                            <th scope="col" className="px-6 py-3">Pelanggan</th>
                            <th scope="col" className="px-6 py-3 text-center">Detail Item</th>
                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {currentOrders.map((order) => (
                           <React.Fragment key={order.id}>
                            <tr className="hover:bg-slate-700/50 transition-colors duration-200">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{order.noNota}</th>
                                <td className="px-6 py-4">{formatDate(order.tanggal)}</td>
                                <td className="px-6 py-4">{getCustomerName(order.pelangganId)}</td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => toggleExpand(order.id)}
                                        className="flex items-center justify-center w-full space-x-2 text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <span>{order.items.length} item</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center space-x-3">
                                    <button onClick={() => handleOpenModal(order)} className="text-sky-400 hover:text-sky-300 transition-colors p-1">
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(order.id)} className="text-red-500 hover:text-red-400 transition-colors p-1">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                            {expandedOrderId === order.id && (
                                <tr className="bg-slate-900/40">
                                    <td colSpan={5} className="p-0">
                                        <div className="px-8 py-4">
                                            <h4 className="text-md font-semibold text-slate-300 mb-3">Rincian Item Pesanan:</h4>
                                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left text-slate-400">
                                                    <thead className="text-xs text-slate-500 uppercase bg-slate-700/50">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-2">Bahan</th>
                                                            <th scope="col" className="px-4 py-2">Deskripsi</th>
                                                            <th scope="col" className="px-4 py-2">Ukuran</th>
                                                            <th scope="col" className="px-4 py-2 text-center">Qty</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-700/50">
                                                        {order.items.map(item => {
                                                            const bahan = bahanList.find(b => b.id === item.bahanId);
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td className="px-4 py-3 font-medium text-slate-300">{bahan?.name || 'N/A'}</td>
                                                                    <td className="px-4 py-3">{item.deskripsiPesanan || '-'}</td>
                                                                    <td className="px-4 py-3">{item.panjang > 0 && item.lebar > 0 ? `${item.panjang}m x ${item.lebar}m` : '-'}</td>
                                                                    <td className="px-4 py-3 text-center">{item.qty}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                           </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 transition-opacity duration-300" onClick={handleCloseModal}>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl p-8 m-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-6">{editingOrder ? 'Edit Order' : 'Tambah Order Baru'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Order Header */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="noNota" className="block text-sm font-medium text-slate-400 mb-1">No. Nota</label>
                                    <input type="text" name="noNota" id="noNota" value={formData.noNota} onChange={handleFormChange} required className="w-full pl-4 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-md text-white" />
                                </div>
                                <div>
                                    <label htmlFor="tanggal" className="block text-sm font-medium text-slate-400 mb-1">Tanggal</label>
                                    <input type="date" name="tanggal" id="tanggal" value={formData.tanggal} onChange={handleFormChange} required className="w-full pl-4 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-md text-white" />
                                </div>
                                <div>
                                    <label htmlFor="pelangganId" className="block text-sm font-medium text-slate-400 mb-1">Pelanggan</label>
                                    <select name="pelangganId" id="pelangganId" value={formData.pelangganId} onChange={handleFormChange} required className="w-full pl-3 pr-10 py-3 bg-slate-900/50 border border-slate-700 rounded-md text-white appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                                        <option value="" disabled>Pilih Pelanggan</option>
                                        {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                {formData.items.map((item, index) => (
                                    <div key={item.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 space-y-4 relative">
                                        <h4 className="font-semibold text-sky-400">Item #{index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                             <div>
                                                <label htmlFor={`bahanId-${index}`} className="block text-sm font-medium text-slate-400 mb-1">Bahan</label>
                                                <select name="bahanId" id={`bahanId-${index}`} value={item.bahanId} onChange={(e) => handleItemChange(index, e)} required className="w-full pl-3 pr-10 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white appearance-none" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                                                    <option value="" disabled>Pilih Bahan</option>
                                                    {bahanList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor={`deskripsiPesanan-${index}`} className="block text-sm font-medium text-slate-400 mb-1">Deskripsi Pesanan</label>
                                                <input type="text" name="deskripsiPesanan" id={`deskripsiPesanan-${index}`} value={item.deskripsiPesanan} onChange={(e) => handleItemChange(index, e)} className="w-full pl-4 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label htmlFor={`panjang-${index}`} className="block text-sm font-medium text-slate-400 mb-1">Panjang (m)</label>
                                                <input type="number" name="panjang" id={`panjang-${index}`} value={item.panjang} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01" className="w-full pl-4 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white" />
                                            </div>
                                            <div>
                                                <label htmlFor={`lebar-${index}`} className="block text-sm font-medium text-slate-400 mb-1">Lebar (m)</label>
                                                <input type="number" name="lebar" id={`lebar-${index}`} value={item.lebar} onChange={(e) => handleItemChange(index, e)} min="0" step="0.01" className="w-full pl-4 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white" />
                                            </div>
                                            <div>
                                                <label htmlFor={`qty-${index}`} className="block text-sm font-medium text-slate-400 mb-1">Qty</label>
                                                <input type="number" name="qty" id={`qty-${index}`} value={item.qty} onChange={(e) => handleItemChange(index, e)} required min="1" className="w-full pl-4 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-md text-white" />
                                            </div>
                                        </div>
                                        {formData.items.length > 1 && (
                                            <button type="button" onClick={() => removeItem(index)} className="absolute top-3 right-3 text-red-500 hover:text-red-400 p-1 rounded-full bg-slate-700/50 hover:bg-slate-600/50">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                             <button type="button" onClick={addItem} className="w-full py-2 rounded-lg text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors">Tambah Item</button>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">Batal</button>
                                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-sky-600 hover:bg-sky-700 transition-colors">{editingOrder ? 'Simpan Perubahan' : 'Simpan Order'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;