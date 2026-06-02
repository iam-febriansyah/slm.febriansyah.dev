'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    unitPrice: '',
    unit: '',
    sku: '',
    isActive: true,
  });

  useEffect(() => {
    if (!isNew) fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const resp = await apiClient.get(`/items/${id}`);
      const item = resp.data.data;
      setForm({
        name: item.name,
        description: item.description || '',
        unitPrice: item.unitPrice,
        unit: item.unit || '',
        sku: item.sku || '',
        isActive: item.isActive,
      });
    } catch {
      toast.error('Gagal memuat data barang');
      router.push('/dashboard/items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, unitPrice: Number(form.unitPrice) };
      if (isNew) {
        await apiClient.post('/items', payload);
        toast.success('Barang berhasil ditambahkan');
      } else {
        await apiClient.patch(`/items/${id}`, payload);
        toast.success('Barang berhasil diperbarui');
      }
      router.push('/dashboard/items');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/dashboard/items')}>
          <ArrowLeft size={18} /> Kembali
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Tambah Barang' : 'Edit Barang'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Barang</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Barang *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: Jasa Konsultasi IT"
              required
            />
            <Input
              label="Deskripsi"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat barang/jasa"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Harga Satuan (Rp) *"
                type="number"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                placeholder="500000"
                required
              />
              <Input
                label="Satuan"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="pcs / jam / bulan"
              />
            </div>
            <Input
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="ITEM-001"
            />
            {!isNew && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Item Aktif
                </label>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/items')}>
                Batal
              </Button>
              <Button type="submit" isLoading={saving}>
                <Save size={16} strokeWidth={2.5} />
                {isNew ? 'Simpan' : 'Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}