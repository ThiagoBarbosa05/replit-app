import { Request, Response } from "express";
import { InventoryService } from "../services/inventory.service";

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  getClientInventory = async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const inventory = await this.inventoryService.getClientInventory(clientId);
      res.json(inventory);
    } catch (error) {
      console.error("Error fetching client inventory:", error);
      res.status(500).json({ message: "Failed to fetch client inventory" });
    }
  };

  getClientInventorySummary = async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }

      const summary = await this.inventoryService.getClientInventorySummary(clientId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching client inventory summary:", error);
      res.status(500).json({ message: "Failed to fetch client inventory summary" });
    }
  };

  getCurrentStockReport = async (req: Request, res: Response) => {
    try {
      const stockReport = await this.inventoryService.getCurrentStockReport();
      res.json(stockReport);
    } catch (error) {
      console.error("Error fetching current stock report:", error);
      res.status(500).json({ message: "Failed to fetch current stock report" });
    }
  };
}