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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let CustomerService = class CustomerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const customer = await this.prisma.customer.create({
            data: dto,
        });
        return { success: true, data: customer, message: 'Customer berhasil dibuat' };
    }
    async findAll(page = 1, limit = 10, search = '') {
        const skip = (page - 1) * limit;
        const where = {
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
    async findOne(id) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, deletedAt: null },
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer tidak ditemukan');
        return { success: true, data: customer };
    }
    async update(id, dto) {
        await this.findOne(id);
        const customer = await this.prisma.customer.update({
            where: { id },
            data: dto,
        });
        return { success: true, data: customer, message: 'Customer diperbarui' };
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return { success: true, message: 'Customer dihapus' };
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map