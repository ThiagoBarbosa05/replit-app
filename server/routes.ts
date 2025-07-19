import type { Express } from "express";
import { createServer, type Server } from "http";
import { ClientController } from "./controllers/client.controller";
import { ProductController } from "./controllers/product.controller";
import { ConsignmentController } from "./controllers/consignment.controller";
import { StockCountController } from "./controllers/stock-count.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize controllers
  const clientController = new ClientController();
  const productController = new ProductController();
  const consignmentController = new ConsignmentController();
  const stockCountController = new StockCountController();
  const dashboardController = new DashboardController();

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
  app.patch("/api/consignments/:id/status", consignmentController.updateConsignmentStatus);
  app.delete("/api/consignments/:id", consignmentController.deleteConsignment);

  // Stock Counts routes
  app.get("/api/stock-counts", stockCountController.getStockCounts);
  app.get("/api/stock-counts/:id", stockCountController.getStockCount);
  app.post("/api/stock-counts", stockCountController.createStockCount);
  app.put("/api/stock-counts/:id", stockCountController.updateStockCount);
  app.delete("/api/stock-counts/:id", stockCountController.deleteStockCount);

  // Dashboard routes
  app.get("/api/dashboard/stats", dashboardController.getDashboardStats);

  // Legacy inventory endpoints (keeping for backward compatibility)
  app.get("/api/inventory/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const inventory = await storage.getClientInventory(clientId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching client inventory:", error);
      res.status(500).json({ message: "Failed to fetch client inventory" });
    }
  });

  app.get("/api/reports/current-stock", async (req, res) => {
    try {
      const inventory = await storage.getCurrentStockReport();
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching current stock report:", error);
      res.status(500).json({ message: "Failed to fetch current stock report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}