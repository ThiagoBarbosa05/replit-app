import { ConsignmentRepository } from "../repositories/consignment.repository";
import { StockCountService } from "./stock-count.service";
import { ClientStockService } from "./client-stock.service";
import type { 
  ConsignmentWithDetails, 
  InsertConsignment, 
  InsertConsignmentItem 
} from "@shared/schema";

export class ConsignmentService {
  private consignmentRepository: ConsignmentRepository;
  private stockCountService: StockCountService;
  private clientStockService: ClientStockService;

  constructor() {
    this.consignmentRepository = new ConsignmentRepository();
    this.stockCountService = new StockCountService();
    this.clientStockService = new ClientStockService();
  }

  async getAllConsignments(
    searchTerm?: string, 
    status?: string, 
    startDate?: string, 
    endDate?: string,
    clientId?: number
  ): Promise<ConsignmentWithDetails[]> {
    return await this.consignmentRepository.findAll(searchTerm, status, startDate, endDate, clientId);
  }

  async getConsignmentById(id: number): Promise<ConsignmentWithDetails> {
    const consignment = await this.consignmentRepository.findById(id);
    if (!consignment) {
      throw new Error("Consignment not found");
    }
    return consignment;
  }

  async createConsignment(
    data: InsertConsignment & { items: InsertConsignmentItem[] }
  ): Promise<ConsignmentWithDetails> {
    return await this.consignmentRepository.create(data);
  }

  async updateConsignment(
    id: number, 
    data: Partial<InsertConsignment>
  ): Promise<ConsignmentWithDetails> {
    // Get current consignment to check status change
    const currentConsignment = await this.getConsignmentById(id);

    // Update consignment
    await this.consignmentRepository.update(id, data);

    // If status changed to "delivered", create stock counts and update client stock
    if (data.status === "delivered" && currentConsignment.status !== "delivered") {
      await this.createStockCountsForDeliveredConsignment(id);
      
      // Update client stock with delivered items
      const items = currentConsignment.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      await this.clientStockService.processConsignmentDelivery(currentConsignment.clientId, items);
    }

    // Return updated consignment
    return await this.getConsignmentById(id);
  }

  async deleteConsignment(id: number): Promise<boolean> {
    return await this.consignmentRepository.delete(id);
  }

  async getTotalConsignedValue(): Promise<string> {
    return await this.consignmentRepository.getTotalConsignedValue();
  }

  private async createStockCountsForDeliveredConsignment(consignmentId: number): Promise<void> {
    const consignment = await this.getConsignmentById(consignmentId);
    
    const stockCountsToCreate = [];

    for (const item of consignment.items) {
      // Check if stock count already exists for this consignment item
      const existingStockCounts = await this.stockCountService.getStockCountsByConsignmentAndProduct(
        consignment.clientId,
        item.productId,
        consignmentId
      );

      // Only create if doesn't exist
      if (existingStockCounts.length === 0) {
        stockCountsToCreate.push({
          clientId: consignment.clientId,
          productId: item.productId,
          consignmentId: consignmentId,
          quantitySent: item.quantity,
          quantityRemaining: item.quantity, // Initially set all as remaining (not sold yet)
          unitPrice: item.unitPrice,
          quantitySold: 0,
          totalSold: "0.00",
          date: new Date().toISOString(),
        });
      }
    }

    if (stockCountsToCreate.length > 0) {
      await this.stockCountService.bulkCreateStockCounts(stockCountsToCreate);
    }
  }
}