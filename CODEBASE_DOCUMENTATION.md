# ProBeauty Backend - Codebase Documentation

## 📋 Overview

This is a **ProBeauty Backend** application built with modern web technologies. It's a comprehensive beauty salon management system that handles user authentication, salon management, booking systems, product catalogs, and more.

## 🛠️ Technology Stack

### Core Technologies

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Language**: TypeScript 5.8.3
- **Framework**: Express.js 5.1.0
- **Database**: PostgreSQL with Prisma ORM 6.9.0
- **Validation**: Zod 3.25.56
- **Linting**: ESLint 9.28.0 with TypeScript support

### Key Dependencies

- **Authentication**: JWT (jsonwebtoken), bcrypt for password hashing
- **Email Service**: Nodemailer 7.0.3
- **Security**: Helmet, CORS, HPP, express-rate-limit
- **Utilities**: Compression, cookie-parser, morgan (logging)

## 📁 Project Structure

```
/Users/jaskrrishsingh/jas/probeauty/backend/
├── 📁 src/                          # Source code directory
│   ├── 📄 index.ts                  # Application entry point
│   ├── 📁 configs/                  # Configuration files
│   │   ├── cors.ts                  # CORS configuration
│   │   ├── csp.ts                   # Content Security Policy
│   │   ├── db.ts                    # Database connection
│   │   └── env.ts                   # Environment variables validation
│   ├── 📁 controllers/              # Business logic controllers
│   │   └── authController.ts        # Authentication controller
│   ├── 📁 middlewares/              # Express middlewares
│   │   ├── auth/                    # Authentication middleware
│   │   ├── errorHandler.ts          # Global error handling
│   │   ├── index.ts                 # Middleware application
│   │   ├── notFound.ts              # 404 handler
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   └── validateRequest.ts       # Request validation
│   ├── 📁 routes/                   # API routes
│   │   └── authRoute.ts             # Authentication routes
│   ├── 📁 schemas/                  # Zod validation schemas
│   │   └── authSchema.ts            # Authentication schemas
│   ├── 📁 services/                 # External services
│   │   ├── emailService.ts          # Email service functions
│   │   ├── sendEmail.ts             # Email sending utility
│   │   └── 📁 templates/            # HTML email templates
│   └── 📁 utils/                    # Utility functions
│       ├── prisma.ts                # Prisma client
│       └── tokenUtils.ts            # JWT token utilities
├── 📁 prisma/                       # Database schema and migrations
│   ├── schema.prisma                # Prisma schema definition
│   ├── seed.ts                      # Database seeding
│   └── 📁 migrations/               # Database migration files
├── 📁 ai-docs/                      # AI documentation
├── 📄 package.json                  # Dependencies and scripts
├── 📄 tsconfig.json                 # TypeScript configuration
├── 📄 eslint.config.js              # ESLint configuration
└── 📄 README.md                     # Project documentation
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL database schema designed for a beauty salon management system:

### Core Models

#### User Model

- **Purpose**: User accounts for customers, salon owners, and staff
- **Key Fields**: id, name, email, phone, role, password, OTP verification
- **Relationships**: Owns salons, staff profiles, bookings, orders, reviews

#### Salon Model

- **Purpose**: Beauty salon business entities
- **Key Fields**: id, ownerId, name, address, geo location, hours, verification status
- **Relationships**: Owner, staff, services, products, bookings, orders, reviews

#### Service Model

- **Purpose**: Salon services offered
- **Key Fields**: id, salonId, title, duration, price
- **Relationships**: Belongs to salon, has bookings and reviews

#### Product Model

- **Purpose**: Salon products for sale
- **Key Fields**: id, salonId, title, SKU, price, quantity, images
- **Relationships**: Belongs to salon, order items, reviews, cart items

#### Booking Model

- **Purpose**: Service appointments
- **Key Fields**: id, userId, salonId, serviceId, staffId, startTime, endTime, status
- **Relationships**: Links user, salon, service, and staff

#### Order & Payment Models

- **Purpose**: E-commerce functionality
- **Key Fields**: Order (id, userId, salonId, total, status), Payment (id, orderId, provider, amount, status, txnId)
- **Relationships**: Order contains order items, has payments

#### Additional Models

- **Staff**: Links users to salons with roles
- **Review**: User reviews for services/products
- **Promotion**: Discount campaigns
- **Cart**: Shopping cart functionality
- **Notification**: User notifications

## 🔐 Authentication System

### Features

- **JWT-based authentication** with access and refresh tokens
- **OTP verification** for registration and password reset
- **Role-based access control** (customer, salon owner, staff)
- **Password hashing** using bcrypt
- **Rate limiting** on auth endpoints

### Authentication Flow

1. **Registration**: User signs up → OTP sent to email → OTP verification → Account activated
2. **Login**: Email/phone + password → JWT tokens generated
3. **Password Reset**: Email → OTP → New password
4. **Token Refresh**: Refresh token → New access token

### Security Features

- **Rate limiting**: 50 requests per 15 minutes for auth endpoints
- **Password requirements**: Minimum 6 characters for registration, 8 for reset
- **OTP expiration**: 10 minutes
- **Token expiration**: Access token (3 hours), Refresh token (15 days)

## 📧 Email Service

### Email Templates

- **Registration OTP**: Welcome email with verification code
- **Registration Success**: Confirmation of successful registration
- **Password Reset OTP**: Password reset with verification code
- **Password Reset Success**: Confirmation of successful password reset
- **Invitation Request**: Salon invitation emails

### Email Configuration

- **Provider**: Nodemailer with SMTP
- **Templates**: HTML templates with dynamic data injection
- **Environment Variables**: EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT

## 🛡️ Security Implementation

### Middleware Stack

1. **CORS**: Cross-origin resource sharing configuration
2. **Helmet**: Security headers (CSP, frameguard, referrer policy)
3. **HPP**: HTTP Parameter Pollution protection
4. **Rate Limiting**: Global and auth-specific rate limits
5. **Compression**: Response compression
6. **Morgan**: HTTP request logging

### Security Headers

- **Content Security Policy**: Prevents XSS attacks
- **Frame Guard**: Prevents clickjacking
- **Referrer Policy**: Controls referrer information
- **X-Powered-By**: Disabled for security

## 🔧 Development Configuration

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with Node resolution
- **Strict Mode**: Enabled with strict null checks
- **Path Mapping**: Configured for clean imports (@/ prefix)
- **Source Maps**: Enabled for debugging

### ESLint Configuration

- **TypeScript ESLint**: Strict and stylistic rules
- **Import Management**: Order, duplicates, unused imports
- **Security Rules**: Object injection, file system access
- **Code Quality**: Console usage, debugger, unused variables
- **Promise Handling**: Always return, catch-or-return

### Scripts Available

```bash
# Development
bun run dev              # Development with tsx watch
bun run dev:ts-node      # Development with ts-node-dev
bun run start            # Production start

