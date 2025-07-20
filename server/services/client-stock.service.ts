import { ClientStockRepository } from "../repositories/client-stock.repository";
import { type ClientStock } from "@shared/schema";

export class ClientStockService {
  private clientStockRepository: ClientStockRepository;

  constructor() {
    this.clientStockRepository = new ClientStockRepository();
  }

  async getClientStock(clientId: number): Promise<(ClientStock & { product: any; client: any })[]> {
    console.log(`Fetching stock for client: ${clientId}`);
    const stock = await this.clientStockRepository.getClientStock(clientId);
    console.log(`Stock fetched, count: ${stock.length}`);
    return stock;
  }

  async getProductStock(clientId: number, productId: number): Promise<ClientStock | undefined> {
    return await this.clientStockRepository.getProductStock(clientId, productId);
  }

  async updateStock(clientId: number, productId: number, quantity: number): Promise<void> {
    console.log(`Updating stock for client ${clientId}, product ${productId}, quantity: ${quantity}`);
    await this.clientStockRepository.updateStock(clientId, productId, quantity);
  }

  async addStock(clientId: number, productId: number, quantityToAdd: number): Promise<void> {
    console.log(`Adding ${quantityToAdd} to stock for client ${clientId}, product ${productId}`);
    await this.clientStockRepository.addStock(clientId, productId, quantityToAdd);
  }

  async subtractStock(clientId: number, productId: number, quantityToSubtract: number): Promise<void> {
    console.log(`Subtracting ${quantityToSubtract} from stock for client ${clientId}, product ${productId}`);
    await this.clientStockRepository.subtractStock(clientId, productId, quantityToSubtract);
  }

  async processConsignmentDelivery(clientId: number, items: { productId: number; quantity: number }[]): Promise<void> {
    console.log(`Processing consignment delivery for client ${clientId}, items: ${items.length}`);
    
    for (const item of items) {
      await this.addStock(clientId, item.productId, item.quantity);
    }
  }

  async processStockCount(clientId: number, productId: number, countedQuantity: number): Promise<{
    quantitySold: number;
    salesValue: string;
    remainingStock: number;
  }> {
    console.log(`Processing stock count for client ${clientId}, product ${productId}, counted: ${countedQuantity}`);
    
    const currentStock = await this.getProductStock(clientId, productId);
    
    if (!currentStock) {
      throw new Error(`No stock record found for client ${clientId}, product ${productId}`);
    }

    const quantitySold = Math.max(0, currentStock.quantity - countedQuantity);
    await this.updateStock(clientId, productId, countedQuantity);

    // Calculate sales value (we'll need product price)
    const stockWithProduct = await this.clientStockRepository.getClientStock(clientId);
    const productStock = stockWithProduct.find(s => s.productId === productId);
    const unitPrice = productStock?.product?.unitPrice || "0";
    const salesValue = (quantitySold * parseFloat(unitPrice)).toFixed(2);

    return {
      quantitySold,
      salesValue,
      remainingStock: countedQuantity
    };
  }

  async getLowStockAlerts(clientId?: number): Promise<(ClientStock & { product: any; client: any })[]> {
    console.log(`Fetching low stock alerts${clientId ? ` for client ${clientId}` : ' for all clients'}`);
    return await this.clientStockRepository.getLowStockAlerts(clientId);
  }

  async setMinimumAlert(clientId: number, productId: number, minimumAlert: number): Promise<void> {
    console.log(`Setting minimum alert for client ${clientId}, product ${productId}, alert: ${minimumAlert}`);
    await this.clientStockRepository.setMinimumAlert(clientId, productId, minimumAlert);
  }

  async getTotalStockValue(clientId: number): Promise<string> {
    return await this.clientStockRepository.getTotalStockValue(clientId);
  }
}