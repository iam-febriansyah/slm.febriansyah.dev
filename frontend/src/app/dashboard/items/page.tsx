'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { formatCurrency } from '@/shared/lib/format';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, [search]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const resp = await apiClient.get('/items', { params: { search, limit: 50 } });
      setItems(resp.data.data.items);
    } catch {
      toast.error('Gagal memuat katalog barang');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus barang "${name}"?`)) return;
    try {
      await apiClient.delete(`/items/${id}`);
      toast.success('Barang dihapus');
      fetchItems();
    } catch {
      toast.error('Gagal menghapus barang');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Katalog Barang</h1>
          <p className="text-gray-600">Manajemen master item untuk invoice</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/items/new" className="flex items-center gap-2">
            <Plus size={18} strokeWidth={2.5} />
            Tambah Barang
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Search size={18} className="text-gray-400" />
            <Input
              placeholder="Cari nama barang atau SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Katalog kosong</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-600">
                    <th className="pb-3 font-medium">SKU</th>
                    <th className="pb-3 font-medium">Nama Barang</th>
                    <th className="pb-3 font-medium">Harga Satuan</th>
                    <th className="pb-3 font-medium">Satuan</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3 text-gray-600">{item.sku || '-'}</td>
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 font-semibold text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-3 text-gray-600">{item.unit || '-'}</td>
                      <td className="py-3">
                        <Badge variant={item.isActive ? 'success' : 'default'}>
                          {item.isActive ? 'Aktif' : 'Non-aktif'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`/dashboard/items/${item.id}`}>
                              <Pencil size={14} />
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger hover:bg-red-50"
                            onClick={() => handleDelete(item.id, item.name)}
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
