"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3003',
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Mini ERP Invoicing API')
        .setDescription('REST API untuk Sistem Invoicing Mini ERP')
        .setVersion('1.0')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
        .addTag('Auth', 'Autentikasi & Otorisasi')
        .addTag('Customers', 'Manajemen Pelanggan')
        .addTag('Items', 'Katalog / Barang Master')
        .addTag('Invoices', 'Siklus Invoice')
        .addTag('Dashboard', 'Ringkasan & Analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.API_PORT || 3004;
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3003'
    await app.listen(port);
    console.log(`✅ API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
    console.log(`FRONTEND_URL: ${FRONTEND_URL}`);
}
bootstrap().catch((err) => {
    console.error('❌ Failed to start API:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map