'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatDate } from '@/shared/lib/format';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get('/customers', { params: { search, limit: 50 } });
      setCustomers(resp.data.data.items);
    } catch {
      toast.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus pelanggan "${name}"?`)) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      toast.success('Pelanggan dihapus');
      fetchCustomers();
    } catch {
      toast.error('Gagal menghapus pelanggan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-600">Kelola data pelanggan bisnis</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/customers/new" className="flex items-center gap-2">
            <Plus size={18} strokeWidth={2.5} />
            Tambah Pelanggan
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Belum ada pelanggan</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Telepon</th>
                    <th className="pb-3 font-medium">Terdaftar</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3 text-gray-600">{c.email || '-'}</td>
                      <td className="py-3 text-gray-600">{c.phone || '-'}</td>
                      <td className="py-3 text-gray-600">{formatDate(c.createdAt, 'short')}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`/dashboard/customers/${c.id}`}>
                              <Pencil size={14} />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-red-50"
                            onClick={() => handleDelete(c.id, c.name)}
                          >
                            <Trash2 size={14} />
                          </Button>
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
