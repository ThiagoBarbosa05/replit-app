# Replit.md - VinhoConsign: Wine Consignment Management System

## Overview

VinhoConsign is a comprehensive wine consignment management application built for tracking wine sales and inventory across multiple client locations. The system manages the complete lifecycle of consigned wines from initial distribution to sales tracking and inventory management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Client Details Data Integrity and Bug Fixes (July 20, 2025)
- ✓ Identified and fixed data inconsistencies in stock_counts table
- ✓ Corrected consignment filtering to show client-specific data only
- ✓ Fixed inventory repository to properly aggregate stock counts by product
- ✓ Updated frontend to display correct inventory structure and data
- ✓ Enhanced client details dialog with accurate sales values and remaining stock
- ✓ Improved statistics calculations using real inventory data
- ✓ Removed duplicate consignment items from database
- ✓ Fixed stock count references to correct consignment IDs
- ✓ All client details now show authentic, client-specific data

### Inventory Service Implementation (July 20, 2025)
- ✓ Created comprehensive InventoryRepository with optimized database queries
- ✓ Implemented InventoryService with business logic for stock management
- ✓ Added InventoryController with proper error handling and logging
- ✓ Fixed API endpoints to use correct URL structure (/api/clients/:clientId/inventory)
- ✓ Integrated consignments and stock counts for accurate inventory tracking
- ✓ Added automatic calculation of sales values and remaining quantities
- ✓ Implemented detailed product information display with country, type, and volume

### Server Code Refactoring - Controllers, Services, and Repositories Pattern (July 19, 2025)
- ✓ Completely refactored server architecture following industry best practices
- ✓ Created Controllers layer for handling HTTP requests and responses
- ✓ Implemented Services layer for business logic and orchestration
- ✓ Built Repositories layer for data access and database operations
- ✓ Separated concerns cleanly across architectural layers
- ✓ Maintained all existing functionality while improving code organization
- ✓ Enhanced error handling and logging across all endpoints
- ✓ Preserved backward compatibility for legacy inventory endpoints
- ✓ Applied dependency injection pattern for better testability
- ✓ Improved code readability and maintainability significantly

### Page-Based Architecture Implementation (July 19, 2025)
- ✓ Transformed tab-based dashboard into separate React pages for better code organization
- ✓ Created dedicated page components: DashboardOverview, ClientsPage, ProductsPage, ConsignmentsPage, InventoryPage, ReportsPage, UsersPage
- ✓ Implemented new MainLayout component with responsive design and mobile navigation
- ✓ Updated App.tsx with proper routing using Wouter for seamless navigation
- ✓ Refactored Sidebar component to use Link navigation instead of state-based tab switching  
- ✓ Updated Header component to accept title and description props directly
- ✓ Maintained all existing functionality while improving code readability and maintainability
- ✓ Each page is now self-contained with its own state management and data fetching
- ✓ Preserved responsive design patterns and mobile-first approach across all pages

### Server-Side Search and Filter Implementation (July 18, 2025)
- ✓ Implemented server-side search and filtering for clients using PostgreSQL
- ✓ Added search functionality that works on client name, CNPJ, and contact name
- ✓ Added status filter for active/inactive clients
- ✓ Updated API endpoint to accept search and status query parameters
- ✓ Modified frontend to send search parameters to server instead of client-side filtering
- ✓ Enhanced database queries with Drizzle ORM using ilike, or, and, eq operators
- ✓ Improved performance by moving filtering logic from frontend to database level

### PostgreSQL Database Integration (July 18, 2025)
- ✓ Successfully migrated from in-memory MemStorage to PostgreSQL database using Neon
- ✓ Implemented complete DatabaseStorage class with Drizzle ORM integration
- ✓ All CRUD operations fully functional with database persistence
- ✓ Created all required database tables (clients, products, consignments, consignment_items, stock_counts, users)
- ✓ Tested data creation, retrieval, and persistence across server restarts
- ✓ Dashboard statistics now accurately reflect database-stored data
- ✓ Verified all API endpoints working correctly with PostgreSQL backend
- ✓ Database schema properly configured with auto-incrementing IDs and relationships

### Comprehensive Responsive Design Implementation (July 17, 2025)
- ✓ Implemented mobile-first responsive design across entire application
- ✓ Created mobile navigation with hamburger menu and sidebar overlay
- ✓ Enhanced Header component with responsive breakpoints (hidden on mobile)
- ✓ Updated all dialogs with responsive sizing and overflow handling
- ✓ Applied responsive grid layouts to dashboard statistics cards
- ✓ Implemented horizontal scroll for tables on mobile devices
- ✓ Updated all forms with responsive breakpoints (sm/md/lg)
- ✓ Enhanced button layouts to stack vertically on mobile
- ✓ Added responsive typography scaling across all components
- ✓ Optimized padding and spacing for different screen sizes

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

### Bug Fixes and Data Integration (July 13, 2025)
- ✓ Fixed consignment data properly showing in client inventory interface
- ✓ Corrected query invalidation to refresh reports after stock counts
- ✓ Enhanced ConsignmentDialog to invalidate inventory and stock reports
- ✓ Added "Atualizar Dados" button in reports section for manual refresh
- ✓ Verified API endpoints are working correctly for all data relationships
- ✓ Improved real-time data synchronization across all system modules

### Product Registration Enhancement (July 13, 2025)
- ✓ Added photo upload capability for wine products with base64 encoding
- ✓ Implemented volume selection with predefined options (187ml, 375ml, 750ml)
- ✓ Updated product schema to include volume and photo fields
- ✓ Enhanced ProductForm with drag-and-drop image upload interface
- ✓ Updated product display cards to show photos and volume badges
- ✓ Maintained backwards compatibility with existing products
- ✓ Improved visual presentation of wine catalog with professional layout

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
- **Architecture Pattern**: Controllers, Services, and Repositories (3-layer architecture)
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful endpoints with JSON responses
- **Session Management**: Express sessions with PostgreSQL storage
- **Code Organization**: Separated concerns with dependency injection

### Project Structure
- **Monorepo Layout**: Single repository with separate client/server/shared directories
- **Shared Types**: Common schemas and types in `/shared` directory
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory with clean architecture:
  - **Controllers**: HTTP request/response handling (`/server/controllers/`)
  - **Services**: Business logic and orchestration (`/server/services/`)
  - **Repositories**: Data access layer (`/server/repositories/`)
  - **Routes**: Endpoint definitions and controller routing (`/server/routes.ts`)

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
- Separate pages for each functional module with dedicated URLs
- Sidebar navigation with visual active state indicators
- Modal dialogs for data entry and editing maintained across all pages
- Real-time data updates via TanStack Query with page-specific queries
- Responsive design with MainLayout wrapper for consistent mobile/desktop experience
- Page-based routing using Wouter for better URL management and navigation

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