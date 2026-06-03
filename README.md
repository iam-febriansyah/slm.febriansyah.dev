# Mini ERP Invoicing System

A full-stack Mini ERP application focused on invoicing, customer management, and item cataloging.

## Tech Stack Used

### Backend
- **Framework:** NestJS 10 (Node.js / TypeScript)
- **Database:** MySQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens) with Passport.js
- **Validation:** class-validator & class-transformer
- **Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** Next.js 15 (App Router / React 19)
- **Styling:** Tailwind CSS v4
- **State Management:** React Hooks & Context
- **HTTP Client:** Axios (with interceptors for auth)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast

---

## Prerequisites and Installation Steps

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v8.x or higher
- **Database**: A running instance of MySQL server

### Installation Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository-url>
   cd sml
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Set up environment variables
   # Ensure your backend/.env file has the correct DATABASE_URL
   # Example: DATABASE_URL=mysql://user:pass@localhost:3306/erp_db
   
   # Generate Prisma Client
   npx prisma generate
   
   # Push schema to database (creates tables)
   npx prisma db push
   
   # Seed the database with initial test data
   npx ts-node prisma/seed.ts
   ```

3. **Frontend Setup**:
   ```bash
   # Open a new terminal
   cd frontend
   
   # Install dependencies
   npm install --legacy-peer-deps
   ```

---

## Instructions on How to Run the Application Locally

The application is split into two separate projects. You will need two terminal windows.

### 1. Start the Backend API
In your first terminal:
```bash
cd backend
npm run dev
```
- The API will be available at: `http://localhost:3004/api/v1`
- Swagger API Documentation: `http://localhost:3004/api/docs`

### 2. Start the Frontend Application
In your second terminal:
```bash
cd frontend
npm run dev
```
- The Web App will be available at: `http://localhost:3003`

### 3. Login
Navigate to `http://localhost:3003` and log in using the seeded test accounts:
- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

---

## Architectural Decisions and Assumptions Made

### Architectural Decisions
1. **Separate Projects Structure**: Originally conceived as a monorepo, the project was restructured into separate `backend` and `frontend` directories. This decision reduces build complexity, prevents package manager conflicts (especially with Turborepo & Next.js 15), and makes deployment to standard PAAS providers (like Vercel or Render) more straightforward.
2. **Modular Monolith (Backend)**: The backend uses NestJS organized into clear feature modules (`Auth`, `Customer`, `Catalog`, `Invoice`, `Dashboard`). This separation of concerns allows for clean boundary management and makes it easy to extract services into microservices in the future if scale demands it.
3. **App Router & Client Components (Frontend)**: Next.js 15 App Router is used for modern routing. Due to the heavy reliance on client-side interactivity (forms, state machines, API calls via Axios), most feature pages use `'use client'`. 
4. **State Machine for Invoices**: Invoice status transitions are strictly controlled via a state machine (`DRAFT` → `UNPAID` → `PAID` or `CANCELLED`). This prevents invalid financial states (e.g., editing items on a paid invoice).

### Assumptions
1. **Soft Delete**: Data retention is important for ERP systems. Deleting a customer, item, or invoice uses a "Soft Delete" pattern (`deletedAt` timestamp) rather than hard database row deletion.
2. **Tax and Discounts**: It is assumed that tax is applied *after* discounts are calculated from the subtotal. Both are stored as percentages but calculated into exact amounts for historical immutability.
3. **Item Catalog Independence**: When an item is added to an invoice, its name and current price are copied into the `InvoiceItem` table. This assumes that if a master catalog item's price changes later, historical invoices should not be affected.
4. **Security**: Access tokens are kept short-lived (15m), while refresh tokens are long-lived (7d), representing a standard security posture for business applications.
