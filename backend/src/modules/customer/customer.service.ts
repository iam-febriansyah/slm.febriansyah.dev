import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: dto,
    });
    return { success: true, data: customer, message: 'Customer berhasil dibuat' };
  }

  async findAll(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: data,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer tidak ditemukan');
    return { success: true, data: customer };
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id); // Check existence

    const customer = await this.prisma.customer.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: customer, message: 'Customer diperbarui' };
  }

  async remove(id: string) {
    await this.findOne(id); // Check existence

    // Soft delete
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Customer dihapus' };
  }
}
