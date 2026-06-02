'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get('/invoices', { params: { limit: 50 } });
      setInvoices(resp.data.data.items);
    } catch {
      toast.error('Gagal memuat data invoice');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      PAID: 'success',
      UNPAID: 'warning',
      DRAFT: 'info',
      CANCELLED: 'danger',
    };
    return <Badge variant={map[status] || 'default'}>{status}</Badge>;
  };

  const handleDelete = async (id: string, num: string, status: string) => {
    if (status !== 'DRAFT') {
      toast.error('Hanya invoice DRAFT yang bisa dihapus');
      return;
    }
    if (!confirm(`Hapus invoice ${num}?`)) return;
    try {
      await apiClient.delete(`/invoices/${id}`);
      toast.success('Invoice dihapus');
      fetchInvoices();
    } catch {
      toast.error('Gagal menghapus invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
          <p className="text-gray-600">Kelola dokumen penagihan</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/new" className="flex items-center gap-2">
            <Plus size={18} strokeWidth={2.5} />
            Buat Invoice Baru
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada invoice</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 font-medium">Nomor</th>
                    <th className="pb-3 font-medium">Pelanggan</th>
                    <th className="pb-3 font-medium">Tanggal</th>
                    <th className="pb-3 font-medium">Jatuh Tempo</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium text-primary-600">{inv.invoiceNumber}</td>
                      <td className="py-3">{inv.customer?.name || '-'}</td>
                      <td className="py-3 text-gray-600">{formatDate(inv.issueDate, 'short')}</td>
                      <td className="py-3 text-gray-600">{formatDate(inv.dueDate, 'short')}</td>
                      <td className="py-3 font-semibold">{formatCurrency(inv.totalAmount)}</td>
                      <td className="py-3">{getStatusBadge(inv.status)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`/dashboard/invoices/${inv.id}`}>
                              <Eye size={14} />
                            </a>
                          </Button>
                          {inv.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-danger hover:bg-red-50"
                              onClick={() => handleDelete(inv.id, inv.invoiceNumber, inv.status)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
