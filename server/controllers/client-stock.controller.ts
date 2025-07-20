import type { Request, Response } from "express";
import { ClientStockService } from "../services/client-stock.service";
import { z } from "zod";

const updateStockSchema = z.object({
  quantity: z.number().min(0, "Quantity must be non-negative"),
});

const processStockCountSchema = z.object({
  countedQuantity: z.number().min(0, "Counted quantity must be non-negative"),
});

const setMinimumAlertSchema = z.object({
  minimumAlert: z.number().min(0, "Minimum alert must be non-negative"),
});

export class ClientStockController {
  private clientStockService: ClientStockService;

  constructor() {
    this.clientStockService = new ClientStockService();
  }

  getClientStock = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.getClientStock called with clientId:", req.params.clientId);
      
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        res.status(400).json({ message: "Invalid client ID" });
        return;
      }

      const stock = await this.clientStockService.getClientStock(clientId);
      res.json(stock);
    } catch (error) {
      console.error("Error fetching client stock:", error);
      res.status(500).json({ message: "Failed to fetch client stock" });
    }
  };

  getProductStock = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.getProductStock called");
      
      const clientId = parseInt(req.params.clientId);
      const productId = parseInt(req.params.productId);
      
      if (isNaN(clientId) || isNaN(productId)) {
        res.status(400).json({ message: "Invalid client ID or product ID" });
        return;
      }

      const stock = await this.clientStockService.getProductStock(clientId, productId);
      res.json(stock || { quantity: 0 });
    } catch (error) {
      console.error("Error fetching product stock:", error);
      res.status(500).json({ message: "Failed to fetch product stock" });
    }
  };

  updateStock = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.updateStock called");
      
      const clientId = parseInt(req.params.clientId);
      const productId = parseInt(req.params.productId);
      
      if (isNaN(clientId) || isNaN(productId)) {
        res.status(400).json({ message: "Invalid client ID or product ID" });
        return;
      }

      const validationResult = updateStockSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ message: validationResult.error.errors[0].message });
        return;
      }

      const { quantity } = validationResult.data;
      await this.clientStockService.updateStock(clientId, productId, quantity);
      
      res.json({ message: "Stock updated successfully" });
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  };

  processStockCount = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.processStockCount called");
      
      const clientId = parseInt(req.params.clientId);
      const productId = parseInt(req.params.productId);
      
      if (isNaN(clientId) || isNaN(productId)) {
        res.status(400).json({ message: "Invalid client ID or product ID" });
        return;
      }

      const validationResult = processStockCountSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ message: validationResult.error.errors[0].message });
        return;
      }

      const { countedQuantity } = validationResult.data;
      const result = await this.clientStockService.processStockCount(clientId, productId, countedQuantity);
      
      res.json(result);
    } catch (error) {
      console.error("Error processing stock count:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process stock count" });
    }
  };

  getLowStockAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.getLowStockAlerts called");
      
      const clientId = req.params.clientId ? parseInt(req.params.clientId) : undefined;
      if (req.params.clientId && isNaN(clientId as number)) {
        res.status(400).json({ message: "Invalid client ID" });
        return;
      }

      const alerts = await this.clientStockService.getLowStockAlerts(clientId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
      res.status(500).json({ message: "Failed to fetch low stock alerts" });
    }
  };

  setMinimumAlert = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.setMinimumAlert called");
      
      const clientId = parseInt(req.params.clientId);
      const productId = parseInt(req.params.productId);
      
      if (isNaN(clientId) || isNaN(productId)) {
        res.status(400).json({ message: "Invalid client ID or product ID" });
        return;
      }

      const validationResult = setMinimumAlertSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ message: validationResult.error.errors[0].message });
        return;
      }

      const { minimumAlert } = validationResult.data;
      await this.clientStockService.setMinimumAlert(clientId, productId, minimumAlert);
      
      res.json({ message: "Minimum alert set successfully" });
    } catch (error) {
      console.error("Error setting minimum alert:", error);
      res.status(500).json({ message: "Failed to set minimum alert" });
    }
  };

  getTotalStockValue = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("ClientStockController.getTotalStockValue called");
      
      const clientId = parseInt(req.params.clientId);
      if (isNaN(clientId)) {
        res.status(400).json({ message: "Invalid client ID" });
        return;
      }

      const totalValue = await this.clientStockService.getTotalStockValue(clientId);
      res.json({ totalValue });
    } catch (error) {
      console.error("Error fetching total stock value:", error);
      res.status(500).json({ message: "Failed to fetch total stock value" });
    }
  };
}