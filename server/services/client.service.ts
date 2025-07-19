import { ClientRepository } from "../repositories/client.repository";
import type { Client, InsertClient } from "@shared/schema";

export class ClientService {
  private clientRepository: ClientRepository;

  constructor() {
    this.clientRepository = new ClientRepository();
  }

  async getAllClients(searchTerm?: string, status?: string): Promise<Client[]> {
    return await this.clientRepository.findAll(searchTerm, status);
  }

  async getClientById(id: number): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new Error("Client not found");
    }
    return client;
  }

  async createClient(data: InsertClient): Promise<Client> {
    return await this.clientRepository.create(data);
  }

  async updateClient(id: number, data: Partial<InsertClient>): Promise<Client> {
    return await this.clientRepository.update(id, data);
  }

  async deleteClient(id: number): Promise<boolean> {
    return await this.clientRepository.delete(id);
  }

  async getActiveClientsCount(): Promise<number> {
    return await this.clientRepository.countActive();
  }
}