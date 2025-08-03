
import React, { useState, useMemo } from 'react';
import MainContent from './MainContent';
import DashboardIcon from './icons/DashboardIcon';
import FinanceIcon from './icons/FinanceIcon';
import OrderIcon from './icons/OrderIcon';
import ProductionIcon from './icons/ProductionIcon';
import TransactionIcon from './icons/TransactionIcon';
import ExpenseIcon from './icons/ExpenseIcon';
import IngredientsIcon from './icons/IngredientsIcon';
import CustomersIcon from './icons/CustomersIcon';
import EmployeesIcon from './icons/EmployeesIcon';
import SettingsIcon from './icons/SettingsIcon';
import LogoutIcon from './icons/LogoutIcon';
import { User } from './Login';
import { Customer } from './customers/CustomerManagement';
import { Bahan } from './bahan/BahanManagement';
import { Order } from './orders/OrderManagement';
import { Employee } from './employees/EmployeeManagement';
import { Expense } from './expenses/ExpenseManagement';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  users: User[];
  onUsersUpdate: (users: User[]) => void;
  customers: Customer[];
  onCustomersUpdate: (customers: Customer[]) => void;
  bahanList: Bahan[];
  onBahanUpdate: (bahan: Bahan[]) => void;
  employees: Employee[];
  onEmployeesUpdate: (employees: Employee[]) => void;
  orders: Order[];
  onOrdersUpdate: (orders: Order[]) => void;
  expenses: Expense[];
  onExpensesUpdate: (expenses: Expense[]) => void;
}

const allMenuItems = [
  { name: 'Dashboard', icon: DashboardIcon, roles: ['Admin', 'Kasir', 'Produksi', 'Office'] },
  { name: 'Keuangan', icon: FinanceIcon, roles: ['Admin'] },
  { name: 'Order', icon: OrderIcon, roles: ['Admin', 'Kasir', 'Office'] },
  { name: 'Produksi', icon: ProductionIcon, roles: ['Admin', 'Kasir', 'Produksi', 'Office'] },
  { name: 'Transaksi', icon: TransactionIcon, roles: ['Admin', 'Kasir'] },
  { name: 'Pengeluaran', icon: ExpenseIcon, roles: ['Admin', 'Kasir'] },
  { name: 'Daftar Bahan', icon: IngredientsIcon, roles: ['Admin', 'Kasir'] },
  { name: 'Daftar Pelanggan', icon: CustomersIcon, roles: ['Admin', 'Kasir'] },
  { name: 'Daftar Karyawan', icon: EmployeesIcon, roles: ['Admin', 'Kasir'] },
  { name: 'Pengaturan', icon: SettingsIcon, roles: ['Admin'] },
];

const DashboardComponent: React.FC<DashboardProps> = (props) => {
  const { user, onLogout } = props;

  const visibleMenuItems = useMemo(() => {
    return allMenuItems.filter(item => item.roles.includes(user.level));
  }, [user.level]);

  const [activeView, setActiveView] = useState(visibleMenuItems[0]?.name || 'Dashboard');

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col">
        <div className="h-20 flex items-center justify-center border-b border-slate-700">
          <h1 className="text-2xl font-bold text-sky-500">Nala Media</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.name;
            return (
              <a
                key={item.name}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.name);
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="h-6 w-6 mr-4" />
                <span className="font-medium">{item.name}</span>
              </a>
            );
          })}
        </nav>
        <div className="px-4 py-6 border-t border-slate-700">
            <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200"
            >
                <LogoutIcon className="h-6 w-6 mr-4" />
                <span className="font-medium">Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <MainContent 
            {...props}
            activeView={activeView} 
        />
      </main>
    </div>
  );
};

export default DashboardComponent;
