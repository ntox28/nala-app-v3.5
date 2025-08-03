
import React, { forwardRef } from 'react';
import { Customer } from '../customers/CustomerManagement';
import { Bahan } from '../bahan/BahanManagement';
import { Order } from '../orders/OrderManagement';
import { User } from '../Login';

interface NotaProps {
  order: Order;
  customers: Customer[];
  bahanList: Bahan[];
  users: User[];
  calculateTotal: (order: Order) => number;
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
    return new Date(isoDate).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const getPriceForCustomer = (bahan: Bahan, level: Customer['level']): number => {
    switch (level) {
        case 'End Customer': return bahan.hargaEndCustomer;
        case 'Retail': return bahan.hargaRetail;
        case 'Grosir': return bahan.hargaGrosir;
        case 'Reseller': return bahan.hargaReseller;
        case 'Corporate': return bahan.hargaCorporate;
        default: return 0;
    }
};

const Nota = forwardRef<HTMLDivElement, NotaProps>(({ order, customers, bahanList, users, calculateTotal }, ref) => {
  const customer = customers.find(c => c.id === order.pelangganId);
  const lastPayment = order.payments.length > 0 ? order.payments[order.payments.length - 1] : null;
  const kasir = users.find(u => u.id === lastPayment?.kasirId);
  const totalTagihan = calculateTotal(order);
  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);


  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans text-sm w-[210mm] min-h-[297mm]">
      <div className="flex justify-between items-start pb-4 border-b-2 border-black">
        <div>
          <h1 className="text-3xl font-bold">NOTA PENJUALAN</h1>
          <p className="text-lg font-semibold">Software Kasir</p>
          <p>Alamat Toko Anda Di Sini</p>
          <p>Telepon: 0812-3456-7890</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">No. Nota:</span> {order.noNota}</p>
          <p><span className="font-bold">Tanggal:</span> {formatDate(order.tanggal)}</p>
        </div>
      </div>

      <div className="flex justify-between items-start mt-6">
        <div>
          <h2 className="font-bold mb-1">Kepada Yth:</h2>
          <p className="font-semibold">{customer?.name || 'N/A'}</p>
          <p>{customer?.address || ''}</p>
          <p>{customer?.phone || ''}</p>
        </div>
        <div className="text-right">
            <h2 className="font-bold mb-1">Kasir:</h2>
            <p className="capitalize">{kasir?.id || 'N/A'}</p>
        </div>
      </div>

      <div className="mt-8">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr className="border-b border-black">
              <th className="px-4 py-2 text-left font-bold">No.</th>
              <th className="px-4 py-2 text-left font-bold">Deskripsi Item</th>
              <th className="px-4 py-2 text-right font-bold">Qty</th>
              <th className="px-4 py-2 text-right font-bold">Harga Satuan</th>
              <th className="px-4 py-2 text-right font-bold">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => {
              const bahan = bahanList.find(b => b.id === item.bahanId);
              if (!bahan || !customer) return null;
              
              const hargaSatuan = getPriceForCustomer(bahan, customer.level);
              const itemArea = item.panjang > 0 && item.lebar > 0 ? item.panjang * item.lebar : 1;
              const jumlah = hargaSatuan * itemArea * item.qty;

              return (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">
                    <p className="font-semibold">{bahan.name}</p>
                    <p className="text-xs text-gray-600">{item.deskripsiPesanan} {item.panjang > 0 && `(${item.panjang}m x ${item.lebar}m)`}</p>
                  </td>
                  <td className="px-4 py-2 text-right">{item.qty}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(hargaSatuan * itemArea)}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(jumlah)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <div className='w-1/2'>
          <h3 className="font-bold mb-1">Riwayat Pembayaran:</h3>
          <table className="w-full text-xs">
            <tbody>
              {order.payments.map((p, i) => (
                  <tr key={i}>
                    <td className='py-0.5'>{new Date(p.date).toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'})}</td>
                    <td className='py-0.5 text-right'>{formatCurrency(p.amount)}</td>
                  </tr>
              ))}
              {!order.payments.length && (<tr><td colSpan={2} className="py-0.5 text-gray-500">Belum ada pembayaran.</td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="w-1/2">
          <div className="flex justify-between py-1">
            <span className="font-bold">Subtotal:</span>
            <span className="font-bold">{formatCurrency(totalTagihan)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-400">
             <span className="font-bold">Diskon:</span>
            <span className="font-bold">{formatCurrency(0)}</span>
          </div>
          <div className="flex justify-between py-2 text-lg bg-gray-200 px-2 my-2 rounded">
            <span className="font-bold">TOTAL TAGIHAN:</span>
            <span className="font-bold">{formatCurrency(totalTagihan)}</span>
          </div>
           <div className="flex justify-between py-1">
            <span className="font-bold">Jumlah Bayar:</span>
            <span className="font-bold">{formatCurrency(totalPaid)}</span>
          </div>
           <div className="flex justify-between py-1 text-red-600">
            <span className="font-bold">Sisa Tagihan:</span>
            <span className="font-bold">{formatCurrency(totalTagihan - totalPaid)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center border-t-2 border-black pt-4">
        <p className="font-bold">Terima kasih atas kepercayaan Anda!</p>
        <p className="text-xs mt-2">Barang yang sudah dibeli tidak dapat dikembalikan.</p>
      </div>

    </div>
  );
});

export default Nota;
