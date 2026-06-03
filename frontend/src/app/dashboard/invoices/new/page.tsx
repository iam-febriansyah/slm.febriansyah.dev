'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { SearchableItemInput } from '@/shared/components/ui/searchable-item-input';
import { formatCurrency } from '@/shared/lib/format';
import { ArrowLeft, Plus, Trash2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  itemId?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  sku: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<CatalogItem[]>([]);

  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [customersRes, itemsRes] = await Promise.all([
        apiClient.get('/customers', { params: { limit: 999 } }),
        apiClient.get('/items', { params: { limit: 999 } }),
      ]);
      setCustomers(customersRes.data.data.items || []);
      setItems(itemsRes.data.data.items || []);
    } catch {
      toast.error('Gagal memuat data');
      router.push('/dashboard/invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const discountAmount = subtotal * (discountPercent / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxPercent / 100);
    const totalAmount = afterDiscount + taxAmount;
    return { subtotal, discountAmount, taxAmount, totalAmount };
  };

  const totals = calculateTotals();

  const handleAddItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Math.random().toString(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((item) => item.id !== id));
    }
  };

  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: any
  ) => {
    setInvoiceItems(
      invoiceItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSelectCatalogItem = (id: string, catalogItem: CatalogItem) => {
    handleItemChange(id, 'description', catalogItem.name);
    handleItemChange(id, 'unitPrice', catalogItem.price);
    handleItemChange(id, 'itemId', catalogItem.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !dueDate || invoiceItems.length === 0) {
      toast.error('Isi semua field yang wajib');
      return;
    }

    if (
      invoiceItems.some(
        (item) => !item.description || item.quantity <= 0 || item.unitPrice < 0
      )
    ) {
      toast.error('Periksa kembali item invoice');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId,
        dueDate: new Date(dueDate).toISOString(),
        discountPercent,
        taxPercent,
        notes,
        items: invoiceItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemId: item.itemId,
        })),
      };

      const res = await apiClient.post('/invoices', payload);
      toast.success('Invoice berhasil dibuat');
      router.push(`/dashboard/invoices/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 'Gagal membuat invoice'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <button
            onClick={() => router.push('/dashboard/invoices')}
            className="hover:text-gray-700 transition-colors"
          >
            Invoice
          </button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">Buat Baru</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Buat Invoice Baru</h1>
            <p className="text-sm text-gray-500 mt-1">Lengkapi informasi invoice di bawah ini</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/invoices')}
            className="text-gray-600"
          >
            <ArrowLeft size={18} />
            Kembali
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Info Dasar */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">1</div>
              <CardTitle className="text-base">Informasi Dasar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.name,
                  description: [c.email, c.phone].filter(Boolean).join(' • '),
                }))}
                value={customerId}
                onChange={setCustomerId}
                placeholder="— Pilih Pelanggan —"
                searchPlaceholder="Cari nama, email, atau telepon..."
                label="Pelanggan"
                required
                pageSize={10}
              />
              <Input
                type="date"
                label="Jatuh Tempo"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Item Invoice */}
        <Card className="shadow-md border border-gray-200 relative z-20">
          <CardHeader className="border-b border-gray-100 pb-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">2</div>
              <CardTitle className="text-base">Item Invoice</CardTitle>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleAddItem}
              className="bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-all"
            >
              <Plus size={16} strokeWidth={3} /> Tambah Item
            </Button>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3 overflow-visible">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Deskripsi</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 w-20">Qty</th>
                    <th className="px-3 py-3 text-right font-semibold text-gray-700 w-32">Harga</th>
                    <th className="px-3 py-3 text-right font-semibold text-gray-700 w-32">Total</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3">
                        <SearchableItemInput
                          value={item.description}
                          options={items}
                          onSelect={(description, price, itemId) => {
                            handleItemChange(item.id, 'description', description);
                            handleItemChange(item.id, 'unitPrice', price);
                            if (itemId) handleItemChange(item.id, 'itemId', itemId);
                          }}
                          onChange={(text) => {
                            handleItemChange(item.id, 'description', text);
                          }}
                          pageSize={8}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm text-center bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-sm text-right bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={invoiceItems.length === 1}
                          className="text-danger hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Hapus item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Perhitungan */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">3</div>
              <CardTitle className="text-base">Perhitungan & Total</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Discount & Tax Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="Diskon (%)"
                    min="0"
                    max="100"
                    step="0.01"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <Input
                    type="number"
                    label="Pajak (%)"
                    min="0"
                    max="100"
                    step="0.01"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Totals Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-primary-50 rounded-lg p-5 space-y-3 border-2 border-primary-200 shadow-md">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span className="font-medium">Diskon ({discountPercent}%)</span>
                      <span className="font-semibold">- {formatCurrency(totals.discountAmount)}</span>
                    </div>
                  )}
                  {taxPercent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">Pajak ({taxPercent}%)</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(totals.taxAmount)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-primary-300 pt-3 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">TOTAL</span>
                    <span className="text-2xl font-bold text-primary-700">{formatCurrency(totals.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Catatan */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">4</div>
              <CardTitle className="text-base">Catatan Tambahan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan instruksi pembayaran, term and condition, atau catatan khusus untuk pelanggan di sini..."
              rows={4}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-y"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200 mt-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/dashboard/invoices')}
            className="w-full sm:w-auto px-6 text-gray-700 hover:bg-gray-100"
            disabled={submitting}
          >
            Batalkan
          </Button>
          <Button
            type="submit"
            isLoading={submitting}
            className="w-full sm:w-auto px-8 bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            ✓ Buat Invoice Sekarang
          </Button>
        </div>
      </form>
    </div>
  );
}
