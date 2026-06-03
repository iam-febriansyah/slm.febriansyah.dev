'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { formatCurrency, formatDate } from '@/shared/lib/format';
import { FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get('/dashboard/summary');
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Tidak ada data</div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Invoice', value: data.totalInvoices, icon: FileText, color: 'text-primary-600' },
    { label: 'Total Revenue', value: formatCurrency(data.totalRevenue), icon: DollarSign, color: 'text-green-600' },
    { label: 'Paid', value: data.paidCount, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Unpaid', value: data.unpaidCount, icon: Clock, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Ringkasan bisnis Anda</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`rounded-full bg-gray-100 p-3 ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {data.recentInvoices && data.recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {data.recentInvoices.slice(0, 5).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-sm text-gray-500">{formatDate(invoice.issue_date)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{formatCurrency(invoice.total_amount)}</p>
                    <Badge
                      variant={
                        invoice.status === 'PAID'
                          ? 'success'
                          : invoice.status === 'UNPAID'
                          ? 'warning'
                          : invoice.status === 'DRAFT'
                          ? 'info'
                          : 'danger'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada invoice</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
