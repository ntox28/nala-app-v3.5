import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { Order } from '../orders/OrderManagement';
import { Customer, CustomerLevel } from '../customers/CustomerManagement';
import { Bahan } from '../bahan/BahanManagement';
import { Expense } from '../expenses/ExpenseManagement';
import { User } from '../Login';
import StatCard from '../dashboard/StatCard';
import TrendingUpIcon from '../icons/TrendingUpIcon';
import TrendingDownIcon from '../icons/TrendingDownIcon';
import FinanceIcon from '../icons/FinanceIcon';
import OrderIcon from '../icons/OrderIcon';
import Pagination from '../Pagination';
import DocumentReportIcon from '../icons/DocumentReportIcon';
import Reports from './Reports';

interface FinanceViewProps {
    orders: Order[];
    expenses: Expense[];
    customers: Customer[];
    bahanList: Bahan[];
    users: User[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const getPriceForCustomer = (bahan: Bahan, level: CustomerLevel): number => {
    switch (level) {
        case 'End Customer': return bahan.hargaEndCustomer;
        case 'Retail': return bahan.hargaRetail;
        case 'Grosir': return bahan.hargaGrosir;
        case 'Reseller': return bahan.hargaReseller;
        case 'Corporate': return bahan.hargaCorporate;
        default: return 0;
    }
};

const calculateOrderTotal = (order: Order, customers: Customer[], bahanList: Bahan[]): number => {
    const customer = customers.find(c => c.id === order.pelangganId);
    if (!customer) return 0;

    return order.items.reduce((total, item) => {
        const bahan = bahanList.find(b => b.id === item.bahanId);
        if (!bahan) return total;

        const price = getPriceForCustomer(bahan, customer.level);
        const itemArea = item.panjang > 0 && item.lebar > 0 ? item.panjang * item.lebar : 1;
        const itemTotal = price * itemArea * item.qty;
        return total + itemTotal;
    }, 0);
};

const FinanceView: React.FC<FinanceViewProps> = (props) => {
    const [activeTab, setActiveTab] = useState('summary');

    const SummaryView: React.FC = () => {
        const [transactionsPage, setTransactionsPage] = useState(1);
        const [expensesPage, setExpensesPage] = useState(1);
        const ITEMS_PER_PAGE = 10;

        const { totalRevenue, totalExpenses, netProfit, totalReceivables, cashflowData } = useMemo(() => {
            const totalRevenue = props.orders.flatMap(o => o.payments).reduce((sum, p) => sum + p.amount, 0);
            const totalExpenses = props.expenses.reduce((sum, exp) => sum + (exp.harga * exp.qty), 0);
            const netProfit = totalRevenue - totalExpenses;
            
            const totalReceivables = props.orders.reduce((sum, order) => {
                if (order.statusPembayaran === 'Lunas') return sum;
                const totalTagihan = calculateOrderTotal(order, props.customers, props.bahanList);
                const totalPaid = order.payments.reduce((acc, p) => acc + p.amount, 0);
                return sum + (totalTagihan - totalPaid);
            }, 0);

            const dataByDate: Record<string, { revenue: number, expense: number }> = {};
            
            props.orders.flatMap(o => o.payments).forEach(payment => {
                const date = payment.date;
                if (!dataByDate[date]) dataByDate[date] = { revenue: 0, expense: 0 };
                dataByDate[date].revenue += payment.amount;
            });

            props.expenses.forEach(expense => {
                const date = expense.tanggal;
                if (!dataByDate[date]) dataByDate[date] = { revenue: 0, expense: 0 };
                dataByDate[date].expense += expense.harga * expense.qty;
            });
            
            const cashflowData = Object.keys(dataByDate)
                .sort((a,b) => new Date(a).getTime() - new Date(b).getTime())
                .slice(-30) // Show last 30 days
                .map(date => ({
                    name: new Date(date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'}),
                    Pendapatan: dataByDate[date].revenue,
                    Pengeluaran: dataByDate[date].expense,
                }));

            return { totalRevenue, totalExpenses, netProfit, totalReceivables, cashflowData };
        }, [props.orders, props.expenses, props.customers, props.bahanList]);

        const recentTransactions = useMemo(() => {
            return props.orders
                .flatMap(order => {
                    const customer = props.customers.find(c => c.id === order.pelangganId);
                    return order.payments.map((p, index) => ({
                        orderNoNota: order.noNota,
                        customerName: customer?.name || 'N/A',
                        amount: p.amount,
                        date: p.date,
                        id: `${order.id}-${index}`
                    }));
                })
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }, [props.orders, props.customers]);

        const totalTransactionPages = Math.ceil(recentTransactions.length / ITEMS_PER_PAGE);
        const currentTransactions = recentTransactions.slice((transactionsPage - 1) * ITEMS_PER_PAGE, transactionsPage * ITEMS_PER_PAGE);

        const recentExpenses = useMemo(() => [...props.expenses].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()), [props.expenses]);
        const totalExpensePages = Math.ceil(recentExpenses.length / ITEMS_PER_PAGE);
        const currentExpenses = recentExpenses.slice((expensesPage - 1) * ITEMS_PER_PAGE, expensesPage * ITEMS_PER_PAGE);

        return (
            <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Total Pendapatan" value={formatCurrency(totalRevenue)} icon={<TrendingUpIcon />} />
                    <StatCard title="Total Pengeluaran" value={formatCurrency(totalExpenses)} icon={<TrendingDownIcon />} />
                    <StatCard title="Laba Bersih" value={formatCurrency(netProfit)} icon={<FinanceIcon />} />
                    <StatCard title="Total Piutang" value={formatCurrency(totalReceivables)} icon={<OrderIcon />} />
                </div>

                {/* Cashflow Chart */}
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Arus Kas (30 Hari Terakhir)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={cashflowData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${formatCurrency(value as number).split(',')[0]}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#cbd5e1' }}
                                formatter={(value) => formatCurrency(value as number)}
                            />
                            <Legend wrapperStyle={{fontSize: "14px"}}/>
                            <Line type="monotone" dataKey="Pendapatan" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="Pengeluaran" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                
                 {/* Recent Transactions & Expenses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Transaksi Terbaru</h3>
                        <div className="overflow-x-auto flex-1">
                             <table className="w-full text-sm text-left text-slate-300">
                                <tbody>
                                    {currentTransactions.map(tx => (
                                        <tr key={tx.id} className="border-b border-slate-700">
                                            <td className="py-3">
                                                <p className="font-medium text-white">{tx.orderNoNota}</p>
                                                <p className="text-xs text-slate-400">{tx.customerName}</p>
                                            </td>
                                            <td className="py-3 text-right">
                                                <p className="font-semibold text-green-400">{formatCurrency(tx.amount)}</p>
                                                <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString('id-ID', {day:'numeric', month:'long'})}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         <Pagination currentPage={transactionsPage} totalPages={totalTransactionPages} onPageChange={setTransactionsPage} />
                    </div>
                     <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Pengeluaran Terbaru</h3>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-sm text-left text-slate-300">
                                <tbody>
                                    {currentExpenses.map(exp => (
                                        <tr key={exp.id} className="border-b border-slate-700">
                                            <td className="py-3">
                                                <p className="font-medium text-white">{exp.jenisPengeluaran}</p>
                                                <p className="text-xs text-slate-400">{new Date(exp.tanggal).toLocaleDateString('id-ID', {day:'numeric', month:'long'})}</p>
                                            </td>
                                            <td className="py-3 text-right font-semibold text-red-400">{formatCurrency(exp.harga * exp.qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={expensesPage} totalPages={totalExpensePages} onPageChange={setExpensesPage} />
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="space-y-8">
             <div className="border-b border-slate-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'summary'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                    >
                        Ringkasan
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'reports'
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        }`}
                    >
                        <DocumentReportIcon className="w-5 h-5 mr-2" />
                        Laporan
                    </button>
                </nav>
            </div>
            
            <div>
                {activeTab === 'summary' && <SummaryView />}
                {activeTab === 'reports' && <Reports {...props} calculateOrderTotal={calculateOrderTotal} getPriceForCustomer={getPriceForCustomer} formatCurrency={formatCurrency} />}
            </div>
        </div>
    );
};

export default FinanceView;
