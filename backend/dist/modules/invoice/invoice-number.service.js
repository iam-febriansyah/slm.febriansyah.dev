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
exports.InvoiceNumberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/database/prisma.service");
let InvoiceNumberService = class InvoiceNumberService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}${month}`;
        const latest = await this.prisma.invoice.findFirst({
            where: {
                invoiceNumber: { startsWith: prefix },
                deletedAt: null,
            },
            orderBy: { invoiceNumber: 'desc' },
        });
        let sequence = 1;
        if (latest) {
            const lastSeq = parseInt(latest.invoiceNumber.split('-')[1], 10);
            sequence = lastSeq + 1;
        }
        return `${prefix}-${String(sequence).padStart(5, '0')}`;
    }
};
exports.InvoiceNumberService = InvoiceNumberService;
exports.InvoiceNumberService = InvoiceNumberService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoiceNumberService);
//# sourceMappingURL=invoice-number.service.js.map