import React, { useState } from 'react';
import LoginComponent, { User } from './components/Login';
import DashboardComponent from './components/Dashboard';
import { Customer } from './components/customers/CustomerManagement';
import { Bahan } from './components/bahan/BahanManagement';
import { Order, Payment } from './components/orders/OrderManagement';
import { Employee } from './components/employees/EmployeeManagement';
import { Expense } from './components/expenses/ExpenseManagement';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/toasts/ToastContainer';
import useLocalStorage from './hooks/useLocalStorage';


const initialUsers: User[] = [
    { id: 'admin', password: 'admin', level: 'Admin' },
    { id: 'kasir', password: 'kasir', level: 'Kasir' },
    { id: 'produksi', password: 'produksi', level: 'Produksi' },
    { id: 'office', password: 'office', level: 'Office' },
];

const initialCustomers: Customer[] = [
    { id: 1, name: 'Budi Santoso', email: 'budi.s@example.com', phone: '081234567890', address: 'Jl. Merdeka No. 10, Jakarta', level: 'Retail' },
    { id: 2, name: 'Citra Lestari', email: 'citra.l@example.com', phone: '082345678901', address: 'Jl. Sudirman No. 25, Bandung', level: 'End Customer' },
    { id: 3, name: 'Dewi Anggraini', email: 'dewi.a@example.com', phone: '083456789012', address: 'Jl. Gajah Mada No. 5, Surabaya', level: 'Grosir' },
    { id: 4, name: 'Eko Prasetyo', email: 'eko.p@example.com', phone: '085678901234', address: 'Jl. Pahlawan No. 12, Semarang', level: 'Reseller' },
    { id: 5, name: 'Antok Sugiyanto', email: 'antokbosok@gmail.com', phone: '082247770012', address: 'Karanganyar Kota', level: 'Corporate' },
];

const initialBahan: Bahan[] = [
    { id: 1, name: 'Flexi 280gr', hargaEndCustomer: 25000, hargaRetail: 22000, hargaGrosir: 20000, hargaReseller: 18000, hargaCorporate: 15000 },
    { id: 2, name: 'Flexi 340gr', hargaEndCustomer: 30000, hargaRetail: 28000, hargaGrosir: 25000, hargaReseller: 23000, hargaCorporate: 20000 },
    { id: 3, name: 'Artpaper', hargaEndCustomer: 15000, hargaRetail: 13000, hargaGrosir: 11000, hargaReseller: 10000, hargaCorporate: 8000 },
    { id: 4, name: 'Art Carton', hargaEndCustomer: 20000, hargaRetail: 18000, hargaGrosir: 16000, hargaReseller: 14000, hargaCorporate: 12000 },
    { id: 5, name: 'One Way Vision', hargaEndCustomer: 75000, hargaRetail: 70000, hargaGrosir: 65000, hargaReseller: 60000, hargaCorporate: 55000 },
    { id: 6, name: 'Sticker Vynil', hargaEndCustomer: 50000, hargaRetail: 45000, hargaGrosir: 40000, hargaReseller: 38000, hargaCorporate: 35000 },
];

const initialEmployees: Employee[] = [
    { id: 1, name: 'Andi Wijaya', position: 'Sales', email: 'andi.w@example.com', phone: '081122334455' },
    { id: 2, name: 'Siti Aminah', position: 'Kasir', email: 'siti.a@example.com', phone: '081234567891' },
    { id: 3, name: 'Rina Fauziah', position: 'Designer', email: 'rina.f@example.com', phone: '082233445566' },
    { id: 4, name: 'Joko Susilo', position: 'Produksi', email: 'joko.s@example.com', phone: '085566778899' },
    { id: 5, name: 'Lina Marlina', position: 'Office', email: 'lina.m@example.com', phone: '087788990011' },
];

const initialExpenses: Expense[] = [
    { id: 1, tanggal: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], jenisPengeluaran: 'Pembelian Tinta Printer', qty: 2, harga: 150000 },
    { id: 2, tanggal: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], jenisPengeluaran: 'Biaya Listrik', qty: 1, harga: 500000 },
    { id: 3, tanggal: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], jenisPengeluaran: 'Gaji Karyawan - Siti', qty: 1, harga: 2500000 },
    { id: 4, tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], jenisPengeluaran: 'Pembelian Kertas A4 (rim)', qty: 5, harga: 50000 },
    { id: 5, tanggal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], jenisPengeluaran: 'Biaya Internet', qty: 1, harga: 350000 },
];

