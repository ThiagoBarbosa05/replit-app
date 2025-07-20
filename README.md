# Wine Cellar Tracker API Routes

This document provides a comprehensive overview of the API routes for the Wine Cellar Tracker application.

**Note:** The application is currently undergoing a refactoring process. Some routes are defined in `server/routes.ts` and are considered current, while others are in `server/routes.old.ts` and may be deprecated or in the process of being migrated.

## Clients

| Method | Path                       | Description                               | Schema                      | Status      |
|--------|----------------------------|-------------------------------------------|-----------------------------|-------------|
| GET    | `/api/clients`             | Get a list of all clients.                | -                           | Current     |
| GET    | `/api/clients/:id`         | Get a specific client by their ID.        | -                           | Current     |
| POST   | `/api/clients`             | Create a new client.                      | `createClientSchema`        | Current     |
| PUT    | `/api/clients/:id`         | Update an existing client.                | `insertClientSchema.partial()` | Current     |
| DELETE | `/api/clients/:id`         | Delete a client.                          | -                           | Current     |
| PATCH  | `/api/clients/:id/activate`| Activate a client.                        | -                           | **Old**     |
| PATCH  | `/api/clients/:id/deactivate`| Deactivate a client.                      | -                           | **Old**     |

## Products

| Method | Path                  | Description                               | Schema                      | Status      |
|--------|-----------------------|-------------------------------------------|-----------------------------|-------------|
| GET    | `/api/products`       | Get a list of all products.               | -                           | Current     |
| GET    | `/api/products/:id`   | Get a specific product by its ID.         | -                           | Current     |
| POST   | `/api/products`       | Create a new product.                     | `createProductSchema`       | Current     |
| PUT    | `/api/products/:id`   | Update an existing product.               | `insertProductSchema.partial()`| Current     |
| DELETE | `/api/products/:id`   | Delete a product.                         | -                           | Current     |

## Consignments

| Method | Path                               | Description                               | Schema                         | Status      |
|--------|------------------------------------|-------------------------------------------|--------------------------------|-------------|
| GET    | `/api/consignments`                | Get a list of all consignments.           | -                              | Current     |
| GET    | `/api/consignments/:id`            | Get a specific consignment by its ID.     | -                              | Current     |
| POST   | `/api/consignments`                | Create a new consignment.                 | `insertConsignmentSchema`      | Current     |
| PUT    | `/api/consignments/:id`            | Update an existing consignment.           | `insertConsignmentSchema.partial()` | Current     |
| PATCH  | `/api/consignments/:id/status`     | Update the status of a consignment.       | `{ status: string }`           | Current     |
| DELETE | `/api/consignments/:id`            | Delete a consignment.                     | -                              | Current     |

## Stock Counts

| Method | Path                      | Description                               | Schema                       | Status      |
|--------|---------------------------|-------------------------------------------|------------------------------|-------------|
| GET    | `/api/stock-counts`       | Get a list of all stock counts.           | -                            | Current     |
| GET    | `/api/stock-counts/:id`   | Get a specific stock count by its ID.     | -                            | Current     |
| POST   | `/api/stock-counts`       | Create a new stock count.                 | `insertStockCountSchema`     | Current     |
| PUT    | `/api/stock-counts/:id`   | Update an existing stock count.           | `insertStockCountSchema.partial()` | Current     |
| DELETE | `/api/stock-counts/:id`   | Delete a stock count.                     | -                            | Current     |

## Dashboard

| Method | Path                     | Description                               | Schema | Status      |
|--------|--------------------------|-------------------------------------------|--------|-------------|
| GET    | `/api/dashboard/stats`   | Get statistics for the dashboard.         | -      | Current     |

## Inventory

| Method | Path                                     | Description                               | Schema | Status      |
|--------|------------------------------------------|-------------------------------------------|--------|-------------|
| GET    | `/api/clients/:clientId/inventory`       | Get the inventory for a specific client.  | -      | Current     |
| GET    | `/api/clients/:clientId/inventory/summary`| Get a summary of the client's inventory.| -      | Current     |
| GET    | `/api/reports/current-stock`             | Get a report of the current stock.        | -      | Current     |

## Client Stock (Real-time inventory)

| Method | Path                                         | Description                               | Schema | Status      |
|--------|----------------------------------------------|-------------------------------------------|--------|-------------|
| GET    | `/api/clients/:clientId/stock`               | Get the real-time stock for a client.     | -      | Current     |
| GET    | `/api/clients/:clientId/stock/:productId`    | Get the stock of a specific product.      | -      | Current     |
| PUT    | `/api/clients/:clientId/stock/:productId`    | Update the stock of a product.            | -      | Current     |
| POST   | `/api/clients/:clientId/stock/:productId/count`| Process a stock count for a product.      | -      | Current     |
| PUT    | `/api/clients/:clientId/stock/:productId/alert`| Set a minimum alert for a product.        | -      | Current     |
| GET    | `/api/clients/:clientId/stock-value`         | Get the total value of a client's stock.| -      | Current     |

## Stock Alerts

| Method | Path                               | Description                               | Schema | Status      |
|--------|------------------------------------|-------------------------------------------|--------|-------------|
| GET    | `/api/stock/alerts`                | Get all low stock alerts.                 | -      | Current     |
| GET    | `/api/clients/:clientId/stock/alerts`| Get low stock alerts for a client.        | -      | Current     |

## Reports

| Method | Path                             | Description                               | Schema | Status      |
|--------|----------------------------------|-------------------------------------------|--------|-------------|
| GET    | `/api/reports/sales-by-client`   | Get a report of sales by client.          | -      | **Old**     |
| GET    | `/api/reports/sales-by-product`  | Get a report of sales by product.         | -      | **Old**     |

## Users

| Method | Path                | Description                               | Schema                     | Status      |
|--------|---------------------|-------------------------------------------|----------------------------|-------------|
| GET    | `/api/users`        | Get a list of all users.                  | -                          | **Old**     |
| GET    | `/api/users/:id`    | Get a specific user by their ID.          | -                          | **Old**     |
| POST   | `/api/users`        | Create a new user.                        | `insertUserSchema`         | **Old**     |
| PUT    | `/api/users/:id`    | Update an existing user.                  | `insertUserSchema.partial()`| **Old**     |
| DELETE | `/api/users/:id`    | Delete a user.                            | -                          | **Old**     |
