# Replit.md - VinhoConsign: Wine Consignment Management System

## Overview

VinhoConsign is a comprehensive wine consignment management application built for tracking wine sales and inventory across multiple client locations. The system manages the complete lifecycle of consigned wines from initial distribution to sales tracking and inventory management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Stock Count Management Implementation (July 13, 2025)
- ✓ Enhanced inventory management system with client-specific stock tracking
- ✓ Added new API endpoints for client inventory and stock difference calculations
- ✓ Created StockCountForm component with real-time stock calculation
- ✓ Implemented StockCountDialog with product selection and validation
- ✓ Updated Dashboard inventory tab with comprehensive stock management interface
- ✓ Added automatic sales calculation based on sent vs remaining quantities
- ✓ Integrated client inventory display showing sent, counted, and sold quantities
- ✓ Fixed TypeScript errors in storage layer for better type safety

### Multiple Product Stock Counting (July 13, 2025)
- ✓ Created MultipleStockCountForm for selecting multiple products at once
- ✓ Added checkbox selection interface for client's available wine products
- ✓ Implemented table view for editing quantities of multiple products
- ✓ Added real-time calculation of totals across all selected products
- ✓ Enhanced validation with warnings for incorrect quantities
- ✓ Updated StockCountDialog to support batch processing of multiple stock counts

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Router**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage

### Project Structure
- **Monorepo Layout**: Single repository with separate client/server/shared directories
- **Shared Types**: Common schemas and types in `/shared` directory
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory

## Key Components

### Database Schema
The application uses five main tables:
- **Clients**: Customer establishments receiving consigned wines
- **Products**: Wine catalog with pricing and origin information
- **Consignments**: Records of wines sent to clients
- **Consignment Items**: Individual wine products within each consignment
- **Stock Counts**: Inventory tracking and sales calculations

### Core Modules
1. **Client Management**: Registration and management of wine retail establishments
2. **Product Catalog**: Wine inventory with detailed product information
3. **Consignment Tracking**: Management of wine shipments to clients
4. **Inventory Control**: Stock counting and sales calculation system
5. **Reporting Dashboard**: Analytics and business intelligence

### API Endpoints
- `GET/POST /api/clients` - Client management
- `GET/POST /api/products` - Product catalog
- `GET/POST /api/consignments` - Consignment operations
- `GET/POST /api/stock-counts` - Inventory management
- `GET /api/dashboard/stats` - Dashboard analytics

## Data Flow

### Consignment Process
1. Products are registered in the system catalog
2. Clients (retail establishments) are registered
3. Consignments are created with selected products and quantities
4. Products are delivered to client locations
5. Periodic stock counts determine sales and remaining inventory
6. System calculates profits and generates reports

### User Interface Flow
- Dashboard provides overview of key metrics
- Sidebar navigation between functional modules
- Modal dialogs for data entry and editing
- Real-time data updates via TanStack Query
- Responsive design for desktop and mobile use

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React icon library
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod schema validation
- **HTTP Client**: Native fetch API with custom wrapper

### Backend Dependencies
- **Database**: Drizzle ORM with PostgreSQL driver
- **Cloud Database**: Neon Database serverless PostgreSQL
- **Session Store**: connect-pg-simple for PostgreSQL session storage
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin
- **Database Migrations**: Drizzle Kit for schema management
- **Type Safety**: TypeScript throughout the stack
- **Code Quality**: ESLint and Prettier (implicit in toolchain)

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Environment variable configuration for DATABASE_URL
- **Session Management**: In-memory sessions for development
- **Error Handling**: Runtime error overlay for debugging

### Production Build
- **Frontend**: Static assets built with Vite
- **Backend**: ESBuild compilation to single JavaScript file
- **Database**: PostgreSQL connection via environment variables
- **Deployment**: Node.js server serving both API and static files

### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Session Secret**: Secure session management in production
- **Build Output**: Separate directories for client build and server compilation
- **Asset Serving**: Express static file serving for production builds

The system is designed as a business management tool for wine distributors who need to track consigned inventory across multiple retail locations, with particular focus on sales reporting and inventory reconciliation.