# Building
bun run build            # Compile TypeScript

# Database
bun run prisma:generate  # Generate Prisma client
bun run prisma:migrate   # Run migrations
bun run prisma:studio    # Open Prisma Studio
bun run prisma:seed      # Seed database

# Code Quality
bun run lint             # Check linting issues
bun run lint:fix         # Auto-fix linting issues
bun run format           # Format with Prettier
```

## 🌐 API Endpoints

### Authentication Routes (`/api/v1/auth`)

- `POST /signup` - User registration
- `POST /login` - User login
- `POST /confirm-registration` - OTP verification
- `POST /forgot-password` - Password reset request
- `POST /verify-forgot-password-otp` - OTP verification for password reset
- `POST /resend-forgot-password-otp` - Resend password reset OTP
- `POST /reset-password` - Reset password with OTP
- `POST /refresh-token` - Refresh access token
- `POST /refresh-access-token` - Alternative refresh endpoint

### Health Check Routes

- `GET /` - Basic health check
- `GET /api/v1/health` - Detailed health status

## 📊 Environment Variables

### Required Variables

```env
PORT=8000                                    # Server port
DATABASE_URL=postgresql://...               # PostgreSQL connection string
ACCESS_SECRET_KEY=your_access_secret        # JWT access token secret
REFRESH_SECRET_KEY=your_refresh_secret      # JWT refresh token secret
NODE_ENV=development                         # Environment (development/production/test)
EMAIL_USERNAME=your_email@domain.com        # SMTP email username
EMAIL_PASSWORD=your_email_password          # SMTP email password
EMAIL_HOST=smtp.gmail.com                   # SMTP host
EMAIL_PORT=587                              # SMTP port
```

## 🚀 Getting Started

### Prerequisites

- Bun runtime installed
- PostgreSQL database running
- SMTP email service configured

### Installation Steps

1. **Clone and install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up database**:

   ```bash
   bun run prisma:generate
   bun run prisma:migrate
   bun run prisma:seed  # Optional
   ```

4. **Start development server**:
   ```bash
   bun run dev
   ```

## 🧪 Code Quality & Standards

### Linting Rules

- **Import Organization**: Alphabetical order with newlines between groups
- **Unused Imports**: Automatically removed
- **Security**: Object injection and file system access warnings
- **Code Quality**: No console.log in production, prefer const over let
- **Promise Handling**: Always return promises, proper error handling

### TypeScript Standards

- **Strict Mode**: All strict TypeScript checks enabled
- **Path Mapping**: Use @/ prefix for clean imports
- **Type Safety**: Explicit typing for all functions and variables
- **Error Handling**: Proper error types and handling

## 🔄 Development Workflow

### Git Hooks

- **Husky**: Pre-commit hooks for code quality
- **Lint-staged**: Run linters only on staged files
- **Prettier**: Automatic code formatting

### Code Organization

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external service integration
- **Schemas**: Request/response validation with Zod
- **Middlewares**: Reusable Express middleware functions
- **Utils**: Helper functions and utilities

## 📈 Scalability Considerations

### Database

- **Indexes**: Proper indexing on frequently queried fields
- **Relationships**: Well-defined foreign key relationships
- **Migrations**: Version-controlled database schema changes

### Performance

- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Compression**: Reduces response payload size
- **Connection Pooling**: Prisma handles database connections efficiently

### Security

- **Input Validation**: Zod schemas for all inputs
- **Authentication**: JWT with proper expiration
- **Authorization**: Role-based access control ready
- **Rate Limiting**: Prevents brute force attacks

## 🐛 Error Handling

### Global Error Handler

- **Centralized**: All errors handled in one place
- **Logging**: Proper error logging for debugging
- **User-friendly**: Appropriate error messages for clients

### Validation Errors

- **Zod Integration**: Automatic validation error responses
- **Field-specific**: Detailed validation error messages
- **Type Safety**: TypeScript integration for validation

## 📝 Future Enhancements

### Planned Features

- **File Upload**: Image upload for products and salons
- **Real-time Notifications**: WebSocket integration
- **Payment Integration**: Stripe or similar payment gateway
- **Advanced Search**: Full-text search for services and products
- **Analytics**: Business intelligence and reporting
- **Mobile API**: Optimized endpoints for mobile applications

### Technical Improvements

- **Caching**: Redis integration for performance
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite
- **Documentation**: API documentation with Swagger
- **CI/CD**: Automated deployment pipeline

---

_This documentation provides a comprehensive overview of the ProBeauty Backend codebase. For specific implementation details, refer to the individual source files and their inline documentation._
