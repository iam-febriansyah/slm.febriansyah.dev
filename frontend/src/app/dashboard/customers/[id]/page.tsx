'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', address: '',
  });

  useEffect(() => {
    if (!isNew) fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const resp = await apiClient.get(`/customers/${id}`);
      const c = resp.data.data;
      setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '' });
    } catch {
      toast.error('Gagal memuat data pelanggan');
      router.push('/dashboard/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isNew) {
        await apiClient.post('/customers', form);
        toast.success('Pelanggan berhasil ditambahkan');
      } else {
        await apiClient.patch(`/customers/${id}`, form);
        toast.success('Pelanggan berhasil diperbarui');
      }
      router.push('/dashboard/customers');
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
        <Button variant="ghost" onClick={() => router.push('/dashboard/customers')}>
          <ArrowLeft size={18} className="mr-2" />
          Kembali
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? 'Tambah Pelanggan' : 'Edit Pelanggan'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Pelanggan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nama Pelanggan *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: PT. Maju Bersama"
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@perusahaan.com"
            />
            <Input
              label="Telepon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="081234567890"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Contoh No. 1, Jakarta"
                rows={3}
                className="flex w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/customers')}>
                Batal
              </Button>
              <Button type="submit" isLoading={saving}>
                <Save size={16} className="mr-2" />
                {isNew ? 'Simpan' : 'Update'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
