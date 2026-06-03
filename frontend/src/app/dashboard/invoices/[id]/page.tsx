'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { ArrowLeft, CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft', UNPAID: 'Belum Bayar', PAID: 'Lunas', CANCELLED: 'Dibatalkan',
};

const STATUS_BADGE: Record<string, any> = {
  DRAFT: 'info', UNPAID: 'warning', PAID: 'success', CANCELLED: 'danger',
};

const TRANSITIONS: Record<string, { label: string; status: string; icon: any; variant: any }[]> = {
  DRAFT: [
    { label: 'Kirim Invoice', status: 'UNPAID', icon: Send, variant: 'primary' },
    { label: 'Batalkan', status: 'CANCELLED', icon: XCircle, variant: 'danger' },
  ],
  UNPAID: [
    { label: 'Tandai Lunas', status: 'PAID', icon: CheckCircle, variant: 'primary' },
    { label: 'Batalkan', status: 'CANCELLED', icon: XCircle, variant: 'danger' },
  ],
  PAID: [],
  CANCELLED: [],
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => { fetchInvoice(); }, [id]);

  const fetchInvoice = async () => {
    try {
      const resp = await apiClient.get(`/invoices/${id}`);
      setInvoice(resp.data.data);
    } catch {
      toast.error('Gagal memuat invoice');
      router.push('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!confirm(`Ubah status ke ${STATUS_LABELS[status]}?`)) return;
    setUpdating(true);
    try {
      await apiClient.patch(`/invoices/${id}/status`, { status });
      toast.success(`Status diubah ke ${STATUS_LABELS[status]}`);
      fetchInvoice();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading...</div>;
  if (!invoice) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/invoices')}>
            <ArrowLeft size={18} /> Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <Badge variant={STATUS_BADGE[invoice.status]}>{STATUS_LABELS[invoice.status]}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {(TRANSITIONS[invoice.status] || []).map((t) => {
            const Icon = t.icon;
            return (
              <Button key={t.status} variant={t.variant} onClick={() => handleStatusChange(t.status)} isLoading={updating}>
                <Icon size={16} strokeWidth={2.5} />{t.label}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Informasi Invoice</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{formatDate(invoice.issue_date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Jatuh Tempo</span><span>{formatDate(invoice.due_date)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Dibuat oleh</span><span>{invoice.user?.name || '-'}</span></div>
            {invoice.notes && <div><span className="text-gray-500">Catatan:</span><p className="mt-1 text-gray-800">{invoice.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pelanggan</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="font-semibold text-gray-900">{invoice.customer?.name}</p>
            <p className="text-gray-600">{invoice.customer?.email || '-'}</p>
            <p className="text-gray-600">{invoice.customer?.phone || '-'}</p>
            <p className="text-gray-600">{invoice.customer?.address || '-'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Item Invoice</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-600">
                <th className="pb-2 font-medium">Deskripsi</th>
                <th className="pb-2 font-medium text-right">Qty</th>
                <th className="pb-2 font-medium text-right">Harga Satuan</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.map((item: any) => (
                <tr key={item.id} className="border-b last:border-0">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 space-y-2 text-sm border-t pt-4">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {Number(invoice.discount_percent) > 0 && (
              <div className="flex justify-between text-red-600"><span>Diskon ({invoice.discount_percent}%)</span><span>- {formatCurrency(invoice.discount_amount)}</span></div>
            )}
            {Number(invoice.tax_percent) > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Pajak ({invoice.tax_percent}%)</span><span>{formatCurrency(invoice.tax_amount)}</span></div>
            )}
            <div className="flex justify-between text-base font-bold border-t pt-2"><span>TOTAL</span><span>{formatCurrency(invoice.total_amount)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
