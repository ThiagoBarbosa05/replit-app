import { StockCountRepository } from "../repositories/stock-count.repository";
import type { StockCount, InsertStockCount } from "@shared/schema";

export class StockCountService {
  private stockCountRepository: StockCountRepository;

  constructor() {
    this.stockCountRepository = new StockCountRepository();
  }

  async getAllStockCounts(clientId?: number): Promise<StockCount[]> {
    return await this.stockCountRepository.findAll(clientId);
  }

  async getStockCountById(id: number): Promise<StockCount> {
    const stockCount = await this.stockCountRepository.findById(id);
    if (!stockCount) {
      throw new Error("Stock count not found");
    }
    return stockCount;
  }

  async createStockCount(data: InsertStockCount): Promise<StockCount> {
    return await this.stockCountRepository.create(data);
  }

  async updateStockCount(id: number, data: Partial<InsertStockCount>): Promise<StockCount> {
    return await this.stockCountRepository.update(id, data);
  }

  async deleteStockCount(id: number): Promise<boolean> {
    return await this.stockCountRepository.delete(id);
  }

  async getStockCountsByConsignmentAndProduct(
    clientId: number, 
    productId: number, 
    consignmentId: number
  ): Promise<StockCount[]> {
    return await this.stockCountRepository.findByConsignmentAndProduct(
      clientId, 
      productId, 
      consignmentId
    );
  }

  async getTotalSalesValue(): Promise<string> {
    return await this.stockCountRepository.getTotalSalesValue();
  }

  async bulkCreateStockCounts(
    stockCounts: (InsertStockCount & { quantitySold: number; totalSold: string })[]
  ): Promise<void> {
    return await this.stockCountRepository.bulkCreate(stockCounts);
  }
}