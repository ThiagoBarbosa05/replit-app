import { Request, Response } from "express";
import { ConsignmentService } from "../services/consignment.service";
import { insertConsignmentSchema } from "@shared/schema";

export class ConsignmentController {
  private consignmentService: ConsignmentService;

  constructor() {
    this.consignmentService = new ConsignmentService();
  }

  getConsignments = async (req: Request, res: Response) => {
    try {
      const searchTerm = req.query.search as string;
      const status = req.query.status as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const clientId = req.query.clientId as string;
      
      console.log("ConsignmentController.getConsignments called with filters:", {
        searchTerm, status, startDate, endDate, clientId
      });
      
      const consignments = await this.consignmentService.getAllConsignments(
        searchTerm, 
        status, 
        startDate, 
        endDate,
        clientId ? parseInt(clientId) : undefined
      );
      
      console.log("Consignments fetched, count:", consignments.length);
      res.json(consignments);
    } catch (error) {
      console.error("Error fetching consignments:", error);
      res.status(500).json({ message: "Failed to fetch consignments" });
    }
  };

  getConsignment = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const consignment = await this.consignmentService.getConsignmentById(id);
      res.json(consignment);
    } catch (error) {
      console.error("Error fetching consignment:", error);
      if (error instanceof Error && error.message === "Consignment not found") {
        res.status(404).json({ message: "Consignment not found" });
      } else {
        res.status(500).json({ message: "Failed to fetch consignment" });
      }
    }
  };

  createConsignment = async (req: Request, res: Response) => {
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

      const consignment = await this.consignmentService.createConsignment(req.body);
      res.status(201).json(consignment);
    } catch (error) {
      console.error("Error creating consignment:", error);
      res.status(400).json({ message: "Failed to create consignment", error });
    }
  };

  updateConsignment = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const consignmentData = insertConsignmentSchema.partial().parse(req.body);
      const consignment = await this.consignmentService.updateConsignment(id, consignmentData);
      res.json(consignment);
    } catch (error) {
      console.error("Error updating consignment:", error);
      if (error instanceof Error && error.message === "Consignment not found") {
        res.status(404).json({ message: "Consignment not found" });
      } else {
        res.status(400).json({ message: "Failed to update consignment", error });
      }
    }
  };

  updateConsignmentStatus = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const consignment = await this.consignmentService.updateConsignment(id, { status });
      res.json(consignment);
    } catch (error) {
      console.error("Error updating consignment status:", error);
      if (error instanceof Error && error.message === "Consignment not found") {
        res.status(404).json({ message: "Consignment not found" });
      } else {
        res.status(400).json({ message: "Failed to update consignment status", error });
      }
    }
  };

  deleteConsignment = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await this.consignmentService.deleteConsignment(id);
      if (!deleted) {
        return res.status(404).json({ message: "Consignment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consignment:", error);
      res.status(500).json({ message: "Failed to delete consignment" });
    }
  };
}