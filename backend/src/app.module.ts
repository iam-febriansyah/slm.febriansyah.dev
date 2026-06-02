import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    PrismaModule,
    AuthModule,
    CustomerModule,
    CatalogModule,
    InvoiceModule,
    DashboardModule,
  ],
})
export class AppModule {}
