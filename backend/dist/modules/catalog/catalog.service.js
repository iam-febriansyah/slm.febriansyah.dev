"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let CatalogService = class CatalogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const item = await this.prisma.item.create({
            data: dto,
        });
        return { success: true, data: item, message: 'Item berhasil dibuat' };
    }
    async findAll(page = 1, limit = 10, search = '', isActive) {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(id) {
        const item = await this.prisma.item.findFirst({
            where: { id, deletedAt: null },
        });
        if (!item)
            throw new common_1.NotFoundException('Item tidak ditemukan');
        return { success: true, data: item };
    }
    async update(id, dto) {
        await this.findOne(id);
        const item = await this.prisma.item.update({
            where: { id },
            data: dto,
        });
        return { success: true, data: item, message: 'Item diperbarui' };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.item.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Item dihapus' };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map