const initialOrders: Order[] = [
    { 
        id: 1, noNota: 'INV-001', tanggal: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], pelangganId: 1, pelaksanaId: 4, statusPembayaran: 'Lunas',
        payments: [{ amount: 374000, date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], kasirId: 'kasir' }],
        items: [{ id: 101, bahanId: 1, deskripsiPesanan: 'Banner untuk Toko', panjang: 2, lebar: 1, qty: 2, statusProduksi: 'Selesai' }]
    },
    { 
        id: 2, noNota: 'INV-002', tanggal: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], pelangganId: 5, pelaksanaId: 4, statusPembayaran: 'Lunas',
        payments: [{ amount: 2200000, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], kasirId: 'kasir' }],
        items: [{ id: 102, bahanId: 5, deskripsiPesanan: 'Sticker Kaca Kantor', panjang: 5, lebar: 2, qty: 4, statusProduksi: 'Selesai' }]
    },
    { 
        id: 3, noNota: 'INV-003', tanggal: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], pelangganId: 2, pelaksanaId: 4, statusPembayaran: 'Belum Lunas',
        payments: [],
        items: [
            { id: 103, bahanId: 3, deskripsiPesanan: 'Brosur Promosi', panjang: 0, lebar: 0, qty: 500, statusProduksi: 'Selesai' },
            { id: 104, bahanId: 6, deskripsiPesanan: 'Sticker Logo', panjang: 0, lebar: 0, qty: 100, statusProduksi: 'Selesai' }
        ]
    },
    { 
        id: 4, noNota: 'INV-004', tanggal: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], pelangganId: 3, pelaksanaId: null, statusPembayaran: 'Belum Lunas',
        payments: [],
        items: [{ id: 105, bahanId: 2, deskripsiPesanan: 'Spanduk Event', panjang: 5, lebar: 1, qty: 5, statusProduksi: 'Proses' }]
    },
     { 
        id: 5, noNota: 'INV-005', tanggal: new Date().toISOString().split('T')[0], pelangganId: 4, pelaksanaId: null, statusPembayaran: 'Belum Lunas',
        payments: [],
        items: [{ id: 106, bahanId: 4, deskripsiPesanan: 'Kartu Nama', panjang: 0, lebar: 0, qty: 200, statusProduksi: 'Belum Dikerjakan' }]
    },
];

const App: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const [users, setUsers] = useLocalStorage<User[]>('nala-app:users', initialUsers);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('nala-app:customers', initialCustomers);
  const [bahanList, setBahanList] = useLocalStorage<Bahan[]>('nala-app:bahan', initialBahan);
  const [employees, setEmployees] = useLocalStorage<Employee[]>('nala-app:employees', initialEmployees);
  const [orders, setOrders] = useLocalStorage<Order[]>('nala-app:orders', initialOrders);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('nala-app:expenses', initialExpenses);


  const handleLoginSuccess = (user: User) => {
    setLoggedInUser(user);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const handleUsersUpdate = (updatedUsers: User[]) => {
      setUsers(updatedUsers);
  };

  const handleCustomersUpdate = (updatedCustomers: Customer[]) => {
      setCustomers(updatedCustomers);
  };

  const handleBahanUpdate = (updatedBahan: Bahan[]) => {
      setBahanList(updatedBahan);
  };

  const handleEmployeesUpdate = (updatedEmployees: Employee[]) => {
    setEmployees(updatedEmployees);
  };
  
  const handleOrdersUpdate = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
  };
  
  const handleExpensesUpdate = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
  }


  return (
    <ToastProvider>
        <div className="min-h-screen bg-slate-900 selection:bg-sky-500 selection:text-white">
        <ToastContainer />
        {loggedInUser ? (
            <DashboardComponent 
            user={loggedInUser} 
            onLogout={handleLogout} 
            users={users}
            onUsersUpdate={handleUsersUpdate}
            customers={customers}
            onCustomersUpdate={handleCustomersUpdate}
            bahanList={bahanList}
            onBahanUpdate={handleBahanUpdate}
            employees={employees}
            onEmployeesUpdate={handleEmployeesUpdate}
            orders={orders}
            onOrdersUpdate={handleOrdersUpdate}
            expenses={expenses}
            onExpensesUpdate={handleExpensesUpdate}
            />
        ) : (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
                <LoginComponent onLoginSuccess={handleLoginSuccess} users={users} />
            </div>
        )}
        </div>
    </ToastProvider>
  );
};

export default App;