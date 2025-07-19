import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertProductSchema, insertConsignmentSchema, insertStockCountSchema, insertUserSchema, createProductSchema } from "@shared/schema";
import { createClientSchema } from "@shared/schemas";

export async function registerRoutes(app: Express): Promise<Server> {
  // Clients
  app.get("/api/clients", async (req, res) => {
    try {
      const searchTerm = req.query.search as string;
      const statusFilter = req.query.status as string;
      const clients = await storage.getClients(searchTerm, statusFilter);
      res.json(clients);
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      // const clientData = insertClientSchema.parse(req.body);
      const clientData = createClientSchema.parse(req.body)
      const existingClient = await storage.getClientByCnpj(clientData.cnpj);

      if (existingClient) {
        return res
          .status(400)
          .send(`Cliente com o CNPJ ${clientData.cnpj} já existe`);
      }
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: "Invalid client data", error });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to update client", error });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  app.patch("/api/clients/:id/deactivate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.deactivateClient(id);
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to deactivate client", error });
    }
  });

  app.patch("/api/clients/:id/activate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.activateClient(id);
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to activate client", error });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const searchName = req.query.name as string | undefined;
      const typeFilter = req.query.type as string | undefined;
      const countryFilter = req.query.country as string | undefined;

      const products = await storage.getProducts(
        searchName,
        typeFilter,
        countryFilter
      );

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = createProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product", error });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Consignments
  app.get("/api/consignments", async (req, res) => {
    try {
      const clientId = req.query.clientId as string;
      const searchTerm = req.query.search as string;
      const statusFilter = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const consignments = await storage.getConsignments(
        clientId ? parseInt(clientId) : undefined,
        searchTerm,
        statusFilter,
        startDate,
        endDate
      );
      res.json(consignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consignments" });
    }
  });

  app.get("/api/consignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consignment = await storage.getConsignment(id);
      if (!consignment) {
        return res.status(404).json({ message: "Consignment not found" });
      }
      res.json(consignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consignment" });
    }
  });

  app.post("/api/consignments", async (req, res) => {
    try {
      // Validate request body
      const { clientId, items } = req.body;
      
      if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
          message: "Invalid consignment data: clientId and items are required" 
        });
      }

      // Validate each item
      for (const item of items) {
        if (!item.productId || !item.quantity || item.quantity <= 0 || !item.unitPrice) {
          return res.status(400).json({ 
            message: "Invalid item data: productId, quantity and unitPrice are required" 
          });
        }
      }

      const consignment = await storage.createConsignment(req.body);
      res.status(201).json(consignment);
    } catch (error) {
      console.error("Error creating consignment:", error);
      res.status(400).json({ message: "Failed to create consignment", error });
    }
  });

  app.put("/api/consignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consignmentData = insertConsignmentSchema.partial().parse(req.body);
      const consignment = await storage.updateConsignment(id, consignmentData);
      res.json(consignment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update consignment", error });
    }
  });

  app.delete("/api/consignments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteConsignment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Consignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete consignment" });
    }
  });

  // Stock Counts
  app.get("/api/stock-counts", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const stockCounts = await storage.getStockCounts(clientId);
      res.json(stockCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock counts" });
    }
  });

  app.post("/api/stock-counts", async (req, res) => {
    try {
      const stockCountData = insertStockCountSchema.parse(req.body);
      const stockCount = await storage.createStockCount(stockCountData);
      res.status(201).json(stockCount);
    } catch (error) {
      res.status(400).json({ message: "Invalid stock count data", error });
    }
  });

  app.put("/api/stock-counts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const stockCountData = insertStockCountSchema.partial().parse(req.body);
      const stockCount = await storage.updateStockCount(id, stockCountData);
      res.json(stockCount);
    } catch (error) {
      res.status(400).json({ message: "Failed to update stock count", error });
    }
  });

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Reports
  app.get("/api/reports/sales-by-client", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getSalesByClient(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate sales by client report" });
    }
  });

  app.get("/api/reports/sales-by-product", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const report = await storage.getSalesByProduct(startDate, endDate);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate sales by product report" });
    }
  });

  app.get("/api/reports/current-stock", async (req, res) => {
    try {
      const report = await storage.getCurrentStock();
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate current stock report" });
    }
  });

  // Inventory Management
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

  // Alternative endpoint for client inventory (REST pattern)
  app.get("/api/clients/:id/inventory", async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const inventory = await storage.getClientInventory(clientId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching client inventory:", error);
      res.status(500).json({ message: "Failed to fetch client inventory" });
    }
  });

  app.get("/api/inventory/:clientId/:productId/difference", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const productId = parseInt(req.params.productId);
      const difference = await storage.calculateStockDifference(clientId, productId);
      res.json(difference);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate stock difference" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user", error });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
