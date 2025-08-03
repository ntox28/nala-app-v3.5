import React, { useState, useMemo, useEffect } from 'react';
import { Customer } from '../customers/CustomerManagement';
import { Bahan } from '../bahan/BahanManagement';
import { Order, OrderItem, ProductionStatus } from '../orders/OrderManagement';
import { Employee } from '../employees/EmployeeManagement';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import Pagination from '../Pagination';
import FilterBar from '../FilterBar';
import { useToast } from '../../hooks/useToast';

interface ProductionManagementProps {
    orders: Order[];
    onUpdate: (updatedOrders: Order[]) => void;
    customers: Customer[];
    employees: Employee[];
    bahanList: Bahan[];
}

const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

const getStatusColor = (status: ProductionStatus) => {
    const colors: Record<ProductionStatus, string> = {
        'Belum Dikerjakan': 'bg-gray-500/20 text-gray-300',
        'Proses': 'bg-yellow-500/20 text-yellow-300',
        'Selesai': 'bg-green-500/20 text-green-300',
    };
    return colors[status];
};

const ProductionManagement: React.FC<ProductionManagementProps> = ({ orders, onUpdate, customers, employees, bahanList }) => {
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
                const statusMatch = filters.status === 'all' || order.items.some(item => item.statusProduksi === filters.status);
                return customerMatch && startDateMatch && endDateMatch && statusMatch;
            })
            .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    }, [orders, filters]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const currentOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

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
    
    const productionStatusOptions = [
        { value: 'Belum Dikerjakan', label: 'Belum Dikerjakan' },
        { value: 'Proses', label: 'Proses' },
        { value: 'Selesai', label: 'Selesai' },
    ];

    const getCustomerName = (id: number | '') => {
        return customers.find(c => c.id === id)?.name || 'N/A';
    }

    const getEmployeeName = (id: number | null) => {
        return employees.find(e => e.id === id)?.name || 'Belum Ditugaskan';
    }

    const toggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handlePelaksanaChange = (orderId: number, pelaksanaId: number) => {
        const updatedOrders = orders.map(order => 
            order.id === orderId ? { ...order, pelaksanaId } : order
        );
        onUpdate(updatedOrders);
        const pelaksanaName = employees.find(e => e.id === pelaksanaId)?.name;
        addToast(`Pelaksana untuk Nota ${orders.find(o=>o.id === orderId)?.noNota} telah diubah menjadi ${pelaksanaName}.`, 'success');
    };

    const handleStatusChange = (orderId: number, itemId: number, newStatus: ProductionStatus) => {
        const updatedOrders = orders.map(order => {
            if (order.id === orderId) {
                const updatedItems = order.items.map(item => 
                    item.id === itemId ? { ...item, statusProduksi: newStatus } : item
                );
                return { ...order, items: updatedItems };
            }
            return order;
        });
        onUpdate(updatedOrders);
        addToast(`Status item untuk Nota ${orders.find(o=>o.id === orderId)?.noNota} telah diubah menjadi ${newStatus}.`, 'info');
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <h2 className="text-xl font-semibold text-white">Manajemen Produksi</h2>
            </div>

            <FilterBar
                customers={customers}
                statusOptions={productionStatusOptions}
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
                            <th scope="col" className="px-6 py-3">Pelaksana</th>
                            <th scope="col" className="px-6 py-3 text-center">Detail Item</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {currentOrders.map((order) => (
                           <React.Fragment key={order.id}>
                            <tr className="hover:bg-slate-700/50 transition-colors duration-200">
                                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{order.noNota}</th>
                                <td className="px-6 py-4">{formatDate(order.tanggal)}</td>
                                <td className="px-6 py-4">{getCustomerName(order.pelangganId)}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={order.pelaksanaId ?? ''} 
                                        onChange={(e) => handlePelaksanaChange(order.id, Number(e.target.value))}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-md text-white text-xs p-2 appearance-none"
                                        style={{ 
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
                                            backgroundPosition: 'right 0.5rem center', 
                                            backgroundRepeat: 'no-repeat', 
                                            backgroundSize: '1.2em 1.2em' 
                                        }}
                                    >
                                        <option value="" disabled>Pilih Pelaksana</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => toggleExpand(order.id)}
                                        className="flex items-center justify-center w-full space-x-2 text-sky-400 hover:text-sky-300 transition-colors"
                                    >
                                        <span>{order.items.length} item</span>
                                        <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${expandedOrderId === order.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </td>
                            </tr>
                            {expandedOrderId === order.id && (
                                <tr className="bg-slate-900/40">
                                    <td colSpan={5} className="p-0">
                                        <div className="px-8 py-4">
                                            <h4 className="text-md font-semibold text-slate-300 mb-3">Status Pengerjaan Item:</h4>
                                            <div className="border border-slate-700 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left text-slate-400">
                                                    <thead className="text-xs text-slate-500 uppercase bg-slate-700/50">
                                                        <tr>
                                                            <th scope="col" className="px-4 py-2">Bahan</th>
                                                            <th scope="col" className="px-4 py-2">Ukuran</th>
                                                            <th scope="col" className="px-4 py-2 text-center">Qty</th>
                                                            <th scope="col" className="px-4 py-2 text-center">Status</th>
                                                            <th scope="col" className="px-4 py-2 text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-700/50">
                                                        {order.items.map(item => {
                                                            const bahan = bahanList.find(b => b.id === item.bahanId);
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td className="px-4 py-3 font-medium text-slate-300">{bahan?.name || 'N/A'}</td>
                                                                    <td className="px-4 py-3">{item.panjang > 0 && item.lebar > 0 ? `${item.panjang}m x ${item.lebar}m` : '-'}</td>
                                                                    <td className="px-4 py-3 text-center">{item.qty}</td>
                                                                    <td className="px-4 py-3 text-center">
                                                                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.statusProduksi)}`}>
                                                                            {item.statusProduksi}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-center space-x-2">
                                                                        <button 
                                                                            onClick={() => handleStatusChange(order.id, item.id, 'Proses')}
                                                                            disabled={item.statusProduksi === 'Proses' || item.statusProduksi === 'Selesai'}
                                                                            className="px-3 py-1 text-xs font-semibold text-yellow-300 bg-yellow-500/10 rounded-md hover:bg-yellow-500/20 disabled:bg-gray-500/10 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            Proses
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleStatusChange(order.id, item.id, 'Selesai')}
                                                                            disabled={item.statusProduksi === 'Selesai'}
                                                                            className="px-3 py-1 text-xs font-semibold text-green-300 bg-green-500/10 rounded-md hover:bg-green-500/20 disabled:bg-gray-500/10 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                                                        >
                                                                            Selesai
                                                                        </button>
                                                                    </td>
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

        </div>
    );
};

export default ProductionManagement;