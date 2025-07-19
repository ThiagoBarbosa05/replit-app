import { Request, Response } from "express";
import { StockCountService } from "../services/stock-count.service";
import { insertStockCountSchema } from "@shared/schema";

export class StockCountController {
  private stockCountService: StockCountService;

  constructor() {
    this.stockCountService = new StockCountService();
  }

  getStockCounts = async (req: Request, res: Response) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const stockCounts = await this.stockCountService.getAllStockCounts(clientId);
      res.json(stockCounts);
    } catch (error) {
      console.error("Error fetching stock counts:", error);
      res.status(500).json({ message: "Failed to fetch stock counts" });
    }
  };

  getStockCount = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const stockCount = await this.stockCountService.getStockCountById(id);
      res.json(stockCount);
    } catch (error) {
      console.error("Error fetching stock count:", error);
      if (error instanceof Error && error.message === "Stock count not found") {
        res.status(404).json({ message: "Stock count not found" });
      } else {
        res.status(500).json({ message: "Failed to fetch stock count" });
      }
    }
  };

  createStockCount = async (req: Request, res: Response) => {
    try {
      const stockCountData = insertStockCountSchema.parse(req.body);
      const stockCount = await this.stockCountService.createStockCount(stockCountData);
      res.status(201).json(stockCount);
    } catch (error) {
      console.error("Error creating stock count:", error);
      res.status(400).json({ message: "Invalid stock count data", error });
    }
  };

  updateStockCount = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const stockCountData = insertStockCountSchema.partial().parse(req.body);
      const stockCount = await this.stockCountService.updateStockCount(id, stockCountData);
      res.json(stockCount);
    } catch (error) {
      console.error("Error updating stock count:", error);
      if (error instanceof Error && error.message === "Stock count not found") {
        res.status(404).json({ message: "Stock count not found" });
      } else {
        res.status(400).json({ message: "Failed to update stock count", error });
      }
    }
  };

  deleteStockCount = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.stockCountService.deleteStockCount(id);
      if (!deleted) {
        return res.status(404).json({ message: "Stock count not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting stock count:", error);
      res.status(500).json({ message: "Failed to delete stock count" });
    }
  };
}