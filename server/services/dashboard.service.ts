import { ClientService } from "./client.service";
import { ProductService } from "./product.service";
import { ConsignmentService } from "./consignment.service";
import { StockCountService } from "./stock-count.service";
import type { DashboardStats } from "@shared/schema";

export class DashboardService {
  private clientService: ClientService;
  private productService: ProductService;
  private consignmentService: ConsignmentService;
  private stockCountService: StockCountService;

  constructor() {
    this.clientService = new ClientService();
    this.productService = new ProductService();
    this.consignmentService = new ConsignmentService();
    this.stockCountService = new StockCountService();
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalConsigned, monthlySales, activeClients, totalProducts] = await Promise.all([
      this.consignmentService.getTotalConsignedValue(),
      this.stockCountService.getTotalSalesValue(),
      this.clientService.getActiveClientsCount(),
      this.productService.getTotalProductsCount(),
    ]);

    return {
      totalConsigned,
      monthlySales,
      activeClients,
      totalProducts,
    };
  }
}