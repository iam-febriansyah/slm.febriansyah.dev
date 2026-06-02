import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/database/prisma.service';
import { CreateItemDto, UpdateItemDto } from './dto/item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateItemDto) {
    const item = await this.prisma.item.create({
      data: dto,
    });
    return { success: true, data: item, message: 'Item berhasil dibuat' };
  }

  async findAll(page = 1, limit = 10, search = '', isActive?: boolean) {
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.item.count({ where }),
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
    const item = await this.prisma.item.findFirst({
      where: { id, deletedAt: null },
    });
    if (!item) throw new NotFoundException('Item tidak ditemukan');
    return { success: true, data: item };
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);

    const item = await this.prisma.item.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: item, message: 'Item diperbarui' };
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true, message: 'Item dihapus' };
  }
}
