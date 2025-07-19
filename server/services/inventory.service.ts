import { InventoryRepository, type ClientInventoryItem, type CurrentStockItem } from "../repositories/inventory.repository";

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async getClientInventory(clientId: number): Promise<ClientInventoryItem[]> {
    return await this.inventoryRepository.getClientInventory(clientId);
  }

  async getCurrentStockReport(): Promise<CurrentStockItem[]> {
    return await this.inventoryRepository.getCurrentStockReport();
  }

  async getClientInventorySummary(clientId: number): Promise<{
    totalProducts: number;
    totalSent: number;
    totalRemaining: number;
    totalSold: number;
    totalSalesValue: string;
  }> {
    const inventory = await this.getClientInventory(clientId);
    
    return {
      totalProducts: inventory.length,
      totalSent: inventory.reduce((sum, item) => sum + item.totalSent, 0),
      totalRemaining: inventory.reduce((sum, item) => sum + item.totalRemaining, 0),
      totalSold: inventory.reduce((sum, item) => sum + item.totalSold, 0),
      totalSalesValue: inventory.reduce(
        (sum, item) => sum + parseFloat(item.totalSalesValue), 
        0
      ).toFixed(2),
    };
  }
}