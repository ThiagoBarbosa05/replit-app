import type { Express } from "express";
import { createServer, type Server } from "http";
import { ClientController } from "./controllers/client.controller";
import { ProductController } from "./controllers/product.controller";
import { ConsignmentController } from "./controllers/consignment.controller";
import { StockCountController } from "./controllers/stock-count.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { InventoryController } from "./controllers/inventory.controller";
import { ClientStockController } from "./controllers/client-stock.controller";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize controllers
  const clientController = new ClientController();
  const productController = new ProductController();
  const consignmentController = new ConsignmentController();
  const stockCountController = new StockCountController();
  const dashboardController = new DashboardController();
  const inventoryController = new InventoryController();
  const clientStockController = new ClientStockController();

  // Clients routes
  app.get("/api/clients", clientController.getClients);
  app.get("/api/clients/:id", clientController.getClient);
  app.post("/api/clients", clientController.createClient);
  app.put("/api/clients/:id", clientController.updateClient);
  app.delete("/api/clients/:id", clientController.deleteClient);

  // Products routes
  app.get("/api/products", productController.getProducts);
  app.get("/api/products/:id", productController.getProduct);
  app.post("/api/products", productController.createProduct);
  app.put("/api/products/:id", productController.updateProduct);
  app.delete("/api/products/:id", productController.deleteProduct);

  // Consignments routes
  app.get("/api/consignments", consignmentController.getConsignments);
  app.get("/api/consignments/:id", consignmentController.getConsignment);
  app.post("/api/consignments", consignmentController.createConsignment);
  app.put("/api/consignments/:id", consignmentController.updateConsignment);
  app.delete("/api/consignments/:id", consignmentController.deleteConsignment);

  // Stock Counts routes
  app.get("/api/stock-counts", stockCountController.getStockCounts);
  app.get("/api/stock-counts/:id", stockCountController.getStockCount);
  app.post("/api/stock-counts", stockCountController.createStockCount);
  app.put("/api/stock-counts/:id", stockCountController.updateStockCount);
  app.delete("/api/stock-counts/:id", stockCountController.deleteStockCount);

  // Dashboard routes
  app.get("/api/dashboard/stats", dashboardController.getDashboardStats);

  // Inventory routes
  app.get(
    "/api/clients/:clientId/inventory",
    inventoryController.getClientInventory
  );
  app.get(
    "/api/clients/:clientId/inventory/summary",
    inventoryController.getClientInventorySummary
  );
  app.get(
    "/api/reports/current-stock",
    inventoryController.getCurrentStockReport
  );

  // Client Stock routes (Real-time inventory)
  app.get("/api/clients/:clientId/stock", clientStockController.getClientStock);
  app.get(
    "/api/clients/:clientId/stock/:productId",
    clientStockController.getProductStock
  );
  app.put(
    "/api/clients/:clientId/stock/:productId",
    clientStockController.updateStock
  );
  app.post(
    "/api/clients/:clientId/stock/:productId/count",
    clientStockController.processStockCount
  );
  app.put(
    "/api/clients/:clientId/stock/:productId/alert",
    clientStockController.setMinimumAlert
  );
  app.get(
    "/api/clients/:clientId/stock-value",
    clientStockController.getTotalStockValue
  );

  // Low stock alerts
  app.get("/api/stock/alerts", clientStockController.getLowStockAlerts);
  app.get(
    "/api/clients/:clientId/stock/alerts",
    clientStockController.getLowStockAlerts
  );

  const httpServer = createServer(app);
  return httpServer;
}
