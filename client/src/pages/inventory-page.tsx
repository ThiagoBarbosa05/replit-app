import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle } from "lucide-react";
import StockCountDialog from "@/components/dialogs/stock-count-dialog";
import type { StockCount, Client } from "@shared/schema";

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [stockCountDialogOpen, setStockCountDialogOpen] = useState(false);
  const [selectedClientForInventory, setSelectedClientForInventory] = useState<number | null>(null);

  const { data: stockCounts = [], isLoading: stockCountsLoading } = useQuery<StockCount[]>({
    queryKey: ["/api/stock-counts"]
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"]
  });

  const { data: clientInventory = [] } = useQuery({
    queryKey: ["/api/inventory", selectedClientForInventory],
    enabled: !!selectedClientForInventory
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/stock-counts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventário</h1>
          <p className="text-gray-600">Realizar contagem e calcular vendas baseadas no estoque</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={refreshData}>
            Atualizar Dados
          </Button>
          <Button onClick={() => setStockCountDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Contagem
          </Button>
        </div>
      </div>

      {/* Client Selection for Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Inventário por Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select 
              value={selectedClientForInventory?.toString() || ""} 
              onValueChange={(value) => setSelectedClientForInventory(value ? parseInt(value) : null)}
            >
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Selecione um cliente para ver o inventário" />
              </SelectTrigger>
              <SelectContent>
                {clients.filter(client => client.isActive).map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedClientForInventory && (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Produto</TableHead>
                      <TableHead className="min-w-[100px]">Enviado</TableHead>
                      <TableHead className="min-w-[100px]">Restante</TableHead>
                      <TableHead className="min-w-[100px]">Vendido</TableHead>
                      <TableHead className="min-w-[120px]">Valor Unit.</TableHead>
                      <TableHead className="min-w-[120px]">Total Vendido</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientInventory.length > 0 ? (
                      clientInventory.map((item: any, index: number) => {
                        const quantityDifference = item.quantitySent - item.quantityRemaining;
                        const hasDiscrepancy = quantityDifference !== item.quantitySold;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.product?.name}</p>
                                <p className="text-sm text-gray-600">{item.product?.type} • {item.product?.country}</p>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{item.quantitySent}</TableCell>
                            <TableCell className="font-medium">{item.quantityRemaining}</TableCell>
                            <TableCell className="font-medium text-green-600">{item.quantitySold}</TableCell>
                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              {formatCurrency(item.totalSold)}
                            </TableCell>
                            <TableCell>
                              {hasDiscrepancy ? (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Divergência
                                </Badge>
                              ) : (
                                <Badge variant="default">OK</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Nenhum item no inventário deste cliente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stock Counts History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Contagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px]">Data</TableHead>
                  <TableHead className="min-w-[150px]">Cliente</TableHead>
                  <TableHead className="min-w-[150px]">Produto</TableHead>
                  <TableHead className="min-w-[100px]">Enviado</TableHead>
                  <TableHead className="min-w-[100px]">Restante</TableHead>
                  <TableHead className="min-w-[100px]">Vendido</TableHead>
                  <TableHead className="min-w-[120px]">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockCounts.length > 0 ? (
                  stockCounts.map((count) => (
                    <TableRow key={count.id}>
                      <TableCell>{formatDate(count.countDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>{count.clientId}</span>
                        </div>
                      </TableCell>
                      <TableCell>Produto #{count.productId}</TableCell>
                      <TableCell className="font-medium">{count.quantitySent}</TableCell>
                      <TableCell className="font-medium">{count.quantityRemaining}</TableCell>
                      <TableCell className="font-medium text-green-600">{count.quantitySold}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(count.totalSold)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhuma contagem de estoque registrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StockCountDialog 
        open={stockCountDialogOpen} 
        onOpenChange={setStockCountDialogOpen}
        onClose={() => setStockCountDialogOpen(false)}
      />
    </div>
  );
}