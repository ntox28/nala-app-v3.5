import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, PieChart, Pie, Cell } from 'recharts';
import { Order } from '../orders/OrderManagement';
import { Customer } from '../customers/CustomerManagement';
import { Expense } from '../expenses/ExpenseManagement';
import StatCard from './StatCard';
import OrderIcon from '../icons/OrderIcon';
import ClipboardListIcon from '../icons/ClipboardListIcon';
import UsersGroupIcon from '../icons/UsersGroupIcon';
import ProductionIcon from '../icons/ProductionIcon';
import Pagination from '../Pagination';

interface DashboardViewProps {
    orders: Order[];
    customers: Customer[];
    expenses: Expense[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
    });
};

const DashboardView: React.FC<DashboardViewProps> = ({ orders, customers, expenses }) => {
    const today = new Date();
    
    // Pagination state for recent orders
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    
    // Stats Cards Data
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !['Lunas'].includes(o.statusPembayaran)).length;
    const itemsToProcess = orders
        .flatMap(o => o.items)
        .filter(item => item.statusProduksi !== 'Selesai').length;
    const totalCustomers = customers.length;


    // Weekly Orders Chart Data
    const weeklyOrdersData = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        return {
            name: formatDate(dateStr),
            orders: orders.filter(o => o.tanggal === dateStr).length,
        };
    }).reverse();

    // Production Status Chart Data
    const productionStatus = orders.flatMap(o => o.items).reduce((acc, item) => {
        acc[item.statusProduksi] = (acc[item.statusProduksi] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const productionData = Object.entries(productionStatus).map(([name, value]) => ({ name, value }));
    const PIE_COLORS = {
        'Selesai': '#22c55e',
        'Proses': '#f59e0b',
        'Belum Dikerjakan': '#64748b',
    };

    const sortedRecentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()), [orders]);

    const totalPages = Math.ceil(sortedRecentOrders.length / ITEMS_PER_PAGE);
    const currentOrders = sortedRecentOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Pesanan" value={totalOrders.toString()} icon={<OrderIcon />} />
                <StatCard title="Pesanan Aktif" value={activeOrders.toString()} icon={<ClipboardListIcon />} />
                <StatCard title="Item Perlu Diproses" value={itemsToProcess.toString()} icon={<ProductionIcon />} />
                <StatCard title="Total Pelanggan" value={totalCustomers.toString()} icon={<UsersGroupIcon />} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Pesanan Seminggu Terakhir</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyOrdersData}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#cbd5e1' }}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Bar dataKey="orders" name="Jumlah Pesanan" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col justify-center">
                     <h3 className="text-lg font-semibold text-white mb-4 text-center">Status Produksi</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={productionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {productionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#8884d8'} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                            <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             {/* Recent Activity */}
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terbaru</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">No. Nota</th>
                                <th scope="col" className="px-6 py-3">Pelanggan</th>
                                <th scope="col" className="px-6 py-3">Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-right">Status Bayar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.map(order => (
                                <tr key={order.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 font-medium text-white">{order.noNota}</td>
                                    <td className="px-6 py-4">{customers.find(c => c.id === order.pelangganId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatDate(order.tanggal)}</td>
                                    <td className="px-6 py-4 text-right">{order.statusPembayaran}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default DashboardView;