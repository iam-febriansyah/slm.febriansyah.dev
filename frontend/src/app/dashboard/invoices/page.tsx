'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Eye, Trash2, Edit } from 'lucide-react';
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
                      <td className="py-3 font-medium text-primary-600"><a href={`/dashboard/invoices/${inv.id}`}>{inv.invoice_number}</a></td>
                      <td className="py-3">{inv.customer?.name || '-'}</td>
                      <td className="py-3 text-gray-600">{formatDate(inv.issue_date, 'short')}</td>
                      <td className="py-3 text-gray-600">{formatDate(inv.due_date, 'short')}</td>
                      <td className="py-3 font-semibold">{formatCurrency(inv.total_amount)}</td>
                      <td className="py-3">{getStatusBadge(inv.status)}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {/* View Button */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            asChild
                          >
                            <a href={`/dashboard/invoices/${inv.id}`} title="Lihat Detail">
                              <Eye size={16} />
                            </a>
                          </Button>

                          {/* Edit Button - only for DRAFT */}
                          {inv.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              asChild
                            >
                              <a href={`/dashboard/invoices/${inv.id}/edit`} title="Edit Invoice">
                                <Edit size={16} />
                              </a>
                            </Button>
                          )}

                          {/* Delete Button - only for DRAFT */}
                          {inv.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                              onClick={() => handleDelete(inv.id, inv.invoice_number, inv.status)}
                              title="Hapus Invoice"
                            >
                              <Trash2 size={16} />
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
