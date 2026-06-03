import { PrismaClient, Role, InvoiceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Retry helper untuk handle deadlock
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (
        error.code === 'P2034' ||
        error.message?.includes('deadlock') ||
        error.message?.includes('write conflict')
      ) {
        if (i < maxRetries - 1) {
          console.log(`⚠️  Deadlock detected, retry ${i + 1}/${maxRetries - 1}...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
          continue;
        }
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

async function main() {
  console.log('🌱 Mulai seed database...');

  try {
    // Clear existing data dengan transaction
    await withRetry(async () => {
      await prisma.$transaction(async (tx) => {
        // Delete dengan urutan yang benar (respect foreign keys)
        await tx.invoiceItem.deleteMany();
        await tx.invoice.deleteMany();
        await tx.item.deleteMany();
        await tx.customer.deleteMany();
        await tx.user.deleteMany();
        console.log('✅ Existing data cleared');
      });
    });

    // ── Users ──
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const users = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        const admin = await tx.user.create({
          data: {
            email: 'admin@sml.com',
            password: adminPassword,
            name: 'Admin User',
            role: Role.ADMIN,
          },
        });

        const user = await tx.user.create({
          data: {
            email: 'user@sml.com',
            password: userPassword,
            name: 'Regular User',
            role: Role.USER,
          },
        });

        return { admin, user };
      });
    });

    console.log(`✅ Users created: ${users.admin.name}, ${users.user.name}`);

    // ── Customers ──
    const customers = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        return await Promise.all([
          tx.customer.create({
            data: {
              name: 'PT. Maju Bersama',
              email: 'contact@majubersama.com',
              phone: '081234567890',
              address: 'Jl. Merdeka No. 10, Jakarta',
            },
          }),
          tx.customer.create({
            data: {
              name: 'CV. Sejahtera',
              email: 'info@sejahtera.co.id',
              phone: '082345678901',
              address: 'Jl. Ahmad Yani No. 5, Surabaya',
            },
          }),
          tx.customer.create({
            data: {
              name: 'Toko Elektronik Citra',
              email: 'sales@citraraya.com',
              phone: '083456789012',
              address: 'Jl. Diponegoro No. 20, Bandung',
            },
          }),
        ]);
      });
    });

    console.log(`✅ Customers created: ${customers.length}`);

    // ── Items (Catalog) ──
    const items = await withRetry(async () => {
      return await prisma.$transaction(async (tx) => {
        return await Promise.all([
          tx.item.create({
            data: {
              name: 'Jasa Konsultasi IT',
              description: 'Layanan konsultasi teknologi informasi',
              unitPrice: 500000,
              unit: 'jam',
              sku: 'KONSUL-IT',
              isActive: true,
            },
          }),
          tx.item.create({
            data: {
              name: 'Lisensi Software',
              description: 'Lisensi software premium 1 tahun',
              unitPrice: 2000000,
              unit: 'pcs',
              sku: 'LIC-SOFT',
              isActive: true,
            },
          }),
          tx.item.create({
            data: {
              name: 'Support & Maintenance',
              description: 'Dukungan teknis dan maintenance bulanan',
              unitPrice: 750000,
              unit: 'bulan',
              sku: 'MAINT-01',
              isActive: true,
            },
          }),
          tx.item.create({
            data: {
              name: 'Hardware Server',
              description: 'Server komputer kelas enterprise',
              unitPrice: 15000000,
              unit: 'unit',
              sku: 'SRV-ENT',
              isActive: true,
            },
          }),
          tx.item.create({
            data: {
              name: 'Training Staff',
              description: 'Pelatihan karyawan (per orang per hari)',
              unitPrice: 350000,
              unit: 'orang/hari',
              sku: 'TRAIN-01',
              isActive: true,
            },
          }),
        ]);
      });
    });

    console.log(`✅ Items created: ${items.length}`);

    // ── Invoices ──
    await withRetry(async () => {
      // Invoice 1
      const invoice1 = await prisma.invoice.create({
        data: {
          invoiceNumber: '202606-00001',
          status: InvoiceStatus.UNPAID,
          issueDate: new Date('2026-06-01'),
          dueDate: new Date('2026-06-30'),
          customerId: customers[0].id,
          userId: users.user.id,
          discountPercent: 10,
          taxPercent: 11,
          notes: 'Invoice test - status UNPAID',
          items: {
            create: [
              {
                description: 'Jasa Konsultasi IT - 2 jam',
                quantity: 2,
                unitPrice: 500000,
                totalPrice: 1000000,
                itemId: items[0].id,
              },
              {
                description: 'Lisensi Software - 1 tahun',
                quantity: 1,
                unitPrice: 2000000,
                totalPrice: 2000000,
                itemId: items[1].id,
              },
            ],
          },
        },
      });

      const subtotal1 = 3000000;
      const discount1 = subtotal1 * 0.1;
      const afterDiscount1 = subtotal1 - discount1;
      const tax1 = afterDiscount1 * 0.11;
      const total1 = afterDiscount1 + tax1;

      await prisma.invoice.update({
        where: { id: invoice1.id },
        data: {
          subtotal: subtotal1,
          discountAmount: discount1,
          taxAmount: tax1,
          totalAmount: total1,
        },
      });
    });

    await withRetry(async () => {
      // Invoice 2
      const invoice2 = await prisma.invoice.create({
        data: {
          invoiceNumber: '202606-00002',
          status: InvoiceStatus.PAID,
          issueDate: new Date('2026-05-15'),
          dueDate: new Date('2026-06-15'),
          customerId: customers[1].id,
          userId: users.user.id,
          discountPercent: 5,
          taxPercent: 11,
          notes: 'Invoice sudah dibayar',
          items: {
            create: [
              {
                description: 'Support & Maintenance - 3 bulan',
                quantity: 3,
                unitPrice: 750000,
                totalPrice: 2250000,
                itemId: items[2].id,
              },
            ],
          },
        },
      });

      const subtotal2 = 2250000;
      const discount2 = subtotal2 * 0.05;
      const afterDiscount2 = subtotal2 - discount2;
      const tax2 = afterDiscount2 * 0.11;
      const total2 = afterDiscount2 + tax2;

      await prisma.invoice.update({
        where: { id: invoice2.id },
        data: {
          subtotal: subtotal2,
          discountAmount: discount2,
          taxAmount: tax2,
          totalAmount: total2,
        },
      });
    });

    await withRetry(async () => {
      // Invoice 3
      const invoice3 = await prisma.invoice.create({
        data: {
          invoiceNumber: '202606-00003',
          status: InvoiceStatus.DRAFT,
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerId: customers[2].id,
          userId: users.user.id,
          notes: 'Draft invoice - belum dikirim',
          items: {
            create: [
              {
                description: 'Hardware Server - 1 unit',
                quantity: 1,
                unitPrice: 15000000,
                totalPrice: 15000000,
                itemId: items[3].id,
              },
            ],
          },
        },
      });

      const subtotal3 = 15000000;
      const tax3 = subtotal3 * 0.11;
      const total3 = subtotal3 + tax3;

      await prisma.invoice.update({
        where: { id: invoice3.id },
        data: {
          subtotal: subtotal3,
          taxAmount: tax3,
          totalAmount: total3,
        },
      });
    });

    console.log(`✅ Invoices created: 3`);

    console.log('✨ Seed selesai! Database siap untuk testing.');
    console.log('\n📝 Test Credentials:');
    console.log('Admin  - Email: admin@sml.com, Password: admin123');
    console.log('User   - Email: user@sml.com, Password: user123');
  } catch (error) {
    console.error('❌ Seed gagal:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
